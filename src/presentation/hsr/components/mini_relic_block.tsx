import { toPercentage } from '@src/core/utils/converter'
import { getMainStat, getRolls } from '@src/core/utils/data_format'
import { findArtifactSet } from '@src/core/utils/finder'
import { useStore } from '@src/data/providers/app_store_provider'
import { RelicPiece, RelicPieceIcon, StatIcons, Stats } from '@src/domain/constant'
import { RarityGauge } from '@src/presentation/components/rarity_gauge'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback, useMemo } from 'react'
import { ArtifactListModal, RelicSetterT } from './artifact_list_modal'

export const MiniRelicBlock = observer(
  ({ aId, index, setRelic, type }: { aId: string; index: number; setRelic: RelicSetterT, type: number }) => {
    const { artifactStore, modalStore } = useStore()

    const relic = _.find(artifactStore.artifacts, ['id', aId])
    const setData = findArtifactSet(relic?.setId)
    const pieceName = RelicPiece[relic?.type]

    const mainStat = getMainStat(relic?.main, relic?.quality, relic?.level)

    const subListWithRolls = useMemo(() => {
      const rolls = _.map(relic?.subList, (item) => getRolls(item.stat, item.value))
      const sum = _.sum(rolls)
      if (sum > 9) {
        const max = _.max(rolls)
        const index = _.findIndex(rolls, (item) => item === max)
        rolls[index] -= 1
      }
      return _.map(relic?.subList, (item, index) => ({ ...item, roll: rolls[index] }))
    }, [relic])

    const onOpenSwapModal = useCallback(() => {
      console.log(relic?.type)
      modalStore.openModal(<ArtifactListModal index={index} type={type} setRelic={setRelic} />)
    }, [index, aId, setRelic, relic, type])

    return (
      <div
        className="px-3 py-1.5 min-h-24 rounded-lg bg-primary-dark cursor-pointer hover:scale-[97%] duration-200 hover:ring-2 ring-primary-light"
        onClick={onOpenSwapModal}
      >
        {aId ? (
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex flex-col items-center w-1/3 gap-1">
              <img
                src={`https://api.hakush.in/hsr/UI/relicfigures/IconRelic_${setData?.id}_${relic?.type}.webp`}
                className="w-11 h-11"
              />
              <RarityGauge rarity={relic?.quality} textSize="text-xs" />
              <div className="flex items-center justify-between w-full gap-2 text-xs">
                <img
                  className="w-3.5"
                  src={`https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/${StatIcons[relic?.main]}`}
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
                  <img
                    className="w-3.5"
                    src={`https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/${StatIcons[item.stat]}`}
                  />
                  <div className="text-primary-lighter">{_.repeat('\u{2771}', item.roll)}</div>
                  <hr className="w-full border border-primary-border" />
                  <p className="font-normal text-gray">
                    {_.includes([Stats.HP, Stats.ATK, Stats.DEF, Stats.SPD], item.stat)
                      ? _.round(item.value, item.stat === Stats.SPD ? 1 : 0).toLocaleString()
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
  }
)
