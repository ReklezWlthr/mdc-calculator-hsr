import _ from 'lodash'
import { Characters } from '@src/data/db/characters'
import { useStore } from '@src/data/providers/app_store_provider'
import { observer } from 'mobx-react-lite'
import { DefaultBuild, Element, ITeamChar, IWeaponEquip, PathType } from '@src/domain/constant'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { useParams } from '@src/core/hooks/useParams'
import classNames from 'classnames'
import { RarityGauge } from '@src/presentation/components/rarity_gauge'
import { useMemo } from 'react'
import { DefaultWeapon } from '@src/data/stores/team_store'
import { findLightCone } from '@src/core/utils/finder'
import getConfig from 'next/config'
import { getElementImage, getPathImage } from '@src/core/utils/fetcher'
import { formatIdIcon, formatMinorTrace } from '@src/core/utils/data_format'

const { publicRuntimeConfig } = getConfig()

interface CharacterModalProps {
  index: number
  setChar?: (index: number, value: Partial<ITeamChar>) => void
}

export const CharacterModal = observer(({ index, setChar }: CharacterModalProps) => {
  const { teamStore, modalStore, buildStore, charStore, settingStore } = useStore()
  const { setParams, params } = useParams({
    searchWord: '',
    element: [],
    path: [],
    hasBuild: false,
  })

  const charSetter = setChar || teamStore.setMemberInfo

  const filteredChar = useMemo(
    () =>
      _.filter(
        Characters.sort((a, b) => a.name.localeCompare(b.name)),
        (item) => {
          const regex = new RegExp(params.searchWord, 'i')
          const nameMatch = item.name.match(regex)
          const elmMatch = _.size(params.element) ? _.includes(params.element, item.element) : true
          const weaponMatch = _.size(params.path) ? _.includes(params.path, item.path) : true
          const liveMatch = !(item.beta && settingStore.settings.liveOnly)

          return nameMatch && elmMatch && weaponMatch && liveMatch
        },
      ),
    [params, settingStore.settings.liveOnly],
  )

  const FilterIcon = ({ type, value }: { type: 'element' | 'path'; value: Element | PathType }) => {
    const array = type === 'element' ? params.element : params.path
    const checked = _.includes(array, value)
    return (
      <div
        className={classNames('w-8 h-8 duration-200 rounded-full cursor-pointer hover:bg-primary-lighter', {
          'bg-primary-lighter': checked,
          'p-0.5': type === 'element',
        })}
        onClick={() => setParams({ [type]: checked ? _.without(array, value) : [...array, value] })}
        title={value}
      >
        <img src={type === 'element' ? getElementImage(value) : getPathImage(value as PathType)} />
      </div>
    )
  }

  return (
    <div className="w-[85vw] max-w-[1200px] p-4 text-white rounded-xl bg-primary-dark space-y-3 font-semibold">
      <div className="flex items-center gap-6">
        <p className="shrink-0">Select a Character</p>
        <TextInput
          onChange={(value) => setParams({ searchWord: value })}
          value={params.searchWord}
          placeholder="Search Character Name"
        />
        <div className="flex gap-2">
          <FilterIcon type="element" value={Element.PHYSICAL} />
          <FilterIcon type="element" value={Element.FIRE} />
          <FilterIcon type="element" value={Element.ICE} />
          <FilterIcon type="element" value={Element.LIGHTNING} />
          <FilterIcon type="element" value={Element.WIND} />
          <FilterIcon type="element" value={Element.QUANTUM} />
          <FilterIcon type="element" value={Element.IMAGINARY} />
        </div>
        <div className="flex gap-2">
          <FilterIcon type="path" value={PathType.DESTRUCTION} />
          <FilterIcon type="path" value={PathType.HUNT} />
          <FilterIcon type="path" value={PathType.ERUDITION} />
          <FilterIcon type="path" value={PathType.HARMONY} />
          <FilterIcon type="path" value={PathType.NIHILITY} />
          <FilterIcon type="path" value={PathType.PRESERVATION} />
          <FilterIcon type="path" value={PathType.ABUNDANCE} />
          <FilterIcon type="path" value={PathType.REMEMBRANCE} />
          <FilterIcon type="path" value={PathType.ELATION} />
        </div>
      </div>
      <div className="grid w-full grid-cols-10 gap-4 max-h-[70vh] overflow-y-auto hideScrollbar rounded-lg">
        {_.map(filteredChar, (item) => {
          const owned = _.includes(_.map(charStore.characters, 'cId'), item.id)
          return (
            <div
              className="w-full text-xs duration-200 border rounded-lg cursor-pointer bg-primary border-primary-border hover:scale-95"
              onClick={() => {
                const build = _.find(buildStore.builds, (build) => build.isDefault && build.cId === item.id)
                const teamChar = _.cloneDeep(_.find(teamStore.characters, (char) => char.cId === item.id))
                const storeChar = _.find(charStore.characters, (char) => char.cId === item.id)
                const char = teamChar || storeChar
                charSetter(index, {
                  cId: item.id,
                  ascension: char?.ascension || 0,
                  level: char?.level || 1,
                  talents: char?.talents || {
                    basic: 1,
                    skill: 1,
                    ult: 1,
                    talent: 1,
                    memo_skill: 1,
                    memo_talent: 1,
                    elation: 1,
                  },
                  equipments: teamChar
                    ? teamChar?.equipments
                    : build
                      ? { weapon: build.weapon, artifacts: build.artifacts }
                      : DefaultBuild,
                  cons: char?.cons || 0,
                  major_traces: char?.major_traces || { a2: false, a4: false, a6: false },
                  minor_traces:
                    char?.minor_traces || formatMinorTrace(item.trace, Array(10).fill(false), item.overwrite),
                })
                modalStore.closeModal()
              }}
              key={item.name}
            >
              <div className="relative">
                <div
                  className="flex items-center justify-center p-0.5 rounded-full bg-primary-darker bg-opacity-75 absolute w-7 h-7 top-1.5 left-1.5"
                  title={item.element}
                >
                  <img src={getElementImage(item.element)} />
                </div>
                {owned && (
                  <div className="absolute px-1.5 py-1 text-sm rounded-lg top-1 right-1 bg-primary font-bold">
                    E{_.find(charStore.characters, ['cId', item.id])?.cons || 0}
                  </div>
                )}
                {item.beta && (
                  <div className="absolute right-0 px-1.5 py-0.5 bottom-7 bg-rose-600 rounded-l-md">Beta</div>
                )}
                <div className="absolute bg-primary-darker py-0.5 px-1.5 rounded-full right-1 bottom-0.5">
                  <RarityGauge rarity={item.rarity} />
                </div>
                <img
                  src={`/asset/avatar/portrait//${formatIdIcon(
                    item.id,
                    settingStore.settings?.travelerGender,
                  )}.webp`}
                  className="object-cover rounded-t-lg bg-primary-darker aspect-[47/64] w-full"
                />
              </div>
              <p className="w-full px-2 py-1 text-center truncate">{item.name}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
})
