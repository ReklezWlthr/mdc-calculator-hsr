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
import { Tooltip } from '@src/presentation/components/tooltip'
import { formatScaleString, getBaseStat, getWeaponBase } from '@src/core/utils/data_format'

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
    <div className="w-[85vw] max-w-[1200px] p-4 text-white rounded-xl bg-primary-dark space-y-3 font-semibold">
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
          <FilterIcon path={PathType.REMEMBRANCE} />
          <FilterIcon path={PathType.ELATION} />
        </div>
      </div>
      <div className="grid w-full grid-cols-10 gap-4 max-h-[70vh] overflow-y-auto hideScrollbar rounded-lg">
        {_.map(filteredWeapon, (item) => {
          const minAtk = getWeaponBase(item?.baseAtk, 1, 0)
          const maxAtk = getWeaponBase(item?.baseAtk, 80, 6)
          const minHp = getWeaponBase(item?.baseHp, 1, 0)
          const maxHp = getWeaponBase(item?.baseHp, 80, 6)
          const minDef = getWeaponBase(item?.baseDef, 1, 0)
          const maxDef = getWeaponBase(item?.baseDef, 80, 6)

          return (
            <Tooltip
              title={
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-normal text-primary-lighter">{item.type}</p>
                    <p>{item.name}</p>
                  </div>
                  <div className="w-fit">
                    <RarityGauge rarity={item.rarity} />
                  </div>
                </div>
              }
              body={
                <div>
                  <div className="grid grid-cols-3 gap-2">
                    <p>
                      <b>Base HP</b>: <span className="text-blue">{_.round(minHp)}</span>{' '}
                      <span className="text-desc">({_.round(maxHp).toLocaleString()})</span>
                    </p>
                    <p>
                      <b>Base ATK</b>: <span className="text-blue">{_.round(minAtk)}</span>{' '}
                      <span className="text-desc">({_.round(maxAtk)})</span>
                    </p>
                    <p>
                      <b>Base DEF</b>: <span className="text-blue">{_.round(minDef)}</span>{' '}
                      <span className="text-desc">({_.round(maxDef)})</span>
                    </p>
                  </div>
                  <div className="my-1 border-t border-primary-light" />
                  <b>{item.desc.name}</b>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: _.reduce(
                        Array.from(item?.desc?.detail?.matchAll(/{{\d+}}\%?/g) || []),
                        (acc, curr) => {
                          const index = curr?.[0]?.match(/\d+/)?.[0]
                          const isPercentage = !!curr?.[0]?.match(/\%$/)
                          return _.replace(
                            acc,
                            curr[0],
                            `<span class="text-desc">${_.round(item?.desc?.properties?.[index]?.base, 2)}~${_.round(
                              item?.desc?.properties?.[index]?.base + item?.desc?.properties?.[index]?.growth * 4,
                              2
                            )}${isPercentage ? '%' : ''}</span>`
                          )
                        },
                        item?.desc?.detail
                      ),
                    }}
                    className="font-normal"
                  />
                </div>
              }
              style="w-[500px]"
            >
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
                  {item.beta && (
                    <div className="absolute right-0 px-1.5 py-0.5 bottom-6 bg-rose-600 rounded-l-md">Beta</div>
                  )}
                  <img
                    src={`https://api.hakush.in/hsr/UI/lightconemediumicon/${item.id}.webp`}
                    className="object-contain w-full rounded-t-lg bg-primary-darker aspect-square"
                  />
                </div>
                <div className="w-full h-10 px-2 py-1">
                  <p className="text-center line-clamp-2">{item.name}</p>
                </div>
              </div>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
})
