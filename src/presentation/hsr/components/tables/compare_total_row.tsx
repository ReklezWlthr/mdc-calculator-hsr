import { Element, TalentProperty, TalentType } from '@src/domain/constant'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { toPercentage } from '@src/core/utils/converter'
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

export const CompareTotalRows = observer(({ type }: CompareTotalRowsProps) => {
  const { setupStore } = useStore()

  const mode = setupStore.mode

  const renderSubDmgBlock = (i: number) => {
    const target = setupStore.getTotal(type, i)
    const main = setupStore.getTotal(type, 0)
    const compare = target - main
    const p = (target - main) / main
    const percent = main ? (compare >= 0 ? '+' : '') + toPercentage(p) : 'NEW'
    const abs = (compare >= 0 ? '+' : '') + _.round(target - main).toLocaleString()
    const diff = _.includes(['percent', 'abs'], mode)
    return target ? (
      <p
        className={classNames(
          'col-span-1 text-xs text-center',
          diff
            ? {
                'text-lime-300': compare > 0 && main,
                'text-desc': compare > 0 && !main,
                'text-red': compare < 0,
                'text-blue': compare === 0,
              }
            : 'text-gray'
        )}
      >
        {mode === 'percent' ? percent : mode === 'abs' ? abs : _.round(target).toLocaleString()}
        {compare > 0 && !diff && <i className="ml-1 text-[10px] fa-solid fa-caret-up text-lime-400" />}
        {compare < 0 && !diff && <i className="ml-1 text-[10px] fa-solid fa-caret-down text-red" />}
        {compare === 0 && !diff && <i className="ml-1 text-[10px] fa-solid fa-minus text-blue" />}
      </p>
    ) : (
      <p className="col-span-1 text-center text-gray">-</p>
    )
  }

  return (
    <div className="grid items-center grid-cols-9 gap-2 pr-2">
      <div className="col-span-2 border-t-2 border-dashed border-primary-border" />
      <p className="col-span-1 text-center">Total</p>
      <p className="col-span-1 text-xs text-center text-gray">
        {setupStore.getTotal(type, 0) ? _.round(setupStore.getTotal(type, 0)).toLocaleString() : '-'}
      </p>
      {renderSubDmgBlock(1)}
      {renderSubDmgBlock(2)}
      {renderSubDmgBlock(3)}
      <div className="col-span-2 border-t-2 border-dashed border-primary-border" />
    </div>
  )
})
