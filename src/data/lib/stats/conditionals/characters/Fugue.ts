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
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Virtue Beckons Bliss`,
      content: `Grants <b class="text-red">Foxian Prayer</b> to one designated ally and causes this unit to enter the <b class="text-hsr-fire">Torrid Scorch</b> state, lasting for <span class="text-desc">3</span> turn(s). This state's duration reduces by <span class="text-desc">1</span> at the start of Fugue's turn.
      <br />The ally target with <b class="text-red">Foxian Prayer</b> increases their Break Effect by {{0}}%. Every time after they attack, Fugue has a <span class="text-desc">100%</span> <u>base chance</u> to reduce the attacked enemy target's DEF by {{1}}%, lasting for <span class="text-desc">2</span> turn(s).
      <br />While in the <b class="text-hsr-fire">Torrid Scorch</b> state, Fugue cannot use Skill and her Basic ATK <b>Radiant Streak</b> is enhanced to <b>Fiery Caress</b>.`,
      value: [
        { base: 20, growth: 2, style: 'curved' },
        { base: 8, growth: 1, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.SUPPORT,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Solar Splendor Shines Upon All`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Fugue's ATK to all enemies. This instance of attack ignores Weakness Type to Reduce the Toughness of all enemies. Trigger the <b class="text-hsr-fire">Fire</b> Weakness Break effect when enemies become Weakness Broken in this way.`,
      value: [{ base: 100, growth: 10, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `Fortune Follows Where Virtue Spreads`,
      content: `While Fugue is on the field, enemy targets will get afflicted with <b class="text-violet-300">Exo-Toughness</b>, defaulting to an <b class="text-violet-300">Exo-Toughness</b> value equal to <span class="text-desc">50%</span> of their respective Max Toughness.
      <br />While Fugue is on the field and after Weakness Broken enemy targets are attacked by allies, converts the Toughness Reduction of this attack into <span class="text-desc">1</span> instance of {{0}}% Super Break DMG.`,
      value: [{ base: 50, growth: 5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.AOE,
    },
    technique: {
      trace: 'Technique',
      title: `Percipient Shine`,
      content: `After using Technique, inflicts Daze on enemies within a certain area, lasting for <span class="text-desc">10</span> second(s). While Dazed, enemies will not actively attack ally targets.
      <br />After entering battle via actively attacking Dazed enemies, Fugue's <u>Action Advances</u> by <span class="text-desc">40%</span>, with a <span class="text-desc">100%</span> <u>base chance</u> to inflict each enemy target with the same debuff as that applied by Fugue's Skill, lasting for <span class="text-desc">2</span> turn(s).`,
      tag: AbilityTag.IMPAIR,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Verdantia Renaissance`,
      content: `After ally targets break enemy weakness, additionally delays the action of the enemy target by <span class="text-desc">15%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Sylvan Enigma`,
      content: `Increases this unit's Break Effect by <span class="text-desc">30%</span>. After using Skill for the first time, immediately recovers <span class="text-desc">1</span> Skill Point(s).`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Phecda Primordia`,
      content: `When an enemy target's Weakness gets broken, increases all allies' Break Effect by <span class="text-desc">15%</span>, lasting for <span class="text-desc">2</span> turn(s). This effect can stack up to <span class="text-desc">2</span> time(s).`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Earthbound I Was, Cloudward I Be`,
      content: `Ally target with <b class="text-red">Foxian Prayer</b> increases their Weakness Break Efficiency by <span class="text-desc">50%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Beatitude Dawns for the Worthy`,
      content: `When an enemy target's Weakness gets broken, Fugue regenerates <span class="text-desc">5</span> Energy. After using Ultimate, advances the action of all allies by <span class="text-desc">24%</span>.`,
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
      content: `After every attack used by the ally with <b class="text-red">Foxian Prayer</b>, Fugue has a <span class="text-desc">100%</span> <u>base chance</u> to increase the DMG taken by the attacked enemy target by <span class="text-desc">15%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
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
      content: `Fugue's Weakness Break Efficiency increases by <span class="text-desc">50%</span>. While there is an ally target that has <b class="text-red">Foxian Prayer</b> on the field, all allies are considered as having <b class="text-red">Foxian Prayer</b>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'torrid_scorch',
      text: `Torrid Scorch`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'foxian_prayer',
      text: `Foxian Prayer`,
      ...talents.skill,
      show: true,
      default: false,
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
    {
      type: 'toggle',
      id: 'fugue_e4',
      text: `E4 Vulnerability`,
      ...talents.c4,
      show: c >= 4,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'fugue_skill'),
    findContentById(content, 'fugue_a6'),
    findContentById(content, 'fugue_e4'),
  ]

  const allyContent: IContent[] = [findContentById(content, 'foxian_prayer')]

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

      if (form.torrid_scorch) base.BA_ALT = true

      base.BASIC_SCALING = form.torrid_scorch
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
        },
      ]

      base.SUPER_BREAK = true
      base.SUPER_BREAK_MULT.push({
        name: 'Talent',
        source: 'Self',
        value: calcScaling(0.5, 0.05, talent, 'curved'),
      })
      if (form.foxian_prayer && c < 6) {
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
      if (form.fugue_a6)
        base[Stats.BE].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.15 * form.fugue_a6,
        })
      if (c >= 6) {
        base.BREAK_EFF.push({
          name: 'Eidolon 6',
          source: 'Self',
          value: 0.5,
        })
      }
      if (form.fugue_e4) {
        base.VULNERABILITY.push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.15,
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
      base.SUPER_BREAK = true
      base.SUPER_BREAK_MULT.push({
        name: 'Talent',
        source: 'Fugue',
        value: calcScaling(0.5, 0.05, talent, 'curved'),
      })
      if (aForm.foxian_prayer && c < 6) {
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
      }
      if (form.fugue_skill) {
        base.DEF_REDUCTION.push({
          name: 'Skill',
          source: 'Fugue',
          value: calcScaling(0.08, 0.01, skill, 'curved'),
        })
      }
      if (form.fugue_a6)
        base[Stats.BE].push({
          name: 'Ascension 6 Passive',
          source: 'Fugue',
          value: 0.15 * form.fugue_a6,
        })
      if (form.fugue_e4) {
        base.VULNERABILITY.push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.15,
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
      if (_.some(allForm, (item) => item.foxian_prayer) && c >= 6) {
        _.forEach(team, (t, i) => {
          t[Stats.BE].push({
            name: 'Foxian Prayer',
            source: index === i ? 'Self' : 'Fugue',
            value: calcScaling(0.2, 0.02, skill, 'curved'),
          })
          if (c >= 1) {
            t.BREAK_EFF.push({
              name: 'Foxian Prayer',
              source: index === i ? 'Self' : 'Fugue',
              value: 0.5,
            })
          }
        })
      }
      return base
    },
  }
}

export default Fugue
