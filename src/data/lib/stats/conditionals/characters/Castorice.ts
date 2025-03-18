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

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Castorice = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
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

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: `Lament, Deadsea's Ripple`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Castorice's Max HP to one designated enemy.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      trace: 'Skill',
      title: `Silence, Wraithfly's Caress`,
      content: `Consumes <span class="text-desc">30%</span> of all allies' current HP. Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Castorice's Max HP to one designated enemy and <b class="text-hsr-quantum">Quantum DMG</b> equal to {{1}}% of Castorice's Max HP to adjacent targets.
      <br />If current HP is insufficient, this ability will reduce HP to <span class="text-desc">1</span>.
      <br />If <b>Netherwing</b> is on the battlefield, this Skill becomes <b>Boneclaw, Doomdrake's Embrace</b> instead.`,
      value: [
        { base: 25, growth: 2.5, style: 'curved' },
        { base: 15, growth: 1.5, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    skill_alt: {
      trace: 'Enhanced Skill',
      title: `Boneclaw, Doomdrake's Embrace`,
      content: `Consumes <span class="text-desc">40%</span> of all allies' (except <b>Netherwing</b>) current HP. Castorice and <b>Netherwing</b> launch a <u>Joint ATK</u> on the target and deal <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% and {{1}}% of Castorice's Max HP to all enemies.
      <br />If current HP is insufficient, this ability will reduce HP to <span class="text-desc">1</span>.`,
      value: [
        { base: 12, growth: 1.2, style: 'curved' },
        { base: 21, growth: 2.1, style: 'curved' },
      ],
      level: basic,
      tag: AbilityTag.AOE,
    },
    summon_skill: {
      trace: 'Memosprite Skill',
      title: 'Claw Splits the Veil / Breath Scorches the Shadow',
      content: `<b>Claw Splits the Veil</b>
      <br />Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Castorice's Max HP to all enemies.
      <br />
      <br /><b>Breath Scorches the Shadow</b>
      <br />Activating <b>Breath Scorches the Shadow</b> will consume <span class="text-desc">25%</span> of <b>Netherwing</b>'s max HP to deal <b class="text-hsr-quantum">Quantum DMG</b> equal to {{1}}% of Castorice's Max HP to all enemies.
      <br />In one attack, <b>Breath Scorches the Shadow</b> can be activated repeatedly, with the DMG multiplier increasing respectively to {{2}}%/{{3}%, until {{3}}%. The DMG Multiplier Boost effect will not be reduced before <b>Netherwing</b> disappears.
      <br />Using this ability repeatedly will enhance it, lasting until the <b>Netherwing</b> disappears.
      <br />When HP is at <span class="text-desc">25%</span> or lower, activating the ability will reduce HP to <span class="text-desc">1</span>, and then trigger the ability effect equal to that of the Talent <b>Wings Sweep the Ruins</b>.`,
      value: [
        { base: 20, growth: 4, style: 'linear' },
        { base: 12, growth: 2.2, style: 'linear' },
        { base: 14, growth: 2.8, style: 'linear' },
        { base: 17, growth: 3.4, style: 'linear' },
      ],
      level: skill,
      tag: AbilityTag.AOE,
    },
    ult: {
      trace: 'Ultimate',
      title: `Doomshriek, Dawn's Chime`,
      content: `Summons the memosprite <b>Netherwing</b> and <u>advances its action</u> by <span class="text-desc">100%</span>. At the same time, creates the Territory <b>Lost Netherland</b>, which decreases all enemies' <b>All-Type RES</b> by {{0}}%. If the DMG Boost effect from Castorice's Talent is active, the effect is extended to <b>Netherwing</b>. <b>Netherwing</b> has an initial SPD of <span class="text-desc">140</span> and a set Max HP equal to <span class="text-desc">100%</span> of max <b class="text-indigo-400">Newbud</b>.
      <br />After <b>Netherwing</b> acts <span class="text-desc">3</span> times or when its HP is <span class="text-desc">0</span>, it disappears and dispels the Territory <b>Lost Netherland</b>.`,
      value: [{ base: 10, growth: 1, style: 'curved' }],
      level: ult,
      tag: AbilityTag.SUMMON,
    },
    talent: {
      trace: 'Talent',
      title: `Desolation Across Palms`,
      content: `Max <b class="text-indigo-400">Newbud</b> is based on all characters' levels on the battlefield For each point of HP lost by all allies, Castorice gains <span class="text-desc">1</span> point of <b class="text-indigo-400">Newbud</b>. When <b class="text-indigo-400">Newbud</b> reaches its maximum, Castorice's Ultimate can be used. When allies lose HP, Castorice's and <b>Netherwing</b>'s DMG dealt increase by {{0}}%. This effect can stack up to <span class="text-desc">3</span> times, lasting for <span class="text-desc">3</span> turn(s).
      <br />When <b>Netherwing</b> is on the field, <b class="text-indigo-400">Newbud</b> cannot be gained, and HP lost by all allies (except <b>Netherwing</b>) will be converted to an equal amount of HP for <b>Netherwing</b>.`,
      value: [{ base: 10, growth: 1, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    unique_talent: {
      trace: 'Unique Talent',
      title: `Sanctuary of the Mooncocoon`,
      content: `After obtaining Castorice or when Castorice is in the current team, receive the following effect: In battle, when an ally character receives a killing blow, all ally characters that received a killing blow in this action enter the <b class="text-violet-400">Mooncocoon</b> state. Characters in <b class="text-violet-400">Mooncocoon</b> temporarily delay becoming downed and can take actions normally. After the action, if they receive healing or gain the Shield effect before their next turn, <b class="text-violet-400">Mooncocoon</b> is removed. Otherwise, they will be downed immediately. This effect can be triggered <span class="text-desc">1</span> time per battle.`,
      value: [],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    summon_talent: {
      trace: 'Memosprite Talent [1]',
      title: `Wings Sweep the Ruins`,
      content: `When the <b>Netherwing</b> disappears, deals <span class="text-desc">6</span> instance(s) of DMG, with every instance dealing <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Castorice's Max HP to one random enemy unit. At the same time, restores HP equal to <span class="text-desc">6%</span> of Castorice's Max HP plus <span class="text-desc">800</span> to all allies.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: talent,
      tag: AbilityTag.BOUNCE,
    },
    summon_talent_2: {
      trace: 'Memosprite Talent [2]',
      title: `Mooncocoon Shrouds the Form`,
      content: `When <b>Netherwing</b> is on the field, it acts as <u>backup</u> for allies. When allies take DMG, their current HP can be reduced to a minimum of <span class="text-desc">1</span>, after which <b>Netherwing</b> will bear the DMG received at <span class="text-desc">500%</span> of the original DMG until <b>Netherwing</b> disappears.`,
      value: [],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    summon_talent_3: {
      trace: 'Memosprite Talent [3]',
      title: `Roar Rumbles the Realm`,
      content: `When <b>Netherwing</b> is summoned, increases DMG dealt by all allies by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turn(s).`,
      value: [],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    technique: {
      trace: 'Technique',
      title: `Wail, Death's Herald`,
      content: `After using Technique, enters the <b>Netherveil</b> state that lasts for <span class="text-desc">20</span> seconds. While <b>Netherveil</b> is active, enemies are unable to approach Castorice on their own.
      <br />While in the <b>Netherveil</b> state, attacking will cause all enemies within range to enter combat. At the same time, summons the memosprite <b>Netherwing</b>. <b>Netherwing</b> starts with current HP equal to <span class="text-desc">50%</span> of max <b class="text-indigo-400">Newbud</b>. After entering battle, consumes <span class="text-desc">40%</span> of all allies' current HP and <u>advances</u> <b>Netherwing</b>'s <u>action</u> by <span class="text-desc">100%</span>.
      <br />After entering battle and before summoning <b>Netherwing</b>, Castorice gains <b class="text-indigo-400">Newbud</b> equal to <span class="text-desc">30%</span> of maximum <b class="text-indigo-400">Newbud</b>.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Contained Dark Tide`,
      content: `After ally targets (excluding <b>Netherwing</b>) receive healing, converts <span class="text-desc">100%</span> of healed value into <b class="text-indigo-400">Newbud</b>. If <b>Netherwing</b> is on the battlefield, the healing is instead converted into <b>Netherwing</b>'s HP. The converted value for each ally target cannot exceed <span class="text-desc">12%</span> of <b class="text-indigo-400">Newbud</b>'s maximum limit. The accumulated conversion value from all units resets after any unit takes action.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Inverted Torch`,
      content: `While Castorice's current HP is equal to <span class="text-desc">50%</span> of her Max HP or higher, increases her SPD by <span class="text-desc">40%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Where The West Wind Dwells`,
      content: `The lower the enemy's current HP, the higher the DMG dealt to it by <b>Netherwing</b>. When the enemy's HP is <span class="text-desc">30%</span> or lower, the DMG Boost effect reaches its maximum, up to <span class="text-desc">40%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Snowbound Maiden, Memory to Tomb`,
      content: `Each time the <b>Netherwing</b> uses <b>Breath Scorches the Shadow</b>, increases its DMG dealt by <span class="text-desc">20%</span>. This effect stacks up to <span class="text-desc">6</span> and lasts until the end of this turn.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Crown on Wings of Bloom`,
      content: `After summoning memosprite <b>Netherwing</b>, Castorice gains <span class="text-desc">2</span> stack(s) of <b class="text-desc">Ardent Will</b>. A maximum of <span class="text-desc">2</span> stacks of <b class="text-desc">Ardent Will</b> can be possessed at any given time, and can be used to offset Netherwing's HP consumption when using Memosprite Skill <b>Breath Scorches the Shadow</b> while <u>advancing</u> Castorice's <u>action</u> by <span class="text-desc">100%</span>. In the next usage of Enhanced Skill, Castorice recovers <span class="text-desc">20%</span> of maximum <b class="text-indigo-400">Newbud</b> points.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Pious Pilgrim, Dance in Doom`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Memosprite Talent Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Rest in Songs of Gloom',
      content: `While Castorice is on the battlefield, all allies' Incoming Healing increases by <span class="text-desc">20%</span> when having their HP restored.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Pristine Pages, Prophecy as Plume`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Memosprite Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Await for Years to Loom',
      content: `When Castorice or <b>Netherwing</b> deals DMG, increases <b class="text-hsr-quantum">Quantum RES PEN</b> by <span class="text-desc">20%</span>, and additionally increases the Bounce count for <b>Netherwing</b>'s Talent <b>Wings Sweep the Ruins</b> by <span class="text-desc">3</span> time(s).`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'dead_dragon',
      text: `Enhanced Skill`,
      ...talents.ult,
      show: true,
      default: true,
      sync: true,
      unique: true,
    },
    {
      type: 'toggle',
      id: 'lost_netherland',
      text: `Lost Netherland`,
      ...talents.ult,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'dim_breath',
      text: `Breath Scorches the Shadow`,
      ...talents.summon_skill_2,
      show: true,
      default: true,
      sync: true,
      unique: true,
    },
    {
      type: 'number',
      id: 'castorice_talent',
      text: `Talent DMG Bonus Stacks`,
      ...talents.talent,
      show: true,
      default: 0,
      min: 0,
      max: 3,
    },
    {
      type: 'toggle',
      id: 'castorice_memo_talent',
      text: `On-Summon DMG Bonus`,
      ...talents.summon_talent_3,
      show: true,
      default: false,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'castorice_a2',
      text: `A2 SPD Bonus`,
      ...talents.a2,
      show: a.a2,
      default: true,
    },
    {
      type: 'number',
      id: 'castorice_c1',
      text: `C1 DMG Bonus Stacks`,
      ...talents.c1,
      show: c >= 1,
      default: 1,
      min: 0,
      max: 6,
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
      base.SUMMON_STATS = _.cloneDeep({
        ...x,
        BASE_ATK: x.BASE_ATK,
        BASE_DEF: x.BASE_DEF,
        BASE_SPD: 140,
        ELEMENT: Element.NONE,
        BASE_HP: 32000,
        SUMMON_ID: '1407',
        NAME: 'Netherwing: Pollux',
        MAX_ENERGY: 0,
        [Stats.HP]: [],
        [Stats.P_HP]: [],
      })

      if (form.dead_dragon) base.SKILL_ALT = true
      base.COUNTDOWN = 100

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.25, 0.05, basic, 'linear'), multiplier: Stats.HP }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = form.dead_dragon
        ? [
            {
              name: 'AoE - Castorice',
              value: [{ scaling: calcScaling(0.12, 0.012, skill, 'curved'), multiplier: Stats.HP }],
              element: Element.QUANTUM,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
              sum: true,
            },
            {
              name: 'AoE - Netherwing',
              value: [{ scaling: calcScaling(0.21, 0.021, skill, 'curved'), multiplier: Stats.HP }],
              element: Element.QUANTUM,
              property: TalentProperty.SERVANT,
              type: TalentType.SERVANT,
              sum: true,
              summon: true,
              useOwnerStats: true,
              bonus: form.castorice_c2 ? 1 : 0,
            },
          ]
        : [
            {
              name: 'Main Target',
              value: [{ scaling: calcScaling(0.25, 0.025, skill, 'curved'), multiplier: Stats.HP }],
              element: Element.QUANTUM,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
              sum: true,
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.15, 0.015, skill, 'curved'), multiplier: Stats.HP }],
              element: Element.QUANTUM,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 10,
            },
          ]
      const lastDragonHit =
        c >= 1
          ? _.map([3, 4, 5, 6], (i) => ({
              name: `Breath Stage 3 DMG (${i} Stacks)`,
              value: [{ scaling: calcScaling(0.17, 0.034, memo_skill, 'linear'), multiplier: Stats.HP }],
              element: Element.QUANTUM,
              property: TalentProperty.SERVANT,
              type: TalentType.SERVANT,
              break: 10,
              sum: i === 6,
              useOwnerStats: true,
              bonus: c >= 1 ? 0.2 * i : 0,
            }))
          : [
              {
                name: 'Breath Stage 3 DMG',
                value: [{ scaling: calcScaling(0.17, 0.034, memo_skill, 'linear'), multiplier: Stats.HP }],
                element: Element.QUANTUM,
                property: TalentProperty.SERVANT,
                type: TalentType.SERVANT,
                break: 10,
                sum: true,
                useOwnerStats: true,
                bonus: c >= 1 ? 0.9 : 0,
              },
            ]
      base.MEMO_SKILL_SCALING = [
        {
          name: 'Claws DMG',
          value: [{ scaling: calcScaling(0.1, 0.04, memo_skill, 'linear'), multiplier: Stats.HP }],
          element: Element.QUANTUM,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 10,
          sum: false,
          useOwnerStats: true,
          bonus: form.castorice_c1 ? 0.2 * form.castorice_c1 : 0,
        },
        {
          name: 'Breath Stage 1 DMG',
          value: [{ scaling: calcScaling(0.12, 0.022, memo_skill, 'linear'), multiplier: Stats.HP }],
          element: Element.QUANTUM,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 10,
          sum: false,
          useOwnerStats: true,
          bonus: c >= 1 ? 0.3 : 0,
        },
        {
          name: 'Breath Stage 2 DMG',
          value: [{ scaling: calcScaling(0.14, 0.028, memo_skill, 'linear'), multiplier: Stats.HP }],
          element: Element.QUANTUM,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 10,
          sum: false,
          useOwnerStats: true,
          bonus: c >= 1 ? 0.6 : 0,
        },
        ...lastDragonHit,
      ]
      base.MEMO_TALENT_SCALING = [
        {
          name: 'Total Single Target DMG',
          value: [{ scaling: calcScaling(0.25, 0.05, memo_talent, 'linear'), multiplier: Stats.HP }],
          multiplier: c >= 6 ? 9 : 6,
          element: Element.QUANTUM,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 24,
          sum: true,
          useOwnerStats: true,
          bonus: form.castorice_c1 ? 0.2 * form.castorice_c1 : 0,
        },
        {
          name: 'Bounce DMG',
          value: [{ scaling: calcScaling(0.25, 0.05, memo_talent, 'linear'), multiplier: Stats.HP }],
          element: Element.QUANTUM,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 4,
          sum: true,
          useOwnerStats: true,
          bonus: form.castorice_c1 ? 0.2 * form.castorice_c1 : 0,
        },
        {
          name: 'Healing',
          value: [{ scaling: calcScaling(0.03, 0.006, memo_talent, 'linear'), multiplier: Stats.HP }],
          flat: calcScaling(400, 80, memo_talent, 'linear'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]
      base.ULT_SCALING = []
      base.TALENT_SCALING = []
      base.TECHNIQUE_SCALING = []

      if (form.castorice_talent) {
        base[Stats.ALL_DMG].push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.1, 0.01, talent, 'curved') * form.castorice_talent,
        })
        base.SUMMON_STATS[Stats.ALL_DMG].push({
          name: `Talent`,
          source: 'Castorice',
          value: calcScaling(0.1, 0.01, talent, 'curved') * form.castorice_talent,
        })
      }
      if (form.castorice_memo_talent) {
        base[Stats.ALL_DMG].push({
          name: `Memosprite Talent`,
          source: 'Pollux',
          value: 0.1,
        })
        base.SUMMON_STATS[Stats.ALL_DMG].push({
          name: `Memosprite Talent`,
          source: 'Self',
          value: 0.1,
        })
      }
      if (form.castorice_a2) {
        base[Stats.P_SPD].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.4,
        })
      }
      if (c >= 4) {
        base.I_HEAL.push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.2,
        })
        base.SUMMON_STATS.I_HEAL.push({
          name: `Eidolon 4`,
          source: 'Castorice',
          value: 0.2,
        })
      }
      if (c >= 6) {
        base.QUANTUM_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.2,
        })
        base.SUMMON_STATS.QUANTUM_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Castorice',
          value: 0.2,
        })
      }
      if (form.lost_netherland) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Lost Netherland`,
          source: 'Self',
          value: calcScaling(0.1, 0.01, talent, 'curved'),
        })
        base.SUMMON_STATS.ALL_TYPE_RES_PEN.push({
          name: `Lost Netherland`,
          source: 'Castorice',
          value: calcScaling(0.1, 0.01, talent, 'curved'),
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
      if (form.lost_netherland) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Lost Netherland`,
          source: 'Castorice',
          value: calcScaling(0.1, 0.01, talent, 'curved'),
        })
      }
      if (form.castorice_memo_talent) {
        base[Stats.ALL_DMG].push({
          name: `Memosprite Talent`,
          source: 'Pollux',
          value: 0.1,
        })
      }
      if (c >= 4) {
        base.I_HEAL.push({
          name: `Eidolon 4`,
          source: 'Castorice',
          value: 0.2,
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
      if (form.supreme_stance && a.a2)
        base.CALLBACK.push(function (x) {
          const summonSpd = x.SUMMON_STATS.getSpd()
          x.X_ATK.push({
            name: `Ascension 2 Passive`,
            source: 'Self',
            value: 7.2 * x.getSpd() + summonSpd * 3.6,
            base: x.getSpd(),
            multiplier: 7.2,
            flat: `(${_.floor(summonSpd, 1).toLocaleString()} \u{00d7} ${toPercentage(3.6)})`,
          })
          x.SUMMON_STATS.X_ATK.push({
            name: `Ascension 2 Passive`,
            source: 'Aglaea',
            value: 7.2 * x.getSpd() + summonSpd * 3.6,
            base: x.getSpd(),
            multiplier: 7.2,
            flat: `(${_.floor(summonSpd, 1).toLocaleString()} \u{00d7} ${toPercentage(3.6)})`,
          })
          return x
        })
      if (form.supreme_stance && c >= 6)
        base.CALLBACK.push(function (x) {
          const spd = _.max([x.getSpd(), x.SUMMON_STATS.getSpd()])
          const bonus = spd > 320 ? 0.6 : spd > 240 ? 0.3 : spd > 160 ? 0.1 : 0
          x.BASIC_SCALING = _.map(x.BASIC_SCALING, (item) => ({ ...item, bonus }))
          return x
        })

      return base
    },
  }
}

export default Castorice
