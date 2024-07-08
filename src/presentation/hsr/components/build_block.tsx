import { formatIdIcon } from '@src/core/utils/data_format'
import { findCharacter } from '@src/core/utils/finder'
import { useStore } from '@src/data/providers/app_store_provider'
import { IBuild } from '@src/domain/constant'
import { CommonModal } from '@src/presentation/components/common_modal'
import { GhostButton } from '@src/presentation/components/ghost.button'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

interface BuildBlockProps {
  selected: boolean
  build: IBuild
  onClick: () => void
  onDelete: () => void
}

export const BuildBlock = observer(({ selected, build, onClick, onDelete }: BuildBlockProps) => {
  const { buildStore, modalStore, toastStore, settingStore } = useStore()

  const char = findCharacter(build.cId)

  const onOpenDefaultModal = useCallback(() => {
    modalStore.openModal(
      <CommonModal
        icon="fa-solid fa-star text-desc"
        title="Set Build as Default"
        desc="Are you sure you want to set this build as default? Default build will be automatically equipped when selecting a character."
        onConfirm={() => {
          buildStore.setDefault(build.id)
          toastStore.openNotification({
            title: 'Set Default Successfully',
            icon: 'fa-solid fa-circle-check',
            color: 'green',
          })
        }}
      />
    )
  }, [build.id])

  const onOpenConfirmModal = useCallback(() => {
    modalStore.openModal(
      <CommonModal
        icon="fa-solid fa-exclamation-circle text-red"
        title="Delete Build"
        desc="Are you sure you want to delete this build? Deleting build will NOT delete designated artifacts."
        onConfirm={() => {
          buildStore.deleteBuild(build.id)
          onDelete()
          toastStore.openNotification({
            title: 'Build Deleted Successfully',
            icon: 'fa-solid fa-circle-check',
            color: 'green',
          })
        }}
      />
    )
  }, [build.id])

  return (
    <div
      className="flex items-center w-full h-16 overflow-hidden text-white duration-200 rounded-lg cursor-pointer bg-primary-dark active:scale-95 shrink-0"
      onClick={onClick}
    >
      <div className="relative w-16 h-full overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 z-10 w-full h-full from-8% to-40% bg-gradient-to-l from-primary-dark to-transparent" />
        <img
          src={`https://api.hakush.in/hsr/UI/avatarshopicon/${formatIdIcon(
            build.cId,
            settingStore.settings?.travelerGender
          )}.webp`}
          className="object-cover h-16 aspect-[47/64] scale-[300%] mt-11 ml-1.5"
        />
      </div>
      <div className="w-full px-1 py-3">
        <div className="flex items-center gap-2">
          {build.isDefault && <i className="text-xs fa-solid fa-star text-yellow" title="Default Build" />}
          <p className="w-full line-clamp-1">{build.name}</p>
        </div>
        <p className="text-xs line-clamp-1 text-gray">Equipped By: {char?.name}</p>
      </div>
      <div className="flex items-center pr-4 gap-x-2 shrink-0">
        <PrimaryButton
          icon={classNames('fa-solid fa-star text-desc', { 'opacity-30': build.isDefault })}
          onClick={(event) => {
            event.stopPropagation()
            onOpenDefaultModal()
          }}
          disabled={build.isDefault}
        />
        <GhostButton
          icon="fa-solid fa-trash"
          onClick={(event) => {
            event.stopPropagation()
            onOpenConfirmModal()
          }}
        />
      </div>
    </div>
  )
})
