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
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Lingsha's ATK to all enemies, restores HP equal to {{1}}% of Lingsha's ATK plus {{2}} for all allies, and <u>Action Advances</u> Fuyuan by <span class="text-desc">20%</span>.`,
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
      content: `Inflicts <b>Befog</b> on all enemies. When in the <b>Befog</b> state, Break DMG taken by affected enemies increases by {{0}}%, lasting for <span class="text-desc">2</span> turn(s).
        <br />Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{1}}% of Lingsha's ATK to all enemies, and at the same time restores HP equal to {{2}}% of Lingsha's ATK plus {{3}} for all allies. <u>Action Advances</u> Fuyuan by <span class="text-desc">100%</span>.`,
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
      content: `Summons Fuyuan when using Skill. Fuyuan has an initial SPD of <span class="text-desc">80</span> and an initial action count of <span class="text-desc">3</span>. During Fuyuan's action, launch <u>follow-up attack</u> on all enemies, dealing <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% Lingsha's ATK, dispels <span class="text-desc">1</span> debuff(s) from all allies, and restores HP equal to {{1}}% of Lingsha's ATK plus {{2}} to all allies.
        <br />Fuyuan can accumulate a maximum of <span class="text-desc">5</span> action counts. When the action count reaches <span class="text-desc">0</span> or when Lingsha is downed, Fuyuan disappears.
        <br />While Fuyuan is present on the battlefield, using Lingsha's Skill increases Fuyuan's action count by <span class="text-desc">3</span>.`,
      value: [
        { base: 45, growth: 4.5, style: 'curved' },
        { base: 8, growth: 0.5, style: 'heal' },
        { base: 90, growth: 54, style: 'flat' },
      ],
      level: talent,
      tag: AbilityTag.AOE,
    },
    technique: {
      trace: 'Technique',
      title: 'Wisps of Aurora',
      content: `After using the Technique, immediately summons Fuyuan at the start of the next battle and inflicts <b>Befog</b> on all enemies, lasting for <span class="text-desc">2</span> turn(s).`,
      tag: AbilityTag.SUPPORT,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Vermilion Waft`,
      content: `Increases this unit's ATK/Outgoing Healing by an amount equal to <span class="text-desc">20%</span>/<span class="text-desc">8%</span> of their Break Effect, up to a maximum ATK/Outgoing Healing increase of <span class="text-desc">50%</span>/<span class="text-desc">20%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Sylvan Smoke`,
      content: `When using Basic ATK, additionally regenerates <span class="text-desc">10</span> Energy.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Ember's Echo`,
      content: `When any ally takes DMG or consumes HP, if their current HP percentage is less than or equal to <span class="text-desc">60%</span>, Fuyuan will immediately trigger the <u>follow-up attack</u> from the Talent. This attack will not consume Fuyuan's action. This effect can be triggered again after <span class="text-desc">2</span> turn(s).`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Bloom on Vileward Bouquet`,
      content: `Lingsha's Weakness Break Efficiency increases by <span class="text-desc">50%</span>. When an enemy's Weakness is Broken, reduces their DEF by <span class="text-desc">20%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Leisure in Carmine Smokeveil`,
      content: `When using Ultimate, all allies' Break Effect increases by <span class="text-desc">40%</span>, lasting for <span class="text-desc">3</span> turn(s).`,
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
      content: `During Fuyuan's action, restores HP equal to <span class="text-desc">40%</span> of Lingsha's ATK for the ally with the currently lowest HP percentage.`,
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
      content: `While Fuyuan is present on the battlefield, all enemies' All-Type RES reduces by <span class="text-desc">20%</span>. Fuyuan's attack additionally deals <span class="text-desc">3</span> hit(s) of DMG, with each hit dealing <b class="text-hsr-fire">Fire DMG</b> equal to <span class="text-desc">50%</span> of Lingsha's ATK and <span class="text-desc">5</span> Toughness Reduction.`,
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
      const base = x

      const c6Scaling =
        c >= 6
          ? [
              {
                name: 'E6 Extra Hits',
                value: [{ scaling: 0.5, multiplier: Stats.ATK }],
                element: Element.FIRE,
                property: TalentProperty.NORMAL,
                type: TalentType.BA,
                multiplier: 3,
                break: 15,
                sum: true,
              },
            ]
          : []
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
        ...c6Scaling,
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
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.45, 0.045, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 15,
          sum: true,
        },
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
          name: 'Ultimate',
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
          name: 'Ultimate',
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
            value: _.min([x.getValue(Stats.BE) * 0.08, 0.2]),
          })
          x[Stats.P_ATK].push({
            name: `Ascension 2 Passive`,
            source: 'Self',
            value: _.min([x.getValue(Stats.BE) * 0.2, 0.5]),
          })
          return x
        })
      }

      return base
    },
  }
}

export default Lingsha
