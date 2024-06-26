import { useStore } from '@src/data/providers/app_store_provider'
import { GhostButton } from '@src/presentation/components/ghost.button'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback, useMemo, useState } from 'react'
import { CharacterSelect } from './character_select'

export const TeamModal = observer(() => {
  const { modalStore, teamStore, setupStore, toastStore } = useStore()

  return (
    <div className="px-5 py-3 space-y-3 text-white rounded-lg bg-primary-dark w-[400px]">
      <p className="font-semibold">Choose A Team</p>
      <div className="space-y-2 dropdownScrollbar max-h-[70vh]">
        {_.map(setupStore.team, (team) => {
          return (
            <div
              className="flex justify-between w-full px-3 py-2 text-white rounded-lg bg-primary-darker"
              key={team.id}
            >
              <div className="w-full space-y-2">
                <p className="w-full truncate">{team.name}</p>
                <div className="flex gap-2">
                  {_.map(team.char, (item, index) => (
                    <CharacterSelect key={`char_select_${index}_${team.id}`} isSelected={false} id={item.cId} />
                  ))}
                </div>
              </div>
              <div className="flex gap-x-2">
                <PrimaryButton
                  title="Select"
                  onClick={() => {
                    setupStore.setValue('main', team.id)
                    modalStore.closeModal()
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
