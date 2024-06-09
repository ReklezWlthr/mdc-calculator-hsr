import { useStore } from '@src/data/providers/app_store_provider'
import { IContent } from '@src/domain/conditional'
import { Element } from '@src/domain/constant'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { Tooltip } from '@src/presentation/components/tooltip'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Dispatch, SetStateAction, useState } from 'react'
import { WeaponTooltip } from './weapon_block'
import { findCharacter } from '@src/core/utils/finder'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'

interface IContentIndex extends IContent {
  index: number
  owner?: number
}

interface ConditionalBlockProps {
  contents: IContentIndex[]
  tooltipStyle?: string
  index: number
}

export const WeaponConditionalBlock = observer(
  ({ contents, tooltipStyle = 'w-[40vw]', index }: ConditionalBlockProps) => {
    const [open, setOpen] = useState(true)

    const { calculatorStore, teamStore } = useStore()

    return (
      <div className="w-full rounded-lg bg-primary-darker h-fit">
        <p
          className={classNames(
            'px-2 py-1 text-lg font-bold text-center duration-300 cursor-pointer bg-primary-light',
            open ? 'rounded-t-lg' : 'rounded-lg'
          )}
          onClick={() => setOpen((prev) => !prev)}
        >
          Weapon Conditionals
          <i
            className={classNames(
              'ml-2 text-base align-top fa-solid fa-caret-down duration-300',
              open && '-rotate-180'
            )}
          />
        </p>
        <div
          className={classNames(
            'space-y-3 duration-300 ease-out px-4',
            open ? 'h-fit overflow-visible py-3' : 'h-0 overflow-hidden'
          )}
        >
          {_.size(_.filter(contents, 'show')) ? (
            _.map(
              contents,
              (content) =>
                content.show && (
                  <div
                    className="grid items-center grid-cols-12 text-xs gap-x-1"
                    key={content.id + (content.owner || content.index)}
                  >
                    <div className="col-span-6">
                      <WeaponTooltip
                        wId={_.split(content.id, '_')[0]}
                        refinement={
                          teamStore.characters[content.owner || content.index]?.equipments?.weapon?.refinement
                        }
                        position="left"
                      >
                        <p className="w-full text-xs text-center text-white truncate">
                          {content.owner && `${findCharacter(teamStore.characters[content.owner]?.cId)?.name}: `}
                          {content.text}
                        </p>
                      </WeaponTooltip>
                    </div>
                    <div className={classNames('col-span-2 text-center', content.debuff ? 'text-red' : 'text-blue')}>
                      {content.debuff ? 'Debuff' : 'Buff'}
                    </div>
                    {content.type === 'number' && (
                      <TextInput
                        type="number"
                        value={calculatorStore.form[content.index]?.[content.id]}
                        onChange={(value) =>
                          calculatorStore.setFormValue(content.index, content.id, parseFloat(value) ?? '')
                        }
                        max={content.max}
                        min={content.min}
                        style="col-span-2"
                        small
                      />
                    )}
                    {content.type === 'toggle' && (
                      <div className="flex items-center justify-center col-span-2">
                        <CheckboxInput
                          checked={calculatorStore.form[content.index]?.[content.id]}
                          onClick={(v) => calculatorStore.setFormValue(content.index, content.id, v)}
                        />
                      </div>
                    )}
                    {content.type === 'element' && (
                      <div className="flex items-center justify-center col-span-3">
                        <SelectInput
                          value={calculatorStore.form[content.index]?.[content.id]}
                          options={
                            content.options || [
                              { name: Element.PYRO, value: Element.PYRO },
                              { name: Element.HYDRO, value: Element.HYDRO },
                              { name: Element.CRYO, value: Element.CRYO },
                              { name: Element.ELECTRO, value: Element.ELECTRO },
                            ]
                          }
                          onChange={(value) => calculatorStore.setFormValue(content.index, content.id, value)}
                        />
                      </div>
                    )}
                  </div>
                )
            )
          ) : (
            <div className="text-center text-gray">None</div>
          )}
        </div>
      </div>
    )
  }
)
