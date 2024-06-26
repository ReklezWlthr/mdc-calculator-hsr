import { useStore } from '@src/data/providers/app_store_provider'
import { GhostButton } from '@src/presentation/components/ghost.button'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback, useMemo, useState } from 'react'

export const SaveTeamModal = observer(() => {
  const [name, setName] = useState('')

  const { modalStore, teamStore, setupStore, toastStore } = useStore()

  const onSaveBuild = useCallback(() => {
    const id = crypto.randomUUID()

    if (name) {
      const pass = setupStore.saveTeam({
        id,
        name,
        char: _.cloneDeep(teamStore.characters),
      })
      if (pass) {
        modalStore.closeModal()
        toastStore.openNotification({
          title: 'Team Saved Successfully',
          icon: 'fa-solid fa-circle-check',
          color: 'green',
        })
      }
    }
  }, [name])

  return (
    <div className="space-y-4">
      <div className="px-5 py-3 space-y-3 text-white rounded-lg bg-primary-dark w-[350px]">
        <div className="space-y-1">
          <p className="font-semibold">
            Create New Team <span className="text-red">*</span>
          </p>
          <TextInput onChange={setName} value={name} placeholder="Enter Team Name" />
        </div>
        <div className="flex justify-end gap-2">
          <GhostButton title="Cancel" onClick={() => modalStore.closeModal()} />
          <PrimaryButton title="Confirm" onClick={onSaveBuild} />
        </div>
      </div>
      {_.size(setupStore.team) > 0 && (
        <div className="px-5 py-3 space-y-3 text-white rounded-lg bg-primary-dark w-[350px]">
          <p className="font-semibold">Or Update An Existing Team</p>
          <div className="space-y-2 dropdownScrollbar max-h-[30vh]">
            {_.map(setupStore.team, (team) => {
              return (
                <div
                  className="flex justify-between w-full px-3 py-2 text-white rounded-lg bg-primary-darker"
                  key={team.id}
                >
                  <div className="flex items-center w-full gap-2">
                    <p className="w-full truncate">{team.name}</p>
                  </div>
                  <div className="flex gap-x-2">
                    <PrimaryButton
                      title="Update"
                      onClick={() => {
                        setupStore.editTeam(team.id, { char: _.cloneDeep(teamStore.characters) })
                        toastStore.openNotification({
                          title: 'Update Team Successfully',
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
