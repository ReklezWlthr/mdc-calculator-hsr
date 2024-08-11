import { observer } from 'mobx-react-lite'
import { TalentIcon } from '@src/presentation/hsr/components/tables/scaling_wrapper'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import _ from 'lodash'
import { TraceBlock } from '@src/presentation/hsr/components/trace_block'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { AscensionOptions, EidolonOptions, ITeamChar } from '@src/domain/constant'
import { findCharacter } from '@src/core/utils/finder'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import ConditionalsObject from '@src/data/lib/stats/conditionals/conditionals'
import { useStore } from '@src/data/providers/app_store_provider'
import { findBaseLevel, findMaxLevel, findMaxTalentLevel, formatIdIcon } from '@src/core/utils/data_format'
import { useCallback, useMemo } from 'react'
import { AbilityBlock } from '@src/presentation/hsr/components/ability_block'
import { BonusAbilityBlock } from '@src/presentation/hsr/components/bonus_ability_block'
import { CharacterModal } from '../modals/character_modal'
import { PillInput } from '@src/presentation/components/inputs/pill_input'

export const CompareTraceBlock = observer(({ char, team }: { char: ITeamChar; team: ITeamChar[][] }) => {
  const { setupStore, settingStore, modalStore } = useStore()

  const charData = findCharacter(char?.cId)
  const [setupIndex, charIndex] = setupStore.selected

  const talent = _.find(ConditionalsObject, ['id', char?.cId])?.conditionals(
    char?.cons,
    char?.major_traces,
    char?.talents,
    setupIndex === 0 ? setupStore.main.char : setupStore.comparing[setupIndex - 1]?.char
  )

  const levels = useMemo(
    () =>
      char?.ascension
        ? _.map(
            Array(findMaxLevel(char.ascension) - findBaseLevel(char.ascension) + 1 || 1).fill(
              findBaseLevel(char.ascension)
            ),
            (item, index) => ({
              name: _.toString(item + index),
              value: _.toString(item + index),
            })
          ).reverse()
        : [{ name: '1', value: '1' }],
    [char?.ascension]
  )

  const onOpenModal = useCallback(() => {
    modalStore.openModal(<CharacterModal index={charIndex} setChar={(_i, value) => setupStore.setComparing(value)} />)
  }, [modalStore])

  return (
    <div className="w-3/4 px-2 space-y-5">
      <div className="grid items-center justify-center grid-cols-2 gap-5 py-3">
        <p className="-mb-2 text-lg font-bold text-center text-white col-span-full">Character Details</p>
        <div className="flex items-center gap-2 col-span-full">
          <p className="text-sm font-semibold text-white">Name</p>
          <PillInput
            onClick={onOpenModal}
            value={charData?.name}
            onClear={() => setupStore.clearComparing()}
            disabled={char?.cId === setupStore.mainChar}
            placeholder="Select a Character"
          />
        </div>
        <div className="flex items-center w-full gap-2 col-span-full">
          <p className="text-sm font-semibold text-white">Level</p>
          <SelectInput
            onChange={(value) => setupStore.setComparing({ level: parseInt(value) || 0 })}
            options={levels}
            value={char?.level?.toString() || '1'}
            disabled={!char}
            style="w-full"
          />
          <SelectInput
            onChange={(value) => {
              const max = findMaxTalentLevel(parseInt(value))
              setupStore.setComparing({
                ascension: parseInt(value) || 0,
                level: findMaxLevel(parseInt(value) || 0),
                major_traces: {
                  a2: parseInt(value) < 2 ? false : char.major_traces?.a2,
                  a4: parseInt(value) < 4 ? false : char.major_traces?.a4,
                  a6: parseInt(value) < 6 ? false : char.major_traces?.a6,
                },
              })
              const t = char.talents
              _.forEach(char.talents, (item, key: 'basic' | 'skill' | 'ult' | 'talent') => {
                const m = key === 'basic' ? parseInt(value) || 1 : max
                if (item >= m) t[key] = m
              })
              setupStore.setComparing({ talents: t })
            }}
            options={AscensionOptions}
            value={char?.ascension?.toString() || '0'}
            disabled={!char}
            style="w-fit"
          />
          <SelectInput
            onChange={(value) => setupStore.setComparing({ cons: parseInt(value) || 0 })}
            options={EidolonOptions}
            value={char?.cons?.toString() || '0'}
            disabled={!char}
            style="w-fit"
          />
        </div>
        {char && (
          <>
            <p className="-mb-2 text-lg font-bold text-center text-white col-span-full">Traces</p>
            <AbilityBlock
              char={char}
              talents={talent?.talents}
              upgrade={talent?.upgrade}
              onChange={(key, value) => setupStore.setComparing({ talents: { ...char?.talents, [key]: value } })}
            />
            <p className="-mb-2 font-bold text-center text-white col-span-full">Ascension Passives</p>
            <BonusAbilityBlock
              char={char}
              talents={talent?.talents}
              onChange={(key) =>
                setupStore.setComparing({
                  major_traces: { ...char?.major_traces, [key]: !char?.major_traces[key] },
                })
              }
            />
            <div className="col-span-full">
              <TraceBlock
                id={char?.cId}
                data={char?.minor_traces}
                onClick={(i) => {
                  char.minor_traces[i].toggled = !char?.minor_traces[i].toggled
                  setupStore.setComparing(char)
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
})
