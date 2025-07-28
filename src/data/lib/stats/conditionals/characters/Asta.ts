import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Asta = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const index = _.findIndex(team, (item) => item?.cId === '1009')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Spectrum Beam',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Asta's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: c >= 1 ? 36 : 30,
      trace: 'Skill',
      title: 'Meteor Storm',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Asta's ATK to a single enemy and further deals DMG for <span class="text-desc">4</span> extra times, with each time dealing <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Asta's ATK to a random enemy.`,
      value: [{ base: 25, growth: 2.5, style: 'curved' }],
      level: skill,
      tag: AbilityTag.BOUNCE,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Astral Blessing`,
      content: `Increases SPD of all allies by {{0}} for <span class="text-desc">2</span> turn(s).`,
      value: [{ base: 36, growth: 1.4, style: 'curved' }],
      level: ult,
      tag: AbilityTag.SUPPORT,
    },
    talent: {
      trace: 'Talent',
      title: `Astrometry`,
      content: `Gains <span class="text-desc">1</span> stack of <b>Charging</b> for every different enemy hit by Asta plus an extra stack if the enemy hit has <b class="text-hsr-fire">Fire</b> Weakness.
      <br />For every stack of <b>Charging</b> Asta has, all allies' ATK increases by {{0}}%, up to <span class="text-desc">5</span> time(s).
      <br />Starting from her second turn, Asta's <b>Charging</b> stack count is reduced by <span class="text-desc">3</span> at the beginning of every turn.`,
      value: [{ base: 7, growth: 0.7, style: 'curved' }],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    technique: {
      trace: 'Technique',
      title: 'Miracle Flash',
      content: `Immediately attacks the enemy. After entering battle, deals <b class="text-hsr-fire">Fire DMG</b> equal to <span class="text-desc">50%</span> of Asta's ATK to all enemies.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Sparks`,
      content: `Asta's Basic ATK has a <span class="text-desc">80%</span> <u>base chance</u> to <b class="text-hsr-fire">Burn</b> enemies for <span class="text-desc">3</span> turn(s).
      <br /><b class="text-hsr-fire">Burned</b> enemies take <b class="text-hsr-fire">Fire DoT</b> equal to <span class="text-desc">50%</span> of DMG dealt by Asta's Basic ATK at the start of each turn.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Ignite`,
      content: `When Asta is on the field, all allies' <b class="text-hsr-fire">Fire DMG</b> increases by <span class="text-desc">18%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Constellation`,
      content: `Asta's DEF increases by <span class="text-desc">6%</span> for every current <b>Charging</b> stack she possesses.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Star Sings Sans Verses or Vocals',
      content: `When using Skill, deals DMG for <span class="text-desc">1</span> extra time to a random enemy.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Moon Speaks in Wax and Wane`,
      content: `After using her Ultimate, Asta's <b>Charging</b> stacks will not be reduced in the next turn.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Meteor Showers for Wish and Want',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Aurora Basks in Beauty and Bliss',
      content: `Asta's Energy Regeneration Rate increases by <span class="text-desc">15%</span> when she has <span class="text-desc">2</span> or more <b>Charging</b> stacks.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Nebula Secludes in Runes and Riddles`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Cosmos Dreams in Calm and Comfort',
      content: `<b>Charging</b> stack(s) lost in each turn is reduced by <span class="text-desc">1</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'charging',
      text: `Charging Stacks`,
      ...talents.talent,
      show: true,
      default: 0,
      min: 0,
      max: 5,
    },
    {
      type: 'toggle',
      id: 'asta_ult',
      text: `Astral Blessing SPD Bonus`,
      ...talents.talent,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'asta_a2',
      text: `A2 Basic ATK Burn`,
      ...talents.a2,
      show: a.a2,
      default: true,
      debuff: true,
      duration: 3,
      chance: { base: 0.8, fixed: false },
      debuffElement: Element.FIRE,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'charging'),
    findContentById(content, 'asta_ult'),
    findContentById(content, 'asta_a2'),
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

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          energy: 20,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'First Hit',
          value: [{ scaling: calcScaling(0.25, 0.025, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
        {
          name: `Bounce`,
          value: [{ scaling: calcScaling(0.25, 0.025, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 5,
        },
        {
          name: 'Max Single Target DMG',
          value: [{ scaling: calcScaling(0.25, 0.025, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          multiplier: c >= 1 ? 6 : 5,
          break: 10 + 5 * (c >= 1 ? 6 : 5),
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.5, multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
          sum: true,
        },
      ]

      if (form.charging) {
        base[Stats.P_ATK].push({
          name: `Talent`,
          source: 'Self',
          value: form.charging * calcScaling(0.07, 0.007, talent, 'curved'),
        })
        if (a.a6)
          base[Stats.P_DEF].push({
            name: `Talent (Ascension 6)`,
            source: 'Self',
            value: form.charging * 0.06,
          })
      }
      if (form.asta_ult)
        base[Stats.SPD].push({
          name: `Ultimate`,
          source: 'Self',
          value: calcScaling(36, 1.4, ult, 'curved'),
        })

      if (form.asta_a2) {
        const burn = {
          name: 'Burn DMG',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear') * 0.5, multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.DOT,
          type: TalentType.NONE,
          chance: { base: 0.8, fixed: false },
          debuffElement: Element.FIRE,
        }

        base.BASIC_SCALING.push(burn)
        base.DOT_SCALING.push({ ...burn, overrideIndex: index, dotType: DebuffTypes.BURN })
        addDebuff(debuffs, DebuffTypes.BURN)
      }
      if (a.a4)
        base[Stats.FIRE_DMG].push({
          name: `Ascension 4 Passive`,
          source: 'Self',
          value: 0.18,
        })
      if (c >= 4 && form.charging >= 2)
        base[Stats.ERR].push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.15,
        })

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
      if (form.charging)
        base[Stats.P_ATK].push({
          name: `Talent`,
          source: 'Asta',
          value: form.charging * calcScaling(0.07, 0.007, talent, 'curved'),
        })
      if (form.asta_ult)
        base[Stats.SPD].push({
          name: `Ultimate`,
          source: 'Asta',
          value: calcScaling(36, 1.4, ult, 'curved'),
        })
      if (a.a4)
        base[Stats.FIRE_DMG].push({
          name: `Ascension 4 Passive`,
          source: 'Asta',
          value: 0.18,
        })

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
      return base
    },
  }
}

export default Asta
