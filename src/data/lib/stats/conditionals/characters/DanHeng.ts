import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const DanHeng = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: 'Cloudlancer Art: North Wind',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Dan Heng's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      title: 'Cloudlancer Art: Torrent',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Dan Heng's ATK to a single enemy.
      <br />On a CRIT Hit, there is a <span class="text-desc">100%</span> <u>base chance</u> to reduce the target's SPD by <span class="text-desc">12%</span> for <span class="text-desc">2</span> turn(s).`,
      value: [{ base: 130, growth: 13, style: 'curved' }],
      level: skill,
    },
    ult: {
      title: 'Ethereal Dream',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Dan Heng's ATK to a single enemy. If the enemy is <b>Slowed</b>, the Ultimate's DMG multiplier increases by {{1}}%.`,
      value: [
        { base: 240, growth: 16, style: 'curved' },
        { base: 72, growth: 4.8, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      title: 'Superiority of Reach',
      content: `When Dan Heng is the target of an ally's Ability, his next attack's <b class="text-hsr-wind">Wind RES PEN</b> increases by {{0}}%. This effect can be triggered again after <span class="text-desc">2</span> turn(s).`,
      value: [{ base: 18, growth: 1.8, style: 'curved' }],
      level: talent,
    },
    technique: {
      title: 'Splitting Spearhead',
      content: `After Dan Heng uses his Technique, his ATK increases by <span class="text-desc">40%</span> at the start of the next battle for <span class="text-desc">3</span> turn(s).`,
    },
    a2: {
      title: 'Hidden Dragon',
      content: `When current HP percentage is <span class="text-desc">50%</span> or lower, reduces the chance of being attacked by enemies.`,
    },
    a4: {
      title: 'Faster Than Light',
      content: `After launching an attack, there is a <span class="text-desc">50%</span> <u>fixed chance</u> to increase own SPD by <span class="text-desc">20%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    a6: {
      title: 'High Gale',
      content: `Basic ATK deals <span class="text-desc">40%</span> more DMG to <b>Slowed</b> enemies.`,
    },
    c1: {
      title: 'The Higher You Fly, the Harder You Fall',
      content: `When the target enemy's current HP percentage is greater than or equal to <span class="text-desc">50%</span>, CRIT Rate increases by <span class="text-desc">12%</span>.`,
    },
    c2: {
      title: `Quell the Venom Octet, Quench the Vice O'Flame`,
      content: `Reduces Talent cooldown by <span class="text-desc">1</span> turn.`,
    },
    c3: {
      title: 'Seen and Unseen',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      title: 'Roaring Dragon and Soaring Sun',
      content: `When Dan Heng uses his Ultimate to defeat an enemy, he will immediately take action again.`,
    },
    c5: {
      title: `A Drop of Rain Feeds a Torrent`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      title: 'The Troubled Soul Lies in Wait',
      content: `The <b>Slow</b> state triggered by Skill reduces the enemy's SPD by an extra <span class="text-desc">8%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'dh_slow',
      text: `CRIT Skill SPD Reduction`,
      ...talents.skill,
      show: true,
      default: false,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'dh_talent',
      text: `Targeted by Ally's Ability`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'dh_tech',
      text: `Technique ATK Bonus`,
      ...talents.technique,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'dh_a2',
      text: `Current HP <= 50%`,
      ...talents.a2,
      show: a.a2,
      default: true,
    },
    {
      type: 'toggle',
      id: 'dh_a4',
      text: `A4 SPD Bonus`,
      ...talents.a4,
      show: a.a4,
      default: true,
    },
    {
      type: 'toggle',
      id: 'dh_c1',
      text: `Target HP >= 50%`,
      ...talents.c1,
      show: c >= 1,
      default: true,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'dh_slow')]

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
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.3, 0.13, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          energy: 30,
        },
      ]

      if (form.dh_slow) {
        base.SPD_REDUCTION.push({
          name: `Skill (CRIT)`,
          source: 'Self',
          value: 0.12 + (c >= 6 ? 0.08 : 0),
        })
        addDebuff(debuffs, DebuffTypes.SPD_RED)
      }
      if (form.dh_tech)
        base[Stats.P_ATK].push({
          name: `Technique`,
          source: 'Self',
          value: 0.4,
        })
      if (form.dh_talent)
        base.WIND_RES_PEN.push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.18, 0.018, talent, 'curved'),
        })
      if (form.dh_a2)
        base.AGGRO.push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: -0.5,
        })
      if (form.dh_a4)
        base[Stats.P_SPD].push({
          name: `Ascension 4 Passive`,
          source: 'Self',
          value: 0.2,
        })
      if (form.dh_c1)
        base[Stats.CRIT_RATE].push({
          name: `Eidolon 1`,
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
      if (form.dh_slow)
        base.SPD_REDUCTION.push({
          name: `Skill (CRIT)`,
          source: 'Dan Heng',
          value: 0.12 + (c >= 6 ? 0.08 : 0),
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
      const slowed = _.sumBy(debuffs, (item) => Number(item.type === DebuffTypes.SPD_RED) * item.count) >= 1
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [
            {
              scaling: calcScaling(2.4, 0.16, ult, 'curved') + (slowed ? calcScaling(0.72, 0.048, ult, 'curved') : 0),
              multiplier: Stats.ATK,
            },
          ],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          energy: 5,
        },
      ]
      if (slowed && a.a6)
        base.BASIC_DMG.push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.4,
        })

      return base
    },
  }
}

export default DanHeng
