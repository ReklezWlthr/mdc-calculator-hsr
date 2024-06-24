import { toPercentage } from '@src/core/utils/converter'
import { StatsArray, StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { BaseAggro, PathType, Stats } from '@src/domain/constant'
import { BulletPoint, Collapsible } from '@src/presentation/components/collapsible'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

interface NormalBlockProps {
  stat: string
  array: StatsArray[]
  stats: StatsObject
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
    <p className="font-bold text-white">
      {stat}{' '}
      <span className="text-red">
        {toPercentage(stat === 'DMG Reduction' ? stats.getDmgRed() : _.sumBy(array, (item) => item.value))}
      </span>
    </p>
    <div className="space-y-1 text-xs">
      {_.map(
        array,
        (item) =>
          !!item.value && (
            <BulletPoint key={item.source + item.name}>
              {item.source} / {item.name} <span className="text-desc">{toPercentage(item.value)}</span>
            </BulletPoint>
          )
      )}
    </div>
  </div>
)

export const StatsModal = observer(({ stats, path }: { stats: StatsObject; path: PathType }) => {
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
                <span className="text-desc">{_.floor(item.value, round).toLocaleString()}</span>
              </BulletPoint>
            )
        )}
      </div>
    </div>
  )

  const baseAggro = BaseAggro[path] * (1 + stats.getValue(StatsObjectKeys.BASE_AGGRO))

  return (
    <div className="w-[65vw] bg-primary-dark rounded-lg p-3 space-y-2">
      <p className="text-lg font-bold text-white">Stats Breakdown</p>
      <Collapsible label="Common Attributes">
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-2">
            <ExtraBlock
              stats="HP"
              cBase={stats.BASE_HP_C}
              lBase={stats.BASE_HP_L}
              totalValue={_.floor(stats.getHP()).toLocaleString()}
              pArray={stats[Stats.P_HP]}
              fArray={_.concat(stats[Stats.HP], stats.X_HP)}
            />
            <ExtraBlock
              stats="ATK"
              cBase={stats.BASE_ATK_C}
              lBase={stats.BASE_ATK_L}
              totalValue={_.floor(stats.getAtk()).toLocaleString()}
              pArray={stats[Stats.P_ATK]}
              fArray={_.concat(stats[Stats.ATK], stats.X_ATK)}
            />
            <ExtraBlock
              stats="DEF"
              cBase={stats.BASE_DEF_C}
              lBase={stats.BASE_DEF_L}
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
          </div>
          <div className="space-y-2">
            <AttributeBlock stats={stats} stat="All-Type DEF PEN" array={stats.DEF_PEN} />
            <AttributeBlock stats={stats} stat="Basic ATK DEF PEN" array={stats.BASIC_DEF_PEN} />
            <AttributeBlock stats={stats} stat="Skill DEF PEN" array={stats.SKILL_DEF_PEN} />
            <AttributeBlock stats={stats} stat="Ultimate DEF PEN" array={stats.ULT_DEF_PEN} />
            <AttributeBlock stats={stats} stat="DoT DEF PEN" array={stats.DOT_DEF_PEN} />
            <AttributeBlock stats={stats} stat="Follow-Up DMG DEF PEN" array={stats.FUA_DEF_PEN} />
            <AttributeBlock stats={stats} stat="Break DMG DEF PEN" array={stats.BREAK_DEF_PEN} />
            <AttributeBlock stats={stats} stat="Super Break DMG DEF PEN" array={stats.SUPER_BREAK_DEF_PEN} />
          </div>
        </div>
      </Collapsible>
      <Collapsible label="Advanced Attributes">
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-2">
            <AttributeBlock stats={stats} stat="Weakness Break Efficiency" array={stats.BREAK_EFF} />
            <AttributeBlock stats={stats} stat="Shield Bonus" array={stats.SHIELD} />
            <div className="space-y-1">
              <p className="font-bold text-white">
                Action Value <span className="text-red">{_.round(10000 / stats.getSpd(), 1)}</span>
              </p>
              <BulletPoint>
                <span className="text-xs">
                  <span className="text-desc">{_.round(10000 / stats.getSpd(), 1)}</span> = 10,000 ÷{' '}
                  <span className="text-desc">{_.round(stats.getSpd(), 1)}</span>
                </span>
              </BulletPoint>
              <BulletPoint>
                <span className="text-xs">
                  <span className="text-desc">{_.floor(250 / (10000 / stats.getSpd()))}</span> Turns in the first{' '}
                  <span className="text-desc">2</span> MoC Cycles
                </span>
              </BulletPoint>
            </div>
          </div>
          <div className="space-y-2">
            <AttributeBlock stats={stats} stat="DMG Reduction" array={stats.DMG_REDUCTION} />
            <ExtraBlock
              stats="Aggro"
              cBase={baseAggro}
              pArray={stats.AGGRO}
              fArray={[]}
              totalValue={_.round(baseAggro * (1 + stats.getValue(StatsObjectKeys.AGGRO)), 1).toLocaleString()}
              round={1}
            />
          </div>
        </div>
      </Collapsible>
    </div>
  )
})
