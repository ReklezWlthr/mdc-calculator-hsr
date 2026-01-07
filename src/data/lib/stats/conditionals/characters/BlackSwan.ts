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
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Black Swan's ATK to one enemy target.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Decadence, False Twilight',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Black Swan's ATK to one designated enemy target and any adjacent targets. At the same time, there is a <span class="text-desc">100%</span> <u>base chance</u> of reducing the DEF of the enemy target and the adjacent targets by {{1}}%, lasting for <span class="text-desc">3</span> turn(s).`,
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
      content: `Inflicts <b>Epiphany</b> state on all enemies for <span class="text-desc">2</span> turn(s). Then deals <b class="text-hsr-wind">Wind DMG</b> to all enemies equal to {{1}}% of Black Swan's ATK.
      <br />In <b>Epiphany</b> state, enemy targets take {{0}}% increased DMG. When gaining <span class="text-desc">1</span> stack of <b class="text-emerald-600">Arcana</b>, there is a <span class="text-desc">50%</span> <u>fixed chance</u> to gain <span class="text-desc">1</span> additional stack, and <b class="text-emerald-600">Arcana</b> stacks won't be halved after dealing DMG at the start of the turn.`,
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
      content: `Each time an enemy target takes DoT, there is a {{0}}% <u>base chance</u> to inflict <span class="text-desc">1</span> stack of <b class="text-emerald-600">Arcana</b>.
      <br />When an enemy target is in <b class="text-emerald-600">Arcana</b> state, they are also considered to be in <b class="text-hsr-wind">Wind Shear</b>, <b class="text-hsr-physical">Bleed</b>, <b class="text-hsr-fire">Burn</b>, and <b class="text-hsr-lightning">Shock</b> states. At the start of each turn, they take <b class="text-hsr-wind">Wind DoT</b> equal to {{1}}% of Black Swan's ATK, after which the stack count is halved. Each stack of <b class="text-emerald-600">Arcana</b> increases this DMG multiplier by {{2}}%. <b class="text-emerald-600">Arcana</b> can stack up to <span class="text-desc">50</span> time(s).
      <br />Additional stacks beyond the limit can still be applied, but will be removed after dealing DMG.
      <br /><b class="text-emerald-600">Arcana</b> DMG ignores <span class="text-desc">20%</span> of the target's DEF. Only when <b class="text-emerald-600">Arcana</b> deals DMG at the start of the enemy target's turn, adjacent targets additionally take <b class="text-hsr-wind">Wind DoT</b> equal to {{3}}% of Black Swan's ATK.`,
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
      content: `After this Technique is used, there is a <span class="text-desc">150%</span> <u>base chance</u> for each enemy to be inflicted with <span class="text-desc">1</span> stack of <b class="text-emerald-600">Arcana</b> at the start of the next battle. For each successful application of <b class="text-emerald-600">Arcana</b> on a target, inflicts another stack of <b class="text-emerald-600">Arcana</b> on the same target. This process repeats until <b class="text-emerald-600">Arcana</b> fails to be inflicted on this target. For each successive application of <b class="text-emerald-600">Arcana</b> on a target, its <u>base chance</u> of success is equal to <span class="text-desc">50%</span> of the <u>base chance</u> of the previous successful infliction of <b class="text-emerald-600">Arcana</b> on that target.`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Viscera's Disquiet`,
      content: `When an enemy target is attacked by Black Swan, there is a <span class="text-desc">65%</span> <u>base chance</u> of inflicting <span class="text-desc">5</span> stack(s) of <b class="text-emerald-600">Arcana</b> on them.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Goblet's Dredges`,
      content: `When enemy targets enter combat, there is a <span class="text-desc">65%</span> <u>base chance</u> that they will be inflicted with <span class="text-desc">1</span> stack of <b class="text-emerald-600">Arcana</b>, and a <span class="text-desc">100%</span> <u>base chance</u> to be inflicted with the DEF reduction effect from the Skill, which lasts for <span class="text-desc">3</span> turn(s).`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Candleflame's Portent`,
      content: `Increases the DMG dealt by all allies by an amount equal to <span class="text-desc">60%</span> of Black Swan's Effect Hit Rate, up to a maximum DMG increase of <span class="text-desc">72%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Seven Pillars of Wisdom',
      content: `While Black Swan is active in battle, enemies afflicted with <b class="text-hsr-wind">Wind Shear</b>, <b class="text-hsr-physical">Bleed</b>, <b class="text-hsr-fire">Burn</b>, or <b class="text-hsr-lightning">Shock</b> will have their corresponding <b class="text-hsr-wind">Wind</b>, <b class="text-hsr-physical">Physical</b>, <b class="text-hsr-fire">Fire</b>, or <b class="text-hsr-lightning">Lightning RES</b> respectively reduced by <span class="text-desc">25%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Weep Not For Me, My Lamb`,
      content: `When enemy targets enter the battle, there is a <span class="text-desc">100%</span> <u>base chance</u> to inflict <span class="text-desc">30</span> stack(s) of <b class="text-emerald-600">Arcana</b> on them.`,
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
      content: `Under the <b>Epiphany</b> state, increases the DMG taken by enemy targets by <span class="text-desc">20%</span>, and Black Swan regenerates <span class="text-desc">8</span> Energy at the start of each turn or when they are defeated.`,
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
      content: `Increases maximum stacks of of <b class="text-emerald-600">Arcana</b> by <span class="text-desc">20</span>.
      <br />When an enemy target is attacked by Black Swan's teammates, Black Swan has a <span class="text-desc">65%</span> <u>base chance</u> to inflict <span class="text-desc">1</span> stack of <b class="text-emerald-600">Arcana</b> on the target.
      <br />Every time Black Swan inflicts <span class="text-desc">1</span> stack of <b class="text-emerald-600">Arcana</b> on an enemy target, the number of stacks added is additionally increased by <span class="text-desc">1</span>.`,
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
      max: c >= 6 ? 70 : 50,
      chance: { base: calcScaling(0.5, 0.03, basic, 'linear'), fixed: false },
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
      default: true,
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
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          energy: 20,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Blast',
          value: [{ scaling: calcScaling(0.45, 0.045, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          energy: 30,
          chance: { base: 1, fixed: false },
          sum: true,
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
        def_pen: 0.2,
      }
      base.TALENT_SCALING = form.arcana
        ? [
            arcana,
            {
              name: 'Adjacent Arcana DMG',
              value: [{ scaling: calcScaling(0.72, 0.09, talent, 'arcana'), multiplier: Stats.ATK }],
              element: Element.WIND,
              property: TalentProperty.DOT,
              type: TalentType.NONE,
              chance: { base: calcScaling(0.5, 0.015, talent, 'curved'), fixed: false },
              def_pen: 0.2,
            },
          ]
        : []

      if (form.arcana) {
        base.DOT_SCALING.push({
          ...arcana,
          overrideIndex: index,
          dotType: DebuffTypes.DOT,
        })
        addDebuff(debuffs, DebuffTypes.DOT)
        base.WIND_SHEAR_STACK += form.arcana
      }

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
          value: calcScaling(0.15, 0.01, ult, 'curved') + (c >= 4 ? 0.2 : 0),
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
          name: `Epiphany`,
          source: 'Black Swan',
          value: calcScaling(0.15, 0.01, ult, 'curved') + (c >= 4 ? 0.2 : 0),
        })
      }

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
        base.CALLBACK.push((base, _d, _w, a) => {
          _.forEach(a, (item, i) => {
            item[Stats.ALL_DMG].push({
              name: 'Ascension 6 Passive',
              source: index === i ? 'Self' : 'Black Swan',
              value: _.min([base.getValue(Stats.EHR) * 0.6, 0.72]),
              base: toPercentage(_.min([base.getValue(Stats.EHR), 1.2])),
              multiplier: 0.6,
            })
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
