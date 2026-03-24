import { addDebuff, countDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/data_format'
import { IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
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
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Welt's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Edge of the Void',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Welt's ATK to a single enemy and further deals DMG <span class="text-desc">4</span> extra times, with each time dealing <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Welt's ATK to one random enemy. On hit, there is a {{1}}% <u>base chance</u> to reduce the enemy's SPD by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turn(s).`,
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
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Welt's ATK to all enemies. Has a <span class="text-desc">100%</span> <u>base chance</u> to <b class="text-hsr-imaginary">Imprison</b> hit enemy targets for <span class="text-desc">1</span> turn.
      <br />While <b class="text-hsr-imaginary">Imprisoned</b>, enemy targets have their actions delayed by {{1}}% and their SPD reduced by <span class="text-desc">10%</span>. After using his Ultimate, inflicts the <b class="text-amber-500">Weightless</b> state on all enemies. When targets in <b class="text-amber-500">Weightless</b> state are attacked, their actions are delayed by <span class="text-desc">4%</span>. This effect can trigger up to <span class="text-desc">8</span> time(s) per target per turn. <b class="text-amber-500">Weightless</b> lasts for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 138, growth: 9.2, style: 'curved' },
        { base: 6, growth: 0.6, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: 'Time Distortion',
      content: `Enemy targets in the <b class="text-amber-500">Weightless</b> state have their DEF reduced by <span class="text-desc">40%</span>. When hitting an enemy that is already <b>Slowed</b>, Welt deals <b class="text-hsr-imaginary">Imaginary Additional DMG</b> equal to {{0}}% of his ATK to the enemy.`,
      value: [{ base: 50, growth: 5, style: 'curved' }],
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
      content: `When using Ultimate, there is a <span class="text-desc">100%</span> <u>base chance</u> to increase the DMG received by the targets by <span class="text-desc">35%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Judgment',
      content: `When Welt uses Basic ATK or Skill, additionally deals <span class="text-desc">1</span> extra instance of Additional DMG to the enemy target. The Additional DMG dealt when using Basic ATK is equal to <span class="text-desc">80%</span> of Basic ATK DMG multiplier. The Additional DMG dealt when using Skill is equal to <span class="text-desc">120%</span> of Skill DMG multiplier.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Punishment',
      content: `When Welt's Effect Hit Rate is greater than <span class="text-desc">40%</span>, for every <span class="text-desc">10%</span> that exceeds this value, increases ATK by <span class="text-desc">20%</span>, up to a maximum increase of <span class="text-desc">80%</span>. When using Ultimate, additionally restores <span class="text-desc">5</span> Energy.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Legacy of Honor',
      content: `After using a Skill or Ultimate to hit a target in the <b class="text-amber-500">Weightless</b> state, deals <span class="text-desc">1</span> additional instance of <b class="text-hsr-imaginary">Imaginary Additional DMG</b> equal to <span class="text-desc">40%</span> of the Ultimate's DMG multiplier. This effect can only be triggered once per target per attack.`,
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
      content: `When using a Skill or Ultimate to hit an enemy target in the Slow state, increases CRIT Rate by <span class="text-desc">20%</span> and CRIT DMG by <span class="text-desc">50%</span>.`,
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
      content: `Enemy targets in the <b class="text-amber-500">Weightless</b> state have their <b>All-Type RES</b> reduced by <span class="text-desc">30%</span>.`,
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
      chance: { base: calcScaling(0.65, 0.01, skill, 'curved'), fixed: false },
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
    {
      type: 'toggle',
      id: 'weightless',
      text: `Weightless`,
      ...talents.talent,
      show: true,
      default: true,
      debuff: true,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'welt_skill'),
    findContentById(content, 'welt_ult'),
    findContentById(content, 'welt_a2'),
    findContentById(content, 'weightless'),
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
      broken: boolean,
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
          chance: { base: calcScaling(0.65, 0.01, skill, 'curved'), fixed: false },
        },
        {
          name: `Max Single Target DMG`,
          value: [{ scaling: calcScaling(0.36, 0.036, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          multiplier: 5,
          break: 50,
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
          chance: { base: 1, fixed: false },
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Additional Damage',
          value: [{ scaling: calcScaling(0.5, 0.05, talent, 'curved'), multiplier: Stats.ATK }],
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
          value: 0.35,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.weightless) {
        base.DEF_REDUCTION.push({
          name: `Talent`,
          source: 'Self',
          value: 0.4,
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
        if (c >= 6) {
          base.ALL_TYPE_RES_RED.push({
            name: `Eidolon 6`,
            source: 'Self',
            value: 0.3,
          })
          addDebuff(debuffs, DebuffTypes.OTHER)
        }
      }
      if (a.a4) {
        base.BASIC_SCALING.push({
          name: 'A4 Additional DMG',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear') * 0.8, multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
          sum: true,
        })
        base.SKILL_SCALING.push(
          {
            name: 'A4 Additional DMG',
            value: [{ scaling: calcScaling(0.36, 0.036, skill, 'curved') * 1.2, multiplier: Stats.ATK }],
            element: Element.IMAGINARY,
            property: TalentProperty.ADD,
            type: TalentType.NONE,
          },
          {
            name: `A4 Max Single Target Additional DMG`,
            value: [{ scaling: calcScaling(0.36, 0.036, skill, 'curved') * 1.2, multiplier: Stats.ATK }],
            element: Element.IMAGINARY,
            property: TalentProperty.ADD,
            type: TalentType.NONE,
            multiplier: 5,
            sum: true,
          },
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
      broken: boolean,
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
      if (form.weightless) {
        base.DEF_REDUCTION.push({
          name: `Talent`,
          source: 'Welt',
          value: 0.4,
        })
        if (c >= 6) {
          base.ALL_TYPE_RES_RED.push({
            name: `Eidolon 6`,
            source: 'Welt',
            value: 0.3,
          })
        }
      }
      if (form.welt_a2)
        base.VULNERABILITY.push({
          name: `Ascension 2 Passive`,
          source: 'Welt',
          value: 0.35,
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
      broken: boolean,
    ) => {
      if (a.a6) {
        base.CALLBACK.push((base, _d, _w, a) => {
          const ehr = base.getValue(Stats.EHR)
          if (ehr > 0.4) {
            base[Stats.P_ATK].push({
              name: 'Ascension 6 Passive',
              source: 'Self',
              value: _.min([(ehr - 0.4) * 2, 0.8]),
              base: toPercentage(_.min([ehr - 0.4, 0.4])),
              multiplier: 2,
            })
          }
          if (countDebuff(debuffs, DebuffTypes.SPD_RED) || countDebuff(debuffs, DebuffTypes.IMPRISON)) {
            const add = {
              name: 'Talent Additional DMG',
              value: [{ scaling: calcScaling(0.5, 0.05, talent, 'curved'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.ADD,
              type: TalentType.NONE,
              sum: true,
            }
            base.BASIC_SCALING.push(add)
            base.SKILL_SCALING.push(
              { ...add, sum: false },
              {
                ...add,
                name: `Talent Max Single Target Additional DMG`,
                multiplier: 5,
                sum: true,
              },
            )
            base.ULT_SCALING.push(add)
            if (c >= 4) {
              base.SKILL_CR.push({
                name: `Eidolon 4`,
                source: 'Self',
                value: 0.2,
              })
              base.ULT_CR.push({
                name: `Eidolon 4`,
                source: 'Self',
                value: 0.2,
              })
              base.SKILL_CD.push({
                name: `Eidolon 4`,
                source: 'Self',
                value: 0.5,
              })
              base.ULT_CD.push({
                name: `Eidolon 4`,
                source: 'Self',
                value: 0.5,
              })
            }
          }
          if (form.weightless && c >= 1) {
            const add = {
              name: 'E1 Additional DMG',
              value: [{ scaling: calcScaling(0.9, 0.06, ult, 'curved') * 0.4, multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.ADD,
              type: TalentType.NONE,
              sum: true,
            }
            base.SKILL_SCALING.push(add)
            base.ULT_SCALING.push(add)
          }
          return base
        })
      }
      return base
    },
  }
}

export default Welt
