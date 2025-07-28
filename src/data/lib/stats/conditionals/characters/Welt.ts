import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Welt = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Gravity Suppression',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Welt's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: c >= 6 ? 40 : 30,
      trace: 'Skill',
      title: 'Edge of the Void',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Welt's ATK to a single enemy and further deals DMG <span class="text-desc">2</span> extra times, with each time dealing <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Welt's ATK to a random enemy. On hit, there is a {{1}}% <u>base chance</u> to reduce the enemy's SPD by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 36, growth: 3.6, style: 'curved' },
        { base: 65, growth: 1, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BOUNCE,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Synthetic Black Hole',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Welt's ATK to all enemies, with a <span class="text-desc">100%</span> <u>base chance</u> for enemies hit by this ability to be <b class="text-hsr-imaginary">Imprisoned</b> for <span class="text-desc">1</span> turn.
      <br /><b class="text-hsr-imaginary">Imprisoned</b> enemies have their actions delayed by {{1}}% and SPD reduced by <span class="text-desc">10%</span>.`,
      value: [
        { base: 138, growth: 9.2, style: 'curved' },
        { base: 32, growth: 0.8, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: 'Time Distortion',
      content: `When hitting an enemy that is already <b>Slowed</b>, Welt deals Additional <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of his ATK to the enemy.`,
      value: [{ base: 30, growth: 3, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: 'Gravitational Imprisonment',
      content: `After using Welt's Technique, create a dimension that lasts for <span class="text-desc">15</span> second(s). Enemies in this dimension have their Movement SPD reduced by <span class="text-desc">50%</span>. After entering battle with enemies in the dimension, there is a <span class="text-desc">100%</span> <u>base chance</u> to <b class="text-hsr-imaginary">Imprison</b> the enemies for <span class="text-desc">1</span> turn.
      <br /><b class="text-hsr-imaginary">Imprisoned</b> enemies have their actions delayed by <span class="text-desc">20%</span> and SPD reduced by <span class="text-desc">10%</span>. Only <span class="text-desc">1</span> dimension created by allies can exist at the same time.`,
      tag: AbilityTag.IMPAIR,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Retribution',
      content: `When using Ultimate, there is a <span class="text-desc">100%</span> <u>base chance</u> to increase the DMG received by the targets by <span class="text-desc">12%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Judgment',
      content: `Using Ultimate additionally regenerates <span class="text-desc">10</span> Energy.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Punishment',
      content: `Deals <span class="text-desc">20%</span> more DMG to enemies inflicted with Weakness Break.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Legacy of Honor',
      content: `After Welt uses his Ultimate, his abilities are enhanced. The next <span class="text-desc">2</span> time(s) he uses his Basic ATK or Skill, deals Additional DMG to the target equal to <span class="text-desc">50%</span> of his Basic ATK's DMG multiplier or <span class="text-desc">80%</span> of his Skill's DMG multiplier respectively.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Conflux of Stars`,
      content: `When his Talent is triggered, Welt regenerates <span class="text-desc">3</span> Energy.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Prayer of Peace',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Appellation of Justice',
      content: `<u>Base chance</u> for Skill to inflict SPD Reduction increases by <span class="text-desc">35%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Power of Kindness`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Prospect of Glory',
      content: `When using Skill, deals DMG for <span class="text-desc">1</span> extra time to a random enemy.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'welt_skill',
      text: `Skill SPD Reduction`,
      ...talents.skill,
      show: true,
      default: true,
      debuff: true,
      chance: { base: calcScaling(0.65, 0.01, skill, 'curved') + (c >= 4 ? 0.35 : 0), fixed: false },
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'welt_ult',
      text: `Welt's Imprisonment`,
      ...talents.ult,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 1,
      debuffElement: Element.IMAGINARY,
    },
    {
      type: 'toggle',
      id: 'welt_a2',
      text: `A2 Vulnerability`,
      ...talents.a2,
      show: a.a2,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'welt_skill'), findContentById(content, 'welt_ult')]

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
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: `Bounce`,
          value: [{ scaling: calcScaling(0.36, 0.036, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
        {
          name: `Max Single Target DMG`,
          value: [{ scaling: calcScaling(0.36, 0.036, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          multiplier: c >= 6 ? 4 : 3,
          break: (c >= 6 ? 4 : 3) * 10,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.9, 0.06, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          energy: 5,
          sum: true,
          hitSplit: [0.1, 0.9],
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Additional Damage',
          value: [{ scaling: calcScaling(0.3, 0.03, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
          sum: true,
        },
      ]

      if (form.welt_skill) {
        base.SPD_REDUCTION.push({
          name: `Skill`,
          source: 'Self',
          value: 0.1,
        })
        addDebuff(debuffs, DebuffTypes.SPD_RED)
      }
      if (form.welt_ult) {
        addDebuff(debuffs, DebuffTypes.IMPRISON)
      }
      if (form.welt_a2) {
        base.VULNERABILITY.push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.12,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (a.a6 && broken)
        base[Stats.ALL_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.2,
        })
      if (c >= 1) {
        base.BASIC_SCALING.push({
          name: 'E1 Additional DMG',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear') * 0.5, multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
          sum: true,
        })
        base.SKILL_SCALING.push(
          {
            name: 'E1 Additional DMG',
            value: [{ scaling: calcScaling(0.36, 0.036, skill, 'curved') * 0.8, multiplier: Stats.ATK }],
            element: Element.IMAGINARY,
            property: TalentProperty.ADD,
            type: TalentType.NONE,
          },
          {
            name: `E1 Max Single Target Additional DMG`,
            value: [{ scaling: calcScaling(0.36, 0.036, skill, 'curved') * 0.8, multiplier: Stats.ATK }],
            element: Element.IMAGINARY,
            property: TalentProperty.ADD,
            type: TalentType.NONE,
            multiplier: c >= 6 ? 4 : 3,
            sum: true,
          }
        )
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
      if (form.welt_skill)
        base.SPD_REDUCTION.push({
          name: `Skill`,
          source: 'Welt',
          value: 0.1,
        })
      if (form.welt_ult)
        base.SPD_REDUCTION.push({
          name: `Ultimate`,
          source: 'Welt',
          value: 0.1,
        })
      if (form.welt_tech)
        base.SPD_REDUCTION.push({
          name: `Technique`,
          source: 'Welt',
          value: 0.1,
        })
      if (form.welt_a2)
        base.VULNERABILITY.push({
          name: `Ascension 2 Passive`,
          source: 'Welt',
          value: 0.12,
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

export default Welt
