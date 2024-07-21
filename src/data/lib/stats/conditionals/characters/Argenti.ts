import { findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Argenti = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Fleeting Fragrance',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Argenti's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Justice, Hereby Blooms',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Argenti's ATK to all enemies.`,
      value: [{ base: 60, growth: 6, style: 'curved' }],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'For In This Garden Supreme Beauty Bestows',
      content: `Consumes <span class="text-desc">90</span> Energy and deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Argenti's ATK to all enemies.`,
      value: [{ base: 96, growth: 6.4, style: 'curved' }],
      level: ult,
    },
    ult_alt: {
      energy: 5,
      trace: 'Enhanced Ultimate',
      title: 'Merit Bestowed in "My" Garden',
      content: `Consumes <span class="text-desc">180</span> Energy and deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Argenti's ATK to all enemies, and further deals DMG for 6 extra time(s), with each time dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Argenti's ATK to a random enemy.`,
      value: [
        { base: 168, growth: 11.2, style: 'curved' },
        { base: 57, growth: 3.8, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: 'Sublime Object',
      content: `For every enemy hit when Argenti uses his Basic Attack, Skill, or Ultimate, regenerates Argenti's Energy by <span class="text-desc">3</span>, and grants him a stack of <b>Apotheosis</b>, increasing his CRIT Rate by {{0}}%. This effect can stack up to <span class="text-desc">10</span> time(s).`,
      value: [{ base: 1, growth: 0.15, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'Manifesto of Purest Virtue',
      content: `After using the Technique, enemies in a set area are inflicted with <b>Daze</b> for <span class="text-desc">10</span> second(s). <b>Dazed</b> enemies will not actively attack the team.
      <br />When attacking a <b>Dazed</b> enemy to enter combat, deals <b class="text-hsr-physical">Physical DMG</b> to all enemies equal to <span class="text-desc">80%</span> of Argenti's ATK and regenerates his Energy by <span class="text-desc">15</span>.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Piety',
      content: `At the start of a turn, immediately gains <span class="text-desc">1</span> stack(s) of <b>Apotheosis</b>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Generosity',
      content: `When enemy targets enter battle, immediately regenerates <span class="text-desc">2</span> Energy for self.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Courage',
      content: `Deals <span class="text-desc">15%</span> more DMG to enemies whose HP percentage is <span class="text-desc">50%</span> or less.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'A Lacuna in Kingdom of Aesthetics',
      content: `Each stack of <b>Apotheosis</b> additionally increases CRIT DMG by <span class="text-desc">4%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Agate's Humility`,
      content: `If the number of enemies on the field equals to <span class="text-desc">3</span> or more when the Ultimate is used, ATK increases by <span class="text-desc">40%</span> for <span class="text-desc">1</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Thorny Road's Glory`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Trumpet's Dedication`,
      content: `At the start of battle, gains <span class="text-desc">2</span> stack(s) of <b>Apotheosis</b> and increases the maximum stack limit of the Talent's effect by <span class="text-desc">2</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Snow, From Somewhere in Cosmos',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: '"Your" Resplendence',
      content: `When using Ultimate, ignores <span class="text-desc">30%</span> of enemy targets' DEF.`,
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
      sync: true,
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
          break: 10,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.6, 0.06, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
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
              break: 20,
            },
            {
              name: 'Bounce',
              value: [{ scaling: calcScaling(0.57, 0.038, ult, 'curved'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.ULT,
              break: 5,
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
              break: 20 + 5 * 6,
            },
          ]
        : [
            {
              name: 'AoE',
              value: [{ scaling: calcScaling(0.96, 0.084, ult, 'curved'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.ULT,
              break: 20,
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
        base[Stats.CRIT_RATE].push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.01, 0.0015, talent, 'curved') * form.apotheosis,
        })
        if (c >= 1)
          base[Stats.CRIT_DMG].push({
            name: `Talent (Eidolon 1)`,
            source: 'Self',
            value: 0.04 * form.apotheosis,
          })
      }
      if (form.arg_a6)
        base[Stats.ALL_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.15,
        })
      if (form.arg_c2)
        base[Stats.P_ATK].push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.4,
        })
      if (c >= 6)
        base.ULT_DEF_PEN.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.3,
        })

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
