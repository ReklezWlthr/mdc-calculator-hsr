import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'

export const AsyncWrapper = observer(({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
  const [component, setComponent] = useState(null)

  useEffect(() => {
    setComponent(children)
  }, [children])

  return (
    component || (
      <div className="flex items-center justify-center w-full h-full text-3xl font-bold text-white rounded-lg bg-primary-darker">
        Loading...
      </div>
    )
  )
})
