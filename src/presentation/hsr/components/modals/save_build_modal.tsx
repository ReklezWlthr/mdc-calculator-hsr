import { useStore } from '@src/data/providers/app_store_provider'
import { GhostButton } from '@src/presentation/components/ghost.button'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback, useMemo, useState } from 'react'

export const SaveBuildModal = observer(({ index }: { index: number }) => {
  const [name, setName] = useState('')
  const [isDefault, setDefault] = useState(true)

  const { modalStore, teamStore, buildStore, toastStore } = useStore()

  const char = teamStore.characters[index]
  const filteredBuilds = useMemo(
    () =>
      _.orderBy(
        _.filter(buildStore.builds, (build) => build.cId === char?.cId),
        'isDefault',
        'desc'
      ),
    [buildStore.builds, char]
  )

  const onSaveBuild = useCallback(() => {
    const id = crypto.randomUUID()

    if (name) {
      const pass = buildStore.saveBuild({
        id,
        name,
        cId: char?.cId,
        isDefault: false,
        ...char?.equipments,
      })
      if (pass) {
        isDefault && buildStore.setDefault(id)
        modalStore.closeModal()
        toastStore.openNotification({
          title: 'Build Saved Successfully',
          icon: 'fa-solid fa-circle-check',
          color: 'green',
        })
      }
    }
  }, [index, name])

  return (
    <div className="space-y-4">
      <div className="px-5 py-3 space-y-3 text-white rounded-lg bg-primary-dark w-[350px]">
        <div className="space-y-1">
          <p className="font-semibold">
            Create New Build <span className="text-red">*</span>
          </p>
          <TextInput onChange={setName} value={name} placeholder="Enter Build Name" />
        </div>
        <div className="flex items-center justify-end gap-x-2">
          <p className="text-xs text-gray">Set Build as Default</p>
          <CheckboxInput checked={isDefault} onClick={(v) => setDefault(v)} />
        </div>
        <div className="flex justify-end gap-2">
          <GhostButton title="Cancel" onClick={() => modalStore.closeModal()} />
          <PrimaryButton title="Confirm" onClick={onSaveBuild} />
        </div>
      </div>
      {_.size(filteredBuilds) > 0 && (
        <div className="px-5 py-3 space-y-3 text-white rounded-lg bg-primary-dark w-[350px]">
          <p className="font-semibold">Or Update An Existing Build</p>
          <div className="space-y-2 dropdownScrollbar max-h-[30vh]">
            {_.map(filteredBuilds, (build) => {
              return (
                <div
                  className="flex justify-between w-full px-3 py-2 text-white rounded-lg bg-primary-darker"
                  key={build.id}
                >
                  <div className="flex items-center w-full gap-2">
                    {build.isDefault && <i className="text-xs fa-solid fa-star text-yellow" title="Default Build" />}
                    <p className="w-full font-bold truncate">{build.name}</p>
                  </div>
                  <div className="flex gap-x-2">
                    <PrimaryButton
                      title="Update"
                      onClick={() => {
                        buildStore.editBuild(build.id, char?.equipments)
                        toastStore.openNotification({
                          title: 'Update Build Successfully',
                          icon: 'fa-solid fa-circle-check',
                          color: 'green',
                        })
                        modalStore.closeModal()
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
})
