import { useStore } from '@src/data/providers/app_store_provider'
import { useCallback, useMemo } from 'react'
import { CharacterModal } from '@src/presentation/hsr/components/modals/character_modal'
import { observer } from 'mobx-react-lite'
import { PillInput } from '@src/presentation/components/inputs/pill_input'
import { AscensionOptions, EidolonOptions, ITeamChar } from '@src/domain/constant'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { findBaseLevel, findMaxTalentLevel, formatIdIcon } from '@src/core/utils/data_format'
import _ from 'lodash'
import { findMaxLevel } from '../../../core/utils/data_format'
import classNames from 'classnames'
import { RarityGauge } from '@src/presentation/components/rarity_gauge'
import { DefaultCharacter } from '@src/data/stores/team_store'
import { findCharacter } from '@src/core/utils/finder'
import { getElementImage, getPathImage } from '@src/core/utils/fetcher'

interface CharacterBlockProps {
  index: number
  override?: ITeamChar[]
  disabled?: boolean
}

export const CharacterBlock = observer((props: CharacterBlockProps) => {
  const { modalStore, teamStore, settingStore } = useStore()
  const selectedChar = props.override?.[props.index] || teamStore.characters[props.index]
  const ascension = selectedChar?.ascension || 0
  const level = selectedChar?.level || 1
  const cons = selectedChar?.cons || 0

  const characterData = findCharacter(selectedChar?.cId)
  const rarity = characterData?.rarity

  const isEmpty = !characterData

  const levels = useMemo(
    () =>
      _.map(
        Array(findMaxLevel(ascension) - findBaseLevel(ascension) + 1 || 1).fill(findBaseLevel(ascension)),
        (item, index) => ({
          name: _.toString(item + index),
          value: _.toString(item + index),
        })
      ).reverse(),
    [ascension]
  )

  const onOpenModal = useCallback(() => {
    modalStore.openModal(<CharacterModal index={props.index} />)
  }, [modalStore, props.index])

  return (
    <div className="w-full font-bold text-white rounded-lg bg-primary-dark">
      <div className="flex justify-center px-5 py-2 text-xl rounded-t-lg bg-primary-lighter">Character</div>
      <div className="grid grid-cols-5 gap-2 p-3">
        <div
          className="relative h-[136px] duration-200 border rounded-lg cursor-pointer bg-primary-darker border-primary-border aspect-square hover:border-primary-light col-span-2"
          onClick={onOpenModal}
        >
          {characterData && (
            <>
              <img
                src={`/asset/avatar/portrait//${formatIdIcon(
                  characterData?.id,
                  settingStore.settings?.travelerGender
                )}.webp`}
                className="object-cover aspect-square object-[0_20%]"
              />
              <div className="flex gap-0.5 absolute bottom-1 left-1">
                <div
                  className="flex items-center justify-center w-8 h-8 p-1 bg-opacity-75 rounded-full bg-primary-darker"
                  title={characterData?.path}
                >
                  <img src={getPathImage(characterData?.path)} />
                </div>
              </div>
              <div className="absolute px-1.5 py-0.5 rounded-lg bottom-1 right-1 bg-primary-darker">
                <RarityGauge rarity={rarity} textSize="text-xs" />
              </div>
              <div className="flex gap-0.5 absolute bottom-10 left-1">
                <div
                  className="flex items-center justify-center w-8 h-8 p-1.5 rounded-full bg-primary-darker bg-opacity-75"
                  title={characterData?.element}
                >
                  <img src={getElementImage(characterData?.element)} />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="col-span-3 space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Name</p>
            <PillInput
              onClick={onOpenModal}
              value={characterData?.name}
              onClear={() => teamStore.setMember(props.index, DefaultCharacter)}
              disabled={props.disabled}
              placeholder="Select a Character"
            />
          </div>
          <div className="space-y-1">
            <p className="w-full text-sm font-semibold">Level</p>
            <div className="flex w-full gap-2">
              <SelectInput
                onChange={(value) => teamStore.setMemberInfo(props.index, { level: parseInt(value) || 0 })}
                options={levels}
                value={level?.toString()}
                disabled={isEmpty || props.disabled}
              />
              <SelectInput
                onChange={(value) => {
                  const max = findMaxTalentLevel(parseInt(value))
                  teamStore.setMemberInfo(props.index, {
                    ascension: parseInt(value) || 0,
                    level: findMaxLevel(parseInt(value) || 0),
                    major_traces: {
                      a2: parseInt(value) < 2 ? false : selectedChar?.major_traces?.a2,
                      a4: parseInt(value) < 4 ? false : selectedChar?.major_traces?.a4,
                      a6: parseInt(value) < 6 ? false : selectedChar?.major_traces?.a6,
                    },
                  })
                  _.forEach(
                    teamStore.characters[props.index]?.talents,
                    (item, key: 'basic' | 'skill' | 'ult' | 'talent') => {
                      const m = key === 'basic' ? parseInt(value) || 1 : max
                      if (item > m) teamStore.setTalentLevel(props.index, key, m)
                    }
                  )
                }}
                options={AscensionOptions}
                value={ascension?.toString()}
                style="w-fit"
                disabled={isEmpty || props.disabled}
              />
              <SelectInput
                onChange={(value) =>
                  teamStore.setMemberInfo(props.index, {
                    cons: parseInt(value) || 0,
                  })
                }
                options={EidolonOptions}
                value={cons?.toString()}
                style="w-fit"
                disabled={isEmpty || props.disabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
