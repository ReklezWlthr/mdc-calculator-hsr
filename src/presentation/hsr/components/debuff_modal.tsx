import { useStore } from '@src/data/providers/app_store_provider'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { BulletPoint, Collapsible } from '@src/presentation/components/collapsible'
import { AttributeBlock } from './stats_modal'
import { countDebuff, countDot } from '@src/core/utils/finder'
import { DebuffTypes } from '../../../domain/conditional'

export const DebuffModal = observer(() => {
  const { calculatorStore } = useStore()
  const { computedStats, selected } = calculatorStore

  const stats = computedStats[selected]

  const DoTBlock = ({ type }: { type: DebuffTypes }) => (
    <div className="space-y-1">
      <p className="font-bold text-white">{type}</p>
      <div className="space-y-1 text-xs">
        {_.map(
          _.groupBy(
            _.filter(
              _.flatMap(calculatorStore.computedStats, (item) => item.DOT_SCALING),
              (item) => _.includes([type, DebuffTypes.DOT], item.dotType)
            ),
            'overrideIndex'
          ),
          (item, index) => (
            <BulletPoint key={index}>
              {calculatorStore.computedStats[index].NAME} - <span className="text-desc">{_.size(item)}</span>
            </BulletPoint>
          )
        )}
        <BulletPoint key="total">
          <b>Total Count</b> - <span className="text-red">{countDot(calculatorStore.debuffs, type)}</span>
        </BulletPoint>
      </div>
    </div>
  )

  return (
    <div className="w-[50vw] p-4 text-white rounded-xl bg-primary-dark space-y-3 font-semibold">
      <div className="flex items-end justify-between">
        <p>Debuffs</p>
        <p className="text-sm">
          Debuff Count: <span className="text-red">{countDebuff(calculatorStore.debuffs)}</span>
        </p>
      </div>
      <Collapsible label="Attribute Reduction">
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-2">
            <AttributeBlock stats={stats} stat="ATK Reduction" array={stats.ATK_REDUCTION} />
            <AttributeBlock stats={stats} stat="DEF Reduction" array={stats.DEF_REDUCTION} />
            <AttributeBlock stats={stats} stat="SPD Reduction" array={stats.SPD_REDUCTION} />
          </div>
          <div className="space-y-2">
            <AttributeBlock stats={stats} stat="Effect RES Reduction" array={stats.E_RES_RED} />
            <AttributeBlock stats={stats} stat="Effect Hit Rate Reduction" array={stats.EHR_RED} />
            <AttributeBlock stats={stats} stat="Weakened" array={stats.WEAKEN} />
          </div>
        </div>
      </Collapsible>
      <Collapsible label="Vulnerability">
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-2">
            <AttributeBlock stats={stats} stat="All-Type Vulnerability" array={stats.VULNERABILITY} />
            <AttributeBlock stats={stats} stat="DoT Vulnerability" array={stats.DOT_VUL} />
            <AttributeBlock stats={stats} stat="Follow-Up DMG Vulnerability" array={stats.FUA_VUL} />
          </div>
          <div className="space-y-2">
            <AttributeBlock stats={stats} stat="Break DMG Vulnerability" array={stats.BREAK_VUL} />
            <AttributeBlock stats={stats} stat="Ultimate Vulnerability" array={stats.ULT_VUL} />
            <AttributeBlock stats={stats} stat="Fire DMG Vulnerability" array={stats.FIRE_VUL} />
          </div>
        </div>
      </Collapsible>
      <Collapsible label="DMG RES Reduction">
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-2">
            <AttributeBlock stats={stats} stat="All-Type RES Reduction" array={stats.ALL_TYPE_RES_RED} />
            <AttributeBlock stats={stats} stat="Physical RES Reduction" array={stats.PHYSICAL_RES_RED} />
            <AttributeBlock stats={stats} stat="Fire RES Reduction" array={stats.FIRE_RES_RED} />
            <AttributeBlock stats={stats} stat="Ice RES Reduction" array={stats.ICE_RES_RED} />
          </div>
          <div className="space-y-2">
            <AttributeBlock stats={stats} stat="Lightning RES Reduction" array={stats.LIGHTNING_RES_RED} />
            <AttributeBlock stats={stats} stat="Wind RES Reduction" array={stats.WIND_RES_RED} />
            <AttributeBlock stats={stats} stat="Quantum RES Reduction" array={stats.QUANTUM_RES_RED} />
            <AttributeBlock stats={stats} stat="Imaginary RES Reduction" array={stats.IMAGINARY_RES_RED} />
          </div>
        </div>
      </Collapsible>
      <Collapsible label="Damage Over Time">
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-2">
            <DoTBlock type={DebuffTypes.BLEED} />
            <DoTBlock type={DebuffTypes.BURN} />
          </div>
          <div className="space-y-2">
            <DoTBlock type={DebuffTypes.SHOCKED} />
            <DoTBlock type={DebuffTypes.WIND_SHEAR} />
          </div>
        </div>
      </Collapsible>
      {/* <Collapsible label="Crowd Control">
        <div className="grid grid-cols-2 gap-10"></div>
      </Collapsible> */}
    </div>
  )
})
