import { DebuffTypes, IScaling } from '@src/domain/conditional'
import { Element, Stats, TalentProperty } from '@src/domain/constant'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Tooltip } from '@src/presentation/components/tooltip'
import { toPercentage } from '@src/core/utils/converter'
import { StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import { damageStringConstruct } from '@src/core/utils/constructor/damageStringConstruct'
import { Enemies } from '@src/data/db/enemies'
import { breakDamageStringConstruct } from '@src/core/utils/constructor/breakDamageStringConstruct'
import { chanceStringConstruct } from '@src/core/utils/constructor/chanceStringConstruct'

interface ScalingSubRowsProps {
  scaling: IScaling
  statsOverride?: StatsObject
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

export const ScalingSubRows = observer(({ scaling, statsOverride }: ScalingSubRowsProps) => {
  const { calculatorStore, teamStore } = useStore()
  const index = scaling.overrideIndex ?? calculatorStore.selected
  const stats = statsOverride || calculatorStore.computedStats[index]
  const element = scaling.element

  const {
    component: { DmgBody, AvgBody, CritBody },
    number: { dmg, totalCd, totalCr },
  } = damageStringConstruct(calculatorStore, scaling, stats, teamStore.characters[index]?.level)

  const { prob, ProbComponent } = chanceStringConstruct(
    calculatorStore,
    stats,
    scaling.chance?.base,
    scaling.chance?.fixed,
    scaling.debuffElement
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
    scaling.property
  )
  const toughness = scaling.break * (1 + stats.getValue(StatsObjectKeys.BREAK_EFF))

  const DmgBlock = ({ highlight }: { highlight?: boolean }) => (
    <Tooltip
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
      <p
        className={classNames(
          'col-span-1 text-center text-gray',
          { 'font-bold': highlight },
          highlight ? propertyColor[scaling.property] || 'text-red' : 'text-gray'
        )}
      >
        {_.round(dmg).toLocaleString()}
      </p>
    </Tooltip>
  )

  return (
    <div className="grid items-center grid-cols-9 gap-2 pr-2">
      <p className="col-span-2 text-center">{scaling.property}</p>
      <p className={classNames('col-span-1 text-center', ElementColor[element])}>{element}</p>
      <DmgBlock />
      {noCrit ? (
        <p className="col-span-1 text-center text-gray">-</p>
      ) : (
        <Tooltip title={'CRIT: ' + scaling.name} body={CritBody} style="w-[400px]">
          <p className="col-span-1 text-center text-gray">{_.round(dmg * (1 + totalCd)).toLocaleString()}</p>
        </Tooltip>
      )}
      {noCrit ? (
        <DmgBlock highlight />
      ) : (
        <Tooltip title={'Average: ' + scaling.name} body={AvgBody} style="w-[400px]">
          <p className={classNames('col-span-1 font-bold text-center', propertyColor[scaling.property] || 'text-red')}>
            {_.round(dmg * (1 + totalCd * totalCr)).toLocaleString()}
          </p>
        </Tooltip>
      )}
      {scaling.chance ? (
        <Tooltip title="Real Effect Hit Chance" body={<ProbComponent />} style="w-[400px]">
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
      <p className="col-span-2 text-xs truncate" title={scaling.name}>
        {scaling.name}
      </p>
    </div>
  )
})
