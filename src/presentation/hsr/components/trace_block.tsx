import { toPercentage } from '@src/core/utils/data_format'
import { findCharacter } from '@src/core/utils/finder'
import { useStore } from '@src/data/providers/app_store_provider'
import { Stats } from '@src/domain/constant'
import { TraceScaling } from '@src/domain/scaling'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { ToggleSwitch } from '@src/presentation/components/inputs/toggle'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

interface TraceBlockProps {
  id: string
  data: {
    stat: Stats
    value: number
    toggled: boolean
  }[]
  onClick: (index: number) => void
  disabled?: boolean
}

export const TraceBlock = observer(({ id, data, onClick, disabled }: TraceBlockProps) => {
  return (
    <div className="w-full font-bold text-white rounded-lg bg-primary-dark">
      <div className="flex justify-center px-5 py-1 rounded-t-lg bg-primary-lighter">Minor Traces</div>
      <div className="p-3 space-y-2 text-xs font-normal">
        {_.map(data, (trace, index) => (
          <div
            className={classNames('grid grid-cols-12 gap-3', {
              'border-b-2 border-primary-light pb-2 border-opacity-50': _.includes([4, 6], index),
            })}
            key={index}
          >
            <div className="col-span-7 text-center">{trace?.stat || '-'}</div>
            <div className="col-span-3 text-center text-gray">
              {id ? (trace?.stat === Stats.SPD ? trace?.value : toPercentage(trace?.value)) : '-'}
            </div>
            <div className="flex justify-center col-span-2">
              <CheckboxInput
                checked={data?.[index]?.toggled}
                onClick={() => onClick(index)}
                disabled={!id || disabled}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
