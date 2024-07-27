import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Herta = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1009')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'What Are You Looking At?',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Herta's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'One-Time Offer',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Herta's ATK to all enemies. If the enemy's HP percentage is <span class="text-desc">50%</span> or higher, DMG dealt to this target increases by <span class="text-desc">20%</span>.`,
      value: [{ base: 50, growth: 5, style: 'curved' }],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `It's Magic, I Added Some Magic`,
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Herta's ATK to all enemies.`,
      value: [{ base: 120, growth: 8, style: 'curved' }],
      level: ult,
    },
    talent: {
      energy: 5,
      trace: 'Talent',
      title: `Fine, I'll Do It Myself`,
      content: `When an ally's attack causes an enemy's HP percentage to fall to <span class="text-desc">50%</span> or lower, Herta will launch a <u>follow-up attack</u>, dealing <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Herta's ATK to all enemies.`,
      value: [{ base: 25, growth: 1.5, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'It Can Still Be Optimized',
      content: `After using her Technique, Herta's ATK increases by <span class="text-desc">40%</span> for <span class="text-desc">3</span> turn(s) at the beginning of the next battle.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Efficiency`,
      content: `When Skill is used, the DMG Boost effect on target enemies increases by an extra <span class="text-desc">25%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Puppet`,
      content: `The chance to resist Crowd Control Debuffs increases by <span class="text-desc">35%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Icing`,
      content: `When Ultimate is used, deals <span class="text-desc">20%</span> more DMG to <b class="text-hsr-ice">Frozen</b> enemies.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Kick You When You're Down`,
      content: `If the enemy's HP percentage is at <span class="text-desc">50%</span> or less, Herta's Basic ATK deals Additional <b class="text-hsr-ice">Ice DMG</b> equal to <span class="text-desc">40%</span> of Herta's ATK.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Keep the Ball Rolling`,
      content: `Every time Talent is triggered, this character's CRIT Rate increases by <span class="text-desc">3%</span>. This effect can stack up to <span class="text-desc">5</span> time(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `That's the Kind of Girl I Am`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Hit Where It Hurts',
      content: `When Talent is triggered, DMG increases by <span class="text-desc">10%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Cuss Big or Cuss Nothing`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'No One Can Betray Me',
      content: `After using Ultimate, this character's ATK increases by <span class="text-desc">25%</span> for <span class="text-desc">1</span> turn(s).`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'herta_skill',
      text: `Target HP >= 50%`,
      ...talents.skill,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'herta_tech',
      text: `Technique ATK Bonus`,
      ...talents.technique,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'herta_c1',
      text: `Target HP <= 50%`,
      ...talents.c1,
      show: c >= 1,
      default: false,
    },
    {
      type: 'number',
      id: 'herta_c2',
      text: `Talent CRIT Rate Bonus Stacks`,
      ...talents.c2,
      show: c >= 2,
      default: 5,
      min: 0,
      max: 5,
    },
    {
      type: 'toggle',
      id: 'herta_c6',
      text: `E6 Ult ATK Bonus`,
      ...talents.c6,
      show: c >= 6,
      default: true,
      duration: 1,
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
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          energy: 20,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.5, 0.05, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          energy: 30,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.2, 0.08, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
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
          value: [{ scaling: calcScaling(0.25, 0.015, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 5,
          energy: 5,
          sum: true,
        },
      ]

      if (form.herta_skill)
        base.SKILL_DMG.push({
          name: `Skill`,
          source: 'Self',
          value: 0.2 + (a.a2 ? 0.25 : 0),
        })
      if (form.herta_tech)
        base[Stats.P_ATK].push({
          name: `Technique`,
          source: 'Self',
          value: 0.4,
        })
      if (form.herta_c1)
        base.BASIC_SCALING.push({
          name: 'Additional DMG',
          value: [{ scaling: 0.4, multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
          sum: true,
        })
      if (form.herta_c2)
        base[Stats.CRIT_RATE].push({
          name: `Eidolon 2`,
          source: 'Self',
          value: form.herta_c2 * 0.03,
        })
      if (c >= 4)
        base.TALENT_DMG.push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.1,
        })
      if (form.herta_c6)
        base[Stats.P_ATK].push({
          name: `Eidolon 6`,
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
      const frozen = _.find(debuffs, (item) => item.type === DebuffTypes.FROZEN)?.count >= 1
      if (frozen && a.a6)
        base.ULT_DMG.push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.2,
        })

      return base
    },
  }
}

export default Herta
