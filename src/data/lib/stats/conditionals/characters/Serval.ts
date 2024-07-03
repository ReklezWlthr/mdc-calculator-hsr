import { addDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Serval = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1103')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Roaring Thunderclap',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Serval's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Lightning Flash	',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Serval's ATK to a single enemy and <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Serval's ATK to enemies adjacent to it, with a <span class="text-desc">80%</span> <u>base chance</u> for enemies hit to become <b class="text-hsr-lightning">Shocked</b> for <span class="text-desc">2</span> turn(s).
      <br />While <b class="text-hsr-lightning">Shocked</b>, enemies take <b class="text-hsr-lightning">Lightning DoT</b> equal to {{2}}% of Serval's ATK at the beginning of each turn.`,
      value: [
        { base: 70, growth: 7, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
        { base: 40, growth: 4, style: 'curved' },
      ],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Here Comes the Mechanical Fever`,
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Serval's ATK to all enemies. Enemies already <b class="text-hsr-lightning">Shocked</b> will extend the duration of their <b class="text-hsr-lightning">Shock</b> state by <span class="text-desc">2</span> turn(s).`,
      value: [{ base: 108, growth: 7.2, style: 'curved' }],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Galvanic Chords`,
      content: `After Serval attacks, deals Additional <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Serval's ATK to all <b class="text-hsr-lightning">Shocked</b> enemies.`,
      value: [{ base: 36, growth: 3.6, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'Good Night, Belobog',
      content: `Immediately attacks the enemy. After entering battle, deals <b class="text-hsr-lightning">Lightning DMG</b> equal to <span class="text-desc">50%</span> of Serval's ATK to a random enemy, with a <span class="text-desc">100%</span> <u>base chance</u> for all enemies to become <b class="text-hsr-lightning">Shocked</b> for <span class="text-desc">3</span> turn(s).
      <br />While <b class="text-hsr-lightning">Shocked</b>, enemies will take <b class="text-hsr-lightning">Lightning DoT</b> equal to <span class="text-desc">50%</span> of Serval's ATK at the beginning of each turn.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Rock 'n' Roll`,
      content: `Skill has a <span class="text-desc">20%</span> increased <u>base chance</u> to <b class="text-hsr-lightning">Shock</b> enemies.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `String Vibration`,
      content: `At the start of the battle, immediately regenerates <span class="text-desc">15</span> Energy.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Mania`,
      content: `Upon defeating an enemy, ATK is increased by <span class="text-desc">20%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Echo Chamber`,
      content: `Basic ATK deals <b class="text-hsr-lightning">Lightning DMG</b> equal to <span class="text-desc">60%</span> of the Basic ATK's DMG to a random enemy adjacent to the target of the Basic ATK.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Encore!`,
      content: `Every time Serval's Talent is triggered to deal Additional DMG, she regenerates <span class="text-desc">4</span> Energy.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Listen, the Heartbeat of the Gears`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Make Some Noise!',
      content: `Ultimate has a <span class="text-desc">100%</span> <u>base chance</u> to apply <b class="text-hsr-lightning">Shock</b> to any enemies not currently <b class="text-hsr-lightning">Shocked</b>. This <b class="text-hsr-lightning">Shock</b> has the same effects as the one applied by Skill.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Belobog's Loudest Roar!`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'This Song Rocks to Heaven!',
      content: `Serval deals <span class="text-desc">30%</span> more DMG to <b class="text-hsr-lightning">Shocked</b> enemies.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'serval_skill',
      text: `Skill Shock`,
      ...talents.skill,
      show: true,
      default: true,
      debuff: true,
      chance: { base: a.a2 ? 1 : 0.8, fixed: false },
      duration: 2,
      debuffElement: Element.LIGHTNING,
    },
    {
      type: 'toggle',
      id: 'serval_tech',
      text: `Technique Shock`,
      ...talents.technique,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'serval_a6',
      text: `On-Kill ATK Bonus`,
      ...talents.a6,
      show: a.a6,
      default: true,
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'serval_skill'),
    findContentById(content, 'serval_tech'),
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
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(0.7, 0.07, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.3, 0.03, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.5, 0.1, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Additional DMG',
          value: [{ scaling: calcScaling(0.36, 0.036, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.5, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
        },
      ]

      if (form.serval_skill) {
        const skillShock = {
          name: 'Skill Shocked DMG',
          value: [{ scaling: calcScaling(0.4, 0.04, skill, 'dot'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.DOT,
          type: TalentType.NONE,
          debuffElement: Element.LIGHTNING,
        }
        base.SKILL_SCALING.push({ ...skillShock, chance: { base: a.a2 ? 1 : 0.8, fixed: false } })
        if (c >= 4) base.ULT_SCALING.push({ ...skillShock, chance: { base: 1, fixed: false } })
        base.DOT_SCALING.push({ ...skillShock, overrideIndex: index, dotType: DebuffTypes.SHOCKED })
      }
      if (form.serval_tech) {
        const techniqueShock = {
          name: 'Technique Shocked DMG',
          value: [{ scaling: 0.5, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.DOT,
          type: TalentType.NONE,
          debuffElement: Element.LIGHTNING,
        }
        base.TECHNIQUE_SCALING.push({ ...techniqueShock, chance: { base: 1, fixed: false } })
        base.DOT_SCALING.push({ ...techniqueShock, overrideIndex: index, dotType: DebuffTypes.SHOCKED })
      }
      if (form.serval_a6)
        base[Stats.P_ATK].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.2,
        })
      if (c >= 1)
        base.BASIC_SCALING.push({
          name: 'E1 Additional DMG',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear') * 0.6, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
          break: 10,
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
      if (c >= 6 && countDot(debuffs, DebuffTypes.SHOCKED))
        base[Stats.ALL_DMG].push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.3,
        })

      return base
    },
  }
}

export default Serval
