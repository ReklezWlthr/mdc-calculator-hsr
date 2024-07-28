import _ from 'lodash'
import { LightCones } from '@src/data/db/lightcone'
import { useStore } from '@src/data/providers/app_store_provider'
import { observer } from 'mobx-react-lite'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { useParams } from '@src/core/hooks/useParams'
import { useMemo } from 'react'
import { RarityGauge } from '@src/presentation/components/rarity_gauge'
import { IWeaponEquip, PathType, StatIcons, Stats } from '@src/domain/constant'
import classNames from 'classnames'
import { findCharacter } from '@src/core/utils/finder'
import getConfig from 'next/config'
import { getPathImage } from '@src/core/utils/fetcher'

const { publicRuntimeConfig } = getConfig()

interface LCModalProps {
  index: number
  pathOverride?: PathType
  setWeapon?: (index: number, info: Partial<IWeaponEquip>) => void
}

export const LCModal = observer(({ index, setWeapon, pathOverride }: LCModalProps) => {
  const { teamStore, modalStore, settingStore } = useStore()
  const { setParams, params } = useParams({
    searchWord: '',
    path: [pathOverride || findCharacter(teamStore.characters[index]?.cId)?.path],
    rarity: [],
  })

  const set = setWeapon || teamStore.setWeapon

  const filteredWeapon = useMemo(
    () =>
      _.filter(_.orderBy(LightCones, ['rarity', 'name'], ['desc', 'asc']), (item) => {
        const regex = new RegExp(params.searchWord, 'i')
        const nameMatch = item.name.match(regex)
        const typeMatch = _.size(params.path) ? _.includes(params.path, item.type) : true
        const liveMatch = !(item.beta && settingStore.settings.liveOnly)

        return nameMatch && typeMatch && liveMatch
      }),
    [params, settingStore.settings.liveOnly]
  )

  const FilterIcon = ({ path }: { path: PathType }) => {
    const checked = _.includes(params.path, path)
    return (
      <div
        className={classNames('w-8 h-8 duration-200 rounded-full cursor-pointer hover:bg-primary-lighter', {
          'bg-primary-light': checked,
        })}
        onClick={() => setParams({ path: checked ? _.without(params.path, path) : [...params.path, path] })}
        title={path}
      >
        <img src={getPathImage(path)} className="p-1" />
      </div>
    )
  }

  return (
    <div className="w-[85vw] max-w-[1240px] p-4 text-white rounded-xl bg-primary-dark space-y-3 font-semibold">
      <div className="flex items-center gap-6">
        <p className="shrink-0">Select a Light Cone</p>
        <div className="w-1/3">
          <TextInput
            onChange={(value) => setParams({ searchWord: value })}
            value={params.searchWord}
            placeholder="Search Light Cone Name"
          />
        </div>
        <div className="flex gap-2">
          <FilterIcon path={PathType.DESTRUCTION} />
          <FilterIcon path={PathType.HUNT} />
          <FilterIcon path={PathType.ERUDITION} />
          <FilterIcon path={PathType.HARMONY} />
          <FilterIcon path={PathType.NIHILITY} />
          <FilterIcon path={PathType.PRESERVATION} />
          <FilterIcon path={PathType.ABUNDANCE} />
        </div>
      </div>
      <div className="grid w-full grid-cols-10 gap-4 max-h-[70vh] overflow-y-auto hideScrollbar rounded-lg">
        {_.map(filteredWeapon, (item) => (
          <div
            className="text-xs duration-200 border rounded-lg cursor-pointer bg-primary border-primary-border hover:scale-95"
            onClick={() => {
              set(index, { wId: item.id })
              if (item.id === '2057') set(index, { refinement: 1 })
              modalStore.closeModal()
            }}
            key={item.name}
          >
            <div className="relative">
              <img
                src={getPathImage(item.type)}
                className="absolute p-1 rounded-full w-7 h-7 top-2 left-2 bg-primary"
                title={item.type}
              />
              <div className="absolute bg-primary-darker py-0.5 px-1.5 rounded-full right-1 bottom-0.5">
                <RarityGauge rarity={item.rarity} />
              </div>
              {item.beta && <div className="absolute left-0 px-2 py-0.5 bottom-2 bg-rose-600 rounded-r-md">Beta</div>}
              <img
                src={`https://api.hakush.in/hsr/UI/lightconemediumicon/${item.id}.webp`}
                className="object-contain w-full rounded-t-lg bg-primary-darker aspect-square"
              />
            </div>
            <div className="w-full h-10 px-2 py-1">
              <p className="text-center line-clamp-2">{item.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
