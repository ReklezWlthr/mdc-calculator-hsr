import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Luka = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const names = _.map(team, (item) => findCharacter(item.cId)?.name)
  const index = _.findIndex(team, (item) => item?.cId === '1111')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Direct Punch`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Luka's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    normal_alt: {
      energy: 20,
      trace: 'Enhanced Basic ATK',
      title: `Sky-Shatter Fist`,
      content: `Consumes <span class="text-desc">2</span> stacks of <b>Fighting Will</b>. First, uses Direct Punch to deal <span class="text-desc">3</span> hits, with each hit dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Luka's ATK to a single enemy target.
      <br />Then, uses Rising Uppercut to deal <span class="text-desc">1</span> hit, dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Luka's ATK to the single enemy target.`,
      value: [
        { base: 10, growth: 2, style: 'linear' },
        { base: 40, growth: 8, style: 'linear' },
      ],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Lacerating Fist',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Luka's ATK to a single enemy target. In addition, there is a <span class="text-desc">100%</span> <u>base chance</u> to inflict <b class="text-hsr-physical">Bleed</b> on them, lasting for <span class="text-desc">3</span> turn(s).
      <br />While <b class="text-hsr-physical">Bleeding</b>, the enemy will take <span class="text-desc">24%</span> of their Max HP as <b class="text-hsr-physical">Physical DoT</b> at the start of each turn. This DMG will not exceed more than {{1}}% of Luka's ATK.`,
      value: [
        { base: 60, growth: 6, style: 'curved' },
        { base: 130, growth: 13, style: 'dot' },
      ],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Coup de Grâce`,
      content: `Receives <span class="text-desc">2</span> stack(s) of <b>Fighting Will</b>, with a <span class="text-desc">100%</span> <u>base chance</u> to increase a single enemy target's DMG received by {{0}}% for <span class="text-desc">3</span> turn(s). Then, deals <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Luka's ATK to the target.`,
      value: [
        { base: 12, growth: 0.8, style: 'curved' },
        { base: 198, growth: 13.2, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Flying Sparks`,
      content: `After Luka uses his Basic ATK "Direct Punch" or Skill "Lacerating Fist," he receives <span class="text-desc">1</span> stack(s) of <b>Fighting Will</b>, up to <span class="text-desc">4</span> stacks. When he has <span class="text-desc">2</span> or more stacks of <b>Fighting Will</b>, his Basic ATK "Direct Punch" is enhanced to "Sky-Shatter Fist." After his Enhanced Basic ATK's "Rising Uppercut" hits a <b class="text-hsr-physical">Bleeding</b> enemy target, the <b class="text-hsr-physical">Bleed</b> status will immediately deal DMG for <span class="text-desc">1</span> time equal to {{0}}% of the original DMG to the target. At the start of battle, Luka will possess <span class="text-desc">1</span> stack of <b>Fighting Will</b>.`,
      value: [{ base: 68, growth: 1.7, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'Anticipator',
      content: `Immediately attacks the enemy. Upon entering battle, Luka deals <b class="text-hsr-physical">Physical DMG</b> equal to <span class="text-desc">50%</span> of his ATK to a random single enemy with a <span class="text-desc">100%</span> <u>base chance</u> to inflict his Skill's <b class="text-hsr-physical">Bleed</b> effect on the target. Then, Luka gains <span class="text-desc">2</span> additional stack of <b>Fighting Will</b>.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Kinetic Overload`,
      content: `When the Skill is used, immediately dispels <span class="text-desc">1</span> buff from the enemy target.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Cycle Braking`,
      content: `For every stack of Fighting Will obtained, additionally regenerates <span class="text-desc">3</span> Energy.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Crush Fighting Will`,
      content: `When using Enhanced Basic ATK, every hit Direct Punch deals has a <span class="text-desc">50%</span> <u>fixed chance</u> for Luka to use <span class="text-desc">1</span> additional hit. This effect does not apply to additional hits generated in this way.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Fighting Endlessly`,
      content: `When Luka takes action, if the target enemy is <b class="text-hsr-physical">Bleeding</b>, increases DMG dealt by Luka by <span class="text-desc">15%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `The Enemy is Weak, I am Strong`,
      content: `If the Skill hits an enemy target with <b class="text-hsr-physical">Physical</b> Weakness, gain <span class="text-desc">1</span> stack(s) of <b>Fighting Will</b>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Born for the Ring`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Never Turning Back`,
      content: `For every stack of <b>Fighting Will</b> obtained, increases ATK by <span class="text-desc">5%</span>, stacking up to <span class="text-desc">4</span> time(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `The Spirit of Wildfire`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `A Champion's Applause`,
      content: `After the Enhanced Basic ATK's "Rising Uppercut" hits a <b class="text-hsr-physical">Bleeding</b> enemy target, the <b class="text-hsr-physical">Bleed</b> status will immediately deal DMG <span class="text-desc">1</span> time equal to <span class="text-desc">8%</span> of the original DMG for every hit of Direct Punch already unleashed during the current Enhanced Basic ATK.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'fighting_will',
      text: `Fighting Will`,
      ...talents.skill,
      show: true,
      default: 1,
      min: 0,
      max: 4,
      unique: true,
    },
    {
      type: 'toggle',
      id: 'luka_enhance',
      text: `Enhanced Basic ATK`,
      ...talents.talent,
      show: true,
      default: true,
      unique: true,
      sync: true,
    },
    {
      type: 'toggle',
      id: 'luka_ult',
      text: `Ult Vulnerability`,
      ...talents.ult,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'luka_bleed',
      text: `Skill Bleed`,
      ...talents.skill,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 3,
      debuffElement: Element.PHYSICAL,
    },
    {
      type: 'toggle',
      id: 'luka_c1',
      text: `E1 DMG Bonus`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      duration: 2,
    },
    {
      type: 'number',
      id: 'luka_c6',
      text: `Direct Punch Unleashed`,
      ...talents.c6,
      show: c >= 6,
      default: 3,
      min: 3,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'luka_ult'), findContentById(content, 'luka_bleed')]

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

      base.BASIC_SCALING = form.luka_enhance
        ? [
            {
              name: 'Direct Punch DMG',
              value: [{ scaling: calcScaling(0.1, 0.02, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10 / 3,
            },
            {
              name: 'Rising Uppercut DMG',
              value: [{ scaling: calcScaling(0.4, 0.08, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
            },
          ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.6, 0.06, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.98, 0.132, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'Random Target',
          value: [{ scaling: 0.5, multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
        },
      ]

      const bleed = {
        name: 'Bleed DMG',
        value: [{ scaling: 0.24, multiplier: Stats.EHP }],
        element: Element.PHYSICAL,
        property: TalentProperty.DOT,
        type: TalentType.NONE,
        cap: { scaling: calcScaling(1.3, 0.13, skill, 'dot'), multiplier: Stats.ATK },
        chance: { base: 1, fixed: false },
        debuffElement: Element.PHYSICAL,
      }
      if (form.luka_bleed) {
        base.SKILL_SCALING.push(bleed)
        base.TECHNIQUE_SCALING.push(bleed)
        base.DOT_SCALING.push({
          ...bleed,
          overrideIndex: index,
          dotType: DebuffTypes.BLEED,
        })
        addDebuff(debuffs, DebuffTypes.BLEED)
      }
      if (form.luka_enhance) base.BA_ALT = true
      if (form.luka_ult) {
        base.VULNERABILITY.push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.12, 0.008, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.luka_c1)
        base[Stats.ALL_DMG].push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.15,
        })
      if (form.fighting_will && c >= 4)
        base[Stats.P_ATK].push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.05 * form.fighting_will,
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
      if (form.luka_ult)
        base.VULNERABILITY.push({
          name: 'Ultimate',
          source: 'Luka',
          value: calcScaling(0.12, 0.008, ult, 'curved'),
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
      if (form.luka_enhance)
        base.CALLBACK.push((x, d, w, all) => {
          const bleed = _.filter(
            _.flatMap(all, (item) => item.DOT_SCALING),
            (item) => _.includes([DebuffTypes.BLEED, DebuffTypes.DOT], item.dotType)
          )
          x.BASIC_SCALING.push(
            ..._.map(bleed, (item, i) => ({
              ...item,
              chance: undefined,
              name: `${names?.[item.overrideIndex]}'s ${item.name}`.replace('DMG', 'Detonation'),
              multiplier: (item.multiplier || 1) * (calcScaling(0.68, 0.017, talent, 'curved') + form.luka_c6 * 0.08),
            }))
          )
          return x
        })

      return base
    },
  }
}

export default Luka
