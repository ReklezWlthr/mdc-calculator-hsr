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

export const isFlat = (key: string) =>
  _.includes([Stats.ATK, Stats.HP, Stats.DEF, Stats.SPD], key) || _.includes(key, '_F_')

export const CustomModal = observer(({ setCustomValue }: { setCustomValue?: CustomSetterT }) => {
  const { calculatorStore, modalStore } = useStore()

  const [selectedTab, setSelectedTab] = useState('stats')
  const [selectedElement, setSelectedElement] = useState(Element.PHYSICAL)
  const [selectedTalent, setSelectedTalent] = useState('BASIC')

  const set = setCustomValue || calculatorStore.setCustomValue

  const [key, setKey] = useState(StatsObjectKeys[Stats.ALL_DMG])
  const [value, setValue] = useState(0)

  const options = {
    stats: [
      { name: Stats.ALL_DMG, value: Stats.ALL_DMG },
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
      { name: Stats.HEAL, value: Stats.HEAL },
      { name: Stats.ERR, value: Stats.ERR },
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
    debuff: [
      { name: 'DEF Reduction', value: StatsObjectKeys.DEF_REDUCTION },
      { name: 'SPD Reduction', value: StatsObjectKeys.SPD_REDUCTION },
      { name: 'All-Type RES Reduction', value: StatsObjectKeys.ALL_TYPE_RES_PEN },
      { name: 'Vulnerability', value: StatsObjectKeys.VULNERABILITY },
    ],
  }

  const elements = _.map(Element, (item) => ({ name: item, value: item }))
  const talent = [
    { name: 'Basic ATK', value: 'BASIC' },
    { name: 'Skill', value: 'SKILL' },
    { name: 'Ultimate', value: 'ULT' },
    { name: 'Talent', value: 'TALENT' },
    { name: 'Technique', value: 'TECH' },
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
    if (selectedTab === 'stats') {
      set(StatsObjectKeys[key], value)
    }
    if (selectedTab === 'element') {
      if (key === 'percentage') set(StatsObjectKeys[`${selectedElement} DMG%`] as any, value)
      if (key === 'pen') set(StatsObjectKeys[`${selectedElement.toUpperCase()}_RES_PEN`] as any, value)
    }
    if (selectedTab === 'talent') {
      set(StatsObjectKeys[selectedTalent + key] as any, value)
    }
    if (_.includes(['reaction', 'debuff'], selectedTab)) {
      set(key as any, value, selectedTab === 'debuff')
    }
    modalStore.closeModal()
  }

  return (
    <div className="p-3 space-y-4 rounded-lg bg-primary-dark w-[450px]">
      <p className="text-lg font-bold text-white">Add Custom Modifier</p>
      <div className="flex justify-center pb-2 border-b gap-x-1 border-primary-border">
        <Tab title="Stats" value="stats" defaultKey={StatsObjectKeys[Stats.ALL_DMG]} />
        <Tab title="Element" value="element" defaultKey={options.element[0].value} />
        <Tab title="Talent" value="talent" defaultKey={options.talent[0].value} />
        <Tab title="Property" value="property" defaultKey={options.property[0].value} />
        <Tab title="Debuffs" value="debuff" defaultKey={options.debuff[0].value} />
      </div>
      <div className="grid items-center grid-cols-3 pb-4 border-b gap-x-3 border-primary-border">
        {selectedTab === 'stats' && (
          <SelectInput
            value={key}
            onChange={(v) => setKey(v)}
            options={options.stats}
            style="col-span-2 !w-1/2 mx-auto"
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
        {selectedTab === 'debuff' && (
          <SelectInput
            value={key}
            onChange={(v) => setKey(v)}
            options={options.debuff}
            style="col-span-2 !w-2/3 mx-auto"
          />
        )}
        <TextInput
          type="number"
          value={value?.toString()}
          onChange={(v) => setValue(parseFloat(v))}
          style="col-start-3 !w-1/2 mx-auto"
        />
      </div>
      <div className="flex justify-end">
        <PrimaryButton title="Add Modifier" onClick={onAddMod} />
      </div>
    </div>
  )
})
