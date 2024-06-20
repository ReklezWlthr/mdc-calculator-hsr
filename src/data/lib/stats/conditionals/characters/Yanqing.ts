import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Yanqing = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const talents: ITalent = {
    normal: {
      title: `Frost Thorn`,
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Yanqing's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      title: `Darting Ironthorn`,
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Yanqing's ATK to a single enemy and activates <b>Soulsteel Sync</b> for <span class="text-desc">1</span> turn.`,
      value: [{ base: 110, growth: 11, style: 'curved' }],
      level: skill,
    },
    ult: {
      title: 'Amidst the Raining Bliss',
      content: `Increases Yanqing's CRIT Rate by <span class="text-desc">60%</span>. When <b>Soulsteel Sync</b> is active, increases Yanqing's CRIT DMG by an extra {{0}}%. This buff lasts for one turn. Afterwards, deals <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of Yanqing's ATK to a single enemy.`,
      value: [
        { base: 30, growth: 2, style: 'curved' },
        { base: 210, growth: 14, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      title: `One With the Sword`,
      content: `When <b>Soulsteel Sync</b> is active, Yanqing is less likely to be attacked by enemies. Yanqing's CRIT Rate increases by {{0}}% and his CRIT DMG increases by {{1}}%. After Yanqing attacks an enemy, there is {{2}}% <u>fixed chance</u> to perform a follow-up attack, dealing <b class="text-hsr-ice">Ice DMG</b> equal to {{3}}% of Yanqing's ATK to the enemy, which has a <span class="text-desc">65%</span> <u>base chance</u> to <b class="text-hsr-ice">Freeze</b> the enemy for <span class="text-desc">1</span> turn.
      <br />The <b class="text-hsr-ice">Frozen</b> target cannot take action and receives Additional <b class="text-hsr-ice">Ice DMG</b> equal to {{3}}% of Yanqing's ATK at the beginning of each turn.
      <br />When Yanqing receives DMG, the <b>Soulsteel Sync</b> effect will disappear.`,
      value: [
        { base: 15, growth: 0.5, style: 'curved' },
        { base: 15, growth: 1.5, style: 'curved' },
        { base: 50, growth: 1, style: 'curved' },
        { base: 25, growth: 2.5, style: 'curved' },
      ],
      level: talent,
    },
    technique: {
      title: `The One True Sword`,
      content: `After using his Technique, at the start of the next battle, Yanqing deals <span class="text-desc">30%</span> more DMG for <span class="text-desc">2</span> turn(s) to enemies whose current HP is <span class="text-desc">50%</span> or higher.`,
    },
    a2: {
      title: `Icing on the Kick`,
      content: `When Yanqing attacks, deals Additional <b class="text-hsr-ice">Ice DMG</b> equal to <span class="text-desc">30%</span> of Yanqing's ATK to enemies with <b class="text-hsr-ice">Ice</b> Weakness.`,
    },
    a4: {
      title: `Frost Favors the Brave`,
      content: `When <b>Soulsteel Sync</b> is active, Effect RES increases by <span class="text-desc">20%</span>.`,
    },
    a6: {
      title: `Gentle Blade`,
      content: `When a CRIT Hit is triggered, increases SPD by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c1: {
      title: `Svelte Saber`,
      content: `When Yanqing attacks a <b class="text-hsr-ice">Frozen</b> enemy, he deals Additional <b class="text-hsr-ice">Ice DMG</b> equal to <span class="text-desc">60%</span> of his ATK.`,
    },
    c2: {
      title: `Supine Serenade`,
      content: `When <b>Soulsteel Sync</b> is active, Energy Regeneration Rate increases by an extra <span class="text-desc">10%</span>.`,
    },
    c3: {
      title: `Sword Savant`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      title: `Searing Sting`,
      content: `When the current HP percentage is <span class="text-desc">80%</span> or higher, <b class="text-hsr-ice">Ice RES PEN</b> increases by <span class="text-desc">12%</span>.`,
    },
    c5: {
      title: `Surging Strife`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      title: `Swift Swoop`,
      content: `If the Ultimate's buffs are still in effect when an enemy is defeated, their duration is extended by <span class="text-desc">1</span> turn.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'soulsteel',
      text: `Soulsteel Sync`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'yanqing_ult',
      text: `Amidst the Raining Bliss`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'yanqing_tech',
      text: `Technique DMG Bonus`,
      ...talents.technique,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'yanqing_a6',
      text: `A6 On-CRIT SPD Bonus`,
      ...talents.a6,
      show: a.a6,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'yanqing_c4',
      text: `Current HP >= 80%`,
      ...talents.c4,
      show: c >= 4,
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
      }[],
      weakness: Element[],
      broken: boolean
    ) => {
      const base = _.cloneDeep(x)

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.1, 0.11, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(2.1, 0.14, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Follow-Up',
          value: [{ scaling: calcScaling(0.25, 0.025, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.TALENT,
          break: 10,
          chance: { base: calcScaling(50, 1, talent, 'curved') / 100, fixed: true },
        },
        {
          name: 'Frozen DMG',
          value: [{ scaling: calcScaling(0.25, 0.025, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.FROZEN,
          type: TalentType.NONE,
          chance: { base: 0.65, fixed: false },
        },
      ]

      if (form.soulsteel) {
        base.BASE_AGGRO.push({
          name: 'Talent',
          source: 'Self',
          value: -0.6,
        })
        base[Stats.CRIT_RATE].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.15, 0.005, talent, 'curved'),
        })
        base[Stats.CRIT_DMG].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.15, 0.015, talent, 'curved'),
        })
        if (a.a4)
          base[Stats.E_RES].push({
            name: 'Ascension 4 Passive',
            source: 'Self',
            value: 0.2,
          })
        if (c >= 2)
          base[Stats.ERR].push({
            name: 'Eidolon 2',
            source: 'Self',
            value: 0.1,
          })
      }
      if (form.yanqing_ult) {
        base[Stats.CRIT_RATE].push({
          name: 'Ultimate',
          source: 'Self',
          value: 0.6,
        })
        if (form.soulsteel)
          base[Stats.CRIT_DMG].push({
            name: 'Ultimate',
            source: 'Self',
            value: calcScaling(0.3, 0.02, talent, 'curved'),
          })
      }
      if (form.yanqing_tech)
        base[Stats.ALL_DMG].push({
          name: 'Technique',
          source: 'Self',
          value: 0.3,
        })
      if (form.yanqing_a6)
        base[Stats.P_SPD].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.1,
        })
      if (form.yanqing_c4)
        base.ICE_RES_PEN.push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.12,
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
      if (_.includes(weakness, Element.ICE) && a.a2)
        base.TALENT_SCALING.push({
          name: 'A2 Additional DMG',
          value: [{ scaling: 0.3, multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
        })
      if (countDebuff(debuffs, DebuffTypes.FROZEN) && c >= 1)
        base.TALENT_SCALING.push({
          name: 'E1 Additional DMG',
          value: [{ scaling: 0.6, multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
        })
      return base
    },
  }
}

export default Yanqing
