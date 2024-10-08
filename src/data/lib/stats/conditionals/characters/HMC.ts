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

const HMC = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '8005')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Swing Dance Etiquette`,
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of the Trailblazer's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: c >= 6 ? 42 : 30,
      trace: 'Skill',
      title: `Halftime to Make It Rain`,
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of the Trailblazer's ATK to a single target enemy and additionally deals DMG for <span class="text-desc">4</span> times, with each time dealing <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of the Trailblazer's ATK to a random enemy.`,
      value: [{ base: 25, growth: 2.5, style: 'curved' }],
      level: skill,
      tag: AbilityTag.BOUNCE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `All-Out Footlight Parade`,
      content: `Grants all allies the <b class="text-hsr-imaginary">Backup Dancer</b> effect, lasting for <span class="text-desc">3</span> turn(s). This duration reduces by <span class="text-desc">1</span> at the start of Trailblazer's every turn. Allies that have the <b class="text-hsr-imaginary">Backup Dancer</b> effect have their Break Effect increased by {{0}}%. And when they attack enemy targets that are in the Weakness Broken state, the Toughness Reduction of this attack will be converted into <span class="text-desc">1</span> instance of Super Break DMG.`,
      value: [{ base: 15, growth: 1.5, style: 'curved' }],
      level: ult,
      tag: AbilityTag.SUPPORT,
    },
    talent: {
      trace: 'Talent',
      title: `Full-on Aerial Dance`,
      content: `The Trailblazer immediately regenerates {{0}} Energy when an enemy target's Weakness is Broken.`,
      value: [{ base: 5, growth: 0.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    technique: {
      trace: 'Technique',
      title: `Now! I'm the Band!`,
      content: `After the Technique is used, at the start of the next battle, all allies' Break Effect increases by <span class="text-desc">30%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
      tag: AbilityTag.SUPPORT,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Dance With the One`,
      content: `When the number of enemy targets on the field is <span class="text-desc">5</span> or more/<span class="text-desc">4</span>/<span class="text-desc">3</span>/<span class="text-desc">2</span>/<span class="text-desc">1</span>, the Super Break DMG triggered by the <b class="text-hsr-imaginary">Backup Dancer</b> effect increases by <span class="text-desc">20%</span>/<span class="text-desc">30%</span>/<span class="text-desc">40%</span>/<span class="text-desc">50%</span>/<span class="text-desc">60%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Shuffle Along`,
      content: `When using Skill, additionally increases the Toughness Reduction of the first instance of DMG by <span class="text-desc">100%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Hat of the Theater`,
      content: `Additionally delays the enemy target's action by <span class="text-desc">30%</span> when allies Break enemy Weaknesses.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Best Seat in the House`,
      content: `After using Skill for the first time, immediately recovers <span class="text-desc">1</span> Skill Point(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Jailbreaking Rainbowwalk`,
      content: `When the battle starts, the Trailblazer's Energy Regeneration Rate increases by <span class="text-desc">25%</span>, lasting for <span class="text-desc">3</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Sanatorium for Rest Notes`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Dove in Tophat`,
      content: `While the Trailblazer is on the field, increases the Break Effect of all teammates (excluding the Trailblazer), by an amount equal to <span class="text-desc">15%</span> of the Trailblazer's Break Effect.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Poem Favors Rhythms of Old`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Tomorrow, Rest in Spotlight`,
      content: `The number of additional DMG applications by the Skill increases by <span class="text-desc">2</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'backup_dancer',
      text: `Backup Dancer`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'hmc_tech',
      text: `Technique Break Effect Bonus`,
      ...talents.technique,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'number',
      id: 'hmc_a2',
      text: `Enemies on Field`,
      ...talents.a2,
      show: a.a2,
      default: 5,
      min: 1,
      max: 5,
    },
    {
      type: 'toggle',
      id: 'hmc_c2',
      text: `E2 Energy Regen Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      duration: 3,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'backup_dancer'),
    findContentById(content, 'hmc_tech'),
    findContentById(content, 'hmc_a2'),
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
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'First Hit',
          value: [{ scaling: calcScaling(0.25, 0.025, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: a.a4 ? 20 : 10,
        },
        {
          name: `Bounce`,
          value: [{ scaling: calcScaling(0.25, 0.025, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 5,
        },
        {
          name: `Max Single Target DMG`,
          value: [{ scaling: calcScaling(0.25, 0.025, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          multiplier: c >= 6 ? 7 : 5,
          break: (a.a4 ? 20 : 10) + (c >= 6 ? 6 : 4) * 5,
          sum: true,
        },
      ]

      if (form.backup_dancer) {
        base[Stats.BE].push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.15, 0.015, ult, 'curved'),
        })
        base.SUPER_BREAK = true
        base.SUPER_BREAK_MULT.push({
          name: 'Ultimate',
          source: 'Self',
          value: 1 + (form.hmc_a2 ? 0.7 - 0.1 * form.hmc_a2 : 0),
        })
      }
      if (form.hmc_tech)
        base[Stats.BE].push({
          name: 'Technique',
          source: 'Self',
          value: 0.3,
        })
      if (form.hmc_c2)
        base[Stats.ERR].push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.25,
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
      if (form.backup_dancer) {
        base[Stats.BE].push({
          name: 'Ultimate',
          source: 'Trailblazer',
          value: calcScaling(0.15, 0.015, ult, 'curved'),
        })
        base.SUPER_BREAK = true
        base.SUPER_BREAK_MULT.push({
          name: 'Ultimate',
          source: 'Trailblazer',
          value: 1 + (form.hmc_a2 ? 0.7 - 0.1 * form.hmc_a2 : 0),
        })
      }
      if (form.hmc_tech)
        base[Stats.BE].push({
          name: 'Technique',
          source: 'Trailblazer',
          value: 0.3,
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
      if (c >= 4)
        _.forEach(team, (t, i) => {
          if (index !== i)
            t[Stats.BE].push({
              name: 'Eidolon 4',
              source: 'Trailblazer',
              value: 0.15 * base.getValue(Stats.BE),
              base: toPercentage(base.getValue(Stats.BE)),
              multiplier: 0.15,
            })
        })
      return base
    },
  }
}

export default HMC
