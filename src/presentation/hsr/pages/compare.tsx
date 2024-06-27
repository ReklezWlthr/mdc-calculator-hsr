import { useCalculator } from '@src/core/hooks/useCalculator'
import { StatsObject } from '@src/data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import { TalentType } from '@src/domain/constant'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useState } from 'react'
import { CharacterSelect } from '../components/character_select'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { TeamModal, TeamModalProps } from '../components/team_modal'
import { TSetup } from '@src/data/stores/setup_store'
import { CommonModal } from '@src/presentation/components/common_modal'
import { findCharacter } from '@src/core/utils/finder'

export const ComparePage = observer(() => {
  const { modalStore, setupStore } = useStore()

  const { finalStats } = useCalculator({ teamOverride: setupStore.main?.char, doNotSaveStats: true })

  const onOpenSaveModal = useCallback((props: TeamModalProps) => {
    modalStore.openModal(<TeamModal {...props} />)
  }, [])

  return (
    <div className="w-full customScrollbar">
      <div className="grid w-full grid-cols-3 gap-5 p-5 text-white max-w-[1240px] mx-auto">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <p className="font-bold">Main Setup</p>
            {setupStore.main && !setupStore.mainChar && (
              <p className="text-xs text-red">Select A Character to Compare</p>
            )}
            {setupStore.main && setupStore.mainChar && (
              <p className="text-xs text-gray">Comparing: {findCharacter(setupStore.mainChar)?.name}</p>
            )}
          </div>
          <div className="flex items-center w-full gap-3 pt-1">
            {_.map(Array(4), (_item, index) => {
              const main = setupStore.main?.char
              if (main)
                return (
                  <CharacterSelect
                    key={`char_select_${index}`}
                    onClick={() => {
                      if (
                        _.every(setupStore.comparing, 'name') &&
                        main[index].cId !== setupStore.mainChar &&
                        setupStore.mainChar
                      )
                        modalStore.openModal(
                          <CommonModal
                            icon="fa-solid fa-question-circle text-hsr-imaginary"
                            title="Comparing Session Exists"
                            desc={`Do you want to change who to compare?\nConfirming to this will reset teams you are comparing to.`}
                            onConfirm={() => setupStore.setValue('mainChar', main[index].cId)}
                          />
                        )
                      else setupStore.setValue('mainChar', main[index].cId)
                    }}
                    isSelected={main[index].cId === setupStore.mainChar}
                    id={main[index].cId}
                  />
                )
              else
                return (
                  <div
                    key={index}
                    className="relative w-12 h-12 overflow-hidden duration-200 rounded-full bg-primary shrink-0"
                  />
                )
            })}
            <PrimaryButton
              icon="fa-solid fa-repeat"
              onClick={() => onOpenSaveModal({ onSelect: (team) => setupStore.setValue('main', team) })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <p>Comparing To</p>
          <div className="flex gap-2">
            {_.map(setupStore.comparing, (_item, tI) => (
              <div className="space-y-1" key={tI}>
                <div
                  className="flex gap-3 px-2 py-2 duration-200 rounded-lg cursor-pointer bg-primary-dark hover:ring-2 hover:ring-primary-light hover:ring-inset"
                  key={tI}
                  onClick={() =>
                    onOpenSaveModal({
                      onSelect: (team) => {
                        setupStore.comparing.splice(tI, 1, team)
                        setupStore.setValue('comparing', setupStore.comparing)
                      },
                      filterId: setupStore.mainChar,
                    })
                  }
                >
                  {_.map(Array(4), (_item, index) => {
                    const team = setupStore.comparing?.[tI]?.char
                    if (team)
                      return (
                        <CharacterSelect
                          key={`char_select_${index}`}
                          isSelected={team[index].cId === setupStore.mainChar}
                          id={team[index].cId}
                        />
                      )
                    else
                      return (
                        <div
                          key={index}
                          className="relative w-12 h-12 overflow-hidden duration-200 rounded-full bg-primary shrink-0"
                        />
                      )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})
