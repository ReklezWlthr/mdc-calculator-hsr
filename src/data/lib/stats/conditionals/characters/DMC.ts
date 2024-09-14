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

const DMC = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const names = _.map(team, (item) => findCharacter(item?.cId)?.name)

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Farewell Hit`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of the Trailblazer's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `RIP Home Run`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of the Trailblazer's ATK to a single enemy and enemies adjacent to it.`,
      value: [{ base: 62.5, growth: 6.25, style: 'curved' }],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Stardust Ace`,
      content: `Choose between two attack modes to deliver a full strike.
      <br /><b>Blowout: Farewell Hit</b> deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of the Trailblazer's ATK to a single enemy.
      <br /><b>Blowout: RIP Home Run</b> deals <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of the Trailblazer's ATK to a single enemy, and <b class="text-hsr-physical">Physical DMG</b> equal to {{2}}% of the Trailblazer's ATK to enemies adjacent to it.`,
      value: [
        { base: 300, growth: 15, style: 'curved' },
        { base: 180, growth: 9, style: 'curved' },
        { base: 108, growth: 5.4, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.ENHANCE,
    },
    talent: {
      trace: 'Talent',
      title: `Perfect Pickoff`,
      content: `Each time after this character inflicts Weakness Break on an enemy, ATK increases by {{0}}%. This effect stacks up to <span class="text-desc">2</span> time(s).`,
      value: [{ base: 10, growth: 1, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: `Immortal Third Strike`,
      content: `Immediately heals all allies for <span class="text-desc">15%</span> of their respective Max HP after using this Technique.`,
      tag: AbilityTag.RESTORE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Ready for Battle`,
      content: `At the start of the battle, immediately regenerates <span class="text-desc">15</span> Energy.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Perseverance`,
      content: `Each Talent stack increases the Trailblazer's DEF by <span class="text-desc">10%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Fighting Will`,
      content: `When using Skill or Ultimate "Blowout: RIP Home Run", DMG dealt to the target enemy is increased by <span class="text-desc">25%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `A Falling Star`,
      content: `When enemies are defeated due to the Trailblazer's Ultimate, the Trailblazer regenerates <span class="text-desc">10</span> extra Energy. This effect can only be triggered once per attack.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `An Unwilling Host`,
      content: `Attacking enemies with <b class="text-hsr-physical">Physical</b> Weakness restores the Trailblazer's HP equal to <span class="text-desc">5%</span> of the Trailblazer's ATK.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `A Leading Whisper`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `A Destructing Glance`,
      content: `When attacking an enemy with Weakness Break, CRIT Rate is increased by <span class="text-desc">25%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `A Surviving Hope`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `A Trailblazing Will`,
      content: `The Trailblazer's Talent is also triggered when they defeat an enemy.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'dmc_talent',
      text: `Perfect Pickoff Stacks`,
      ...talents.talent,
      show: true,
      default: 2,
      min: 0,
      max: 2,
    },
  ]

  const teammateContent: IContent[] = []

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
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(0.625, 0.0625, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          bonus: a.a6 ? 0.25 : 0,
          break: 20,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.625, 0.0625, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Blowout: Farewell Hit',
          value: [{ scaling: calcScaling(3, 0.15, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
        {
          name: 'Blowout: RIP Home Run Main',
          value: [{ scaling: calcScaling(1.8, 0.09, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          bonus: a.a6 ? 0.25 : 0,
          break: 30,
        },
        {
          name: 'Blowout: RIP Home Run Adjacent',
          value: [{ scaling: calcScaling(1.08, 0.054, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
        },
      ]

      if (form.dmc_talent) {
        base[Stats.P_ATK].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.1, 0.01, ult, 'curved') * form.dmc_talent,
        })
        if (a.a4)
          base[Stats.P_DEF].push({
            name: 'Ascension 4 Passive',
            source: 'Self',
            value: 0.1 * form.dmc_talent,
          })
      }
      if (c >= 2)
        base.TALENT_SCALING.push({
          name: 'E2 Healing',
          value: [{ scaling: 0.05, multiplier: Stats.ATK }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        })
      if (c >= 4 && broken)
        base[Stats.CRIT_RATE].push({
          name: 'Eidolon 4',
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

export default DMC
