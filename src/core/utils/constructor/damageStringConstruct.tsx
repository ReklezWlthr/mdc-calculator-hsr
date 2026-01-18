import { StatsObject, StatsObjectKeys, TalentPropertyMap, TalentTypeMap } from '@src/data/lib/stats/baseConstant'
import { IScaling } from '@src/domain/conditional'
import { Element, GlobalModifiers, StatIcons, Stats, TalentProperty, TalentType } from '@src/domain/constant'
import { toPercentage } from '../data_format'
import { ElementColor } from '@src/presentation/hsr/components/tables/super_break_sub_rows'
import _ from 'lodash'
import { propertyColor } from '@src/presentation/hsr/components/tables/scaling_sub_rows'
import { BreakBaseLevel, BreakElementMult } from '@src/domain/scaling'
import { CalculatorStore } from '@src/data/stores/calculator_store'
import { breakDamageStringConstruct } from './breakDamageStringConstruct'
import { SetupStore } from '@src/data/stores/setup_store'

export const HitSplit = ({
  split,
  dmgSplit,
  bonusSplit,
  cdSplit,
}: {
  split: number[]
  dmgSplit: number[]
  bonusSplit?: number[]
  cdSplit?: number[]
}) => {
  return (
    <div className="pt-2 !mt-2 border-t border-dashed border-primary-border text-xs space-y-0.5">
      <p>
        <b>Hit Split</b> - <span className="text-desc">{_.size(split)}</span> Hit(s)
      </p>
      {_.map(split, (item, i) => (
        <div key={i}>
          <span className="text-desc">✦</span> Hit {i + 1} -{' '}
          <b className="text-red">{_.floor(dmgSplit[i]).toLocaleString()}</b> [
          <span className="text-desc">{toPercentage(item)}</span>]
          {!!bonusSplit?.[i] && (
            <span className="pl-1">
              <span className="pr-1 text-blue">✦</span>
              Hit Boost: <span className="text-desc">{toPercentage(bonusSplit[i])}</span>
            </span>
          )}
          {!!cdSplit?.[i] && (
            <span className="pl-1">
              <span className="pr-1 text-blue">✦</span>
              Hit Boost: <span className="text-desc">{toPercentage(cdSplit[i])}</span>
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export const damageStringConstruct = (
  calculatorStore: CalculatorStore | SetupStore,
  globalMod: GlobalModifiers,
  scaling: IScaling,
  stats: StatsObject,
  level: number,
  showSplit?: boolean,
) => {
  if (!scaling || !stats || !level) return

  const element = scaling.element
  const breakScale = scaling.property === TalentProperty.BREAK
  const breakDoT = scaling.property === TalentProperty.BREAK_DOT
  const isPure = scaling.property === TalentProperty.PURE
  const isElation = scaling.property === TalentProperty.ELATION

  const globalMultiplier =
    (scaling.multiplier || 1) *
    (1 +
      (stats.getValue(`${TalentPropertyMap[scaling.property]}_MULT`) || 0) +
      (stats.getValue(`${TalentTypeMap[scaling.type]}_MULT`) || 0))

  const isServant = scaling.type === TalentType.SERVANT
  const isSplit = !!_.size(scaling.hitSplit)

  const ownerStats = _.cloneDeep(stats)
  if (isServant) stats = _.cloneDeep(stats.SUMMON_STATS)

  const {
    string: { debuffString },
    number: { finalDebuff },
  } = breakDamageStringConstruct(calculatorStore, globalMod, stats, level, globalMultiplier)

  const talentDmg = stats.getValue(`${TalentPropertyMap[scaling.property]}_DMG`) || 0
  const typeDmg =
    stats.getValue(`${TalentTypeMap[scaling.type]}_DMG`, stats[`${TalentPropertyMap[scaling.property]}_DMG`]) || 0
  const talentFlat = stats.getValue(`${TalentPropertyMap[scaling.property]}_F_DMG`) || 0
  const talentCr = stats.getValue(`${TalentTypeMap[scaling.type]}_CR`) || 0
  const propertyCr = stats.getValue(`${TalentPropertyMap[scaling.property]}_CR`) || 0
  const talentCd = stats.getValue(`${TalentTypeMap[scaling.type]}_CD`) || 0
  const propertyCd = stats.getValue(`${TalentPropertyMap[scaling.property]}_CD`) || 0
  const elementCd = stats.getValue(`${element.toUpperCase()}_CD`) || 0
  const elementFlat = stats.getValue(`${element.toUpperCase()}_F_DMG`) || 0
  const normalDefPen = stats.getValue(StatsObjectKeys.DEF_PEN) || 0
  const summonDefPen = stats.getValue(StatsObjectKeys.SUMMON_DEF_PEN) || 0
  const defPen =
    (scaling.summon && summonDefPen ? summonDefPen : normalDefPen) +
    (stats.getValue(`${TalentTypeMap[scaling.type]}_DEF_PEN`) || 0) +
    (stats.getValue(`${TalentPropertyMap[scaling.property]}_DEF_PEN`) || 0) +
    (scaling.def_pen || 0) +
    (scaling.property === TalentProperty.DOT && !scaling.detonate
      ? stats.getValue(StatsObjectKeys.ON_TURN_DOT_DEF_PEN)
      : 0)

  const defMult =
    calculatorStore.getDefMult(level, isPure ? 0 : defPen, stats.getValue(StatsObjectKeys.DEF_REDUCTION)) || 1
  const vulMult =
    1 +
    stats.getValue(StatsObjectKeys.VULNERABILITY) +
    (stats.getValue(`${TalentPropertyMap[scaling.property]}_VUL`) || 0) +
    (scaling.type !== TalentType.SERVANT ? stats.getValue(`${TalentTypeMap[scaling.type]}_VUL`) || 0 : 0) +
    (stats.getValue(`${scaling.element.toUpperCase()}_VUL`) || 0) +
    (scaling.vul || 0)
  const resMult = _.max([
    _.min([
      calculatorStore.getResMult(
        element as Element,
        (stats.getValue(`${element.toUpperCase()}_RES_RED`) || 0) +
          (stats.getValue(StatsObjectKeys.ALL_TYPE_RES_RED) || 0) +
          (isPure
            ? 0
            : (stats.getValue(`${TalentTypeMap[scaling.type]}_RES_PEN`) || 0) +
              (stats.getValue(`${element.toUpperCase()}_RES_PEN`) || 0) +
              (stats.getValue(StatsObjectKeys.ALL_TYPE_RES_PEN) || 0) +
              (scaling.res_pen || 0)), // Counted as Elemental RES PEN
      ),
      2,
    ]),
    0.1,
  ])
  const brokenMult = globalMod.broken ? 1 : 0.9
  const isDamage = !_.includes([TalentProperty.SHIELD, TalentProperty.HEAL], scaling.property) && !scaling.trueRaw
  const enemyMod = isDamage ? defMult * resMult * vulMult * brokenMult : 1

  const statForScale = {
    [Stats.ATK]: stats.getAtk(false, scaling.atkBonus),
    [Stats.DEF]: stats.getDef(),
    [Stats.HP]: isServant && scaling.useOwnerStats ? ownerStats.getHP() : stats.getHP(),
    [Stats.EHP]: calculatorStore.hp,
    [Stats.ELATION]: 7535.107,
  }

  const bonusDMG = (splitBonus?: number) =>
    (splitBonus || 0) +
    (scaling.bonus || 0) +
    (scaling.trueRaw
      ? 0
      : TalentProperty.SHIELD === scaling.property
        ? stats.getValue(StatsObjectKeys.SHIELD)
        : TalentProperty.HEAL === scaling.property
          ? stats.getValue(Stats.HEAL) + stats.getValue(`${TalentTypeMap[scaling.type]}_HEAL`)
          : stats.getValue(Stats.ALL_DMG) + stats.getValue(`${element} DMG%`) + talentDmg + typeDmg)

  const elation = _.max([stats.getTotalElation(), scaling.elation || 0])
  const punchline = scaling.punchline || +globalMod.punchline
  const punchlineMultiplier = (6 * punchline) / (+punchline + 200)

  const globalBonus = _.sum(_.map(scaling.bonusSplit, (item, i) => item * scaling.hitSplit?.[i])) + bonusDMG()
  const raw = (split: number) =>
    _.sumBy(scaling.value, (item) => split * item.scaling * (item.override || statForScale[item.multiplier])) +
    (scaling.flat || 0) +
    elementFlat +
    talentFlat
  const breakElementMult = BreakElementMult[scaling.element]
  const breakLevel = BreakBaseLevel[level - 1]
  const toughnessMult = 0.5 + _.min([calculatorStore.toughness, scaling.toughCap || calculatorStore.toughness]) / 40
  const breakRaw = (split: number) => breakElementMult * breakLevel * toughnessMult * split
  const cap = scaling.cap ? scaling.cap?.scaling * statForScale[scaling.cap?.multiplier] : 0
  const capped = scaling.cap ? cap < raw(1) : false
  const dmgSplit = _.map(
    scaling.hitSplit || [1],
    (split, i) =>
      (capped ? cap : breakScale ? breakRaw(split) : raw(split)) *
      ((1 +
        (breakScale
          ? stats.getValue(Stats.BE)
          : isPure
            ? 0
            : isElation
              ? elation + (1 + stats.getValue(StatsObjectKeys.ELATION_MERRYMAKE) || 0) + (1 + punchlineMultiplier)
              : bonusDMG(scaling.bonusSplit?.[i]))) *
        (globalMultiplier || 1) *
        (breakScale ? 1 + (stats.getValue(StatsObjectKeys.BREAK_MULT) || 0) : 1) *
        enemyMod),
  )
  const dmg = _.max([_.sum(dmgSplit), 1])

  const totalCr =
    scaling.overrideCr ||
    _.max([_.min([stats.getValue(Stats.CRIT_RATE) + (scaling.cr || 0) + talentCr + propertyCr, 1]), 0])
  const totalCd = (splitCd?: number) =>
    scaling.overrideCd ||
    stats.getValue(Stats.CRIT_DMG) +
      stats.getValue(StatsObjectKeys.X_CRIT_DMG) +
      (splitCd || 0) +
      (scaling.cd || 0) +
      talentCd +
      elementCd +
      propertyCd
  const globalCd = _.size(scaling.cdSplit)
    ? _.sum(_.map(scaling.cdSplit, (item, i) => item * scaling.hitSplit?.[i])) + totalCd()
    : totalCd()
  const totalFlat = (scaling.flat || 0) + elementFlat + talentFlat

  const splitCrit = _.map(dmgSplit, (split, i) => (1 + totalCd(scaling.cdSplit?.[i])) * split)
  const totalCrit = _.sum(splitCrit)

  const splitAvg = _.map(dmgSplit, (split, i) => (1 + totalCd(scaling.cdSplit?.[i]) * totalCr) * split)
  const totalAvg = _.sum(splitAvg)

  // String Construct
  const scalingArray = _.map(
    capped ? [scaling.cap] : scaling.value,
    (item) =>
      `<span class="inline-flex items-center h-4">(<b class="inline-flex items-center h-4"><img class="h-3 mx-1" src="/icons/${
        StatIcons[item.multiplier]
      }" />${_.floor(item.override || statForScale[item.multiplier]).toLocaleString()}</b>${
        item.multiplier === Stats.EHP ? `<i class="text-[10px] ml-1">Enemy HP</i>` : ''
      }<span class="mx-1"> \u{00d7} </span><b>${toPercentage(item.scaling, 2, true)}</b>)</span>`,
  )
  const baseScaling = _.join(scalingArray, ' + ')
  const baseBreakScaling = `(<b class="${
    ElementColor[scaling.element]
  }">${breakElementMult}</b> <i class="text-[10px]">ELEMENT</i> \u{00d7} <b>${_.round(
    breakLevel,
  ).toLocaleString()}</b> <i class="text-[10px]">BASE</i> \u{00d7} <b>${toughnessMult}</b> <i class="text-[10px]">TOUGHNESS</i>)`
  const shouldWrap = (!!totalFlat || scaling.value.length > 1) && !!_.size(scaling.value)
  const baseWithFlat = totalFlat
    ? baseScaling
      ? _.join([baseScaling, _.round(totalFlat).toLocaleString()], ' + ')
      : _.round(totalFlat).toLocaleString()
    : baseScaling

  const formulaString = `<b class="${propertyColor[scaling.property] || 'text-red'}">${_.floor(
    dmg,
  ).toLocaleString()}</b> = ${breakScale ? baseBreakScaling : shouldWrap ? `(${baseWithFlat})` : baseWithFlat}${
    breakScale && stats.getValue(Stats.BE) > 0
      ? ` \u{00d7} <span class="inline-flex items-center h-4">(1 + <b class="inline-flex items-center h-4"><img class="h-3 mx-1" src="/icons/IconBreakUp.png" />${toPercentage(
          stats.getValue(Stats.BE),
        )}</b>)</span>`
      : stats.getValue(Stats.ELATION) && isElation
        ? ` \u{00d7} (1 + <b class="${ElementColor[scaling.element]}">${toPercentage(
            elation,
          )}</b> <i class="text-[10px]">ELATION</i>)`
        : globalBonus > 0 && !isPure
          ? ` \u{00d7} (1 + <b class="${ElementColor[scaling.element]}">${toPercentage(
              breakScale ? stats.getValue(Stats.BE) : globalBonus,
            )}</b> <i class="text-[10px]">BONUS</i>)`
          : ''
  }${globalMultiplier !== 1 ? ` \u{00d7} <b class="text-indigo-300">${toPercentage(globalMultiplier, 2)}</b>` : ''}${
    breakScale && stats.getValue(StatsObjectKeys.BREAK_MULT) > 0
      ? ` \u{00d7} <b class="text-amber-400">${toPercentage(1 + stats.getValue(StatsObjectKeys.BREAK_MULT), 2)}</b>`
      : ''
  }${
    punchline && isElation
      ? ` \u{00d7} (1 + <b class="text-orange-400">${toPercentage(punchlineMultiplier, 2)}</b> <i class="text-[10px]">${
          scaling.punchline ? 'BANGER' : 'PUNCHLINE'
        }</i>)`
      : ''
  }${
    stats.getValue(StatsObjectKeys.ELATION_MERRYMAKE) && isElation
      ? ` \u{00d7} (1 + <b class="text-desc">${toPercentage(
          stats.getValue(StatsObjectKeys.ELATION_MERRYMAKE),
          2,
        )}</b> <i class="text-[10px]">MERRYMAKE</i>)`
      : ''
  }${
    isDamage
      ? ` \u{00d7} <b class="text-orange-300">${toPercentage(
          defMult,
          2,
        )}</b> <i class="text-[10px]">DEF</i> \u{00d7} <b class="text-teal-200">${toPercentage(
          resMult,
          2,
        )}</b> <i class="text-[10px]">RES</i> \u{00d7} <b class="text-rose-300">${toPercentage(
          vulMult,
          2,
        )}</b> <i class="text-[10px]">VUL</i> \u{00d7} <b class="text-violet-300">${toPercentage(
          brokenMult,
        )}</b> <i class="text-[10px]">BROKEN</i>`
      : ''
  }`

  const critString = `<b class="${propertyColor[scaling.property] || 'text-red'}">${_.floor(
    totalCrit,
  ).toLocaleString()}</b> = <b>${_.floor(
    dmg,
  ).toLocaleString()}</b> \u{00d7} <span class="inline-flex items-center h-4">(1 + <b class="inline-flex items-center h-4"><img class="h-3 mx-1" src="/icons/IconCriticalDamage.png" />${toPercentage(
    globalCd,
  )}</b>)</span>`

  const avgString = `<b class="${propertyColor[scaling.property] || 'text-red'}">${_.floor(
    totalAvg,
  ).toLocaleString()}</b> = <b>${_.floor(
    dmg,
  ).toLocaleString()}</b> \u{00d7} <span class="inline-flex items-center h-4">(1 + <b class="inline-flex items-center h-4"><img class="h-3 mx-1" src="/icons/IconCriticalDamage.png" />${toPercentage(
    globalCd,
  )}</b><span class="ml-1"> \u{00d7} </span><b class="inline-flex items-center h-4"><img class="h-3 mx-1" src="/icons/IconCriticalChance.png" />${toPercentage(
    totalCr,
  )}</b>)</span>`

  const DmgBody = (
    <div className="space-y-1">
      <p dangerouslySetInnerHTML={{ __html: formulaString }} />
      {!!scaling.bonus && (
        <p className="text-xs">
          Exclusive Bonus: <span className="text-desc">{toPercentage(scaling.bonus)}</span>
        </p>
      )}
      {!!stats.getValue(`${element} DMG%`) && (
        <p className="text-xs">
          {element} DMG Bonus: <span className="text-desc">{toPercentage(stats.getValue(`${element} DMG%`))}</span>
        </p>
      )}
      {!!talentDmg && (
        <p className="text-xs">
          {scaling.property} Bonus: <span className="text-desc">{toPercentage(talentDmg)}</span>
        </p>
      )}
      {!!typeDmg && (
        <p className="text-xs">
          {scaling.type} Bonus: <span className="text-desc">{toPercentage(typeDmg)}</span>
        </p>
      )}
      {isSplit && showSplit && (
        <HitSplit split={scaling.hitSplit} dmgSplit={dmgSplit} bonusSplit={scaling.bonusSplit} />
      )}
    </div>
  )

  const CritBody = (
    <div className="space-y-1">
      <p dangerouslySetInnerHTML={{ __html: critString }} />
      {!!scaling.cd && (
        <p className="text-xs">
          Component CRIT DMG: <span className="text-desc">{toPercentage(scaling.cd)}</span>
        </p>
      )}
      {!!elementCd && (
        <p className="text-xs">
          {element} CRIT DMG: <span className="text-desc">{toPercentage(elementCd)}</span>
        </p>
      )}
      {!!talentCd && (
        <p className="text-xs">
          {scaling.type} CRIT DMG: <span className="text-desc">{toPercentage(talentCd)}</span>
        </p>
      )}
      {!!propertyCd && (
        <p className="text-xs">
          {scaling.property} CRIT DMG: <span className="text-desc">{toPercentage(propertyCd)}</span>
        </p>
      )}
      {isSplit && showSplit && (
        <HitSplit
          split={scaling.hitSplit}
          dmgSplit={splitCrit}
          cdSplit={scaling.cdSplit}
          bonusSplit={scaling.bonusSplit}
        />
      )}
    </div>
  )

  const AvgBody = (
    <div className="space-y-1">
      <p dangerouslySetInnerHTML={{ __html: avgString }} />
      {!!scaling.cr && (
        <p className="text-xs">
          Component CRIT Rate: <span className="text-desc">{toPercentage(scaling.cr)}</span>
        </p>
      )}
      {!!talentCr && (
        <p className="text-xs">
          {scaling.type} CRIT Rate: <span className="text-desc">{toPercentage(talentCr)}</span>
        </p>
      )}
      {!!propertyCr && (
        <p className="text-xs">
          {scaling.property} CRIT Rate: <span className="text-desc">{toPercentage(propertyCr)}</span>
        </p>
      )}
      {isSplit && showSplit && (
        <HitSplit split={scaling.hitSplit} dmgSplit={splitAvg} bonusSplit={scaling.bonusSplit} />
      )}
    </div>
  )

  return {
    string: { formulaString, critString, avgString },
    component: {
      DmgBody: breakDoT ? <div dangerouslySetInnerHTML={{ __html: debuffString }} /> : DmgBody,
      CritBody,
      AvgBody,
    },
    number: { dmg: breakDoT ? finalDebuff : dmg, totalCrit, totalAvg },
  }
}

export type StringConstructor = ReturnType<typeof damageStringConstruct>
