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

export const CompareSubRows = observer(
  ({ scaling, stats, allStats, level, name, property, element }: ScalingSubRowsProps) => {
    const { setupStore, calculatorStore } = useStore()

    const mode = setupStore.mode
    const main = damageStringConstruct(
      calculatorStore,
      scaling[0],
      scaling[0]?.overrideIndex ? allStats[0]?.[scaling[0]?.overrideIndex] : stats[0],
      level[0]
    )
    const sub1 = damageStringConstruct(
      calculatorStore,
      scaling[1],
      scaling[1]?.overrideIndex ? allStats[1]?.[scaling[1]?.overrideIndex] : stats[1],
      level[1]
    )
    const sub2 = damageStringConstruct(
      calculatorStore,
      scaling[2],
      scaling[2]?.overrideIndex ? allStats[2]?.[scaling[2]?.overrideIndex] : stats[2],
      level[2]
    )
    const sub3 = damageStringConstruct(
      calculatorStore,
      scaling[3],
      scaling[3]?.overrideIndex ? allStats[3]?.[scaling[3]?.overrideIndex] : stats[3],
      level[3]
    )

    const noCrit = _.includes(
      [
        TalentProperty.HEAL,
        TalentProperty.SHIELD,
        TalentProperty.DOT,
        TalentProperty.BREAK,
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
              <p>{`${title}: ${name}`}</p>
              <div className="flex flex-col items-end gap-y-1">
                {!!toughness && (
                  <p className="text-xs font-normal">
                    Toughness Damage: <span className="text-desc">{_.round(toughness, 1).toLocaleString()}</span>
                  </p>
                )}
                {main ? (
                  <div className="flex items-center gap-1">
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
            {compare > 0 && !diff && <i className="ml-1 text-[10px] fa-solid fa-caret-up text-lime-300" />}
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
                <p>{`Main: ${name}`}</p>
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
        <SubDmgBlock obj={sub1} title="Sub 1" toughness={toughness[1]} />
        <SubDmgBlock obj={sub2} title="Sub 2" toughness={toughness[2]} />
        <SubDmgBlock obj={sub3} title="Sub 3" toughness={toughness[3]} />
        <p className="col-span-2 text-xs truncate" title={name}>
          {name}
        </p>
      </div>
    )
  }
)
