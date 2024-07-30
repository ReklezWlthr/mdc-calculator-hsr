import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Sushang = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
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
      title: `Cloudfencer Art: Starshine`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Sushang's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Cloudfencer Art: Mountainfall`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Sushang's ATK to a single enemy. In addition, there is a <span class="text-desc">33%</span> chance to trigger <b>Sword Stance</b> on the final hit, dealing Additional <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Sushang's ATK to the enemy.
      <br />If the enemy is inflicted with Weakness Break, <b>Sword Stance</b> is guaranteed to trigger.`,
      value: [
        { base: 105, growth: 10.5, style: 'curved' },
        { base: 50, growth: 5, style: 'curved' },
      ],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Shape of Taixu: Dawn Herald',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Sushang's ATK to a single enemy target, and she immediately takes action again. In addition, Sushang's ATK increases by {{1}}% and using her Skill has <span class="text-desc">2</span> extra chances to trigger <b>Sword Stance</b> for <span class="text-desc">2</span> turn(s).
      <br /><b>Sword Stance</b> triggered from the extra chances deals <span class="text-desc">50%</span> of the original DMG.`,
      value: [
        { base: 24, growth: 1.6, style: 'curved' },
        { base: 60, growth: 4, style: 'curved' },
        { base: 9.6, growth: 0.64, style: 'curved' },
        { base: 24, growth: 1.6, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Dancing Blade`,
      content: `When an enemy has their Weakness Broken on the field, Sushang's SPD increases by {{0}}% for <span class="text-desc">2</span> turn(s).`,
      value: [{ base: 15, growth: 0.5, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: `Cloudfencer Art: Warcry`,
      content: `Immediately attacks the enemy. Upon entering battle, Sushang deals <b class="text-hsr-physical">Physical DMG</b> equal to <span class="text-desc">80%</span> of her ATK to all enemies.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Guileless`,
      content: `When current HP percentage is <span class="text-desc">50%</span> or lower, reduces the chance of being attacked by enemies.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Riposte`,
      content: `For every <b>Sword Stance</b> triggered, the DMG dealt by <b>Sword Stance</b> increases by <span class="text-desc">2%</span>. Stacks up to <span class="text-desc">10</span> time(s).`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Vanquisher`,
      content: `After using Basic ATK or Skill, if there are enemies on the field with Weakness Break, Sushang's action is <u>Advanced Forward</u> by <span class="text-desc">15%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Cut With Ease`,
      content: `After using Skill against a Weakness Broken enemy, regenerates <span class="text-desc">1</span> Skill Point.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Refine in Toil`,
      content: `After triggering <b>Sword Stance</b>, the DMG taken by Sushang is reduced by <span class="text-desc">20%</span> for <span class="text-desc">1</span> turn.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Rise From Fame`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Cleave With Heart`,
      content: `Sushang's Break Effect increases by <span class="text-desc">40%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Prevail via Taixu`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Dwell Like Water`,
      content: `Talent's SPD Boost is stackable and can stack up to <span class="text-desc">2</span> times. Additionally, after entering battle, Sushang immediately gains <span class="text-desc">1</span> stack of her Talent's SPD Boost.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'dawn_herald',
      text: `Dawn Herald`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'sushang_a2',
      text: `Current HP <= 50%`,
      ...talents.a2,
      show: a.a2,
      default: true,
    },
    {
      type: 'number',
      id: 'sushang_a4',
      text: `A4 Sword Stance Stacks`,
      ...talents.a4,
      show: a.a4,
      default: 0,
      min: 0,
      max: 10,
    },
    {
      type: 'toggle',
      id: 'sushang_c2',
      text: `E2 DMG Reduction`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'sushang_talent',
      text: `Talent SPD Bonus`,
      ...talents.talent,
      show: c < 6,
      default: true,
      duration: 2,
    },
    {
      type: 'number',
      id: 'sushang_talent',
      text: `Talent SPD Bonus`,
      ...talents.talent,
      show: c >= 6,
      default: 1,
      min: 0,
      max: 2,
      duration: 2,
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
      }[],
      weakness: Element[],
      broken: boolean
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
          sum: true,
        },
      ]
      const sword_stance = form.dawn_herald
        ? [
            {
              name: 'Sword Stance DMG',
              value: [{ scaling: calcScaling(0.5, 0.05, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.ADD,
              type: TalentType.NONE,
              chance: { base: broken ? 1 : 0.33, fixed: true },
              bonus: form.sushang_a4 ? form.sushang_a4 * 0.02 : 0,
            },
            {
              name: 'Extra Sword Stance DMG',
              value: [{ scaling: calcScaling(0.5, 0.05, skill, 'curved') * 0.5, multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.ADD,
              type: TalentType.NONE,
              chance: { base: broken ? 1 : 0.33, fixed: true },
              bonus: form.sushang_a4 ? form.sushang_a4 * 0.02 : 0,
            },
            {
              name: 'Total Sword Stance DMG',
              value: [{ scaling: calcScaling(0.5, 0.05, skill, 'curved') * 2, multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.ADD,
              type: TalentType.NONE,
              bonus: form.sushang_a4 ? form.sushang_a4 * 0.02 : 0,
              sum: true,
            },
          ]
        : [
            {
              name: 'Sword Stance DMG',
              value: [{ scaling: calcScaling(0.5, 0.05, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.ADD,
              type: TalentType.NONE,
              chance: { base: broken ? 1 : 0.33, fixed: true },
              bonus: form.sushang_a4 ? form.sushang_a4 * 0.02 : 0,
              sum: true,
            },
          ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.05, 0.105, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
        ...sword_stance,
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.92, 0.128, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.8, multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
          sum: true,
        },
      ]

      if (form.dawn_herald)
        base[Stats.P_ATK].push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.18, 0.012, talent, 'curved'),
        })
      if (form.sushang_talent)
        base[Stats.P_SPD].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.15, 0.005, talent, 'curved') * form.sushang_talent,
        })
      if (form.sushang_a2)
        base.AGGRO.push({
          name: 'Ascension 2 Passive',
          source: 'Self',
          value: -0.5,
        })
      if (form.sushang_c2)
        base.DMG_REDUCTION.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.2,
        })
      if (c >= 4)
        base[Stats.BE].push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.4,
        })

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
      return base
    },
  }
}

export default Sushang
