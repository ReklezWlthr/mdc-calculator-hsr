import { StatsObject, StatsObjectKeys, TalentPropertyMap, TalentTypeMap } from '@src/data/lib/stats/baseConstant'
import { IScaling } from '@src/domain/conditional'
import { Element, StatIcons, Stats, TalentProperty } from '@src/domain/constant'
import { toPercentage } from '@src/core/utils/converter'
import { ElementColor } from '@src/presentation/hsr/components/tables/super_break_sub_rows'
import _ from 'lodash'
import { propertyColor } from '@src/presentation/hsr/components/tables/scaling_sub_rows'
import { BreakBaseLevel, BreakElementMult } from '@src/domain/scaling'
import { useStore } from '@src/data/providers/app_store_provider'
import { CalculatorStore, CalculatorStoreType } from '@src/data/stores/calculator_store'
import { SetupStore } from '@src/data/stores/setup_store'

export const superBreakStringConstruct = (
  calculatorStore: CalculatorStore | SetupStore,
  scaling: IScaling,
  stats: StatsObject,
  level: number
) => {
  if (!scaling || !stats || !level) return

  const element = scaling.element

  const defPen =
    (stats.getValue(StatsObjectKeys.DEF_PEN) || 0) +
    (stats.getValue(StatsObjectKeys.SUPER_BREAK_DEF_PEN) || 0) +
    (stats.getValue(StatsObjectKeys.BREAK_DEF_PEN) || 0) +
    (stats.getValue(`${TalentTypeMap[scaling.type]}_DEF_PEN`) || 0)

  const defMult = calculatorStore.getDefMult(level, defPen, stats.getValue(StatsObjectKeys.DEF_REDUCTION)) || 1
  const vulMult =
    1 +
    stats.getValue(StatsObjectKeys.VULNERABILITY) +
    (stats.getValue(StatsObjectKeys.BREAK_VUL) || 0) +
    (scaling.vul || 0)
  const resMult = _.max([
    _.min([
      calculatorStore.getResMult(
        element as Element,
        (stats.getValue(`${element.toUpperCase()}_RES_RED`) || 0) +
          (stats.getValue(StatsObjectKeys.ALL_TYPE_RES_RED) || 0) +
          (stats.getValue(`${element.toUpperCase()}_RES_PEN`) || 0) +
          (stats.getValue(StatsObjectKeys.ALL_TYPE_RES_PEN) || 0) +
          (scaling.res_pen || 0) // Counted as Elemental RES PEN
      ),
      2,
    ]),
    0.1,
  ])
  const isDamage = !_.includes([TalentProperty.SHIELD, TalentProperty.HEAL], scaling.property)
  const enemyMod = isDamage ? defMult * resMult * vulMult : 1

  const breakLevel = BreakBaseLevel[level - 1]
  const toughnessMult = (scaling.break * (1 + stats.getValue(StatsObjectKeys.BREAK_EFF))) / 10
  const breakMult =
    stats.getValue(StatsObjectKeys.SUPER_BREAK_MULT) + stats.getValue(`${TalentTypeMap[scaling.type]}_SUPER_BREAK`)

  const raw = breakLevel * toughnessMult
  const dmg =
    raw *
    (1 + stats.getValue(Stats.BE)) *
    (1 + stats.getValue(StatsObjectKeys.BREAK_DMG)) *
    (1 + stats.getValue(StatsObjectKeys.SUPER_BREAK_DMG)) *
    breakMult *
    (1 + (stats.getValue(StatsObjectKeys.BREAK_MULT) || 0)) *
    enemyMod

  // String Construct
  const baseBreakScaling = `(<b>${_.round(
    breakLevel
  ).toLocaleString()}</b> <i class="text-[10px]">BASE</i> \u{00d7} <b>${_.round(
    toughnessMult,
    1
  ).toLocaleString()}</b> <i class="text-[10px]">TOUGHNESS</i>)`

  const formulaString = `<b class="${propertyColor[scaling.property] || 'text-red'}">${_.floor(
    dmg
  ).toLocaleString()}</b> = ${baseBreakScaling}${
    stats.getValue(Stats.BE) > 0
      ? ` \u{00d7} <span class="inline-flex items-center h-4">(1 + <b class="inline-flex items-center h-4"><img class="h-3 mx-1" src="https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/IconBreakUp.png" />${toPercentage(
          stats.getValue(Stats.BE)
        )}</b>)</span>`
      : ''
  }${
    stats.getValue(StatsObjectKeys.SUPER_BREAK_DMG) > 0
      ? ` \u{00d7} (1 + <b class="">${toPercentage(stats.getValue(StatsObjectKeys.SUPER_BREAK_DMG))}</b>)`
      : ''
  }${breakMult > 0 ? ` \u{00d7} <b class="text-indigo-300">${toPercentage(breakMult)}</b>` : ''}${
    stats.getValue(StatsObjectKeys.BREAK_MULT) > 0
      ? ` \u{00d7} <b class="text-amber-400">${toPercentage(1 + stats.getValue(StatsObjectKeys.BREAK_MULT), 2)}</b>`
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
  )}</b> <i class="text-[10px]">VUL</i>`

  return {
    formulaString,
    dmg,
  }
}

export type SuperBreakStringConstructor = ReturnType<typeof superBreakStringConstruct>
