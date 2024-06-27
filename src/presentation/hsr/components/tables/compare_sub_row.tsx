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
import { StringConstructor, useDamageStringConstruct } from '@src/core/hooks/constructor'

interface ScalingSubRowsProps {
  scaling: IScaling[]
  stats: StatsObject[]
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

export const CompareSubRows = observer(({ scaling, stats, level, name, property, element }: ScalingSubRowsProps) => {
  const { calculatorStore, teamStore } = useStore()

  const main = useDamageStringConstruct(scaling[0], stats[0], level[0])
  const sub1 = useDamageStringConstruct(scaling[1], stats[1], level[1])
  const sub2 = useDamageStringConstruct(scaling[2], stats[2], level[2])
  const sub3 = useDamageStringConstruct(scaling[3], stats[3], level[3])

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
  // const toughness = scaling.break * (1 + stats.getValue(StatsObjectKeys.BREAK_EFF))

  const getDmg = (obj: StringConstructor) => {
    return obj?.number.dmg * (noCrit ? 1 : 1 + obj?.number.totalCd * obj?.number.totalCr) || 0
  }

  return (
    <div className="grid items-center grid-cols-9 gap-2 pr-2">
      <p className="col-span-2 text-center">{property}</p>
      <p className={classNames('col-span-1 text-center', ElementColor[element])}>{element}</p>
      {/* <Tooltip
        title={
          <div className="flex items-center justify-between">
            <p>{scaling.name}</p>
            {!!toughness && (
              <p className="text-xs font-normal">
                Toughness Damage: <span className="text-desc">{_.round(toughness, 1).toLocaleString()}</span>
              </p>
            )}
          </div>
        }
        body={DmgBody}
        style="w-[400px]"
      >
        <p className="col-span-1 text-center text-gray">{_.round(main.nudmg).toLocaleString()}</p>
      </Tooltip> */}
      {main ? (
        <Tooltip title={'Main: ' + name} body={main.component.DmgBody} style="w-[400px]">
          <p className="col-span-1 text-center">{_.round(getDmg(main)).toLocaleString()}</p>
        </Tooltip>
      ) : (
        <p className="col-span-1 text-center text-gray">-</p>
      )}
      {sub1 ? (
        <Tooltip title={'Sub 1: ' + name} body={sub1.component.DmgBody} style="w-[400px]">
          <p className="col-span-1 text-center">
            {_.round(getDmg(sub1)).toLocaleString()}
            {getDmg(sub1) > getDmg(main) && <i className="ml-1 text-xs fa-solid fa-caret-up text-heal" />}
            {getDmg(sub1) < getDmg(main) && <i className="ml-1 text-xs fa-solid fa-caret-down text-red" />}
            {getDmg(sub1) === getDmg(main) && <i className="ml-1 text-xs fa-solid fa-minus text-blue" />}
          </p>
        </Tooltip>
      ) : (
        <p className="col-span-1 text-center text-gray">-</p>
      )}
      {sub2 ? (
        <Tooltip title={'Sub 2: ' + name} body={sub2.component.DmgBody} style="w-[400px]">
          <p className="col-span-1 text-center">
            {_.round(getDmg(sub2)).toLocaleString()}
            {getDmg(sub2) > getDmg(main) && <i className="ml-1 text-xs fa-solid fa-caret-up text-heal" />}
            {getDmg(sub2) < getDmg(main) && <i className="ml-1 text-xs fa-solid fa-caret-down text-red" />}
            {getDmg(sub2) === getDmg(main) && <i className="ml-1 text-xs fa-solid fa-minus text-blue" />}
          </p>
        </Tooltip>
      ) : (
        <p className="col-span-1 text-center text-gray">-</p>
      )}
      {sub3 ? (
        <Tooltip title={'Sub 3: ' + name} body={sub3.component.DmgBody} style="w-[400px]">
          <p className="col-span-1 text-center">
            {_.round(getDmg(sub3)).toLocaleString()}
            {getDmg(sub3) > getDmg(main) && <i className="ml-1 text-xs fa-solid fa-caret-up text-heal" />}
            {getDmg(sub3) < getDmg(main) && <i className="ml-1 text-xs fa-solid fa-caret-down text-red" />}
            {getDmg(sub3) === getDmg(main) && <i className="ml-1 text-xs fa-solid fa-minus text-blue" />}
          </p>
        </Tooltip>
      ) : (
        <p className="col-span-1 text-center text-gray">-</p>
      )}
      <p className="col-span-2 text-xs truncate" title={name}>
        {name}
      </p>
    </div>
  )
})
