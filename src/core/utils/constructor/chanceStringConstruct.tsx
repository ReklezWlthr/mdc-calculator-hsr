import { IScaling } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { findEnemy } from '../finder'
import { BreakDebuffType, Element, StatIcons, Stats, TalentProperty } from '@src/domain/constant'
import { StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { CalculatorStore } from '@src/data/stores/calculator_store'
import _ from 'lodash'
import { toPercentage } from '../data_format'
import classNames from 'classnames'
import { ElementColor } from '@src/presentation/hsr/components/tables/scaling_sub_rows'
import { SetupStore } from '@src/data/stores/setup_store'

export const chanceStringConstruct = (
  calculatorStore: CalculatorStore | SetupStore,
  stats: StatsObject,
  base: number,
  fixed: boolean,
  element?: string,
  bonus?: number,
) => {
  const property = BreakDebuffType[element]
  const isCC = _.includes([DebuffTypes.FROZEN, DebuffTypes.ENTANGLE, DebuffTypes.IMPRISON], property)

  const enemy = findEnemy(calculatorStore.enemy)
  const ccRes = enemy?.statusRes?.[DebuffTypes.CONTROL] || 0
  const ehr = stats?.getValue(Stats.EHR) + (bonus || 0)
  const effRes = calculatorStore.getEffRes(stats?.getValue(StatsObjectKeys.E_RES_RED))
  const debuffRes = enemy?.statusRes?.[property === TalentProperty.DOT ? BreakDebuffType[element] : property] || 0
  const prob = fixed ? base : _.max([(base || 0) * (1 + ehr) * (1 - effRes) * (1 - debuffRes - (isCC ? ccRes : 0)), 0])

  const ProbComponent = () => (
    <div>
      <b className="text-red">{toPercentage(prob)}</b> = <b>{toPercentage(base)}</b>
      {fixed && <i className="ml-1 text-desc text-[10px]">Fixed</i>}
      {!!ehr && !fixed && (
        <span>
          {` \u{00d7} (1 + `}
          <b>
            {toPercentage(ehr)}
            <i className="text-[10px] mx-0.5 font-normal">EHR</i>
          </b>
          {`)`}
        </span>
      )}
      {!!effRes && !fixed && (
        <>
          <span>
            {` \u{00d7} (1 - `}
            <b>
              <span className="text-fuchsia-300">{toPercentage(effRes)}</span>
              <i className="text-[10px] mx-0.5 font-normal">RES</i>
            </b>
            {`)`}
          </span>
          <i className="text-[10px] ml-0.5">Enemy</i>
        </>
      )}
      {!!debuffRes && !fixed && (
        <span>
          {` \u{00d7} `}(1 - <b className={classNames(ElementColor[element])}>{toPercentage(debuffRes)}</b>)
          <i className="text-[10px] ml-0.5">DEBUFF RES</i>
        </span>
      )}
    </div>
  )
  return { prob, ProbComponent }
}
