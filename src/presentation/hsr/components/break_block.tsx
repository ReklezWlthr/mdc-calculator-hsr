import { Enemies } from '@src/data/db/enemies'
import { StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import { BreakDebuffType, Element, StatIcons, Stats } from '@src/domain/constant'
import { BreakBaseLevel, BreakElementMult } from '@src/domain/scaling'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { ElementColor } from './tables/scaling_sub_rows'
import { toPercentage } from '@src/core/utils/data_format'
import { Tooltip } from '@src/presentation/components/tooltip'
import { breakDamageStringConstruct } from '@src/core/utils/constructor/breakDamageStringConstruct'

export const BreakBlock = observer(({ stats, index }: { stats: StatsObject; index: number }) => {
  const { teamStore, calculatorStore } = useStore()

  const {
    string: { breakString, debuffString },
    number: { delay, final, finalDebuff, prob },
  } = breakDamageStringConstruct(calculatorStore, calculatorStore.globalMod, stats, teamStore.characters[index]?.level)

  return (
    <div className="flex flex-col mb-5 text-sm rounded-lg bg-primary-darker h-fit">
      <div className="px-2 py-1 text-lg font-bold text-center rounded-t-lg bg-primary-light">
        <p>Break DMG</p>
      </div>
      <div className="grid w-full grid-cols-12 gap-2 py-0.5 pr-2 text-sm font-bold text-center bg-primary-dark">
        <p className="col-span-2">Element</p>
        <p className="col-span-2">Debuff Type</p>
        <p className="col-span-2">Break DMG</p>
        <p className="col-span-3">{BreakDebuffType[stats?.ELEMENT]} DMG</p>
        <p className="col-span-2">Action Delay</p>
        <p className="col-span-1">Prob.</p>
      </div>
      <div className="grid w-full grid-cols-12 gap-2 py-0.5 pr-2 text-sm text-center">
        <p className={classNames('col-span-2 font-bold', ElementColor[stats?.ELEMENT])}>{stats?.ELEMENT}</p>
        <p className={classNames('col-span-2', ElementColor[stats?.ELEMENT])}>{BreakDebuffType[stats?.ELEMENT]}</p>
        <p className="col-span-2 font-bold">
          <Tooltip
            title={`${stats?.ELEMENT} Break DMG`}
            body={<p dangerouslySetInnerHTML={{ __html: breakString }} />}
            style="text-start font-normal w-[400px]"
          >
            <p className="text-red">{_.round(final).toLocaleString()}</p>
          </Tooltip>
        </p>
        <p className="col-span-3 font-bold">
          {stats?.ELEMENT === Element.IMAGINARY ? (
            <p className="font-normal text-gray">-</p>
          ) : (
            <Tooltip
              title={`${BreakDebuffType[stats?.ELEMENT]} DMG`}
              body={
                <p
                  dangerouslySetInnerHTML={{
                    __html: debuffString,
                  }}
                />
              }
              style="text-start font-normal w-[400px]"
            >
              <p className="text-red">{_.round(finalDebuff).toLocaleString()}</p>
            </Tooltip>
          )}
        </p>
        <p className="col-span-2">
          {stats?.ELEMENT === Element.ICE ? (
            <>
              <span>25%</span>
              <span className="ml-1 text-hsr-ice">(+50%)</span>
            </>
          ) : (
            toPercentage(0.25 + delay)
          )}
        </p>
        <p
          className={classNames(
            'text-center truncate',
            prob <= 0.6 ? 'text-red' : prob <= 0.8 ? 'text-desc' : 'text-heal',
          )}
        >
          {toPercentage(prob)}
        </p>
      </div>
    </div>
  )
})
