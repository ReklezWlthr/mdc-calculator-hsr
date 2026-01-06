import { calcScaling } from '@src/core/utils/calculator'
import { chanceStringConstruct } from '@src/core/utils/constructor/chanceStringConstruct'
import { toPercentage } from '@src/core/utils/data_format'
import { findCharacter } from '@src/core/utils/finder'
import { StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import { GlobalContents, IContent } from '@src/domain/conditional'
import { Element, GlobalModifiers, ITeamChar, Stats, TalentProperty } from '@src/domain/constant'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { TagSelectInput } from '@src/presentation/components/inputs/tag_select_input'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { Tooltip } from '@src/presentation/components/tooltip'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Dispatch, SetStateAction, useState } from 'react'

export interface IContentIndex extends IContent {
  index: number
  owner?: number
}

export type FormSetterT = (key: string, value: any) => void

interface ConditionalBlockProps {
  tooltipStyle?: string
  formOverride?: GlobalModifiers
  teamOverride?: ITeamChar[]
  setForm?: FormSetterT
}

export const GlobalConditionalBlock = observer(
  ({ tooltipStyle = 'w-[40vw]', setForm, formOverride, teamOverride }: ConditionalBlockProps) => {
    const [open, setOpen] = useState(true)

    const { calculatorStore, teamStore, setupStore } = useStore()
    const global = formOverride || calculatorStore.globalMod
    const set = setForm || calculatorStore.setValue
    const team = teamOverride || teamStore.characters

    const contents = GlobalContents(team)

    return (
      <div className="w-full rounded-lg bg-primary-darker h-fit">
        <p
          className={classNames(
            'px-2 py-1 text-lg font-bold text-center duration-300 cursor-pointer bg-primary-light',
            open ? 'rounded-t-lg' : 'rounded-lg'
          )}
          onClick={() => setOpen((prev) => !prev)}
        >
          Global Modifiers
          <i
            className={classNames(
              'ml-2 text-base align-top fa-solid fa-caret-down duration-300',
              open && '-rotate-180'
            )}
          />
        </p>
        <div
          className={classNames('space-y-3 duration-300 ease-out px-4', open ? 'h-fit py-3' : 'h-0 overflow-hidden')}
        >
          {_.size(contents) ? (
            _.map(_.orderBy(contents, ['unique', 'debuff'], ['desc', 'desc']), (content) => {
              const formattedString = _.reduce(
                Array.from(content.content?.matchAll(/{{\d+}}\%?/g) || []),
                (acc, curr) => {
                  const index = curr?.[0]?.match(/\d+/)?.[0]
                  const isPercentage = !!curr?.[0]?.match(/\%$/)
                  return _.replace(
                    acc,
                    curr[0],
                    `<span class="text-desc">${_.round(
                      calcScaling(
                        content?.value?.[index]?.base,
                        content?.value?.[index]?.growth,
                        content?.level,
                        content?.value?.[index]?.style
                      ),
                      1
                    ).toLocaleString()}${isPercentage ? '%' : ''}</span>`
                  )
                },
                content.content
              )

              return (
                content.show && (
                  <div className="grid items-center grid-cols-12 text-xs gap-x-1" key={content.id}>
                    <div className="col-span-5">
                      <Tooltip
                        title={
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-xs font-normal opacity-75 text-gray">
                                {content.trace || 'Combat Environment'}
                              </p>
                              <p>{content.title}</p>
                            </div>
                            <div className="flex flex-col items-end">
                              {!!content.level && (
                                <p className="text-xs font-normal text-gray">
                                  Level: <span className="text-desc">{content.level}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        }
                        body={<p dangerouslySetInnerHTML={{ __html: formattedString }} />}
                        key={content.id}
                        style={tooltipStyle}
                        position="left"
                      >
                        <p className="w-full text-xs text-center text-white truncate">{content.text}</p>
                      </Tooltip>
                    </div>
                    <div
                      className={classNames(
                        'col-span-2 text-center',
                        content.debuff ? 'text-red' : content.unique ? 'text-desc' : 'text-blue'
                      )}
                    >
                      {content.debuff ? 'Debuff' : content.unique ? 'Unique' : 'Buff'}
                    </div>
                    <p className="col-span-2 text-xs text-center truncate text-gray">-</p>
                    {content.type === 'number' && (
                      <>
                        <TextInput
                          type="number"
                          value={global?.[content.id]}
                          onChange={(value) => set('globalMod', { ...global, [content.id]: value } as any)}
                          max={content.max as number}
                          min={content.min as number}
                          style="col-span-2"
                          small
                        />
                        <p className="col-span-1 px-1 text-center text-gray">
                          Max {content.max ? content.max.toLocaleString() : `\u{221e}`}
                        </p>
                      </>
                    )}
                    {content.type === 'toggle' && (
                      <div className="flex items-center justify-center col-span-2">
                        <CheckboxInput
                          checked={global?.[content.id]}
                          onClick={(v) => set('globalMod', { ...global, [content.id]: v } as any)}
                        />
                      </div>
                    )}
                    {content.type === 'element' && (
                      <div className="flex items-center justify-center col-span-3">
                        <SelectInput
                          value={global?.[content.id]}
                          options={
                            content.options || [
                              { name: 'None', value: '' },
                              ..._.map(Element, (item) => ({ name: item, value: item })),
                            ]
                          }
                          onChange={(value) => set('globalMod', { ...global, [content.id]: value } as any)}
                          placeholder="None"
                          small
                        />
                      </div>
                    )}
                    {content.type === 'multiple' && (
                      <div className="flex items-center justify-center col-span-3">
                        <TagSelectInput
                          values={global?.[content.id]}
                          options={content.options || []}
                          onChange={(value) => set('globalMod', { ...global, [content.id]: value } as any)}
                          placeholder="None"
                          small
                          onlyShowCount
                          panelStyle="w-[120px] right-0"
                        />
                      </div>
                    )}
                  </div>
                )
              )
            })
          ) : (
            <div className="text-center text-gray">None</div>
          )}
        </div>
      </div>
    )
  }
)
