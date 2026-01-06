import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain, multiply } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/data_format'
import { IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'

const BlackSwan = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const index = _.findIndex(team, (item) => item?.cId === '1307')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Percipience, Silent Dawn',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Black Swan's ATK to a single target enemy, with a {{1}}% <u>base chance</u> of inflicting <span class="text-desc">1</span> stack of <b>Arcana</b>. And if the hit target currently has <b class="text-hsr-wind">Wind Shear</b>, <b class="text-hsr-physical">Bleed</b>, <b class="text-hsr-fire">Burn</b>, or <b class="text-hsr-lightning">Shock</b> applied to them, each respectively has a {{1}}% <u>base chance</u> of inflicting <span class="text-desc">1</span> extra stack of <b>Arcana</b> onto the enemy.`,
      value: [
        { base: 30, growth: 6, style: 'linear' },
        { base: 50, growth: 3, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Decadence, False Twilight',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Black Swan's ATK to a single target enemy and any adjacent targets. At the same time, there is a <span class="text-desc">100%</span> <u>base chance</u> of inflicting <span class="text-desc">1</span> stack of <b>Arcana</b> on the target enemy and the adjacent targets. And there is a <span class="text-desc">100%</span> <u>base chance</u> of reducing the DEF of the target enemy and the adjacent targets by {{1}}%, lasting for <span class="text-desc">3</span> turn(s).`,
      value: [
        { base: 45, growth: 4.5, style: 'curved' },
        { base: 14.8, growth: 0.6, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Bliss of Otherworld's Embrace`,
      content: `Inflicts <b>Epiphany</b> on all enemies for <span class="text-desc">2</span> turn(s).
      <br />Enemies affected by <b>Epiphany</b> take {{0}}% more DMG in their turn, and their <b>Arcana</b> effect is regarded as <b class="text-hsr-wind">Wind Shear</b>, <b class="text-hsr-physical">Bleed</b>, <b class="text-hsr-fire">Burn</b>, and <b class="text-hsr-lightning">Shock</b> effects. In addition, when their <b>Arcana</b> effect is triggered at the beginning of the next turn, the <b>Arcana</b> stacks are not reset. The stack non-reset effect can be triggered up to <span class="text-desc">1</span> time(s) in <b>Epiphany</b>'s duration, and its charges are replenished when <b>Epiphany</b> is applied again.
      <br />Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{1}}% of Black Swan's ATK to all enemies.`,
      value: [
        { base: 15, growth: 1, style: 'curved' },
        { base: 72, growth: 4.8, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `Loom of Fate's Caprice`,
      content: `Every time an enemy target receives DoT at the start of each turn, there is a {{0}}% <u>base chance</u> for it to be inflicted with <b>Arcana</b>.
      <br />While afflicted with <b>Arcana</b>, enemy targets receive <b class="text-hsr-wind">Wind DoT</b> equal to {{1}}% of Black Swan's ATK at the start of each turn. Each stack of <b>Arcana</b> increases this DoT DMG multiplier by {{2}}%. Then <b>Arcana</b> resets to <span class="text-desc">1</span> stack. <b>Arcana</b> can stack up to <span class="text-desc">50</span> times.
      <br />Only when <b>Arcana</b> causes DMG at the start of an enemy target's turn, Black Swan triggers additional effects based on the number of <b>Arcana</b> stacks inflicted on the target:
      <br />When there are <span class="text-desc">3</span> or more <b>Arcana</b> stacks, deals <b class="text-hsr-wind">Wind DoT</b> equal to {{3}}% of Black Swan's ATK to adjacent targets, with a {{0}}% <u>base chance</u> of inflicting <span class="text-desc">1</span> stack of <b>Arcana</b> on adjacent targets.
      <br />When there are <span class="text-desc">7</span> or more <b>Arcana</b> stacks, enables the current DoT dealt this time to ignore <span class="text-desc">20%</span> of the target's and adjacent targets' DEF.`,
      value: [
        { base: 50, growth: 1.5, style: 'curved' },
        { base: 96, growth: 12, style: 'arcana' },
        { base: 4.8, growth: 0.6, style: 'arcana' },
        { base: 72, growth: 9, style: 'arcana' },
      ],
      level: talent,
      tag: AbilityTag.IMPAIR,
    },
    technique: {
      trace: 'Technique',
      title: 'From Façade to Vérité',
      content: `After this Technique is used, there is a <span class="text-desc">150%</span> <u>base chance</u> for each enemy to be inflicted with <span class="text-desc">1</span> stack of <b>Arcana</b> at the start of the next battle. For each successful application of <b>Arcana</b> on a target, inflicts another stack of <b>Arcana</b> on the same target. This process repeats until <b>Arcana</b> fails to be inflicted on this target. For each successive application of <b>Arcana</b> on a target, its <u>base chance</u> of success is equal to <span class="text-desc">50%</span> of the <u>base chance</u> of the previous successful infliction of <b>Arcana</b> on that target.`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Viscera's Disquiet`,
      content: `After using the Skill to hit an enemy that has <b class="text-hsr-wind">Wind Shear</b>, <b class="text-hsr-physical">Bleed</b>, <b class="text-hsr-fire">Burn</b>, or <b class="text-hsr-lightning">Shock</b>, each of these debuffs respectively has a <span class="text-desc">65%</span> <u>base chance</u> of inflicting 1 extra stack of <b>Arcana</b>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Goblet's Dredges`,
      content: `There is a <span class="text-desc">65%</span> <u>base chance</u> to inflict <span class="text-desc">1</span> stack of <b>Arcana</b> when a target enters battle. Every time an enemy target receives DoT during a single attack by an ally, there is a <span class="text-desc">65%</span> <u>base chance</u> for the target to be inflicted with <span class="text-desc">1</span> stack of <b>Arcana</b>, stacking up to <span class="text-desc">3</span> time(s) during <span class="text-desc">1</span> single attack.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Candleflame's Portent`,
      content: `Increases this unit's DMG by an amount equal to <span class="text-desc">60%</span> of Effect Hit Rate, up to a maximum DMG increase of <span class="text-desc">72%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Seven Pillars of Wisdom',
      content: `While Black Swan is active in battle, enemies afflicted with <b class="text-hsr-wind">Wind Shear</b>, <b class="text-hsr-physical">Bleed</b>, <b class="text-hsr-fire">Burn</b>, or <b class="text-hsr-lightning">Shock</b> will have their corresponding <b class="text-hsr-wind">Wind</b>, <b class="text-hsr-physical">Physical</b>, <b class="text-hsr-fire">Fire</b>, or <b class="text-hsr-lightning">Lightning RES</b> respectively reduced by <span class="text-desc">25%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Weep Not For Me, My Lamb`,
      content: `When an enemy target afflicted with Arcana is defeated, there is a <span class="text-desc">100%</span> <u>base chance</u> of inflicting <span class="text-desc">6</span> stack(s) of <b>Arcana</b> on adjacent targets.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'As Above, So Below',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'In Tears We Gift',
      content: `While in the <b>Epiphany</b> state, enemy targets have their Effect RES reduced by <span class="text-desc">10%</span>. And at the start of their turn or when they get defeated, Black Swan regenerates <span class="text-desc">8</span> Energy. This Energy Regeneration effect can only trigger up to <span class="text-desc">1</span> time while <b>Epiphany</b> lasts. And this trigger count resets after the enemy gets inflicted with <b>Epiphany</b> again.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Linnutee Flyway`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Pantheon Merciful, Masses Pitiful',
      content: `When enemy targets get attacked by Black Swan's allies, Black Swan has a <span class="text-desc">65%</span> <u>base chance</u> of inflicting <span class="text-desc">1</span> stack of <b>Arcana</b> on the target.
      <br />Each time Black Swan inflicts <b>Arcana</b> on an enemy target, there is a <span class="text-desc">50%</span> <u>fixed chance</u> to additionally increase the number of <b>Arcana</b> stacks afflicted this time by <span class="text-desc">1</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'arcana',
      text: `Arcana Stacks`,
      ...talents.talent,
      show: true,
      default: 1,
      min: 0,
      max: 50,
      debuff: true,
    },
    {
      type: 'toggle',
      id: 'bs_skill',
      text: `Skill DEF Reduction`,
      ...talents.skill,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'epiphany',
      text: `Epiphany`,
      ...talents.ult,
      show: true,
      default: false,
      debuff: true,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'arcana'),
    findContentById(content, 'bs_skill'),
    findContentById(content, 'epiphany'),
  ]

  const allyContent: IContent[] = []

  return {
    upgrade,
    talents,
    content,
    teammateContent,
    allyContent,
    preCompute: (
      x: StatsObject,
      form: Record<string, any>,
      debuffs: {
        type: DebuffTypes
        count: number
      }[],
      weakness: Element[],
      broken: boolean
    ) => {
      const base = _.cloneDeep(x)

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.3, 0.06, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          energy: 20,
          chance: { base: calcScaling(0.5, 0.03, basic, 'linear'), fixed: false },
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(0.45, 0.045, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          energy: 30,
          chance: { base: 1, fixed: false },
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.45, 0.045, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          energy: 30,
          chance: { base: 1, fixed: false },
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.72, 0.048, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          energy: 5,
          sum: true,
        },
      ]
      const arcana = {
        name: 'Arcana DMG',
        value: [
          {
            scaling:
              calcScaling(0.96, 0.12, talent, 'arcana') + form.arcana * calcScaling(0.048, 0.006, talent, 'arcana'),
            multiplier: Stats.ATK,
          },
        ],
        element: Element.WIND,
        property: TalentProperty.DOT,
        type: TalentType.NONE,
        chance: { base: calcScaling(0.5, 0.015, talent, 'curved'), fixed: false },
        sum: true,
      }
      base.TALENT_SCALING = form.arcana ? [arcana] : []

      if (form.arcana) {
        base.DOT_SCALING.push({
          ...arcana,
          overrideIndex: index,
          dotType: form.epiphany ? DebuffTypes.DOT : DebuffTypes.WIND_SHEAR,
        })
        addDebuff(debuffs, form.epiphany ? DebuffTypes.DOT : DebuffTypes.WIND_SHEAR)
        base.WIND_SHEAR_STACK += form.arcana
      }
      if (form.arcana >= 3)
        base.TALENT_SCALING.push({
          name: 'Adjacent Arcana DMG',
          value: [{ scaling: calcScaling(0.72, 0.09, talent, 'arcana'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.DOT,
          type: TalentType.NONE,
          chance: { base: calcScaling(0.5, 0.015, talent, 'curved'), fixed: false },
        })
      if (form.arcana >= 7)
        base.ON_TURN_DOT_DEF_PEN.push({
          name: `Talent (7+ Arcana)`,
          source: 'Self',
          value: 0.2,
        })

      if (form.bs_skill) {
        base.DEF_REDUCTION.push({
          name: `Skill`,
          source: 'Self',
          value: calcScaling(0.148, 0.006, skill, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      if (form.epiphany) {
        base.VULNERABILITY.push({
          name: `Epiphany`,
          source: 'Self',
          value: calcScaling(0.15, 0.01, ult, 'curved'),
        })
        if (c >= 4)
          base.E_RES_RED.push({
            name: `Eidolon 4`,
            source: 'Self',
            value: 0.1,
          })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }

      return base
    },
    preComputeShared: (
      own: StatsObject,
      base: StatsObject,
      form: Record<string, any>,
      aForm: Record<string, any>,
      debuffs: { type: DebuffTypes; count: number }[],
      weakness: Element[],
      broken: boolean
    ) => {
      if (form.arcana) base.WIND_SHEAR_STACK += form.arcana
      if (form.bs_skill)
        base.DEF_REDUCTION.push({
          name: `Skill`,
          source: 'Black Swan',
          value: calcScaling(0.148, 0.006, skill, 'curved'),
        })
      if (form.epiphany) {
        base.VULNERABILITY.push({
          name: `Ultimate (Epiphany)`,
          source: 'Black Swan',
          value: calcScaling(0.15, 0.01, ult, 'curved'),
        })
        if (c >= 4)
          base.E_RES_RED.push({
            name: `Eidolon 4`,
            source: 'Black Swan',
            value: 0.1,
          })
      }
      if (form.arcana >= 7)
        base.ON_TURN_DOT_DEF_PEN.push({
          name: `Talent (7+ Arcana)`,
          source: 'Self',
          value: 0.2,
        })

      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      team: StatsObject[],
      allForm: Record<string, any>[],
      debuffs: {
        type: DebuffTypes
        count: number
      }[],
      weakness: Element[],
      broken: boolean
    ) => {
      if (a.a6)
        base.CALLBACK.push((base) => {
          base[Stats.ALL_DMG].push({
            name: 'Ascension 6 Passive',
            source: 'Self',
            value: _.min([base.getValue(Stats.EHR) * 0.6, 0.72]),
            base: toPercentage(_.min([base.getValue(Stats.EHR), 1.2])),
            multiplier: 0.6,
          })
          return base
        })

      if (c >= 1) {
        const wind =
          _.sumBy(
            _.filter(debuffs, (item) => _.includes([DebuffTypes.WIND_SHEAR, DebuffTypes.DOT], item.type)),
            (item) => item.count
          ) >= 1
        const physical =
          _.sumBy(
            _.filter(debuffs, (item) => _.includes([DebuffTypes.BLEED, DebuffTypes.DOT], item.type)),
            (item) => item.count
          ) >= 1
        const fire =
          _.sumBy(
            _.filter(debuffs, (item) => _.includes([DebuffTypes.BURN, DebuffTypes.DOT], item.type)),
            (item) => item.count
          ) >= 1
        const lightning =
          _.sumBy(
            _.filter(debuffs, (item) => _.includes([DebuffTypes.SHOCKED, DebuffTypes.DOT], item.type)),
            (item) => item.count
          ) >= 1

        addDebuff(debuffs, DebuffTypes.OTHER, _.sum([wind, physical, fire, lightning]))

        _.forEach(team, (x, i) => {
          const source = index === i ? 'Self' : 'Black Swan'
          if (wind)
            x.WIND_RES_PEN.push({
              name: `Eidolon 1`,
              source,
              value: 0.25,
            })
          if (physical)
            x.PHYSICAL_RES_PEN.push({
              name: `Eidolon 1`,
              source,
              value: 0.25,
            })
          if (fire)
            x.FIRE_RES_PEN.push({
              name: `Eidolon 1`,
              source,
              value: 0.25,
            })
          if (lightning)
            x.LIGHTNING_RES_PEN.push({
              name: `Eidolon 1`,
              source,
              value: 0.25,
            })
        })
      }

      return base
    },
  }
}

export default BlackSwan
