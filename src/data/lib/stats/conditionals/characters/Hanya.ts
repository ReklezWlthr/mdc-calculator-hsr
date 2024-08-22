import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
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

const Hanya = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1215')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Oracle Brush`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Hanya's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Samsara, Locked`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Hanya's ATK to a single enemy, then applies <b>Burden</b> to them.
      <br />For every <span class="text-desc">2</span> Basic ATKs, Skills, or Ultimates allies use on an enemy with <b>Burden</b>, allies will immediately recover <span class="text-desc">1</span> Skill Point. <b>Burden</b> is only active on the latest target it is applied to, and will be dispelled automatically after the Skill Point recovery effect has been triggered <span class="text-desc">2</span> times.`,
      value: [{ base: 120, growth: 12, style: 'curved' }],
      level: skill,
      tag: AbilityTag.ST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Ten-Lords' Decree, All Shall Obey`,
      content: `Increases the SPD of a target ally by {{0}}% of Hanya's SPD and increases the same target ally's ATK by {{1}}%, lasting for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 15, growth: 0.5, style: 'curved' },
        { base: 36, growth: 2.4, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.ENHANCE,
    },
    talent: {
      trace: 'Talent',
      title: `Sanction`,
      content: `When an ally uses a Basic ATK, Skill, or Ultimate on an enemy inflicted with <b>Burden</b>, the DMG dealt increases by {{0}}% for <span class="text-desc">2</span> turn(s).`,
      value: [{ base: 15, growth: 1.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    technique: {
      trace: 'Technique',
      title: `Netherworld Judgment`,
      content: `Immediately attacks the enemy. After entering battle, applies <b>Burden</b> equivalent to that applied by the Skill to a random enemy.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Scrivener`,
      content: `Allies triggering <b>Burden</b>'s Skill Point recovery effect have their ATK increased by <span class="text-desc">10%</span> for <span class="text-desc">1</span> turns.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Netherworld`,
      content: `When enemies with <b>Burden</b> are defeated, if <b>Burden</b>'s Skill Point recovery trigger count is <span class="text-desc">1</span> or fewer, additionally recover <span class="text-desc">1</span> Skill Point(s).`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Reanimated`,
      content: `When <b>Burden</b>'s Skill Point recovery effect is triggered, this character regenerates <span class="text-desc">2</span> Energy.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `One Heart`,
      content: `When an ally with Hanya's Ultimate's effect defeats an enemy, Hanya's action is <u>Advanced Forward</u> by <span class="text-desc">15%</span>. This effect can only be triggered <span class="text-desc">1</span> time(s) per turn.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Two Views`,
      content: `After using the Skill, this character's SPD increases by <span class="text-desc">20%</span> for <span class="text-desc">1</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Three Temptations`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Four Truths`,
      content: `The Ultimate's duration is additionally extended for <span class="text-desc">1</span> turn(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Five Skandhas`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Six Reverences`,
      content: `Increase the DMG Boost effect of the Talent by an additional <span class="text-desc">10%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'hanya_talent',
      text: `Burden DMG Bonus`,
      ...talents.talent,
      show: true,
      default: false,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'hanya_ult',
      text: `Hanya's Ult Bonus`,
      ...talents.ult,
      show: true,
      default: false,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'hanya_a2',
      text: `Burden Trigger ATK Bonus`,
      ...talents.a2,
      show: a.a2,
      default: false,
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'hanya_c4',
      text: `E4 SPD Bonus`,
      ...talents.c4,
      show: c >= 4,
      default: true,
      duration: 1,
    },
  ]

  const teammateContent: IContent[] = []

  const allyContent: IContent[] = [
    findContentById(content, 'hanya_talent'),
    findContentById(content, 'hanya_ult'),
    findContentById(content, 'hanya_a2'),
  ]

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
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.2, 0.12, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
      ]

      if (form.hanya_talent)
        base[Stats.ALL_DMG].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.15, 0.015, talent, 'curved') + (c >= 6 ? 0.1 : 0),
        })
      if (form.hanya_ult)
        base[Stats.P_ATK].push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.36, 0.024, ult, 'curved'),
        })
      if (form.hanya_a2)
        base[Stats.P_ATK].push({
          name: 'Ascension 1 Passive',
          source: 'Self',
          value: 0.1,
        })
      if (form.hanya_c4)
        base[Stats.P_SPD].push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.2,
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
      if (aForm.hanya_talent)
        base[Stats.ALL_DMG].push({
          name: 'Talent',
          source: 'Hanya',
          value: calcScaling(0.15, 0.015, talent, 'curved') + (c >= 6 ? 0.1 : 0),
        })
      if (aForm.hanya_ult)
        base[Stats.P_ATK].push({
          name: 'Ultimate',
          source: 'Hanya',
          value: calcScaling(0.36, 0.024, ult, 'curved'),
        })
      if (aForm.hanya_a2)
        base[Stats.P_ATK].push({
          name: 'Ascension 1 Passive',
          source: 'Hanya',
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
      _.forEach(team, (t, i) => {
        if (allForm[i].hanya_ult)
          t[Stats.SPD].push({
            name: 'Ultimate',
            source: index === i ? 'Self' : 'Hanya',
            value: calcScaling(0.15, 0.005, ult, 'curved') * base.getSpd(),
            base: base.getSpd(),
            multiplier: calcScaling(0.15, 0.005, ult, 'curved'),
          })
      })

      return base
    },
  }
}

export default Hanya
