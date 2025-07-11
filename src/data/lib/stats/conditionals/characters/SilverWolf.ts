import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

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

  const elements = _.uniq(_.map(team, (item) => findCharacter(item.cId)?.element))

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'System Warning',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Silver Wolf's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Allow Changes?',
      content: `There is a {{0}}% <u>base chance</u> to add <span class="text-desc">1</span> Weakness of an on-field ally target's Type to one designated enemy target (prioritizes implanting the Weakness corresponding to the first ally target in the lineup), also reducing the enemy target's RES to that Weakness Type by <span class="text-desc">20%</span> for <span class="text-desc">3</span> turn(s). If the enemy target already has that Type Weakness, the RES reduction effect to that Type will not be triggered.
      <br />Each enemy can only have <span class="text-desc">1</span> Weakness implanted by Silver Wolf. When Silver Wolf implants another Weakness to the target, only the most recent implanted Weakness will be kept.
      <br />In addition, there is a <span class="text-desc">100%</span> <u>base chance</u> to further reduce the target's All-Type RES by {{1}}% for <span class="text-desc">2</span> turn(s).
      <br />Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{2}}% of Silver Wolf's ATK to this target.`,
      value: [
        { base: 80, growth: 4, style: 'curved' },
        { base: 10.5, growth: 0.25, style: 'curved' },
        { base: 98, growth: 9.8, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.ST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'User Banned',
      content: `There's a {{0}}% <u>base chance</u> to decrease all enemies' DEF by {{1}}% for <span class="text-desc">3</span> turn(s). At the same time, deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{2}}% of Silver Wolf's ATK to all enemies.`,
      value: [
        { base: 80, growth: 4, style: 'curved' },
        { base: 36, growth: 0.9, style: 'curved' },
        { base: 228, growth: 15.2, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: 'Awaiting System Response...',
      content: `Silver Wolf can create three types of Bugs: reduce ATK by {{0}}%, reduce DEF by {{1}}%, and reduce SPD by {{2}}%.
      <br />After every attack launched by Silver Wolf, she has a {{3}}% <u>base chance</u> to implant <span class="text-desc">1</span> random Bug that lasts for <span class="text-desc">3</span> turn(s) in the attacked enemy target.
      <br />When the enemy target is defeated, the Weakness Silver Wolf implanted on it will be transferred to another surviving enemy on the field that hasn't been implanted with Weakness, prioritizing Elite targets and greater.`,
      value: [
        { base: 5, growth: 0.5, style: 'curved' },
        { base: 6, growth: 0.6, style: 'curved' },
        { base: 3, growth: 0.3, style: 'curved' },
        { base: 60, growth: 4, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.IMPAIR,
    },
    technique: {
      trace: 'Technique',
      title: 'Force Quit Program',
      content: `Immediately attacks the enemy. After entering battle, deals <b class="text-hsr-quantum">Quantum DMG</b> equal to <span class="text-desc">80%</span> of Silver Wolf's ATK to all enemies, and reduces Toughness from all enemies regardless of Weakness Types. Enemies with their Weakness Broken in this way will trigger the <b class="text-hsr-quantum">Quantum</b> Weakness Break effect.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Generate',
      content: `The duration of Bug is extended for <span class="text-desc">1</span> turn(s). Every time an enemy target's Weakness is Broken, Silver Wolf has a <span class="text-desc">100%</span> <u>base chance</u> of implanting <span class="text-desc">1</span> random Bug in that target.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Inject',
      content: `At the start of the battle, immediately regenerates <span class="text-desc">20</span> Energy. Silver Wolf regenerates <span class="text-desc">5</span> Energy at the start of her own turn.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Side Note',
      content: `For every <span class="text-desc">10%</span> Effect Hit Rate that Silver Wolf has, additionally increases her ATK by <span class="text-desc">10%</span> to a max of <span class="text-desc">50%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Social Engineering',
      content: `After using her Ultimate to attack any enemy target, Silver Wolf regenerates <span class="text-desc">7</span> Energy for every debuff that the target currently has. This effect can be triggered up to <span class="text-desc">5</span> time(s) in each use of her Ultimate.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'Zombie Network',
      content: `When enemy target enters battle, increases DMG received by <span class="text-desc">20%</span>. When the enemy target receives an attack from ally targets, Silver Wolf has a <span class="text-desc">100%</span> <u>base chance</u> of implanting the attacked enemy target with <span class="text-desc">1</span> random Bug.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Payload',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Bounce Attack',
      content: `After using Silver Wolf's Ultimate to attack any enemy target, deals <b class="text-hsr-quantum">Quantum Additional DMG</b> equal to <span class="text-desc">20%</span> of Silver Wolf's ATK for every debuff currently on the enemy target. This effect can be triggered for a maximum of <span class="text-desc">5</span> time(s) against each target during each use of her Ultimate.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Brute Force Attack',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Overlay Network',
      content: `For every debuff the enemy target has, the DMG dealt by Silver Wolf to it increases by <span class="text-desc">20%</span>, up to an increase of <span class="text-desc">100%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'element',
      id: 'sw_implant',
      text: `Skill Weakness Implant`,
      ...talents.skill,
      show: true,
      default: Element.QUANTUM,
      options: _.map(elements, (item) => ({ name: item, value: item })),
      duration: 3,
      debuff: true,
      chance: { base: calcScaling(0.8, 0.04, skill, 'curved'), fixed: false },
    },
    {
      type: 'toggle',
      id: 'sw_skill',
      text: `Skill RES Shred`,
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
      duration: 3,
      debuff: true,
      chance: { base: calcScaling(0.8, 0.04, ult, 'curved'), fixed: false },
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
      chance: { base: calcScaling(0.6, 0.04, talent, 'curved'), fixed: false },
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
      chance: { base: calcScaling(0.6, 0.04, talent, 'curved'), fixed: false },
    },
    {
      type: 'toggle',
      id: 'spd_bug',
      text: `Bug [SPD]`,
      ...talents.talent,
      show: true,
      default: true,
      debuff: true,
      chance: { base: calcScaling(0.6, 0.04, talent, 'curved'), fixed: false },
    },
    {
      type: 'toggle',
      id: 'sw_c2',
      text: `E2 Vulnerability`,
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
    findContentById(content, 'sw_c2'),
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
          break: 10,
          energy: 20,
          sum: true,
          hitSplit: [0.25, 0.25, 0.5],
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.98, 0.098, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          energy: 30,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(2.28, 0.152, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          energy: 5,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.8, multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
          sum: true,
        },
      ]

      if (form.sw_implant) {
        const isQuantumWeak = _.includes(weakness, Element.QUANTUM)
        if (isQuantumWeak) {
          form.sw_implant_ally = false
        } else {
          form.sw_implant_ally = true
          weakness.push(Element.QUANTUM)
          base[`${form.sw_implant.toUpperCase()}_RES_RED`].push({
            name: `Skill`,
            source: 'Self',
            value: 0.2,
          })
          addDebuff(debuffs, DebuffTypes.OTHER)
        }
      }
      if (form.sw_skill) {
        base.ALL_TYPE_RES_RED.push({
          name: `Skill`,
          source: 'Self',
          value: calcScaling(0.105, 0.0025, skill, 'curved'),
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
          name: `Bug [ATK]`,
          source: 'Self',
          value: calcScaling(0.05, 0.005, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.ATK_RED)
      }
      if (form.def_bug) {
        base.DEF_REDUCTION.push({
          name: `Bug [DEF]`,
          source: 'Self',
          value: calcScaling(0.06, 0.006, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      if (form.spd_bug) {
        base.SPD_REDUCTION.push({
          name: `Bug [SPD]`,
          source: 'Self',
          value: calcScaling(0.03, 0.003, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.SPD_RED)
      }
      if (form.sw_c2) {
        base.VULNERABILITY.push({
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
        base[`${form.sw_implant.toUpperCase()}_RES_RED`].push({
          name: `Skill`,
          source: 'Silver Wolf',
          value: 0.2,
        })
      if (form.sw_skill)
        base.ALL_TYPE_RES_RED.push({
          name: `Skill`,
          source: 'Silver Wolf',
          value: calcScaling(0.105, 0.0025, skill, 'curved'),
        })
      if (form.sw_ult)
        base.DEF_REDUCTION.push({
          name: `Ultimate`,
          source: 'Silver Wolf',
          value: calcScaling(0.36, 0.009, ult, 'curved'),
        })
      if (form.atk_bug)
        base.ATK_REDUCTION.push({
          name: `Bug [ATK]`,
          source: 'Silver Wolf',
          value: calcScaling(0.05, 0.005, ult, 'curved'),
        })
      if (form.def_bug)
        base.DEF_REDUCTION.push({
          name: `Bug [DEF]`,
          source: 'Silver Wolf',
          value: calcScaling(0.06, 0.006, ult, 'curved'),
        })
      if (form.spd_bug)
        base.SPD_REDUCTION.push({
          name: `Bug [SPD]`,
          source: 'Silver Wolf',
          value: calcScaling(0.03, 0.003, ult, 'curved'),
        })
      if (form.sw_c2)
        base.VULNERABILITY.push({
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
      if (a.a6) {
        base[Stats.P_ATK].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: _.min([0.5, base.getValue(Stats.EHR)]),
        })
      }
      if (c >= 4)
        base.ULT_SCALING.push({
          name: 'Additional DMG Per Debuff',
          value: [{ scaling: 0.2 * _.min([_.sumBy(debuffs, (item) => item.count), 5]), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
          sum: true,
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
