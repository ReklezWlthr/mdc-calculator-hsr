import { toPercentage } from '@src/core/utils/data_format'
import { getMainStat, getNearestSpd, getRolls } from '@src/core/utils/data_format'
import { findArtifactSet } from '@src/core/utils/finder'
import { useStore } from '@src/data/providers/app_store_provider'
import { RelicPiece, StatIcons, Stats } from '@src/domain/constant'
import { RarityGauge } from '@src/presentation/components/rarity_gauge'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback, useMemo } from 'react'
import { ArtifactListModal, RelicSetterT } from '@src/presentation/hsr/components/modals/artifact_list_modal'
import classNames from 'classnames'

export const MiniRelicBlock = observer(
  ({
    aId,
    index,
    setRelic,
    type,
    charData,
  }: {
    aId: string
    index?: number
    setRelic?: RelicSetterT
    type: number
    charData?: { rec: Stats[] }
  }) => {
    const { artifactStore, modalStore } = useStore()

    const relic = _.find(artifactStore.artifacts, ['id', aId])
    const setData = findArtifactSet(relic?.setId)
    const pieceName = RelicPiece[relic?.type]

    const mainStat = getMainStat(relic?.main, relic?.quality, relic?.level)

    const subListWithRolls = useMemo(() => {
      const rolls = _.map(relic?.subList, (item) => _.sum(_.map(getRolls(item.stat, item.value))))
      const sum = _.sum(rolls)
      if (sum > 9) {
        const max = _.max(rolls)
        const index = _.findIndex(rolls, (item) => item === max)
        rolls[index] -= 1
      }
      return _.map(relic?.subList, (item, index) => ({ ...item, roll: rolls[index] }))
    }, [relic])

    const onOpenSwapModal = useCallback(() => {
      if (setRelic)
        modalStore.openModal(<ArtifactListModal index={index} type={type} setRelic={setRelic} charData={charData} />)
    }, [index, aId, setRelic, relic, type, charData])

    return (
      <div
        className={classNames('px-3 py-1.5 min-h-24 h-24 rounded-lg bg-primary-dark duration-200 text-white', {
          'hover:scale-[97%] hover:ring-2 ring-primary-light cursor-pointer': setRelic,
        })}
        onClick={onOpenSwapModal}
      >
        {aId ? (
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex flex-col items-center w-1/3 gap-1">
              <img src={`/asset/relic/piece/${setData?.id}_${(relic?.type - 1) % 4}.webp`} className="w-11 h-11" />
              <RarityGauge rarity={relic?.quality} textSize="text-xs" />
              <div className="flex items-center justify-between w-full gap-2 text-xs">
                <img
                  className="w-3.5"
                  src={`/icons/${StatIcons[relic?.main]}`}
                  onError={(e) => (e.currentTarget.src = `/icons/${StatIcons[relic?.main]}`)}
                />
                <p className="font-bold text-gray">
                  {_.includes([Stats.HP, Stats.ATK, Stats.SPD], relic?.main)
                    ? _.round(mainStat).toLocaleString()
                    : toPercentage(mainStat)}
                </p>
              </div>
              <div className="absolute flex items-center justify-center px-1.5 py-0.5 text-xs bg-opacity-75 rounded-full top-6 -right-2 bg-primary-light">
                +{relic?.level}
              </div>
            </div>
            <div className="grid w-7/12 grid-cols-1 gap-1">
              {_.map(subListWithRolls, (item) => (
                <div className="flex items-center w-full gap-1.5 text-xs" key={item.stat}>
                  <img className="w-3.5" src={`/icons/${StatIcons[item.stat]}`} />
                  {item.roll > 1 && (
                    <div
                      className={classNames(
                        _.includes(charData?.rec, item.stat) ? 'text-amber-300' : 'text-primary-lighter',
                      )}
                    >
                      {_.repeat('\u{2771}', item.roll - 1)}
                    </div>
                  )}
                  <hr className="w-full border border-primary-border" />
                  <p
                    className={classNames(
                      _.includes(charData?.rec, item.stat) ? 'text-amber-400 font-bold' : 'text-gray font-normal',
                    )}
                  >
                    {_.includes([Stats.HP, Stats.ATK, Stats.DEF, Stats.SPD], item.stat)
                      ? item.stat === Stats.SPD
                        ? _.round(getNearestSpd(item.value), 1).toLocaleString()
                        : _.round(item.value, 0).toLocaleString()
                      : toPercentage(item.value / 100)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray">No Relic</div>
        )}
      </div>
    )
  },
)
