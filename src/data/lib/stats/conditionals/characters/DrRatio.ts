import { addDebuff, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const DrRatio = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Mind is Might',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Dr. Ratio's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Intellectual Midwifery',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Dr. Ratio's ATK to a single target enemy.`,
      value: [{ base: 75, growth: 7.5, style: 'curved' }],
      level: skill,
      tag: AbilityTag.ST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Syllogistic Paradox',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Dr. Ratio's ATK to a single target enemy and applies <b>Wiseman's Folly</b>. When Dr. Ratio's allies attack a target afflicted with <b>Wiseman's Folly</b>, Dr. Ratio launches his Talent's <u>follow-up attack</u> for <span class="text-desc">1</span> time against this target.
      <br /><b>Wiseman's Folly</b> can be triggered for up to <span class="text-desc">2</span> times and only affects the most recent target of Dr. Ratio's Ultimate. This trigger count resets after Dr. Ratio's Ultimate is used.`,
      value: [{ base: 144, growth: 9.6, style: 'curved' }],
      level: ult,
      tag: AbilityTag.ST,
    },
    talent: {
      energy: 5,
      trace: 'Talent',
      title: 'Cogito, Ergo Sum',
      content: `When using his Skill, Dr. Ratio has a <span class="text-desc">40%</span> <u>fixed chance</u> of launching a <u>follow-up attack</u> against his target for <span class="text-desc">1</span> time, dealing <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Dr. Ratio's ATK. For each debuff the target enemy has, the <u>fixed chance</u> of launching <u>follow-up attack</u> increases by <span class="text-desc">20%</span>. If the target enemy is defeated before the <u>follow-up attack</u> triggers, the <u>follow-up attack</u> will be directed at a single random enemy instead.`,
      value: [{ base: 135, growth: 13.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ST,
    },
    technique: {
      trace: 'Technique',
      title: 'Mold of Idolatry',
      content: `After using Technique, creates a special dimension that Taunts nearby enemies, lasting for <span class="text-desc">10</span> second(s). After entering battle with enemies in this special dimension, there is a <span class="text-desc">100%</span> <u>base chance</u> to reduce each single enemy target's SPD by <span class="text-desc">15%</span> for <span class="text-desc">2</span> turn(s). Only <span class="text-desc">1</span> dimension created by allies can exist at the same time.`,
      tag: AbilityTag.IMPAIR,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Summation',
      content: `When Dr. Ratio uses his Skill, for every debuff on the target, his CRIT Rate increases by <span class="text-desc">2.5%</span> and CRIT DMG by <span class="text-desc">5%</span>. This effect can stack up to <span class="text-desc">6</span> time(s).`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Inference',
      content: `When Skill is used to attack an enemy target, there is a <span class="text-desc">100%</span> <u>base chance</u> to reduce the attacked target's Effect RES by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Deduction',
      content: `When dealing DMG to a target that has <span class="text-desc">3</span> or more debuff(s), for each debuff the target has, the DMG dealt by Dr. Ratio to this target increases by <span class="text-desc">10%</span>, up to a maximum increase of <span class="text-desc">50%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Pride Comes Before a Fall',
      content: `The maximum stackable count for the Trace "Summation" increases by <span class="text-desc">4</span>. When a battle begins, immediately obtains <span class="text-desc">4</span> stacks of Summation. Needs to unlock Summation first.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'The Divine Is in the Details',
      content: `When his Talent's <u>follow-up attack</u> hits a target, for every debuff the target has, additionally deals <b class="text-hsr-imaginary">Imaginary Additional DMG</b> equal to <span class="text-desc">20%</span> of Dr. Ratio's ATK. This effect can be triggered for a maximum of <span class="text-desc">4</span> time(s) during each <u>follow-up attack</u>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Know Thyself',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Ignorance Is Blight',
      content: `When triggering the Talent, additionally regenerates <span class="text-desc">15</span> Energy for Dr. Ratio.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Sic Itur Ad Astra',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Vincit Omnia Veritas',
      content: `Increases the trigger count for <b>Wiseman's Folly</b> by <span class="text-desc">1</span>. The DMG dealt by the Talent's <u>follow-up attack</u> increases by <span class="text-desc">50%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'ratio_a2',
      text: `Summation Stacks`,
      ...talents.a2,
      show: a.a2,
      default: c >= 1 ? 4 : 0,
      min: c >= 1 ? 4 : 0,
      max: c >= 1 ? 10 : 6,
    },
    {
      type: 'toggle',
      id: 'ratio_a4',
      text: `A4 Effect RES Reduction`,
      ...talents.a4,
      show: a.a4,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'ratio_a4')]

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
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.75, 0.075, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.44, 0.096, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
      ]

      if (form.ratio_a2) {
        base[Stats.CRIT_RATE].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: form.ratio_a2 * 0.025,
        })
        base[Stats.CRIT_DMG].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: form.ratio_a2 * 0.05,
        })
      }
      if (form.ratio_a4) {
        base.E_RES_RED.push({
          name: `Skill`,
          source: 'Self',
          value: 0.1,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (c >= 6)
        base.TALENT_DMG.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.5,
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
      if (form.ratio_a4)
        base.E_RES_RED.push({
          name: `Skill`,
          source: 'Dr. Ratio',
          value: 0.1,
        })

      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      team: StatsObject[],
      allForm: Record<string, any>[]
    ) => {
      base.CALLBACK.push(function N999(x, d) {
        const count = _.sumBy(d, (item) => item.count)
        base.TALENT_SCALING = [
          {
            name: 'Skill DMG',
            value: [{ scaling: calcScaling(1.35, 0.135, talent, 'curved'), multiplier: Stats.ATK }],
            element: Element.IMAGINARY,
            property: TalentProperty.FUA,
            type: TalentType.TALENT,
            break: 10,
            chance: { base: _.min([0.4 + count * 0.2, 1]), fixed: true },
            sum: true,
          },
        ]
        if (a.a6 && count >= 3)
          base[Stats.ALL_DMG].push({
            name: `Ascension 6 Passive`,
            source: 'Self',
            value: _.min([0.1 * count, 0.5]),
          })
        if (c >= 2 && count)
          base.TALENT_SCALING.push({
            name: 'Additional DMG per Debuff',
            value: [{ scaling: 0.2 * count, multiplier: Stats.ATK }],
            element: Element.IMAGINARY,
            property: TalentProperty.ADD,
            type: TalentType.NONE,
            sum: true,
          })
        return x
      })
      return base
    },
  }
}

export default DrRatio
