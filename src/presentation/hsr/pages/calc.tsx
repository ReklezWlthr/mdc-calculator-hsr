import { findCharacter } from '@src/core/utils/finder'
import { useStore } from '@src/data/providers/app_store_provider'
import { Stats } from '@src/domain/constant'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { ScalingSubRows } from '../components/tables/scaling_sub_rows'
import { ScalingWrapper } from '../components/tables/scaling_wrapper'
import { StatBlock } from '../components/stat_block'
import { CharacterSelect } from '../components/character_select'
import { ConsCircle } from '../components/cons_circle'
import { ConditionalBlock } from '../components/conditional_block'
import classNames from 'classnames'
import { Tooltip } from '@src/presentation/components/tooltip'
import { AscensionIcons } from '../components/ascension_icons'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { EnemyModal } from '../components/enemy_modal'
import { WeaponConditionalBlock } from '../components/weapon_conditional_block'
import { useCalculator } from '@src/core/hooks/useCalculator'
import { CustomConditionalBlock } from '../components/custom_conditional_block'
import { formatIdIcon } from '@src/core/utils/data_format'

export const Calculator = observer(({}: {}) => {
  const { teamStore, modalStore, calculatorStore, settingStore } = useStore()
  const { selected, computedStats } = calculatorStore

  const [tab, setTab] = useState('mod')

  const char = teamStore.characters[selected]
  const charData = findCharacter(char.cId)

  const { main, mainComputed, contents } = useCalculator()

  const onOpenEnemyModal = useCallback(() => modalStore.openModal(<EnemyModal />), [])

  return (
    <div className="w-full overflow-y-auto">
      <div className="grid w-full grid-cols-3 gap-5 p-5 text-white max-w-[1240px] mx-auto">
        <div className="col-span-2">
          <div className="flex items-center">
            <div className="flex justify-center w-full gap-4 pt-1 pb-3">
              {_.map(teamStore?.characters, (item, index) => {
                return (
                  <CharacterSelect
                    key={`char_select_${index}`}
                    onClick={() => calculatorStore.setValue('selected', index)}
                    isSelected={index === selected}
                    id={formatIdIcon(item.cId, settingStore.settings?.travelerGender)}
                  />
                )
              })}
            </div>
            <PrimaryButton onClick={onOpenEnemyModal} title="Enemy Setting" style="whitespace-nowrap" />
          </div>
          {teamStore?.characters[selected]?.cId ? (
            <>
              <div className="flex flex-col mb-5 text-sm rounded-lg bg-primary-darker h-fit">
                <p className="px-2 py-1 text-lg font-bold text-center rounded-t-lg bg-primary-light">
                  Damage Calculation
                </p>
                <div className="flex justify-end w-full mb-1.5 bg-primary-dark">
                  <div className="grid w-4/5 grid-cols-9 gap-2 py-0.5 pr-2 text-sm font-bold text-center bg-primary-dark">
                    <p className="col-span-2">Property</p>
                    <p className="col-span-1">Element</p>
                    <p className="col-span-1">Base</p>
                    <p className="col-span-1">CRIT</p>
                    <p className="col-span-1">Average</p>
                    <p className="col-span-1">Prob.</p>
                    <p className="col-span-2">DMG Component</p>
                  </div>
                </div>
                <ScalingWrapper
                  talent={mainComputed?.BA_ALT ? main?.talents?.normal_alt : main?.talents?.normal}
                  icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData.id}_Normal${
                    mainComputed?.BA_ALT ? '02' : ''
                  }.png`}
                  element={charData.element}
                  level={char.talents?.basic}
                  upgraded={main?.upgrade?.basic}
                >
                  {_.map(mainComputed?.BASIC_SCALING, (item) => (
                    <ScalingSubRows key={item.name} scaling={item} />
                  ))}
                </ScalingWrapper>
                <div className="w-full my-2 border-t-2 border-primary-border" />
                <ScalingWrapper
                  talent={main?.talents?.skill}
                  icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData.id}_BP.png`}
                  element={charData.element}
                  level={char.talents?.skill}
                  upgraded={main?.upgrade?.skill}
                >
                  {_.map(mainComputed?.SKILL_SCALING, (item) => (
                    <ScalingSubRows key={item.name} scaling={item} />
                  ))}
                </ScalingWrapper>
                <div className="w-full my-2 border-t-2 border-primary-border" />
                <ScalingWrapper
                  talent={mainComputed?.ULT_ALT ? main?.talents?.ult_alt : main?.talents?.ult}
                  icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData.id}_Ultra${
                    mainComputed?.ULT_ALT ? '02' : ''
                  }.png`}
                  element={charData.element}
                  level={char.talents?.ult}
                  upgraded={main?.upgrade?.ult}
                >
                  {_.map(mainComputed?.ULT_SCALING, (item) => (
                    <ScalingSubRows key={item.name} scaling={item} />
                  ))}
                </ScalingWrapper>
                <div className="w-full my-2 border-t-2 border-primary-border" />
                <ScalingWrapper
                  talent={main?.talents?.talent}
                  icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData.id}_Passive.png`}
                  element={charData.element}
                  level={char.talents?.talent}
                  upgraded={main?.upgrade?.talent}
                >
                  {_.map(mainComputed?.TALENT_SCALING, (item) => (
                    <ScalingSubRows key={item.name} scaling={item} />
                  ))}
                </ScalingWrapper>
                <div className="w-full my-2 border-t-2 border-primary-border" />
                <ScalingWrapper
                  talent={main?.talents?.technique}
                  icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData.id}_Maze.png`}
                  element={charData.element}
                  level={1}
                  upgraded={0}
                >
                  {_.map(mainComputed?.TECHNIQUE_SCALING, (item) => (
                    <ScalingSubRows key={item.name} scaling={item} />
                  ))}
                </ScalingWrapper>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full text-xl rounded-lg h-[66vh] bg-primary-darker">
              No Character Selected
            </div>
          )}
        </div>
        <div className="flex flex-col items-center w-full gap-3">
          <div className="flex gap-5">
            <div
              className={classNames('rounded-lg px-2 py-1 text-white cursor-pointer duration-200', {
                'bg-primary': tab === 'mod',
              })}
              onClick={() => setTab('mod')}
            >
              Modifiers
            </div>
            <div
              className={classNames('rounded-lg px-2 py-1 text-white cursor-pointer duration-200', {
                'bg-primary': tab === 'stats',
              })}
              onClick={() => setTab('stats')}
            >
              Stats
            </div>
          </div>
          {tab === 'mod' && (
            <>
              <ConditionalBlock title="Self Conditionals" contents={_.filter(contents.main, 'show')} />
              <ConditionalBlock title="Team Conditionals" contents={_.filter(contents.team, 'show')} />
              <WeaponConditionalBlock contents={contents.weapon(selected)} index={selected} />
              <CustomConditionalBlock index={selected} />
            </>
          )}
          {charData && tab === 'stats' && (
            <>
              <StatBlock index={selected} stat={computedStats[selected]} />
              {/* <div className="w-[252px]">
                <AscensionIcons
                  talents={main?.talents}
                  element={charData.element}
                  stats={computedStats[selected]}
                  ascension={char.ascension}
                />
              </div> */}
              <ConsCircle
                talents={main?.talents}
                element={charData.element}
                id={char.cId}
                cons={char.cons}
                stats={computedStats[selected]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
})
