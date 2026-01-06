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

import { toPercentage } from '@src/core/utils/data_format'
import { IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
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
      title: 'Pain, Brews Truth',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Anaxa's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Fractal, Exiles Fallacy',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Anaxa's ATK to one designated enemy and additionally deals <span class="text-desc">4</span> instance(s) of DMG. Each instance of DMG deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Anaxa's ATK to one random enemy, prioritizing Bouncing to enemy targets that have not been hit in this usage of Skill.
      <br />When used, for each attackable enemy on the field, this Skill has its DMG dealt increased by <span class="text-desc">20%</span>.`,
      value: [{ base: 40, growth: 4, style: 'curved' }],
      level: skill,
      tag: AbilityTag.BOUNCE,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Sprouting Life Sculpts Earth',
      content: `Inflicts the <b class="text-lime-400">Sublimation</b> state on all enemies, then deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Anaxa's ATK to all enemies.
      <br />In the <b class="text-lime-400">Sublimation</b> state, the targets will be simultaneously inflicted with <b class="text-hsr-physical">Physical</b>, <b class="text-hsr-fire">Fire</b>, <b class="text-hsr-ice">Ice</b>, <b class="text-hsr-lightning">Lightning</b>, <b class="text-hsr-wind">Wind</b>, <b class="text-hsr-quantum">Quantum</b>, and <b class="text-hsr-imaginary">Imaginary</b> Weaknesses, lasting until the start of each target's turn. If the targets do not have Control RES, they are unable to take action in <b class="text-lime-400">Sublimation</b> state.`,
      value: [{ base: 150, growth: 5, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: 'Tetrad Wisdom Reigns Thrice',
      content: `Each time Anaxa lands <span class="text-desc">1</span> hit on enemy targets, inflicts <span class="text-desc">1</span> Weakness of a random Type to the targets, lasting for <span class="text-desc">3</span> turn(s), with priority to the Weakness Type that the target doesn't already possess.
      <br />While Anaxa is on the field, inflicts the <b class="text-red">Qualitative Disclosure</b> state on enemy targets that have at least <span class="text-desc">5</span> different Types of Weaknesses. Anaxa deals {{0}}% increased DMG to targets afflicted with the <b class="text-red">Qualitative Disclosure</b> state. In addition, after using Basic ATK or Skill on them, unleashes <span class="text-desc">1</span> additional instance of Skill on the targets. This additional Skill does not consume any Skill Points and cannot trigger this effect again. If the target has been defeated before the additional Skill is used, it will be cast on one random enemy instead.`,
      value: [{ base: 18, growth: 1.2, style: 'curved' }],
      level: talent,
      tag: AbilityTag.IMPAIR,
    },
    technique: {
      trace: 'Technique',
      title: 'Pupil of Prism',
      content: `After using Technique, inflicts the Terrified state on enemies in a set area. Terrified enemies will flee in a direction away from Anaxa for <span class="text-desc">10</span> second(s). When allies enter battle via actively attacking a Terrified enemy, it will always be considered as entering battle via attacking a Weakness. After entering battle, Anaxa applies <span class="text-desc">1</span> Weakness of the attacker's Type to every enemy target, lasting for <span class="text-desc">3</span> turn(s).`,
      tag: AbilityTag.IMPAIR,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Roaming Signifier',
      content: `When using Basic ATK, additionally regenerates <span class="text-desc">10</span> Energy.
      <br />At the start of the turn, if there are no enemy targets in the <b class="text-red">Qualitative Disclosure</b> state, immediately regenerates <span class="text-desc">30</span> Energy.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Imperative Hiatus',
      content: `Based on the number of Erudition characters in the team, one of the following effects will be triggered in the current battle:
      <br /><span class="text-desc">1</span> character: Increases Anaxa's CRIT DMG by <span class="text-desc">140%</span>.
      <br />At least <span class="text-desc">2</span> characters: Increases DMG dealt by all allies by <span class="text-desc">40%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Qualitative Shift',
      content: `For every <span class="text-desc">1</span> different Weakness Type an enemy target has, the DMG that Anaxa deals to that target ignores <span class="text-desc">4%</span> of their DEF. Up to a max of <span class="text-desc">7</span> Weakness Types can be taken into account for this effect.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Stars, Hidden by Magician`,
      content: `After using Skill for the first time, recovers <span class="text-desc">1</span> Skill Point(s). When using Skill to hit enemy targets, decreases the targets' DEF by <span class="text-desc">16%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Soul, True to History`,
      content: `When enemy targets enter the battlefield, triggers <span class="text-desc">1</span> instance of the Talent's Weakness Implant effect, and reduces their All-Type RES by <span class="text-desc">20%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Pupil, Etched into Cosmos',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Blaze, Plunged to Canyon',
      content: `When using Skill, increases ATK by <span class="text-desc">30%</span>, lasting for <span class="text-desc">2</span> turn(s). This effect can stack up to <span class="text-desc">3</span> time(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Embryo, Set Beyond Vortex',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Everything Is in Everything',
      content: `The DMG dealt by Anaxa is <span class="text-desc">130%</span> of the original DMG. The <span class="text-desc">2</span> effects in the Trace <b>Imperative Hiatus</b> will be triggered directly and will no longer depend on the number of Erudition characters in the team.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'anaxa_enemy',
      text: `Enemies on Field`,
      ...talents.skill,
      show: true,
      default: 5,
      min: 0,
      max: 5,
    },
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
      type: 'number',
      id: 'anaxa_c4',
      text: `E4 ATK Bonus Stacks`,
      ...talents.c4,
      show: c >= 4,
      default: 1,
      min: 0,
      max: 2,
      duration: 2,
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

      const multiplier = c >= 6 ? 1.3 : 1

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
          value: [{ scaling: calcScaling(0.4, 0.04, skill, 'curved'), multiplier: Stats.ATK }],
          multiplier: 5 * multiplier,
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 50,
          sum: true,
          bonus: form.anaxa_enemy * 0.2,
        },
        {
          name: 'Bounce DMG',
          value: [{ scaling: calcScaling(0.4, 0.04, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          sum: false,
          multiplier,
          bonus: form.anaxa_enemy * 0.2,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.5, 0.05, ult, 'curved'), multiplier: Stats.ATK }],
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
          name: `Qualitative Disclosure`,
          source: 'Self',
          value: calcScaling(0.18, 0.012, talent, 'curved'),
        })
        base.ADD_DEBUFF.push({
          name: 'Qualitative Disclosure',
          source: 'Self',
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (a.a4 || c >= 6) {
        if (eruditionCount === 1 || c >= 6)
          base[Stats.CRIT_DMG].push({
            name: `Ascension 4 Passive`,
            source: 'Self',
            value: 1.4,
          })
        if (eruditionCount >= 2 || c >= 6)
          base[Stats.ALL_DMG].push({
            name: `Ascension 4 Passive`,
            source: 'Self',
            value: 0.4,
          })
      }
      if (a.a6) {
        base.DEF_PEN.push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.04 * _.size(weakness),
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
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.2,
        })
      }
      if (form.anaxa_c4) {
        base[Stats.P_ATK].push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.3 * form.anaxa_c4,
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
          name: 'Qualitative Disclosure',
          source: 'Anaxa',
        })
      }
      if ((a.a4 && eruditionCount >= 2) || c >= 6) {
        base[Stats.ALL_DMG].push({
          name: `Ascension 4 Passive`,
          source: 'Anaxa',
          value: 0.4,
        })
      }
      if (form.anaxa_c1) {
        base.DEF_REDUCTION.push({
          name: `Eidolon 1`,
          source: 'Anaxa',
          value: 0.16,
        })
      }
      if (c >= 2) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 2`,
          source: 'Anaxa',
          value: 0.2,
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
