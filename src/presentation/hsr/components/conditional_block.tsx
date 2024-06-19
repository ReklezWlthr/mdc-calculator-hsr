import { calcScaling } from '@src/core/utils/calculator'
import { toPercentage } from '@src/core/utils/converter'
import { useStore } from '@src/data/providers/app_store_provider'
import { IContent } from '@src/domain/conditional'
import { Element, Stats } from '@src/domain/constant'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { Tooltip } from '@src/presentation/components/tooltip'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Dispatch, SetStateAction, useState } from 'react'

interface IContentIndex extends IContent {
  index: number
}

interface ConditionalBlockProps {
  title: string
  contents: IContentIndex[]
  tooltipStyle?: string
}

export const ConditionalBlock = observer(({ title, contents, tooltipStyle = 'w-[40vw]' }: ConditionalBlockProps) => {
  const [open, setOpen] = useState(true)

  const { calculatorStore } = useStore()

  return (
    <div className="w-full rounded-lg bg-primary-darker h-fit">
      <p
        className={classNames(
          'px-2 py-1 text-lg font-bold text-center duration-300 cursor-pointer bg-primary-light',
          open ? 'rounded-t-lg' : 'rounded-lg'
        )}
        onClick={() => setOpen((prev) => !prev)}
      >
        {title}
        <i
          className={classNames('ml-2 text-base align-top fa-solid fa-caret-down duration-300', open && '-rotate-180')}
        />
      </p>
      <div className={classNames('space-y-3 duration-300 ease-out px-4 overflow-hidden', open ? 'h-fit py-3' : 'h-0')}>
        {_.size(contents) ? (
          _.map(_.orderBy(contents, ['debuff', 'unique'], ['desc', 'asc']), (content) => {
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

            const prob = content.chance?.fixed
              ? content.chance?.base
              : (content.chance?.base || 0) *
                (1 + calculatorStore.computedStats[content.index]?.getValue(Stats.EHR)) *
                (1 - 0.3)

            return (
              content.show && (
                <div className="grid items-center grid-cols-12 text-xs gap-x-1" key={content.id}>
                  <div className="col-span-5">
                    <Tooltip
                      title={
                        content.level ? (
                          <div className="flex items-center justify-between">
                            <p>{content.title}</p>
                            <p className="text-xs font-normal text-desc">Level: {content.level}</p>
                          </div>
                        ) : (
                          content.title
                        )
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
                    {content.debuff ? 'Debuff' : content.unique ? 'Other' : 'Buff'}
                  </div>
                  <div
                    className={classNames(
                      'text-xs text-center truncate col-span-2',
                      prob ? (prob <= 0.6 ? 'text-red' : prob <= 0.8 ? 'text-desc' : 'text-heal') : 'text-gray'
                    )}
                  >
                    {prob ? toPercentage(prob, 1) : '-'}
                  </div>
                  {content.type === 'number' && (
                    <>
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
                      <p className="col-span-1 px-1 text-center text-gray">
                        Max {content.max ? content.max.toLocaleString() : `\u{221e}`}
                      </p>
                    </>
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
                            { name: 'None', value: '' },
                            ..._.map(Element, (item) => ({ name: item, value: item })),
                          ]
                        }
                        onChange={(value) => calculatorStore.setFormValue(content.index, content.id, value)}
                        placeholder="None"
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
})
