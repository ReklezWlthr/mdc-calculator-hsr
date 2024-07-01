import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const RuanMei = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const index = _.findIndex(team, (item) => item?.cId === '1303')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Threading Fragrance`,
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Ruan Mei's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `String Sings Slow Swirls`,
      content: `After using her Skill, Ruan Mei gains <b>Overtone</b>, lasting for <span class="text-desc">3</span> turn(s). This duration decreases by <span class="text-desc">1</span> at the start of Ruan Mei's turn. When Ruan Mei has <b>Overtone</b>, all allies' DMG increases by {{0}}% and Weakness Break Efficiency increases by <span class="text-desc">50%</span>.`,
      value: [{ base: 16, growth: 1.6, style: 'curved' }],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Petals to Stream, Repose in Dream`,
      content: `Ruan Mei deploys a field that lasts for <span class="text-desc">2</span> turns. The field's duration decreases by <span class="text-desc">1</span> at the start of her turn.
      <br />While inside the field, all allies' All-Type RES PEN increases by {{0}}% and their attacks apply <b>Thanatoplum Rebloom</b> to the enemies hit.
      <br />When these enemies attempt to recover from Weakness Break, <b>Thanatoplum Rebloom</b> is triggered, extending the duration of their Weakness Break, delaying their action by an amount equal to <span class="text-desc">20%</span> of Ruan Mei's Break Effect plus <span class="text-desc">10%</span>, and dealing Break DMG equal to {{1}}% of Ruan Mei's <b class="text-hsr-ice">Ice Break DMG</b>.
      <br />Enemy targets cannot have <b>Thanatoplum Rebloom</b> re-applied to them until they recover from Weakness Break.`,
      value: [
        { base: 15, growth: 1, style: 'curved' },
        { base: 30, growth: 2, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Somatotypical Helix`,
      content: `Increases SPD by {{0}}% for the team (excluding this character). When allies Break an enemy target's Weakness, Ruan Mei deals to this enemy target Break DMG equal to {{1}}% of her <b class="text-hsr-ice">Ice Break DMG</b>.`,
      value: [
        { base: 8, growth: 0.2, style: 'curved' },
        { base: 60, growth: 6, style: 'curved' },
      ],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: `Silken Serenade`,
      content: `After using the Technique, gains <b>Silken Serenade</b>. At the start of the next battle, automatically triggers the Skill for <span class="text-desc">1</span> time(s) without consuming Skill Points.
      <br />In Simulated Universe, when Ruan Mei has <b>Silken Serenade</b>, the team actively attacking enemies will always be regarded as attacking their Weakness to enter battle, and this attack can reduce all enemies' Toughness regardless of Weakness types. When breaking Weakness, triggers Weakness Break Effect corresponding to the attacker's Type. For every Blessing in possession up to <span class="text-desc">20</span> Blessing(s), additionally increases the Toughness-Reducing DMG of this attack by <span class="text-desc">100%</span>. After breaking an enemy target's Weakness, additionally deals to the enemy target Break DMG equal to <span class="text-desc">100%</span> of Ruan Mei's <b class="text-hsr-ice">Ice Break DMG</b>.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Inert Respiration`,
      content: `Increases Break Effect by <span class="text-desc">20%</span> for all allies.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Days Wane, Thoughts Wax`,
      content: `Ruan Mei regenerates <span class="text-desc">5</span> Energy at the start of her turn.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Candle Lights on Still Waters`,
      content: `In battle, for every <span class="text-desc">10%</span> of Ruan Mei's Break Effect that exceeds <span class="text-desc">120%</span>, her Skill additionally increases allies' DMG by <span class="text-desc">6%</span>, up to a maximum of <span class="text-desc">36%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Neuronic Embroidery`,
      content: `While the Ultimate's field is deployed, the DMG dealt by all allies ignores <span class="text-desc">20%</span> of the target's DEF.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Reedside Promenade`,
      content: `With Ruan Mei on the field, all allies increase their ATK by <span class="text-desc">40%</span> when dealing DMG to enemies with Weakness Break.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Viridescent Pirouette`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Chatoyant Éclat`,
      content: `When an enemy target's Weakness is Broken, Ruan Mei's Break Effect increases by <span class="text-desc">100%</span> for <span class="text-desc">3</span> turn(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Languid Barrette`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Sash Cascade`,
      content: `Extends the duration of the Ultimate's field by <span class="text-desc">1</span> turn(s). The Talent's Break DMG multiplier additionally increases by <span class="text-desc">200%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'overtone',
      text: `Overtone`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'ruan_ult',
      text: `Petals to Stream, Repose in Dream`,
      ...talents.ult,
      show: true,
      default: true,
      duration: c >= 6 ? 3 : 2,
    },
    {
      type: 'toggle',
      id: 'ruan_c4',
      text: `E4 Break Effect Bonus`,
      ...talents.c4,
      show: c >= 4,
      default: true,
      duration: 3,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'overtone'), findContentById(content, 'ruan_ult')]

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
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Thanatoplum Rebloom DMG',
          value: [],
          multiplier: calcScaling(0.3, 0.02, ult, 'curved'),
          element: Element.ICE,
          property: TalentProperty.BREAK,
          type: TalentType.NONE,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Coordinate Break DMG',
          value: [],
          multiplier: calcScaling(0.6, 0.06, talent, 'curved') + (c >= 6 ? 2 : 0),
          element: Element.ICE,
          property: TalentProperty.BREAK,
          type: TalentType.NONE,
        },
      ]

      if (a.a2)
        base[Stats.BE].push({
          name: 'Ascension 2 Passive',
          source: 'Self',
          value: 0.2,
        })
      if (form.ruan_ult) {
        base.ALL_TYPE_RES_PEN.push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.15, 0.01, ult, 'curved'),
        })
        if (c >= 1)
          base.DEF_PEN.push({
            name: 'Eidolon 1',
            source: 'Self',
            value: 0.2,
          })
      }
      if (broken && c >= 2)
        base[Stats.P_ATK].push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.4,
        })
      if (form.ruan_c4)
        base[Stats.BE].push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 1,
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
      base[Stats.P_SPD].push({
        name: 'Talent',
        source: 'Ruan Mei',
        value: calcScaling(0.08, 0.002, talent, 'curved'),
      })
      if (a.a2)
        base[Stats.BE].push({
          name: 'Ascension 2 Passive',
          source: 'Ruan Mei',
          value: 0.2,
        })
      if (form.ruan_ult) {
        base.ALL_TYPE_RES_PEN.push({
          name: 'Ultimate',
          source: 'Ruan Mei',
          value: calcScaling(0.15, 0.01, ult, 'curved'),
        })
        if (c >= 1)
          base.DEF_PEN.push({
            name: 'Eidolon 1',
            source: 'Ruan Mei',
            value: 0.2,
          })
      }
      if (broken && c >= 2)
        base[Stats.P_ATK].push({
          name: 'Eidolon 2',
          source: 'Ruan Mei',
          value: 0.4,
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
      if (form.overtone) {
        _.forEach(team, (t, i) => {
          t.CALLBACK.push((x) => {
            x[Stats.ALL_DMG].push({
              name: 'Skill',
              source: i === index ? 'Self' : 'Ruan Mei',
              value:
                calcScaling(0.16, 0.016, skill, 'curved') +
                (a.a6 ? _.min([(_.max([base.getValue(Stats.BE) - 1.2, 0]) / 0.1) * 0.06, 0.36]) : 0),
            })

            return x
          })
          t.BREAK_EFF.push({
            name: 'Skill',
            source: i === index ? 'Self' : 'Ruan Mei',
            value: 0.5,
          })
        })
      }

      return base
    },
  }
}

export default RuanMei
