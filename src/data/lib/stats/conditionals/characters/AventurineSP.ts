import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import {
  AbilityTag,
  Element,
  GlobalModifiers,
  ITalentLevel,
  ITeamChar,
  PathType,
  Stats,
  TalentProperty,
  TalentType,
} from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/data_format'
import { Banger, IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'
import { CallbackType } from '@src/domain/stats'

const AventurineSP = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
    elation: c >= 5 ? 2 : c >= 3 ? 1 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent
  const elation = t.elation + upgrade.elation

  const index = _.findIndex(team, (item) => item?.cId === '1513')
  const elationCount = _.filter(team, (t) => findCharacter(t.cId)?.path === PathType.ELATION)?.length || 1

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: 'Torrent, Bullseye Hit',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Aventurine • Waveflair's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      energy: 20,
      image: 'asset/traces/SkillIcon_1513_Normal.webp',
    },
    skill: {
      trace: 'Skill',
      title: 'Fatal Shot, Boiling Sands',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Aventurine • Waveflair's ATK to all enemies, and gains <span class="text-desc">2</span> <b class="text-orange-400">Punchline</b> and <span class="text-desc">4</span> point(s) of <b class="text-green-300">Fervor</b>.`,
      value: [{ base: 120, growth: 12, style: 'curved' }],
      level: skill,
      tag: AbilityTag.AOE,
      sp: -1,
      image: 'asset/traces/SkillIcon_1513_BP.webp',
    },
    summon_skill: {
      participantId: 156,
      trace: 'Elation Skill',
      title: 'Cheers! To the Blazing Summer',
      content: `Deals {{0}}% <b class="text-hsr-quantum">Quantum</b> <b class="elation">Elation DMG</b> to all enemies, and additionally deals <span class="text-desc">10</span> instance(s) of DMG, with each instance dealing {{1}}% <b class="text-hsr-quantum">Quantum</b> <b class="elation">Elation DMG</b> to one random enemy.`,
      value: [
        { base: 30, growth: 3, style: 'curved' },
        { base: 7.5, growth: 0.75, style: 'curved' },
      ],
      level: elation,
      tag: AbilityTag.AOE,
      energy: 5,
      image: 'asset/traces/SkillIcon_1513_Elation.webp',
    },
    summon_skill_alt: {
      participantId: 156,
      trace: 'Enhanced Elation Skill',
      title: 'All in! To the Blazing Summer',
      content: `Deals {{0}}% <b class="text-hsr-quantum">Quantum</b> <b class="elation">Elation DMG</b> to all enemies, and additionally deals <span class="text-desc">10</span> instance(s) of DMG, with each instance dealing {{1}}% <b class="text-hsr-quantum">Quantum</b> <b class="elation">Elation DMG</b> to one random enemy. Consumes all <b class="text-green-300">Fervor</b> upon use. For every <span class="text-desc">1</span> point of <b class="text-green-300">Fervor</b> consumed, additionally deals <span class="text-desc">1</span> instance of {{1}}% <b class="text-hsr-quantum">Quantum</b> <b class="elation">Elation DMG</b> to one random enemy.`,
      value: [
        { base: 30, growth: 3, style: 'curved' },
        { base: 7.5, growth: 0.75, style: 'curved' },
      ],
      level: elation,
      tag: AbilityTag.AOE,
      energy: 5,
      image: 'asset/traces/SkillIcon_1513_Elation02.webp',
    },
    ult: {
      trace: 'Ultimate',
      title: `Winning Hand, Over the Tempest`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Aventurine • Waveflair's ATK to all enemies, and gains <span class="text-desc">5</span> <b class="text-orange-400">Punchline</b> and <span class="text-desc">8</span> point(s) of <b class="text-green-300">Fervor</b>. Increases this unit's SPD by {{1}}% for <span class="text-desc">3</span> turn(s).`,
      value: [
        { base: 240, growth: 16, style: 'curved' },
        { base: 10, growth: 1.5, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
      energy: 5,
      image: 'asset/traces/SkillIcon_1513_Ultra_on.webp',
    },
    talent: {
      trace: `Talent`,
      title: `Place Your Bets, Hear the Deep`,
      content: `The duration of Aventurine • Waveflair's <b class="text-blue">Certified Banger</b> increases by <span class="text-desc">1</span> turn. After a teammate uses an attack, Aventurine • Waveflair gains <span class="text-desc">1</span> point(s) of <b class="text-green-300">Fervor</b> and <span class="text-desc">1</span> <b class="text-orange-400">Punchline(s)</b>. The max limit for <b class="text-green-300">Fervor</b> is <span class="text-desc">30</span> points.
      <br />When <b class="text-green-300">Fervor</b> reaches <span class="text-desc">10</span> points, Aventurine • Waveflair uses <b>Cheers! To the Blazing Summer</b> <span class="text-desc">3</span> time, which takes a fixed <span class="text-desc">20</span> <b class="text-orange-400">Punchline(s)</b> into account. After this use, the Elation Skill used by this unit in the next Aha Instant is enhanced into <b>All in! To the Blazing Summer</b>.
      <br />While Aventurine • Waveflair has <b class="text-blue">Certified Banger</b>, his Skill additionally deals {{0}}% <b class="text-hsr-quantum">Quantum</b> <b class="elation">Elation DMG</b> to all enemies, and his Ultimate additionally deals {{1}}% <b class="text-hsr-quantum">Quantum</b> <b class="elation">Elation DMG</b> to all enemies.`,
      value: [
        { base: 20, growth: 2, style: 'curved' },
        { base: 36, growth: 3.6, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1513_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: 'Stirring Waves in Still Waters',
      content: `Moves forward rapidly for a set distance, attacking all enemies in contact and blocking all incoming attacks. After entering combat via attacking enemies, Aventurine • Waveflair deals <b class="text-hsr-quantum">Quantum DMG</b> equal to <span class="text-desc">100%</span> of his ATK to all enemies, and gains <span class="text-desc">2</span> point(s) of <b class="text-green-300">Fervor</b> and <span class="text-desc">20</span> points of <b class="text-blue">Certified Banger</b>.`,
      tag: AbilityTag.IMPAIR,
      image: 'asset/traces/SkillIcon_1513_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Party of Euphoria',
      content: `When SPD is <span class="text-desc">160</span> or higher, increases this unit's Elation by <span class="text-desc">30%</span>. For every <span class="text-desc">1</span> SPD exceeded, increases this unit's Elation by <span class="text-desc">1%</span>. Up to a max of <span class="text-desc">200</span> excess SPD can be taken into account for this effect.`,
      image: 'asset/traces/SkillIcon_1513_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Revel in Surging Waves',
      content: `At the start of the battle, if there are other Elation characters in the team besides Aventurine • Waveflair, Aventurine • Waveflair's Elation increases by <span class="text-desc">100%</span>.
      <br />At the start of the battle, if Aventurine • Waveflair is the only Elation character in the team, after a teammate uses an attack, Aventurine • Waveflair gains <span class="text-desc">2</span> point(s) of <b class="text-blue">Certified Banger</b> and <span class="text-desc">1</span> <b class="text-orange-400">Punchline(s)</b>, and increases <b class="text-aha">Aha</b>'s SPD by <span class="text-desc">25</span>. The SPD Boost effect lasts until the end of <b class="text-aha">Aha Instant</b>.`,
      image: 'asset/traces/SkillIcon_1513_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Old Dream's Gold Rush`,
      content: `Increases CRIT DMG by <span class="text-desc">48%</span>. After a teammate uses a Basic ATK, Skill, <u>Follow-Up ATK</u>, or Ultimate, Aventurine • Waveflair's CRIT DMG increases by <span class="text-desc">48%</span>, lasting for <span class="text-desc">3</span> turn(s), and he additionally gains <span class="text-desc">1</span> point(s) of <b class="text-green-300">Fervor</b>. This effect can be triggered up to <span class="text-desc">6</span> time(s), and the trigger count resets when Aventurine • Waveflair uses his Skill.`,
      image: 'asset/traces/SkillIcon_1513_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Vacation At Stake',
      content: `Increases <b>All-Type RES PEN</b> by <span class="text-desc">24%</span>. Every time Aventurine • Waveflair gains <span class="text-desc">10</span> points of <b class="text-green-300">Fervor</b>, he can trigger his Talent to use <b>Cheers! To the Blazing Summer</b>.`,
      image: 'asset/traces/SkillIcon_1513_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'Tidal Fluctuations of Leisure',
      content: `Increases the max limit of <b class="text-green-300">Fervor</b> to <span class="text-desc">50</span> points, and additionally grants <span class="text-desc">2</span> point(s) of <b class="text-green-300">Fervor</b> after using Skill, Ultimate, or Elation Skill.`,
      image: 'asset/traces/SkillIcon_1513_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Chilled Afternoon Rendezvous',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1513_BP.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'No Deals with the Sun',
      content: `DMG dealt by Aventurine • Waveflair ignores <span class="text-desc">18%</span> of the enemy target's DEF.`,
      image: 'asset/traces/SkillIcon_1513_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Dive into the Jackpot Gale',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1513_Ultra.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Cashing the Past for a Wild Ride',
      content: `<b class="elation">Elation DMG</b> dealt by Aventurine • Waveflair merrymakes by <span class="text-desc">25%</span>. After Aventurine • Waveflair uses his Ultimate <span class="text-desc">2</span> time(s), all subsequent Elation Skills used become <b>All in! To the Blazing Summer</b>, and when using the Elation Skill <b>All in! To the Blazing Summer</b> to additionally deal DMG outside of <b class="text-aha">Aha Instant</b>, it no longer consumes <b class="text-green-300">Fervor</b>.`,
      image: 'asset/traces/SkillIcon_1513_Rank6.webp',
    },
  }

  const content: IContent[] = [
    Banger,
    {
      type: 'toggle',
      id: 'aven_sp_elation',
      text: `Enhanced Elation Skill`,
      ...talents.talent,
      show: true,
      default: true,
      sync: true,
      unique: true,
    },
    {
      type: 'toggle',
      id: 'aven_sp_skill',
      text: `Skill SPD Bonus`,
      ...talents.skill,
      show: true,
      default: true,
    },
    {
      type: 'number',
      id: 'fervor',
      text: `Fervor`,
      ...talents.talent,
      show: true,
      default: 10,
      min: 0,
      max: c >= 2 ? 50 : 30,
    },
    {
      type: 'toggle',
      id: 'aven_sp_a6',
      text: `A6 CRIT DMG Bonus`,
      ...talents.a6,
      show: a.a6,
      default: true,
      duration: 3,
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
      broken: boolean,
      globalMod: GlobalModifiers,
    ) => {
      const base = _.cloneDeep(x)

      if (form.aven_sp_elation) {
        base.MEMO_SKILL_ALT = true
      }

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.2, 0.12, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(2.4, 0.16, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
      ]
      if (form.banger) {
        base.SKILL_SCALING.push({
          name: 'Certified Banger DMG',
          value: [{ scaling: calcScaling(0.2, 0.02, talent, 'curved'), multiplier: Stats.ELATION }],
          element: Element.QUANTUM,
          property: TalentProperty.ELATION,
          type: TalentType.SKILL,
          sum: true,
          punchline: form.banger,
        })
        base.ULT_SCALING.push({
          name: 'Certified Banger DMG',
          value: [{ scaling: calcScaling(0.36, 0.036, talent, 'curved'), multiplier: Stats.ELATION }],
          element: Element.QUANTUM,
          property: TalentProperty.ELATION,
          type: TalentType.ULT,
          sum: true,
          punchline: form.banger,
        })
      }
      const hits = 10 + (form.aven_sp_elation ? form.fervor || 0 : 0)
      base.MEMO_SKILL_SCALING = [
        {
          name: 'Max Single Target DMG',
          value: [
            { scaling: calcScaling(0.3, 0.03, elation, 'curved'), multiplier: Stats.ELATION },
            { scaling: calcScaling(0.075, 0.0075, elation, 'curved'), hits, multiplier: Stats.ELATION },
          ],
          element: Element.QUANTUM,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: (form.aven_sp_elation ? 20 : 10) + hits * (form.aven_sp_elation ? 5 : 10 / 3),
          sum: true,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.3, 0.03, elation, 'curved'), multiplier: Stats.ELATION }],
          element: Element.QUANTUM,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: form.aven_sp_elation ? 20 : 10,
        },
        {
          name: 'DMG per Bounce',
          value: [{ scaling: calcScaling(0.075, 0.0075, elation, 'curved'), multiplier: Stats.ELATION }],
          element: Element.QUANTUM,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: form.aven_sp_elation ? 5 : 10 / 3,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 1, multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          sum: true,
        },
      ]

      if (form.aven_sp_skill) {
        base[Stats.P_SPD].push({
          name: `Eidolon 4`,
          source: 'Self',
          value: calcScaling(0.1, 0.015, skill, 'curved'),
        })
      }

      if (a.a4 && elationCount === 1) {
        base[Stats.ELATION].push({
          name: `Ascension 4 Passive`,
          source: 'Self',
          value: 1,
        })
      }

      if (a.a6) {
        base[Stats.CRIT_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: form.aven_sp_a6 ? 0.96 : 0.48,
        })
      }
      if (c >= 1) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.24,
        })
      }
      if (c >= 4) {
        base.DEF_PEN.push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.18,
        })
      }
      if (c >= 6) {
        base.ELATION_MERRYMAKE.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.25,
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
      broken: boolean,
      globalMod: GlobalModifiers,
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
      broken: boolean,
      globalCallback: CallbackType[],
      globalMod: GlobalModifiers,
    ) => {
      globalCallback.push(function P999(_x, _d, _w, all) {
        const spd = all[index].getSpd()
        if (spd >= 160 && a.a2) {
          all[index][Stats.ELATION].push({
            name: `Ascension 2 Passive`,
            source: 'Self',
            value: 0.3 + _.min([spd - 160, 200]) * 0.01,
            base: _.floor(_.min([spd - 160, 200]), 1).toLocaleString(),
            multiplier: 0.01,
            flat: `30%`,
          })
        }

        return all
      })

      return base
    },
  }
}

export default AventurineSP
