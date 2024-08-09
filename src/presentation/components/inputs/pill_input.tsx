import classNames from 'classnames'

export const PillInput = ({
  value,
  onClick,
  onClear,
  style,
  disabled,
  placeholder,
}: {
  value: string
  onClick: () => void
  onClear?: () => void
  style?: string
  disabled?: boolean
  placeholder?: string
}) => {
  return (
    <div
      className={classNames(
        'group flex items-center px-2 py-1 border rounded-lg transition-colors duration-300 font-normal truncate w-full text-sm gap-1',
        value && !disabled ? 'text-gray' : 'text-primary-light',
        disabled
          ? 'cursor-not-allowed bg-primary-bg border-primary'
          : 'cursor-pointer hover:border-primary-lighter bg-primary-darker border-primary-light',
        style
      )}
      onClick={() => !disabled && onClick()}
    >
      <p className="w-full truncate transition-none">{value || placeholder || '-'}</p>
      {onClear && (
        <i
          className={classNames('text-sm duration-200 opacity-0 fa-solid fa-times-circle text-primary-light', {
            'group-hover:opacity-100 cursor-pointer': !disabled,
          })}
          onClick={(event) => {
            event.stopPropagation()
            !disabled && onClear()
          }}
        />
      )}
    </div>
  )
}
