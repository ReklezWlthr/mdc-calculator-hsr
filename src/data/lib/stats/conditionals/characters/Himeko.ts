import { addDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Himeko = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1003')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Sawblade Tuning',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Himeko's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Molten Detonation',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Himeko's ATK to a single enemy and <b class="text-hsr-fire">Fire DMG</b> equal to {{1}}% of Himeko's ATK to enemies adjacent to it.`,
      value: [
        { base: 100, growth: 10, style: 'curved' },
        { base: 40, growth: 4, style: 'curved' },
      ],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Heavenly Flare',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Himeko's ATK to all enemies. Himeko regenerates <span class="text-desc">5</span> extra Energy for each enemy defeated.`,
      value: [{ base: 138, growth: 9.2, style: 'curved' }],
      level: ult,
    },
    talent: {
      energy: 10,
      trace: 'Talent',
      title: 'Victory Rush',
      content: `When an enemy is inflicted with Weakness Break, Himeko gains <span class="text-desc">1</span> point of <b>Charge</b> (max <span class="text-desc">3</span> points).
      <br />If Himeko is fully <b>Charged</b> when an ally performs an attack, Himeko immediately performs <span class="text-desc">1</span> <u>follow-up attack</u> and deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of her ATK to all enemies, consuming all <b>Charge</b> points.
      <br />At the start of the battle, Himeko gains <span class="text-desc">1</span> point of <b>Charge</b>.`,
      value: [{ base: 70, growth: 7, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'Incomplete Combustion',
      content: `After using Technique, creates a dimension that lasts for <span class="text-desc">15</span> second(s). After entering battle with enemies in the dimension, there is a <span class="text-desc">100%</span> <u>base chance</u> to increase <b class="text-hsr-fire">Fire DMG</b> taken by enemies by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turn(s). Only <span class="text-desc">1</span> dimension created by allies can exist at the same time.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Starfire',
      content: `After using an attack, there is a <span class="text-desc">50%</span> <u>base chance</u> to inflict <b class="text-hsr-fire">Burn</b> on enemies for <span class="text-desc">2</span> turn(s).
      <br />When afflicted with <b class="text-hsr-fire">Burn</b>, enemies take <b class="text-hsr-fire">Fire DoT</b> equal to <span class="text-desc">30%</span> of Himeko's ATK at the start of each turn.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Magma',
      content: `Skill deals <span class="text-desc">20%</span> more DMG to enemies currently afflicted with <b class="text-hsr-fire">Burn</b>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Benchmark',
      content: `When current HP percentage is <span class="text-desc">80%</span> or higher, CRIT Rate increases by <span class="text-desc">15%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Childhood',
      content: `After <b>Victory Rush</b> is triggered, Himeko's SPD increases by <span class="text-desc">20%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Convergence`,
      content: `Deals <span class="text-desc">15%</span> more DMG to enemies whose HP percentage is <span class="text-desc">50%</span> or less.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Poised',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Dedication',
      content: `When Himeko's Skill inflicts Weakness Break on an enemy, she gains <span class="text-desc">1</span> extra point(s) of <b>Charge</b>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Aspiration`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Trailblaze!',
      content: `Ultimate deals DMG <span class="text-desc">2</span> extra times, each of which deals <b class="text-hsr-fire">Fire DMG</b> equal to <span class="text-desc">40%</span> of the original DMG to a random enemy.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'himeko_tech',
      text: `Technique Fire Vulnerability`,
      ...talents.technique,
      show: true,
      default: false,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'himeko_a6',
      text: `Current HP >= 80%`,
      ...talents.a6,
      show: a.a6,
      default: true,
    },
    {
      type: 'toggle',
      id: 'himeko_c1',
      text: `E1 Talent SPD Bonus`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'himeko_c2',
      text: `Target HP <= 50%`,
      ...talents.c3,
      show: c >= 2,
      default: true,
    },
    {
      type: 'toggle',
      id: 'himeko_a2',
      text: `A2 Burn`,
      ...talents.a2,
      show: a.a2,
      default: true,
      debuff: true,
      chance: { base: 0.5, fixed: false },
      duration: 2,
      debuffElement: Element.FIRE,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'himeko_tech'), findContentById(content, 'himeko_a2')]

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
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          energy: 20,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(1, 0.1, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          energy: 30,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.4, 0.04, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          energy: 30,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.38, 0.092, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          energy: 5,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.7, 0.07, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 10,
          energy: 10,
          sum: true,
        },
      ]

      if (form.himeko_a2) {
        const burn = {
          name: 'Burn DMG',
          value: [{ scaling: 0.3, multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.DOT,
          type: TalentType.NONE,
          chance: { base: 0.5, fixed: false },
          debuffElement: Element.FIRE,
        }
        base.BASIC_SCALING.push(burn)
        base.SKILL_SCALING.push(burn)
        base.ULT_SCALING.push(burn)
        base.TALENT_SCALING.push(burn)

        base.DOT_SCALING.push({
          ...burn,
          overrideIndex: index,
          dotType: DebuffTypes.BURN,
        })
        addDebuff(debuffs, DebuffTypes.BURN)
      }

      if (form.himeko_tech) {
        base.FIRE_VUL.push({
          name: `Technique`,
          source: 'Self',
          value: 0.1,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.himeko_a6)
        base[Stats.CRIT_RATE].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.15,
        })
      if (form.himeko_c1)
        base[Stats.SPD].push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.2,
        })
      if (form.himeko_c2)
        base[Stats.ALL_DMG].push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.15,
        })
      if (c >= 6)
        base.ULT_SCALING.push({
          name: 'Additional DMG [x2]',
          value: [{ scaling: 0.4, multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.ADD,
          type: TalentType.ULT,
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
      if (form.himeko_tech)
        base.FIRE_VUL.push({
          name: `Technique`,
          source: 'Himeko',
          value: 0.1,
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
      const burned = countDot(debuffs, DebuffTypes.BURN)
      if (burned && a.a4)
        base.SKILL_DMG.push({
          name: `Ascension 4 Passive`,
          source: 'Self',
          value: 0.2,
        })

      return base
    },
  }
}

export default Himeko
