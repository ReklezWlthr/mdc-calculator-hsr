import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'

export const BulletPoint = observer(
  ({ children, color = 'text-blue' }: { children: React.ReactNode; color?: string }) => {
    return (
      <p className="flex gap-2 pl-3">
        <span className={color}>✦</span>
        <p>{children}</p>
      </p>
    )
  }
)

export const Collapsible = observer(
  ({
    label,
    children,
    childRight,
  }: {
    label: React.ReactNode
    children: React.ReactNode | React.ReactNode[]
    childRight?: React.ReactNode
  }) => {
    const [open, setOpen] = useState(false)

    return (
      <div className="space-y-1 text-sm transition-all duration-200 rounded-lg bg-primary-darker text-gray">
        <div className="flex items-center p-3 cursor-pointer gap-x-3" onClick={() => setOpen(!open)}>
          <div className="w-full text-base font-bold text-white">{label}</div>
          {childRight}
        </div>
        <div
          className={classNames(
            'space-y-1 transition-all duration-200 overflow-hidden px-3',
            open ? 'max-h-screen pb-3' : 'max-h-0'
          )}
        >
          {children}
        </div>
      </div>
    )
  }
)
