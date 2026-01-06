import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import {
  AbilityTag,
  Element,
  ITalentLevel,
  ITeamChar,
  PathType,
  Stats,
  TalentProperty,
  TalentType,
} from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/data_format'
import { IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'

const Feixiao = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      trace: 'Basic ATK',
      title: `Boltsunder`,
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Feixiao's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      trace: 'Skill',
      title: 'Waraxe',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Feixiao's ATK to a target enemy. Then, immediately launches <span class="text-desc">1</span> instance of Talent's <u>follow-up attack</u> against the target.`,
      value: [{ base: 100, growth: 10, style: 'curved' }],
      level: skill,
      tag: AbilityTag.ST,
      sp: -1,
    },
    ult: {
      trace: 'Ultimate',
      title: `Terrasplit`,
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> to a single target enemy, up to {{0}}% of Feixiao's ATK. During this time, can ignore Weakness Type to reduce the target's Toughness. When the target is not Weakness Broken, Feixiao's Weakness Break Efficiency increases by <span class="text-desc">100%</span>.
        <br />During the attack, Feixiao first launches <b>Boltsunder Blitz</b> or <b>Waraxe Skyward</b> on the target, for a total of <span class="text-desc">6</span> time(s).
        <br />Finally, deals <b class="text-hsr-wind">Wind DMG</b> equal to {{1}}% of Feixiao's ATK to the target.
        <br /><br /><b>Boltsunder Blitz</b>: Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{2}}% of Feixiao's ATK to the chosen target. If the target is Weakness Broken, the DMG multiplier increases by {{3}}%.
        <br /><b>Waraxe Skyward</b>: Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{2}}% of Feixiao's ATK to the chosen target. If the target is not Weakness Broken, the DMG multiplier increases by {{3}}%.`,
      value: [
        { base: 402, growth: 29.8, style: 'curved' },
        { base: 96, growth: 6.4, style: 'curved' },
        { base: 36, growth: 2.4, style: 'curved' },
        { base: 15, growth: 1.5, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.ST,
    },
    talent: {
      trace: 'Talent',
      title: `Thunderhunt`,
      content: `Can activate Ultimate when <b class="text-hsr-wind">Flying Aureus</b> reaches <span class="text-desc">6</span> points, accumulating up to <span class="text-desc">12</span> points. Feixiao gains <span class="text-desc">1</span> point of <b class="text-hsr-wind">Flying Aureus</b> for every <span class="text-desc">2</span> attacks by ally targets. Feixiao's Ultimate attacks do not count towards this number.
        <br />After Feixiao's teammates attack an enemy target, Feixiao immediately launches <u>follow-up attacks</u> against the primary target, deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Feixiao's ATK. If no primary targets are available to attack, Feixiao attacks a single random enemy instead. This effect can only trigger once per turn and the trigger count resets at the start of Feixiao's turn. When using this attack, increases DMG dealt by this unit by {{1}}%, lasting for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 55, growth: 5.5, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.ST,
    },
    technique: {
      trace: 'Technique',
      title: 'Stormborn',
      content: `After using the Technique, enters the Onrush state, lasting for <span class="text-desc">20</span> seconds. While in the Onrush, pulls in enemies within a certain range, and increases this unit's movement speed by <span class="text-desc">50%</span>. After entering battle, gains <span class="text-desc">1</span> point(s) of <b class="text-hsr-wind">Flying Aureus</b>.
        <br />While in Onrush, actively attacking will start battle with all pulled enemies. After entering battle, deal <b class="text-hsr-wind">Wind DMG</b> equal to <span class="text-desc">200%</span> of Feixiao's ATK to all enemies at the start of each wave. This DMG is guaranteed to CRIT. When more than <span class="text-desc">1</span> enemy is pulled in, increase the multiplier of this DMG by <span class="text-desc">100%</span> for each additional enemy pulled in, up to a maximum of <span class="text-desc">1,000%</span>.`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Heavenpath`,
      content: `When the battle starts, gains <span class="text-desc">3</span> point(s) of <b class="text-hsr-wind">Flying Aureus</b>.
      <br />At the start of the turn, if no <u>follow-up attack</u> was launched in the previous turn, then this counts <span class="text-desc">1</span> toward the number of attacks required to gain <b class="text-hsr-wind">Flying Aureus</b>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Formshift`,
      content: `When using Ultimate to deal DMG to an enemy target, it is considered as a <u>follow-up attack</u>. <u>Follow-up attacks</u>' CRIT DMG increases by <span class="text-desc">36%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Boltcatch`,
      content: `When using Skill, increases ATK by <span class="text-desc">48%</span>, lasting for <span class="text-desc">3</span> turn(s).`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Skyward I Quell`,
      content: `After launching <b>Boltsunder Blitz</b> or <b>Waraxe Skyward</b>, additionally increases the Ultimate DMG dealt by Feixiao by an amount equal to <span class="text-desc">10%</span> of the original DMG, stacking up to <span class="text-desc">5</span> time(s) and lasting until the end of the Ultimate action.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Moonward I Wish`,
      content: `In the Talent's effect, for every <span class="text-desc">1</span> instance of <u>follow-up attack</u> launched by ally targets, Feixiao gains <span class="text-desc">1</span> point of <b class="text-hsr-wind">Flying Aureus</b>. This effect can trigger up to <span class="text-desc">6</span> time(s) per turn.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Starward I Bode`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Stormward I Hear`,
      content: `The follow-up attack from Talent has its Toughness Reduction increased by <span class="text-desc">100%</span>, and when it launches, increases this unit's SPD by <span class="text-desc">8%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Heavenward I Leap`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Homeward I Near`,
      content: `Increases the All-Type RES PEN of Ultimate DMG dealt by Feixiao by <span class="text-desc">20%</span>. Talent's <u>follow-up attack</u> DMG is considered as Ultimate DMG at the same time, and its DMG multiplier increases by <span class="text-desc">140%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'feixiao_talent',
      text: `Talent DMG Bonus`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'feixiao_a6',
      text: `A6 ATK Bonus`,
      ...talents.a6,
      show: a.a6,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'feixiao_c4',
      text: `E4 SPD Bonus`,
      ...talents.c4,
      show: c >= 4,
      default: true,
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
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
          hitSplit: [0.2, 0.2, 0.6],
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1, 0.1, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
          hitSplit: [0.34, 0.33, 0.33],
        },
      ]
      const hitScaling = (buff: boolean) =>
        calcScaling(0.36, 0.024, ult, 'curved') + (buff ? calcScaling(0.15, 0.015, ult, 'curved') : 0)
      base.ULT_SCALING = [
        {
          name: 'Max Single Target DMG',
          value:
            c >= 1
              ? [
                  ..._.map(Array(6), (_v, i) => ({
                    scaling: hitScaling(true) * (1 + i / 10),
                    multiplier: Stats.ATK,
                  })),
                  { scaling: calcScaling(0.96, 0.064, ult, 'curved') * 1.5, multiplier: Stats.ATK },
                ]
              : [{ scaling: calcScaling(4.02, 0.298, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: a.a4 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
        {
          name: 'Boltsunder Blitz DMG',
          value: [{ scaling: hitScaling(broken), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: a.a4 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 5,
          hitSplit: [0.1, 0.9],
        },
        {
          name: 'Waraxe Skyward DMG',
          value: [{ scaling: hitScaling(!broken), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: a.a4 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 5,
          hitSplit: [0.1, 0.9],
        },
        {
          name: 'Final Hit DMG',
          value: [{ scaling: calcScaling(0.96, 0.064, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: a.a4 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.ULT,
          multiplier: c >= 1 ? 1.5 : 1,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.55, 0.055, talent, 'curved') + (c >= 6 ? 1.4 : 0), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.FUA,
          type: c >= 6 ? TalentType.ULT : TalentType.TALENT,
          break: c >= 4 ? 10 : 5,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'Min AoE',
          value: [{ scaling: 2, multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          overrideCr: 1,
          sum: true,
        },
        {
          name: 'Max AoE',
          value: [{ scaling: 10, multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          overrideCr: 1,
        },
      ]

      if (form.feixiao_talent) {
        base[Stats.ALL_DMG].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.3, 0.03, talent, 'curved'),
        })
      }
      if (a.a4) {
        base.FUA_CD.push({
          name: 'Ascension 4 Passive',
          source: 'Self',
          value: 0.36,
        })
      }
      if (form.feixiao_a6) {
        base[Stats.P_ATK].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.48,
        })
      }
      if (form.feixiao_c4) {
        base[Stats.P_SPD].push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.08,
        })
      }
      if (c >= 6) {
        base.ULT_RES_PEN.push({
          name: 'Eidolon 6',
          source: 'Self',
          value: 0.2,
        })
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

export default Feixiao
