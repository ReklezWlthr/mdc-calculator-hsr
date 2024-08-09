import { useCalculator } from '@src/core/hooks/useCalculator'
import { StatsObject } from '@src/data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import { TalentType } from '@src/domain/constant'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'

interface Order {
  stats: StatsObject
  av: number
  sp: number
  energy: number
}

export const CyclePage = observer(() => {
  const { teamStore, modalStore, calculatorStore, settingStore } = useStore()
  const { computedStats } = calculatorStore
  useCalculator({ min: true })

  const [order, setOrder] = useState<Order[]>([])
  const [actions, setActions] = useState([])

  useEffect(() => {
    if (_.some(computedStats)) {
      let av = 0
      const order: Order[] = []
      let spdOrder = _.orderBy(
        _.map(_.cloneDeep(computedStats), (item) => ({
          stats: item,
          av: 10000 / item?.getSpd(),
        })),
        'desc'
      )
      while (av < 650) {
        const first = _.head(_.orderBy(spdOrder, 'av', 'asc'))
        const avUsed = first.av
        av += avUsed
        spdOrder = _.map(spdOrder, (item) => ({
          ...item,
          av: item.av <= avUsed ? 10000 / first?.stats?.getSpd() : item.av - avUsed,
        }))
        order.push({ stats: _.cloneDeep(first.stats), av, sp: 3, energy: first.stats.MAX_ENERGY / 2 })
      }
      setOrder(order)
      setActions(Array(_.size(order)))
    }
  }, [computedStats])

  return (
    <div className="w-full customScrollbar">
      <div className="grid w-full grid-cols-3 gap-5 p-5 text-white max-w-[1200px] mx-auto">
        <div className="w-full col-span-2 text-xs font-normal rounded-lg bg-primary-darker">
          <div className="px-2 py-1 text-lg font-bold text-center rounded-t-lg bg-primary-light">
            <p>Turn Cycle</p>
            {/* <p className='text-xs font-normal text-gray'>Hover Numbers for More Details</p> */}
          </div>
          <div className="grid w-full grid-cols-12 gap-4 px-3 py-1 text-sm font-bold text-center text-white bg-primary-dark">
            <p className="col-span-2">Cycle</p>
            <p className="grid grid-cols-2 col-span-3 gap-4">
              <p>Name</p>
              <p>Current AV</p>
            </p>
            <p className="col-span-1">Energy</p>
            <p className="col-span-1">SP</p>
            <p className="col-span-2">AVG DMG</p>
          </div>
          {_.map(Array(6), (_item, cycle) => (
            <div className="grid w-full grid-cols-12 gap-4 px-3 py-2 text-white border-b border-primary-border">
              <div className="flex items-center justify-center col-span-2 text-base">Cycle {cycle}</div>
              <div className="grid items-center grid-cols-9 col-span-9 text-center gap-x-4 gap-y-2">
                {_.map(
                  _.filter(
                    order,
                    (item) => item.av <= 50 + 100 * (cycle + 1) && item.av > (cycle ? 50 : 0) + 100 * cycle
                  ),
                  (item) => (
                    <>
                      <div className="col-span-3 space-y-1">
                        <div className="grid grid-cols-2 gap-4">
                          <p>{item.stats.NAME}</p>
                          <p>{_.round(item.av, 1)}</p>
                        </div>
                      </div>
                      <div className="col-span-1">{item.energy}</div>
                      <div className="col-span-1">{item.sp}</div>
                      <div className="col-span-2"></div>
                    </>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
