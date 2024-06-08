import { useStore } from '@src/data/providers/app_store_provider'
import { ArtifactPiece, IArtifactEquip, Stats } from '@src/domain/constant'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback, useMemo } from 'react'
import { ArtifactModal } from './artifact_modal'
import { RarityGauge } from '@src/presentation/components/rarity_gauge'
import { getMainStat, getRolls } from '@src/core/utils/data_format'
import { toPercentage } from '@src/core/utils/converter'
import { StatIcons } from '../../../domain/constant'
import { findArtifactSet, findCharacter } from '@src/core/utils/finder'
import classNames from 'classnames'
import { CommonModal } from '@src/presentation/components/common_modal'
import { ArtifactListModal } from './artifact_list_modal'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

interface ArtifactBlockProps {
  index?: number
  piece: number
  aId: string
  showWearer?: boolean
  canEdit?: boolean
  override?: IArtifactEquip[]
}

const MenuButton = ({ icon, onClick, title }: { icon: string; onClick: () => void; title: string }) => {
  return (
    <i
      className={classNames(
        'flex items-center justify-center w-11 h-11 p-2 text-xl rounded-full opacity-0 translate-x-full group-hover:translate-x-0 cursor-pointer bg-primary-light hover:bg-primary group-hover:opacity-100',
        icon
      )}
      onClick={onClick}
      title={title}
    />
  )
}

export const ArtifactBlock = observer(({ canEdit = true, ...props }: ArtifactBlockProps) => {
  const pieceName = ArtifactPiece[props.piece]

  const { modalStore, teamStore, artifactStore, buildStore, settingStore, toastStore } = useStore()
  const artifact = _.find(props.override || artifactStore.artifacts, ['id', props.aId])
  const setData = findArtifactSet(artifact?.setId)

  const mainStat = getMainStat(artifact?.main, artifact?.quality, artifact?.level)

  const subListWithRolls = useMemo(() => {
    const rolls = _.map(artifact?.subList, (item) => getRolls(item.stat, item.value))
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
      buildStore.editBuild(item.id, { artifacts: _.without(item.artifacts, props.aId) })
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
  const codeName = charData?.codeName === 'Player' ? settingStore.settings.travelerGender : charData?.codeName

  return (
    <div
      className={classNames(
        'flex flex-col w-full font-bold text-white duration-200 rounded-lg bg-primary-dark h-[300px] group',
        {
          'hover:scale-[97%]': canEdit,
        }
      )}
    >
      <div className="h-10 overflow-hidden rounded-t-lg bg-primary-light shrink-0">
        <div
          className={classNames('px-5 py-2 space-y-5 duration-200', {
            'group-hover:-translate-y-1/2': canEdit && props.aId,
          })}
        >
          <div className="flex items-center justify-center gap-1">
            <img src={`${publicRuntimeConfig.BASE_PATH}/icons/${_.snakeCase(pieceName)}.png`} className="w-5 h-5" />
            <p>{pieceName}</p>
          </div>
          <div className="flex items-center justify-center gap-1">
            <p>Artifact Menu</p>
          </div>
        </div>
      </div>
      {props.aId ? (
        <div className="relative w-full">
          <div className="p-3 space-y-3">
            <div className="flex gap-4">
              <div className="relative w-16 h-16 shrink-0">
                <img src={`https://enka.network/ui/${setData?.icon}_${artifact?.type}.png`} className="w-full h-full" />
                <div className="absolute flex items-center justify-center px-1.5 py-0.5 text-xs bg-opacity-75 rounded-full -bottom-0 -right-2 bg-primary-light">
                  +{artifact?.level}
                </div>
                {charData?.codeName && props.showWearer && (
                  <div className="absolute flex items-center justify-center p-1 text-xs bg-opacity-75 rounded-full -top-1 w-7 h-7 -right-3 bg-primary-light">
                    <img
                      src={`https://enka.network/ui/UI_AvatarIcon_Side_${codeName}.png`}
                      className="absolute scale-125 bottom-1.5"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center w-full gap-1">
                <RarityGauge rarity={artifact?.quality} textSize="text-sm" />
                <p className="text-xs text-center">{setData?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 shrink-0">
                <img
                  className="w-4 h-4"
                  src={
                    StatIcons[artifact?.main]
                      ? `${publicRuntimeConfig.BASE_PATH}/icons/${StatIcons[artifact?.main]}`
                      : `https://cdn.wanderer.moe/genshin-impact/elements/${artifact?.main
                          ?.split(' ')?.[0]
                          ?.toLowerCase()}.png`
                  }
                />
                {artifact?.main}
              </div>
              <hr className="w-full border border-primary-border" />
              <p className="font-normal text-gray">
                {_.includes([Stats.HP, Stats.ATK, Stats.EM], artifact?.main)
                  ? _.round(mainStat).toLocaleString()
                  : toPercentage(mainStat)}
              </p>
            </div>
            <p className="flex items-center justify-center text-xs text-primary-lighter">✦✦✦✦✦</p>
            {_.map(subListWithRolls, (item) => (
              <div className="flex items-center gap-2 text-xs" key={item.stat}>
                <div className="flex items-center gap-1.5 shrink-0">
                  <img className="w-4 h-4" src={`${publicRuntimeConfig.BASE_PATH}/icons/${StatIcons[item.stat]}`} />
                  {item.stat}
                </div>
                <div className="text-primary-lighter">{_.repeat('\u{2771}', item.roll)}</div>
                <hr className="w-full border border-primary-border" />
                <p className="font-normal text-gray">
                  {_.includes([Stats.HP, Stats.ATK, Stats.DEF, Stats.EM], item.stat)
                    ? _.round(item.value).toLocaleString()
                    : toPercentage(item.value / 100)}
                </p>
              </div>
            ))}
          </div>
          {canEdit && (
            <div className="absolute flex flex-col gap-2 pr-2 pt-2 items-end top-0 w-full h-[260px] from-transparent group-hover:bg-opacity-80 bg-gradient-to-l group-hover:from-primary-darker duration-200 overflow-hidden">
              <MenuButton
                icon="fa-solid fa-pen-to-square duration-[200ms]"
                onClick={onOpenEditModal}
                title="Edit Artifact"
              />
              {props.index >= 0 && (
                <>
                  <MenuButton
                    icon="fa-solid fa-repeat duration-[250ms]"
                    onClick={onOpenSwapModal}
                    title="Swap Artifact"
                  />
                  <MenuButton
                    icon="fa-solid fa-arrow-right-from-bracket rotate-90 duration-[300ms]"
                    onClick={onOpenConfirmModal}
                    title="Unequip Artifact"
                  />
                </>
              )}
              <MenuButton
                icon={classNames('fa-solid fa-trash', props.index >= 0 ? 'duration-[350ms]' : 'duration-[250ms]')}
                onClick={onOpenDeleteModal}
                title="Delete Artifact"
              />
            </div>
          )}
        </div>
      ) : canEdit ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div
            className="flex items-center justify-center w-full h-full transition-colors duration-200 cursor-pointer hover:bg-primary-darker"
            onClick={onOpenEditModal}
          >
            Add New Artifact
          </div>
          <div className="w-full h-0 border-t-2 border-primary-border" />
          <div
            className="flex items-center justify-center w-full h-full transition-colors duration-200 cursor-pointer hover:bg-primary-darker"
            onClick={onOpenSwapModal}
          >
            Equip an Artifact
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full">None</div>
      )}
    </div>
  )
})
