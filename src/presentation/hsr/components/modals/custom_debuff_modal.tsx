import { useStore } from '@src/data/providers/app_store_provider'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { Element, Stats } from '@src/domain/constant'
import _ from 'lodash'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { CustomSetterT } from '@src/data/stores/setup_store'
import { Tooltip } from '@src/presentation/components/tooltip'

export const isFlat = (key: string) =>
  _.includes([Stats.ATK, Stats.HP, Stats.DEF, Stats.SPD], key) || _.includes(key, '_F_')

export const CustomDebuffModal = observer(({ setCustomValue }: { setCustomValue?: CustomSetterT }) => {
  const { calculatorStore, modalStore } = useStore()

  const [selectedTab, setSelectedTab] = useState('red')

  const set = setCustomValue || calculatorStore.setCustomValue

  const [key, setKey] = useState(StatsObjectKeys.DEF_REDUCTION)
  const [value, setValue] = useState('0')

  const options = {
    red: [
      { name: 'DEF Reduction', value: StatsObjectKeys.DEF_REDUCTION },
      { name: 'Effect RES Reduction', value: StatsObjectKeys.E_RES_RED },
    ],
    vul: [
      { name: 'All-Type Vulnerability', value: StatsObjectKeys.VULNERABILITY },
      { name: 'DoT Vulnerability', value: StatsObjectKeys.DOT_VUL },
      { name: 'Follow-Up DMG Vulnerability', value: StatsObjectKeys.FUA_VUL },
      { name: 'Ultimate Vulnerability', value: StatsObjectKeys.ULT_VUL },
      { name: 'Break DMG Vulnerability', value: StatsObjectKeys.BREAK_VUL },
      { name: 'Super Break DMG Vulnerability', value: StatsObjectKeys.SUPER_BREAK_VUL },
      { name: 'Fire DMG Vulnerability', value: StatsObjectKeys.FIRE_VUL },
    ],
    res: [
      { name: 'All-Type RES Reduction', value: StatsObjectKeys.ALL_TYPE_RES_RED },
      ..._.map(Element, (item) => ({ name: `${item} RES Reduction`, value: `${item?.toUpperCase()}_RES_RED` })),
    ],
  }

  const Tab = ({ title, value, defaultKey }: { title: string; value: string; defaultKey: any }) => (
    <div
      className={classNames('rounded-lg px-2 py-1 text-white cursor-pointer duration-200 text-sm', {
        'bg-primary': selectedTab === value,
      })}
      onClick={() => {
        setSelectedTab(value)
        setKey(defaultKey)
      }}
    >
      {title}
    </div>
  )

  const onAddMod = () => {
    const v = parseFloat(value)
    set(-1, key as any, v, true, true)
    modalStore.closeModal()
  }

  return (
    <div className="p-3 space-y-4 rounded-lg bg-primary-dark w-[450px]">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-white">Add Custom Modifier</p>
          <Tooltip
            title="Custom Modifiers"
            body={
              <p>
                Add custom modifiers to the character to quickly simulate certain scenarios. The value may also be
                negative to simulate <span className="text-red">Debuff</span> on self.
              </p>
            }
            style="w-[450px]"
          >
            <i className="fa-regular fa-question-circle text-gray" />
          </Tooltip>
        </div>
        <p className="text-xs italic text-red">
          Note: Custom debuffs do NOT count towards Debuff Count (e.g. Silver Wolf's E6).
        </p>
      </div>
      <div className="flex justify-center pb-2 border-b gap-x-1 border-primary-border">
        <Tab title="Attribute Reduction" value="red" defaultKey={options.red[0].value} />
        <Tab title="Vulnerability" value="vul" defaultKey={options.vul[0].value} />
        <Tab title="RES Reduction" value="res" defaultKey={options.res[0].value} />
      </div>
      <div className="grid items-center grid-cols-3 pb-4 border-b gap-x-3 border-primary-border">
        <SelectInput
          value={key}
          onChange={(v) => setKey(v)}
          options={options[selectedTab]}
          style="col-span-2 w-2/3 mx-auto"
        />
        <TextInput type="number" value={value?.toString()} onChange={setValue} style="col-start-3 !w-1/2 mx-auto" />
      </div>
      <div className="flex justify-end">
        <PrimaryButton title="Add Modifier" onClick={onAddMod} />
      </div>
    </div>
  )
})
