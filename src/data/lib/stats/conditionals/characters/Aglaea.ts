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
  const memo_skill = t.memo_skill + upgrade.memo_skill
  const memo_talent = t.memo_talent + upgrade.memo_talent

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
      content: `Aglaea and <b>Garmentmaker</b> launch a <u>Joint ATK</u> on the target, respectively dealing <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Aglaea's ATK and {{0}}% of <b>Garmentmaker</b>'s ATK to the target. Also, deal <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Aglaea's ATK and {{1}}% of <b>Garmentmaker</b>'s ATK to the adjacent targets. <b>Slash by a Thousandfold Kiss</b> cannot recover Skill Points.`,
      value: [
        { base: 100, growth: 2, style: 'linear' },
        { base: 45, growth: 9, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
    },
    skill: {
      energy: 20,
      trace: 'Skill',
      title: 'Rise, Exalted Renown',
      content: `Restores HP to <b>Garmentmaker</b> by {{0}}% of its Max HP. If <b>Garmentmaker</b> is absent, summons the memosprite <b>Garmentmaker</b> and this unit immediately takes action.`,
      value: [{ base: 25, growth: 2.5, style: 'curved' }],
      level: skill,
      tag: AbilityTag.SUMMON,
    },
    summon_skill: {
      energy: 10,
      trace: 'Memosprite Skill',
      title: 'Thorned Snare',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% ATK to one enemy and <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% ATK to adjacent targets.`,
      value: [
        { base: 55, growth: 11, style: 'linear' },
        { base: 33, growth: 6.6, style: 'linear' },
      ],
      level: memo_skill,
      tag: AbilityTag.BLAST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Dance, Destined Weaveress`,
      content: `Summons the memosprite <b>Garmentmaker</b>. If <b>Garmentmaker</b> is already on the field, then restores its HP to max. Aglaea enters the <b class="text-desc">Supreme Stance</b> state and immediately takes action.
      <br />While in the <b class="text-desc">Supreme Stance</b> state, Aglaea gains the SPD Boost stacks from <b>Garmentmaker</b>'s Memosprite Talent, with each stack increasing her SPD by {{0}}%. Enhances Basic ATK to <b>Slash by a Thousandfold Kiss</b>, and cannot use Skill. <b>Garmentmaker</b> is immune to Crowd Control debuffs.
      <br />A countdown appears on the Action Order, with its own SPD set at <span class="text-desc">100</span>. Using Ultimate again when the countdown is on the Action Order will reset the countdown. When the countdown's turn starts, <b>Garmentmaker</b> self-destructs. When <b>Garmentmaker</b> disappears, Aglaea's <b class="text-desc">Supreme Stance</b> state is dispelled.`,
      value: [{ base: 10, growth: 0.5, style: 'curved' }],
      level: ult,
      tag: AbilityTag.ENHANCE,
    },
    talent: {
      energy: 10,
      trace: 'Talent',
      title: `Rosy-Fingered`,
      content: `The memosprite <b>Garmentmaker</b> has an initial SPD equal to <span class="text-desc">35%</span> of Aglaea's SPD and a Max HP equal to {{0}}% of Aglaea's Max HP plus {{1}}. While <b>Garmentmaker</b> is on the field, Aglaea's attacks inflict the target with the <b class="text-violet-300">Seam Stitch</b> state. After attacking enemies in the <b class="text-violet-300">Seam Stitch</b> state, further deals <b class="text-hsr-lightning">Lightning Additional DMG</b> equal to {{2}}% of Aglaea's ATK. <b class="text-violet-300">Seam Stitch</b> only takes effect on the most recently inflicted target.`,
      value: [
        { base: 44, growth: 2.75, style: 'heal' },
        { base: 180, growth: 67.5, style: 'heal' },
        { base: 12, growth: 1.8, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    summon_talent: {
      trace: 'Memosprite Talent',
      title: `A Body Brewed by Tears`,
      content: `After attacking an enemy afflicted with <b class="text-violet-300">Seam Stitch</b>, increases this unit's SPD by {{0}}, stacking up to <span class="text-desc">6</span> time(s). During Garmentmaker's turn, automatically uses <b>Thorned Snare</b>, prioritizing enemies under the <b class="text-violet-300">Seam Stitch</b> state.`,
      value: [{ base: 44, growth: 2.2, style: 'linear' }],
      level: memo_talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: 'Meteoric Sunder',
      content: `Summons the memosprite <b>Garmentmaker</b> and launches a forward joint attack. After entering battle, regenerates <span class="text-desc">30</span> Energy and deals <b class="text-hsr-lightning">Lightning DMG</b> equal to <span class="text-desc">100%</span> of Aglaea's ATK to all enemy targets. Then, randomly inflicts the <b class="text-violet-300">Seam Stitch</b> state to a random enemy target.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `The Myopic's Doom`,
      content: `While in <b class="text-desc">Supreme Stance</b>, increases Aglaea and <b>Garmentmaker</b>'s ATK by an amount equal to <span class="text-desc">720%</span> of Aglaea's SPD plus <span class="text-desc">360%</span> of <b>Garmentmaker</b>'s SPD.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Last Thread of Fate`,
      content: `When <b>Garmentmaker</b> disappears, up to <span class="text-desc">1</span> stack(s) of the SPD Boost from the Memosprite Talent can be retained. When <b>Garmentmaker</b> is summoned again, gains the corresponding number of SPD Boost stacks.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `The Speeding Sol`,
      content: `At the start of battle, if this unit's Energy is lower than <span class="text-desc">50%</span>, regenerates this unit's Energy until <span class="text-desc">50%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Drift at the Whim of Venus`,
      content: `Enemies afflicted with <b class="text-violet-300">Seam Stitch</b> take <span class="text-desc">15%</span> increased DMG. After Aglaea's or <b>Garmentmaker</b>'s attack hits this target, Aglaea additionally regenerates <span class="text-desc">20</span> Energy.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Sail on the Raft of Eyelids`,
      content: `When Aglaea or <b>Garmentmaker</b> takes action, the DMG dealt by Aglaea and <b>Garmentmaker</b> ignores <span class="text-desc">14%</span> of the target's DEF. This effect stacks up to <span class="text-desc">3</span> time(s) and lasts until any unit, other than Aglaea or <b>Garmentmaker</b>, actively uses an ability.`,
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
      content: `The SPD Boost effect from the Memosprite Talent has its max stack limit increased by <span class="text-desc">1</span>. After Aglaea uses an attack, Garmentmaker can also gain the SPD Boost effect from the Memosprite Talent.`,
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
      content: `While Aglaea is in <b class="text-desc">Supreme Stance</b>, increases her and <b>Garmentmaker</b>'s <b class="text-hsr-lightning">Lightning DMG PEN</b> by <span class="text-desc">20%</span>. When Aglaea or Garmentmaker's SPD is greater than <span class="text-desc">160</span>/<span class="text-desc">240</span>/<span class="text-desc">320</span>, the DMG dealt by Joint ATK increases by <span class="text-desc">10%</span>/<span class="text-desc">30%</span>/<span class="text-desc">60%</span>.`,
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
      max: c >= 4 ? 7 : 6,
    },
    {
      type: 'toggle',
      id: 'aglea_c1',
      text: `E1 Seam Stitch Vulnerability`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      debuff: true,
    },
    {
      type: 'number',
      id: 'aglea_c2',
      text: `E2 DEF PEN`,
      ...talents.c2,
      show: c >= 2,
      default: 1,
      min: 0,
      max: 3,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'aglea_c2')]

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
        BASE_SPD: 0.35 * x.getSpd(),
        ELEMENT: Element.NONE,
        BASE_HP: x.BASE_HP * calcScaling(0.44, 0.0275, talent, 'curved'),
        [Stats.HP]: [
          { value: calcScaling(180, 67.5, talent, 'curved'), name: 'Talent', source: 'Self' },
          ..._.map(x[Stats.HP], (item) => ({
            ...item,
            value: item.value * calcScaling(0.44, 0.0275, talent, 'curved'),
          })),
        ],
        [Stats.P_HP]: x[Stats.P_HP],
        [Stats.P_SPD]: [],
        [Stats.SPD]: [],
        SUMMON_ID: '1402',
        NAME: 'Garmentmaker',
        MAX_ENERGY: 0,
      })

      if (form.supreme_stance) base.BA_ALT = true
      base.COUNTDOWN = 100

      base.BASIC_SCALING = form.supreme_stance
        ? [
            {
              name: 'Main Target - Aglea',
              value: [{ scaling: calcScaling(1, 0.2, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.LIGHTNING,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
              hitSplit: [0.25, 0.25, 0.25, 0.25],
            },
            {
              name: 'Adjacent - Aglea',
              value: [{ scaling: calcScaling(0.45, 0.09, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.LIGHTNING,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 5,
              hitSplit: [0.25, 0.25, 0.25, 0.25],
            },
            {
              name: 'Main Target - Garmentmaker',
              value: [{ scaling: calcScaling(1, 0.2, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.LIGHTNING,
              property: TalentProperty.SERVANT,
              type: TalentType.SERVANT,
              break: 10,
              sum: true,
              summon: true,
            },
            {
              name: 'Adjacent - Garmentmaker',
              value: [{ scaling: calcScaling(0.45, 0.09, basic, 'linear'), multiplier: Stats.ATK }],
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
              hitSplit: [0.2, 0.2, 0.6],
            },
          ]
      base.SKILL_SCALING = []
      base.MEMO_SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(0.55, 0.11, memo_skill, 'linear'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 20,
          sum: true,
          hitSplit: [0.3, 0.3, 0.1, 0.1, 0.2],
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.33, 0.066, memo_skill, 'linear'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 10,
          hitSplit: [0.25, 0.25, 0.5],
        },
      ]
      base.ULT_SCALING = []
      base.TALENT_SCALING = [
        {
          name: 'Seam Stitch Additional DMG',
          value: [{ scaling: calcScaling(0.12, 0.018, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
          sum: true,
        },
      ]
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

      if (form.aglea_summon_spd) {
        base.SUMMON_STATS[Stats.SPD].push({
          name: `Memosprite Talent`,
          source: 'Self',
          value: calcScaling(44, 2.2, memo_talent, 'linear') * form.aglea_summon_spd,
        })
        if (form.supreme_stance) {
          base[Stats.P_SPD].push({
            name: `Ultimate`,
            source: 'Self',
            value: 0.15 * form.aglea_summon_spd,
          })
        }
      }
      if (form.aglea_c2) {
        base.DEF_PEN.push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.15 * form.aglea_c1,
        })
      }
      if (form.aglea_c1) {
        base.VULNERABILITY.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.14,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.supreme_stance && c >= 6) {
        base.LIGHTNING_RES_PEN.push({
          name: `Eidolon 6`,
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
      if (form.aglea_c1) {
        base.VULNERABILITY.push({
          name: `Eidolon 1`,
          source: 'Aglaea',
          value: 0.08,
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

export default Aglea
