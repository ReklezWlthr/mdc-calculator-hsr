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

export const CustomModal = observer(({ setCustomValue, memo }: { setCustomValue?: CustomSetterT; memo?: boolean }) => {
  const { calculatorStore, modalStore } = useStore()

  const [selectedTab, setSelectedTab] = useState('stats')
  const [selectedElement, setSelectedElement] = useState(Element.PHYSICAL)
  const [selectedTalent, setSelectedTalent] = useState('BASIC')
  const [selectedProperty, setSelectedProperty] = useState('FUA')

  const set = setCustomValue || calculatorStore.setCustomValue

  const [key, setKey] = useState(StatsObjectKeys[Stats.HP])
  const [value, setValue] = useState('0')

  const options = {
    stats: [
      { name: Stats.HP, value: Stats.HP },
      { name: Stats.P_HP, value: Stats.P_HP },
      { name: Stats.ATK, value: Stats.ATK },
      { name: Stats.P_ATK, value: Stats.P_ATK },
      { name: Stats.DEF, value: Stats.DEF },
      { name: Stats.P_DEF, value: Stats.P_DEF },
      { name: Stats.SPD, value: Stats.SPD },
      { name: Stats.P_SPD, value: Stats.P_SPD },
      { name: Stats.CRIT_RATE, value: Stats.CRIT_RATE },
      { name: Stats.CRIT_DMG, value: Stats.CRIT_DMG },
      { name: Stats.BE, value: Stats.BE },
      { name: Stats.EHR, value: Stats.EHR },
      { name: Stats.ALL_DMG, value: Stats.ALL_DMG },
      { name: Stats.HEAL, value: Stats.HEAL },
      { name: Stats.ERR, value: Stats.ERR },
      { name: 'All-Type RES PEN', value: StatsObjectKeys.ALL_TYPE_RES_PEN },
      { name: 'All-Type DEF PEN', value: StatsObjectKeys.DEF_PEN },
      { name: 'Weakness Break Efficiency', value: StatsObjectKeys.BREAK_EFF },
      { name: 'Shield Bonus', value: StatsObjectKeys.SHIELD },
      { name: 'DMG Reduction', value: StatsObjectKeys.DMG_REDUCTION },
      { name: 'Percentage Aggro Bonus', value: StatsObjectKeys.AGGRO },
    ],
    element: [
      { name: 'Percentage Bonus', value: 'percentage' },
      { name: 'RES PEN', value: 'pen' },
    ],
    talent: [
      { name: 'Percentage Bonus', value: '_DMG' },
      { name: 'DEF PEN', value: '_DEF_PEN' },
      { name: 'CRIT Rate', value: '_CR' },
      { name: 'CRIT DMG', value: '_CD' },
    ],
    property: [
      { name: 'Percentage Bonus', value: '_DMG' },
      { name: 'DEF PEN', value: '_DEF_PEN' },
      { name: 'CRIT Rate', value: '_CR' },
      { name: 'CRIT DMG', value: '_CD' },
    ],
  }

  const elements = _.map(Element, (item) => ({ name: item, value: item }))
  const talent = [
    { name: 'Basic ATK', value: 'BASIC' },
    { name: 'Skill', value: 'SKILL' },
    { name: 'Ultimate', value: 'ULT' },
    { name: 'Talent', value: 'TALENT' },
  ]
  const property = [
    { name: 'Follow-Up DMG', value: 'FUA' },
    { name: 'DoT', value: 'DOT' },
    { name: 'Break DMG', value: 'BREAK' },
    { name: 'Super Break DMG', value: 'SUPER_BREAK' },
  ]

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
    if (selectedTab === 'stats') {
      set(-1, key as any, v, true, false, memo)
    }
    if (selectedTab === 'element') {
      if (key === 'percentage') set(-1, StatsObjectKeys[`${selectedElement} DMG%`] as any, v, true, false, memo)
      if (key === 'pen')
        set(-1, StatsObjectKeys[`${selectedElement.toUpperCase()}_RES_PEN`] as any, v, true, false, memo)
    }
    if (selectedTab === 'talent') {
      set(-1, StatsObjectKeys[selectedTalent + key] as any, v, true, false, memo)
    }
    if (selectedTab === 'property') {
      set(-1, StatsObjectKeys[selectedProperty + key] as any, v, true, false, memo)
    }
    modalStore.closeModal()
  }

  return (
    <div className="p-3 space-y-4 rounded-lg bg-primary-dark w-[450px]">
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
      <div className="flex justify-center pb-2 border-b gap-x-1 border-primary-border">
        <Tab title="General" value="stats" defaultKey={options.stats[0].value} />
        <Tab title="Elemental" value="element" defaultKey={options.element[0].value} />
        <Tab title="Ability" value="talent" defaultKey={options.talent[0].value} />
        <Tab title="Property" value="property" defaultKey={options.property[0].value} />
      </div>
      <div className="grid items-center grid-cols-3 pb-4 border-b gap-x-3 border-primary-border">
        {selectedTab === 'stats' && (
          <SelectInput
            value={key}
            onChange={(v) => setKey(v)}
            options={options.stats}
            style="col-span-2 w-2/3 mx-auto"
          />
        )}
        {selectedTab === 'element' && (
          <>
            <SelectInput value={selectedElement} onChange={(v) => setSelectedElement(v as any)} options={elements} />
            <SelectInput value={key} onChange={(v) => setKey(v)} options={options.element} />
          </>
        )}
        {selectedTab === 'talent' && (
          <>
            <SelectInput value={selectedTalent} onChange={(v) => setSelectedTalent(v as any)} options={talent} />
            <SelectInput value={key} onChange={(v) => setKey(v)} options={options.talent} />
          </>
        )}
        {selectedTab === 'property' && (
          <>
            <SelectInput
              value={selectedProperty}
              onChange={(v) => {
                setSelectedProperty(v as any)
                if (selectedProperty !== 'FUA' && !_.includes(_.map(_.take(options.property, 2), 'value'), key))
                  setKey(options.property[0].value)
              }}
              options={property}
            />
            <SelectInput
              value={key}
              onChange={(v) => setKey(v)}
              options={selectedProperty !== 'FUA' ? _.take(options.property, 2) : options.property}
            />
          </>
        )}
        <TextInput type="number" value={value?.toString()} onChange={setValue} style="col-start-3 !w-1/2 mx-auto" />
      </div>
      <div className="flex justify-end">
        <PrimaryButton title="Add Modifier" onClick={onAddMod} />
      </div>
    </div>
  )
})
