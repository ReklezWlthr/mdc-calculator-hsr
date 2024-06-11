import { findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Argenti = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const talents: ITalent = {
    normal: {
      title: 'Fleeting Fragrance',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Argenti's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic
    },
    skill: {
      title: 'Justice, Hereby Blooms',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Argenti's ATK to all enemies.`,
      value: [{ base: 60, growth: 6, style: 'curved' }],
      level: skill
    },
    ult: {
      title: 'For In This Garden Supreme Beauty Bestows',
      content: `Consumes <span class="text-desc">90</span> Energy and deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Argenti's ATK to all enemies.`,
      value: [{ base: 96, growth: 6.4, style: 'curved' }],
      level: ult
    },
    ult_alt: {
      title: 'Merit Bestowed in "My" Garden',
      content: `Consumes <span class="text-desc">180</span> Energy and deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Argenti's ATK to all enemies, and further deals DMG for 6 extra time(s), with each time dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Argenti's ATK to a random enemy.`,
      value: [
        { base: 168, growth: 11.2, style: 'curved' },
        { base: 57, growth: 3.8, style: 'curved' },
      ],
      level: ult
    },
    talent: {
      title: 'Sublime Object',
      content: `For every enemy hit when Argenti uses his Basic Attack, Skill, or Ultimate, regenerates Argenti's Energy by <span class="text-desc">3</span>, and grants him a stack of <b>Apotheosis</b>, increasing his CRIT Rate by {{0}}%. This effect can stack up to <span class="text-desc">10</span> time(s).`,
      value: [{ base: 1, growth: 0.15, style: 'curved' }],
      level: talent
    },
    technique: {
      title: 'Manifesto of Purest Virtue',
      content: `After using the Technique, enemies in a set area are inflicted with <b>Daze</b> for <span class="text-desc">10</span> second(s). <b>Dazed</b> enemies will not actively attack the team.
      <br />When attacking a <b>Dazed</b> enemy to enter combat, deals <b class="text-hsr-physical">Physical DMG</b> to all enemies equal to <span class="text-desc">80%</span> of Argenti's ATK and regenerates his Energy by <span class="text-desc">15</span>.`,
    },
    a2: {
      title: 'A2: Piety',
      content: `At the start of a turn, immediately gains <span class="text-desc">1</span> stack(s) of <b>Apotheosis</b>.`,
    },
    a4: {
      title: 'A4: Generosity',
      content: `When enemy targets enter battle, immediately regenerates <span class="text-desc">2</span> Energy for self.`,
    },
    a6: {
      title: 'A6: Courage',
      content: `Deals <span class="text-desc">15%</span> more DMG to enemies whose HP percentage is <span class="text-desc">50%</span> or less.`,
    },
    c1: {
      title: 'E1: Suspension of Disbelief',
      content: `The Cipher effect applied by the Ultimate lasts for <span class="text-desc">1</span> extra turn. All allies affected by Cipher have their ATK increased by <span class="text-desc">40%</span>.`,
    },
    c2: {
      title: 'E2: Purely Fictitious',
      content: `Each Talent stack allows allies to ignore <span class="text-desc">8%</span> of the enemy target's DEF when dealing DMG to enemies.`,
    },
    c3: {
      title: 'E3: Pipedream',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      title: 'E4: Flitting Phantasm',
      content: `The Ultimate recovers <span class="text-desc">1</span> more Skill Point. The Talent additionally increases Max Skill Points by <span class="text-desc">1</span>.`,
    },
    c5: {
      title: 'E5: Parallax Truth',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      title: 'E6: Narrative Polysemy',
      content: `The CRIT DMG Boost effect of Sparkle's Skill additionally increases by <span class="text-desc">30%</span> of Sparkle's CRIT DMG, and when she uses her Skill, the CRIT DMG Boost effect will apply to all allies currently with Cipher. When Sparkle uses her Ultimate, this effect will spread to all allies with Cipher should the allied target have the CRIT DMG increase effect provided by the Skill active on them.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'arg_enhanced_ult',
      text: `Enhanced Ultimate`,
      ...talents.talent,
      show: true,
      unique: true,
      default: true,
    },
    {
      type: 'number',
      id: 'apotheosis',
      text: `Apotheosis Stacks`,
      ...talents.talent,
      show: true,
      unique: true,
      default: c >= 4 ? 2 : 0,
      min: c >= 4 ? 2 : 0,
      max: c >= 4 ? 12 : 10,
    },
    {
      type: 'toggle',
      id: 'arg_a6',
      text: `Target HP <= 50%`,
      ...talents.a6,
      show: a.a6,
      default: true,
    },
    {
      type: 'toggle',
      id: 'arg_c2',
      text: `E2 AoE Ult ATK Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: true,
    },
  ]

  const teammateContent: IContent[] = []

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
      }[]
    ) => {
      const base = _.cloneDeep(x)

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 30,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.6, 0.06, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 30,
        },
      ]

      base.ULT_SCALING = form.arg_enhanced_ult
        ? [
            {
              name: 'AoE',
              value: [{ scaling: calcScaling(1.68, 0.112, ult, 'curved'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.ULT,
              break: 60,
            },
            {
              name: 'Bounce [x6]',
              value: [{ scaling: calcScaling(0.57, 0.038, ult, 'curved'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.ULT,
              break: 15,
            },
            {
              name: 'Max Single Target DMG',
              value: [
                {
                  scaling: calcScaling(1.68, 0.112, ult, 'curved') + calcScaling(0.57, 0.038, ult, 'curved') * 6,
                  multiplier: Stats.ATK,
                },
              ],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.ULT,
              break: 90 + 15 * 6,
            },
          ]
        : [
            {
              name: 'AoE',
              value: [{ scaling: calcScaling(0.96, 0.084, ult, 'curved'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.ULT,
              break: 60,
            },
          ]
      base.TECHNIQUE_SCALING.push({
        name: 'AoE',
        value: [{ scaling: 0.8, multiplier: Stats.ATK }],
        element: Element.PHYSICAL,
        property: TalentProperty.NORMAL,
        type: TalentType.TECH,
      })

      if (form.arg_enhanced_ult) base.ULT_ALT = true
      if (form.apotheosis) {
        base[Stats.CRIT_RATE] += calcScaling(0.01, 0.0015, talent, 'curved') * form.apotheosis
        if (c >= 1) base[Stats.CRIT_DMG] += 0.04 * form.apotheosis
      }
      if (form.arg_a6) base[Stats.ALL_DMG] += 0.15
      if (form.arg_c2) base[Stats.P_ATK] += 0.4
      if (c >= 6) base.ULT_DEF_PEN += 0.3

      return base
    },
    preComputeShared: (
      own: StatsObject,
      base: StatsObject,
      form: Record<string, any>,
      aForm: Record<string, any>,
      debuffs: { type: DebuffTypes; count: number }[]
    ) => {
      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      team: StatsObject[],
      allForm: Record<string, any>[]
    ) => {
      return base
    },
  }
}

export default Argenti
