import { useStore } from '@src/data/providers/app_store_provider'
import { Element } from '@src/domain/constant'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import _ from 'lodash'
import classNames from 'classnames'
import { BaseElementColor } from '@src/presentation/hsr/components/tables/scaling_sub_rows'
import { toPercentage } from '@src/core/utils/converter'
import { observer } from 'mobx-react-lite'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { TagSelectInput } from '@src/presentation/components/inputs/tag_select_input'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { Enemies } from '@src/data/db/enemies'
import { SelectTextInput } from '@src/presentation/components/inputs/select_text_input'
import { EnemyHpScaling } from '@src/domain/scaling'
import { Tooltip } from '@src/presentation/components/tooltip'
import { countDebuff } from '@src/core/utils/finder'

export const EnemyModal = observer(({ stats, compare }: { stats: StatsObject; compare?: boolean }) => {
  const { calculatorStore, teamStore, settingStore, setupStore } = useStore()
  const store = compare ? setupStore : calculatorStore
  const setValue: (key: string, value: any) => void = store.setValue
  const { res, level, enemy } = compare ? setupStore : calculatorStore
  const isTrotter = _.includes(enemy, 'Trot')
  const charLevel = teamStore.characters[calculatorStore.selected]?.level
  const rawDef = isTrotter ? 15 * (+level || 1) + 300 : 10 * (+level || 1) + 200
  const pen = stats?.getValue(StatsObjectKeys.DEF_PEN) || 0
  const red = stats?.getValue(StatsObjectKeys.DEF_REDUCTION) || 0
  const def = _.max([rawDef * (1 - pen - red), 0])
  const defMult = store.getDefMult(charLevel, pen, red)

  const enemies = settingStore.settings.variant
    ? Enemies
    : _.filter(Enemies, (item) => !item.name.match(/\((Complete|Bug|Complete - G&G)\)/g))

  return (
    <div className="w-[550px] p-4 text-white rounded-xl bg-primary-dark space-y-3 font-semibold">
      <p>Target Enemy Setting</p>
      <div className="flex gap-4">
        <div className="flex flex-col w-full gap-y-1">
          <p className="text-sm">Enemy Preset</p>
          <SelectTextInput
            value={enemy}
            onChange={(v) => {
              setValue('enemy', v?.value)
              const enemyData = _.find(Enemies, (item) => item.name === v?.value)
              if (enemyData) {
                setValue(
                  'res',
                  _.mapValues(enemyData?.res, (item) => item * 100)
                )
                setValue('weakness', enemyData?.weakness)
                setValue('hp', _.round((enemyData?.baseHp / _.head(EnemyHpScaling)) * EnemyHpScaling[+level - 1]))
                setValue('toughness', enemyData?.toughness)
                setValue('effRes', enemyData?.effRes)
              }
            }}
            options={_.map(enemies, (item) => ({
              name: item.name,
              value: item.name,
            })).sort((a, b) => a.name.localeCompare(b.name))}
            placeholder="Custom"
          />
        </div>
        <div className="flex flex-col gap-y-1">
          <p className="text-sm">Level</p>
          <TextInput
            type="number"
            min={1}
            value={level.toString()}
            onChange={(value) => {
              const enemyData = _.find(Enemies, (item) => item.name === enemy)
              if (enemyData)
                setValue(
                  'hp',
                  _.round((enemyData?.baseHp / _.head(EnemyHpScaling)) * EnemyHpScaling[(Number(value) || 1) - 1])
                )
              setValue('level', value === '' ? '' : value)
            }}
            style="w-[80px]"
          />
        </div>
      </div>
      <div className="flex flex-col w-full gap-y-1">
        <p className="text-sm">Innate Weaknesses</p>
        <TagSelectInput
          values={store.weakness}
          placeholder="No Weakness"
          options={_.map(Element, (item) => ({ name: item, value: item }))}
          onChange={(values) => setValue('weakness', values as any)}
          disabled={!!enemy}
        />
      </div>
      <div className="flex justify-between gap-4">
        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="flex flex-col w-full gap-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm">Max HP</p>
                <Tooltip
                  title="Enemy Max HP"
                  body={
                    <p className="font-normal">
                      The calculator will try to scale the target's Max HP and automatically fills the value, but the
                      value may be inaccurate. Feel free to change it.
                      <br />
                      Currently, this value is only used to calculate Bleed DMG, so in most cases, it will not affect
                      the calculation. Additionally, most high-level bosses have so much HP that the Bleed DMG will be
                      capped out before the result starts to become inaccurate.
                    </p>
                  }
                  style="w-[450px]"
                >
                  <i className="fa-regular fa-question-circle text-gray" />
                </Tooltip>
              </div>
              <TextInput value={store.hp?.toString()} onChange={(values) => setValue('hp', values as any)} min={0} />
            </div>
            <div className="flex flex-col w-full gap-y-1">
              <p className="text-sm">Toughness</p>
              <TextInput
                value={store.toughness?.toString()}
                onChange={(values) => setValue('toughness', values as any)}
                min={0}
                disabled={!!store.enemy}
              />
            </div>
            <div className="flex flex-col w-full gap-y-1">
              <p className="text-sm">Effect RES</p>
              <div className="flex items-center gap-x-2">
                <TextInput
                  value={(store.effRes * 100)?.toString()}
                  onChange={(value) => setValue('effRes', (Number(value) / 100) as any)}
                  disabled={!!store.enemy}
                />
                {+level >= 51 && <p className="text-xs font-normal">+{_.min([10, 0.4 * (+level - 50)]).toFixed(1)}%</p>}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-y-1">
            <p>DEF</p>
            <div className="flex items-start px-2 py-1 text-sm font-normal rounded-lg gap-x-2 bg-primary-darker w-fit text-gray">
              <p className="font-bold text-yellow">{_.round(def).toLocaleString()}</p>
              <p>=</p>
              <div className="flex flex-wrap items-center gap-x-2">
                <p>
                  ({isTrotter ? 300 : 200} + {isTrotter ? 15 : 10} &#215; <b className="text-red">{level || 1}</b>)
                </p>
                {!!(pen || red) && (
                  <p>
                    &#215;
                    <span className="ml-2">
                      (1 - {!!pen && <b className="text-red">{toPercentage(pen)}</b>}
                      {!!(pen && red) && ` - `}
                      {!!red && <b className="text-desc">{toPercentage(red)}</b>})
                    </span>
                  </p>
                )}
              </div>
            </div>
            {!!pen && (
              <p className="ml-2 text-xs font-normal">
                <span className="text-desc">✦</span> DEF PEN: <span className="text-red">{toPercentage(pen)}</span>
              </p>
            )}
            {!!red && (
              <p className="ml-2 text-xs font-normal">
                <span className="text-desc">✦</span> DEF Reduction:{' '}
                <span className="text-desc">{toPercentage(red)}</span>
              </p>
            )}
            <p className="pt-2">DEF Multiplier</p>
            <div className="flex items-center gap-2 px-2 py-1 text-sm font-normal rounded-lg bg-primary-darker w-fit text-gray">
              <p className="font-bold text-orange-300">{toPercentage(defMult)}</p>
              <p>= 1 - </p>
              <div className="flex flex-col gap-y-1">
                <p className="text-center">
                  <b className="text-yellow">{_.round(def).toLocaleString()}</b>
                </p>
                <div className="h-0 border-[1.5px] border-primary-border" />
                <p className="text-center">
                  <b className="text-yellow">{_.round(def).toLocaleString()}</b> + (
                  <b className="text-blue">{charLevel}</b> &#215; 10) + 200
                </p>
              </div>
            </div>
            <div className="flex items-center pt-2">
              <p className="text-sm font-normal">Weakness Broken</p>
              <Tooltip
                title="Weakness Broken"
                body={
                  <p className="font-normal">
                    This toggle only affects the Weakness Broken DMG Multiplier and enables some mechanics that require
                    attacking a Weakness Broken enemy (e.g. Boothill's Talent or Ruan Mei's E2). Super Break are enabled
                    by default and is not tied to this toggle.
                    <br />
                    For debuffs related to Weakness Break, please refer to the toggles in the{' '}
                    <span className="text-desc">Modifiers</span> tab.
                  </p>
                }
                style="w-[450px]"
              >
                <i className="pl-2 pr-3 fa-regular fa-question-circle text-gray" />
              </Tooltip>
              <CheckboxInput checked={store.broken} onClick={() => setValue('broken', !store.broken)} />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-y-3">
          {_.map(BaseElementColor, (item, key: Element) => (
            <div className="flex items-center gap-3" key={key}>
              <p className={classNames('whitespace-nowrap text-sm', item)}>{key} RES</p>
              <TextInput
                type="number"
                value={res[key].toString()}
                onChange={(value) => calculatorStore.setRes(key, value as any as number)}
                style="!w-[50px]"
                disabled={!!calculatorStore.enemy}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
