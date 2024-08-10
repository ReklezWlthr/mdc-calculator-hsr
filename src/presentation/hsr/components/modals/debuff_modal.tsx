import { useStore } from '@src/data/providers/app_store_provider'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { BulletPoint, Collapsible } from '@src/presentation/components/collapsible'
import { AttributeBlock } from '@src/presentation/hsr/components/modals/stats_modal'
import { countDebuff, countDot } from '@src/core/utils/finder'
import { DebuffTypes } from '@src/domain/conditional'
import { StatsObject } from '@src/data/lib/stats/baseConstant'

interface DebuffModalProps {
  statsOverride?: StatsObject[]
  selectedOverride?: number
  debuffOverride?: {
    type: DebuffTypes
    count: number
  }[]
  setup?: string
}

export const DebuffModal = observer(({ statsOverride, selectedOverride, debuffOverride, setup }: DebuffModalProps) => {
  const { calculatorStore } = useStore()
  const { computedStats, selected } = calculatorStore

  const allStats = statsOverride || computedStats
  const stats = allStats[selectedOverride ?? selected]

  const DoTBlock = ({ type }: { type: DebuffTypes }) => (
    <div className="space-y-1">
      <p className="font-bold text-white">{type}</p>
      <div className="space-y-1 text-xs">
        {_.map(
          _.groupBy(
            _.filter(
              _.flatMap(allStats, (item) => item.DOT_SCALING),
              (item) => _.includes([type, DebuffTypes.DOT], item.dotType)
            ),
            'overrideIndex'
          ),
          (item, index) => (
            <BulletPoint key={index}>
              {allStats[index].NAME} - <span className="text-desc">{_.size(item)}</span>
            </BulletPoint>
          )
        )}
        <BulletPoint key="total">
          <b>Total Count</b> -{' '}
          <span className="text-red">{countDot(debuffOverride || calculatorStore.debuffs, type)}</span>
        </BulletPoint>
      </div>
    </div>
  )

  return (
    <div className="w-[50vw] p-4 text-white rounded-xl bg-primary-dark space-y-3 font-semibold">
      <div className="flex items-end justify-between">
        <p className="font-bold">
          Debuff Breakdown{!!setup && <span className="ml-2 text-sm font-normal text-gray">[{setup}]</span>}
        </p>
        <p className="text-sm">
          Debuff Count: <span className="text-red">{countDebuff(debuffOverride || calculatorStore.debuffs)}</span>
        </p>
      </div>
      <Collapsible
        label={
          <div className="flex items-center gap-2">
            <p>Attribute Reduction</p>
            <div className="flex items-center justify-center w-6 h-6 text-sm rounded-md bg-primary-light">
              {_.size(
                _.concat(
                  stats.ATK_REDUCTION,
                  stats.DEF_REDUCTION,
                  stats.SPD_REDUCTION,
                  stats.E_RES_RED,
                  stats.EHR_RED,
                  stats.WEAKEN
                )
              ) + (countDebuff(debuffOverride || calculatorStore.debuffs, DebuffTypes.IMPRISON) ? 1 : 0)}
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-2">
            <AttributeBlock stats={stats} stat="ATK Reduction" array={stats.ATK_REDUCTION} />
            <AttributeBlock stats={stats} stat="DEF Reduction" array={stats.DEF_REDUCTION} />
            <AttributeBlock
              stats={stats}
              stat="SPD Reduction"
              array={
                countDebuff(debuffOverride || calculatorStore.debuffs, DebuffTypes.IMPRISON)
                  ? [
                      ...stats.SPD_REDUCTION,
                      {
                        name: `Auto-Application`,
                        source: 'Imprisonment',
                        value: 0.1,
                      },
                    ]
                  : stats.SPD_REDUCTION
              }
            />
          </div>
          <div className="space-y-2">
            <AttributeBlock stats={stats} stat="Effect RES Reduction" array={stats.E_RES_RED} />
            <AttributeBlock stats={stats} stat="Effect Hit Rate Reduction" array={stats.EHR_RED} />
            <AttributeBlock stats={stats} stat="Weakened" array={stats.WEAKEN} />
          </div>
        </div>
      </Collapsible>
      <Collapsible
        label={
          <div className="flex items-center gap-2">
            <p>Vulnerability</p>
            <div className="flex items-center justify-center w-6 h-6 text-sm rounded-md bg-primary-light">
              {_.size(
                _.concat(
                  stats.VULNERABILITY,
                  stats.DOT_VUL,
                  stats.FUA_VUL,
                  stats.BREAK_VUL,
                  stats.ULT_VUL,
                  stats.FIRE_VUL
                )
              )}
            </div>
          </div>
        }
      >
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
      <Collapsible
        label={
          <div className="flex items-center gap-2">
            <p>DMG RES Reduction</p>
            <div className="flex items-center justify-center w-6 h-6 text-sm rounded-md bg-primary-light">
              {_.size(
                _.concat(
                  stats.ALL_TYPE_RES_RED,
                  stats.PHYSICAL_RES_RED,
                  stats.FIRE_RES_RED,
                  stats.ICE_RES_RED,
                  stats.LIGHTNING_RES_RED,
                  stats.WIND_RES_RED,
                  stats.QUANTUM_RES_RED,
                  stats.IMAGINARY_RES_RED
                )
              )}
            </div>
          </div>
        }
      >
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
      <Collapsible
        label={
          <div className="flex items-center gap-2">
            <p>Damage Over Time</p>
            <div className="flex items-center justify-center w-6 h-6 text-sm rounded-md bg-primary-light">
              {countDot(debuffOverride || calculatorStore.debuffs)}
            </div>
          </div>
        }
      >
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
      <Collapsible
        label={
          <div className="flex items-center gap-2">
            <p>Miscellaneous</p>
            <div className="flex items-center justify-center w-6 h-6 text-sm rounded-md bg-primary-light">
              {_.size(stats.ADD_DEBUFF)}
            </div>
          </div>
        }
      >
        <div className="space-y-1 text-xs">
          {_.map(stats.ADD_DEBUFF, (item) => (
            <BulletPoint key={item.source + item.name}>
              {item.source} / <span className="text-desc">{item.name}</span>
            </BulletPoint>
          ))}
        </div>
      </Collapsible>
    </div>
  )
})
