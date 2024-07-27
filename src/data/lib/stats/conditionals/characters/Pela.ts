import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Pela = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: 'Frost Shot',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Pela's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Frostbite',
      content: `Removes <span class="text-desc">1</span> buff(s) and deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Pela's ATK as to a single enemy.`,
      value: [{ base: 105, growth: 10.5, style: 'curved' }],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Zone Suppression`,
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Pela's ATK to all enemies, with a <span class="text-desc">100%</span> <u>base chance</u> to inflict <b>Exposed</b> on all enemies.
      <br />When <b>Exposed</b>, enemies' DEF is reduced by {{1}}% for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 60, growth: 4, style: 'curved' },
        { base: 30, growth: 1, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Data Collecting`,
      content: `If the enemy is debuffed after Pela's attack, Pela will restore {{0}} extra Energy. This effect can only be triggered <span class="text-desc">1</span> time per attack.`,
      value: [{ base: 25, growth: 2.5, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'Preemptive Strike',
      content: `Immediately attacks the enemy. Upon entering battle, Pela deals <b class="text-hsr-ice">Ice DMG</b> equal to <span class="text-desc">80%</span> of her ATK to a random enemy, with a <span class="text-desc">100%</span> <u>base chance</u> of lowering the DEF of all enemies by <span class="text-desc">20%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Bash`,
      content: `Deals <span class="text-desc">20%</span> more DMG to debuffed enemies.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `The Secret Strategy`,
      content: `When Pela is on the battlefield, all allies' Effect Hit Rate increases by <span class="text-desc">10%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Wipe Out`,
      content: `Using Skill to remove buff(s) increases the DMG of the next attack by <span class="text-desc">20%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Victory Report`,
      content: `When an enemy is defeated, Pela regenerates <span class="text-desc">5</span> Energy.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Adamant Charge`,
      content: `Using Skill to remove buff(s) increases SPD by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Suppressive Force`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Full Analysis',
      content: `When using Skill, there is a <span class="text-desc">100%</span> <u>base chance</u> to reduce the target enemy's <b class="text-hsr-ice">Ice RES</b> by <span class="text-desc">12%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Absolute Jeopardy`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Feeble Pursuit`,
      content: `When Pela attacks a debuffed enemy, she deals Additional <b class="text-hsr-ice">Ice DMG</b> equal to <span class="text-desc">40%</span> of Pela's ATK to the enemy.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'exposed',
      text: `Exposed`,
      ...talents.ult,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'pela_tech',
      text: `Technique DEF Reduction`,
      ...talents.technique,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'pela_a6',
      text: `A6 DMG Bonus`,
      ...talents.a6,
      show: a.a6,
      default: false,
    },
    {
      type: 'toggle',
      id: 'pela_c2',
      text: `E2 SPD Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: false,
    },
    {
      type: 'toggle',
      id: 'pela_c4',
      text: `E4 Ice RES Reduction`,
      ...talents.c4,
      show: c >= 4,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'exposed'), findContentById(content, 'pela_tech')]

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
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.05, 0.105, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.6, 0.04, ult, 'curved'), multiplier: Stats.ATK }],
          flat: calcScaling(92, 55.2, skill, 'flat'),
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.8, multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
          sum: true,
        },
      ]

      if (form.exposed) {
        base.DEF_REDUCTION.push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.3, 0.01, talent, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      if (form.pela_tech) {
        base.DEF_REDUCTION.push({
          name: 'Technique',
          source: 'Self',
          value: 0.2,
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      if (a.a4)
        base[Stats.E_RES].push({
          name: 'Ascension 4 Passive',
          source: 'Self',
          value: 0.1,
        })
      if (form.pela_a6)
        base[Stats.ALL_DMG].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.2,
        })
      if (form.pela_c2)
        base[Stats.P_SPD].push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.1,
        })
      if (form.pela_c4) {
        base.ICE_RES_PEN.push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.12,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (c >= 6)
        base.TALENT_SCALING.push({
          name: 'E6 Additional DMG',
          value: [{ scaling: 0.4, multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
          break: 20,
          sum: true,
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
      if (form.exposed)
        base.DEF_REDUCTION.push({
          name: 'Ultimate',
          source: 'Pela',
          value: calcScaling(0.3, 0.01, talent, 'curved'),
        })
      if (form.pela_tech)
        base.DEF_REDUCTION.push({
          name: 'Technique',
          source: 'Pela',
          value: 0.2,
        })
      if (a.a4)
        base[Stats.E_RES].push({
          name: 'Ascension 4 Passive',
          source: 'Pela',
          value: 0.1,
        })
      if (form.pela_c4)
        base.ICE_RES_PEN.push({
          name: 'Eidolon 4',
          source: 'Pela',
          value: 0.12,
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
      if (a.a2 && countDebuff(debuffs))
        base[Stats.ALL_DMG].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.2,
        })

      return base
    },
  }
}

export default Pela
