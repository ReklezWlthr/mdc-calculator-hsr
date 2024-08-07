import { useStore } from '@src/data/providers/app_store_provider'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { TSetup } from '@src/data/stores/setup_store'
import { formatIdIcon } from '@src/core/utils/data_format'
import classNames from 'classnames'
import { ElementIconColor } from '../cons_circle'
import { findCharacter } from '@src/core/utils/finder'
import { useMemo, useState } from 'react'
import { TextInput } from '@src/presentation/components/inputs/text_input'

export interface TeamModalProps {
  onSelect: (team: TSetup) => void
  filterId?: string
  hideCurrent?: boolean
}

export const TeamModalBlock = ({ team, button }: { team: TSetup; button: React.ReactNode }) => {
  const { settingStore } = useStore()

  return (
    <div
      className="flex items-center justify-between w-full px-3 py-2 text-white rounded-lg bg-primary-darker"
      key={team.id}
    >
      <div className="w-full space-y-1">
        <p className="w-full truncate">{team.name}</p>
        <div className="flex gap-2">
          {_.map(team.char, (item) => (
            <div
              className={classNames(
                'relative overflow-hidden rounded-lg w-14 h-7 bg-opacity-25',
                ElementIconColor[findCharacter(item.cId)?.element]
              )}
              key={item.cId}
            >
              <img
                src={`https://api.hakush.in/hsr/UI/avatarshopicon/${formatIdIcon(
                  item.cId,
                  settingStore.settings?.travelerGender
                )}.webp`}
                className="absolute object-cover scale-[1.75]"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-x-2">{button}</div>
    </div>
  )
}

export const TeamModal = observer(({ onSelect, filterId, hideCurrent }: TeamModalProps) => {
  const { modalStore, teamStore, setupStore } = useStore()

  const [search, setSearch] = useState('')

  const team = useMemo(
    () => [
      ...(hideCurrent ? [] : [{ id: '', char: teamStore.characters, name: 'Current Team Setup' }]),
      ...(search
        ? _.filter(setupStore.team, (item) =>
            _.some([..._.map(item.char, (c) => findCharacter(c?.cId)?.name), item.name], (q) =>
              _.includes(q?.toLowerCase(), search?.toLowerCase())
            )
          )
        : setupStore.team),
    ],
    [setupStore.team, teamStore.characters, search]
  )

  return (
    <div className="px-5 py-3 space-y-3 text-white rounded-lg bg-primary-dark w-[400px]">
      <div className="flex items-center justify-between w-full gap-3">
        <p className="font-semibold shrink-0">Select a Setup</p>
        <TextInput value={search} onChange={setSearch} placeholder="Search Setup Name or Members" />
      </div>
      <div className="space-y-2 dropdownScrollbar max-h-[70vh]">
        {_.map(
          filterId
            ? _.filter(team, (item) =>
                _.includes(
                  _.map(item.char, (c) => c.cId),
                  filterId
                )
              )
            : team,
          (team) => {
            return (
              <TeamModalBlock
                team={team}
                button={
                  <PrimaryButton
                    title="Select"
                    onClick={() => {
                      modalStore.closeModal()
                      onSelect(_.cloneDeep(team))
                    }}
                  />
                }
              />
            )
          }
        )}
      </div>
    </div>
  )
})
