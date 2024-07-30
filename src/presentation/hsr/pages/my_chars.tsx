import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useStore } from '@src/data/providers/app_store_provider'
import { useParams } from '@src/core/hooks/useParams'
import { useMemo } from 'react'
import { Characters } from '@src/data/db/characters'
import { RarityGauge } from '@src/presentation/components/rarity_gauge'
import classNames from 'classnames'
import { formatIdIcon } from '@src/core/utils/data_format'
import { Element, PathType } from '@src/domain/constant'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { getElementImage, getPathImage } from '@src/core/utils/fetcher'
import { CharDetail } from '../components/char_detail'

export const MyCharacters = observer(() => {
  const { charStore, settingStore } = useStore()
  const { setParams, params } = useParams({
    searchWord: '',
    element: [],
    path: [],
  })

  const filteredChar = useMemo(
    () =>
      _.filter(
        Characters.sort((a, b) => a.name.localeCompare(b.name)),
        (item) => {
          const regex = new RegExp(params.searchWord, 'i')
          const nameMatch = item.name.match(regex)
          const elmMatch = _.size(params.element) ? _.includes(params.element, item.element) : true
          const pathMatch = _.size(params.path) ? _.includes(params.path, item.path) : true
          const liveMatch = !(item.beta && settingStore.settings.liveOnly)

          return nameMatch && elmMatch && pathMatch && liveMatch
        }
      ),
    [params, settingStore.settings.liveOnly]
  )

  const FilterIcon = ({ type, value }: { type: 'element' | 'path'; value: Element | PathType }) => {
    const array = type === 'element' ? params.element : params.path
    const checked = _.includes(array, value)
    return (
      <div
        className={classNames('w-6 h-6 duration-200 rounded-full cursor-pointer hover:bg-primary-lighter', {
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
    <div className="flex flex-col items-center w-full gap-5 py-5 pl-5 max-w-[1240px] mx-auto">
      <div className="flex w-full h-full gap-x-10">
        <div className="flex flex-col w-1/3 min-w-[400px] h-full gap-y-4 shrink-0">
          <div className="flex items-end gap-5">
            <div className="space-y-1.5">
              <p className="text-2xl font-bold text-white">My Characters</p>
              <TextInput
                onChange={(value) => setParams({ searchWord: value })}
                value={params.searchWord}
                placeholder="Search Character Name"
              />
            </div>
            <div className="my-1 space-y-2">
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
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 pr-2 rounded-lg customScrollbar">
            {_.map(filteredChar, (item) => {
              const owned = _.includes(_.map(charStore.characters, 'cId'), item.id)
              return (
                <div
                  className={classNames(
                    'w-full text-xs text-white duration-200 border rounded-lg cursor-pointer bg-primary border-primary-border hover:scale-95',
                    owned ? 'opacity-100' : 'opacity-30'
                  )}
                  onClick={() => charStore.setValue('selected', item.id)}
                  key={item.name}
                >
                  <div className="relative w-full">
                    <img src={getElementImage(item.element)} className="absolute w-6 h-6 top-1 left-1" />
                    {owned && (
                      <div className="absolute px-1.5 py-1 rounded-full top-1 right-1 bg-primary-light font-bold">
                        E{_.find(charStore.characters, ['cId', item.id])?.cons || 0}
                      </div>
                    )}
                    <div className="absolute bg-primary-darker py-0.5 px-1.5 rounded-full right-1 bottom-0.5">
                      <RarityGauge rarity={item.rarity} />
                    </div>
                    {item.beta && <div className="absolute right-0 px-1 rounded-l-sm rounded-r-sm bottom-6 bg-rose-600">Beta</div>}
                    <img
                      src={`https://api.hakush.in/hsr/UI/avatarshopicon/${formatIdIcon(
                        item.id,
                        settingStore.settings?.travelerGender
                      )}.webp`}
                      className="object-contain rounded-t-lg bg-primary-darker aspect-[47/64] w-full"
                    />
                  </div>
                  <p className="w-full px-2 py-1 text-center truncate">{item.name}</p>
                </div>
              )
            })}
          </div>
        </div>
        <CharDetail />
      </div>
    </div>
  )
})
