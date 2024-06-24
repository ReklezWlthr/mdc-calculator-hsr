import { useStore } from '@src/data/providers/app_store_provider'
import { observer } from 'mobx-react-lite'

export const CompareModal = observer(() => {
  const { calculatorStore, teamStore } = useStore()

  return (
    <>
      <div></div>
    </>
  )
})
