import { IScaling } from '@src/domain/conditional'
import { Element, StatIcons, Stats, TalentProperty, PathType, TalentType } from '@src/domain/constant'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Tooltip } from '@src/presentation/components/tooltip'
import { toPercentage } from '@src/core/utils/converter'
import { StatsObject, StatsObjectKeys, TalentPropertyMap } from '@src/data/lib/stats/baseConstant'
import { TalentTypeMap } from '../../../../data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import { findCharacter } from '@src/core/utils/finder'
import { BreakBaseLevel, BreakElementMult } from '@src/domain/scaling'
import { StringConstructor, damageStringConstruct } from '@src/core/utils/constructor/damageStringConstruct'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { useEffect, useState } from 'react'

interface ScalingSubRowsProps {
  scaling: IScaling[]
  stats: StatsObject[]
  allStats: StatsObject[][]
  level: { level: number[]; selected: number }[]
  name: string
  setupNames: string[]
  property: string
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
}

export const ElementColor = {
  ...BaseElementColor,
  ...propertyColor,
}

export const CompareSubRows = observer(
  ({ scaling, stats, allStats, level, name, property, type, element, setupNames }: ScalingSubRowsProps) => {
    const { setupStore, calculatorStore } = useStore()
    const [sum, setSum] = useState(_.some(scaling, (item) => item?.sum))

    const mode = setupStore.mode
    const [main, sub1, sub2, sub3] = _.map(Array(4), (_v, index) =>
      damageStringConstruct(
        calculatorStore,
        scaling[index],
        scaling[index]?.overrideIndex ? allStats[index]?.[scaling[index]?.overrideIndex] : stats[index],
        level[index].level[scaling[index]?.overrideIndex ?? level[index].selected]
      )
    )

    const noCrit = _.includes(
      [
        TalentProperty.HEAL,
        TalentProperty.SHIELD,
        TalentProperty.DOT,
        TalentProperty.BREAK,
        TalentProperty.BREAK_DOT,
        TalentProperty.SUPER_BREAK,
        TalentProperty.FROZEN,
      ],
      property
    )
    const toughness = _.map(scaling, (item, i) => item?.break * (1 + stats[i]?.getValue(StatsObjectKeys.BREAK_EFF)))

    const getDmg = (obj: StringConstructor) => {
      return (
        obj?.number.dmg *
          (noCrit || mode === 'base' ? 1 : 1 + obj?.number.totalCd * (mode === 'crit' ? 1 : obj?.number.totalCr)) || 0
      )
    }

    useEffect(() => {
      const arr = [main, sub1, sub2, sub3]
      _.forEach(scaling, (item, i) => {
        item && setupStore.setTotal(type, i, item?.name, sum ? getDmg(arr[i]) : 0)
      })
      return () => {
        _.forEach(scaling, (item, i) => {
          item && setupStore.setTotal(type, i, item?.name, undefined)
        })
      }
    }, [main, sub1, sub2, sub3, scaling, sum])

    useEffect(() => {
      setSum(_.some(scaling, (item) => item?.sum))
    }, [scaling[0]])

    const Body = ({ obj }: { obj: StringConstructor }) => (
      <div className="space-y-1.5">
        <div>
          {!noCrit && <p className="font-bold text-white">Base</p>}
          {obj.component.DmgBody}
        </div>
        {!noCrit && (
          <>
            <div className="pt-1.5 border-t-2 border-primary-border">
              <p className="font-bold text-white">CRIT</p>
              {obj.component.CritBody}
            </div>
            <div className="pt-1.5 border-t-2 border-primary-border">
              <p className="font-bold text-white">Average</p>
              {obj.component.AvgBody}
            </div>
          </>
        )}
      </div>
    )

    const SubDmgBlock = ({ title, obj, toughness }: { title: string; obj: StringConstructor; toughness: number }) => {
      const compare = getDmg(obj) - getDmg(main)
      const p = (getDmg(obj) - getDmg(main)) / getDmg(main)
      const percent = getDmg(main) ? (compare >= 0 ? '+' : '') + toPercentage(p) : 'NEW'
      const abs = (compare >= 0 ? '+' : '') + _.round(getDmg(obj) - getDmg(main)).toLocaleString()
      const diff = _.includes(['percent', 'abs'], mode)
      return obj ? (
        <Tooltip
          title={
            <div className="flex items-center justify-between gap-2">
              <div className="w-1/2">
                <p className="w-full text-xs font-normal truncate text-gray">{title}</p>
                <p>{name}</p>
              </div>
              <div className="flex flex-col items-end gap-y-1 shrink-0">
                {!!toughness && (
                  <p className="text-xs font-normal">
                    Toughness Damage: <span className="text-desc">{_.round(toughness, 1).toLocaleString()}</span>
                  </p>
                )}
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
            </div>
          }
          body={<Body obj={obj} />}
          style="w-[400px]"
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
            {mode === 'percent' ? percent : mode === 'abs' ? abs : _.round(getDmg(obj)).toLocaleString()}
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
        <p className="col-span-2 text-center">{property}</p>
        <p className={classNames('col-span-1 text-center', ElementColor[element])}>{element}</p>
        {main ? (
          <Tooltip
            title={
              <div className="flex items-center justify-between">
                <div className="w-1/2">
                  <p className="w-full text-xs font-normal truncate text-gray">{setupNames[0]}</p>
                  <p>{name}</p>
                </div>
                {!!toughness[0] && (
                  <p className="text-xs font-normal">
                    Toughness Damage: <span className="text-desc">{_.round(toughness[0], 1).toLocaleString()}</span>
                  </p>
                )}
              </div>
            }
            body={<Body obj={main} />}
            style="w-[400px]"
          >
            <p className="col-span-1 text-xs text-center">{_.round(getDmg(main)).toLocaleString()}</p>
          </Tooltip>
        ) : (
          <p className="col-span-1 text-center text-gray">-</p>
        )}
        <SubDmgBlock obj={sub1} title={setupNames[1]} toughness={toughness[1]} />
        <SubDmgBlock obj={sub2} title={setupNames[2]} toughness={toughness[2]} />
        <SubDmgBlock obj={sub3} title={setupNames[3]} toughness={toughness[3]} />
        <div className="flex col-span-2 gap-1 text-xs" title={name}>
          <p className="w-full truncate">{name}</p>
          <CheckboxInput checked={sum} onClick={setSum} />
        </div>
      </div>
    )
  }
)
