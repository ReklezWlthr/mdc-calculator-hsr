import { IScaling, ISuperBreakScaling } from '@src/domain/conditional'
import { Element, StatIcons, Stats, TalentProperty, PathType, TalentType } from '@src/domain/constant'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Tooltip } from '@src/presentation/components/tooltip'
import { toPercentage } from '@src/core/utils/data_format'
import { StatsObject, StatsObjectKeys, TalentPropertyMap } from '@src/data/lib/stats/baseConstant'
import { TalentTypeMap } from '../../../../data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import { BreakBaseLevel } from '@src/domain/scaling'
import { superBreakStringConstruct } from '@src/core/utils/constructor/superBreakStringConstruct'
import { useEffect, useState } from 'react'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { bonusSuperBreakStringConstruct } from '@src/core/utils/constructor/bonusSuperBreakStringConstruct'

interface ScalingSubRowsProps {
  scaling: ISuperBreakScaling
  statsOverride?: StatsObject
  type: TalentType
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
  [Element.NONE]: 'text-true',
}

export const ElementColor = {
  ...BaseElementColor,
  ...propertyColor,
}

export const BonusSuperBreakSubRows = observer(({ scaling, statsOverride, type }: ScalingSubRowsProps) => {
  const { calculatorStore, teamStore } = useStore()
  const index = calculatorStore.selected
  const stats = statsOverride || calculatorStore.computedStats[index]
  const [sum, setSum] = useState(true)

  const element = scaling.element

  const { dmg, formulaString } = bonusSuperBreakStringConstruct(
    calculatorStore,
    scaling,
    stats,
    teamStore.characters[index]?.level,
    type
  )

  useEffect(() => {
    const arr = [dmg, dmg, dmg]
    _.forEach(arr, (item, i) => {
      item && calculatorStore.setTotal(type, i, scaling.name + '_SB', sum ? item : 0)
    })
    return () => {
      _.forEach(arr, (item, i) => {
        item && calculatorStore.setTotal(type, i, scaling.name + '_SB', undefined)
      })
    }
  }, [dmg, scaling, sum])

  useEffect(() => {
    setSum(true)
  }, [scaling])

  return (
    <div className="grid items-center grid-cols-9 gap-2 pr-2">
      <p className="col-span-2 text-center">{element === Element.NONE ? 'True DMG' : 'Super Break DMG'}</p>
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
        <p className="col-span-1 text-center text-gray">{_.floor(dmg).toLocaleString()}</p>
      </Tooltip>
      <p className="col-span-1 text-center text-gray">-</p>
      <Tooltip
        title={scaling.name}
        body={
          <div className="space-y-1">
            <p dangerouslySetInnerHTML={{ __html: formulaString }} />
          </div>
        }
        style="w-[400px]"
      >
        <p className="col-span-1 font-bold text-center text-red">{_.floor(dmg).toLocaleString()}</p>
      </Tooltip>
      <p className="text-xs text-center truncate text-gray">-</p>
      <div className="flex col-span-2 gap-1 text-xs" title={scaling.name}>
        <p className="w-full truncate">{scaling.name}</p>
        <CheckboxInput checked={sum} onClick={setSum} />
      </div>
    </div>
  )
})
