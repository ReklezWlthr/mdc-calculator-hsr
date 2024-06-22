import { useStore } from '@src/data/providers/app_store_provider'
import { Element } from '@src/domain/constant'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import _ from 'lodash'
import classNames from 'classnames'
import { BaseElementColor } from './tables/scaling_sub_rows'
import { toPercentage } from '@src/core/utils/converter'
import { observer } from 'mobx-react-lite'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { TagSelectInput } from '@src/presentation/components/inputs/tag_select_input'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { Enemies } from '@src/data/db/enemies'
import { SelectTextInput } from '@src/presentation/components/inputs/select_text_input'

export const EnemyModal = observer(() => {
  const { calculatorStore, teamStore, settingStore } = useStore()
  const { res, level, computedStats, selected } = calculatorStore
  const charLevel = teamStore.characters[calculatorStore.selected]?.level
  const rawDef = 10 * level + 200
  const pen = computedStats[selected]?.getValue(StatsObjectKeys.DEF_PEN)
  const red = computedStats[selected]?.getValue(StatsObjectKeys.DEF_REDUCTION)
  const def = _.max([rawDef * (1 - pen - red), 0])
  const defMult = calculatorStore.getDefMult(charLevel, pen, red)

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
            value={calculatorStore.enemy}
            onChange={(v) => {
              calculatorStore.setValue('enemy', v?.value)
              const enemyData = _.find(Enemies, (item) => item.name === v?.value)
              if (enemyData) {
                calculatorStore.setValue(
                  'res',
                  _.mapValues(enemyData?.res, (item) => item * 100)
                )
                calculatorStore.setValue('weakness', enemyData?.weakness)
                calculatorStore.setValue('hp', enemyData?.baseHp)
                calculatorStore.setValue('toughness', enemyData?.toughness)
                calculatorStore.setValue('effRes', enemyData?.effRes)
              }
            }}
            options={_.map(enemies, (item) => ({
              name: item.name,
              value: item.name,
            }))}
            placeholder="Custom"
          />
        </div>
        <div className="flex flex-col gap-y-1">
          <p className="text-sm">Level</p>
          <TextInput
            type="number"
            min={1}
            value={level.toString()}
            onChange={(value) => calculatorStore.setValue('level', parseFloat(value) || 0)}
            style="w-[80px]"
          />
        </div>
      </div>
      <div className="flex flex-col w-full gap-y-1">
        <p className="text-sm">Weaknesses</p>
        <TagSelectInput
          values={calculatorStore.weakness}
          placeholder="No Weakness"
          options={_.map(Element, (item) => ({ name: item, value: item }))}
          onChange={(values) => calculatorStore.setValue('weakness', values as any)}
          disabled={!!calculatorStore.enemy}
        />
      </div>
      <div className="flex justify-between gap-4">
        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="flex flex-col w-full gap-y-1">
              <p className="text-sm">Max HP</p>
              <TextInput
                value={calculatorStore.hp?.toString()}
                onChange={(values) => calculatorStore.setValue('hp', values as any)}
                min={0}
                disabled={!!calculatorStore.enemy}
              />
            </div>
            <div className="flex flex-col w-full gap-y-1">
              <p className="text-sm">Toughness</p>
              <TextInput
                value={calculatorStore.toughness?.toString()}
                onChange={(values) => calculatorStore.setValue('toughness', values as any)}
                min={0}
                disabled={!!calculatorStore.enemy}
              />
            </div>
            <div className="flex flex-col w-full gap-y-1">
              <p className="text-sm">Effect RES</p>
              <div className="flex items-center gap-x-2">
                <TextInput
                  value={(calculatorStore.effRes * 100)?.toString()}
                  onChange={(value) => calculatorStore.setValue('effRes', (Number(value) / 100) as any)}
                  disabled={!!calculatorStore.enemy}
                />
                {calculatorStore.level >= 51 && <p className='text-xs font-normal'>+{_.min([10, 0.4 * (calculatorStore.level - 50)]).toFixed(1)}%</p>}
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
                  ((<b className="text-red">{level}</b> &#215; 10) + 200)
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
            <div className="flex items-center pt-2 gap-x-3">
              <p className="text-sm font-normal">Weakness Broken</p>
              <CheckboxInput
                checked={calculatorStore.broken}
                onClick={() => calculatorStore.setValue('broken', !calculatorStore.broken)}
              />
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
