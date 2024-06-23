import { IScaling } from '@src/domain/conditional'
import { Element, StatIcons, Stats, TalentProperty, PathType, TalentType } from '@src/domain/constant'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Tooltip } from '@src/presentation/components/tooltip'
import { toPercentage } from '@src/core/utils/converter'
import { StatsObjectKeys, TalentPropertyMap } from '@src/data/lib/stats/baseConstant'
import { TalentTypeMap } from '../../../../data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import { BreakBaseLevel } from '@src/domain/scaling'

interface ScalingSubRowsProps {
  scaling: IScaling
}

const propertyColor = {
  [TalentProperty.HEAL]: 'text-heal',
  [TalentProperty.SHIELD]: 'text-indigo-300',
}

export const BaseElementColor = {
  [Element.PHYSICAL]: 'text-hsr-physical',
  [Element.FIRE]: 'text-hsr-fire',
  [Element.ICE]: 'text-hsr-ice',
  [Element.LIGHTNING]: 'text-hsr-lightning',
  [Element.WIND]: 'text-hsr-wind',
  [Element.QUANTUM]: 'text-hsr-quantum',
  [Element.IMAGINARY]: 'text-hsr-imaginary',
}

export const ElementColor = {
  ...BaseElementColor,
  ...propertyColor,
}

export const SuperBreakSubRows = observer(({ scaling }: ScalingSubRowsProps) => {
  const { calculatorStore, teamStore } = useStore()
  const index = scaling.overrideIndex ?? calculatorStore.selected
  const stats = calculatorStore.computedStats[index]

  const element = scaling.element

  const defPen =
    (stats.getValue(StatsObjectKeys.DEF_PEN) || 0) +
    (stats.getValue(StatsObjectKeys.SUPER_BREAK_DEF_PEN) || 0) +
    (stats.getValue(StatsObjectKeys.BREAK_DEF_PEN) || 0)

  const defMult =
    calculatorStore.getDefMult(
      teamStore.characters[index]?.level,
      defPen,
      stats.getValue(StatsObjectKeys.DEF_REDUCTION)
    ) || 1
  const vulMult =
    1 +
    stats.getValue(StatsObjectKeys.VULNERABILITY) +
    (stats.getValue(StatsObjectKeys.BREAK_VUL) || 0) +
    (scaling.vul || 0)
  const resMult = _.max([
    _.min([
      calculatorStore.getResMult(
        element as Element,
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

  const breakLevel = BreakBaseLevel[teamStore.characters[index]?.level - 1]
  const toughnessMult = (scaling.break * (1 + stats.getValue(StatsObjectKeys.BREAK_EFF))) / 10

  const raw = breakLevel * toughnessMult
  const dmg =
    raw *
    (1 + stats.getValue(Stats.BE)) *
    (1 + stats.getValue(StatsObjectKeys.BREAK_DMG)) *
    (1 + stats.getValue(StatsObjectKeys.SUPER_BREAK_DMG)) *
    stats.getValue(StatsObjectKeys.SUPER_BREAK_MULT) *
    enemyMod

  // String Construct
  const baseBreakScaling = `(<b>${_.round(
    breakLevel
  ).toLocaleString()}</b> <i class="text-[10px]">BASE</i> \u{00d7} <b>${_.round(
    toughnessMult,
    1
  ).toLocaleString()}</b> <i class="text-[10px]">TOUGHNESS</i>)`

  const formulaString = `<b class="${propertyColor[scaling.property] || 'text-red'}">${_.round(
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
  )}</b> <i class="text-[10px]">VUL</i>`

  return (
    <div className="grid items-center grid-cols-9 gap-2 pr-2">
      <p className="col-span-2 text-center">Super Break DMG</p>
      <p className={classNames('col-span-1 text-center', ElementColor[element])}>{element}</p>
      <Tooltip
        title={scaling.name}
        body={
          <div className="space-y-1">
            <p dangerouslySetInnerHTML={{ __html: formulaString }} />
          </div>
        }
        style="w-[400px]"
      >
        <p className="col-span-1 text-center text-gray">{_.round(dmg).toLocaleString()}</p>
      </Tooltip>
      <p className="col-span-1 text-center text-gray">-</p>
      <p className={classNames('col-span-1 font-bold text-center', propertyColor[scaling.property] || 'text-red')}>
        {_.round(dmg).toLocaleString()}
      </p>
      <p className="text-xs text-center truncate text-gray">-</p>
      <p className="col-span-2 text-xs truncate" title={scaling.name}>
        {scaling.name}
      </p>
    </div>
  )
})
