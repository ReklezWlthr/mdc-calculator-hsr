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

  const isCC = _.includes([TalentProperty.FROZEN, TalentProperty.ENTANGLE], scaling.property)

  const enemy = _.find(Enemies, (item) => item.name === calculatorStore.enemy)
  const ccRes = enemy?.statusRes?.[DebuffTypes.CONTROL] || 0
  const ehr = stats.getValue(Stats.EHR)
  const effRes = calculatorStore.getEffRes(stats.getValue(StatsObjectKeys.EHR_RED))
  const debuffRes = enemy?.statusRes?.[scaling.property] || 0
  const prob = scaling.chance?.fixed
    ? scaling.chance?.base
    : _.max([(scaling.chance?.base || 0) * (1 + ehr) * (1 - effRes) * (1 - debuffRes - (isCC ? ccRes : 0)), 0])
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

  return (
    <div className="grid items-center grid-cols-9 gap-2 pr-2">
      <p className="col-span-2 text-center">{scaling.property}</p>
      <p className={classNames('col-span-1 text-center', ElementColor[element])}>{element}</p>
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
        <p className="col-span-1 text-center text-gray">{_.round(dmg).toLocaleString()}</p>
      </Tooltip>
      {noCrit ? (
        <p className="col-span-1 text-center text-gray">-</p>
      ) : (
        <Tooltip title={'CRIT: ' + scaling.name} body={CritBody} style="w-[400px]">
          <p className="col-span-1 text-center text-gray">{_.round(dmg * (1 + totalCd)).toLocaleString()}</p>
        </Tooltip>
      )}
      {noCrit ? (
        <p className={classNames('col-span-1 font-bold text-center', propertyColor[scaling.property] || 'text-red')}>
          {_.round(dmg).toLocaleString()}
        </p>
      ) : (
        <Tooltip title={'Average: ' + scaling.name} body={AvgBody} style="w-[400px]">
          <p className={classNames('col-span-1 font-bold text-center', propertyColor[scaling.property] || 'text-red')}>
            {_.round(dmg * (1 + totalCd * totalCr)).toLocaleString()}
          </p>
        </Tooltip>
      )}
      {scaling.chance ? (
        <Tooltip
          title="Real Effect Hit Chance"
          body={
            <div>
              <b className="text-red">{toPercentage(prob)}</b> = <b>{toPercentage(scaling.chance.base)}</b> × (1 +{' '}
              <b>{toPercentage(ehr)}</b>) × (1 - <b>{toPercentage(effRes)}</b>)
              {debuffRes ? (
                <span>
                  × (1 - <b>{toPercentage(debuffRes)}</b>)
                </span>
              ) : (
                ''
              )}
            </div>
          }
          style="w-[400px]"
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
      <p className="col-span-2 text-xs truncate" title={scaling.name}>
        {scaling.name}
      </p>
    </div>
  )
})
