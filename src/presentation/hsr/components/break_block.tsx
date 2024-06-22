import { Enemies } from '@src/data/db/enemies'
import { StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import { Element, StatIcons, Stats } from '@src/domain/constant'
import { BreakBaseLevel, BreakElementMult } from '@src/domain/scaling'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { ElementColor } from './tables/scaling_sub_rows'
import { toPercentage } from '@src/core/utils/converter'
import { Tooltip } from '@src/presentation/components/tooltip'
import { DebuffTypes } from '@src/domain/conditional'

export const BreakBlock = observer(({ stats, index }: { stats: StatsObject; index: number }) => {
  const { teamStore, calculatorStore } = useStore()

  const isDoT = _.includes([Element.FIRE, Element.PHYSICAL, Element.LIGHTNING, Element.WIND], stats?.ELEMENT)

  const type = {
    [Element.PHYSICAL]: DebuffTypes.BLEED,
    [Element.FIRE]: DebuffTypes.BURN,
    [Element.ICE]: DebuffTypes.FROZEN,
    [Element.LIGHTNING]: DebuffTypes.SHOCKED,
    [Element.WIND]: DebuffTypes.WIND_SHEAR,
    [Element.QUANTUM]: DebuffTypes.ENTANGLE,
    [Element.IMAGINARY]: DebuffTypes.IMPRISON,
  }

  const defPen = (stats.getValue(StatsObjectKeys.DEF_PEN) || 0) + (stats.getValue(StatsObjectKeys.BREAK_DEF_PEN) || 0)
  const debuffDefPen =
    (stats.getValue(StatsObjectKeys.DEF_PEN) || 0) + (isDoT ? stats.getValue(StatsObjectKeys.DOT_DEF_PEN) : 0)

  const defMult =
    calculatorStore.getDefMult(
      teamStore.characters[index]?.level,
      defPen,
      stats.getValue(StatsObjectKeys.DEF_REDUCTION)
    ) || 1
  const debuffDefMult =
    calculatorStore.getDefMult(
      teamStore.characters[index]?.level,
      debuffDefPen,
      stats.getValue(StatsObjectKeys.DEF_REDUCTION)
    ) || 1
  const vulMult =
    1 +
    stats.getValue(StatsObjectKeys.VULNERABILITY) +
    (stats.getValue(`${stats.ELEMENT.toUpperCase()}_VUL`) || 0) +
    (stats.getValue(StatsObjectKeys.BREAK_VUL) || 0)
  const debuffVulMult =
    1 +
    stats.getValue(StatsObjectKeys.VULNERABILITY) +
    (stats.getValue(`${stats.ELEMENT.toUpperCase()}_VUL`) || 0) +
    (isDoT ? stats.getValue(StatsObjectKeys.DOT_VUL) : 0)
  const resMult = _.max([
    _.min([
      calculatorStore.getResMult(
        stats.ELEMENT,
        (stats.getValue(`${stats.ELEMENT.toUpperCase()}_RES_PEN`) || 0) +
          (stats.getValue(StatsObjectKeys.ALL_TYPE_RES_PEN) || 0)
      ),
      2,
    ]),
    0.1,
  ])

  const breakEffect = stats?.getValue(Stats.BE)
  const breakElementMult = BreakElementMult[stats?.ELEMENT]
  const breakLevel = BreakBaseLevel[teamStore.characters[index]?.level - 1]
  const toughnessMult = 0.5 * (calculatorStore.toughness / 40)
  const base = breakElementMult * breakLevel * toughnessMult
  const final = base * (1 + breakEffect) * defMult * vulMult * resMult * 0.9

  const enemy = _.find(Enemies, (item) => item.name === calculatorStore.enemy)
  const enemyType = enemy?.type
  const bleedHp = (enemyType === 'Normal' ? 0.16 : 0.07) * calculatorStore.hp
  const bleedCap = 2 * breakLevel * toughnessMult
  const bleed = _.min([bleedHp, bleedCap])
  const shock = breakLevel * 2
  const entangle = 0.6 * breakLevel * toughnessMult

  const delay =
    (stats?.ELEMENT === Element.QUANTUM ? 0.2 : stats?.ELEMENT === Element.IMAGINARY ? 0.3 : 0) * (1 + breakEffect)

  const ccRes = enemy?.statusRes?.[DebuffTypes.CONTROL]
  const prob =
    1.5 *
    (1 - calculatorStore.getEffRes()) *
    (1 + stats.getValue(Stats.EHR)) *
    (1 - enemy?.statusRes?.[type[stats?.ELEMENT]] - (isDoT ? 0 : ccRes))

  const baseBreakScaling = `(<b class="${
    ElementColor[stats?.ELEMENT]
  }">${breakElementMult}</b> <i class="text-[10px]">ELEMENT</i> \u{00d7} <b>${_.round(
    breakLevel
  ).toLocaleString()}</b> <i class="text-[10px]">BASE</i> \u{00d7} <b>${toughnessMult}</b> <i class="text-[10px]">TOUGHNESS</i>)`

  const baseDebuffScaling = `<b>${_.round(breakLevel).toLocaleString()}</b> <i class="text-[10px]">BASE</i>`
  const baseShockScaling = `(2 \u{00d7} <b>${_.round(breakLevel).toLocaleString()}</b> <i class="text-[10px]">BASE</i>)`
  const baseEntangleScaling = `(0.6 \u{00d7} <b>${_.round(
    breakLevel
  ).toLocaleString()}</b> <i class="text-[10px]">BASE</i> \u{00d7} <b>${toughnessMult}</b> <i class="text-[10px]">TOUGHNESS</i>))`
  const baseBleedScaling =
    bleedCap > bleedHp
      ? `(2 \u{00d7} <b>${_.round(
          breakLevel
        ).toLocaleString()}</b> <i class="text-[10px]">BASE</i> \u{00d7} <b>${toughnessMult}</b> <i class="text-[10px]">TOUGHNESS</i>)`
      : `<span class="inline-flex items-center h-4">(<b class="inline-flex items-center h-4"><img class="h-3 mx-1" src="https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/${
          StatIcons[Stats.HP]
        }" />${_.round(
          calculatorStore.hp
        ).toLocaleString()}</b><i class="text-[10px] ml-1">Enemy HP</i><span class="mx-1"> \u{00d7} </span><b>${toPercentage(
          enemyType === 'Normal' ? 0.16 : 0.07,
          2
        )}</b>)</span>`
  const debuff =
    stats?.ELEMENT === Element.QUANTUM
      ? baseEntangleScaling
      : stats?.ELEMENT === Element.LIGHTNING
      ? baseShockScaling
      : stats?.ELEMENT === Element.PHYSICAL
      ? baseBleedScaling
      : baseDebuffScaling
  const finalDebuff =
    (stats?.ELEMENT === Element.QUANTUM
      ? entangle
      : stats?.ELEMENT === Element.LIGHTNING
      ? shock
      : stats?.ELEMENT === Element.PHYSICAL
      ? bleed
      : breakLevel) *
    (1 + breakEffect) *
    defMult *
    vulMult *
    resMult *
    (calculatorStore.broken ? 1 : 0.9)

  const formulaString = (final: number, scale: string, broken: boolean, defMult: number, vulMult: number) =>
    `<b class="text-red">${_.round(final).toLocaleString()}</b> = ${scale}${
      stats.getValue(Stats.BE) > 0
        ? ` \u{00d7} <span class="inline-flex items-center h-4">(1 + <b class="inline-flex items-center h-4"><img class="h-3 mx-1" src="https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/IconBreakUp.png" />${toPercentage(
            stats.getValue(Stats.BE)
          )}</b>)</span>`
        : ''
    }${
      stats.getValue(StatsObjectKeys.SUPER_BREAK_DMG) > 0
        ? ` \u{00d7} (1 + <b class="">${toPercentage(stats.getValue(StatsObjectKeys.SUPER_BREAK_DMG))}</b>)`
        : ''
    }${
      stats.getValue(StatsObjectKeys.SUPER_BREAK_MULT) > 0
        ? ` \u{00d7} <b class="text-indigo-300">${toPercentage(stats.getValue(StatsObjectKeys.SUPER_BREAK_MULT))}</b>`
        : ''
    } \u{00d7} <b class="text-orange-300">${toPercentage(
      defMult,
      2
    )}</b> <i class="text-[10px]">DEF</i> \u{00d7} <b class="text-teal-200">${toPercentage(
      resMult,
      2
    )}</b> <i class="text-[10px]">RES</i> \u{00d7} <b class="text-rose-300">${toPercentage(
      vulMult,
      2
    )}</b> <i class="text-[10px]">VUL</i> \u{00d7} <b class="text-violet-300">${toPercentage(
      broken ? 1 : 0.9
    )}</b> <i class="text-[10px]">BROKEN</i>`

  return (
    <div className="flex flex-col mb-5 text-sm rounded-lg bg-primary-darker h-fit">
      <div className="px-2 py-1 text-lg font-bold text-center rounded-t-lg bg-primary-light">
        <p>Break DMG</p>
      </div>
      <div className="grid w-full grid-cols-12 gap-2 py-0.5 pr-2 text-sm font-bold text-center bg-primary-dark">
        <p className="col-span-2">Element</p>
        <p className="col-span-2">Debuff Type</p>
        <p className="col-span-2">Break DMG</p>
        <p className="col-span-3">{type[stats?.ELEMENT]} DMG</p>
        <p className="col-span-2">Action Delay</p>
        <p className="col-span-1">Prob.</p>
      </div>
      <div className="grid w-full grid-cols-12 gap-2 py-0.5 pr-2 text-sm text-center">
        <p className={classNames('col-span-2 font-bold', ElementColor[stats?.ELEMENT])}>{stats?.ELEMENT}</p>
        <p className={classNames('col-span-2', ElementColor[stats?.ELEMENT])}>{type[stats?.ELEMENT]}</p>
        <p className="col-span-2 font-bold">
          <Tooltip
            title={`${stats?.ELEMENT} Break DMG`}
            body={
              <p
                dangerouslySetInnerHTML={{ __html: formulaString(final, baseBreakScaling, false, defMult, vulMult) }}
              />
            }
            style="text-start font-normal w-[400px]"
          >
            <p className="text-red">{_.round(final).toLocaleString()}</p>
          </Tooltip>
        </p>
        <p className="col-span-3 font-bold">
          {stats?.ELEMENT === Element.IMAGINARY ? (
            <p className="font-normal text-gray">-</p>
          ) : (
            <Tooltip
              title={`${stats?.ELEMENT} Break DMG`}
              body={
                <p
                  dangerouslySetInnerHTML={{
                    __html: formulaString(finalDebuff, debuff, calculatorStore.broken, debuffDefMult, debuffVulMult),
                  }}
                />
              }
              style="text-start font-normal w-[400px]"
            >
              <p className="text-red">{_.round(finalDebuff).toLocaleString()}</p>
            </Tooltip>
          )}
        </p>
        <p className="col-span-2">{toPercentage(0.25 + delay)}</p>
        <p
          className={classNames(
            'text-center truncate',
            prob <= 0.6 ? 'text-red' : prob <= 0.8 ? 'text-desc' : 'text-heal'
          )}
        >
          {toPercentage(prob)}
        </p>
      </div>
    </div>
  )
})
