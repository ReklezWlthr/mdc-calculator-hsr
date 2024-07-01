import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Bronya = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const index = _.findIndex(team, (item) => item?.cId === '1101')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Windrider Bullet',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Bronya's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Combat Redeployment',
      content: `Dispels a debuff from a single ally, allows them to immediately take action, and increases their DMG by {{0}}% for <span class="text-desc">1</span> turn(s).
      <br />When this Skill is used on Bronya herself, she cannot immediately take action again.`,
      value: [{ base: 33, growth: 3.3, style: 'curved' }],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `The Belobog March`,
      content: `Increases the ATK of all allies by {{0}}%, and increases their CRIT DMG equal to {{1}}% of Bronya's CRIT DMG plus {{2}}% for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 33, growth: 2.2, style: 'curved' },
        { base: 12, growth: 0.4, style: 'curved' },
        { base: 12, growth: 0.8, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Leading the Way`,
      content: `After using her Basic ATK, Bronya's next action will be Advanced Forward by {{0}}%.`,
      value: [{ base: 15, growth: 1.5, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'Banner of Command',
      content: `After using Bronya's Technique, at the start of the next battle, all allies' ATK increases by <span class="text-desc">15%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Command`,
      content: `The CRIT Rate for Basic ATK increases to <span class="text-desc">100%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Battlefield`,
      content: `At the start of the battle, all allies' DEF increases by <span class="text-desc">20%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Military Might`,
      content: `When Bronya is on the field, all allies deal <span class="text-desc">10%</span> more DMG.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Hone Your Strength`,
      content: `When using Skill, there is <span class="text-desc">50%</span> <u>fixed chance</u> of recovering <span class="text-desc">1</span> Skill Point. This effect has a <span class="text-desc">1</span>-turn cooldown.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Quick March`,
      content: `When using Skill, the target ally's SPD increases by <span class="text-desc">30%</span> after taking action, lasting for <span class="text-desc">1</span> turn.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Bombardment`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      energy: 5,
      trace: 'Eidolon 4',
      title: 'Take by Surprise',
      content: `After an ally other than Bronya uses Basic ATK on an enemy with <b class="text-hsr-wind">Wind</b> Weakness, Bronya immediately launches a follow-up attack on the target, dealing <b class="text-hsr-wind">Wind DMG</b> equal to <span class="text-desc">80%</span> of Bronya's Basic ATK DMG. This effect can only be triggered <span class="text-desc">1</span> time per turn.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Unstoppable`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Piercing Rainbow',
      content: `The duration of the DMG Boost effect placed by the Skill on the target ally increases by <span class="text-desc">1</span> turn(s).`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'bronya_skill',
      text: `Combat Redeployment`,
      ...talents.skill,
      show: true,
      default: false,
      duration: c >= 6 ? 2 : 1,
    },
    {
      type: 'toggle',
      id: 'bronya_ult',
      text: `The Belobog March`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'bronya_tech',
      text: `Banner of Command`,
      ...talents.technique,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'bronya_a4',
      text: `A4 Team DEF Bonus`,
      ...talents.a4,
      show: a.a4,
      default: true,
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'bronya_ult'),
    findContentById(content, 'bronya_tech'),
    findContentById(content, 'bronya_a4'),
  ]

  const allyContent: IContent[] = [findContentById(content, 'bronya_skill')]

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
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          energy: 20,
        },
      ]

      if (a.a2)
        base.BASIC_CR.push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 1,
        })
      if (form.bronya_skill) {
        base[Stats.ALL_DMG].push({
          name: `Skill`,
          source: 'Self',
          value: calcScaling(0.33, 0.033, skill, 'curved'),
        })
        if (c >= 2)
          base[Stats.P_SPD].push({
            name: `Skill (Eidolon 2)`,
            source: 'Self',
            value: 0.3,
          })
      }
      if (form.bronya_ult)
        base[Stats.P_ATK].push({
          name: `Ultimate`,
          source: 'Self',
          value: calcScaling(0.33, 0.022, ult, 'curved'),
        })
      if (form.bronya_tech)
        base[Stats.P_ATK].push({
          name: `Technique`,
          source: 'Self',
          value: 0.15,
        })
      if (form.bronya_a4)
        base[Stats.P_DEF].push({
          name: `Ascension 4 Passive`,
          source: 'Self',
          value: 0.2,
        })
      if (a.a6)
        base[Stats.ALL_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.1,
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
      if (aForm.bronya_skill) {
        base[Stats.ALL_DMG].push({
          name: `Skill`,
          source: 'Bronya',
          value: calcScaling(0.33, 0.033, skill, 'curved'),
        })
        if (c >= 2)
          base[Stats.P_SPD].push({
            name: `Skill (Eidolon 2)`,
            source: 'Bronya',
            value: 0.3,
          })
        console.log(base)
      }
      if (form.bronya_tech)
        base[Stats.P_ATK].push({
          name: `Technique`,
          source: 'Bronya',
          value: 0.15,
        })
      if (form.bronya_a4)
        base[Stats.P_DEF].push({
          name: `Ascension 4 Passive`,
          source: 'Bronya',
          value: 0.2,
        })
      if (a.a6)
        base[Stats.ALL_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Bronya',
          value: 0.1,
        })
      if (form.bronya_ult) {
        base[Stats.P_ATK].push({
          name: `Ultimate`,
          source: 'Bronya',
          value: calcScaling(0.33, 0.022, ult, 'curved'),
        })
        base.CALLBACK.push((x, d, w, all) => {
          x.X_CRIT_DMG.push({
            name: `Ultimate`,
            source: 'Bronya',
            value:
              calcScaling(0.12, 0.008, ult, 'curved') +
              calcScaling(0.12, 0.004, ult, 'curved') * all[index].getValue(Stats.CRIT_DMG),
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
      if (form.bronya_ult) {
        base.X_CRIT_DMG.push({
          name: `Ultimate`,
          source: 'Self',
          value:
            calcScaling(0.12, 0.008, ult, 'curved') +
            calcScaling(0.12, 0.004, ult, 'curved') * base.getValue(Stats.CRIT_DMG),
        })
      }
      if (_.includes(weakness, Element.WIND) && c >= 4)
        base.SKILL_SCALING.push({
          name: 'E4 Follow-Up',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear') * 0.8, multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.FUA,
          type: TalentType.NONE,
          break: 10,
          energy: 5,
        })

      return base
    },
  }
}

export default Bronya
