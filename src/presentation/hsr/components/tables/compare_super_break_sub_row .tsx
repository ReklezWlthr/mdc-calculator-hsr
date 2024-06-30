import { IScaling } from '@src/domain/conditional'
import { Element, TalentProperty } from '@src/domain/constant'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Tooltip } from '@src/presentation/components/tooltip'
import { toPercentage } from '@src/core/utils/converter'
import { StatsObject } from '@src/data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import { SuperBreakStringConstructor, useSuperBreakStringConstruct } from '@src/core/hooks/useSuperBreakStringConstruct'

interface ScalingSubRowsProps {
  scaling: IScaling[]
  stats: StatsObject[]
  allStats: StatsObject[][]
  level: number[]
  name: string
  property: string
  element: string
}

export const propertyColor = {
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

export const CompareSuperBreakSubRows = observer(
  ({ scaling, stats, allStats, level, name, property, element }: ScalingSubRowsProps) => {
    const main = useSuperBreakStringConstruct(
      scaling[0],
      scaling[0]?.overrideIndex ? allStats[0]?.[scaling[0]?.overrideIndex] : stats[0],
      level[0]
    )
    const sub1 = useSuperBreakStringConstruct(
      scaling[1],
      scaling[1]?.overrideIndex ? allStats[1]?.[scaling[1]?.overrideIndex] : stats[1],
      level[1]
    )
    const sub2 = useSuperBreakStringConstruct(
      scaling[2],
      scaling[2]?.overrideIndex ? allStats[2]?.[scaling[2]?.overrideIndex] : stats[2],
      level[2]
    )
    const sub3 = useSuperBreakStringConstruct(
      scaling[3],
      scaling[3]?.overrideIndex ? allStats[3]?.[scaling[3]?.overrideIndex] : stats[3],
      level[3]
    )

    const getDmg = (obj: SuperBreakStringConstructor) => {
      return obj?.dmg || 0
    }

    const SubDmgBlock = ({ title, obj }: { title: string; obj: SuperBreakStringConstructor }) => {
      const compare = getDmg(obj) - getDmg(main)
      return obj ? (
        <Tooltip
          title={
            <div className="flex items-center justify-between gap-2">
              <p>{`${title}: ${name}`}</p>
              {main ? (
                <div className="flex items-center gap-1">
                  <p
                    className={classNames('text-xs', {
                      'text-heal': compare > 0,
                      'text-red': compare < 0,
                      'text-blue': compare === 0,
                    })}
                  >
                    {compare >= 0 && '+'}
                    {toPercentage(compare / getDmg(main))}
                  </p>
                  <p className="text-xs font-normal">from Main</p>
                </div>
              ) : (
                <p className="text-xs text-desc">NEW</p>
              )}
            </div>
          }
          body={<div dangerouslySetInnerHTML={{ __html: obj.formulaString }} />}
          style="w-[400px]"
        >
          <p className="col-span-1 text-xs text-center">
            {_.round(getDmg(obj)).toLocaleString()}
            {compare > 0 && <i className="ml-1 text-[10px] fa-solid fa-caret-up text-heal" />}
            {compare < 0 && <i className="ml-1 text-[10px] fa-solid fa-caret-down text-red" />}
            {compare === 0 && <i className="ml-1 text-[10px] fa-solid fa-minus text-blue" />}
          </p>
        </Tooltip>
      ) : (
        <p className="col-span-1 text-center text-gray">-</p>
      )
    }

    return (
      <div className="grid items-center grid-cols-9 gap-2 pr-2">
        <p className="col-span-2 text-center">Super Break DMG</p>
        <p className={classNames('col-span-1 text-center', ElementColor[element])}>{element}</p>
        {main ? (
          <Tooltip
            title={'Main: ' + name}
            body={<div dangerouslySetInnerHTML={{ __html: main.formulaString }} />}
            style="w-[400px]"
          >
            <p className="col-span-1 text-xs text-center">{_.round(getDmg(main)).toLocaleString()}</p>
          </Tooltip>
        ) : (
          <p className="col-span-1 text-center text-gray">-</p>
        )}
        <SubDmgBlock obj={sub1} title="Sub 1" />
        <SubDmgBlock obj={sub2} title="Sub 2" />
        <SubDmgBlock obj={sub3} title="Sub 3" />
        <p className="col-span-2 text-xs truncate" title={name}>
          {name}
        </p>
      </div>
    )
  }
)