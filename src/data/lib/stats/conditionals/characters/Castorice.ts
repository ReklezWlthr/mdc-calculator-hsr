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
    memo_skill: 0,
    memo_talent: 0,
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
      title: `Lament Is the Dead Sea's Ripple`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Castorice's Max HP to one designated enemy.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      trace: 'Skill',
      title: `Silence Is the Butterfly's Caress`,
      content: `Consumes <span class="text-desc">40%</span> of all allies' current HP. Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Castorice's Max HP to one designated enemy and <b class="text-hsr-quantum">Quantum DMG</b> equal to {{1}}% of Castorice's Max HP to adjacent targets.
      <br />If current HP is insufficient, this ability will reduce HP to <span class="text-desc">1</span>.
      <br />If <b>Dead Dragon</b> is on the battlefield, this Skill becomes <b>Skeleclaw, the Doomdrake's Embrace</b> instead.`,
      value: [
        { base: 25, growth: 2.5, style: 'curved' },
        { base: 15, growth: 1.5, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    skill_alt: {
      trace: 'Enhanced Skill',
      title: `Skeleclaw, the Doomdrake's Embrace`,
      content: `Consumes <span class="text-desc">50%</span> of all allies' (except <b>Dead Dragon</b>) current HP. Castorice and <b>Dead Dragon</b> launch a <u>Joint ATK</u> on the target and deal <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% and {{1}}% of Castorice's Max HP.
      <br />If current HP is insufficient, this ability will reduce HP to <span class="text-desc">1</span>.`,
      value: [
        { base: 12, growth: 1.2, style: 'linear' },
        { base: 21, growth: 2.1, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.AOE,
    },
    summon_skill: {
      trace: 'Memosprite Skill',
      title: 'Rend The Realm Beneath / Dimscorch Breath',
      content: `<b>Rend The Realm Beneath</b>
      <br />Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Castorice's Max HP to all enemies.
      <br />
      <br /><b>Dimscorch Breath</b>
      <br />Consumes HP equal to <span class="text-desc">25%</span> of <b>Dead Dragon</b>'s max HP and deals <b class="text-hsr-quantum">Quantum DMG</b> to all enemies equal to {{0}}%/{{1}}%/{{2}}% of Castorice's Max HP. When HP is insufficient, it will drop to a limit of <span class="text-desc">1</span> and using this ability will not end the turn.
      <br />Using this ability repeatedly will enhance it, lasting until the <b>Dead Dragon</b> disappears.
      <br />When HP is less than or equal to <span class="text-desc">25%</span>, using this ability will actively trigger the Talent ability effect of <b>Ebon Wings Over Scorched Ruins</b>.`,
      value: [
        { base: 15, growth: 3, style: 'linear' },
        { base: 17, growth: 3.4, style: 'linear' },
        { base: 19, growth: 3.8, style: 'linear' },
      ],
      level: skill,
      tag: AbilityTag.AOE,
    },
    ult: {
      trace: 'Ultimate',
      title: `Death's Roar Becomes Renascence's Bell`,
      content: `Summons the memosprite <b>Dead Dragon</b> and <u>advances its action</u> by <span class="text-desc">100%</span>. At the same time, creates the Territory <b>Lost Netherland</b>, which decreases all enemies' <b>All-Type RES</b> by {{0}}%. If the DMG Boost effect from Castorice's Talent is active, the effect is extended to <b>Dead Dragon</b>. <b>Dead Dragon</b> has <span class="text-desc">140</span> SPD and a set Max HP equal to <span class="text-desc">100%</span> of max <b class="text-indigo-400">Stamen Nova</b>.
      <br />After <b>Dead Dragon</b> acts <span class="text-desc">3</span> times or when its HP is <span class="text-desc">0</span>, it disappears and dispels the Territory <b>Lost Netherland</b>.`,
      value: [{ base: 10, growth: 1, style: 'curved' }],
      level: ult,
      tag: AbilityTag.SUMMON,
    },
    talent: {
      trace: 'Talent',
      title: `Desolation That Traverses Her Palms`,
      content: `<b class="text-indigo-400">Stamen Nova</b>'s maximum is equal to <span class="text-desc">100</span> times the sum of all characters' levels on the battlefield. For each point of HP lost by all allies, Castorice gains <span class="text-desc">1</span> point of <b class="text-indigo-400">Stamen Nova</b>. Increases Castorice's and <b>Dead Dragon</b>'s DMG dealt by {{0}}%. This effect can stack up to <span class="text-desc">3</span> times, lasting for <span class="text-desc">3</span> turn(s). When <b class="text-indigo-400">Stamen Nova</b> reaches its maximum, Castorice's Ultimate can be used.
      <br />When <b>Dead Dragon</b> is on the field, <b class="text-indigo-400">Stamen Nova</b> cannot be gained, and for each point of HP lost by all allies (except <b>Dead Dragon</b>), <b>Dead Dragon</b> recovers equal amount of HP.`,
      value: [{ base: 10, growth: 1, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    summon_talent: {
      trace: 'Memosprite Talent [1]',
      title: `Ebon Wings Over Scorched Ruins`,
      content: `When the <b>Dead Dragon</b> disappears, deals <span class="text-desc">6</span> instance(s) of DMG, with every instance dealing <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Castorice's Max HP to one random enemy unit.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: talent,
      tag: AbilityTag.BOUNCE,
    },
    summon_talent_2: {
      trace: 'Memosprite Talent [2]',
      title: `Moon-Shelled Vessel`,
      content: `When <b>Dead Dragon</b> is on the field, it acts as <u>backup</u> for allies. When allies take DMG, their current HP can be reduced to a minimum of <span class="text-desc">1</span>, after which <b>Dead Dragon</b> will bear the DMG received at <span class="text-desc">500%</span> of the original DMG until <b>Dead Dragon</b> disappears.`,
      value: [],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    summon_talent_3: {
      trace: 'Memosprite Talent [3]',
      title: `Desolation Broken By Bellows`,
      content: `When <b>Dead Dragon</b> is summoned, decreases DMG dealt by all allies by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turn(s).`,
      value: [],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    technique: {
      trace: 'Technique',
      title: 'Wail, the Prelude to Demise',
      content: `After using Technique, enters the <b>Death Addle</b> state that lasts for <span class="text-desc">20</span> seconds. While <b>Death Addle</b> is active, enemies are unable to approach Castorice on their own.
      <br />While in the <b>Death Addle</b> state, attacking will cause all enemies within range to enter combat. At the same time, summons the memosprite <b>Dead Dragon</b>. <b>Dead Dragon</b> starts with current HP equal to <span class="text-desc">50%</span> of max <b class="text-indigo-400">Stamen Nova</b>. After entering battle, consumes <span class="text-desc">40%</span> of all allies' current HP and <u>advances</u> <b>Dead Dragon</b>'s <u>action</u> by <span class="text-desc">100%</span>.
      <br />After entering battle and before summoning <b>Dead Dragon</b>, Castorice gains <b class="text-indigo-400">Stamen Nova</b> equal to <span class="text-desc">30%</span> of maximum <b class="text-indigo-400">Stamen Nova</b>.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Dark Tide Contained`,
      content: `While Castorice or <b>Dead Dragon</b>'s respective HP is at <span class="text-desc">50%</span> or higher, increases their respective SPD by <span class="text-desc">40%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Inverted Torch`,
      content: `While <b>Dead Dragon</b> is not on the field, <span class="text-desc">100%</span> of excess healing for each ally target will restore an equal amount of <b class="text-indigo-400">Stamen Nova</b>. While <b>Dead Dragon</b> is on the field, the excess healing will restore an equal amount of HP for <b>Dead Dragon</b>. Each restoration cannot exceed <span class="text-desc">15%</span> of max <b class="text-indigo-400">Stamen Nova</b>/<b>Dead Dragon</b>'s Max HP.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Where The West Wind Dwells`,
      content: `When <b>Dead Dragon</b> disappears, restores HP for all allies equal to <span class="text-desc">10%</span> of Castorice's Max HP plus <span class="text-desc">250</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Snowland's Holy Maiden Entombs With Memories`,
      content: `Each time the <b>Dead Dragon</b> uses <b>Dimscorch Breath</b>, increases its DMG dealt by <span class="text-desc">30%</span>. This effect stacks up to <span class="text-desc">6</span> and lasts until the end of this turn.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `And Crowns with Flowers Aflutter`,
      content: `After summoning memosprite <b>Dead Dragon</b>, Castorice gains <span class="text-desc">2</span> stack(s) of <b class="text-desc">Ardent Will</b>. A maximum of <span class="text-desc">2</span> stacks of <b class="text-desc">Ardent Will</b> can be possessed at any given time, and can be used to offset the memosprite Dead Dragon's HP consumption while <u>advancing</u> Castorice's <u>action</u> by <span class="text-desc">100%</span>. The next Enhanced Skill deals <span class="text-desc">100%</span> more DMG.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Devote Pilgrim Dances in the Deathrealm`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'And Sleeps in Elegies Embetter',
      content: `While Castorice is on the battlefield, all allies' Incoming Healing increases by <span class="text-desc">20%</span> when having their HP restored.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Pristine Chapter Prettifies with Prophecies`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'And Waits for Time to Un-Coccon, Unfetters',
      content: `When Castorice and <b>Dead Dragon</b> deals DMG, increases <b class="text-hsr-quantum">Quantum RES PEN</b> by <span class="text-desc">20%</span>, and <b>Dead Dragon</b> will not disappear on its own after taking an action.`,
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
      text: `Dimscorch Breath`,
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
      text: `Team DMG Decrease`,
      ...talents.summon_talent_3,
      show: true,
      default: false,
      debuff: true,
      duration: 2,
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
      id: 'castorice_c2',
      text: `E2 Enhanced Skill DMG Bonus`,
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
        BASE_HP: _.sumBy(team, (t) => t.level) * 100,
        SUMMON_ID: '1407',
        NAME: 'Dead Dragon: Pollux',
        MAX_ENERGY: 0,
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
              bonus: form.castorice_c2 ? 1 : 0,
            },
            {
              name: 'AoE - Dead Dragon',
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
              name: `Enhanced 2 DMG (${i} Stacks)`,
              value: [{ scaling: calcScaling(0.19, 0.038, memo_skill, 'linear'), multiplier: Stats.HP }],
              element: Element.QUANTUM,
              property: TalentProperty.SERVANT,
              type: TalentType.SERVANT,
              break: 10,
              sum: i === 6,
              useOwnerStats: true,
              bonus: c >= 1 ? 0.3 * i : 0,
            }))
          : [
              {
                name: 'Enhanced 2 DMG',
                value: [{ scaling: calcScaling(0.19, 0.038, memo_skill, 'linear'), multiplier: Stats.HP }],
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
          name: 'Base AoE DMG',
          value: [{ scaling: calcScaling(0.15, 0.03, memo_skill, 'linear'), multiplier: Stats.HP }],
          element: Element.QUANTUM,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 10,
          sum: false,
          useOwnerStats: true,
          bonus: c >= 1 ? 0.3 : 0,
        },
        {
          name: 'Enhanced 1 DMG',
          value: [{ scaling: calcScaling(0.17, 0.034, memo_skill, 'linear'), multiplier: Stats.HP }],
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
          multiplier: 6,
          element: Element.QUANTUM,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 24,
          sum: true,
          useOwnerStats: true,
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
          value: -0.1,
        })
        base.SUMMON_STATS[Stats.ALL_DMG].push({
          name: `Memosprite Talent`,
          source: 'Self',
          value: -0.1,
        })
      }
      if (form.castorice_a2) {
        base[Stats.P_SPD].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.4,
        })
        base.SUMMON_STATS[Stats.P_SPD].push({
          name: `Ascension 2 Passive`,
          source: 'Castorice',
          value: 0.4,
        })
      }
      if (a.a6) {
        base.TALENT_SCALING.push({
          name: 'A6 Healing',
          value: [{ scaling: 0.1, multiplier: Stats.HP }],
          flat: 250,
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
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
          value: -0.1,
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
