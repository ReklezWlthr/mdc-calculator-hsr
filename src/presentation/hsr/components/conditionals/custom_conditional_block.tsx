import { useStore } from '@src/data/providers/app_store_provider'
import { IContent } from '@src/domain/conditional'
import { CustomConditionalMap, Element } from '@src/domain/constant'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { Tooltip } from '@src/presentation/components/tooltip'
import classNames from 'classnames'
import _, { remove } from 'lodash'
import { observer } from 'mobx-react-lite'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { CustomModal } from '@src/presentation/hsr/components/modals/custom_modal'
import { CustomRemoverT, CustomSetterT } from '@src/data/stores/setup_store'
import { StatsObjectKeysT } from '@src/data/lib/stats/baseConstant'

interface CustomConditionalBlockProps {
  index: number
  setValue?: CustomSetterT
  removeValue?: CustomRemoverT
  customOverride?: {
    name: StatsObjectKeysT
    value: number
    debuff: boolean
    toggled: boolean
  }[]
}

export const CustomConditionalBlock = observer(
  ({ index, removeValue, setValue, customOverride }: CustomConditionalBlockProps) => {
    const [open, setOpen] = useState(true)

    const { calculatorStore, modalStore } = useStore()
    const custom = customOverride || calculatorStore.custom[index]

    const onOpenCustomModal = useCallback(
      () => modalStore.openModal(<CustomModal setCustomValue={setValue} />),
      [setValue]
    )

    const set = setValue || calculatorStore.setCustomValue
    const remove = removeValue || calculatorStore.removeCustomValue

    return (
      <div className="w-full rounded-lg bg-primary-darker h-fit">
        <p
          className={classNames(
            'px-2 py-1 text-lg font-bold text-center duration-300 cursor-pointer bg-primary-light',
            open ? 'rounded-t-lg' : 'rounded-lg'
          )}
          onClick={() => setOpen((prev) => !prev)}
        >
          Custom Modifiers
          <i
            className={classNames(
              'ml-2 text-base align-top fa-solid fa-caret-down duration-300',
              open && '-rotate-180'
            )}
          />
        </p>
        <div
          className={classNames(
            'space-y-2 duration-300 ease-out px-4 w-full',
            open ? 'h-fit overflow-visible py-3' : 'h-0 overflow-hidden'
          )}
        >
          <div className="space-y-3">
            {!_.isEmpty(custom) &&
              _.map(custom, (mod, i) => (
                <div className="grid items-center grid-cols-12 text-xs gap-x-1" key={mod.name}>
                  <div className="col-span-5">
                    <p className="w-full text-xs text-center text-white truncate">
                      {CustomConditionalMap[mod.name] || mod.name}
                    </p>
                  </div>
                  <div className="col-span-2 text-center text-desc">Custom</div>
                  <TextInput
                    type="number"
                    value={mod.value?.toString()}
                    onChange={(value) => set(i, mod.name, value ?? '', mod.toggled, mod.debuff)}
                    style="col-span-2"
                    small
                  />
                  <div className="flex justify-center col-span-2">
                    <CheckboxInput
                      onClick={(value) => set(i, mod.name, mod.value, value, mod.debuff)}
                      checked={mod.toggled}
                    />
                  </div>
                  <div className="flex justify-center">
                    <i
                      className="flex items-center justify-center h-6 cursor-pointer fa-solid fa-trash"
                      onClick={() => remove(index, i)}
                    />
                  </div>
                </div>
              ))}
          </div>
          <div
            className="flex items-center justify-center w-full h-6 gap-2 text-sm duration-200 rounded-lg cursor-pointer hover:bg-primary"
            onClick={onOpenCustomModal}
          >
            <i className="text-xs fa-solid fa-plus" />
            <p className="text-xs">Add New Custom Modifier</p>
          </div>
        </div>
      </div>
    )
  }
)
