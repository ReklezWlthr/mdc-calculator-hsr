import { useStore } from '@src/data/providers/app_store_provider'
import { IContent } from '@src/domain/conditional'
import { Element, ITeamChar, Stats, TalentProperty } from '@src/domain/constant'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { Tooltip } from '@src/presentation/components/tooltip'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Dispatch, SetStateAction, useState } from 'react'
import { LCTooltip } from '@src/presentation/hsr/components/lc_block'
import { findCharacter } from '@src/core/utils/finder'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { toPercentage } from '@src/core/utils/converter'
import { StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { FormSetterT } from '@src/presentation/hsr/components/conditionals/conditional_block'
import { chanceStringConstruct } from '@src/core/utils/constructor/chanceStringConstruct'

export interface IContentIndexOwner extends IContent {
  index: number
  owner?: number
}

interface ConditionalBlockProps {
  contents: IContentIndexOwner[]
  tooltipStyle?: string
  formOverride?: Record<string, any>[]
  teamOverride?: ITeamChar[]
  setForm?: FormSetterT
  compare?: boolean
}

export const WeaponConditionalBlock = observer(
  ({ contents, formOverride, teamOverride, setForm, compare }: ConditionalBlockProps) => {
    const [open, setOpen] = useState(true)

    const { calculatorStore, teamStore, setupStore } = useStore()
    const form = formOverride || calculatorStore.form
    const team = teamOverride || teamStore.characters
    const set = setForm || calculatorStore.setFormValue

    return (
      <div className="w-full rounded-lg bg-primary-darker h-fit">
        <p
          className={classNames(
            'px-2 py-1 text-lg font-bold text-center duration-300 cursor-pointer bg-primary-light',
            open ? 'rounded-t-lg' : 'rounded-lg'
          )}
          onClick={() => setOpen((prev) => !prev)}
        >
          Light Cone Modifiers
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
            _.map(contents, (content) => {
              const stats = calculatorStore.computedStats[content.index]
              const { prob, ProbComponent } = chanceStringConstruct(
                compare ? setupStore : calculatorStore,
                stats,
                content.chance?.base,
                content.chance?.fixed,
                content.debuffElement
              )

              return (
                content.show && (
                  <div
                    className="grid items-center grid-cols-12 text-xs gap-x-1"
                    key={content.id + (content.owner || content.index)}
                  >
                    <div className="col-span-5">
                      <LCTooltip
                        wId={_.split(content.id, '_')[0]}
                        refinement={
                          team[content.owner || content.index]?.equipments?.weapon?.refinement
                        }
                        position="left"
                      >
                        <p className="w-full text-xs text-center text-white truncate">
                          {content.owner && `${findCharacter(team[content.owner]?.cId)?.name}'s `}
                          {content.text}
                        </p>
                      </LCTooltip>
                    </div>
                    <div className={classNames('col-span-2 text-center', content.debuff ? 'text-red' : 'text-blue')}>
                      {content.debuff ? 'Debuff' : 'Buff'}
                    </div>
                    {content.chance?.base ? (
                      <Tooltip
                        title="Real Effect Hit Chance"
                        body={<ProbComponent />}
                        style="w-[400px]"
                        containerStyle="col-span-2"
                      >
                        <div
                          className={classNames(
                            'text-xs text-center truncate',
                            content.chance?.base
                              ? prob <= 0.6
                                ? 'text-red'
                                : prob <= 0.8
                                ? 'text-desc'
                                : 'text-heal'
                              : 'text-gray'
                          )}
                        >
                          {toPercentage(prob, 1)}
                        </div>
                      </Tooltip>
                    ) : (
                      <p className="col-span-2 text-xs text-center truncate text-gray">-</p>
                    )}
                    {content.type === 'number' && (
                      <>
                        <TextInput
                          type="number"
                          value={form[content.index]?.[content.id]}
                          onChange={(value) => set(content.index, content.id, parseFloat(value) ?? '')}
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
                          checked={form[content.index]?.[content.id]}
                          onClick={(v) => set(content.index, content.id, v)}
                        />
                      </div>
                    )}
                    {content.type === 'element' && (
                      <div className="flex items-center justify-center col-span-3">
                        <SelectInput
                          value={form[content.index]?.[content.id]}
                          options={
                            content.options || [
                              { name: 'None', value: '' },
                              ..._.map(Element, (item) => ({ name: item, value: item })),
                            ]
                          }
                          onChange={(value) => set(content.index, content.id, value)}
                          placeholder="None"
                          small
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
