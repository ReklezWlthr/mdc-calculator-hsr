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

import { toPercentage } from '@src/core/utils/data_format'
import { IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'
import { teamOptionGenerator } from '@src/core/utils/data_format'

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
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Benison of Paper and Rites`,
      content: `Enables one designated ally character and their summon to immediately take action, and increases their DMG dealt by {{0}}%. If the target has a summon, then the dealt DMG increase is further boosted by an additional {{1}}%, lasting for <span class="text-desc">2</span> turn(s).
      <br />After using Skill on <b class="text-hsr-imaginary">The Beatified</b>, recovers <span class="text-desc">1</span> Skill Point.
      <br />When Sunday uses this ability on characters following the Path of Harmony, cannot trigger the "immediate action" effect.`,
      value: [
        { base: 15, growth: 1.5, style: 'curved' },
        { base: 25, growth: 2.5, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.SUPPORT,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Ode to Caress and Cicatrix`,
      content: `Regenerates Energy by <span class="text-desc">20%</span> of Max Energy for one designated ally character, and turns the target and their summon into <b class="text-hsr-imaginary">The Beatified</b>. <b class="text-hsr-imaginary">The Beatified</b> have their CRIT DMG increased by an amount equal to {{0}}% of Sunday's CRIT DMG plus {{1}}%.
      <br />At the start of Sunday's each turn, the duration of <b class="text-hsr-imaginary">The Beatified</b> decreases by <span class="text-desc">1</span> turn, lasting for a total of <span class="text-desc">3</span> turn(s). And it only takes effect on the most recent target of the Ultimate (excluding Sunday himself). When Sunday is knocked down, <b class="text-hsr-imaginary">The Beatified</b> will also be dispelled.`,
      value: [
        { base: 12, growth: 1.8, style: 'curved' },
        { base: 8, growth: 0.4, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.SUPPORT,
    },
    talent: {
      energy: 10,
      trace: 'Talent',
      title: `The Sorrowing Body`,
      content: `When using Skill, increases the target's CRIT Rate by {{0}}%, lasting for <span class="text-desc">3</span> turn(s).`,
      value: [{ base: 10, growth: 1, style: 'curved' }],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    technique: {
      trace: 'Technique',
      title: `The Glorious Mysteries`,
      content: `After this Technique is used, the first time Sunday uses an ability on an ally target in the next battle, the target's DMG dealt increases by <span class="text-desc">50%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
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
      content: `When using Ultimate, if the Energy regenerated for the target is less than <span class="text-desc">40</span>, increases the Energy regenerated to <span class="text-desc">40</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Millennium's Quietus`,
      content: `When Sunday uses his Skill, the target character can ignore <span class="text-desc">16%</span> of enemy target's DEF to deal DMG and their summon can ignore <span class="text-desc">40%</span> of enemy target's DEF to deal DMG, lasting for <span class="text-desc">2</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Faith Outstrips Frailty`,
      content: `After the first use of Ultimate, recovers <span class="text-desc">2</span> Skill Point(s). The DMG dealt by <b class="text-hsr-imaginary">The Beatified</b> increases by <span class="text-desc">30%</span>.`,
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
      content: `When the turn starts, regenerates <span class="text-desc">8</span> Energy.`,
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
      content: `The Talent's CRIT Rate boost effect becomes stackable up to <span class="text-desc">3</span> time(s), and the Talent's duration increases by <span class="text-desc">1</span> turn(s). When Sunday uses Ultimate, can also apply the Talent's CRIT Rate boost effect to the target. When the Talent's CRIT Rate boost takes effect and the target's CRIT Rate exceeds <span class="text-desc">100%</span>, every <span class="text-desc">1%</span> of excess CRIT Rate increases CRIT DMG by <span class="text-desc">2%</span>.`,
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
      type: 'element',
      id: 'sunday_ult',
      text: `The Beatified`,
      ...talents.ult,
      show: true,
      default: '1',
      duration: 3,
      options: _.filter(teamOptionGenerator(team), (item) => item.value !== (index + 1).toString()),
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

  const teammateContent: IContent[] = [findContentById(content, 'sunday_tech'), findContentById(content, 'sunday_ult')]

  const allyContent: IContent[] = [findContentById(content, 'sunday_skill'), findContentById(content, 'sunday_e6')]

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
          base.DEF_PEN.push({
            name: 'Eidolon 1',
            source: 'Self',
            value: 0.16,
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
      broken: boolean,
    ) => {
      if (aForm.sunday_skill) {
        base.CALLBACK.push((x) => {
          x[Stats.ALL_DMG].push({
            name: 'Skill',
            source: 'Sunday',
            value:
              calcScaling(0.15, 0.015, skill, 'curved') +
              (x.SUMMON || x.SUMMON_STATS?.SUMMON_ID ? calcScaling(0.25, 0.025, skill, 'curved') : 0),
          })
          return x
        })
        if (c < 6) {
          base[Stats.CRIT_RATE].push({
            name: 'Talent',
            source: 'Sunday',
            value: calcScaling(0.1, 0.01, skill, 'curved'),
          })
        }
        if (c >= 1) {
          base.DEF_PEN.push({
            name: 'Eidolon 1',
            source: 'Sunday',
            value: 0.16,
          })
          base.SUMMON_DEF_PEN.push({
            name: 'Eidolon 1',
            source: 'Sunday',
            value: 0.24,
          })
          if (base.SUMMON_STATS) {
            base.SUMMON_STATS.DEF_PEN.push({
              name: 'Eidolon 1',
              source: 'Sunday',
              value: 0.4,
            })
          }
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
        const value = {
          name: 'Talent',
          source: 'Sunday',
          value: calcScaling(0.1, 0.01, skill, 'curved') * aForm.sunday_e6,
        }
        base[Stats.CRIT_RATE].push(value)
        if (base.SUMMON_STATS) base.SUMMON_STATS[Stats.CRIT_RATE].push(value)
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
          if (x.SUMMON_STATS) {
            const summonCr = x.SUMMON_STATS.getValue(Stats.CRIT_RATE)
            if (summonCr > 1)
              x[Stats.CRIT_DMG].push({
                name: `Eidolon 6`,
                source: 'Sunday',
                value: (summonCr - 1) * 2,
                multiplier: 2,
                base: toPercentage(summonCr - 1),
              })
          }
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
      broken: boolean,
    ) => {
      _.forEach(team, (t, i) => {
        if (+form.sunday_ult - 1 === i) {
          const multiplier = calcScaling(0.12, 0.018, skill, 'curved')
          t.CALLBACK.push((x, d, w, all) => {
            const value = {
              name: `The Beatified`,
              source: 'Sunday',
              value: calcScaling(0.08, 0.004, skill, 'curved') + multiplier * all[index].getValue(Stats.CRIT_DMG),
              multiplier,
              base: toPercentage(all[index].getValue(Stats.CRIT_DMG)),
              flat: toPercentage(calcScaling(0.08, 0.004, skill, 'curved')),
            }
            x.X_CRIT_DMG.push(value)
            if (x.SUMMON_STATS) x.SUMMON_STATS.X_CRIT_DMG.push(value)
            return x
          })
          if (c >= 2) {
            const value = {
              name: 'Eidolon 2',
              source: 'Sunday',
              value: 0.3,
            }
            t[Stats.ALL_DMG].push(value)
            if (t.SUMMON_STATS) t.SUMMON_STATS[Stats.ALL_DMG].push(value)
          }
        }
      })
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
