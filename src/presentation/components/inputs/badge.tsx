import classNames from 'classnames'

export interface BadgeProps {
  textColor?: string
  bgColor?: string
  text: string
  radius?: string
  iconRight?: string
  actionIconRight?: () => void
  iconLeft?: string
  width?: string
  'data-cy'?: string
  dataCy?: string
  horizontalAlignment?: string
  size?: 'small' | 'large'
}

export const Badge = ({
  textColor = 'text-blue-0',
  bgColor = 'bg-blue-4',
  text,
  dataCy,
  radius = 'rounded-[24px]',
  iconRight,
  actionIconRight,
  iconLeft,
  width = 'w-[150px]',
  horizontalAlignment = 'justify-center',
  size = 'small',
  ...props
}: BadgeProps) => {
  return (
    <div
      className={classNames(
        'space-x-[6px] overflow-hidden px-2 flex items-center py-[2px]',
        radius,
        bgColor,
        textColor,
        width,
        horizontalAlignment
      )}
    >
      {iconLeft && <i className={classNames(iconLeft)}></i>}
      <p
        data-cy={props['data-cy'] || dataCy}
        className={classNames('truncate', { 'text-xs': size === 'small' }, { 'text-base': size === 'large' })}
      >
        {text}
      </p>
      {iconRight && (
        <i
          className={classNames(iconRight)}
          onClick={(e) => {
            actionIconRight?.()
            e.stopPropagation()
          }}
        ></i>
      )}
    </div>
  )
}
