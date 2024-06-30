import { useCalculator } from '@src/core/hooks/useCalculator'
import { StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { findCharacter } from '@src/core/utils/finder'
import { ScalingWrapper } from '../components/tables/scaling_wrapper'
import { SuperBreakSubRows } from '../components/tables/super_break_sub_rows'
import { CompareSubRows } from '../components/tables/compare_sub_row'
import { IScaling } from '@src/domain/conditional'
import { CompareConditionalBlock } from './compare_conditional_block'
import classNames from 'classnames'
import { LCBlock } from './lc_block'
import { MiniRelicBlock } from './mini_relic_block'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { StatBlock } from './stat_block'
import { AscensionIcons } from './ascension_icons'
import { ConsCircle } from './cons_circle'
import { useCallback } from 'react'
import { StatsModal } from './stats_modal'
import { CompareTraceBlock } from './compare_trace_block'

export const CompareBlock = observer(() => {
  const { setupStore, modalStore } = useStore()

  const tab = setupStore.tab
  const team = [setupStore.main.char, ..._.map(setupStore.comparing, (item) => item?.char)]
  const [setupIndex, charIndex] = setupStore.selected
  const focusedChar = team[setupIndex][charIndex]

  const selected = _.findIndex(setupStore.main?.char, (item) => item.cId === setupStore.mainChar)
  const selectedS1 = _.findIndex(setupStore.comparing[0]?.char, (item) => item.cId === setupStore.mainChar)
  const selectedS2 = _.findIndex(setupStore.comparing[1]?.char, (item) => item.cId === setupStore.mainChar)
  const selectedS3 = _.findIndex(setupStore.comparing[2]?.char, (item) => item.cId === setupStore.mainChar)
  const char = setupStore.main?.char?.[selected]
  const charData = findCharacter(setupStore.mainChar)
  const { finalStats, mainComputed, main, ...mainContent } = useCalculator({
    teamOverride: setupStore.main?.char,
    doNotSaveStats: true,
    formOverride: setupStore.forms[0],
    indexOverride: selected,
    customOverride: setupStore.custom[0],
    initFormFunction: (f) => setupStore.setForm(0, f),
  })
  const sub1 = useCalculator({
    teamOverride: setupStore.comparing[0]?.char,
    doNotSaveStats: true,
    formOverride: setupStore.forms[1],
    indexOverride: selectedS1,
    customOverride: setupStore.custom[1],
    initFormFunction: (f) => setupStore.setForm(1, f),
  })
  const sub2 = useCalculator({
    teamOverride: setupStore.comparing[1]?.char,
    doNotSaveStats: true,
    formOverride: setupStore.forms[2],
    indexOverride: selectedS2,
    customOverride: setupStore.custom[2],
    initFormFunction: (f) => setupStore.setForm(2, f),
  })
  const sub3 = useCalculator({
    teamOverride: setupStore.comparing[2]?.char,
    doNotSaveStats: true,
    formOverride: setupStore.forms[3],
    indexOverride: selectedS3,
    customOverride: setupStore.custom[3],
    initFormFunction: (f) => setupStore.setForm(3, f),
  })

  const sumStats = [
    finalStats?.[selected],
    sub1.finalStats?.[selectedS1],
    sub2.finalStats?.[selectedS2],
    sub3.finalStats?.[selectedS3],
  ]
  const allStats = [finalStats, sub1.finalStats, sub2.finalStats, sub3.finalStats]
  const levels = [
    setupStore.main?.char?.[selected]?.level,
    setupStore.comparing?.[0]?.char?.[selectedS1]?.level,
    setupStore.comparing?.[1]?.char?.[selectedS2]?.level,
    setupStore.comparing?.[2]?.char?.[selectedS3]?.level,
  ]
  const contents = [mainContent.contents, sub1.contents, sub2.contents, sub3.contents]

  const getUniqueComponent = (key: string) =>
    _.filter(
      _.uniqBy(
        _.flatMap(sumStats, (f) => f?.[key]),
        (item) => item?.name
      )
    )

  const onOpenStatsModal = useCallback(
    () =>
      modalStore.openModal(
        <StatsModal stats={allStats[setupIndex][charIndex]} path={findCharacter(focusedChar.cId)?.path} />
      ),
    [allStats, charData]
  )

  return (
    <div className="grid grid-cols-3 gap-4 px-5">
      {_.some(sumStats) && (
        <div className="flex flex-col col-span-2 mb-5 text-sm text-white rounded-lg bg-primary-darker h-fit">
          <div className="px-2 py-1 text-lg font-bold text-center rounded-t-lg bg-primary-light">
            <p>Damage Comparison</p>
            {/* <p className='text-xs font-normal text-gray'>Hover Numbers for More Details</p> */}
          </div>
          <div className="flex justify-end w-full mb-1.5 bg-primary-dark">
            <div className="grid w-4/5 grid-cols-9 gap-2 py-0.5 pr-2 text-sm font-bold text-center bg-primary-dark">
              <p className="col-span-2">Property</p>
              <p className="col-span-1">Element</p>
              <p className="col-span-1">Main</p>
              <p className="col-span-1">Sub 1</p>
              <p className="col-span-1">Sub 2</p>
              <p className="col-span-1">Sub 3</p>
              <p className="col-span-2">DMG Component</p>
            </div>
          </div>
          <ScalingWrapper
            talent={
              mainComputed?.BA_ALT
                ? main?.talents?.[`normal_alt${setupStore.forms[0][selected]?.dhil_sp}`] || main?.talents?.normal_alt
                : main?.talents?.normal
            }
            icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData.id}_Normal${
              mainComputed?.BA_ALT
                ? setupStore.forms[0][selected]?.dhil_sp
                  ? `0${setupStore.forms[0][selected]?.dhil_sp + 1}`
                  : '02'
                : ''
            }.png`}
            element={charData.element}
            level={char.talents?.basic}
            upgraded={main?.upgrade?.basic}
          >
            {_.map(getUniqueComponent(StatsObjectKeys.BASIC_SCALING), (item) => (
              <CompareSubRows
                key={item.name}
                scaling={_.map(
                  _.map(sumStats, (f) => f?.BASIC_SCALING),
                  (s) => _.find(s, (a) => a.name === item.name)
                )}
                stats={sumStats}
                allStats={allStats}
                level={levels}
                name={item.name}
                property={item.property}
                element={item.element}
              />
            ))}
            {/* {mainComputed?.SUPER_BREAK && (
            <div className="pt-2 space-y-0.5">
              {_.map(
                _.filter(mainComputed?.BASIC_SCALING, (item) => !!item.break),
                (item) => (
                  <SuperBreakSubRows key={item.name} scaling={item} statsOverride={mainComputed} />
                )
              )}
            </div>
          )} */}
          </ScalingWrapper>
          <div className="w-full my-2 border-t-2 border-primary-border" />
          <ScalingWrapper
            talent={mainComputed?.SKILL_ALT ? main?.talents?.skill_alt : main?.talents?.skill}
            icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData.id}_BP${
              mainComputed?.SKILL_ALT && char.cId !== '1109' ? '02' : ''
            }.png`}
            element={charData.element}
            level={char.talents?.skill}
            upgraded={main?.upgrade?.skill}
          >
            {_.map(getUniqueComponent(StatsObjectKeys.SKILL_SCALING), (item) => (
              <CompareSubRows
                key={item}
                scaling={_.map(
                  _.map(sumStats, (f) => f?.SKILL_SCALING),
                  (s) => _.find(s, (a) => a.name === item.name)
                )}
                stats={sumStats}
                allStats={allStats}
                level={levels}
                name={item.name}
                property={item.property}
                element={item.element}
              />
            ))}
            {/* {mainComputed?.SUPER_BREAK && (
            <div className="pt-2 space-y-0.5">
              {_.map(
                _.filter(mainComputed?.SKILL_SCALING, (item) => !!item.break),
                (item) => (
                  <SuperBreakSubRows key={item.name} scaling={item} statsOverride={mainComputed} />
                )
              )}
            </div>
          )} */}
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
            {_.map(getUniqueComponent(StatsObjectKeys.ULT_SCALING), (item) => (
              <CompareSubRows
                key={item}
                scaling={_.map(
                  _.map(sumStats, (f) => f?.ULT_SCALING),
                  (s) => _.find(s, (a) => a.name === item.name)
                )}
                stats={sumStats}
                allStats={allStats}
                level={levels}
                name={item.name}
                property={item.property}
                element={item.element}
              />
            ))}
            {/* {mainComputed?.SUPER_BREAK && (
            <div className="pt-2 space-y-0.5">
              {_.map(
                _.filter(mainComputed?.ULT_SCALING, (item) => !!item.break),
                (item) => (
                  <SuperBreakSubRows key={item.name} scaling={item} statsOverride={mainComputed} />
                )
              )}
            </div>
          )} */}
          </ScalingWrapper>
          <div className="w-full my-2 border-t-2 border-primary-border" />
          <ScalingWrapper
            talent={main?.talents?.talent}
            icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData.id}_Passive.png`}
            element={charData.element}
            level={char.talents?.talent}
            upgraded={main?.upgrade?.talent}
          >
            {_.map(getUniqueComponent(StatsObjectKeys.TALENT_SCALING), (item) => (
              <CompareSubRows
                key={item}
                scaling={_.map(
                  _.map(sumStats, (f) => f?.TALENT_SCALING),
                  (s) => _.find(s, (a) => a.name === item.name)
                )}
                stats={sumStats}
                allStats={allStats}
                level={levels}
                name={item.name}
                property={item.property}
                element={item.element}
              />
            ))}
            {/* {mainComputed?.SUPER_BREAK && (
            <div className="pt-2 space-y-0.5">
              {_.map(
                _.filter(mainComputed?.TALENT_SCALING, (item) => !!item.break),
                (item) => (
                  <SuperBreakSubRows key={item.name} scaling={item} statsOverride={mainComputed} />
                )
              )}
            </div>
          )} */}
          </ScalingWrapper>
          <div className="w-full my-2 border-t-2 border-primary-border" />
          <ScalingWrapper
            talent={main?.talents?.technique}
            icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData.id}_Maze.png`}
            element={charData.element}
            level={1}
            upgraded={0}
          >
            {_.map(getUniqueComponent(StatsObjectKeys.TECHNIQUE_SCALING), (item) => (
              <CompareSubRows
                key={item}
                scaling={_.map(
                  _.map(sumStats, (f) => f?.TECHNIQUE_SCALING),
                  (s) => _.find(s, (a) => a.name === item.name)
                )}
                stats={sumStats}
                allStats={allStats}
                level={levels}
                name={item.name}
                property={item.property}
                element={item.element}
              />
            ))}
          </ScalingWrapper>
        </div>
      )}
      {_.some(contents) && _.some(sumStats) && (
        <div className="flex flex-col items-center w-full gap-3">
          <div className="flex gap-5">
            <div
              className={classNames('rounded-lg px-2 py-1 text-white cursor-pointer duration-200', {
                'bg-primary': tab === 'mod',
              })}
              onClick={() => setupStore.setValue('tab', 'mod')}
            >
              Modifiers
            </div>
            <div
              className={classNames('rounded-lg px-2 py-1 text-white cursor-pointer duration-200', {
                'bg-primary': tab === 'stats',
              })}
              onClick={() => setupStore.setValue('tab', 'stats')}
            >
              Stats
            </div>
            <div
              className={classNames('rounded-lg px-2 py-1 text-white cursor-pointer duration-200', {
                'bg-primary': tab === 'load',
              })}
              onClick={() => setupStore.setValue('tab', 'load')}
            >
              Loadout
            </div>
            <div
              className={classNames('rounded-lg px-2 py-1 text-white cursor-pointer duration-200', {
                'bg-primary': tab === 'trace',
              })}
              onClick={() => setupStore.setValue('tab', 'trace')}
            >
              Setup
            </div>
          </div>
          {tab === 'mod' && <CompareConditionalBlock content={contents[setupIndex]} />}
          {tab === 'stats' && (
            <>
              <div className="flex items-center justify-between w-full text-white">
                <p className="px-4 text-lg font-bold">
                  <span className="text-desc">✦</span> Final Stats <span className="text-desc">✦</span>
                </p>
                <PrimaryButton title="Stats Breakdown" onClick={onOpenStatsModal} />
              </div>
              <StatBlock index={selected} stat={sumStats[selected]} />
            </>
          )}
          {tab === 'load' && (
            <>
              <LCBlock
                {...focusedChar.equipments.weapon}
                index={selected}
                teamOverride={team[setupIndex]}
                setWeapon={(i, w) => {
                  focusedChar.equipments.weapon = { ...focusedChar.equipments.weapon, ...w }
                  setupStore.setComparing(focusedChar)
                }}
              />
              <div className="w-full space-y-1 text-white">
                <p className="font-bold text-center">Relics</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {_.map(focusedChar.equipments.artifacts, (a, index) => (
                    <MiniRelicBlock
                      key={index}
                      type={index + 1}
                      aId={a}
                      index={selected}
                      setRelic={(i, t, a) => {
                        focusedChar.equipments.artifacts.splice(t - 1, 1, a)
                        setupStore.setComparing(focusedChar)
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
          {tab === 'trace' && <CompareTraceBlock team={team} char={char} />}
        </div>
      )}
    </div>
  )
})
