import { formatIdIcon } from '@src/core/utils/data_format'
import { useStore } from '@src/data/providers/app_store_provider'
import classNames from 'classnames'

export const CharacterSelect = ({
  onClick,
  isSelected,
  id,
}: {
  onClick?: () => void
  isSelected: boolean
  id: string
}) => {
  const { settingStore } = useStore()

  return (
    <div
      className={classNames('w-12 h-12 rounded-full bg-primary duration-200 relative shrink-0 overflow-hidden', {
        'hover:ring-2 ring-primary-light': onClick && !isSelected,
        'ring-4 ring-primary-lighter': isSelected,
        'cursor-pointer': onClick,
      })}
      onClick={() => onClick?.()}
    >
      <img
        src={
          id
            ? `https://api.hakush.in/hsr/UI/avatarshopicon/${formatIdIcon(
                id,
                settingStore.settings?.travelerGender
              )}.webp`
            : ''
        }
        className="absolute object-cover scale-[1.75] top-4"
      />
    </div>
  )
}
