import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject, StatsObjectKeys } from '../../baseConstant'
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
import { checkBuffExist } from '../../../../../core/utils/finder'
import { CallbackType } from '@src/domain/stats'

const Evernight = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
    memo_skill: c >= 5 ? 1 : 0,
    memo_talent: c >= 3 ? 1 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent
  const memo_skill = t.memo_skill + upgrade.memo_skill
  const memo_talent = t.memo_talent + upgrade.memo_talent

  const remembranceCount = _.filter(team, (m) => findCharacter(m.cId)?.path === PathType.REMEMBRANCE).length
  let skillCritDmg = 0
  switch (remembranceCount) {
    case 1:
      skillCritDmg = 0.05
      break
    case 2:
      skillCritDmg = 0.15
      break
    case 3:
      skillCritDmg = 0.5
      break
    case 4:
      skillCritDmg = 0.65
      break
  }

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Time Thence Blurs',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Evernight's Max HP to one designated enemy.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Day Gently Slips',
      content: `Consumes <span class="text-desc">10%</span> of Evernight's current HP to summon memosprite <b>Evey</b> and increase CRIT DMG of all ally memosprites by an amount equal to {{0}}% of Evernight's CRIT DMG for <span class="text-desc">2</span> turn(s). Duration decreases by <span class="text-desc">1</span> at the start of each of Evernight's turns. If <b>Evey</b> is already on the field, restores <span class="text-desc">50%</span> of its Max HP. When used, gains <span class="text-desc">2</span> <b class="text-indigo-300">Memoria</b>. If in the <b class="text-violet-500">Darkest Riddle</b> state, additionally gains <span class="text-desc">12</span> <b class="text-indigo-300">Memoria</b>.`,
      value: [{ base: 12, growth: 1.2, style: 'curved' }],
      level: skill,
      tag: AbilityTag.SUMMON,
    },
    summon_skill: {
      energy: 10,
      trace: 'Memosprite Skill',
      title: 'Remembrance, Whirling, Like Rain',
      content: `This ability automatically selects a target, prioritizing the enemy target that Evernight last attacked. Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of <b>Evey</b>'s Max HP to one enemy. For every <span class="text-desc">4</span> point(s) of <b class="text-indigo-300">Memoria</b> Evernight currently has, further deals <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of <b>Evey</b>'s Max HP. After use, Evernight gains <span class="text-desc">1</span> point(s) of <b class="text-indigo-300">Memoria</b>.`,
      value: [
        { base: 25, growth: 5, style: 'linear' },
        { base: 5, growth: 1, style: 'linear' },
      ],
      level: memo_skill,
      tag: AbilityTag.ST,
    },
    summon_skill_alt: {
      energy: 10,
      trace: 'Enhanced Memo. Skill',
      title: 'Dream, Dissolving, as Dew',
      content: `When Evernight's <b class="text-indigo-300">Memoria</b> is greater than or equal to <span class="text-desc">16</span> points, and Evernight is not under a Crowd Control state, this ability can be used. For each point of <b class="text-indigo-300">Memoria</b> currently in possession, deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of <b>Evey</b>'s Max HP to the primary target, and <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of <b>Evey</b>'s Max HP to other enemy targets. After use, consumes all <b class="text-indigo-300">Memoria</b> and HP, and <b>Evey</b> disappears.`,
      value: [
        { base: 6, growth: 1.2, style: 'linear' },
        { base: 3, growth: 0.6, style: 'linear' },
      ],
      level: memo_skill,
      tag: AbilityTag.AOE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `O Wakeful World, Goodnight`,
      content: `Summons memosprite <b>Evey</b>, then memosprite <b>Evey</b> deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of <b>Evey</b>'s Max HP to all enemies, and causes Evernight to enter the <b class="text-violet-500">Darkest Riddle</b> state. During this state, the DMG received by all enemies increases by {{1}}%, the DMG dealt by Evernight and memosprite <b>Evey</b> increases by {{2}}%, and both Evernight and memosprite <b>Evey</b> are immune to Crowd Control debuffs. Gains <span class="text-desc">2</span> <b class="text-violet-500">Darkest Riddle</b> Charge(s). Memosprite <b>Evey</b> consumes <span class="text-desc">1</span> Charge after using <b>Dream, Dissolving, as Dew</b>. At the start of Evernight's turn, if no Charges remain, exits the <b class="text-violet-500">Darkest Riddle</b> state.`,
      value: [
        { base: 100, growth: 10, style: 'curved' },
        { base: 15, growth: 1.5, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `With Me, This Night`,
      content: `When entering combat, summons memosprite <b>Evey</b>. Memosprite <b>Evey</b> has <span class="text-desc">160</span> SPD by default, and its Max HP is <span class="text-desc">50%</span> of Evernight's Max HP. Each time Evernight or memosprite <b>Evey</b> loses HP, increases CRIT DMG for both this unit and memosprite <b>Evey</b> by {{0}}% for <span class="text-desc">2</span> turn(s), and gains <span class="text-desc">2</span> <b class="text-indigo-300">Memoria</b>. This effect can trigger only once per target per attack.
      <br />When Evernight has <span class="text-desc">16</span> or more <b class="text-indigo-300">Memoria</b>, dispels and becomes immune to Crowd Control debuffs. If memosprite <b>Evey</b> is on the field, it immediately takes action. The immediate action effect can only trigger again after memosprite Evey uses <b>Dream, Dissolving, as Dew</b>.`,
      value: [{ base: 30, growth: 3, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    summon_talent: {
      trace: 'Memosprite Talent [1]',
      title: `Solitude, Drifting, In Murk`,
      content: `<b>Evey</b> is immune to Crowd Control debuffs but has increased chance of being targeted. While Evernight is on the field, increases DMG dealt by Evernight and <b>Evey</b> by {{0}}%.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: memo_talent,
      tag: AbilityTag.SUPPORT,
    },
    summon_talent_2: {
      trace: 'Memosprite Talent [2]',
      title: `Night, Trailing, In Step`,
      content: `When summoned, this unit immediately takes action.`,
      value: [],
      level: memo_talent,
      tag: AbilityTag.ENHANCE,
    },
    summon_talent_3: {
      trace: 'Memosprite Talent [3]',
      title: `You, Parting, Beyond Reach`,
      content: `Upon disappearing, increases Evernight's SPD by <span class="text-desc">10%</span>. If the disappearance is due to using <b>Dream, Dissolving, as Dew</b>, for each point of <b class="text-indigo-300">Memoria</b> used in this attack, additionally increases Evernight's SPD by <span class="text-desc">1%</span>, counting up to <span class="text-desc">40</span> point(s) of <b class="text-indigo-300">Memoria</b>. The SPD Boost effect cannot stack, and is removed at the start of Evernight's next turn.`,
      value: [],
      level: memo_talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: 'Let it Rain Cold On Thee',
      content: `After using Technique, at the start of the next battle, gains an effect identical to the Skill which increases all allies' memosprite CRIT DMG, and gains <span class="text-desc">1</span> point(s) of <b class="text-indigo-300">Memoria</b>.`,
      tag: AbilityTag.SUPPORT,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Dark the Night, Still the Moon`,
      content: `Increases Evernight and the memosprite <b>Evey</b>'s CRIT Rate by <span class="text-desc">35%</span>. When using abilities, consumes <span class="text-desc">5%</span> of this unit's current HP to increase both their CRIT DMG by <span class="text-desc">15%</span> for <span class="text-desc">2</span> turn(s). After memosprite <b>Evey</b> uses <b>Dream, Dissolving, as Dew</b>, recover <span class="text-desc">1</span> Skill Point for allies.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Rouse the Flame, Lull the Light`,
      content: `At the start of combat, Evernight regenerates <span class="text-desc">70</span> Energy and gains <span class="text-desc">1</span> <b class="text-indigo-300">Memoria</b>. When Evernight or an ally memosprite uses an ability, Evernight regenerates <span class="text-desc">5</span> Energy and gains <span class="text-desc">1</span> <b class="text-indigo-300">Memoria</b>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Kindle the Morn, Drop the Rain`,
      content: `When there are <span class="text-desc">1/2/3/4</span> or more Remembrance characters in the team, while Evernight's Skill persists, additionally increases all memosprites' CRIT DMG by <span class="text-desc">5%/15%/50%/65%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Sleep Tight, the Night Dreams Long`,
      content: `When Evernight is on the field and when there are <span class="text-desc">4 or more/3/2/1</span> enemy targets on the field, ally memosprites deal <span class="text-desc">120%/125%/130%/150%</span> of their original DMG respectively.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Listen Up, the Slumber Speaks Soft`,
      content: `Increases Evernight's and memosprite Evey's CRIT DMG by <span class="text-desc">40%</span>. Each time Evernight gains <b class="text-indigo-300">Memoria</b>, increases the gained <b class="text-indigo-300">Memoria</b> by <span class="text-desc">2</span> point(s). When using Ultimate, additionally gains <span class="text-desc">2</span> <b class="text-violet-500">Darkest Riddle</b> state Charge(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Fear Not, the Nightmare Lies Past`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Memosprite Talent Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Wake Up, the Tomorrow is Yours',
      content: `While Evernight is on the field, ally memosprites' Weakness Break Efficiency increases by <span class="text-desc">25%</span>, and memosprite <b>Evey</b> gains an additional <span class="text-desc">25%</span> Weakness Break Efficiency.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Let Go, the "Me" in Memories`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Memosprite Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Like This, Always',
      content: `While Evernight is on the field, all allies' <b>All-Type RES PEN</b> increases by <span class="text-desc">20%</span>. After memosprite Evey uses <b>Dream, Dissolving, as Dew</b>, Evernight gains <span class="text-desc">30%</span> of the consumed <b class="text-indigo-300">Memoria</b> in this attack.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'memoria',
      text: `Memoria`,
      ...talents.talent,
      show: true,
      default: 16,
      min: 0,
    },
    {
      type: 'toggle',
      id: 'evernight_skill',
      text: `Memosprite CRIT DMG Bonus`,
      ...talents.skill,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'darkest_riddle',
      text: `Darkest Riddle`,
      ...talents.ult,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'evernight_talent',
      text: `Talent CRIT DMG Bonus`,
      ...talents.talent,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'evernight_a2',
      text: `A2 CRIT DMG Bonus`,
      ...talents.a2,
      show: a.a2,
      default: true,
    },
    {
      type: 'toggle',
      id: 'evernight_s_talent',
      text: `Memosprite Talent DMG Bonus`,
      ...talents.summon_talent,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'evernight_s3_talent',
      text: `Memosprite Talent SPD Bonus`,
      ...talents.summon_talent_3,
      show: true,
      default: true,
    },
    {
      type: 'number',
      id: 'evernight_c1',
      text: `Enemies on Field`,
      ...talents.c1,
      show: c >= 1,
      default: 4,
      min: 1,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'evernight_skill'),
    findContentById(content, 'darkest_riddle'),
    findContentById(content, 'evernight_c1'),
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
      base.SUMMON_STATS = _.cloneDeep({
        ...x,
        BASE_ATK: x.BASE_ATK,
        BASE_DEF: x.BASE_DEF,
        BASE_SPD: 160,
        ELEMENT: Element.NONE,
        BASE_HP: x.BASE_HP * 0.5,
        [Stats.HP]: _.map(x[Stats.HP], (item) => ({ ...item, value: item.value * 0.5 })),
        [Stats.P_HP]: x[Stats.P_HP],
        [Stats.P_SPD]: [],
        [Stats.SPD]: [],
        SUMMON_ID: '1413',
        NAME: 'Evey',
        MAX_ENERGY: 0,
      })

      if (form.memoria >= 16) base.MEMO_SKILL_ALT = true

      let c1Bonus = 0
      switch (form.evernight_c1) {
        case 0:
          break
        case 1:
          c1Bonus = 0.5
          break
        case 2:
          c1Bonus = 0.3
          break
        case 3:
          c1Bonus = 0.25
          break
        default:
          c1Bonus = 0.2
          break
      }
      if (c >= 1 && c1Bonus) {
        base.SUMMON_MULT.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: c1Bonus,
        })
      }

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.25, 0.05, basic, 'linear'), multiplier: Stats.HP }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = []
      base.MEMO_SKILL_SCALING =
        form.memoria >= 16
          ? [
              {
                name: 'Main Target',
                value: [
                  { scaling: calcScaling(0.06, 0.012, memo_skill, 'linear') * form.memoria, multiplier: Stats.HP },
                ],
                element: Element.ICE,
                property: TalentProperty.SERVANT,
                type: TalentType.SERVANT,
                break: 30,
                sum: true,
              },
              {
                name: 'Others',
                value: [
                  { scaling: calcScaling(0.03, 0.006, memo_skill, 'linear') * form.memoria, multiplier: Stats.HP },
                ],
                element: Element.ICE,
                property: TalentProperty.SERVANT,
                type: TalentType.SERVANT,
                break: 20,
              },
            ]
          : [
              {
                name: 'Single Target',
                value: [
                  {
                    scaling:
                      calcScaling(0.25, 0.05, memo_skill, 'linear') +
                      _.floor((form.memoria || 0) / 4) * calcScaling(0.05, 0.01, memo_skill, 'linear'),
                    multiplier: Stats.HP,
                  },
                ],
                element: Element.ICE,
                property: TalentProperty.SERVANT,
                type: TalentType.SERVANT,
                break: 10,
                sum: true,
                hitSplit: [0.1, 0.1, 0.1, 0.1, 0.1, 0.5],
              },
            ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1, 0.1, ult, 'curved'), multiplier: Stats.HP }],
          element: Element.ICE,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 20,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = []

      if (form.darkest_riddle) {
        base[Stats.ALL_DMG].push({
          name: `Darkest Riddle`,
          source: 'Self',
          value: calcScaling(0.3, 0.03, ult, 'curved'),
        })
        base.VULNERABILITY.push({
          name: `Darkest Riddle`,
          source: 'Self',
          value: calcScaling(0.15, 0.015, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.ALL_DMG].push({
            name: `Darkest Riddle`,
            source: 'Evernight',
            value: calcScaling(0.3, 0.03, ult, 'curved'),
          })
          base.SUMMON_STATS.VULNERABILITY.push({
            name: `Darkest Riddle`,
            source: 'Evernight',
            value: calcScaling(0.15, 0.015, ult, 'curved'),
          })
        }
      }
      if (c >= 2) {
        base[Stats.CRIT_DMG].push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.4,
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.CRIT_DMG].push({
            name: `Eidolon 2`,
            source: 'Evernight',
            value: 0.4,
          })
        }
      }
      if (form.evernight_a2) {
        base[Stats.CRIT_DMG].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.15,
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.CRIT_DMG].push({
            name: `Ascension 2 Passive`,
            source: 'Evernight',
            value: 0.15,
          })
        }
      }
      if (form.evernight_talent) {
        base[Stats.CRIT_DMG].push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.3, 0.03, talent, 'curved'),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.CRIT_DMG].push({
            name: `Talent`,
            source: 'Evernight',
            value: calcScaling(0.3, 0.03, talent, 'curved'),
          })
        }
      }
      if (form.evernight_s_talent) {
        base[Stats.ALL_DMG].push({
          name: `Memosprite Talent`,
          source: 'Evey',
          value: calcScaling(0.25, 0.05, memo_talent, 'linear'),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.ALL_DMG].push({
            name: `Memosprite Talent`,
            source: 'Self',
            value: calcScaling(0.25, 0.05, memo_talent, 'linear'),
          })
        }
      }
      if (form.evernight_s3_talent) {
        base[Stats.P_SPD].push({
          name: `Memosprite Talent`,
          source: 'Evey',
          value: 0.1 * (_.min([form.memoria || 0, 40]) * 0.01),
        })
      }
      if (a.a2) {
        base[Stats.CRIT_RATE].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.35,
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.CRIT_RATE].push({
            name: `Ascension 2 Passive`,
            source: 'Evernight',
            value: 0.35,
          })
        }
      }
      if (c >= 4 && base.SUMMON_STATS) {
        base.SUMMON_STATS.BREAK_EFF.push({
          name: `Eidolon 4`,
          source: 'Evernight',
          value: 0.5,
        })
      }
      if (c >= 6) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.2,
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.ALL_TYPE_RES_PEN.push({
            name: `Eidolon 6`,
            source: 'Evernight',
            value: 0.2,
          })
        }
      }

      base.SUMMON_STATS?.AGGRO.push({
        value: 3,
        source: 'Self',
        name: 'Memosprite Talent',
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
      let c1Bonus = 0
      switch (form.evernight_c1) {
        case 0:
          break
        case 1:
          c1Bonus = 0.5
          break
        case 2:
          c1Bonus = 0.3
          break
        case 3:
          c1Bonus = 0.25
          break
        default:
          c1Bonus = 0.2
          break
      }
      if (c >= 1 && c1Bonus) {
        base.SUMMON_MULT.push({
          name: `Eidolon 1`,
          source: 'Evernight',
          value: c1Bonus,
        })
      }

      if (c >= 6) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Evernight',
          value: 0.2,
        })
      }
      if (c >= 4 && base.SUMMON_STATS) {
        base.SUMMON_STATS.BREAK_EFF.push({
          name: `Eidolon 4`,
          source: 'Evernight',
          value: 0.25,
        })
      }
      if (form.darkest_riddle) {
        base.VULNERABILITY.push({
          name: `Darkest Riddle`,
          source: 'Evernight',
          value: calcScaling(0.15, 0.015, ult, 'curved'),
        })
      }

      return base
    },
    postCompute: (
      x: StatsObject,
      form: Record<string, any>,
      _all: StatsObject[],
      allForm: Record<string, any>[],
      debuffs: {
        type: DebuffTypes
        count: number
      }[],
      weakness: Element[],
      broken: boolean,
      globalCallback: CallbackType[]
    ) => {
      if (x.SUMMON_STATS) {
        globalCallback.push(function P99(b, d, w, all) {
          const index = _.findIndex(team, (item) => item?.cId === '1413')

          if (form.evernight_skill) {
            const cyreneIndex = _.findIndex(team, (item) => item?.cId === '1415')
            const cyreneBoost = allForm[cyreneIndex]?.cyrene_evernight
            const b = all[index].getValue(Stats.CRIT_DMG) || 0
            const multiplier =
              calcScaling(0.12, 0.012, skill, 'curved') +
              (cyreneBoost ? calcScaling(0.06, 0.012, all[cyreneIndex].CYRENE_SKILL_LEVEL || 1, 'linear') : 0)
            _.forEach(all, (t) => {
              if (t.SUMMON_STATS) {
                t.SUMMON_STATS[Stats.CRIT_DMG].push({
                  name: `Skill`,
                  source: 'Evernight',
                  value: b * multiplier,
                  multiplier,
                  base: toPercentage(b),
                })
                if (a.a6) {
                  t.SUMMON_STATS[Stats.CRIT_DMG].push({
                    name: `Ascension 6 Passive`,
                    source: 'Evernight',
                    value: skillCritDmg,
                  })
                }
              }
            })
          }

          return all
        })
      }

      return x
    },
  }
}

export default Evernight
