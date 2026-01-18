import { IScaling } from '@src/domain/conditional'
import { Element, TalentProperty, TalentType } from '@src/domain/constant'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Tooltip } from '@src/presentation/components/tooltip'
import { toPercentage } from '@src/core/utils/data_format'
import { StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import { damageStringConstruct } from '@src/core/utils/constructor/damageStringConstruct'
import { chanceStringConstruct } from '@src/core/utils/constructor/chanceStringConstruct'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { useEffect, useState } from 'react'
import { findCharacter } from '@src/core/utils/finder'

interface ScalingSubRowsProps {
  scaling: IScaling
  statsOverride?: StatsObject
  type: TalentType
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

export const ScalingSubRows = observer(({ scaling, statsOverride, type }: ScalingSubRowsProps) => {
  const { calculatorStore, teamStore } = useStore()
  const index = scaling.overrideIndex ?? calculatorStore.selected
  const stats = statsOverride || calculatorStore.computedStats[index]
  const element = scaling.property === TalentProperty.TRUE ? Element.NONE : scaling.element
  const [sum, setSum] = useState(scaling.sum)

  const {
    component: { DmgBody, AvgBody, CritBody },
    number: { dmg, totalCrit, totalAvg },
  } = damageStringConstruct(
    calculatorStore,
    calculatorStore.globalMod,
    scaling,
    stats,
    teamStore.characters[index]?.level,
    true
  )

  const { prob, ProbComponent } = chanceStringConstruct(
    calculatorStore,
    stats,
    scaling.chance?.base,
    scaling.chance?.fixed,
    scaling.debuffElement || scaling.element,
    scaling.ehrBonus
  )
  const noCrit =
    _.includes(
      [
        TalentProperty.HEAL,
        TalentProperty.SHIELD,
        TalentProperty.DOT,
        TalentProperty.BREAK,
        TalentProperty.BREAK_DOT,
        TalentProperty.SUPER_BREAK,
      ],
      scaling.property
    ) || scaling.trueRaw
  const toughness = scaling.break * (1 + stats.getValue(StatsObjectKeys.BREAK_EFF))

  const DmgBlock = ({ highlight }: { highlight?: boolean }) => (
    <Tooltip
      title={
        <div className="flex items-center justify-between gap-3">
          <p>{scaling.name}</p>
          <div className="flex flex-col items-end shrink-0">
            <p className="text-xs font-normal text-gray">
              {scaling.property} • <span className="text-desc">{scaling.type}</span>
            </p>
            {!!toughness && element !== Element.NONE && (
              <p className="text-xs font-normal text-gray">
                Toughness Damage: <span className="text-desc">{_.round(toughness, 1).toLocaleString()}</span>
              </p>
            )}
            {_.isNumber(scaling.overrideIndex) && (
              <p className="text-xs font-normal text-gray">
                Source:{' '}
                <span className="text-desc">
                  {findCharacter(teamStore.characters[scaling.overrideIndex]?.cId)?.name}
                </span>
              </p>
            )}
          </div>
        </div>
      }
      body={DmgBody}
      style="w-[400px]"
    >
      <p
        className={classNames(
          'col-span-1 text-center text-gray',
          { 'font-bold': highlight },
          highlight ? propertyColor[scaling.property] || 'text-red' : 'text-gray'
        )}
      >
        {_.floor(dmg).toLocaleString()}
      </p>
    </Tooltip>
  )

  useEffect(() => {
    const arr = noCrit ? Array(3).fill(dmg) : [dmg, totalCrit, totalAvg]
    _.forEach(arr, (item, i) => {
      item && calculatorStore.setTotal(type, i, scaling.name, sum ? item : 0)
    })
    return () => {
      _.forEach(arr, (item, i) => {
        item && calculatorStore.setTotal(type, i, scaling.name, undefined)
      })
    }
  }, [dmg, totalCrit, totalAvg, scaling, sum])

  useEffect(() => {
    setSum(scaling.sum)
  }, [scaling])

  return (
    <div className="grid items-center grid-cols-9 gap-2 pr-2">
      <p className="col-span-2 text-center">{scaling.property}</p>
      <p className={classNames('col-span-1 text-center', ElementColor[element])}>{element}</p>
      <DmgBlock />
      {noCrit ? (
        <p className="col-span-1 text-center text-gray">-</p>
      ) : (
        <Tooltip title={'CRIT: ' + scaling.name} body={CritBody} style="w-[400px]">
          <p className="col-span-1 text-center text-gray">{_.floor(totalCrit).toLocaleString()}</p>
        </Tooltip>
      )}
      {noCrit ? (
        <DmgBlock highlight />
      ) : (
        <Tooltip title={'Average: ' + scaling.name} body={AvgBody} style="w-[400px]">
          <p className={classNames('col-span-1 font-bold text-center', propertyColor[scaling.property] || 'text-red')}>
            {_.floor(totalAvg).toLocaleString()}
          </p>
        </Tooltip>
      )}
      {scaling.chance ? (
        <Tooltip
          title="Real Effect Hit Chance"
          body={<ProbComponent />}
          style={scaling.chance?.fixed ? 'w-[200px]' : 'w-[400px]'}
        >
          <p
            className={classNames(
              'text-xs text-center truncate',
              prob <= 0.6 ? 'text-red' : prob <= 0.8 ? 'text-desc' : 'text-heal'
            )}
          >
            {toPercentage(prob, 1)}
          </p>
        </Tooltip>
      ) : (
        <p className="text-xs text-center truncate text-gray">-</p>
      )}
      <div className="flex col-span-2 gap-1 text-xs" title={scaling.name}>
        <p className="w-full truncate">{scaling.name}</p>
        <CheckboxInput checked={sum} onClick={setSum} />
      </div>
    </div>
  )
})
