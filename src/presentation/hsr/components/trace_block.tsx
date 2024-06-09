import { toPercentage } from '@src/core/utils/converter'
import { findCharacter } from '@src/core/utils/finder'
import { useStore } from '@src/data/providers/app_store_provider'
import { Stats } from '@src/domain/constant'
import { TraceScaling } from '@src/domain/scaling'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { ToggleSwitch } from '@src/presentation/components/inputs/toggle'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

export const TraceBlock = observer(({ id }: { id: string }) => {
  const { teamStore } = useStore()
  const char = _.find(teamStore.characters, (item) => item.cId === id)
  const charIndex = _.findIndex(teamStore.characters, (item) => item.cId === id)

  return (
    <div className="w-full font-bold text-white rounded-lg bg-primary-dark">
      <div className="flex justify-center px-5 py-1 rounded-t-lg bg-primary-lighter">Minor Traces</div>
      <div className="p-3 space-y-2 text-xs font-normal">
        {_.map(char.minor_traces, (trace, index) => (
          <div className="grid grid-cols-12 gap-3" key={index}>
            <div className="col-span-7 text-center">{trace?.stat}</div>
            <div className="col-span-3 text-center text-gray">
              {trace?.stat === Stats.SPD ? trace?.value : toPercentage(trace?.value)}
            </div>
            <div className="flex justify-center col-span-2">
              <CheckboxInput
                checked={char?.minor_traces?.[index]?.toggled}
                onClick={() => teamStore.toggleMinorTrace(charIndex, index)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
