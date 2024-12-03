import { findCharacter } from '@src/core/utils/finder'
import { useStore } from '@src/data/providers/app_store_provider'
import { BaseAggro, PathType, Stats, TalentType } from '@src/domain/constant'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ScalingSubRows } from '../components/tables/scaling_sub_rows'
import { ScalingWrapper } from '../components/tables/scaling_wrapper'
import { StatBlock } from '../components/stat_block'
import { CharacterSelect } from '../components/character_select'
import { ConsCircle } from '../components/cons_circle'
import { ConditionalBlock } from '@src/presentation/hsr/components/conditionals/conditional_block'
import classNames from 'classnames'
import { Tooltip } from '@src/presentation/components/tooltip'
import { AscensionIcons } from '../components/ascension_icons'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { EnemyModal } from '@src/presentation/hsr/components/modals/enemy_modal'
import { WeaponConditionalBlock } from '@src/presentation/hsr/components/conditionals/weapon_conditional_block'
import { useCalculator } from '@src/core/hooks/useCalculator'
import { CustomConditionalBlock } from '@src/presentation/hsr/components/conditionals/custom_conditional_block'
import { formatIdIcon } from '@src/core/utils/data_format'
import { StatsModal } from '@src/presentation/hsr/components/modals/stats_modal'
import { SuperBreakSubRows } from '../components/tables/super_break_sub_rows'
import { DebuffModal } from '@src/presentation/hsr/components/modals/debuff_modal'
import { BreakBlock } from '../components/break_block'
import { LCBlock } from '../components/lc_block'
import { MiniRelicBlock } from '../components/mini_relic_block'
import { BulletPoint } from '@src/presentation/components/collapsible'
import { SubTotalRow } from '../components/tables/sub_total_row'
import { StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { SummonStatBlock } from '../components/summon_stat_block'

export const Calculator = observer(({}: {}) => {
  const { teamStore, modalStore, calculatorStore, settingStore } = useStore()
  const { selected, computedStats, team, tab } = calculatorStore

  const char = team[selected]
  const charData = findCharacter(char.cId)

  const { main, mainComputed, contents, finalStats } = useCalculator({ teamOverride: team })

  const onOpenEnemyModal = useCallback(() => modalStore.openModal(<EnemyModal stats={mainComputed} />), [mainComputed])
  const onOpenDebuffModal = useCallback(() => modalStore.openModal(<DebuffModal />), [])
  const onOpenStatsModal = useCallback(
    () =>
      modalStore.openModal(
        <StatsModal
          stats={mainComputed}
          path={charData.path}
          sumAggro={_.sumBy(
            finalStats,
            (item) =>
              BaseAggro[item.PATH] *
                (1 + (item.getValue(StatsObjectKeys.BASE_AGGRO) || 0)) *
                (1 + (item.getValue(StatsObjectKeys.AGGRO) || 0)) || 0
          )}
        />
      ),
    [mainComputed, charData, finalStats]
  )

  useEffect(() => {
    if (tab === 'summon' && charData.path !== PathType.REMEMBRANCE) {
      calculatorStore.setValue('tab', 'mod')
    }
  }, [selected])

  return (
    <div className="w-full customScrollbar">
      <div className="grid w-full grid-cols-3 gap-5 p-5 text-white max-w-[1200px] mx-auto">
        <div className="col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex justify-center w-full gap-4 pt-1 pb-3 pl-3">
              {_.map(team, (item, index) => {
                return (
                  <CharacterSelect
                    key={`char_select_${index}`}
                    onClick={() => calculatorStore.setValue('selected', index)}
                    isSelected={index === selected}
                    id={item.cId}
                  />
                )
              })}
            </div>
            <PrimaryButton onClick={onOpenEnemyModal} title="Enemy Setting" style="whitespace-nowrap" />
            <PrimaryButton onClick={onOpenDebuffModal} title="Debuffs" style="whitespace-nowrap" />
          </div>
          {teamStore?.characters[selected]?.cId ? (
            <>
              <div className="flex flex-col mb-5 text-sm rounded-lg bg-primary-darker h-fit">
                <div className="px-2 py-1 text-lg font-bold text-center rounded-t-lg bg-primary-light">
                  <p>Damage Calculation{mainComputed?.NAME ? ` - ${mainComputed?.NAME}` : ''}</p>
                  {/* <p className='text-xs font-normal text-gray'>Hover Numbers for More Details</p> */}
                </div>
                <div className="flex justify-end w-full mb-1.5 bg-primary-dark">
                  <div className="grid w-4/5 grid-cols-9 gap-2 py-0.5 pr-2 text-sm font-bold text-center bg-primary-dark">
                    <p className="col-span-2">Property</p>
                    <p className="col-span-1">Type</p>
                    <p className="col-span-1">Base</p>
                    <p className="col-span-1">CRIT</p>
                    <p className="col-span-1">Average</p>
                    <p className="col-span-1">Chance</p>
                    <p className="col-span-2">DMG Component</p>
                  </div>
                </div>
                <ScalingWrapper
                  talent={
                    mainComputed?.BA_ALT
                      ? main?.talents?.[`normal_alt${calculatorStore.form[selected]?.dhil_sp}`] ||
                        main?.talents?.normal_alt
                      : main?.talents?.normal
                  }
                  icon={`SkillIcon_${charData.id}_Normal${
                    mainComputed?.BA_ALT
                      ? calculatorStore.form[selected]?.dhil_sp
                        ? `0${calculatorStore.form[selected]?.dhil_sp + 1}`
                        : '02'
                      : ''
                  }.png`}
                  element={charData.element}
                  level={char.talents?.basic}
                  upgraded={main?.upgrade?.basic}
                >
                  <div className="flex flex-col justify-between h-full gap-4">
                    <div className="space-y-0.5">
                      {_.map(mainComputed?.BASIC_SCALING, (item) => (
                        <ScalingSubRows key={item.name} scaling={item} type={TalentType.BA} />
                      ))}
                      {mainComputed?.SUPER_BREAK && (
                        <div className="pt-2 space-y-0.5">
                          {_.map(
                            _.filter(mainComputed?.BASIC_SCALING, (item) => !!item.break),
                            (item) => (
                              <SuperBreakSubRows key={item.name} scaling={item} type={TalentType.BA} />
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <SubTotalRow type={TalentType.BA} />
                  </div>
                </ScalingWrapper>
                <div className="w-full my-2 border-t-2 border-primary-border" />
                <ScalingWrapper
                  talent={mainComputed?.SKILL_ALT ? main?.talents?.skill_alt : main?.talents?.skill}
                  icon={`SkillIcon_${charData.id}_BP${mainComputed?.SKILL_ALT ? '02' : ''}.png`}
                  element={charData.element}
                  level={char.talents?.skill}
                  upgraded={main?.upgrade?.skill}
                >
                  <div className="flex flex-col justify-between h-full gap-4">
                    <div className="space-y-0.5">
                      {_.map(mainComputed?.SKILL_SCALING, (item) => (
                        <ScalingSubRows key={item.name} scaling={item} type={TalentType.SKILL} />
                      ))}
                      {mainComputed?.SUPER_BREAK && (
                        <div className="pt-2 space-y-0.5">
                          {_.map(
                            _.filter(mainComputed?.SKILL_SCALING, (item) => !!item.break),
                            (item) => (
                              <SuperBreakSubRows key={item.name} scaling={item} type={TalentType.SKILL} />
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <SubTotalRow type={TalentType.SKILL} />
                  </div>
                </ScalingWrapper>
                {charData.path === PathType.REMEMBRANCE && (
                  <>
                    <div className="w-full my-2 border-t-2 border-primary-border" />
                    <ScalingWrapper
                      talent={main?.talents?.summon_skill}
                      icon={`SkillIcon_${charData.id}_Servant01.png`}
                      element={charData.element}
                      level={char.talents?.skill}
                      upgraded={main?.upgrade?.skill}
                    >
                      <div className="flex flex-col justify-between h-full gap-4">
                        <div className="space-y-0.5">
                          {_.map(mainComputed?.MEMO_SKILL_SCALING, (item) => (
                            <ScalingSubRows key={item.name} scaling={item} type={TalentType.SERVANT} />
                          ))}
                          {mainComputed?.SUPER_BREAK && (
                            <div className="pt-2 space-y-0.5">
                              {_.map(
                                _.filter(mainComputed?.SKILL_SCALING, (item) => !!item.break),
                                (item) => (
                                  <SuperBreakSubRows key={item.name} scaling={item} type={TalentType.SKILL} />
                                )
                              )}
                            </div>
                          )}
                        </div>
                        <SubTotalRow type={TalentType.SKILL} />
                      </div>
                    </ScalingWrapper>
                  </>
                )}
                <div className="w-full my-2 border-t-2 border-primary-border" />
                <ScalingWrapper
                  talent={mainComputed?.ULT_ALT ? main?.talents?.ult_alt : main?.talents?.ult}
                  icon={`SkillIcon_${charData.id}_Ultra${mainComputed?.ULT_ALT ? '02' : ''}.png`}
                  element={charData.element}
                  level={char.talents?.ult}
                  upgraded={main?.upgrade?.ult}
                >
                  <div className="flex flex-col justify-between h-full gap-4">
                    <div className="space-y-0.5">
                      {_.map(mainComputed?.ULT_SCALING, (item) => (
                        <ScalingSubRows key={item.name} scaling={item} type={TalentType.ULT} />
                      ))}
                      {mainComputed?.SUPER_BREAK && (
                        <div className="pt-2 space-y-0.5">
                          {_.map(
                            _.filter(mainComputed?.ULT_SCALING, (item) => !!item.break),
                            (item) => (
                              <SuperBreakSubRows key={item.name} scaling={item} type={TalentType.ULT} />
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <SubTotalRow type={TalentType.ULT} />
                  </div>
                </ScalingWrapper>
                <div className="w-full my-2 border-t-2 border-primary-border" />
                <ScalingWrapper
                  talent={main?.talents?.talent}
                  icon={`SkillIcon_${charData.id}_Passive.png`}
                  element={charData.element}
                  level={char.talents?.talent}
                  upgraded={main?.upgrade?.talent}
                >
                  <div className="flex flex-col justify-between h-full gap-4">
                    <div className="space-y-0.5">
                      {_.map(mainComputed?.TALENT_SCALING, (item) => (
                        <ScalingSubRows key={item.name} scaling={item} type={TalentType.TALENT} />
                      ))}
                      {mainComputed?.SUPER_BREAK && (
                        <div className="pt-2 space-y-0.5">
                          {_.map(
                            _.filter(mainComputed?.TALENT_SCALING, (item) => !!item.break),
                            (item) => (
                              <SuperBreakSubRows key={item.name} scaling={item} type={TalentType.TALENT} />
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <SubTotalRow type={TalentType.TALENT} />
                  </div>
                </ScalingWrapper>
                <div className="w-full my-2 border-t-2 border-primary-border" />
                <ScalingWrapper
                  talent={main?.talents?.technique}
                  icon={`SkillIcon_${charData.id}_Maze.png`}
                  element={charData.element}
                  level={1}
                  upgraded={0}
                >
                  <div className="flex flex-col justify-between h-full gap-4 pb-2">
                    <div className="space-y-0.5">
                      {_.map(mainComputed?.TECHNIQUE_SCALING, (item) => (
                        <ScalingSubRows key={item.name} scaling={item} type={TalentType.TECH} />
                      ))}
                    </div>
                    <SubTotalRow type={TalentType.TECH} />
                  </div>
                </ScalingWrapper>
              </div>
              {mainComputed && <BreakBlock stats={mainComputed} index={selected} />}
            </>
          ) : (
            <div className="flex items-center justify-center w-full text-xl rounded-lg h-[66vh] bg-primary-darker">
              No Character Selected
            </div>
          )}
        </div>
        <div className="flex flex-col items-center w-full gap-3">
          <div className="flex gap-4">
            <div
              className={classNames('rounded-lg px-2 py-1 text-white cursor-pointer duration-200', {
                'bg-primary': tab === 'mod',
              })}
              onClick={() => calculatorStore.setValue('tab', 'mod')}
            >
              Modifiers
            </div>
            <div
              className={classNames('rounded-lg px-2 py-1 text-white cursor-pointer duration-200', {
                'bg-primary': tab === 'stats',
              })}
              onClick={() => calculatorStore.setValue('tab', 'stats')}
            >
              Stats
            </div>
            {main?.talents?.summon_skill && (
              <div
                className={classNames('rounded-lg px-2 py-1 text-white cursor-pointer duration-200', {
                  'bg-primary': tab === 'summon',
                })}
                onClick={() => calculatorStore.setValue('tab', 'summon')}
              >
                Memosprite
              </div>
            )}
            <div
              className={classNames('rounded-lg px-2 py-1 text-white cursor-pointer duration-200', {
                'bg-primary': tab === 'load',
              })}
              onClick={() => calculatorStore.setValue('tab', 'load')}
            >
              Loadout
            </div>
          </div>
          {tab === 'mod' && (
            <>
              <ConditionalBlock title="Self Modifiers" contents={_.filter(contents.main, 'show')} />
              <ConditionalBlock title="Team Modifiers" contents={_.filter(contents.team, 'show')} />
              <WeaponConditionalBlock contents={contents.weapon(selected)} />
              <ConditionalBlock title="Relic Modifiers" contents={contents.artifact(selected)} />
              <CustomConditionalBlock index={selected} />
            </>
          )}
          {charData && tab === 'stats' && (
            <>
              <div className="flex items-center justify-between w-full">
                <p className="px-4 text-lg font-bold">
                  <span className="text-desc">✦</span> Final Stats <span className="text-desc">✦</span>
                </p>
                <PrimaryButton title="Stats Breakdown" onClick={onOpenStatsModal} />
              </div>
              <StatBlock expands stat={computedStats[selected]} />
              <div className="flex items-center justify-center w-full gap-4">
                <div className="flex space-x-3">
                  <p className="text-sm font-bold [writing-mode:vertical-rl] text-center rotate-180">Bonus Abilities</p>
                  <AscensionIcons
                    id={charData.id}
                    talents={main?.talents}
                    element={charData.element}
                    stats={computedStats[selected]}
                    ascension={char.major_traces}
                  />
                </div>
                <ConsCircle
                  talents={main?.talents}
                  element={charData.element}
                  id={char.cId}
                  cons={char.cons}
                  stats={computedStats[selected]}
                />
              </div>
            </>
          )}
          {tab === 'summon' && (
            <>
              <div className="flex items-center justify-between w-full">
                <p className="px-4 text-lg font-bold">
                  <span className="text-desc">✦</span> Memosprite Stats <span className="text-desc">✦</span>
                </p>
                <PrimaryButton title="Stats Breakdown" onClick={onOpenStatsModal} />
              </div>
              <SummonStatBlock expands stat={computedStats[selected]} />
            </>
          )}
          {charData && tab === 'load' && (
            <>
              <div className="w-full text-center">
                <p className="font-bold">Quick Loadout Edit</p>
                <p className="p-2 text-xs rounded-lg bg-primary-dark text-gray">
                  You can quickly change your character's loadout here without affecting data on other pages.
                </p>
              </div>
              <LCBlock
                {...char.equipments.weapon}
                index={selected}
                teamOverride={team}
                setWeapon={(i, w) => {
                  team[i].equipments.weapon = { ...team[i].equipments.weapon, ...w }
                  calculatorStore.setValue('team', _.cloneDeep(team))
                }}
              />
              <div className="w-full space-y-1">
                <p className="font-bold text-center">Relics</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {_.map(char.equipments.artifacts, (a, index) => (
                    <MiniRelicBlock
                      key={index}
                      type={index + 1}
                      aId={a}
                      index={selected}
                      setRelic={(i, t, a) => {
                        team[i].equipments.artifacts.splice(t - 1, 1, a)
                        calculatorStore.setValue('team', _.cloneDeep(team))
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
})
