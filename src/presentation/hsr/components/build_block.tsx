import { formatIdIcon } from '@src/core/utils/data_format'
import { findCharacter } from '@src/core/utils/finder'
import { useStore } from '@src/data/providers/app_store_provider'
import { IBuild } from '@src/domain/constant'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

interface BuildBlockProps {
  build: IBuild
  onClick: () => void
  selected: boolean
}

export const BuildBlock = observer(({ build, onClick, selected }: BuildBlockProps) => {
  const { settingStore } = useStore()

  const char = findCharacter(build.cId)

  return (
    <div
      className={classNames(
        'flex items-center w-full h-16 overflow-hidden text-white duration-200 rounded-lg cursor-pointer active:scale-95 shrink-0',
        selected ? 'bg-primary-darker' : 'bg-primary-dark'
      )}
      onClick={onClick}
    >
      <div className="relative w-16 h-full overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 z-10 w-full h-full from-8% to-40% bg-gradient-to-l from-primary-dark to-transparent" />
        <img
          src={`https://api.hakush.in/hsr/UI/avatarshopicon/${formatIdIcon(
            build.cId,
            settingStore.settings?.travelerGender
          )}.webp`}
          className="object-cover h-16 aspect-[47/64] scale-[300%] mt-11 ml-1.5"
        />
      </div>
      <div className="w-full px-1 py-3">
        <div className="flex items-center gap-2">
          {build.isDefault && <i className="text-xs fa-solid fa-star text-yellow" title="Default Build" />}
          <p className="w-full line-clamp-1">{build.name}</p>
        </div>
        <p className="text-xs line-clamp-1 text-gray">Equipped By: {char?.name}</p>
      </div>
      <i
        className={classNames(
          'fa-solid fa-caret-right duration-300 mr-2 text-4xl text-primary-light',
          selected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
        )}
      />
    </div>
  )
})
