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

const Misha = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `E—Excuse Me, Please!`,
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Misha's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `R—Room Service`,
      content: `Increases the Hits Per Action for Misha's next Ultimate by <span class="text-desc">1</span> hit(s). Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Misha's ATK to a single target enemy, and <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of Misha's ATK to adjacent targets.`,
      value: [
        { base: 100, growth: 10, style: 'curved' },
        { base: 40, growth: 4, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `G—Gonna Be Late!`,
      content: `Has <span class="text-desc">3</span> Hits Per Action by default. First, uses <span class="text-desc">1</span> hit to deal <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Misha's ATK to a single target enemy. Then, the rest of the hits each deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Misha's ATK to a single random enemy. Just before each hit lands, there is a {{1}}% <u>base chance</u> to <b class="text-hsr-ice">Freeze</b> the target, lasting for <span class="text-desc">1</span> turn.
      <br />While <b class="text-hsr-ice">Frozen</b>, enemy targets cannot take any actions, and at the start of their turn, they receive Additional <b class="text-hsr-ice">Ice DMG</b> equal to {{2}}% of Misha's ATK.
      <br />This Ultimate can possess up to <span class="text-desc">10</span> Hits Per Action. After the Ultimate is used, its Hits Per Action will be reset to the default level.`,
      value: [
        { base: 36, growth: 2.4, style: 'curved' },
        { base: 12, growth: 0.8, style: 'curved' },
        { base: 18, growth: 1.2, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.BOUNCE,
    },
    talent: {
      trace: 'Talent',
      title: `Horological Escapement`,
      content: `Whenever any ally consumes <span class="text-desc">1</span> Skill Point, Misha's next Ultimate delivers <span class="text-desc">1</span> more Hit(s) Per Action and Misha regenerates {{0}} Energy.`,
      value: [{ base: 1, growth: 0.1, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: `Wait, You Are So Beautiful!`,
      content: `After using the Technique, creates a dimension that lasts for <span class="text-desc">15</span> seconds. Enemies caught in the dimension are inflicted with Dream Prison and stop all their actions. Upon entering battle against enemies afflicted with Dream Prison, increases the Hits Per Action for Misha's next Ultimate by <span class="text-desc">2</span> hit(s). Only <span class="text-desc">1</span> dimension created by allies can exist at the same time.`,
      tag: AbilityTag.IMPAIR,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Release`,
      content: `Before the Ultimate's first hit lands, increases the <u>base chance</u> of <b class="text-hsr-ice">Freezing</b> the target by <span class="text-desc">80%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Interlock`,
      content: `When using the Ultimate, increases the Effect Hit Rate by <span class="text-desc">60%</span>, lasting until the end of the Ultimate's current action.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Transmission`,
      content: `When dealing DMG to <b class="text-hsr-ice">Frozen</b> enemies, increases CRIT DMG by <span class="text-desc">30%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Whimsicality of Fancy`,
      content: `When using the Ultimate, for every enemy on the field, additionally increases the Hits Per Action for the Ultimate by <span class="text-desc">1</span> hit(s), up to a maximum increase of <span class="text-desc">5</span> hit(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Yearning of Youth`,
      content: `Before each hit of the Ultimate lands, there is a <span class="text-desc">24%</span> <u>base chance</u> of reducing the target's DEF by 16% for <span class="text-desc">3</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Vestige of Happiness`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Visage of Kinship`,
      content: `Increases the DMG multiplier for each hit of the Ultimate by <span class="text-desc">6%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Genesis of First Love`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Estrangement of Dream`,
      content: `When using the Ultimate, increases own DMG by <span class="text-desc">30%</span>, lasting until the end of the turn. In addition, the next time the Skill is used, recovers <span class="text-desc">1</span> Skill Point(s) for the team.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'misha_a4',
      text: `A4 Ult Effect Hit Rate Bonus`,
      ...talents.a4,
      show: a.a4,
      default: true,
    },
    {
      type: 'toggle',
      id: 'misha_c2',
      text: `E2 DEF Reduction`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      debuff: true,
      duration: 3,
      chance: { base: 0.24, fixed: false },
    },
    {
      type: 'toggle',
      id: 'misha_c6',
      text: `E6 DMG Bonus`,
      ...talents.c6,
      show: c >= 6,
      default: true,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'misha_c2')]

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
          name: 'Main Target',
          value: [{ scaling: calcScaling(1, 0.1, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.4, 0.04, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'First Hit',
          value: [{ scaling: calcScaling(0.36, 0.024, ult, 'curved') + (c >= 4 ? 0.06 : 0), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 10,
          chance: { base: calcScaling(0.12, 0.008, ult, 'curved') + (a.a2 ? 0.8 : 0), fixed: false },
          sum: true,
        },
        {
          name: `Bounce [x2~${c >= 1 ? 14 : 9}]`,
          value: [{ scaling: calcScaling(0.36, 0.024, ult, 'curved') + (c >= 4 ? 0.06 : 0), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 5,
          chance: { base: calcScaling(0.12, 0.008, ult, 'curved'), fixed: false },
        },
        {
          name: 'Frozen DMG',
          value: [{ scaling: calcScaling(0.18, 0.012, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.FROZEN,
          type: TalentType.NONE,
        },
      ]

      if (form.misha_a4)
        base[Stats.EHR].push({
          name: 'Ascension 4 Passive',
          source: 'Self',
          value: 0.6,
        })
      if (form.misha_c2) {
        base.DEF_REDUCTION.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.16,
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      if (form.misha_c6)
        base[Stats.ALL_DMG].push({
          name: 'Eidolon 6',
          source: 'Self',
          value: 0.3,
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
      if (form.misha_c2)
        base.DEF_REDUCTION.push({
          name: 'Eidolon 2',
          source: 'Misha',
          value: 0.16,
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
      if (countDebuff(debuffs, DebuffTypes.FROZEN) && a.a6)
        base[Stats.CRIT_DMG].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.3,
        })
      return base
    },
  }
}

export default Misha
