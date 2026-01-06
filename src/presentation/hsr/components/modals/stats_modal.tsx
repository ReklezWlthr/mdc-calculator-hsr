import { toPercentage } from '@src/core/utils/data_format'
import { getTurnWithinCycle } from '@src/core/utils/data_format'
import { checkBuffExist } from '@src/core/utils/finder'
import { StatsArray, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import { BaseAggro, BaseSummonAggro, BreakPoints, PathType, Stats } from '@src/domain/constant'
import { BaseStatsType } from '@src/domain/stats'
import { BulletPoint, Collapsible } from '@src/presentation/components/collapsible'
import { Tooltip } from '@src/presentation/components/tooltip'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

interface NormalBlockProps {
  stat: React.ReactNode
  array: StatsArray[]
  stats: BaseStatsType
}

interface ExtraBlockProps {
  stats: string
  totalValue: string
  cBase: number
  lBase?: number
  pArray: StatsArray[]
  fArray: StatsArray[]
  round?: number
}

export const AttributeBlock = ({ stat, array, stats }: NormalBlockProps) => (
  <div className="space-y-1">
    <div className="font-bold text-white">
      {stat}{' '}
      <span className="text-red">
        {toPercentage(stat === 'DMG Reduction' ? stats.getDmgRed() : _.sumBy(array, (item) => item.value))}
      </span>
    </div>
    <div className="space-y-1 text-xs">
      {_.map(
        array,
        (item) =>
          !!item.value && (
            <BulletPoint key={item.source + item.name}>
              {item.source} / {item.name} <span className="text-desc">{toPercentage(item.value)}</span>
              {!!item.base && !!item.multiplier && (
                <>
                  {' '}
                  = {_.isNumber(item.base) ? _.floor(item.base).toLocaleString() : item.base} {`\u{00d7}`}{' '}
                  <span className="text-blue">{toPercentage(item.multiplier)}</span>
                  {item.flat && (
                    <>
                      {' '}
                      +{' '}
                      <span className="text-heal">
                        {_.isNumber(item.flat) ? _.floor(item.flat).toLocaleString() : item.flat}
                      </span>
                    </>
                  )}
                </>
              )}
            </BulletPoint>
          )
      )}
    </div>
  </div>
)

export const StatsModal = observer(
  ({
    stats,
    path,
    sumAggro,
    compare,
    memo,
  }: {
    stats: BaseStatsType
    path: PathType
    sumAggro: number
    compare?: boolean
    memo?: boolean
  }) => {
    const { calculatorStore, setupStore } = useStore()

    const ExtraBlock = ({ stats, totalValue, cBase, lBase = 0, pArray, fArray, round = 0 }: ExtraBlockProps) => (
      <div className="space-y-1">
        <p className="font-bold text-white">
          {stats} <span className="text-red">{totalValue}</span>
        </p>
        <div className="space-y-1 text-xs">
          <BulletPoint>
            Character Base {stats} <span className="text-desc">{_.floor(cBase, round).toLocaleString()}</span>
          </BulletPoint>
          {!!lBase && (
            <BulletPoint>
              Light Cone Base {stats} <span className="text-desc">{_.floor(lBase, round).toLocaleString()}</span>
            </BulletPoint>
          )}
          {_.map(pArray, (item) => {
            const c = _.floor((cBase + lBase) * item.value, round).toLocaleString()
            return (
              !!item.value && (
                <BulletPoint key={item.source + item.name}>
                  {item.source} / {item.name} <span className="text-desc">{c}</span> ={' '}
                  {_.floor(cBase + lBase, round).toLocaleString()} {`\u{00d7}`}{' '}
                  <span className="text-blue">{toPercentage(item.value)}</span>
                </BulletPoint>
              )
            )
          })}
          {_.map(
            fArray,
            (item) =>
              !!item.value && (
                <BulletPoint key={item.source + item.name}>
                  {item.source} / {item.name}{' '}
                  <span className="text-desc">{_.round(item.value, round).toLocaleString()}</span>
                  {!!item.base && !!item.multiplier && (
                    <>
                      {' '}
                      = {_.isNumber(item.base) ? _.floor(item.base).toLocaleString() : item.base} {`\u{00d7}`}{' '}
                      <span className="text-blue">{toPercentage(item.multiplier)}</span>
                      {item.flat && (
                        <>
                          {' + '}
                          <span className="text-heal">
                            {_.isNumber(item.flat) ? _.floor(item.flat).toLocaleString() : item.flat}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </BulletPoint>
              )
          )}
          {stats === 'Aggro' && (
            <>
              <BulletPoint color="text-desc">
                Total Aggro <span className="text-desc">{sumAggro.toLocaleString()}</span>
              </BulletPoint>
              <BulletPoint color="text-red">
                Target Probability (Memosprites included){' '}
                <span className="text-desc">
                  {toPercentage(+totalValue.replaceAll(',', '') / sumAggro).toLocaleString()}
                </span>
              </BulletPoint>
            </>
          )}
        </div>
      </div>
    )

    const baseAggro =
      (memo ? BaseSummonAggro[stats.SUMMON_ID] : BaseAggro[path]) * (1 + stats.getValue(StatsObjectKeys.BASE_AGGRO))
    const defMult =
      1 - stats.getDef() / (stats.getDef() + 200 + 10 * +(compare ? setupStore.level : calculatorStore.level))

    const breakPoint = _.min(_.filter(_.map(BreakPoints, 'value'), (item) => item >= 10000 / stats.getSpd()))
    const bpDesc = _.find(BreakPoints, (item) => item.value === breakPoint)?.desc

    const mergeBuffs = (arr: StatsArray[]) =>
      _.reduce(
        arr,
        (acc, curr) => {
          const exist = _.find(acc, (item) => item.name === curr.name && item.source === curr.source)
          if (exist) {
            exist.value += curr.value
            exist.base = curr.base
            exist.multiplier = (exist.multiplier || 0) + curr.multiplier || 0
          } else {
            acc.push(curr)
          }
          return _.cloneDeep(acc)
        },
        []
      )

    return (
      <div className="w-[65vw] bg-primary-dark rounded-lg p-3 space-y-2">
        <p className="text-lg font-bold text-white">Stats Breakdown: {stats?.NAME}</p>
        <Collapsible label="Common Attributes">
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-2">
              <ExtraBlock
                stats="HP"
                cBase={memo ? stats?.BASE_HP : stats.BASE_HP_C}
                lBase={memo ? 0 : stats.BASE_HP_L}
                totalValue={_.floor(memo ? stats?.BASE_HP : stats.getHP()).toLocaleString()}
                pArray={stats[Stats.P_HP]}
                fArray={mergeBuffs(_.concat(stats[Stats.HP], stats.X_HP))}
              />
              <ExtraBlock
                stats="ATK"
                cBase={memo ? stats?.BASE_ATK : stats.BASE_ATK_C}
                lBase={memo ? 0 : stats.BASE_ATK_L}
                totalValue={_.floor(stats.getAtk()).toLocaleString()}
                pArray={stats[Stats.P_ATK]}
                fArray={mergeBuffs(_.concat(stats[Stats.ATK], stats.X_ATK))}
              />
              <ExtraBlock
                stats="DEF"
                cBase={memo ? stats?.BASE_DEF : stats.BASE_DEF_C}
                lBase={memo ? 0 : stats.BASE_DEF_L}
                totalValue={_.floor(stats.getDef()).toLocaleString()}
                pArray={stats[Stats.P_DEF]}
                fArray={stats[Stats.DEF]}
              />
              <ExtraBlock
                stats="SPD"
                cBase={stats.BASE_SPD}
                totalValue={_.floor(stats.getSpd(), 1).toLocaleString()}
                pArray={stats[Stats.P_SPD]}
                fArray={stats[Stats.SPD]}
                round={1}
              />
            </div>
            <div className="space-y-2">
              <AttributeBlock stats={stats} stat="CRIT Rate" array={stats[Stats.CRIT_RATE]} />
              <AttributeBlock stats={stats} stat="CRIT DMG" array={_.concat(stats[Stats.CRIT_DMG], stats.X_CRIT_DMG)} />
              <AttributeBlock stats={stats} stat="Break Effect" array={stats[Stats.BE]} />
              <AttributeBlock stats={stats} stat="Outgoing Healing" array={stats[Stats.HEAL]} />
              <AttributeBlock stats={stats} stat="Energy Regen Rate" array={stats[Stats.ERR]} />
              <AttributeBlock stats={stats} stat="Effect Hit Rate" array={stats[Stats.EHR]} />
              <AttributeBlock stats={stats} stat="Effect RES" array={stats[Stats.E_RES]} />
            </div>
          </div>
        </Collapsible>
        <Collapsible label="Elation Attributes">
          <div className="space-y-2">
            <AttributeBlock stats={stats} stat="Elation" array={_.concat(stats[Stats.ELATION], stats.X_ELATION)} />
            <AttributeBlock stats={stats} stat="Merrymake" array={stats.ELATION_MERRYMAKE} />
          </div>
        </Collapsible>
        <Collapsible label="DMG Bonuses">
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-2">
              <AttributeBlock stats={stats} stat="All-Type DMG Bonus" array={stats[Stats.ALL_DMG]} />
              <AttributeBlock stats={stats} stat="Physical DMG Bonus" array={stats[Stats.PHYSICAL_DMG]} />
              <AttributeBlock stats={stats} stat="Fire DMG Bonus" array={stats[Stats.FIRE_DMG]} />
              <AttributeBlock stats={stats} stat="Ice DMG Bonus" array={stats[Stats.ICE_DMG]} />
              <AttributeBlock stats={stats} stat="Lightning DMG Bonus" array={stats[Stats.LIGHTNING_DMG]} />
              <AttributeBlock stats={stats} stat="Wind DMG Bonus" array={stats[Stats.WIND_DMG]} />
              <AttributeBlock stats={stats} stat="Quantum DMG Bonus" array={stats[Stats.QUANTUM_DMG]} />
              <AttributeBlock stats={stats} stat="Imaginary DMG Bonus" array={stats[Stats.IMAGINARY_DMG]} />
            </div>
            <div className="space-y-2">
              <AttributeBlock stats={stats} stat="Basic ATK DMG Bonus" array={stats.BASIC_DMG} />
              <AttributeBlock stats={stats} stat="Skill DMG Bonus" array={stats.SKILL_DMG} />
              <AttributeBlock stats={stats} stat="Ultimate DMG Bonus" array={stats.ULT_DMG} />
              <AttributeBlock stats={stats} stat="Talent DMG Bonus" array={stats.TALENT_DMG} />
              <AttributeBlock stats={stats} stat="DoT Bonus" array={stats.DOT_DMG} />
              <AttributeBlock stats={stats} stat="Follow-Up DMG Bonus" array={stats.FUA_DMG} />
              <AttributeBlock stats={stats} stat="Break DMG Bonus" array={stats.BREAK_DMG} />
              <AttributeBlock stats={stats} stat="Super Break DMG Bonus" array={stats.SUPER_BREAK_DMG} />
              <AttributeBlock stats={stats} stat="Summon DMG Bonus" array={stats.SUMMON_DMG} />
            </div>
          </div>
        </Collapsible>
        <Collapsible label="DEF & RES PEN">
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-2">
              <AttributeBlock stats={stats} stat="All-Type RES PEN" array={stats.ALL_TYPE_RES_PEN} />
              <AttributeBlock stats={stats} stat="Physical RES PEN" array={stats.PHYSICAL_RES_PEN} />
              <AttributeBlock stats={stats} stat="Fire RES PEN" array={stats.FIRE_RES_PEN} />
              <AttributeBlock stats={stats} stat="Ice RES PEN" array={stats.ICE_RES_PEN} />
              <AttributeBlock stats={stats} stat="Lightning RES PEN" array={stats.LIGHTNING_RES_PEN} />
              <AttributeBlock stats={stats} stat="Wind RES PEN" array={stats.WIND_RES_PEN} />
              <AttributeBlock stats={stats} stat="Quantum RES PEN" array={stats.QUANTUM_RES_PEN} />
              <AttributeBlock stats={stats} stat="Imaginary RES PEN" array={stats.IMAGINARY_RES_PEN} />
              <AttributeBlock stats={stats} stat="Ultimate RES PEN" array={stats.ULT_RES_PEN} />
            </div>
            <div className="space-y-2">
              <AttributeBlock stats={stats} stat="All-Type DEF PEN" array={stats.DEF_PEN} />
              <AttributeBlock stats={stats} stat="Basic ATK DEF PEN" array={stats.BASIC_DEF_PEN} />
              <AttributeBlock stats={stats} stat="Skill DEF PEN" array={stats.SKILL_DEF_PEN} />
              <AttributeBlock stats={stats} stat="Ultimate DEF PEN" array={stats.ULT_DEF_PEN} />
              <AttributeBlock stats={stats} stat="DoT DEF PEN" array={stats.DOT_DEF_PEN} />
              <AttributeBlock stats={stats} stat="Follow-Up DEF PEN" array={stats.FUA_DEF_PEN} />
              <AttributeBlock stats={stats} stat="Break DMG DEF PEN" array={stats.BREAK_DEF_PEN} />
              <AttributeBlock stats={stats} stat="Super Break DMG DEF PEN" array={stats.SUPER_BREAK_DEF_PEN} />
              <AttributeBlock stats={stats} stat="Elation DMG DEF PEN" array={stats.ELATION_DEF_PEN} />
              <AttributeBlock
                stats={stats}
                stat={
                  <span>
                    Summon DEF PEN
                    <Tooltip
                      title="Summon DEF PEN"
                      body="Refers to the amount of DEF PEN granted to the character's Action Bar Summons (e.g. Lightning Lord, Numby). This value does not affect memosprites. Please refer to the Memosprite's own DEF PEN if that's what you are looking for."
                      style="w-[350px] font-normal"
                      containerStyle="inline-block mx-1"
                    >
                      <i className="fa-regular fa-question-circle" />
                    </Tooltip>
                  </span>
                }
                array={stats.SUMMON_DEF_PEN}
              />
            </div>
          </div>
        </Collapsible>
        <Collapsible label="Advanced CRIT">
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-2">
              <AttributeBlock stats={stats} stat="Basic ATK CRIT Rate" array={stats.BASIC_CR} />
              <AttributeBlock stats={stats} stat="Skill CRIT Rate" array={stats.SKILL_CR} />
              <AttributeBlock stats={stats} stat="Ultimate CRIT Rate" array={stats.ULT_CR} />
              <AttributeBlock stats={stats} stat="Follow-Up CRIT Rate" array={stats.FUA_CR} />
            </div>
            <div className="space-y-2">
              <AttributeBlock stats={stats} stat="Basic ATK CRIT DMG" array={stats.BASIC_CD} />
              <AttributeBlock stats={stats} stat="Skill CRIT DMG" array={stats.SKILL_CD} />
              <AttributeBlock stats={stats} stat="Ultimate CRIT DMG" array={stats.ULT_CD} />
              <AttributeBlock stats={stats} stat="Follow-Up CRIT DMG" array={stats.FUA_CD} />
            </div>
          </div>
        </Collapsible>
        <Collapsible label="Original DMG Multiplier">
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-2">
              <AttributeBlock stats={stats} stat="DoT Multiplier" array={stats.DOT_MULT} />
              <AttributeBlock stats={stats} stat="Super Break Multiplier" array={stats.SUPER_BREAK_MULT} />
              <AttributeBlock stats={stats} stat="Basic ATK Super Break Multiplier" array={stats.BASIC_SUPER_BREAK} />
              <AttributeBlock stats={stats} stat="Talent Super Break Multiplier" array={stats.TALENT_SUPER_BREAK} />
            </div>
          </div>
        </Collapsible>
        <Collapsible label="Advanced Attributes">
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-2">
              <AttributeBlock stats={stats} stat="Weakness Break Efficiency" array={stats.BREAK_EFF} />
              <AttributeBlock stats={stats} stat="Shield Bonus" array={stats.SHIELD} />
              <AttributeBlock stats={stats} stat="DMG Reduction" array={stats.DMG_REDUCTION} />
              <AttributeBlock stats={stats} stat="Incoming Healing" array={stats.I_HEAL} />
              <div className="space-y-1">
                <p className="font-bold text-white">
                  eHP{' '}
                  <span className="text-red">
                    {_.round(
                      stats.getHP() / defMult / (1 - stats.getValue(StatsObjectKeys.DMG_REDUCTION))
                    ).toLocaleString()}
                  </span>
                  <Tooltip
                    title="eHP: Effective HP"
                    body="Represents the amount of raw damage a unit can sustain without considering their DEF and DMG Reduction. Useful when comparing a unit's tankiness."
                    style="w-[350px] font-normal"
                    containerStyle="inline-block ml-2"
                  >
                    <i className="fa-regular fa-question-circle" />
                  </Tooltip>
                </p>
                <BulletPoint>
                  <span className="text-xs">
                    DEF Multiplier <span className="text-desc">{toPercentage(defMult)}</span>
                  </span>
                </BulletPoint>
                <BulletPoint>
                  <span className="text-xs">
                    DMG Reduction Multiplier{' '}
                    <span className="text-desc">{toPercentage(1 - stats.getValue(StatsObjectKeys.DMG_REDUCTION))}</span>
                  </span>
                </BulletPoint>
              </div>
            </div>
            <div className="space-y-2">
              <ExtraBlock
                stats="Aggro"
                cBase={baseAggro}
                pArray={stats.AGGRO}
                fArray={[]}
                totalValue={_.round(baseAggro * (1 + stats.getValue(StatsObjectKeys.AGGRO)), 1).toLocaleString()}
                round={1}
              />
              <div className="space-y-1">
                <p className="font-bold text-white">
                  Action Value <span className="text-red">{_.round(10000 / stats.getSpd(), 1)}</span>
                  <span className="text-xs font-normal">
                    {' '}
                    = 10,000 ÷ <span className="text-desc">{_.floor(stats.getSpd(), 1)}</span>
                  </span>
                </p>
                <BulletPoint>
                  <span className="text-xs">
                    Achieved Breakpoint: <span className="text-desc">{_.ceil(10000 / breakPoint, 1)}</span> - {bpDesc}
                  </span>
                </BulletPoint>
                <BulletPoint>
                  <span className="text-xs">
                    <span className="text-desc">
                      {getTurnWithinCycle(0, stats.getSpd())}-{getTurnWithinCycle(1, stats.getSpd())}-
                      {getTurnWithinCycle(2, stats.getSpd())}-{getTurnWithinCycle(3, stats.getSpd())}
                    </span>{' '}
                    Turns within Cycle <span className="text-desc">0 to 3</span>
                  </span>
                </BulletPoint>
                {!!stats.COUNTDOWN && (
                  <BulletPoint color="text-red">
                    <span className="text-xs">
                      <span className="text-desc">
                        {_.floor(stats.getSpd() / stats.COUNTDOWN) + stats.EXTRA_C_TURN}
                      </span>{' '}
                      Turns before Countdown ends
                    </span>
                  </BulletPoint>
                )}
              </div>
              <p className="font-bold text-white">
                Max Skill Point(s) <span className="text-red">{stats.MAX_SP}</span>
              </p>
            </div>
          </div>
        </Collapsible>
      </div>
    )
  }
)
