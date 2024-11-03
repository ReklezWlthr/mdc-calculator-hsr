import { StatsObject, StatsObjectKeys, TalentPropertyMap, TalentTypeMap } from '@src/data/lib/stats/baseConstant'
import { DebuffTypes } from '@src/domain/conditional'
import { BreakDebuffType, Element, StatIcons, Stats } from '@src/domain/constant'
import { toPercentage } from '@src/core/utils/converter'
import { ElementColor } from '@src/presentation/hsr/components/tables/super_break_sub_rows'
import _ from 'lodash'
import { BreakBaseLevel, BreakElementMult } from '@src/domain/scaling'
import { CalculatorStore } from '@src/data/stores/calculator_store'
import { Enemies } from '@src/data/db/enemies'
import { checkIsDoT } from '../finder'
import { SetupStore } from '@src/data/stores/setup_store'

export const breakDamageStringConstruct = (
  calculatorStore: CalculatorStore | SetupStore,
  stats: StatsObject,
  level: number,
  multiplier?: number
) => {
  if (!stats || !level) return

  const isDoT = checkIsDoT(stats?.ELEMENT)

  const defPen = (stats.getValue(StatsObjectKeys.DEF_PEN) || 0) + (stats.getValue(StatsObjectKeys.BREAK_DEF_PEN) || 0)
  const debuffDefPen =
    (stats.getValue(StatsObjectKeys.DEF_PEN) || 0) + (isDoT ? stats.getValue(StatsObjectKeys.DOT_DEF_PEN) : 0)

  const defMult = calculatorStore.getDefMult(level, defPen, stats.getValue(StatsObjectKeys.DEF_REDUCTION)) || 1
  const debuffDefMult =
    calculatorStore.getDefMult(level, debuffDefPen, stats.getValue(StatsObjectKeys.DEF_REDUCTION)) || 1
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
        (stats.getValue(`${stats.ELEMENT.toUpperCase()}_RES_RED`) || 0) +
          (stats.getValue(StatsObjectKeys.ALL_TYPE_RES_RED) || 0) +
          (stats.getValue(`${stats.ELEMENT.toUpperCase()}_RES_PEN`) || 0) +
          (stats.getValue(StatsObjectKeys.ALL_TYPE_RES_PEN) || 0)
      ),
      2,
    ]),
    0.1,
  ])

  const breakEffect = stats?.getValue(Stats.BE)
  const breakElementMult = BreakElementMult[stats?.ELEMENT]
  const breakLevel = BreakBaseLevel[level - 1]
  const toughnessMult = 0.5 + calculatorStore.toughness / 40
  const base = breakElementMult * breakLevel * toughnessMult
  const final =
    base * (1 + breakEffect) * defMult * vulMult * resMult * (calculatorStore.broken ? 1 : 0.9) * (multiplier || 1)

  const enemy = _.find(Enemies, (item) => item.name === calculatorStore.enemy)
  const enemyType = enemy?.type
  const bleedHp = (enemyType === 'Normal' ? 0.16 : 0.07) * calculatorStore.hp
  const bleedCap = 2 * breakLevel * toughnessMult
  const bleed = _.min([bleedHp, bleedCap])
  const shock = breakLevel * 2
  const entangle = 0.6 * breakLevel * toughnessMult

  const delay =
    (stats?.ELEMENT === Element.QUANTUM ? 0.2 : stats?.ELEMENT === Element.IMAGINARY ? 0.3 : 0) * (1 + breakEffect)

  const ccRes = enemy?.statusRes?.[DebuffTypes.CONTROL] || 0
  const prob =
    1.5 *
    (1 - calculatorStore.getEffRes(stats.getValue(StatsObjectKeys.E_RES_RED))) *
    (1 + stats.getValue(Stats.EHR)) *
    (1 - (enemy?.statusRes?.[BreakDebuffType[stats?.ELEMENT]] || 0) - (isDoT ? 0 : ccRes))

  const baseBreakScaling = `(<b class="${
    ElementColor[stats?.ELEMENT]
  }">${breakElementMult}</b> <i class="text-[10px]">ELEMENT</i> \u{00d7} <b>${_.round(
    breakLevel
  ).toLocaleString()}</b> <i class="text-[10px]">BASE</i> \u{00d7} <b>${toughnessMult}</b> <i class="text-[10px]">TOUGHNESS</i>)`

  const baseDebuffScaling = `<b>${_.round(breakLevel).toLocaleString()}</b> <i class="text-[10px]">BASE</i>`
  const baseShockScaling = `(2 \u{00d7} <b>${_.round(breakLevel).toLocaleString()}</b> <i class="text-[10px]">BASE</i>)`
  const baseEntangleScaling = `(0.6 \u{00d7} <b>${_.round(
    breakLevel
  ).toLocaleString()}</b> <i class="text-[10px]">BASE</i> \u{00d7} <b>${toughnessMult}</b> <i class="text-[10px]">TOUGHNESS</i>)`
  const baseBleedScaling =
    bleedCap <= bleedHp
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
    debuffDefMult *
    debuffVulMult *
    resMult *
    (calculatorStore.broken ? 1 : 0.9) *
    (multiplier || 1)

  const formulaString = (final: number, scale: string, broken: boolean, defMult: number, vulMult: number) =>
    `<b class="text-red">${_.round(final).toLocaleString()}</b> = ${scale}${
      stats.getValue(Stats.BE) > 0
        ? ` \u{00d7} <span class="inline-flex items-center h-4">(1 + <b class="inline-flex items-center h-4"><img class="h-3 mx-1" src="https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/IconBreakUp.png" />${toPercentage(
            stats.getValue(Stats.BE)
          )}</b>)</span>`
        : ''
    }${
      multiplier ? ` \u{00d7} <b class="text-indigo-300">${toPercentage(multiplier, 2)}</b>` : ''
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

  const breakString = formulaString(final, baseBreakScaling, calculatorStore.broken, defMult, vulMult)
  const debuffString = formulaString(finalDebuff, debuff, calculatorStore.broken, debuffDefMult, debuffVulMult)

  return {
    string: { formulaString, breakString, debuffString },
    number: { prob, delay, final, finalDebuff },
  }
}

export type StringConstructor = ReturnType<typeof breakDamageStringConstruct>
