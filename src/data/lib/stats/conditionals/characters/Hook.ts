import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Hook = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const names = _.map(team, (item) => findCharacter(item?.cId)?.name)
  const index = _.findIndex(team, (item) => item?.cId === '1109')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Hehe! Don't Get Burned!`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Hook's ATK to a target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Hey! Remember Hook?',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Hook's ATK to a single enemy. In addition, there is a <span class="text-desc">100%</span> <u>base chance</u> to inflict <b class="text-hsr-fire">Burn</b> for <span class="text-desc">2</span> turn(s).
      <br />When afflicted with <b class="text-hsr-fire">Burn</b>, enemies will take <b class="text-hsr-fire">Fire DoT</b> equal to {{1}}% of Hook's ATK at the beginning of each turn.`,
      value: [
        { base: 120, growth: 12, style: 'curved' },
        { base: 25, growth: 2.5, style: 'dot' },
      ],
      level: skill,
    },
    skill_alt: {
      energy: 30,
      trace: 'Enhanced Skill',
      title: 'Hey! Remember Hook?',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Hook's ATK to a single enemy, with a 100% <u>base chance</u> to <b class="text-hsr-fire">Burn</b> them for <span class="text-desc">2</span> turn(s). Additionally, deals <b class="text-hsr-fire">Fire DMG</b> equal to {{1}}% of Hook's ATK to enemies adjacent to it.
      <br />When afflicted with <b class="text-hsr-fire">Burn</b>, enemies will take <b class="text-hsr-fire">Fire DoT</b> equal to {{2}}% of Hook's ATK at the beginning of each turn.`,
      value: [
        { base: 140, growth: 14, style: 'curved' },
        { base: 40, growth: 4, style: 'curved' },
        { base: 25, growth: 2.5, style: 'dot' },
      ],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Boom! Here Comes the Fire!`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Hook's ATK to a single enemy. After using Ultimate, the next Skill to be used is Enhanced, which deals DMG to a single enemy and enemies adjacent to it.`,
      value: [{ base: 240, growth: 16, style: 'curved' }],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Ha! Oil to the Flames!`,
      content: `When attacking a target afflicted with <b class="text-hsr-fire">Burn</b>, deals Additional <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Hook's ATK and regenerates <span class="text-desc">5</span> extra Energy.`,
      value: [{ base: 50, growth: 5, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'Ack! Look at This Mess!',
      content: `Immediately attacks the enemy. Upon entering battle, Hook deals <b class="text-hsr-fire">Fire DMG</b> equal to <span class="text-desc">50%</span> of her ATK to a random enemy. In addition, there is a <span class="text-desc">100%</span> <u>base chance</u> to inflict <b class="text-hsr-fire">Burn</b> on every enemy for <span class="text-desc">3</span> turn(s). When afflicted with <b class="text-hsr-fire">Burn</b>, enemies will take <b class="text-hsr-fire">Fire DoT</b> equal to <span class="text-desc">50%</span> of Hook's ATK at the beginning of each turn.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Innocence`,
      content: `Hook restores HP equal to <span class="text-desc">5%</span> of her Max HP whenever her Talent is triggered.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Naivete`,
      content: `The chance to resist Crowd Control Debuffs increases by <span class="text-desc">35%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Playing With Fire`,
      content: `When using her Ultimate, Hook has her action Advanced Forward by <span class="text-desc">20%</span> and Hook additionally regenerates <span class="text-desc">5</span> Energy.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Early to Bed, Early to Rise`,
      content: `Enhanced Skill deals <span class="text-desc">20%</span> increased DMG.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Happy Tummy, Happy Body`,
      content: `Extends the duration of <b class="text-hsr-fire">Burn</b> caused by Skill by <span class="text-desc">1</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Don't Be Picky, Nothing's Icky`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `It's Okay to Not Know`,
      content: `When Talent is triggered, there is a <span class="text-desc">100%</span> <u>base chance</u> to <b class="text-hsr-fire">Burn</b> enemies adjacent to the target enemy, equivalent to that of Skill.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Let the Moles' Deeds Be Known`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Always Ready to Punch and Kick`,
      content: `Hook deals <span class="text-desc">20%</span> more DMG to enemies afflicted with <b class="text-hsr-fire">Burn</b>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'hook_enhanced_skill',
      text: `Enhanced Skill`,
      ...talents.ult,
      show: true,
      default: true,
      sync: true,
    },
    {
      type: 'toggle',
      id: 'hook_skill',
      text: `Skill Burn`,
      ...talents.skill,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: c >= 2 ? 3 : 2,
      debuffElement: Element.FIRE,
    },
    {
      type: 'toggle',
      id: 'hook_tech',
      text: `Technique Burn`,
      ...talents.technique,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 3,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'hook_skill'), findContentById(content, 'hook_tech')]

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
          sum: true,
        },
      ]
      const burn = {
        name: 'Skill Burn DMG',
        value: [{ scaling: calcScaling(0.25, 0.025, skill, 'dot'), multiplier: Stats.ATK }],
        element: Element.FIRE,
        property: TalentProperty.DOT,
        type: TalentType.NONE,
        chance: { base: 1, fixed: false },
        debuffElement: Element.FIRE,
      }
      base.SKILL_SCALING = form.hook_enhanced_skill
        ? [
            {
              name: 'Main Target',
              value: [{ scaling: calcScaling(1.4, 0.14, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
              sum: true,
            },
            {
              name: `Adjacent`,
              value: [{ scaling: calcScaling(0.4, 0.04, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 10,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(1.2, 0.12, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
              sum: true,
            },
          ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(2.4, 0.16, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Additional DMG',
          value: [{ scaling: calcScaling(0.5, 0.05, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
          break: 30,
          sum: true,
        },
      ]
      const talentBurn = {
        name: 'Technique Burn DMG',
        value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear') * 0.5, multiplier: Stats.ATK }],
        element: Element.FIRE,
        property: TalentProperty.DOT,
        type: TalentType.NONE,
        chance: { base: 1, fixed: false },
        debuffElement: Element.FIRE,
      }
      base.TECHNIQUE_SCALING = [
        {
          name: 'Random Target',
          value: [{ scaling: 0.5, multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
      ]

      if (form.hook_enhanced_skill) base.SKILL_ALT = true
      if (form.hook_skill) {
        base.SKILL_SCALING.push(burn)
        if (c >= 4) base.TALENT_SCALING.push(burn)
        base.DOT_SCALING.push({
          ...burn,
          overrideIndex: index,
          dotType: DebuffTypes.BURN,
        })
        addDebuff(debuffs, DebuffTypes.BURN)
      }
      if (form.hook_tech) {
        base.TECHNIQUE_SCALING.push(talentBurn)
        base.DOT_SCALING.push({
          ...talentBurn,
          overrideIndex: index,
          dotType: DebuffTypes.BURN,
        })
        addDebuff(debuffs, DebuffTypes.BURN)
      }
      if (a.a2)
        base.TALENT_SCALING.push({
          name: 'Healing',
          value: [{ scaling: 0.05, multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        })
      if (c >= 1 && form.hook_enhanced_skill)
        base.SKILL_DMG.push({
          name: 'Eidolon 1',
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
      if (countDot(debuffs, DebuffTypes.BURN) && c >= 6) {
        base[Stats.ALL_DMG].push({
          name: 'Eidolon 6',
          source: 'Self',
          value: 0.2,
        })
      }

      return base
    },
  }
}

export default Hook
