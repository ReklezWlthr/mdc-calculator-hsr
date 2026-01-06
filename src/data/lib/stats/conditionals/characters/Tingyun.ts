import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import {
  AbilityTag,
  Element,
  GlobalModifiers,
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
import { CallbackType } from '@src/domain/stats'
import { teamOptionGenerator } from '@src/core/utils/data_format'

const Tingyun = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1202')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Dislodged`,
      content: `Tingyun deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of her ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Soothing Melody`,
      content: `Grants a single ally with <b>Benediction</b> to increase their ATK by {{0}}%, up to {{1}}% of Tingyun's current ATK.
      <br />When the ally with <b>Benediction</b> attacks, they will deal Additional <b class="text-hsr-lightning">Lightning DMG</b> equal to {{2}}% of that ally's ATK for <span class="text-desc">1</span> time.
      <br /><b>Benediction</b> lasts for <span class="text-desc">3</span> turn(s) and is only effective on the most recent receiver of Tingyun's Skill.`,
      value: [
        { base: 25, growth: 2.5, style: 'curved' },
        { base: 15, growth: 1, style: 'curved' },
        { base: 20, growth: 2, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.SUPPORT,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Amidst the Rejoicing Clouds',
      content: `Regenerates <span class="text-desc">50</span> Energy for a single ally and increases the target's DMG by {{0}}% for <span class="text-desc">2</span> turn(s).`,
      value: [{ base: 20, growth: 3, style: 'curved' }],
      level: ult,
      tag: AbilityTag.SUPPORT,
    },
    talent: {
      trace: 'Talent',
      title: `Violet Sparknado`,
      content: `When an enemy is attacked by Tingyun, the ally with <b>Benediction</b> immediately deals Additional <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of that ally's ATK to the same enemy.`,
      value: [{ base: 30, growth: 3, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: 'Gentle Breeze',
      content: `Tingyun immediately regenerates <span class="text-desc">50</span> Energy upon using her Technique.`,
      tag: AbilityTag.SUPPORT,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Nourished Joviality`,
      content: `Tingyun's SPD increases by <span class="text-desc">20%</span> for <span class="text-desc">1</span> turn after using Skill.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Knell Subdual`,
      content: `Increases Basic ATK DMG by <span class="text-desc">40%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Jubilant Passage`,
      content: `Tingyun immediately regenerates <span class="text-desc">5</span> Energy at the start of her turn.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Windfall of Lucky Springs`,
      content: `After using their Ultimate, the ally with <b>Benediction</b> gains a <span class="text-desc">20%</span> increase in SPD for <span class="text-desc">1</span> turn.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Gainfully Gives, Givingly Gains`,
      content: `The ally with <b>Benediction</b> regenerates <span class="text-desc">5</span> Energy after defeating an enemy. This effect can only be triggered once per turn.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Halcyon Bequest`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Jovial Versatility`,
      content: `The DMG multiplier provided by <b>Benediction</b> increases by <span class="text-desc">20%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Sauntering Coquette`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Peace Brings Wealth to All`,
      content: `Ultimate regenerates <span class="text-desc">10</span> more Energy for the target ally.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'element',
      id: 'tingyun_skill',
      text: `Benediction`,
      ...talents.skill,
      show: true,
      default: '1',
      options: teamOptionGenerator(team, true),
    },
    {
      type: 'toggle',
      id: 'tingyun_ult',
      text: `Ult DMG Bonus`,
      ...talents.ult,
      show: true,
      default: false,
    },
    {
      type: 'toggle',
      id: 'tingyun_a2',
      text: `A2 SPD Bonus`,
      ...talents.a6,
      show: a.a6,
      default: true,
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'tingyun_c1',
      text: `E1 SPD Bonus`,
      ...talents.c1,
      show: c >= 1,
      default: false,
      duration: 1,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'tingyun_skill'),
    findContentById(content, 'tingyun_c1'),
  ]

  const allyContent: IContent[] = [findContentById(content, 'tingyun_ult')]

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
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
          hitSplit: [0.3, 0.7],
        },
      ]

      if (form.tingyun_ult)
        base[Stats.ALL_DMG].push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.2, 0.03, ult, 'curved'),
        })
      if (form.tingyun_a2)
        base[Stats.P_SPD].push({
          name: 'Ascension 2 Passive',
          source: 'Self',
          value: 0.2,
        })
      if (a.a4)
        base.BASIC_DMG.push({
          name: 'Ascension 4 Passive',
          source: 'Self',
          value: 0.4,
        })
      if (form.tingyun_c1)
        base[Stats.P_SPD].push({
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
      if (aForm.tingyun_ult)
        base[Stats.ALL_DMG].push({
          name: 'Ultimate',
          source: 'Tingyun',
          value: calcScaling(0.2, 0.03, ult, 'curved'),
        })
      if (aForm.tingyun_c1)
        base[Stats.P_SPD].push({
          name: 'Eidolon 1',
          source: 'Tingyun',
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
      broken: boolean,
      globalCallback: CallbackType[]
    ) => {
      globalCallback.push(function P2(_x, _d, _w, all) {
        _.forEach(all, (f, i) => {
          const buffIndex = +form.tingyun_skill - 1
          const add = {
            name: `Benediction's Additional DMG`,
            value: [
              {
                scaling: calcScaling(0.2, 0.02, skill, 'curved') + (c >= 4 ? 0.2 : 0),
                multiplier: Stats.ATK,
              },
            ],
            element: Element.LIGHTNING,
            property: TalentProperty.ADD,
            type: TalentType.NONE,
            sum: true,
          }
          if (_.includes([i, i + 10], buffIndex)) {
            const target = i >= 10 ? f?.SUMMON_STATS : f
            _.forEach(
              [
                target.BASIC_SCALING,
                target.SKILL_SCALING,
                target.ULT_SCALING,
                target.TALENT_SCALING,
                target.MEMO_SKILL_SCALING,
                target.MEMO_TALENT_SCALING,
              ],
              (s) => {
                if (
                  _.some(s, (item) =>
                    _.includes(
                      i >= 10 ? [TalentProperty.SERVANT] : [TalentProperty.NORMAL, TalentProperty.FUA],
                      item.property
                    )
                  )
                )
                  s.push(add)
              }
            )
            const raw = calcScaling(0.25, 0.025, skill, 'curved') * target.BASE_ATK
            const cap = calcScaling(0.15, 0.01, skill, 'curved') * all[index].getAtk()
            const base = cap > raw ? target.BASE_ATK : all[index].getAtk()
            const multiplier =
              cap > raw ? calcScaling(0.25, 0.025, skill, 'curved') : calcScaling(0.15, 0.01, skill, 'curved')
            target[Stats.ATK].push({
              name: 'Skill',
              source: index === i ? 'Self' : 'Tingyun',
              value: _.min([raw, cap]),
              base,
              multiplier,
            })
            if (i !== index)
              team[index].TALENT_SCALING.push({
                name: `${target.NAME}'s Additional DMG`,
                value: [{ scaling: calcScaling(0.3, 0.03, talent, 'curved'), multiplier: Stats.ATK }],
                element: Element.LIGHTNING,
                property: TalentProperty.ADD,
                type: TalentType.NONE,
                overrideIndex: i,
                sum: true,
              })
          }
        })
        return all
      })

      return base
    },
  }
}

export default Tingyun
