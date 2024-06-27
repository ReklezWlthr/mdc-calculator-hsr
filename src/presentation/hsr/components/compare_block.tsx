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

export const CompareBlock = observer(() => {
  const { setupStore } = useStore()

  const selected = _.findIndex(setupStore.main?.char, (item) => item.cId === setupStore.mainChar)
  const selectedS1 = _.findIndex(setupStore.comparing[0]?.char, (item) => item.cId === setupStore.mainChar)
  const selectedS2 = _.findIndex(setupStore.comparing[1]?.char, (item) => item.cId === setupStore.mainChar)
  const selectedS3 = _.findIndex(setupStore.comparing[2]?.char, (item) => item.cId === setupStore.mainChar)
  const char = setupStore.main?.char?.[selected]
  const charData = findCharacter(setupStore.mainChar)
  const { finalStats, mainComputed, main } = useCalculator({
    teamOverride: setupStore.main?.char,
    doNotSaveStats: true,
    formOverride: setupStore.forms[0],
    indexOverride: selected,
    initFormFunction: (f) => setupStore.setForm(0, f),
  })
  const sub1 = useCalculator({
    teamOverride: setupStore.comparing[0]?.char,
    doNotSaveStats: true,
    formOverride: setupStore.forms[1],
    indexOverride: selectedS1,
    initFormFunction: (f) => setupStore.setForm(1, f),
  })
  const sub2 = useCalculator({
    teamOverride: setupStore.comparing[1]?.char,
    doNotSaveStats: true,
    formOverride: setupStore.forms[2],
    indexOverride: selectedS2,
    initFormFunction: (f) => setupStore.setForm(2, f),
  })
  const sub3 = useCalculator({
    teamOverride: setupStore.comparing[2]?.char,
    doNotSaveStats: true,
    formOverride: setupStore.forms[3],
    indexOverride: selectedS3,
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

  const getUniqueComponent = (key: string) =>
    _.filter(
      _.uniqBy(
        _.flatMap(sumStats, (f) => f?.[key]),
        (item) => item?.name
      )
    )

  return (
    _.some(sumStats) && (
      <div className="flex flex-col w-3/4 mb-5 text-sm text-white rounded-lg bg-primary-darker h-fit">
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
    )
  )
})
