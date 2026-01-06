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

const Hyacine = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
    memo_skill: c >= 3 ? 1 : 0,
    memo_talent: c >= 5 ? 1 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent
  const memo_skill = t.memo_skill + upgrade.memo_skill
  const memo_talent = t.memo_talent + upgrade.memo_talent

  const index = _.findIndex(team, (item) => item?.cId === '1409')

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: `When Breeze Kisses Cirrus`,
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Hyacine's Max HP to one designated enemy.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      trace: 'Skill',
      title: `Love Over the Rainbow`,
      content: `Summons memosprite <b>Little Ica</b>. Restores HP equal to {{0}}% of Hyacine's Max HP plus {{1}} for all allies (except <b>Little Ica</b>), and restores HP equal to {{2}}% of Hyacine's Max HP plus {{3}} for <b>Little Ica</b>.`,
      value: [
        { base: 4, growth: 0.5, style: 'heal' },
        { base: 40, growth: 24, style: 'flat' },
        { base: 5, growth: 0.625, style: 'heal' },
        { base: 50, growth: 30, style: 'flat' },
      ],
      level: skill,
      tag: AbilityTag.RESTORE,
      sp: -1,
    },
    summon_skill: {
      trace: 'Memosprite Skill',
      title: 'Rainclouds, Time to Go!',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> to all enemies by an amount equal to {{0}}% of the tally of healing done by Hyacine and <b>Little Ica</b> in the current battle, and clears <span class="text-desc">50%</span> of this tally of healing.`,
      value: [{ base: 10, growth: 2, style: 'linear' }],
      level: memo_skill,
      tag: AbilityTag.AOE,
      image: 'asset/traces/SkillIcon_11409_Servant.png',
    },
    ult: {
      trace: 'Ultimate',
      title: `We Who Fly Into Twilight`,
      content: `Summons memosprite <b>Little Ica</b>. Restores HP equal to {{0}}% of Hyacine's Max HP plus {{1}} for all allies (except <b>Little Ica</b>), and restores HP equal to {{2}}% of Hyacine's Max HP plus {{3}} for <b>Little Ica</b>. Hyacine enters the <b class="text-heal">After Rain</b> state, lasting for <span class="text-desc">3</span> turn(s). This duration decreases by <span class="text-desc">1</span> at the start of Hyacine's every turn. While <b class="text-heal">After Rain</b> is active, all ally targets increase their Max HP by {{4}}% plus {{5}}.`,
      value: [
        { base: 5, growth: 0.625, style: 'heal' },
        { base: 50, growth: 30, style: 'flat' },
        { base: 6, growth: 0.75, style: 'heal' },
        { base: 60, growth: 36, style: 'flat' },
        { base: 15, growth: 1.5, style: 'curved' },
        { base: 150, growth: 90, style: 'flat' },
      ],
      level: ult,
      tag: AbilityTag.ENHANCE,
    },
    summon_talent: {
      trace: 'Memosprite Talent',
      title: `Take Sky in Hand`,
      content: `<b>Little Ica</b>'s maintains <span class="text-desc">0</span> SPD, is immune to debuffs, and will not appear in the Action Order.
      <br />If the HP of an ally target (except <b>Little Ica</b>) is reduced, then at the start of any target's turn or after any target takes action, <b>Little Ica</b> will consume <span class="text-desc">4%</span> of their own Max HP and heal the ally target with reduced HP for an amount equal to {{0}}% of Hyacine's Max HP plus {{1}}.
      <br />While Hyacine is in the <b class="text-heal">After Rain</b> state, <b>Little Ica</b> gains <span class="text-desc">1</span> extra turn and automatically casts <b>Rainclouds, Time to Go!</b> immediately after Hyacine uses an ability. Moreover, when <b>Little Ica</b> triggers the Talent's healing effect, additionally restores HP for all ally targets by an amount equal to {{0}}% of Hyacine's Max HP plus {{1}}. After <b>Little Ica</b> uses an ability, the duration of all their Continuous Effects decreases by <span class="text-desc">1</span> turn.`,
      value: [
        { base: 1, growth: 0.2, style: 'linear' },
        { base: 10, growth: 2, style: 'linear' },
      ],
      level: memo_talent,
      tag: AbilityTag.RESTORE,
    },
    talent: {
      trace: 'Talent',
      title: `First Light Heals the World`,
      content: `The memosprite <b>Little Ica</b> initially has Max HP equal to <span class="text-desc">50%</span> of Hyacine's Max HP. When Hyacine or <b>Little Ica</b> provides healing, increases <b>Little Ica</b>'s DMG dealt by {{0}}% for <span class="text-desc">2</span> turn(s). Stacks up to <span class="text-desc">3</span> time(s).`,
      value: [{ base: 40, growth: 4, style: 'curved' }],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    technique: {
      trace: 'Technique',
      title: `Day So Right, Life So Fine!`,
      content: `When the next battle starts, restores HP by an amount equal to <span class="text-desc">30%</span> of Hyacine's Max HP plus <span class="text-desc">600</span> for all allies and increases Max HP by <span class="text-desc">20%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Gloomy Grin`,
      content: `Increases Hyacine's and <b>Little Ica</b>'s CRIT Rate by <span class="text-desc">100%</span>. When providing healing to an ally target whose current HP is equal to or less than <span class="text-desc">50%</span> of their Max HP, increases Hyacine's and <b>Little Ica</b>'s Outgoing Healing by <span class="text-desc">25%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Stormy Caress`,
      content: `Increases Hyacine's Effect RES by <span class="text-desc">50%</span>. When using Skill and Ultimate, dispels <span class="text-desc">1</span> debuff(s) from all ally targets.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Tempestuous Halt`,
      content: `When Hyacine's SPD exceeds <span class="text-desc">200</span>, increases her and <b>Little Ica</b>'s Max HP by <span class="text-desc">20%</span>. Then, for every <span class="text-desc">1</span> excess SPD, increases Hyacine's and <b>Little Ica</b>'s Outgoing Healing by <span class="text-desc">1%</span>. Up to a max of <span class="text-desc">200</span> excess SPD can be taken into account for this effect.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Cradle the Candle of Night`,
      content: `When Hyacine is in the <b class="text-heal">After Rain</b> state, all ally targets additionally increase their Max HP by <span class="text-desc">50%</span>, and after using an attack, immediately restore their HP by an amount equal to <span class="text-desc">8%</span> of Hyacine's Max HP.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Come Sit in My Courtyard`,
      content: `When an ally target's HP decreases, SPD increases by <span class="text-desc">30%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Depart, Unto the Sun!`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Memosprite Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Sunlit Amber, Yours to Keep',
      content: `The <b>Tempestuous Halt</b> Trace gets enhanced. For every <span class="text-desc">1</span> excess SPD, additionally increases Hyacine's and <b>Little Ica</b>'s CRIT DMG by <span class="text-desc">2%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Twilight Drapes the Tide`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Memosprite Talent Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'O Sky, Heed My Plea',
      content: `When <b>Little Ica</b> uses Memosprite Skill, the amount cleared from the tally of healing is changed to <span class="text-desc">12%</span>. When <b>Little Ica</b> is on the field, all ally targets' <b>All-Type RES PEN</b> increases by <span class="text-desc">20%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'hyacine_tech',
      text: `Technique HP Bonus`,
      ...talents.technique,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'clear_skies',
      text: `After Rain`,
      ...talents.ult,
      show: true,
      default: true,
    },
    {
      type: 'number',
      id: 'ica_tally',
      text: `Total Healing Tally`,
      ...talents.summon_skill,
      show: true,
      default: 3000,
      min: 0,
    },
    {
      type: 'number',
      id: 'ica_talent',
      text: `Little Ica's Talent DMG Bonus`,
      ...talents.talent,
      show: true,
      default: 3,
      min: 0,
      max: 3,
    },
    {
      type: 'toggle',
      id: 'hyacine_a2',
      text: `A2 Healing Bonus`,
      ...talents.a2,
      show: a.a2,
      default: false,
    },
    {
      type: 'toggle',
      id: 'hyacine_c2',
      text: `E2 SPD Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'hyacine_c6',
      text: `E6 All-Type RES PEN`,
      ...talents.c6,
      show: c >= 6,
      default: true,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'clear_skies'), findContentById(content, 'hyacine_c6')]

  const allyContent: IContent[] = [findContentById(content, 'hyacine_c2')]

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
        BASE_SPD: 0,
        ELEMENT: Element.NONE,
        BASE_HP: x.BASE_HP * 0.5,
        SUMMON_ID: '1409',
        NAME: 'Little Ica',
        MAX_ENERGY: 0,
        [Stats.HP]: _.map(x[Stats.HP], (item) => ({
          ...item,
          value: item.value * 0.5,
        })),
        [Stats.P_HP]: x[Stats.P_HP],
        [Stats.P_SPD]: [],
        [Stats.SPD]: [],
      })

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.25, 0.05, basic, 'linear'), multiplier: Stats.HP }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Ally Healing',
          value: [{ scaling: calcScaling(0.04, 0.005, skill, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(40, 24, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.SKILL,
          sum: true,
        },
        {
          name: 'Little Ica Healing',
          value: [{ scaling: calcScaling(0.05, 0.00625, skill, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(50, 30, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.SKILL,
        },
      ]

      base.MEMO_SKILL_SCALING = [
        {
          name: 'AoE',
          value: [],
          flat: form.ica_tally,
          multiplier: calcScaling(0.1, 0.02, memo_skill, 'linear'),
          element: Element.WIND,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 10,
          sum: true,
        },
      ]
      base.MEMO_TALENT_SCALING = [
        {
          name: 'Healing',
          value: [
            {
              scaling: calcScaling(0.01, 0.002, memo_talent, 'linear') * (form.clear_skies ? 2 : 1),
              multiplier: Stats.HP,
            },
          ],
          flat: calcScaling(10, 2, memo_talent, 'linear') * (form.clear_skies ? 2 : 1),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.SERVANT,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Ally Healing',
          value: [{ scaling: calcScaling(0.05, 0.00625, skill, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(50, 30, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.ULT,
          sum: true,
        },
        {
          name: 'Little Ica Healing',
          value: [{ scaling: calcScaling(0.06, 0.0075, skill, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(60, 36, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.ULT,
        },
      ]
      base.TALENT_SCALING = []
      base.TECHNIQUE_SCALING = [
        {
          name: 'Healing',
          value: [{ scaling: 0.3, multiplier: Stats.HP }],
          flat: 600,
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.TECH,
          sum: true,
        },
      ]

      if (form.hyacine_tech) {
        base[Stats.P_HP].push({
          name: `Technique`,
          source: 'Self',
          value: 0.2,
        })
        base.SUMMON_STATS[Stats.P_HP].push({
          name: `Technique`,
          source: 'Hyacine',
          value: 0.2,
        })
      }
      if (form.ica_talent) {
        base.SUMMON_STATS[Stats.ALL_DMG].push({
          name: `Talent`,
          source: 'Hyacine',
          value: calcScaling(0.4, 0.04, talent, 'curved') * form.ica_talent,
        })
      }
      if (a.a2) {
        base[Stats.CRIT_RATE].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 1,
        })
        base.SUMMON_STATS[Stats.CRIT_RATE].push({
          name: `Ascension 2 Passive`,
          source: 'Hyacine',
          value: 1,
        })
      }
      if (form.hyacine_a2) {
        base[Stats.HEAL].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.25,
        })
        base.SUMMON_STATS[Stats.HEAL].push({
          name: `Ascension 2 Passive`,
          source: 'Hyacine',
          value: 0.25,
        })
      }
      if (a.a4) {
        base[Stats.E_RES].push({
          name: `Ascension 4 Passive`,
          source: 'Self',
          value: 0.5,
        })
      }
      if (c >= 1) {
        base.TALENT_SCALING.push({
          name: 'E1 On-Attack Healing',
          value: [{ scaling: 0.08, multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        })
      }
      if (form.hyacine_c2) {
        base[Stats.P_SPD].push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.3,
        })
      }
      if (form.hyacine_c6) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.2,
        })
      }

      if (form.clear_skies) {
        base[Stats.P_HP].push({
          name: `After Rain`,
          source: 'Self',
          value: calcScaling(0.15, 0.015, ult, 'curved') + (c >= 1 ? 0.5 : 0),
        })
        base[Stats.HP].push({
          name: `After Rain`,
          source: 'Self',
          value: calcScaling(150, 90, ult, 'flat'),
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
      if (form.hyacine_tech) {
        base[Stats.P_HP].push({
          name: `Technique`,
          source: 'Hyacine',
          value: 0.2,
        })
      }
      if (aForm.hyacine_c2) {
        base[Stats.P_SPD].push({
          name: `Eidolon 2`,
          source: 'Hyacine',
          value: 0.3,
        })
      }
      if (form.hyacine_c6) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Hyacine',
          value: 0.2,
        })
      }
      if (form.clear_skies) {
        base[Stats.P_HP].push({
          name: `After Rain`,
          source: 'Hyacine',
          value: calcScaling(0.15, 0.015, ult, 'curved') + (c >= 1 ? 0.5 : 0),
        })
        base[Stats.HP].push({
          name: `After Rain`,
          source: 'Hyacine',
          value: calcScaling(150, 90, ult, 'flat'),
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
      const spd = base.getSpd()

      if (a.a6 && spd >= 200) {
        base[Stats.P_HP].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.2,
        })
        base.SUMMON_STATS[Stats.P_HP].push({
          name: `Ascension 6 Passive`,
          source: 'Hyacine',
          value: 0.2,
        })
        base[Stats.HEAL].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: _.min([spd - 200, 200]) / 100,
        })
        base.SUMMON_STATS[Stats.HEAL].push({
          name: `Ascension 6 Passive`,
          source: 'Hyacine',
          value: _.min([spd - 200, 200]) / 100,
        })
        if (c >= 4) {
          base[Stats.CRIT_DMG].push({
            name: `Eidolon 4`,
            source: 'Self',
            value: _.min([spd - 200, 200]) / 50,
          })
          base.SUMMON_STATS[Stats.CRIT_DMG].push({
            name: `Eidolon 4`,
            source: 'Hyacine',
            value: _.min([spd - 200, 200]) / 50,
          })
        }
      }

      return base
    },
  }
}

export default Hyacine
