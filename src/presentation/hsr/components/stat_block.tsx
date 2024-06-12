import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import { toPercentage } from '@src/core/utils/converter'

import { StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { Stats } from '@src/domain/constant'

interface StatBlockProps {
  index: number
  stat: StatsObject
}

export const StatBlock = observer(({ index, stat }: StatBlockProps) => {
  const DataRow = ({ title, value }: { title: string; value: number | string }) => {
    return (
      <div className="flex items-center gap-2 text-xs">
        <p className="shrink-0">{title}</p>
        <hr className="w-full border border-primary-border" />
        <p className="font-normal text-gray">{value?.toLocaleString()}</p>
      </div>
    )
  }

  const ExtraDataRow = ({ title, base, bonus }: { title: string; base: number; bonus: number }) => {
    return (
      <div className="flex items-center gap-2 text-xs">
        <p className="shrink-0">{title}</p>
        <hr className="w-full border border-primary-border" />
        <div className="flex flex-col items-end shrink-0">
          <p className="font-normal text-gray">{_.round(base + bonus, title === 'SPD' ? 1 : 0).toLocaleString()}</p>
          <p className="font-normal text-neutral-400 text-[9px]">
            {_.round(base).toLocaleString()}
            <span className="text-blue">{` +${_.round(bonus, title === 'SPD' ? 1 : 0).toLocaleString()}`}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid w-full grid-flow-col grid-cols-2 p-4 font-bold text-white rounded-lg grid-rows-10 gap-y-1 gap-x-5 bg-primary-dark">
      <ExtraDataRow
        title="HP"
        base={stat?.BASE_HP}
        bonus={stat?.BASE_ATK * stat?.getValue(Stats.P_HP) + stat?.getValue(Stats.HP)}
      />
      <ExtraDataRow
        title="ATK"
        base={stat?.BASE_ATK}
        bonus={stat?.BASE_ATK * stat?.getValue(Stats.P_ATK) + stat?.getValue(Stats.ATK)}
      />
      <ExtraDataRow
        title="DEF"
        base={stat?.BASE_DEF}
        bonus={stat?.BASE_ATK * stat?.getValue(Stats.P_DEF) + stat?.getValue(Stats.DEF)}
      />
      <ExtraDataRow
        title="SPD"
        base={stat?.BASE_SPD}
        bonus={stat?.BASE_ATK * stat?.getValue(Stats.P_SPD) + stat?.getValue(Stats.SPD)}
      />
      <DataRow title="CRIT Rate" value={toPercentage(stat?.getValue(Stats.CRIT_RATE))} />
      <DataRow
        title="CRIT DMG"
        value={toPercentage(stat?.getValue(Stats.CRIT_DMG) + stat?.getValue(StatsObjectKeys.X_CRIT_DMG))}
      />
      <DataRow title="Break Effect" value={toPercentage(stat?.getValue(Stats.BE))} />
      <DataRow title="Outgoing Healing" value={toPercentage(stat?.getValue(Stats.HEAL))} />
      <DataRow title="Energy Regen Rate" value={toPercentage(stat?.getValue(Stats.ERR))} />
      <DataRow title="Max Energy" value={stat?.MAX_ENERGY} />
      <DataRow title="Physical DMG%" value={toPercentage(stat?.getValue(Stats.PHYSICAL_DMG))} />
      <DataRow title="Fire DMG%" value={toPercentage(stat?.getValue(Stats.FIRE_DMG))} />
      <DataRow title="Ice DMG%" value={toPercentage(stat?.getValue(Stats.ICE_DMG))} />
      <DataRow title="Lightning DMG%" value={toPercentage(stat?.getValue(Stats.LIGHTNING_DMG))} />
      <DataRow title="Wind DMG%" value={toPercentage(stat?.getValue(Stats.WIND_DMG))} />
      <DataRow title="Quantum DMG%" value={toPercentage(stat?.getValue(Stats.QUANTUM_DMG))} />
      <DataRow title="Imaginary DMG%" value={toPercentage(stat?.getValue(Stats.IMAGINARY_DMG))} />
      <DataRow title="DMG%" value={toPercentage(stat?.getValue(Stats.ALL_DMG))} />
      <DataRow title="Effect Hit Rate" value={toPercentage(stat?.getValue(Stats.EHR))} />
      <DataRow title="Effect RES" value={toPercentage(stat?.getValue(Stats.E_RES))} />
    </div>
  )
})
