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

const Sunday = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1313')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Gleaming Admonition`,
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Sunday's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Benison of Paper and Rites`,
      content: `Causes one designated ally character and their summon to immediately take action, and increases their DMG dealt by {{0}}%. If the target has a summon, then DMG additionally increases by {{0}}%, lasting for <span class="text-desc">2</span> turn(s).
      <br />When Sunday uses this ability on characters following the Path of Harmony, the "immediate action" effect cannot be triggered.`,
      value: [{ base: 20, growth: 2, style: 'curved' }],
      level: skill,
      tag: AbilityTag.SUPPORT,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Ode to Caress and Cicatrix`,
      content: `Regenerates Energy by <span class="text-desc">20%</span> of Max Energy for one designated ally character and turns the target and their summon into <b class="text-hsr-imaginary">The Beatified</b>. <b class="text-hsr-imaginary">The Beatified</b> have their CRIT DMG increased by an amount equal to {{0}}% of Sunday's CRIT DMG plus {{1}}%.
      <br />At the start of Sunday's each turn, reduces the duration of <b class="text-hsr-imaginary">The Beatified</b> by <span class="text-desc">1</span> turn, lasting for a total of <span class="text-desc">3</span> turn(s). And it only takes effect on the most recent target of the Ultimate (excluding Sunday himself). When Sunday becomes downed, <b class="text-hsr-imaginary">The Beatified</b> will also be dispelled.`,
      value: [
        { base: 10, growth: 1.5, style: 'curved' },
        { base: 6.4, growth: 0.16, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.SUPPORT,
    },
    talent: {
      energy: 10,
      trace: 'Talent',
      title: `The Sorrowing Body`,
      content: `When using Skill, increases the target's CRIT Rate by {{0}}%. This effect lasts for <span class="text-desc">2</span> turn(s).`,
      value: [{ base: 10, growth: 1, style: 'curved' }],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    technique: {
      trace: 'Technique',
      title: `The Glorious Mysteries`,
      content: `After using Technique, at the start of the next battle, increases all ally targets' DMG by <span class="text-desc">50%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
      tag: AbilityTag.SUPPORT,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Haven in Palm`,
      content: `When using Skill, dispels <span class="text-desc">1</span> debuff(s) from the target.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Exalted Sweep`,
      content: `When battle starts, Sunday regenerates <span class="text-desc">25</span> Energy.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Rest Day's Longing`,
      content: `Using Skill will not consume Skill Points. This effect can be triggered again after <span class="text-desc">2</span> turn(s).`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Millennium's Quietus`,
      content: `When Sunday uses Skill, increases the target's All-Type RES PEN by <span class="text-desc">20%</span>, lasting for <span class="text-desc">1</span> turn(s). And this effect will last until the start of the target's next turn.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Faith Outstrips Frailty`,
      content: `While <b class="text-hsr-imaginary">The Beatified</b> exists on the field, increases the SPD of Sunday and <b class="text-hsr-imaginary">The Beatified</b> by <span class="text-desc">20</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Hermitage of Thorns`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Sculpture's Preamble`,
      content: `At the start of the turn, regenerates <span class="text-desc">8</span> Energy.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Paper Raft in Silver Bay`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Dawn of Sidereal Cacophony`,
      content: `The Talent's CRIT Rate boost effect becomes stackable up to <span class="text-desc">3</span> time(s). When Sunday uses Ultimate, he also applies the Talent's CRIT Rate boost effect to the target. When the Talent's CRIT Rate boost takes effect and the target's CRIT Rate exceeds <span class="text-desc">100%</span>, every <span class="text-desc">1%</span> of excess CRIT Rate is converted to <span class="text-desc">2%</span> CRIT DMG.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'sunday_skill',
      text: `Benison of Paper and Rites`,
      ...talents.skill,
      show: true,
      default: false,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'sunday_ult',
      text: `The Beatified`,
      ...talents.ult,
      show: true,
      default: false,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'sunday_tech',
      text: `The Glorious Mysteries`,
      ...talents.technique,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'number',
      id: 'sunday_e6',
      text: `E6 CRIT Rate Stacks`,
      ...talents.skill,
      show: c >= 6,
      default: 1,
      min: 0,
      max: 3,
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'sunday_tech')]

  const allyContent: IContent[] = [
    findContentById(content, 'sunday_skill'),
    findContentById(content, 'sunday_ult'),
    findContentById(content, 'sunday_e6'),
  ]

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

      if (form.sunday_skill) {
        base[Stats.ALL_DMG].push({
          name: 'Skill',
          source: 'Self',
          value: calcScaling(0.2, 0.02, skill, 'curved'),
        })
        if (c < 6) {
          base[Stats.CRIT_RATE].push({
            name: 'Talent',
            source: 'Self',
            value: calcScaling(0.1, 0.01, skill, 'curved'),
          })
        }
        if (c >= 1) {
          base.ALL_TYPE_RES_PEN.push({
            name: 'Eidolon 1',
            source: 'Self',
            value: 0.2,
          })
        }
      }
      if (form.sunday_tech) {
        base[Stats.ALL_DMG].push({
          name: 'Technique',
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
      if (aForm.sunday_skill) {
        base[Stats.ALL_DMG].push({
          name: 'Skill',
          source: 'Sunday',
          value: calcScaling(0.2, 0.02, skill, 'curved') * (base.SUMMON ? 2 : 1),
        })
        if (c < 6) {
          base[Stats.CRIT_RATE].push({
            name: 'Talent',
            source: 'Sunday',
            value: calcScaling(0.1, 0.01, skill, 'curved'),
          })
        }
        if (c >= 1) {
          base.ALL_TYPE_RES_PEN.push({
            name: 'Eidolon 1',
            source: 'Sunday',
            value: 0.2,
          })
        }
      }
      if (aForm.sunday_ult) {
        const multiplier = calcScaling(0.1, 0.015, skill, 'curved')
        base.CALLBACK.push((x, d, w, all) => {
          x.X_CRIT_DMG.push({
            name: `The Beatified`,
            source: 'Sunday',
            value: calcScaling(0.064, 0.0016, skill, 'curved') + multiplier * all[index].getValue(Stats.CRIT_DMG),
            multiplier,
            base: toPercentage(all[index].getValue(Stats.CRIT_DMG)),
            flat: toPercentage(calcScaling(0.064, 0.0016, skill, 'curved')),
          })
          return x
        })
        if (c >= 2) {
          base[Stats.SPD].push({
            name: 'Skill',
            source: 'Sunday',
            value: 20,
          })
        }
      }
      if (form.sunday_tech) {
        base[Stats.ALL_DMG].push({
          name: 'Technique',
          source: 'Sunday',
          value: 0.5,
        })
      }
      if (aForm.sunday_e6) {
        base[Stats.CRIT_RATE].push({
          name: 'Talent',
          source: 'Sunday',
          value: calcScaling(0.1, 0.01, skill, 'curved') * aForm.sunday_e6,
        })
        base.CALLBACK.push((x) => {
          const cr = x.getValue(Stats.CRIT_RATE)
          if (cr > 1)
            x[Stats.CRIT_DMG].push({
              name: `Eidolon 6`,
              source: 'Sunday',
              value: (cr - 1) * 2,
              multiplier: 2,
              base: toPercentage(cr - 1),
            })
          return x
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
      if (form.sunday_ult) {
        const multiplier = calcScaling(0.1, 0.015, skill, 'curved')
        base.CALLBACK.push((x, d, w, all) => {
          x.X_CRIT_DMG.push({
            name: `The Beatified`,
            source: 'Self',
            value: calcScaling(0.064, 0.0016, skill, 'curved') + multiplier * x.getValue(Stats.CRIT_DMG),
            multiplier,
            base: toPercentage(x.getValue(Stats.CRIT_DMG)),
            flat: toPercentage(calcScaling(0.064, 0.0016, skill, 'curved')),
          })
          return x
        })
      }
      if (_.some(allForm, (item) => item.sunday_ult) && c >= 2) {
        base[Stats.SPD].push({
          name: 'Skill',
          source: 'Self',
          value: 20,
        })
      }
      if (form.sunday_e6) {
        base[Stats.CRIT_RATE].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.1, 0.01, skill, 'curved') * form.sunday_e6,
        })
        base.CALLBACK.push((x) => {
          const cr = x.getValue(Stats.CRIT_RATE)
          if (cr > 1)
            x[Stats.CRIT_DMG].push({
              name: `Eidolon 6`,
              source: 'Self',
              value: (cr - 1) * 2,
              multiplier: 2,
              base: toPercentage(cr - 1),
            })
          return x
        })
      }

      return base
    },
  }
}

export default Sunday
