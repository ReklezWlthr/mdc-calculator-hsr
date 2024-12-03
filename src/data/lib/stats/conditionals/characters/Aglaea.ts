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

const Aglea = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Thorned Nectar',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Aglaea's ATK to one designated enemy target.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    normal_alt: {
      energy: 20,
      trace: 'Enhanced Basic ATK',
      title: 'Slash by a Thousandfold Kiss',
      content: `Aglaea and <b>Garmentmaker</b> launches a <u>joint attack</u> on the target. Deals <b class="text-hsr-lightning">Lightning DMG</b> to the target by an amount equal to {{0}}% of Aglaea's ATK and {{0}}% of <b>Garmentmaker</b>'s ATK. And respectively deals <b class="text-hsr-lightning">Lightning DMG</b> to the adjacent targets by an amount equal to {{1}}% of Aglaea's ATK and {{1}}% of <b>Garmentmaker</b>'s ATK.`,
      value: [
        { base: 110, growth: 22, style: 'linear' },
        { base: 44, growth: 8.8, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Rise, Exalted Renown',
      content: `Restores HP to <b>Garmentmaker</b> by {{0}}% of its Max HP. If <b>Garmentmaker</b> is absent, summons the memosprite <b>Garmentmaker</b> and this unit immediately takes action.`,
      value: [{ base: 25, growth: 2.5, style: 'curved' }],
      level: skill,
      tag: AbilityTag.AOE,
    },
    summon_skill: {
      energy: 30,
      trace: 'Memosprite Skill',
      title: 'Thorned Snare',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% ATK to one enemy, and <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% ATK to adjacent enemies.`,
      value: [
        { base: 55, growth: 11, style: 'linear' },
        { base: 33, growth: 6.6, style: 'linear' },
      ],
      level: skill,
      tag: AbilityTag.AOE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Dance, Destined Weaveress`,
      content: `Summons the memosprite <b>Garmentmaker</b>. If <b>Garmentmaker</b> is already on the field, then restores its HP to max. Aglaea enters the <b class="text-desc">Supreme Stance</b> state and immediately takes action.
      <br />In the <b class="text-desc">Supreme Stance</b> state, Aglaea gains the SPD Boost stacks from <b>Garmentmaker</b>'s Memosprite Talent, with each stack increasing her SPD by {{0}}%. Enhances Basic ATK to <b>Slash by a Thousandfold Kiss</b>, and cannot use Skill. <b>Garmentmaker</b> is immune to Crowd Control debuffs.
      <br />A countdown appears on the Action Order, with its own SPD set at <span class="text-desc">100</span>. When the countdown's turn starts, <b>Garmentmaker</b> self-destructs. When <b>Garmentmaker</b> disappears, Aglaea's <b class="text-desc">Supreme Stance</b> state is dispelled.`,
      value: [{ base: 10, growth: 0.5, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      energy: 10,
      trace: 'Talent',
      title: `Rosy-Fingered`,
      content: `The memosprite <b>Garmentmaker</b> has an initial SPD of <span class="text-desc">40</span> and a Max HP equal to {{0}}% of Aglaea's Max HP plus {{1}}. While <b>Garmentmaker</b> is on the field, Aglaea's attacks inflict the target with the <b class="text-violet-300">Seam Stitch</b> state. <b class="text-violet-300">Seam Stitch</b> only takes effect on the most recently inflicted target.`,
      value: [
        { base: 44, growth: 2.75, style: 'heal' },
        { base: 180, growth: 67.5, style: 'heal' },
      ],
      level: talent,
      tag: AbilityTag.AOE,
    },
    summon_talent: {
      trace: 'Memosprite Talent',
      title: `A Body Brewed by Tears`,
      content: `After attacking an enemy afflicted with <b class="text-violet-300">Seam Stitch</b>, increases this unit's SPD by {{0}}, stacking up to <span class="text-desc">6</span> time(s).`,
      value: [{ base: 48, growth: 2.4, style: 'linear' }],
      level: talent,
      tag: AbilityTag.AOE,
    },
    technique: {
      trace: 'Technique',
      title: 'Stellar Ripper',
      content: `Summons the memosprite <b>Garmentmaker</b> and launches a forward joint attack. After entering battle, deals <b class="text-hsr-lightning">Lightning DMG</b> equal to <span class="text-desc">100%</span> Aglaea's ATK to all enemy targets and randomly inflicts the <b class="text-violet-300">Seam Stitch</b> state.`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `The Myopic's Doom`,
      content: `While in <b class="text-desc">Supreme Stance</b>, increases ATK of Aglaea and <b>Garmentmaker</b> by an amount equal to <span class="text-desc">720%</span> of Aglaea's SPD plus <span class="text-desc">360%</span> of <b>Garmentmaker</b>'s SPD.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Last Thread of Fate`,
      content: `When <b>Garmentmaker</b> disappears, up to <span class="text-desc">1</span> stack(s) of the SPD Boost from the Memosprite Talent can be retained. When <b>Garmentmaker</b> is summoned again, gains the corresponding number of SPD Boost stacks.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `The Speeding Sol`,
      content: `When using Skill or when entering combat, increases DMG dealt by <b>Garmentmaker</b> by <span class="text-desc">30%</span>, lasting for <span class="text-desc">5</span> turn(s). While Aglaea is in <b class="text-desc">Supreme Stance</b>, <b>Garmentmaker</b> will keep this DMG Boost effect.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Drift at the Whim of Venus`,
      content: `When Aglaea or <b>Garmentmaker</b> takes consecutive actions, the DMG dealt ignores <span class="text-desc">25%</span> of the target's DEF. This effect stacks up to <span class="text-desc">2</span> time(s) and lasts until any unit, other than Aglaea or <b>Garmentmaker</b>, actively uses an ability.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Sail on the Raft of Eyelids`,
      content: `The SPD Boost effect from the Memosprite Talent has its max stack limit increased by <span class="text-desc">1</span>. After Aglaea uses an attack, <b>Garmentmaker</b> can also gain the SPD Boost effect from the Memosprite Talent.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Bequeath in the Coalescence of Dew`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Memosprite Talent Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Flicker Below the Surface of Marble',
      content: `An enemy afflicted with <b class="text-violet-300">Seam Stitch</b> takes <span class="text-desc">8%</span> increased DMG. After Aglaea's or <b>Garmentmaker</b>'s attack hits this target, additionally regenerates <span class="text-desc">20</span> Energy.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Weave Under the Shroud of Woe`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Memosprite Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Fluctuate in the Tapestry of Fates',
      content: `While Aglaea is in <b class="text-desc">Supreme Stance</b>, she and <b>Garmentmaker</b> have their <b class="text-hsr-lightning">Lightning DMG PEN</b> increased by <span class="text-desc">20%</span>. When Aglaea or <b>Garmentmaker</b> gains an <u>Action Advance</u> effect, the multiplier of the DMG dealt by the next use of <b>Slash by a Thousandfold Kiss</b> additionally increases by an amount equal to <span class="text-desc">0.4%</span> of their respective SPD.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'supreme_stance',
      text: `Supreme Stance`,
      ...talents.ult,
      show: true,
      default: true,
      sync: true,
    },
    {
      type: 'number',
      id: 'aglea_summon_spd',
      text: `Seam Stitch SPD Stacks`,
      ...talents.summon_talent,
      show: true,
      default: 0,
      min: 0,
      max: 6,
    },
    {
      type: 'toggle',
      id: 'aglea_a6',
      text: `A6 Garmentmaker DMG Bonus`,
      ...talents.a6,
      show: a.a6,
      default: true,
      duration: 5,
    },
    {
      type: 'number',
      id: 'aglea_c1',
      text: `E1 DEF PEN`,
      ...talents.c1,
      show: c >= 1,
      default: 2,
      min: 0,
      max: 2,
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
        BASE_SPD: 40,
        ELEMENT: Element.NONE,
        BASE_HP: x.getHP() * calcScaling(0.44, 0.0275, talent, 'heal') + calcScaling(180, 67.5, talent, 'heal'),
        SUMMON_ID: '1402',
        NAME: 'Garmentmaker',
      })

      if (form.supreme_stance) base.BA_ALT = true
      base.COUNTDOWN = 100

      base.BASIC_SCALING = form.supreme_stance
        ? [
            {
              name: 'Main Target - Aglea',
              value: [{ scaling: calcScaling(1.1, 0.22, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.LIGHTNING,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
            {
              name: 'Adjacent - Aglea',
              value: [{ scaling: calcScaling(0.44, 0.088, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.LIGHTNING,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 5,
            },
            {
              name: 'Main Target - Garmentmaker',
              value: [{ scaling: calcScaling(1.1, 0.22, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.LIGHTNING,
              property: TalentProperty.SERVANT,
              type: TalentType.SERVANT,
              break: 10,
              sum: true,
              summon: true,
            },
            {
              name: 'Adjacent - Garmentmaker',
              value: [{ scaling: calcScaling(0.44, 0.088, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.LIGHTNING,
              property: TalentProperty.SERVANT,
              type: TalentType.SERVANT,
              break: 5,
              summon: true,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.LIGHTNING,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
          ]
      base.SKILL_SCALING = []
      base.MEMO_SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(0.55, 0.11, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 20,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.33, 0.066, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 10,
        },
      ]
      base.ULT_SCALING = []
      base.TECHNIQUE_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: 1, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
          sum: true,
        },
      ]

      if (form.aglea_a6) {
        base.SUMMON_STATS[Stats.ALL_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.3,
        })
      }
      if (form.aglea_summon_spd) {
        base.SUMMON_STATS[Stats.SPD].push({
          name: `Memosprite Talent`,
          source: 'Self',
          value: calcScaling(48, 2.4, basic, 'linear') * form.aglea_summon_spd,
        })
        if (form.supreme_stance) {
          base[Stats.P_SPD].push({
            name: `Ultimate`,
            source: 'Self',
            value: 0.15 * form.aglea_summon_spd,
          })
        }
      }
      if (form.aglea_c1) {
        base.DEF_PEN.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.25 * form.aglea_c1,
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
      if (form.supreme_stance && a.a2)
        base.CALLBACK.push(function (x) {
          const summonSpd = x.SUMMON_STATS.getSpd()
          x.X_ATK.push({
            name: `Ascension 2 Passive`,
            source: 'Self',
            value: 7.2 * x.getSpd() + summonSpd * 3.6,
            base: x.getSpd(),
            multiplier: 7.2,
            flat: `(${summonSpd} \u{00d7} ${toPercentage(3.6)})`,
          })
          x.SUMMON_STATS.X_ATK.push({
            name: `Ascension 2 Passive`,
            source: 'Aglaea',
            value: 7.2 * x.getSpd() + summonSpd * 3.6,
            base: x.getSpd(),
            multiplier: 7.2,
            flat: `(${summonSpd} \u{00d7} ${toPercentage(3.6)})`,
          })
          return x
        })

      return base
    },
  }
}

export default Aglea
