import { StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

export const StatsModal = observer(({ stats }: { stats: StatsObject }) => {
  return (
    <div className="w-[25vw] bg-primary-dark rounded-lg p-3 space-y-2">
      {_.map(stats?.HP, item=><p>{item.source} {item.value}</p>)}
      {_.map(stats?.X_HP, item=><p>{item.source} {item.value}</p>)}
    </div>
  )
})
