import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

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
      title: 'Gravity Suppression',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Welt's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      title: 'Edge of the Void',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Welt's ATK to a single enemy and further deals DMG <span class="text-desc">2</span> extra times, with each time dealing <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Welt's ATK to a random enemy. On hit, there is a {{1}}% base chance to reduce the enemy's SPD by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 36, growth: 3.6, style: 'curved' },
        { base: 65, growth: 1, style: 'curved' },
      ],
      level: skill,
    },
    ult: {
      title: 'Synthetic Black Hole',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Welt's ATK to all enemies, with a <span class="text-desc">100%</span> base chance for enemies hit by this ability to be <b class="text-hsr-imaginary">Imprisoned</b> for <span class="text-desc">1</span> turn.
      <br /><b class="text-hsr-imaginary">Imprisoned</b> enemies have their actions delayed by {{1}}% and SPD reduced by <span class="text-desc">10%</span>.`,
      value: [
        { base: 138, growth: 9.2, style: 'curved' },
        { base: 32, growth: 0.8, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      title: 'Time Distortion',
      content: `When hitting an enemy that is already <b>Slowed</b>, Welt deals Additional <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of his ATK to the enemy.`,
      value: [{ base: 360, growth: 3, style: 'curved' }],
      level: talent,
    },
    technique: {
      title: 'Gravitational Imprisonment',
      content: `After using Welt's Technique, create a dimension that lasts for <span class="text-desc">15</span> second(s). Enemies in this dimension have their Movement SPD reduced by <span class="text-desc">50%</span>. After entering battle with enemies in the dimension, there is a <span class="text-desc">100%</span> base chance to <b class="text-hsr-imaginary">Imprison</b> the enemies for <span class="text-desc">1</span> turn.
      <br /><b class="text-hsr-imaginary">Imprisoned</b> enemies have their actions delayed by <span class="text-desc">20%</span> and SPD reduced by <span class="text-desc">10%</span>. Only <span class="text-desc">1</span> dimension created by allies can exist at the same time.`,
    },
    a2: {
      title: 'A2: Retribution',
      content: `When using Ultimate, there is a <span class="text-desc">100%</span> base chance to increase the DMG received by the targets by <span class="text-desc">12%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    a4: {
      title: 'A4: Judgment',
      content: `Using Ultimate additionally regenerates <span class="text-desc">10</span> Energy.`,
    },
    a6: {
      title: 'A6: Punishment',
      content: `Deals <span class="text-desc">20%</span> more DMG to enemies inflicted with Weakness Break.`,
    },
    c1: {
      title: 'E1: Legacy of Honor',
      content: `After Welt uses his Ultimate, his abilities are enhanced. The next <span class="text-desc">2</span> time(s) he uses his Basic ATK or Skill, deals Additional DMG to the target equal to <span class="text-desc">50%</span> of his Basic ATK's DMG multiplier or <span class="text-desc">80%</span> of his Skill's DMG multiplier respectively.`,
    },
    c2: {
      title: `E2: Conflux of Stars`,
      content: `When his Talent is triggered, Welt regenerates <span class="text-desc">3</span> Energy.`,
    },
    c3: {
      title: 'E3: Prayer of Peace',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      title: 'E4: Appellation of Justice',
      content: `Base chance for Skill to inflict SPD Reduction increases by <span class="text-desc">35%</span>.`,
    },
    c5: {
      title: `E5: Power of Kindness`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      title: 'E6: Prospect of Glory',
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
      text: `Ult Imprisonment`,
      ...talents.ult,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'welt_tech',
      text: `Technique Imprisonment`,
      ...talents.technique,
      show: true,
      default: true,
      debuff: false,
      chance: { base: 1, fixed: false },
      duration: 1,
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
          break: 30,
          energy: 20,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: `Bounce [x${c >= 6 ? 4 : 3}]`,
          value: [{ scaling: calcScaling(0.36, 0.036, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 30,
          energy: 10,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.9, 0.06, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 60,
          energy: 5,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Additional Damage',
          value: [{ scaling: calcScaling(0.3, 0.03, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
        },
      ]

      if (form.welt_skill) {
        base.SPD_REDUCTION += 0.1
        addDebuff(debuffs, DebuffTypes.SPD_RED)
      }
      if (form.welt_ult) {
        base.SPD_REDUCTION += 0.1
        addDebuff(debuffs, DebuffTypes.SPD_RED)
        addDebuff(debuffs, DebuffTypes.IMPRISON)
      }
      if (form.welt_tech) {
        base.SPD_REDUCTION += 0.1
        addDebuff(debuffs, DebuffTypes.SPD_RED)
        addDebuff(debuffs, DebuffTypes.IMPRISON)
      }
      if (form.welt_a2) {
        base.VULNERABILITY += 0.12
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (a.a6 && broken) base[Stats.ALL_DMG] += 0.2
      if (c >= 1) {
        base.BASIC_SCALING.push({
          name: 'E1 Additional Damage',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear') * 0.5, multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
        })
        base.SKILL_SCALING.push({
          name: 'E1 Additional Damage',
          value: [{ scaling: calcScaling(0.36, 0.036, skill, 'curved') * 0.8, multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
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
      if (form.welt_skill) base.SPD_REDUCTION += 0.1
      if (form.welt_ult) base.SPD_REDUCTION += 0.1
      if (form.welt_tech) base.SPD_REDUCTION += 0.1
      if (form.welt_a2) base.VULNERABILITY += 0.12

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
      const burned = _.sumBy(debuffs, (item) => Number(item.type === DebuffTypes.BURN) * item.count) >= 1
      if (burned && a.a4) base.SKILL_DMG += 0.2

      return base
    },
  }
}

export default Welt
