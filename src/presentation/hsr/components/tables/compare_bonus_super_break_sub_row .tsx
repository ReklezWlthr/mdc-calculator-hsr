import { IScaling, ISuperBreakScaling } from '@src/domain/conditional'
import { Element, TalentProperty, TalentType } from '@src/domain/constant'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Tooltip } from '@src/presentation/components/tooltip'
import { toPercentage } from '@src/core/utils/converter'
import { StatsObject } from '@src/data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import {
  SuperBreakStringConstructor,
  superBreakStringConstruct,
} from '@src/core/utils/constructor/superBreakStringConstruct'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { useEffect, useState } from 'react'
import { bonusSuperBreakStringConstruct } from '@src/core/utils/constructor/bonusSuperBreakStringConstruct'

interface ScalingSubRowsProps {
  scaling: ISuperBreakScaling[]
  stats: StatsObject[]
  level: { level: number[]; selected: number }[]
  setupNames: string[]
  name: string
  type: TalentType
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
  [Element.NONE]: 'text-true',
}

export const ElementColor = {
  ...BaseElementColor,
  ...propertyColor,
}

export const CompareBonusSuperBreakSubRows = observer(
  ({ scaling, stats, level, name, element, type, setupNames }: ScalingSubRowsProps) => {
    const { setupStore } = useStore()
    const [sum, setSum] = useState(true)

    const mode = setupStore.mode

    const [main, sub1, sub2, sub3] = _.map(Array(4), (_v, index) =>
      bonusSuperBreakStringConstruct(
        setupStore,
        scaling[index],
        stats[index],
        level[index].level[level[index].selected],
        type
      )
    )

    console.log('test', scaling[0])

    const getDmg = (obj: SuperBreakStringConstructor) => {
      return obj?.dmg || 0
    }

    useEffect(() => {
      const arr = [main, sub1, sub2, sub3]
      _.forEach(scaling, (item, i) => {
        item && setupStore.setTotal(type, i, item?.name + '_SB', sum ? getDmg(arr[i]) : 0)
      })
      return () => {
        _.forEach(scaling, (item, i) => {
          item && setupStore.setTotal(type, i, item?.name + '_SB', undefined)
        })
      }
    }, [main, sub1, sub2, sub3, scaling, sum])

    useEffect(() => {
      setSum(true)
    }, [scaling[0]])

    const SubDmgBlock = ({ title, obj }: { title: string; obj: SuperBreakStringConstructor }) => {
      const compare = getDmg(obj) - getDmg(main)
      const p = (getDmg(obj) - getDmg(main)) / getDmg(main)
      const percent = (compare >= 0 ? '+' : '') + (getDmg(main) ? toPercentage(p) : 'NEW')
      const abs = (compare >= 0 ? '+' : '') + _.floor(getDmg(obj) - getDmg(main)).toLocaleString()
      const diff = _.includes(['percent', 'abs'], mode)
      return obj ? (
        <Tooltip
          title={
            <div className="flex items-center justify-between gap-2">
              <div className="w-1/2">
                <p className="w-full text-xs font-normal truncate text-gray">{title}</p>
                <p>{name}</p>
              </div>
              {main ? (
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <p
                    className={classNames('text-xs', {
                      'text-lime-300': compare > 0,
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
          style="w-[450px]"
        >
          <p
            className={classNames(
              'col-span-1 text-xs text-center',
              diff
                ? {
                    'text-lime-300': compare > 0 && getDmg(main),
                    'text-desc': compare > 0 && !getDmg(main),
                    'text-red': compare < 0,
                    'text-blue': compare === 0,
                  }
                : ''
            )}
          >
            {mode === 'percent' ? percent : mode === 'abs' ? abs : _.floor(getDmg(obj)).toLocaleString()}
            {compare > 0 && !diff && <i className="ml-1 text-[10px] fa-solid fa-caret-up text-lime-400" />}
            {compare < 0 && !diff && <i className="ml-1 text-[10px] fa-solid fa-caret-down text-red" />}
            {compare === 0 && !diff && <i className="ml-1 text-[10px] fa-solid fa-minus text-blue" />}
          </p>
        </Tooltip>
      ) : (
        <p className="col-span-1 text-center text-gray">-</p>
      )
    }

    return (
      <div className="grid items-center grid-cols-9 gap-2 pr-2">
        <p className="col-span-2 text-center">{element === Element.NONE ? 'True DMG' : 'Super Break DMG'}</p>
        <p className={classNames('col-span-1 text-center', ElementColor[element])}>{element}</p>
        {main ? (
          <Tooltip
            title={
              <div className="w-1/2">
                <p className="w-full text-xs font-normal truncate text-gray">{setupNames[0]}</p>
                <p>{name}</p>
              </div>
            }
            body={<div dangerouslySetInnerHTML={{ __html: main.formulaString }} />}
            style="w-[450px]"
          >
            <p className="col-span-1 text-xs text-center">{_.floor(getDmg(main)).toLocaleString()}</p>
          </Tooltip>
        ) : (
          <p className="col-span-1 text-center text-gray">-</p>
        )}
        <SubDmgBlock obj={sub1} title={setupNames[1]} />
        <SubDmgBlock obj={sub2} title={setupNames[2]} />
        <SubDmgBlock obj={sub3} title={setupNames[3]} />
        <div className="flex col-span-2 gap-1 text-xs" title={name}>
          <p className="w-full truncate">{name}</p>
          <CheckboxInput checked={sum} onClick={setSum} />
        </div>
      </div>
    )
  }
)
