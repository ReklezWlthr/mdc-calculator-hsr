import { useStore } from '@src/data/providers/app_store_provider'
import { GhostButton } from '@src/presentation/components/ghost.button'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'

export const EditBuildModal = observer(({ id, oldName }: { id: string; oldName: string }) => {
  const [name, setName] = useState(oldName)

  const { modalStore, buildStore, toastStore } = useStore()

  const onSaveBuild = useCallback(() => {
    if (name) {
      const pass = buildStore.editBuild(id, { name })

      if (pass) {
        modalStore.closeModal()
        toastStore.openNotification({
          title: 'Build Saved Successfully',
          icon: 'fa-solid fa-circle-check',
          color: 'green',
        })
      }
    }
  }, [name])

  return (
    <div className="space-y-4">
      <div className="px-5 py-3 space-y-3 text-white rounded-lg bg-primary-dark w-[410px]">
        <div className="space-y-1">
          <p className="font-semibold">
            Edit Build Name <span className="text-red">*</span>
          </p>
          <TextInput onChange={setName} value={name} placeholder="Enter Build Name" />
        </div>
        <div className="flex justify-end gap-2">
          <GhostButton title="Cancel" onClick={() => modalStore.closeModal()} />
          <PrimaryButton title="Confirm" onClick={onSaveBuild} disabled={!name} />
        </div>
      </div>
    </div>
  )
})
