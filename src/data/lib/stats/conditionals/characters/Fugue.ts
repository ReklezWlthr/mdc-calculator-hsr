import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { add, chain } from 'lodash'
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
import { teamOptionGenerator } from '@src/core/utils/data_format'

const Fugue = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1225')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Radiant Streak`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of the Fugue's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    normal_alt: {
      energy: 20,
      trace: 'Enhanced Basic ATK',
      title: `Fiery Caress`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of the Fugue's ATK to one designated enemy and <b class="text-hsr-fire">Fire DMG</b> equal to {{1}}% of Fugue's ATK to adjacent targets.`,
      value: [
        { base: 50, growth: 10, style: 'linear' },
        { base: 25, growth: 5, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Virtue Beckons Bliss`,
      content: `Grants one designated ally <b class="text-red">Foxian Prayer</b>. Enters the <b class="text-hsr-fire">Torrid Scorch</b> state, lasting for <span class="text-desc">3</span> turn(s). The duration reduces by <span class="text-desc">1</span> at the start of Fugue's every turn. <b class="text-red">Foxian Prayer</b> only takes effect on the most recent target of Fugue's Skill.
      <br />The ally target with <b class="text-red">Foxian Prayer</b> increases their Break Effect by {{0}}% and can also reduce Toughness even when attacking enemies that don't have the corresponding Weakness Type, with the effect equivalent to <span class="text-desc">50%</span> of the original Toughness Reduction value. This cannot stack with other Toughness Reduction effects that also ignore Weakness Type.
      <br />While in the <b class="text-hsr-fire">Torrid Scorch</b> state, Fugue enhances her Basic ATK. Every time an ally target with <b class="text-red">Foxian Prayer</b> attacks, Fugue has a <span class="text-desc">100%</span> <u>base chance</u> to reduce the attacked enemy target's DEF by {{1}}%, lasting for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 15, growth: 1.5, style: 'curved' },
        { base: 8, growth: 1, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.SUPPORT,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Solar Splendor Shines Upon All`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Fugue's ATK to all enemies. This attack ignores Weakness Type to reduce all enemies' Toughness. And when breaking Weakness, triggers the <b class="text-hsr-fire">Fire</b> Weakness Break effect.`,
      value: [{ base: 100, growth: 10, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `Fortune Follows Where Virtue Spreads`,
      content: `While Fugue is on the field, enemy targets will get additionally afflicted with <b class="text-violet-300">Cloudflame Luster</b>, equal to <span class="text-desc">40%</span> of their Max Toughness. When the initial Toughness is reduced to <span class="text-desc">0</span>, <b class="text-violet-300">Cloudflame Luster</b> can be further reduced. When <b class="text-violet-300">Cloudflame Luster</b> is reduced to <span class="text-desc">0</span>, the enemy will receive Weakness Break DMG again.
      <br />While Fugue is on the field and after allies attack Weakness Broken enemy targets, converts the Toughness Reduction of this attack into <span class="text-desc">1</span> instance of {{0}}% Super Break DMG.`,
      value: [{ base: 50, growth: 5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.AOE,
    },
    technique: {
      trace: 'Technique',
      title: `Percipient Shine`,
      content: `After using Technique, inflicts Daze on enemies within a certain area, lasting for <span class="text-desc">10</span> second(s). While Dazed, enemies will not actively attack ally targets.
      <br />After entering battle via actively attacking Dazed enemies, Fugue's <u>Action Advances</u> by <span class="text-desc">40%</span>, with a <span class="text-desc">100%</span> <u>base chance</u> to inflict each enemy target with the same DEF Reduction state as that applied by Fugue's Skill, lasting for <span class="text-desc">2</span> turn(s).`,
      tag: AbilityTag.IMPAIR,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Verdantia Renaissance`,
      content: `After ally targets break weakness, additionally delays the action of the enemy target by <span class="text-desc">15%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Sylvan Enigma`,
      content: `Increases this unit's Break Effect by <span class="text-desc">30%</span>. After using Skill for the first time, immediately recovers <span class="text-desc">1</span> Skill Point(s).`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Phecda Primordia`,
      content: `When an enemy target's Weakness gets broken, increases teammates' (i.e., excluding this unit) Break Effect by <span class="text-desc">6%</span>. If Fugue's Break Effect is <span class="text-desc">220%</span> or higher, the Break Effect increase is boosted by an additional <span class="text-desc">12%</span>, lasting for <span class="text-desc">2</span> turn(s). This effect can stack up to <span class="text-desc">2</span> time(s).`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Earthbound I Was, Cloudward I Be`,
      content: `Ally target with <b class="text-red">Foxian Prayer</b> increases their Weakness Break Efficiency by <span class="text-desc">50%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Beatitude Dawns for the Worthy`,
      content: `When an enemy target's Weakness gets broken, Fugue regenerates <span class="text-desc">3</span> Energy. After using Ultimate, advances the action of all allies by <span class="text-desc">24%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Verity Weaves Thoughts to Blade`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Bereft of Form, Which Name to Bear`,
      content: `Ally target with <b class="text-red">Foxian Prayer</b> increases their Break DMG dealt by <span class="text-desc">20%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Colored Cloud Rains Fortune`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Clairvoyance of Boom and Doom`,
      content: `Fugue's Weakness Break Efficiency increases by <span class="text-desc">50%</span>. While Fugue is in the <b class="text-hsr-fire">Torrid Scorch</b> state, <b class="text-red">Foxian Prayer</b> takes effect for all allies.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'element',
      id: 'foxian_prayer',
      text: `Foxian Prayer`,
      ...talents.skill,
      show: c < 6,
      default: '0',
      duration: 3,
      options: teamOptionGenerator(team, true),
    },
    {
      type: 'toggle',
      id: 'foxian_prayer',
      text: `Foxian Prayer`,
      ...talents.skill,
      show: c >= 6,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'fugue_skill',
      text: `Skill DEF Shred`,
      ...talents.skill,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 2,
    },
    {
      type: 'number',
      id: 'fugue_a6',
      text: `A6 Break Effect Bonus`,
      ...talents.a6,
      show: a.a6,
      default: 2,
      min: 0,
      max: 2,
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'fugue_a6'),
    findContentById(content, 'fugue_skill'),
    findContentById(content, 'foxian_prayer'),
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

      if (+form.foxian_prayer) base.BA_ALT = true

      base.BASIC_SCALING = +form.foxian_prayer
        ? [
            {
              name: 'Main Target',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.25, 0.05, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 5,
            },
          ]
        : [
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
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1, 0.1, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
          hitSplit: [0.6, 0.1, 0.1, 0.1, 0.1],
        },
      ]

      base.SUPER_BREAK = true
      base.SUPER_BREAK_MULT.push({
        name: 'Talent',
        source: 'Self',
        value: calcScaling(0.5, 0.05, talent, 'curved'),
      })
      if ((c < 6 && +form.foxian_prayer - 1 === index) || (c >= 6 && form.foxian_prayer)) {
        base[Stats.BE].push({
          name: 'Foxian Prayer',
          source: 'Self',
          value: calcScaling(0.2, 0.02, skill, 'curved'),
        })
        if (c >= 1) {
          base.BREAK_EFF.push({
            name: 'Foxian Prayer',
            source: 'Fugue',
            value: 0.5,
          })
        }
        if (c >= 4) {
          base.BREAK_MULT.push({
            name: 'Eidolon 4',
            source: 'Self',
            value: 0.2,
          })
        }
      }
      if (form.fugue_skill) {
        base.DEF_REDUCTION.push({
          name: 'Skill',
          source: 'Self',
          value: calcScaling(0.08, 0.01, skill, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      if (a.a4) {
        base[Stats.BE].push({
          name: 'Ascension 4 Passive',
          source: 'Self',
          value: 0.3,
        })
      }
      if (c >= 6) {
        base.BREAK_EFF.push({
          name: 'Eidolon 6',
          source: 'Self',
          value: 0.5,
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
      base.SUPER_BREAK = true
      base.SUPER_BREAK_MULT.push({
        name: 'Talent',
        source: 'Fugue',
        value: calcScaling(0.5, 0.05, talent, 'curved'),
      })
      const aIndex = _.findIndex(team, (item) => item?.cId === base.ID) + (base.SUMMON_ID ? 10 : 0)
      if ((c < 6 && +form.foxian_prayer - 1 === aIndex) || (c >= 6 && form.foxian_prayer)) {
        base[Stats.BE].push({
          name: 'Foxian Prayer',
          source: 'Fugue',
          value: calcScaling(0.2, 0.02, skill, 'curved'),
        })
        if (c >= 1) {
          base.BREAK_EFF.push({
            name: 'Foxian Prayer',
            source: 'Fugue',
            value: 0.5,
          })
        }
        if (c >= 4) {
          base.BREAK_MULT.push({
            name: 'Eidolon 4',
            source: 'Fugue',
            value: 0.2,
          })
        }
      }

      if (form.fugue_skill) {
        base.DEF_REDUCTION.push({
          name: 'Skill',
          source: 'Fugue',
          value: calcScaling(0.08, 0.01, skill, 'curved'),
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
      if (form.fugue_a6) {
        _.forEach(team, (t, i) => {
          if (index !== i)
            t[Stats.BE].push({
              name: 'Ascension 6 Passive',
              source: 'Fugue',
              value: (base.getValue(Stats.BE) >= 2.1 ? 0.18 : 0.06) * form.fugue_a6,
            })
          if (t.SUMMON_STATS) {
            t.SUMMON_STATS?.[Stats.BE].push({
              name: 'Ascension 6 Passive',
              source: 'Fugue',
              value: (base.getValue(Stats.BE) >= 2.1 ? 0.18 : 0.06) * form.fugue_a6,
            })
          }
        })
      }

      return base
    },
  }
}

export default Fugue
