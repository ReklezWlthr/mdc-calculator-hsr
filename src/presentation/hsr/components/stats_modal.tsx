import { toPercentage } from '@src/core/utils/converter'
import { StatsArray, StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { BaseAggro, PathType, Stats } from '@src/domain/constant'
import { BulletPoint, Collapsible } from '@src/presentation/components/collapsible'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

interface NormalBlockProps {
  stat: string
  array: StatsArray[]
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

export const StatsModal = observer(({ stats, path }: { stats: StatsObject; path: PathType }) => {
  const NormalBlock = ({ stat, array }: NormalBlockProps) => (
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
            <NormalBlock stat="CRIT Rate" array={stats[Stats.CRIT_RATE]} />
            <NormalBlock stat="CRIT DMG" array={_.concat(stats[Stats.CRIT_DMG], stats.X_CRIT_DMG)} />
            <NormalBlock stat="Break Effect" array={stats[Stats.BE]} />
            <NormalBlock stat="Outgoing Healing" array={stats[Stats.HEAL]} />
            <NormalBlock stat="Energy Regen Rate" array={stats[Stats.ERR]} />
            <NormalBlock stat="Effect Hit Rate" array={stats[Stats.EHR]} />
            <NormalBlock stat="Effect RES" array={stats[Stats.E_RES]} />
          </div>
        </div>
      </Collapsible>
      <Collapsible label="DMG Bonuses">
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-2">
            <NormalBlock stat="All-Type DMG Bonus" array={stats[Stats.ALL_DMG]} />
            <NormalBlock stat="Physical DMG Bonus" array={stats[Stats.PHYSICAL_DMG]} />
            <NormalBlock stat="Fire DMG Bonus" array={stats[Stats.FIRE_DMG]} />
            <NormalBlock stat="Ice DMG Bonus" array={stats[Stats.ICE_DMG]} />
            <NormalBlock stat="Lightning DMG Bonus" array={stats[Stats.LIGHTNING_DMG]} />
            <NormalBlock stat="Wind DMG Bonus" array={stats[Stats.WIND_DMG]} />
            <NormalBlock stat="Quantum DMG Bonus" array={stats[Stats.QUANTUM_DMG]} />
            <NormalBlock stat="Imaginary DMG Bonus" array={stats[Stats.IMAGINARY_DMG]} />
          </div>
          <div className="space-y-2">
            <NormalBlock stat="Basic ATK DMG Bonus" array={stats.BASIC_DMG} />
            <NormalBlock stat="Skill DMG Bonus" array={stats.SKILL_DMG} />
            <NormalBlock stat="Ultimate DMG Bonus" array={stats.ULT_DMG} />
            <NormalBlock stat="Talent DMG Bonus" array={stats.TALENT_DMG} />
            <NormalBlock stat="DoT Bonus" array={stats.DOT_DMG} />
            <NormalBlock stat="Follow-Up DMG Bonus" array={stats.FUA_DMG} />
            <NormalBlock stat="Break DMG Bonus" array={stats.BREAK_DMG} />
            <NormalBlock stat="Super Break DMG Bonus" array={stats.SUPER_BREAK_DMG} />
          </div>
        </div>
      </Collapsible>
      <Collapsible label="Advanced Attributes">
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-2">
            <NormalBlock stat="Weakness Break Efficiency" array={stats.BREAK_EFF} />
            <NormalBlock stat="All-Type RES PEN" array={stats.ALL_TYPE_RES_PEN} />
            <NormalBlock stat="DEF PEN" array={stats.DEF_PEN} />
          </div>
          <div className="space-y-2">
            <NormalBlock stat="DMG Reduction" array={stats.DMG_REDUCTION} />
            <NormalBlock stat="Shield Bonus" array={stats.SHIELD} />
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
