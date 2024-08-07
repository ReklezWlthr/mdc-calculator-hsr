import { observer } from 'mobx-react-lite'
import { GhostButton } from './ghost.button'
import { PrimaryButton } from './primary.button'
import { useStore } from '@src/data/providers/app_store_provider'
import classNames from 'classnames'

interface CommonModalProps {
  title: string
  desc: string
  icon?: string
  onCancel?: () => void
  onConfirm: () => void
  oneButton?: boolean
}

export const CommonModal = observer(({ title, desc, onCancel, onConfirm, icon, oneButton }: CommonModalProps) => {
  const { modalStore } = useStore()

  return (
    <div className="w-[400px] p-4 text-white rounded-xl bg-primary-dark space-y-2 font-semibold">
      <div className="flex items-center gap-x-1">
        <i className={classNames('w-8 h-8 flex items-center justify-center text-xl', icon)} />
        <p className="text-lg">{title}</p>
      </div>
      <p className="text-sm font-normal whitespace-pre-wrap">{desc}</p>
      <div className="flex justify-end gap-x-2">
        {!oneButton && (
          <GhostButton
            title="Cancel"
            onClick={() => {
              modalStore.closeModal()
              onCancel?.()
            }}
          />
        )}
        <PrimaryButton
          title="Confirm"
          onClick={() => {
            modalStore.closeModal()
            onConfirm()
          }}
        />
      </div>
    </div>
  )
})
