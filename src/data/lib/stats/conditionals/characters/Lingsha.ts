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

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Lingsha = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Votive Incense`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Lingsha's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Smoke and Splendor',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Lingsha's ATK to all enemies and at the same time, restores HP equal to {{1}}% of Lingsha's ATK plus {{2}} for all allies. Fuyuan's <u>Action Advances</u> by <span class="text-desc">20%</span>.`,
      value: [
        { base: 40, growth: 4, style: 'curved' },
        { base: 10, growth: 0.5, style: 'heal' },
        { base: 105, growth: 63, style: 'flat' },
      ],
      level: skill,
      tag: AbilityTag.AOE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Dripping Mistscape`,
      content: `Inflicts <b>Befog</b> on all enemies. While in <b>Befog</b>, targets receive {{0}}% increased Break DMG, lasting for <span class="text-desc">2</span> turn(s).
        <br />Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{1}}% of Lingsha's ATK to all enemies, and at the same time restores HP equal to {{2}}% of Lingsha's ATK plus {{3}} for all allies. Fuyuan's <u>Action Advances</u> by <span class="text-desc">100%</span>.`,
      value: [
        { base: 15, growth: 1, style: 'curved' },
        { base: 75, growth: 7.5, style: 'curved' },
        { base: 8, growth: 0.5, style: 'heal' },
        { base: 90, growth: 54, style: 'flat' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `Mistdance Manifest`,
      content: `When using Skill, summons Fuyuan, with an initial SPD of <span class="text-desc">90</span> and an initial action count of <span class="text-desc">3</span>.
        <br />When taking action, Fuyuan launch <u>follow-up attack</u>, dealing <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% Lingsha's ATK to all enemies. Additionally deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% Lingsha's ATK to a single random enemy, and this DMG prioritizes targets that have both Toughness greater than <span class="text-desc">0</span> and <b class="text-hsr-fire">Fire</b> Weakness. Dispels <span class="text-desc">1</span> debuff(s) from all allies and restores HP equal to {{1}}% of Lingsha's ATK plus {{2}} to all allies.
        <br />Fuyuan's action count can accumulate up to <span class="text-desc">5</span>. When the action count reaches <span class="text-desc">0</span> or when Lingsha is knocked down, Fuyuan disappears.
        <br />While Fuyuan is present on the field, using Skill increases Fuyuan's action count by <span class="text-desc">3</span>.`,
      value: [
        { base: 37.5, growth: 3.75, style: 'curved' },
        { base: 8, growth: 0.5, style: 'heal' },
        { base: 90, growth: 54, style: 'flat' },
      ],
      level: talent,
      tag: AbilityTag.AOE,
    },
    technique: {
      trace: 'Technique',
      title: 'Wisps of Aurora',
      content: `After using Technique, immediately summons Fuyuan at the start of the next battle and inflicts <b>Befog</b> on all enemies, lasting for <span class="text-desc">2</span> turn(s).`,
      tag: AbilityTag.SUPPORT,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Vermilion Waft`,
      content: `Increases this unit's ATK or Outgoing Healing by an amount equal to <span class="text-desc">25%</span>/<span class="text-desc">10%</span> of Break Effect, up to a maximum increase of <span class="text-desc">50%</span>/<span class="text-desc">20%</span> respectively.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Sylvan Smoke`,
      content: `When using Basic ATK, additionally regenerates <span class="text-desc">10</span> Energy.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Ember's Echo`,
      content: `When Fuyuan is on the field and any ally character takes DMG or consumes HP, if a character in the team has their current HP percentage lower than or equal to <span class="text-desc">60%</span>, Fuyuan will immediately launch the Talent's <u>follow-up attack</u>. This does not consume Fuyuan's action count. This effect can trigger again after <span class="text-desc">2</span> turn(s).`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Bloom on Vileward Bouquet`,
      content: `Lingsha's Weakness Break Efficiency increases by <span class="text-desc">50%</span>. When an enemy unit's Weakness is Broken, reduces their DEF by <span class="text-desc">20%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Leisure in Carmine Smokeveil`,
      content: `When using Ultimate, increases all allies' Break Effect by <span class="text-desc">40%</span>, lasting for <span class="text-desc">3</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Shine of Floral Wick`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Redolence from Canopied Banquet`,
      content: `When Fuyuan takes action, restores HP equal to <span class="text-desc">40%</span> of Lingsha's ATK for the ally whose current HP is the lowest.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Poise Atop Twists and Turns`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Arcadia Under Deep Seclusion`,
      content: `While Fuyuan is on the field, reduces all enemies' All-Type RES by <span class="text-desc">20%</span>. When Fuyuan attacks, additionally deals <span class="text-desc">4</span> instance(s) of DMG, with each instance dealing both <b class="text-hsr-fire">Fire DMG</b> equal to <span class="text-desc">50%</span> of Lingsha's ATK and and a Toughness Reduction of <span class="text-desc">5</span> to a single random enemy. This prioritizes targets with both Toughness greater than <span class="text-desc">0</span> and <b class="text-hsr-fire">Fire</b> Weakness.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'befog',
      text: `Befog`,
      ...talents.ult,
      show: true,
      default: true,
      debuff: true,
    },
    {
      type: 'toggle',
      id: 'lingsha_c2',
      text: `E2 Break Effect Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      duration: 3,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'befog')]

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

      const talentBase = calcScaling(0.375, 0.0375, talent, 'curved')
      const c6Scaling =
        c >= 6
          ? [
              {
                name: 'Max Single Target DMG',
                value: [{ scaling: talentBase * 2 + 2, multiplier: Stats.ATK }],
                element: Element.FIRE,
                property: TalentProperty.FUA,
                type: TalentType.TALENT,
                break: 30,
                sum: true,
              },
              {
                name: 'AoE',
                value: [{ scaling: talentBase, multiplier: Stats.ATK }],
                element: Element.FIRE,
                property: TalentProperty.FUA,
                type: TalentType.TALENT,
                break: 10,
              },
              {
                name: 'E6 Extra Hit',
                value: [{ scaling: 0.5, multiplier: Stats.ATK }],
                element: Element.FIRE,
                property: TalentProperty.FUA,
                type: TalentType.TALENT,
                break: 5,
              },
            ]
          : [
              {
                name: 'Max Single Target DMG',
                value: [{ scaling: talentBase * 2, multiplier: Stats.ATK }],
                element: Element.FIRE,
                property: TalentProperty.FUA,
                type: TalentType.TALENT,
                break: 10,
                sum: true,
              },
              {
                name: 'AoE',
                value: [{ scaling: talentBase, multiplier: Stats.ATK }],
                element: Element.FIRE,
                property: TalentProperty.FUA,
                type: TalentType.TALENT,
                break: 10,
              },
            ]
      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.4, 0.04, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          sum: true,
        },
        {
          name: 'Healing',
          value: [{ scaling: calcScaling(0.1, 0.005, skill, 'heal'), multiplier: Stats.ATK }],
          flat: calcScaling(105, 63, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.SKILL,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.75, 0.075, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
        {
          name: 'Healing',
          value: [{ scaling: calcScaling(0.08, 0.005, ult, 'heal'), multiplier: Stats.ATK }],
          flat: calcScaling(90, 54, ult, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.SKILL,
        },
      ]
      const c4Scaling =
        c >= 4
          ? [
              {
                name: 'E4 Healing',
                value: [{ scaling: 0.4, multiplier: Stats.ATK }],
                element: TalentProperty.HEAL,
                property: TalentProperty.HEAL,
                type: TalentType.TALENT,
              },
            ]
          : []
      base.TALENT_SCALING = [
        ...c6Scaling,
        {
          name: 'Healing',
          value: [{ scaling: calcScaling(0.08, 0.005, talent, 'heal'), multiplier: Stats.ATK }],
          flat: calcScaling(90, 54, talent, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.TALENT,
        },
        ...c4Scaling,
      ]

      if (form.befog) {
        base.BREAK_VUL.push({
          name: 'Befog',
          source: 'Self',
          value: calcScaling(0.15, 0.01, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (c >= 1) {
        base.BREAK_EFF.push({
          name: 'Eidolon 1',
          source: 'Self',
          value: 0.5,
        })
        if (broken) {
          base.DEF_REDUCTION.push({
            name: 'Eidolon 1',
            source: 'Self',
            value: 0.2,
          })
          addDebuff(debuffs, DebuffTypes.DEF_RED)
        }
      }
      if (form.lingsha_c2) {
        base[Stats.BE].push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.4,
        })
      }
      if (c >= 6) {
        base.ALL_TYPE_RES_RED.push({
          name: 'Eidolon 6',
          source: 'Self',
          value: 0.2,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
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
      if (form.befog) {
        base.BREAK_VUL.push({
          name: 'Befog',
          source: 'Lingsha',
          value: calcScaling(0.15, 0.01, ult, 'curved'),
        })
      }
      if (c >= 1 && broken) {
        base.DEF_REDUCTION.push({
          name: 'Eidolon 1',
          source: 'Lingsha',
          value: 0.2,
        })
      }
      if (form.lingsha_c2) {
        base[Stats.BE].push({
          name: 'Eidolon 2',
          source: 'Lingsha',
          value: 0.4,
        })
      }
      if (c >= 6) {
        base.ALL_TYPE_RES_RED.push({
          name: 'Eidolon 6',
          source: 'Lingsha',
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
      if (a.a2) {
        base.CALLBACK.push((x) => {
          x[Stats.HEAL].push({
            name: `Ascension 2 Passive`,
            source: 'Self',
            value: _.min([x.getValue(Stats.BE) * 0.1, 0.2]),
            base: toPercentage(_.min([x.getValue(Stats.BE), 2])),
            multiplier: 0.1,
          })
          x[Stats.P_ATK].push({
            name: `Ascension 2 Passive`,
            source: 'Self',
            value: _.min([x.getValue(Stats.BE) * 0.25, 0.5]),
          })
          return x
        })
      }

      return base
    },
  }
}

export default Lingsha
