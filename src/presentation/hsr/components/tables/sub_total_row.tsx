import { Element, TalentProperty, TalentType } from '@src/domain/constant'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useStore } from '@src/data/providers/app_store_provider'

interface CompareTotalRowsProps {
  type: TalentType
}

export const propertyColor = {
  [TalentProperty.HEAL]: 'text-heal',
  [TalentProperty.SHIELD]: 'text-indigo-300',
}

export const BaseElementColor = {
  [Element.PHYSICAL]: 'text-hsr-physical',
  [Element.FIRE]: 'text-hsr-fire',
  [Element.ICE]: 'text-hsr-ice',
  [Element.LIGHTNING]: 'text-hsr-lightning',
  [Element.WIND]: 'text-hsr-wind',
  [Element.QUANTUM]: 'text-hsr-quantum',
  [Element.IMAGINARY]: 'text-hsr-imaginary',
}

export const ElementColor = {
  ...BaseElementColor,
  ...propertyColor,
}

export const SubTotalRow = observer(({ type }: CompareTotalRowsProps) => {
  const { calculatorStore } = useStore()

  return (
    <div className="grid items-center grid-cols-9 gap-2 pr-2">
      <div className="col-span-2 border-t-2 border-dashed border-primary-border" />
      <p className="col-span-1 text-center">Total</p>
      <p className="col-span-1 text-center text-gray">
        {calculatorStore.getTotal(type, 0) ? _.round(calculatorStore.getTotal(type, 0)).toLocaleString() : '-'}
      </p>
      <p className="col-span-1 text-center text-gray">
        {calculatorStore.getTotal(type, 1) ? _.round(calculatorStore.getTotal(type, 1)).toLocaleString() : '-'}
      </p>
      <p className="col-span-1 font-bold text-center text-red">
        {calculatorStore.getTotal(type, 2) ? _.round(calculatorStore.getTotal(type, 2)).toLocaleString() : '-'}
      </p>
      <div className="col-span-3 border-t-2 border-dashed border-primary-border" />
    </div>
  )
})
