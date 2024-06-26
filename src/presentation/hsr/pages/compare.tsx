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
import { TeamModal } from '../components/team_modal'

export const ComparePage = observer(() => {
  const { teamStore, modalStore, calculatorStore, setupStore } = useStore()
  const { computedStats } = calculatorStore

  const { mainComputed } = useCalculator()

  const onOpenSaveModal = useCallback(() => {
    modalStore.openModal(<TeamModal />)
  }, [])

  return (
    <div className="w-full customScrollbar">
      <div className="grid w-full grid-cols-4 gap-5 p-5 text-white max-w-[1240px] mx-auto">
        <div className="space-y-1">
          <p className="font-bold">Select Main Setup</p>
          <div className="flex items-center justify-center w-full gap-3 pt-1">
            {_.map(Array(4), (item, index) => {
              const main = setupStore.findTeam(setupStore.main)?.char
              if (main)
                return (
                  <CharacterSelect
                    key={`char_select_${index}`}
                    onClick={() => setupStore.setValue('mainChar', main[index].cId)}
                    isSelected={main[index].cId === setupStore.mainChar}
                    id={main[index].cId}
                  />
                )
              else
                return (
                  <div className="relative w-12 h-12 overflow-hidden duration-200 rounded-full bg-primary shrink-0" />
                )
            })}
            <PrimaryButton icon="fa-solid fa-repeat" onClick={onOpenSaveModal} />
          </div>
          {setupStore.main && !setupStore.mainChar && <p className="text-xs text-red">Select A Character to Compare</p>}
        </div>
      </div>
    </div>
  )
})
