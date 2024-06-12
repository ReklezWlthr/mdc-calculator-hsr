import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Archeron = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const nihilCount = _.min([
    _.filter(team, (item) => findCharacter(item.cId)?.path === PathType.NIHILITY).length - 1,
    2,
  ])
  const baseCount = c >= 2 ? 0 : 1
  const multiplier = nihilCount >= baseCount + 1 ? 1.6 : nihilCount >= baseCount ? 1.1 : undefined

  const talents: ITalent = {
    normal: {
      title: 'Trilateral Wiltcross',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Acheron's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      title: 'Octobolt Flash',
      content: `Gains <span class="text-desc">1</span> point(s) of <b>Slashed Dream</b>. Inflicts <span class="text-desc">1</span> stack(s) of <b>Crimson Knot</b> on a single target enemy, dealing <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Acheron's ATK to this target, as well as <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Acheron's ATK to adjacent targets.`,
      value: [
        { base: 80, growth: 8, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
      ],
      level: skill,
    },
    ult: {
      title: 'Slashed Dream Cries in Red',
      content: `Sequentially unleash <b>Rainblade</b> <span class="text-desc">3</span> times and <b>Stygian Resurge</b> <span class="text-desc">1</span> time, dealing <b class="text-hsr-lightning">Lightning DMG</b> up to {{0}}% of Acheron's ATK to a single target enemy, as well as <b class="text-hsr-lightning">Lightning DMG</b> up to {{1}}% of Acheron's ATK to other targets.
      <br />
      <br /><b>Rainblade</b>: Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{2}}% of Acheron's ATK to a single target enemy and removes up to <span class="text-desc">3</span> stacks of <b>Crimson Knot</b> from the target. When <b>Crimson Knot</b> is removed, immediately deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{3}}% of Acheron's ATK to all enemies. For every stack of <b>Crimson Knot</b> removed, this DMG Multiplier is additionally increased, up to a maximum of {{4}}%.
      <br />
      <br /><b>Stygian Resurge</b>: Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{5}}% of Acheron's ATK to all enemies and remove all <b>Crimson Knots</b>.
      <br /><b>Crimson Knot</b> cannot be applied to enemies during the Ultimate.`,
      value: [
        { base: 223.2, growth: 14.88, style: 'curved' },
        { base: 180, growth: 12, style: 'curved' },
        { base: 14.4, growth: 0.96, style: 'curved' },
        { base: 9, growth: 0.6, style: 'curved' },
        { base: 36, growth: 2.4, style: 'curved' },
        { base: 72, growth: 4.8, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      title: 'Atop Rainleaf Hangs Oneness',
      content: `When <b>Slashed Dream</b> reaches <span class="text-desc">9</span> point(s), the Ultimate can be activated. During the Ultimate, reduces enemies' Toughness regardless of Weakness Types and reduces all enemies' All-Type RES by {{0}}%, lasting until the end of the Ultimate.
      <br />When any unit inflicts debuffs on an enemy target while using their ability, Acheron gains <span class="text-desc">1</span> point of <b>Slashed Dream</b> and inflicts <span class="text-desc">1</span> stack of <b>Crimson Knot</b> on the target. If debuffs are inflicted on multiple targets, then the <span class="text-desc">1</span> stack of <b>Crimson Knot</b> will be inflicted on the enemy target with the most <b>Crimson Knot</b> stacks. This effect can only trigger once per every ability usage.
      <br />After an enemy target exits the field or gets defeated by any unit while Acheron is on the field, their <b>Crimson Knot</b> stacks will be transferred to the enemy target with the most <b>Crimson Knot</b> stacks on the whole field.`,
      value: [{ base: 10, growth: 0.1, style: 'curved' }],
      level: talent,
    },
    technique: {
      title: 'Quadrivalent Ascendance',
      content: `Immediately attacks the enemy. At the start of each wave, gains <b>Quadrivalent Ascendance</b>, dealing <b class="text-hsr-lightning">Lightning DMG</b> equal to <span class="text-desc">200%</span> of Acheron's ATK to all enemies and reducing Toughness of all enemies irrespective of Weakness Types. When Weakness is broken, triggers the <b class="text-hsr-lightning">Lightning</b> Weakness Break effect.
      <br /><b>Quadrivalent Ascendance</b>: After using the Ultimate, Acheron gains <span class="text-desc">1</span> point(s) of <b>Slashed Dream</b> and inflicts <span class="text-desc">1</span> stack(s) of <b>Crimson Knot</b> on a single random enemy.
      <br />If attacking a normal enemy, immediately defeats them without entering combat. When not hitting enemies, no Technique Points are consumed.`,
    },
    a2: {
      title: 'A2: Red Oni',
      content: `When battle starts, immediately gains <span class="text-desc">5</span> point(s) of <b>Slashed Dream</b> and applies <span class="text-desc">5</span> stack(s) of <b>Crimson Knot</b> to a random enemy. When <b>Slashed Dream</b> reaches its upper limit, for every point of <b>Slashed Dream</b> that exceeds the limit, gains <span class="text-desc">1</span> stack of <b>Quadrivalent Ascendance</b>. Increases the maximum stackable count for <b>Quadrivalent Ascendance</b> to <span class="text-desc">3</span>.`,
    },
    a4: {
      title: 'A4: The Abyss',
      content: `When there are <span class="text-desc">1</span> or <span class="text-desc">2</span> Nihility characters other than Acheron in the team, the DMG dealt by Acheron's Basic ATK, Skill, and Ultimate increases to <span class="text-desc">115%</span> or <span class="text-desc">160%</span> of the original DMG respectively.`,
    },
    a6: {
      title: 'A6: Thunder Core',
      content: `When the Rainblade from Acheron's Ultimate hits enemy targets with <b>Crimson Knot</b>, her DMG increases by <span class="text-desc">30%</span>, stacking up to <span class="text-desc">3</span> time(s) and lasting for <span class="text-desc">3</span> turn(s). And when Stygian Resurge triggers, additionally deals DMG for <span class="text-desc">6</span> times. Each time deals <b class="text-hsr-lightning">Lightning DMG</b> equal to <span class="text-desc">25%</span> of Acheron's ATK to a single random enemy and is viewed as part of the Ultimate DMG.`,
    },
    c1: {
      title: 'E!: Silenced Sky Spake Sooth',
      content: `CRIT Rate increases by <span class="text-desc">18%</span> when dealing DMG to debuffed enemies.`,
    },
    c2: {
      title: 'E2: Mute Thunder in Still Tempest',
      content: `The number of Nihility characters required for the Trace "The Abyss" to achieve its highest possible effect is reduced by <span class="text-desc">1</span>. When this unit's turn starts, gains <span class="text-desc">1</span> point of <b>Slashed Dream</b> and inflicts <span class="text-desc">1</span> stack of <b>Crimson Knot</b> on the enemy with the most <b>Crimson Knot</b> stacks.`,
    },
    c3: {
      title: 'E3: Frost Bites in Death',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      title: 'E4: Shrined Fire for Mirrored Soul',
      content: `When enemy targets enter combat, afflict them with the Ultimate DMG Vulnerable Vulnerability state, increasing the amount of Ultimate DMG they take by <span class="text-desc">8%</span>.`,
    },
    c5: {
      title: 'E5: Strewn Souls on Erased Earths',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      title: 'E6: Apocalypse, the Emancipator',
      content: `Increases the All-Type RES PEN for the Ultimate DMG dealt by Acheron by <span class="text-desc">20%</span>. The DMG dealt by Basic ATK and Skill will also be considered as Ultimate DMG and can reduce enemy toughness regardless of Weakness Types. When Weakness is broken, triggers the <b class="text-hsr-lightning">Lightning</b> Weakness Break effect.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'crimson_knot',
      text: `Crimson Knot Stacks`,
      ...talents.talent,
      show: true,
      unique: true,
      default: 9,
      min: 0,
      max: 9,
    },
    {
      type: 'number',
      id: 'arch_a6',
      text: `Thunder Core DMG Bonus Stacks`,
      ...talents.a6,
      show: a.a6,
      default: 3,
      min: 0,
      max: 3,
    },
    {
      type: 'toggle',
      id: 'arch_c4',
      text: `E4 ULT Vulnerability`,
      ...talents.c4,
      show: c >= 4,
      default: true,
      debuff: true,
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
      }[]
    ) => {
      const base = _.cloneDeep(x)

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: c >= 6 ? TalentType.ULT : TalentType.BA,
          break: 30,
          multiplier,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main',
          value: [{ scaling: calcScaling(0.8, 0.08, skill, 'linear'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: c >= 6 ? TalentType.ULT : TalentType.SKILL,
          break: 60,
          multiplier,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.3, 0.03, skill, 'linear'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: c >= 6 ? TalentType.ULT : TalentType.SKILL,
          break: 30,
          multiplier,
        },
      ]
      const r1 = calcScaling(0.09, 0.006, ult, 'linear') * _.min([form.crimson_knot + (form.crimson_knot > 0), 4])
      const r2 =
        calcScaling(0.09, 0.006, ult, 'linear') *
        _.min([_.max([form.crimson_knot - 3 + Number(form.crimson_knot > 3), 0]), 4])
      const r3 =
        calcScaling(0.09, 0.006, ult, 'linear') *
        _.min([_.max([form.crimson_knot - 6 + Number(form.crimson_knot > 6), 0]), 4])
      const ra = _.sum([r1, r2, r3])
      base.ULT_SCALING = [
        {
          name: 'Rainblade Main',
          value: [{ scaling: calcScaling(0.144, 0.0096, ult, 'linear'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 15,
          multiplier,
        },
        {
          name: 'Rainblade AoE [1]',
          value: [{ scaling: r1, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 15,
          multiplier,
        },
        {
          name: 'Rainblade AoE [2]',
          value: [{ scaling: r2, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 15,
          multiplier,
        },
        {
          name: 'Rainblade AoE [3]',
          value: [{ scaling: r3, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 15,
          multiplier,
        },
        {
          name: 'Total Rainblade Main',
          value: [{ scaling: calcScaling(0.144, 0.0096, ult, 'linear') * 3 + ra, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 15 * (3 + _.ceil(form.crimson_knot / 3)),
          multiplier,
        },
        {
          name: 'Total Rainblade AoE',
          value: [{ scaling: ra, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 15 * _.ceil(form.crimson_knot / 3),
          multiplier,
        },
        {
          name: 'Stygian Resurge',
          value: [{ scaling: calcScaling(0.72, 0.048, ult, 'linear'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 15,
          multiplier,
        },
      ]
      base.TECHNIQUE_SCALING.push({
        name: 'AoE',
        value: [{ scaling: 2, multiplier: Stats.ATK }],
        element: Element.LIGHTNING,
        property: TalentProperty.NORMAL,
        type: TalentType.TECH,
        break: 60,
      })

      base.ULT_RES_PEN.push({
        name: `Talent Level ${talent}`,
        source: 'Self',
        value: calcScaling(0.1, 0.01, talent, 'curved'),
      })

      if (a.a6) {
        base.ULT_SCALING.push({
          name: 'Thunder Core Total DMG',
          value: [{ scaling: 0.25 * 6, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.ADD,
          type: TalentType.ULT,
          multiplier,
        })
      }
      if (form.arch_a6)
        base[Stats.ALL_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.3 * form.arch_a6,
        })
      if (c >= 1 && _.sumBy(debuffs, (item) => item.count) >= 1)
        base[Stats.CRIT_RATE].push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.18,
        })
      if (form.arch_c4) {
        base.ULT_VUL.push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.08,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (c >= 6)
        base.ULT_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.2,
        })

      return base
    },
    preComputeShared: (
      own: StatsObject,
      base: StatsObject,
      form: Record<string, any>,
      aForm: Record<string, any>,
      debuffs: { type: DebuffTypes; count: number }[]
    ) => {
      if (form.arch_c4)
        base.ULT_VUL.push({
          name: `Eidolon 4`,
          source: 'Archeron',
          value: 0.08,
        })

      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      team: StatsObject[],
      allForm: Record<string, any>[]
    ) => {
      return base
    },
  }
}

export default Archeron
