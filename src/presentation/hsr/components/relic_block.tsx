import { useStore } from '@src/data/providers/app_store_provider'
import { RelicPiece, RelicPieceIcon, IArtifactEquip, Stats } from '@src/domain/constant'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback, useMemo } from 'react'
import { ArtifactModal } from '@src/presentation/hsr/components/modals/artifact_modal'
import { RarityGauge } from '@src/presentation/components/rarity_gauge'
import { getMainStat, getNearestSpd, getRolls } from '@src/core/utils/data_format'
import { toPercentage } from '@src/core/utils/converter'
import { StatIcons } from '../../../domain/constant'
import { findArtifactSet, findCharacter } from '@src/core/utils/finder'
import classNames from 'classnames'
import { CommonModal } from '@src/presentation/components/common_modal'
import { ArtifactListModal } from '@src/presentation/hsr/components/modals/artifact_list_modal'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

interface RelicBlockProps {
  index?: number
  piece: number
  aId: string
  showWearer?: boolean
  canEdit?: boolean
  override?: IArtifactEquip[]
}

const MenuButton = ({
  icon,
  onClick,
  title,
  duration,
}: {
  icon: string
  onClick: () => void
  title: string
  duration: string
}) => {
  return (
    <div
      className={classNames(
        'flex items-center gap-1.5 translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
        duration
      )}
    >
      <p className="text-xs">{title}</p>
      <i
        className={classNames(
          'flex items-center justify-center w-10 h-10 p-2 text-lg rounded-full bg-primary-light hover:bg-primary cursor-pointer duration-200',
          icon
        )}
        onClick={onClick}
      />
    </div>
  )
}

export const RelicBlock = observer(({ canEdit = true, ...props }: RelicBlockProps) => {
  const pieceName = RelicPiece[props.piece]

  const { modalStore, teamStore, artifactStore, buildStore, settingStore, toastStore } = useStore()
  const artifact = _.find(props.override || artifactStore.artifacts, ['id', props.aId])
  const setData = findArtifactSet(artifact?.setId)

  const mainStat = getMainStat(artifact?.main, artifact?.quality, artifact?.level)

  const subListWithRolls = useMemo(() => {
    const rolls = _.map(artifact?.subList, (item) => _.sum(_.map(getRolls(item.stat, item.value))))
    const sum = _.sum(rolls)
    if (sum > 9) {
      const max = _.max(rolls)
      const index = _.findIndex(rolls, (item) => item === max)
      rolls[index] -= 1
    }
    return _.map(artifact?.subList, (item, index) => ({ ...item, roll: rolls[index] }))
  }, [artifact])

  const onUnEquip = useCallback(() => {
    const oldType = _.find(artifactStore.artifacts, ['id', props.aId])?.type
    teamStore.setArtifact(props.index, oldType, null)
  }, [props.index, props.aId])

  const onOpenEditModal = useCallback(() => {
    modalStore.openModal(<ArtifactModal type={props.piece} index={props.index} aId={props.aId} />)
  }, [modalStore, props.index, props.aId])

  const onOpenSwapModal = useCallback(() => {
    modalStore.openModal(<ArtifactListModal index={props.index} type={props.piece} />)
  }, [props.index, props.aId])

  const onOpenConfirmModal = useCallback(() => {
    modalStore.openModal(
      <CommonModal
        icon="fa-solid fa-question-circle text-yellow"
        title="Unequip Artifact"
        desc="Do you want to unequip this artifact?"
        onConfirm={onUnEquip}
      />
    )
  }, [props.index, props.aId])

  const onDelete = useCallback(() => {
    const oldType = _.find(artifactStore.artifacts, ['id', props.aId])?.type
    artifactStore.deleteArtifact(props.aId)
    modalStore.closeModal()
    toastStore.openNotification({
      title: 'Artifact Deleted Successfully',
      icon: 'fa-solid fa-circle-check',
      color: 'green',
    })
    const char = _.findIndex(teamStore.characters, (item) => _.includes(item.equipments?.artifacts, props.aId))
    const build = _.filter(buildStore.builds, (item) => _.includes(item.artifacts, props.aId))
    if (char >= 0) {
      teamStore.setArtifact(char, oldType, null)
    }
    _.forEach(build, (item) => {
      const i = _.findIndex(item.artifacts, (a) => a === props.aId)
      const newArr = _.cloneDeep(item.artifacts)
      newArr.splice(i, 1, null)
      buildStore.editBuild(item.id, { artifacts: newArr })
    })
  }, [artifactStore.artifacts, teamStore.characters, buildStore.builds, props.aId])

  const onOpenDeleteModal = useCallback(() => {
    modalStore.openModal(
      <CommonModal
        icon="fa-solid fa-exclamation-circle text-red"
        title="Delete Artifact"
        desc="Do you want to delete this artifact? This will also remove and unequip this artifact in every build that uses it."
        onConfirm={onDelete}
      />
    )
  }, [props.index, props.aId])

  const wearer = _.find(teamStore.characters, (item) => _.includes(item.equipments.artifacts, props.aId))
  const charData = findCharacter(wearer?.cId)

  return (
    <div
      className={classNames(
        'flex flex-col w-full font-bold text-white duration-200 rounded-lg bg-primary-dark h-[250px] group ring-inset ring-1 ring-primary-light relative',
        {
          'hover:scale-[97%]': canEdit,
        }
      )}
    >
      <div className="absolute top-0 right-0 flex items-center justify-center h-8 pointer-events-none w-9 rounded-se-lg rounded-es-lg bg-primary-light">
        <img
          src={`https://api.hakush.in/hsr/UI/relicfigures/IconRelic${RelicPieceIcon[props.piece]}.webp`}
          className="w-5 h-5"
        />
      </div>
      {props.aId ? (
        <div className="relative w-full">
          <div className="px-3 py-4 space-y-3">
            <div className="flex gap-4">
              <div className="relative w-14 h-14 shrink-0">
                <img
                  src={`https://api.hakush.in/hsr/UI/relicfigures/IconRelic_${setData?.id}_${artifact?.type}.webp`}
                  className="w-full h-full"
                />
                <div className="absolute flex items-center justify-center px-1.5 py-0.5 text-xs bg-opacity-75 rounded-full -bottom-0 -right-2 bg-primary-light">
                  +{artifact?.level}
                </div>
              </div>
              <div className="flex flex-col items-center w-full gap-1">
                <RarityGauge rarity={artifact?.quality} textSize="text-sm" />
                <p className="text-xs text-center line-clamp-2">
                  {setData?.set[artifact?.type - (artifact?.type >= 5 ? 5 : 1)]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 shrink-0">
                <img
                  className="w-3.5"
                  src={`https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/${StatIcons[artifact?.main]}`}
                  onError={(e) => (e.currentTarget.src = `/icons/${StatIcons[artifact?.main]}`)}
                />
                {artifact?.main}
              </div>
              <hr className="w-full border border-primary-border" />
              <p className="font-normal text-gray">
                {_.includes([Stats.HP, Stats.ATK, Stats.SPD], artifact?.main)
                  ? _.round(mainStat).toLocaleString()
                  : toPercentage(mainStat)}
              </p>
            </div>
            <div className="border-t-2 border-dashed border-primary-light !my-4 opacity-40" />
            {_.map(subListWithRolls, (item) => (
              <div className="flex items-center gap-2 text-xs" key={item.stat}>
                <div className="flex items-center gap-1.5 shrink-0">
                  <img
                    className="w-3.5"
                    src={`https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/${StatIcons[item.stat]}`}
                  />
                  {item.stat}
                </div>
                <div className="text-primary-lighter">{_.repeat('\u{2771}', item.roll)}</div>
                <hr className="w-full border border-primary-border" />
                <p className="font-normal text-gray">
                  {_.includes([Stats.HP, Stats.ATK, Stats.DEF, Stats.SPD], item.stat)
                    ? item.stat === Stats.SPD
                      ? _.round(getNearestSpd(item.value), 1).toLocaleString()
                      : _.round(item.value, 0).toLocaleString()
                    : toPercentage(item.value / 100)}
                </p>
              </div>
            ))}
          </div>
          {canEdit && (
            <div className="absolute flex flex-col gap-2 pr-2 pt-2 items-end top-px left-px w-[calc(100%-2px)] h-[248px] rounded-lg from-transparent group-hover:bg-opacity-80 bg-gradient-to-l group-hover:from-primary-darker from-30% duration-200 overflow-hidden">
              <MenuButton
                icon="fa-solid fa-pen-to-square"
                duration="duration-[200ms]"
                onClick={onOpenEditModal}
                title="Edit"
              />
              {props.index >= 0 && (
                <>
                  <MenuButton
                    icon="fa-solid fa-repeat"
                    duration="duration-[250ms]"
                    onClick={onOpenSwapModal}
                    title="Swap"
                  />
                  <MenuButton
                    icon="fa-solid fa-arrow-right-from-bracket rotate-90"
                    duration="duration-[300ms]"
                    onClick={onOpenConfirmModal}
                    title="Unequip"
                  />
                </>
              )}
              <MenuButton
                icon="fa-solid fa-trash"
                duration={props.index >= 0 ? 'duration-[350ms]' : 'duration-[250ms]'}
                onClick={onOpenDeleteModal}
                title="Delete"
              />
            </div>
          )}
        </div>
      ) : canEdit ? (
        <div className="flex flex-col items-center justify-center w-full h-full p-px">
          <div
            className="flex items-center justify-center w-full h-full transition-colors duration-200 rounded-t-lg cursor-pointer hover:bg-primary-darker"
            onClick={onOpenEditModal}
          >
            Add New Relic
          </div>
          <div className="w-full h-0 border-t-2 border-primary" />
          <div
            className="flex items-center justify-center w-full h-full transition-colors duration-200 rounded-b-lg cursor-pointer hover:bg-primary-darker"
            onClick={onOpenSwapModal}
          >
            Equip a Relic
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full">None</div>
      )}
    </div>
  )
})
