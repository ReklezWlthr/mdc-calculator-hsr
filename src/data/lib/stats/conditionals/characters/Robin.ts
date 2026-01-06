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

import { toPercentage } from '@src/core/utils/data_format'
import { IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'
import { CallbackType } from '@src/domain/stats'

const Robin = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const index = _.findIndex(team, (item) => item?.cId === '1309')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Wingflip White Noise`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Robin's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Pinion's Aria`,
      content: `Increase DMG dealt by all allies by {{0}}%, lasting for <span class="text-desc">3</span> turn(s). This duration reduces by <span class="text-desc">1</span> at the start of Robin's every turn.`,
      value: [{ base: 25, growth: 2.5, style: 'curved' }],
      level: skill,
      tag: AbilityTag.SUPPORT,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Vox Harmonique, Opus Cosmique	`,
      content: `Robin enters the <b>Concerto</b> state and makes all other allies immediately take action.
      <br />While in the <b>Concerto</b> state, increase all allies' ATK by {{0}}% of Robin's ATK plus {{1}}. Moreover, after every attack by allies, Robin deals Additional <b class="text-hsr-physical">Physical DMG</b> equal to {{2}}% of her ATK for <span class="text-desc">1</span> time, with a fixed CRIT Rate for this damage set at <span class="text-desc">100%</span> and fixed CRIT DMG set at <span class="text-desc">150%</span>.
      <br />While in the <b>Concerto</b> state, Robin is immune to Crowd Control debuffs and cannot enter her turn or take action until the <b>Concerto</b> state ends.
      <br />A <b>Concerto</b> countdown appears on the Action Order bar. When the countdown's turn begins, Robin exits the <b>Concerto</b> state and immediately takes action. The countdown has its own fixed SPD of <span class="text-desc">90</span>.`,
      value: [
        { base: 15.2, growth: 0.76, style: 'curved' },
        { base: 50, growth: 15, style: 'curved' },
        { base: 9, growth: 0.6, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.SUPPORT,
    },
    talent: {
      trace: 'Talent',
      title: `Tonal Resonance`,
      content: `Increase all allies' CRIT DMG by {{0}}%. Moreover, after allies attack enemy targets, Robin additionally regenerates <span class="text-desc">2</span> Energy for herself.`,
      value: [{ base: 5, growth: 1.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    technique: {
      trace: 'Technique',
      title: `Overture of Inebriation`,
      content: `After using Technique, creates a special dimension around the character that lasts for <span class="text-desc">15</span> seconds. Enemies within this dimension will not attack Robin and will follow Robin while the dimension is active. After entering battle while the dimension is active, Robin regenerates <span class="text-desc">5</span> Energy at the start of each wave. Only <span class="text-desc">1</span> dimension created by allies can exist at the same time.`,
      tag: AbilityTag.SUPPORT,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Coloratura Cadenza`,
      content: `When the battle begins, this character's action is <u>Advanced Forward</u> by <span class="text-desc">25%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Impromptu Flourish`,
      content: `While the Concerto state is active, the CRIT DMG dealt when all allies launch <u>follow-up attacks</u> increases by <span class="text-desc">25%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Sequential Passage`,
      content: `When using Skill, additionally regenerates <span class="text-desc">5</span> Energy.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Land of Smiles`,
      content: `While the <b>Concerto</b> state is active, all allies' All-Type RES PEN increases by <span class="text-desc">24%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Afternoon Tea For Two`,
      content: `While the <b>Concerto</b> state is active, all allies' SPD increases by <span class="text-desc">16%</span>. The Talent's Energy Regeneration effect additionally increases by <span class="text-desc">1</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Inverted Tuning`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Raindrop Key`,
      content: `When using the Ultimate, dispels Crowd Control debuffs from all allies. While Robin is in the <b>Concerto</b> state, increases the Effect RES of all allies by <span class="text-desc">50%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Lonestar's Lament`,
      content: `Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Moonless Midnight`,
      content: `While the <b>Concerto</b> state is active, the CRIT DMG of the Additional <b class="text-hsr-physical">Physical DMG</b> caused by the Ultimate increases by <span class="text-desc">450%</span>. The effect of Moonless Midnight can trigger up to <span class="text-desc">8</span> time(s). And the trigger count resets each time the Ultimate is used.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'aria',
      text: `Aria`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'concerto',
      text: `Concerto`,
      ...talents.ult,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'robin_c6',
      text: `E6 Enhanced Add DMG`,
      ...talents.c6,
      show: c >= 6,
      default: true,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'aria'),
    findContentById(content, 'concerto'),
    findContentById(content, 'robin_c6'),
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
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
          hitSplit: [0.33, 0.33, 0.34],
        },
      ]

      base[Stats.CRIT_DMG].push({
        name: 'Talent',
        source: 'Self',
        value: calcScaling(0.05, 0.015, skill, 'curved'),
      })
      if (form.aria) {
        base[Stats.ALL_DMG].push({
          name: 'Skill',
          source: 'Self',
          value: calcScaling(0.25, 0.025, skill, 'curved'),
        })
      }
      if (form.concerto) {
        if (a.a4)
          base.FUA_CD.push({
            name: 'Ultimate',
            source: 'Self',
            value: 0.25,
          })
        if (c >= 1)
          base.ALL_TYPE_RES_PEN.push({
            name: 'Eidolon 1',
            source: 'Self',
            value: 0.24,
          })
        if (c >= 2)
          base[Stats.P_SPD].push({
            name: 'Eidolon 2',
            source: 'Self',
            value: 0.16,
          })
        if (c >= 4)
          base[Stats.E_RES].push({
            name: 'Eidolon 4',
            source: 'Self',
            value: 0.5,
          })
      }

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
      base[Stats.CRIT_DMG].push({
        name: 'Talent',
        source: 'Robin',
        value: calcScaling(0.05, 0.015, skill, 'curved'),
      })
      if (form.aria) {
        base[Stats.ALL_DMG].push({
          name: 'Skill',
          source: 'Robin',
          value: calcScaling(0.25, 0.025, skill, 'curved'),
        })
      }
      if (form.concerto) {
        if (a.a4)
          base.FUA_CD.push({
            name: 'Ultimate',
            source: 'Robin',
            value: 0.25,
          })
        if (c >= 1)
          base.ALL_TYPE_RES_PEN.push({
            name: 'Eidolon 1',
            source: 'Robin',
            value: 0.24,
          })
        if (c >= 2)
          base[Stats.P_SPD].push({
            name: 'Eidolon 2',
            source: 'Robin',
            value: 0.16,
          })
        if (c >= 4)
          base[Stats.E_RES].push({
            name: 'Eidolon 4',
            source: 'Robin',
            value: 0.5,
          })
      }

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
      if (form.concerto) {
        globalCallback.push(function P99(_b, _d, _w, a) {
          const atk = a[index].getAtk(true)
          _.forEach(a, (x, i) => {
            const multiplier = calcScaling(0.152, 0.0076, ult, 'curved')
            const xATK = {
              name: 'Ultimate',
              source: index === i ? 'Self' : 'Robin',
              value: multiplier * atk,
              base: atk,
              multiplier,
            }
            const bATK = {
              name: 'Ultimate',
              source: index === i ? 'Self' : 'Robin',
              value: calcScaling(50, 15, ult, 'curved'),
              flat: calcScaling(50, 15, ult, 'curved'),
            }
            x.X_ATK.push(xATK)
            x[Stats.ATK].push(bATK)
            if (x.SUMMON_STATS) {
              x.SUMMON_STATS.X_ATK.push(xATK)
              x.SUMMON_STATS[Stats.ATK].push(bATK)
            }
            if (index !== i)
              _.forEach(
                [
                  team[i].BASIC_SCALING,
                  team[i].SKILL_SCALING,
                  team[i].ULT_SCALING,
                  team[i].TALENT_SCALING,
                  team[i].MEMO_SKILL_SCALING,
                ],
                (s) => {
                  const add = {
                    name: "Concerto's Additional DMG",
                    value: [{ scaling: calcScaling(0.72, 0.048, skill, 'curved'), multiplier: Stats.ATK }],
                    element: Element.PHYSICAL,
                    property: TalentProperty.ADD,
                    type: TalentType.NONE,
                    overrideIndex: index,
                    overrideCr: 1,
                    overrideCd: form.robin_c6 ? 6 : 1.5,
                    sum: true,
                  }
                  if (_.some(s, (item) => _.includes([TalentProperty.NORMAL, TalentProperty.FUA], item.property))) {
                    s.push(add)
                  }
                  if (_.some(s, (item) => item.property === TalentProperty.SERVANT)) {
                    s.push({
                      ...add,
                      name: add.name + ` (${team[i].SUMMON_STATS?.NAME})`,
                    })
                  }
                }
              )
          })
          return a
        })
      }

      return base
    },
  }
}

export default Robin
