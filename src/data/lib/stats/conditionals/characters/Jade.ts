import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { add, chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Jade = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item.cId === '1314')

  const talents: ITalent = {
    normal: {
      title: `Lash of Riches`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Jade's ATK to a single target enemy, and <b class="text-hsr-quantum">Quantum DMG</b> equal to {{1}}% of Jade's ATK to adjacent enemies.`,
      value: [
        { base: 45, growth: 9, style: 'linear' },
        { base: 15, growth: 3, style: 'linear' },
      ],
      level: basic,
    },
    skill: {
      title: `Acquisition Surety`,
      content: `Makes a single target ally become the <b>Debt Collector</b> and increases their SPD by <span class="text-desc">30</span>, lasting for <span class="text-desc">3</span> turn(s).
      <br />After the <b>Debt Collector</b> attacks, deals <span class="text-desc">1</span> instance of Additional <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Jade's ATK to each enemy target hit, and consumes the Debt Collector's HP by an amount equal to <span class="text-desc">2%</span> of their Max HP. If the current HP is insufficient, reduces HP to <span class="text-desc">1</span>.
      <br />If Jade becomes the <b>Debt Collector</b>, she cannot gain the SPD boost effect, and her attacks do not consume HP.
      <br />When the <b>Debt Collector</b> exists on the field, Jade cannot use her Skill. At the start of Jade's every turn, the Debt Collector's duration reduces by <span class="text-desc">1</span> turn.`,
      value: [{ base: 15, growth: 1, style: 'curved' }],
      level: skill,
    },
    ult: {
      title: `Vow of the Deep`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Jade's ATK to all enemies. At the same time, Jade enhances her Talent's follow-up attack, increasing its DMG multiplier by {{1}}%. This enhancement can trigger <span class="text-desc">2</span> time(s).`,
      value: [
        { base: 120, growth: 12, style: 'curved' },
        { base: 40, growth: 4, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      title: `Fang of Flare Flaying`,
      content: `After Jade or the <b>Debt Collector</b> unit attacks, gains <span class="text-desc">1</span> point of <b>Charge</b> for each enemy target hit. Upon reaching <span class="text-desc">8</span> points of <b>Charge</b>, consumes the <span class="text-desc">8</span> points to launch <span class="text-desc">1</span> instance of follow-up attack, dealing <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Jade's ATK to all enemies. This follow-up attack does not generate <b>Charge</b>.
      <br />When launching her Talent's follow-up attack, Jade immediately gains <span class="text-desc">5</span> stack(s) of <b class="text-hsr-quantum">Pawned Asset</b>, with each stack increasing CRIT DMG by {{1}}%, stacking up to <span class="text-desc">50</span> times.`,
      value: [
        { base: 60, growth: 6, style: 'curved' },
        { base: 1.2, growth: 0.12, style: 'curved' },
      ],
      level: talent,
    },
    technique: {
      title: `Visionary Predation`,
      content: `After using the Technique, inflicts enemies within a set area with Blind Fealty for <span class="text-desc">10</span> second(s). Enemies inflicted with Blind Fealty will not initiate attacks on allies. When entering battle via actively attacking enemies inflicted with Blind Fealty, all enemies with Blind Fealty will enter combat simultaneously. After entering battle, deals <b class="text-hsr-quantum">Quantum DMG</b> equal to <span class="text-desc">50%</span> of Jade's ATK to all enemies, and immediately gains <span class="text-desc">15</span> stack(s) of <b class="text-hsr-quantum">Pawned Asset</b>.`,
    },
    a2: {
      title: `A2: Asset Forfeiture`,
      content: `Each <b class="text-hsr-quantum">Pawned Asset</b> stack from the Talent additionally increases Jade's ATK by <span class="text-desc">0.5%</span>.`,
    },
    a4: {
      title: `A4: Collateral Ticket`,
      content: `When the battle starts, Jade's action is advanced forward by <span class="text-desc">50%</span>.`,
    },
    a6: {
      title: `A6: Reverse Repo`,
      content: `When an enemy target enters combat, Jade gains <span class="text-desc">1</span> stack(s) of <b class="text-hsr-quantum">Pawned Asset</b>. When the <b>Debt Collector</b> character's turn starts, additionally gains <span class="text-desc">3</span> stack(s) of <b class="text-hsr-quantum">Pawned Asset</b>.`,
    },
    c1: {
      title: `E1: Altruism? Nevertheless Tradable`,
      content: `The follow-up attack DMG from Jade's Talent increases by <span class="text-desc">32%</span>. After the <b>Debt Collector</b> character attacks and the number of the enemy target(s) hit is either <span class="text-desc">2</span> or <span class="text-desc">1</span>, Jade additionally gains <span class="text-desc">1</span> or <span class="text-desc">2</span> point(s) of <b>Charge</b> respectively.`,
    },
    c2: {
      title: `E2: Morality? Herein Authenticated`,
      content: `When there are <span class="text-desc">15</span> stacks of <b class="text-hsr-quantum">Pawned Asset</b>, Jade's CRIT Rate increases by <span class="text-desc">18%</span>.`,
    },
    c3: {
      title: `E3: Honesty? Soon Mortgaged`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      title: `E4: Sincerity? Put Option Only`,
      content: `When using Ultimate, enables the DMG dealt by Jade to ignore <span class="text-desc">12%</span> of enemy targets' DEF, lasting for <span class="text-desc">3</span> turn(s).`,
    },
    c5: {
      title: `E5: Hope? Hitherto Forfeited`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      title: `E6: Equity? Pending Sponsorship`,
      content: `When the <b>Debt Collector</b> character exists on the field, Jade's <b class="text-hsr-quantum">Quantum RES PEN</b> increases by <span class="text-desc">20%</span>, and Jade gains the <b>Debt Collector</b> state.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'pawned',
      text: `Pawned Asset`,
      ...talents.talent,
      show: true,
      default: 0,
      min: 0,
      max: 50,
      unique: true,
    },
    {
      type: 'toggle',
      id: 'debt_collector',
      text: `Debt Collector`,
      ...talents.skill,
      show: true,
      default: false,
      unique: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'jade_c4',
      text: `E4 DEF PEN`,
      ...talents.c4,
      show: c >= 4,
      default: true,
      duration: 3,
    },
  ]

  const teammateContent: IContent[] = []

  const allyContent: IContent[] = [findContentById(content, 'debt_collector')]

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
          name: 'Main',
          value: [{ scaling: calcScaling(0.45, 0.09, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 30,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.15, 0.03, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 15,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.2, 0.12, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 60,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.6, 0.06, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 30,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.5, multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 60,
        },
      ]

      if (form.pawned) {
        base[Stats.CRIT_DMG].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.012, 0.0012, talent, 'curved') * form.pawned,
        })
        if (a.a2)
          base[Stats.P_ATK].push({
            name: 'Ascension 2 Passive',
            source: 'Self',
            value: 0.005 * form.pawned,
          })
        if (form.pawned >= 15 && c >= 2)
          base[Stats.CRIT_RATE].push({
            name: 'Eidolon 2',
            source: 'Self',
            value: 0.18,
          })
      }
      if (c >= 1)
        base.TALENT_DMG.push({
          name: 'Eidolon 1',
          source: 'Self',
          value: 0.32,
        })
      if (form.jade_c4)
        base.DEF_PEN.push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.12,
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
      const dc = _.map(allForm, (item) => item.debt_collector)
      dc[index] = c >= 6 && _.some(dc) ? true : dc[index]
      _.forEach(dc, (f, i) => {
        if (f) {
          if (i !== index)
            team[i][Stats.SPD].push({
              name: 'Skill',
              source: 'Jade',
              value: 30,
            })
          _.forEach(
            [team[i].BASIC_SCALING, team[i].SKILL_SCALING, team[i].ULT_SCALING, team[i].TALENT_SCALING],
            (s) => {
              if (_.some(s, (item) => _.includes([TalentProperty.NORMAL, TalentProperty.FUA], item.property)))
                s.push({
                  name: `Debt Collector's Additional DMG`,
                  value: [{ scaling: calcScaling(0.15, 0.01, skill, 'curved'), multiplier: Stats.ATK }],
                  element: Element.QUANTUM,
                  property: TalentProperty.ADD,
                  type: TalentType.NONE,
                })
            }
          )
        }
      })

      return base
    },
  }
}

export default Jade