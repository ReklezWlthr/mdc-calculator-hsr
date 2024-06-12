import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const SilverWolf = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item.cId === '1208')

  const talents: ITalent = {
    normal: {
      title: 'System Warning',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Silver Wolf's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      title: 'Allow Changes?',
      content: `There is a {{0}}% base chance to add 1 Weakness of an on-field ally's Type to the target enemy. This also reduces the enemy's DMG RES to that Weakness Type by <span class="text-desc">20%</span> for <span class="text-desc">2</span> turn(s). If the enemy already has that Type Weakness, the effect of DMG RES reduction to that Weakness Type will not be triggered.
      <br />Each enemy can only have 1 Weakness implanted by Silver Wolf. When Silver Wolf implants another Weakness to the target, only the most recent implanted Weakness will be kept.
      <br />In addition, there is a <span class="text-desc">100%</span> base chance to reduce the All-Type RES of the enemy further by {{1}}% for <span class="text-desc">2</span> turn(s).
      <br />Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{2}}% of Silver Wolf's ATK to this enemy.`,
      value: [
        { base: 75, growth: 1, style: 'curved' },
        { base: 7.5, growth: 0.25, style: 'curved' },
        { base: 98, growth: 9.8, style: 'curved' },
      ],
      level: skill,
    },
    ult: {
      title: 'User Banned',
      content: `There's a {{0}}% base chance to decrease the target enemy's DEF by {{1}}% for 3 turn(s). And at the same time, deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{2}}% of Silver Wolf's ATK to the target enemy.`,
      value: [
        { base: 85, growth: 1.5, style: 'curved' },
        { base: 36, growth: 0.9, style: 'curved' },
        { base: 228, growth: 15.2, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      title: 'Awaiting System Response...',
      content: `Silver Wolf can create three types of Bugs: reduce ATK by {{0}}%, reduce DEF by {{1}}%, and reduce SPD by {{2}}%.
      <br />Every time Silver Wolf attacks, she has a {{3}}% base chance to implant a random Bug that lasts for 3 turn(s) in the enemy target.`,
      value: [
        { base: 5, growth: 0.5, style: 'curved' },
        { base: 4, growth: 0.4, style: 'curved' },
        { base: 3, growth: 0.3, style: 'curved' },
        { base: 60, growth: 1.2, style: 'curved' },
      ],
      level: talent,
    },
    technique: {
      title: 'Force Quit Program',
      content: `Immediately attacks the enemy. After entering battle, deals <b class="text-hsr-quantum">Quantum DMG</b> equal to <span class="text-desc">80%</span> of Silver Wolf's ATK to all enemies, and ignores Weakness Types and reduces Toughness from all enemies. Enemies with their Weakness Broken in this way will trigger the <b class="text-hsr-quantum">Quantum</b> Weakness Break effect.`,
    },
    a2: {
      title: 'A2: Generate',
      content: `Bug's duration is extended for <span class="text-desc">1</span> turn(s). Every time an enemy is inflicted with Weakness Break, Silver Wolf has a <span class="text-desc">65%</span> base chance of implanting a random Bug in the enemy.`,
    },
    a4: {
      title: 'A4: Inject',
      content: `The duration of the Weakness implanted by Silver Wolf's Skill increases by <span class="text-desc">1</span> turn(s).`,
    },
    a6: {
      title: 'A6: Side Note',
      content: `If there are <span class="text-desc">3</span> or more debuff(s) affecting the enemy when the Skill is used, then the Skill decreases the enemy's All-Type RES by an additional <span class="text-desc">3%</span>.`,
    },
    c1: {
      title: 'E1: Social Engineering',
      content: `After using her Ultimate to attack enemies, Silver Wolf regenerates <span class="text-desc">7</span> Energy for every debuff that the target enemy currently has. This effect can be triggered up to <span class="text-desc">5</span> time(s) in each use of her Ultimate.`,
    },
    c2: {
      title: 'E2: Zombie Network',
      content: `When an enemy enters battle, reduces their Effect RES by <span class="text-desc">20%</span>.`,
    },
    c3: {
      title: 'E3: Payload',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      title: 'E4: Bounce Attack',
      content: `After using her Ultimate to attack enemies, deals Additional <b class="text-hsr-quantum">Quantum DMG</b> equal to <span class="text-desc">20%</span> of Silver Wolf's ATK for every debuff currently on the enemy target. This effect can be triggered for a maximum of <span class="text-desc">5</span> time(s) during each use of her Ultimate.`,
    },
    c5: {
      title: 'E5: Brute Force Attack',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      title: 'E6: Overlay Network',
      content: `For every debuff the target enemy has, the DMG dealt by Silver Wolf increases by <span class="text-desc">20%</span>, up to a limit of <span class="text-desc">100%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'element',
      id: 'sw_implant',
      text: `Weakness Implant`,
      ...talents.skill,
      show: true,
      default: Element.QUANTUM,
      duration: a.a4 ? 3 : 2,
      debuff: true,
      chance: { base: calcScaling(0.75, 0.01, skill, 'curved'), fixed: false },
    },
    {
      type: 'toggle',
      id: 'sw_skill',
      text: `Skill All-Type RES Reduction`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 2,
      debuff: true,
      chance: { base: 1, fixed: false },
    },
    {
      type: 'toggle',
      id: 'sw_ult',
      text: `Ult DEF Reduction`,
      ...talents.ult,
      show: true,
      default: true,
      duration: a.a2 ? 4 : 3,
      debuff: true,
      chance: { base: calcScaling(0.85, 0.015, ult, 'curved'), fixed: false },
    },
    {
      type: 'toggle',
      id: 'atk_bug',
      text: `Bug [ATK]`,
      ...talents.talent,
      show: true,
      default: true,
      duration: a.a2 ? 4 : 3,
      debuff: true,
      chance: { base: calcScaling(0.6, 0.012, talent, 'curved'), fixed: false },
    },
    {
      type: 'toggle',
      id: 'def_bug',
      text: `Bug [DEF]`,
      ...talents.talent,
      show: true,
      default: true,
      duration: a.a2 ? 4 : 3,
      debuff: true,
      chance: { base: calcScaling(0.6, 0.012, talent, 'curved'), fixed: false },
    },
    {
      type: 'toggle',
      id: 'spd_bug',
      text: `Bug [SPD]`,
      ...talents.talent,
      show: true,
      default: true,
      debuff: true,
      chance: { base: calcScaling(0.6, 0.012, talent, 'curved'), fixed: false },
    },
    {
      type: 'toggle',
      id: 'sw_c2',
      text: `E2 Effect RES Reduction`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      debuff: true,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'sw_implant'),
    findContentById(content, 'sw_skill'),
    findContentById(content, 'sw_ult'),
    findContentById(content, 'atk_bug'),
    findContentById(content, 'def_bug'),
    findContentById(content, 'spd_bug'),
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
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 30,
          energy: 20,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.98, 0.098, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 60,
          energy: 30,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(2.28, 0.152, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 90,
          energy: 5,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.8, multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 60,
        },
      ]

      if (form.sw_implant) {
        const isQuantumWeak = _.includes(weakness, Element.QUANTUM)
        if (isQuantumWeak) {
          form.sw_implant_ally = false
        } else {
          form.sw_implant_ally = true
          weakness.push(Element.QUANTUM)
          base[`${form.sw_implant.toUpperCase()}_RES_PEN`].push({
            name: `Skill`,
            source: 'Self',
            value: 0.2,
          })
          addDebuff(debuffs, DebuffTypes.OTHER)
        }
      }
      if (form.sw_skill) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Skill`,
          source: 'Self',
          value: calcScaling(0.075, 0.0025, skill, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.sw_ult) {
        base.DEF_REDUCTION.push({
          name: `Ultimate`,
          source: 'Self',
          value: calcScaling(0.36, 0.009, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      if (form.atk_bug) {
        base.ATK_REDUCTION.push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.05, 0.005, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.ATK_RED)
      }
      if (form.def_bug) {
        base.DEF_REDUCTION.push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.04, 0.004, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      if (form.spd_bug) {
        base.SPD_REDUCTION.push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.03, 0.003, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.SPD_RED)
      }
      if (form.sw_c2) {
        base.E_RES_RED.push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.2,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
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
      if (form.sw_implant_ally)
        base[`${form.sw_implant.toUpperCase()}_RES_PEN`].push({
          name: `Skill`,
          source: 'Silver Wolf',
          value: 0.2,
        })
      if (form.sw_skill)
        base.ALL_TYPE_RES_PEN.push({
          name: `Skill`,
          source: 'Silver Wolf',
          value: calcScaling(0.075, 0.0025, skill, 'curved'),
        })
      if (form.sw_ult)
        base.DEF_REDUCTION.push({
          name: `Ultimate`,
          source: 'Silver Wolf',
          value: calcScaling(0.36, 0.009, ult, 'curved'),
        })
      if (form.atk_bug)
        base.ATK_REDUCTION.push({
          name: `Talent`,
          source: 'Silver Wolf',
          value: calcScaling(0.05, 0.005, ult, 'curved'),
        })
      if (form.def_bug)
        base.DEF_REDUCTION.push({
          name: `Talent`,
          source: 'Silver Wolf',
          value: calcScaling(0.04, 0.004, ult, 'curved'),
        })
      if (form.spd_bug)
        base.SPD_REDUCTION.push({
          name: `Talent`,
          source: 'Silver Wolf',
          value: calcScaling(0.03, 0.003, ult, 'curved'),
        })
      if (form.sw_c2)
        base.E_RES_RED.push({
          name: `Eidolon 2`,
          source: 'Silver Wolf',
          value: 0.2,
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
        base.ULT_SCALING.push({
          name: 'Additional DMG Per Debuff',
          value: [{ scaling: 0.2 * _.min([_.sumBy(debuffs, (item) => item.count), 5]), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
        })
      if (c >= 6)
        base[Stats.ALL_DMG].push({
          name: `Eidolon 6`,
          source: 'Self',
          value: _.min([_.sumBy(debuffs, (item) => item.count), 5]) * 0.2,
        })

      return base
    },
  }
}

export default SilverWolf