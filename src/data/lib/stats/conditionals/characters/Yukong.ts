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

import { toPercentage } from '@src/core/utils/data_format'
import { IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'

const Yukong = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: `Arrowslinger`,
      content: `Deals {{0}}% of Yukong's ATK as <b class="text-hsr-imaginary">Imaginary DMG</b> to a target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Emboldening Salvo`,
      content: `Obtains <span class="text-desc">2</span> stack(s) of <b class="text-hsr-imaginary">Roaring Bowstrings</b> (to a maximum of <span class="text-desc">2</span> stacks). When <b class="text-hsr-imaginary">Roaring Bowstrings</b> is active, the ATK of all allies increases by {{0}}%, and every time an ally's turn ends, Yukong loses <span class="text-desc">1</span> stack of <b class="text-hsr-imaginary">Roaring Bowstrings</b>.
      <br />When it's the turn where Yukong gains <b class="text-hsr-imaginary">Roaring Bowstrings</b> by using Skill, <b class="text-hsr-imaginary">Roaring Bowstrings</b> will not be removed.`,
      value: [{ base: 40, growth: 4, style: 'curved' }],
      level: skill,
      tag: AbilityTag.SUPPORT,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Diving Kestrel',
      content: `If <b class="text-hsr-imaginary">Roaring Bowstrings</b> is active on Yukong when her Ultimate is used, additionally increases all allies' CRIT Rate by {{0}}% and CRIT DMG by {{1}}%. At the same time, deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{2}}% of Yukong's ATK to a single enemy.`,
      value: [
        { base: 21, growth: 0.7, style: 'curved' },
        { base: 39, growth: 2.6, style: 'curved' },
        { base: 228, growth: 15.2, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.ST,
    },
    talent: {
      trace: 'Talent',
      title: `Seven Layers, One Arrow`,
      content: `Basic ATK additionally deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Yukong's ATK, and increases the Toughness-Reducing DMG of this attack by <span class="text-desc">100%</span>. This effect can be triggered again in <span class="text-desc">1</span> turn(s).`,
      value: [{ base: 40, growth: 4, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: `Chasing the Wind`,
      content: `After using her Technique, Yukong enters Sprint mode for <span class="text-desc">20</span> seconds. In Sprint mode, her Movement SPD increases by <span class="text-desc">35%</span>, and Yukong gains <span class="text-desc">2</span> stack(s) of <b class="text-hsr-imaginary">Roaring Bowstrings</b> when she enters battle by attacking enemies.`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Archerion`,
      content: `Yukong can resist <span class="text-desc">1</span> debuff application for <span class="text-desc">1</span> time. This effect can be triggered again in <span class="text-desc">2</span> turn(s).`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Bowmaster`,
      content: `When Yukong is on the field, <b class="text-hsr-imaginary">Imaginary DMG</b> dealt by all allies increases by <span class="text-desc">12%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Majestas`,
      content: `When <b class="text-hsr-imaginary">Roaring Bowstrings</b> is active, Yukong regenerates <span class="text-desc">2</span> additional Energy every time an ally takes action.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Aerial Marshal`,
      content: `At the start of battle, increases the SPD of all allies by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Skyward Command`,
      content: `When any ally's current energy is equal to its energy limit, Yukong regenerates an additional <span class="text-desc">5</span> energy. This effect can only be triggered once for each ally. The trigger count is reset after Yukong casts her Ultimate.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Torrential Fusillade`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Zephyrean Echoes`,
      content: `When <b class="text-hsr-imaginary">Roaring Bowstrings</b> is active, Yukong deals <span class="text-desc">30%</span> more DMG to enemies.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `August Deadshot`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Bowstring Thunderclap`,
      content: `When Yukong uses her Ultimate, she immediately gains <span class="text-desc">1</span> stack(s) of <b class="text-hsr-imaginary">Roaring Bowstrings</b>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'bowstring',
      text: `Roaring Bowstring`,
      ...talents.skill,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'yukong_ult',
      text: `Ultimate CRIT Bonus`,
      ...talents.ult,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'yukong_talent',
      text: `Seven Layers, One Arrow`,
      ...talents.talent,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'yukong_c1',
      text: `E1 SPD Bonus`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'bowstring'),
    findContentById(content, 'yukong_ult'),
    findContentById(content, 'yukong_c1'),
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
          value: [
            {
              scaling:
                calcScaling(0.5, 0.1, basic, 'linear') +
                (form.yukong_talent ? calcScaling(0.4, 0.04, talent, 'curved') : 0),
              multiplier: Stats.ATK,
            },
          ],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: form.yukong_talent ? 20 : 10,
          sum: true,
          hitSplit: form.yukong_talent ? [0.2, 0.2, 0.6] : undefined,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(2.28, 0.152, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
      ]

      if (form.bowstring) {
        base[Stats.P_ATK].push({
          name: 'Skill',
          source: 'Self',
          value: calcScaling(0.4, 0.04, skill, 'curved'),
        })
        if (c >= 4)
          base[Stats.ALL_DMG].push({
            name: 'Eidolon 4',
            source: 'Self',
            value: 0.3,
          })
      }
      if (form.yukong_ult) {
        base[Stats.CRIT_RATE].push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.21, 0.007, ult, 'curved'),
        })
        base[Stats.CRIT_DMG].push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.39, 0.026, ult, 'curved'),
        })
      }
      if (a.a4)
        base[Stats.IMAGINARY_DMG].push({
          name: 'Ascension 4 Passive',
          source: 'Self',
          value: 0.12,
        })
      if (form.sushang_c2)
        base.DMG_REDUCTION.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.2,
        })
      if (form.yukong_c1)
        base[Stats.P_SPD].push({
          name: 'Eidolon 1',
          source: 'Self',
          value: 0.1,
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
      if (form.bowstring)
        base[Stats.P_ATK].push({
          name: 'Skill',
          source: 'Yukong',
          value: calcScaling(0.4, 0.04, skill, 'curved'),
        })
      if (form.yukong_ult) {
        base[Stats.CRIT_RATE].push({
          name: 'Ultimate',
          source: 'Yukong',
          value: calcScaling(0.21, 0.007, ult, 'curved'),
        })
        base[Stats.CRIT_DMG].push({
          name: 'Ultimate',
          source: 'Yukong',
          value: calcScaling(0.39, 0.026, ult, 'curved'),
        })
      }
      if (a.a4)
        base[Stats.IMAGINARY_DMG].push({
          name: 'Ascension 4 Passive',
          source: 'Yukong',
          value: 0.12,
        })
      if (form.yukong_c1)
        base[Stats.P_SPD].push({
          name: 'Eidolon 1',
          source: 'Yukong',
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
      return base
    },
  }
}

export default Yukong
