import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
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

const Anaxa = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  let globalImplant = []
  const eruditionCount = _.filter(team, (m) => findCharacter(m.cId)?.path === PathType.ERUDITION).length

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Torment Brews Truth',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Anaxa's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Fractal Banishes Falsehoods',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Anaxa's ATK to one designated enemy and additionally deals <span class="text-desc">4</span> instance(s) of DMG. Each instance of DMG deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Anaxa's ATK to one random enemy, prioritizing Bouncing to enemy targets that have not been hit in this usage of Skill.`,
      value: [{ base: 30, growth: 3, style: 'curved' }],
      level: skill,
      tag: AbilityTag.BOUNCE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Genesis of Budding Life',
      content: `Inflicts the <b class="text-lime-400">Sublimation</b> state to all enemy units and immediately deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Anaxa's ATK to all enemy units.
      <br />In the <b class="text-lime-400">Sublimation</b> state, targets will be simultaneously inflicted with <b class="text-hsr-physical">Physical</b>, <b class="text-hsr-fire">Fire</b>, <b class="text-hsr-ice">Ice</b>, <b class="text-hsr-lightning">Lightning</b>, <b class="text-hsr-wind">Wind</b>, <b class="text-hsr-quantum">Quantum</b>, and <b class="text-hsr-imaginary">Imaginary</b> Weaknesses for <span class="text-desc">1</span> turn. If the targets do not have Control RES, they are unable to take action in <b class="text-lime-400">Sublimation</b> state.`,
      value: [{ base: 90, growth: 6, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: 'Tetrad Wisdom, Trinity Supreme',
      content: `Each time Anaxa attacks enemy targets <span class="text-desc">1</span> time, inflicts <span class="text-desc">1</span> random Type Weakness to the targets, lasting for <span class="text-desc">3</span> turn(s) with priority to the Weakness Type that the target has yet to have.
      <br />When Anaxa is on the battlefield, he inflicts the <b class="text-red">Exposed Nature</b> state to enemy targets with at least <span class="text-desc">5</span> different Type Weaknesses. Anaxa deals {{0}}% more DMG to targets in <b class="text-red">Exposed Nature</b> state. In addition, using a Basic ATK or Skill on targets in <b class="text-red">Exposed Nature</b> state allows him to use another <span class="text-desc">1</span> instance of his Skill. This additional Skill does not consume any Skill Point and cannot trigger this effect again. If the target has been defeated before this additional Skill is used, it will be dealt to a random enemy unit.`,
      value: [{ base: 36, growth: 2.4, style: 'curved' }],
      level: talent,
      tag: AbilityTag.IMPAIR,
    },
    technique: {
      trace: 'Technique',
      title: 'Hue of the Opened Pupil',
      content: `Using the Technique will cause enemies in a set area to enter the Terrified state. Terrified enemies will flee in a direction away from Anaxa for <span class="text-desc">10</span> second(s). If entering battle via actively attacking a Terrified enemy, Anaxa will apply <span class="text-desc">1</span> Weakness of the attacker's Type to every enemy target after entering battle, lasting for <span class="text-desc">3</span> turn(s).`,
      tag: AbilityTag.IMPAIR,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'The Wandering Signifier',
      content: `When using Basic ATK, additionally regenerates <span class="text-desc">10</span> Energy.
      <br />At the start of the turn, if there are no enemy targets in <b class="text-red">Exposed Nature</b> state, immediately regenerates <span class="text-desc">30</span> Energy.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'The Necessary Blankness',
      content: `Based on the number of characters on the path of Erudition in the team, triggers the corresponding effects in the current battle:
      <br /><span class="text-desc">1</span>: Increases Anaxa's CRIT DMG by <span class="text-desc">140%</span>.
      <br /><span class="text-desc">2</span> and more: Increases DMG dealt by all allies by <span class="text-desc">30%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'The Transmuted Quality',
      content: `For every different Weakness Type an enemy target has, the DMG that Anaxa deals to that target ignores <span class="text-desc">3%</span> of DEF, up to a max of <span class="text-desc">7</span> Weakness Types.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Star-Concealing Moon's Magician`,
      content: `After using Skill for the first time, recovers <span class="text-desc">1</span> Skill Point(s). When any enemy targets are hit by this unit's Skill, decreases the targets' DEF by <span class="text-desc">16%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `True History's Natural Person`,
      content: `Ultimate additionally deals <span class="text-desc">3</span> instance(s) of DMG, with each instance dealing <b class="text-hsr-wind">Wind DMG</b> equal to <span class="text-desc">50%</span> of Anaxa's ATK to one random enemy. Increases this unit's SPD by <span class="text-desc">12%</span> for <span class="text-desc">2</span> turn(s) after using their Ultimate.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Void-Etched Iris',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Valley-Fallen Blaze',
      content: `When using Skill, increases ATK by <span class="text-desc">40%</span> for <span class="text-desc">2</span> turn(s). This effect can stack up to <span class="text-desc">3</span> time(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Embryo Beyond the Centrifugal Spiral',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'All Things Are Within Everything',
      content: `Each instance of inflicting the <b class="text-lime-400">Sublimation</b> state in a single battle permanently increases Anaxa's DMG dealt in that battle, with the increase value equal to <span class="text-desc">3%</span> of the original DMG, up to <span class="text-desc">5</span> stacks.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'multiple',
      id: 'anaxa_implant',
      text: `Weakness Implant`,
      ...talents.talent,
      show: true,
      default: [],
      options: _.map(
        _.filter(Element, (item) => item !== Element.NONE),
        (item) => ({ name: item, value: item })
      ),
      duration: 3,
      debuff: true,
    },
    {
      type: 'toggle',
      id: 'sublimation',
      text: `Sublimation`,
      ...talents.ult,
      show: true,
      default: false,
      duration: 1,
      debuff: true,
    },
    {
      type: 'toggle',
      id: 'anaxa_c1',
      text: `E1 DEF Reduction`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      duration: 2,
      debuff: true,
    },
    {
      type: 'toggle',
      id: 'anaxa_c2',
      text: `E2 SPD Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      duration: 2,
    },
    {
      type: 'number',
      id: 'anaxa_c4',
      text: `E4 ATK Bonus Stacks`,
      ...talents.c4,
      show: c >= 4,
      default: 1,
      min: 0,
      max: 3,
      duration: 2,
    },
    {
      type: 'number',
      id: 'anaxa_c6',
      text: `E6 DMG Multiplier Bonus`,
      ...talents.c6,
      show: c >= 6,
      default: 1,
      min: 0,
      max: 5,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'anaxa_implant'),
    findContentById(content, 'sublimation'),
    findContentById(content, 'anaxa_c1'),
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

      const multiplier = form.anaxa_c6 ? 1 + form.anaxa_c6 * 0.03 : 1

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
          multiplier,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Total Single Target DMG',
          value: [{ scaling: calcScaling(0.3, 0.03, skill, 'curved'), multiplier: Stats.ATK }],
          multiplier: 5 * multiplier,
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 50,
          sum: true,
        },
        {
          name: 'Bounce DMG',
          value: [{ scaling: calcScaling(0.3, 0.03, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          sum: false,
          multiplier,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.9, 0.06, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
          multiplier,
        },
      ]
      base.TECHNIQUE_SCALING = []

      if (_.size(form.anaxa_implant)) {
        const newImplant = _.filter<Element>(form.anaxa_implant, (item) => !_.includes(weakness, item))
        weakness.push(...newImplant)
        _.forEach(newImplant, (item) =>
          base.ADD_DEBUFF.push({
            name: `${item} Weakness Implant`,
            source: 'Self',
          })
        )
        globalImplant = newImplant
        addDebuff(debuffs, DebuffTypes.OTHER, _.size(newImplant))
      }
      if (form.sublimation) {
        weakness.push(
          ..._.filter<Element>(
            _.filter(Element, (item) => item !== Element.NONE),
            (item) => !_.includes(weakness, item)
          )
        )
        base.ADD_DEBUFF.push({
          name: `Sublimation`,
          source: 'Self',
        })
      }
      addDebuff(debuffs, DebuffTypes.OTHER)
      if (_.size(weakness) >= 5) {
        base[Stats.ALL_DMG].push({
          name: `Exposed Nature`,
          source: 'Self',
          value: calcScaling(0.36, 0.024, talent, 'curved'),
        })
        base.ADD_DEBUFF.push({
          name: 'Exposed Nature',
          source: 'Self',
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (a.a4) {
        if (eruditionCount)
          base[Stats.CRIT_DMG].push({
            name: `Ascension 4 Passive`,
            source: 'Self',
            value: 1.4,
          })
        if (eruditionCount >= 2)
          base[Stats.ALL_DMG].push({
            name: `Ascension 4 Passive`,
            source: 'Self',
            value: 0.3,
          })
      }
      if (a.a6) {
        base.DEF_PEN.push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.03 * _.size(weakness),
        })
      }
      if (form.anaxa_c1) {
        base.DEF_REDUCTION.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.16,
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      if (c >= 2) {
        base.ULT_SCALING.push(
          {
            name: 'Total E2 Single Target DMG',
            value: [{ scaling: 0.5, multiplier: Stats.ATK }],
            multiplier: 3 * multiplier,
            element: Element.WIND,
            property: TalentProperty.NORMAL,
            type: TalentType.ULT,
            sum: true,
          },
          {
            name: 'E2 Bounce DMG',
            value: [{ scaling: 0.5, multiplier: Stats.ATK }],
            element: Element.WIND,
            property: TalentProperty.NORMAL,
            type: TalentType.ULT,
            sum: false,
            multiplier,
          }
        )
      }
      if (form.anaxa_c2) {
        base[Stats.P_SPD].push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.12,
        })
      }
      if (form.anaxa_c4) {
        base[Stats.P_ATK].push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.4 * form.anaxa_c4,
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
      if (_.size(form.anaxa_implant)) {
        _.forEach(globalImplant, (item) =>
          base.ADD_DEBUFF.push({
            name: `${item} Weakness Implant`,
            source: 'Anaxa',
          })
        )
      }
      if (form.sublimation) {
        base.ADD_DEBUFF.push({
          name: `Sublimation`,
          source: 'Anaxa',
        })
      }
      if (_.size(weakness) >= 5) {
        base.ADD_DEBUFF.push({
          name: 'Exposed Nature',
          source: 'Anaxa',
        })
      }
      if (a.a4 && eruditionCount >= 2) {
        base[Stats.ALL_DMG].push({
          name: `Ascension 4 Passive`,
          source: 'Anaxa',
          value: 0.3,
        })
      }
      if (form.anaxa_c1) {
        base.DEF_REDUCTION.push({
          name: `Eidolon 1`,
          source: 'Anaxa',
          value: 0.16,
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
      return base
    },
  }
}

export default Anaxa
