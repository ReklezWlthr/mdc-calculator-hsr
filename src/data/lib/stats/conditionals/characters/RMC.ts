import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject, StatsObjectKeys } from '../../baseConstant'
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
import { checkBuffExist } from '../../../../../core/utils/finder'

const RMC = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
    memo_skill: c >= 5 ? 1 : 0,
    memo_talent: c >= 3 ? 1 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent
  const memo_skill = t.memo_skill + upgrade.memo_skill
  const memo_talent = t.memo_talent + upgrade.memo_talent

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Leave It to Me!',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Trailblazer's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'I Choose You!',
      content: `Summons the memosprite <b>Mem</b>. If Mem is already on the field, restores <b>Mem</b>'s HP by an amount equal to {{0}}% of <b>Mem</b>'s Max HP, and grants <b>Mem</b> <span class="text-desc">10%</span> <b>Charge</b>.`,
      value: [{ base: 30, growth: 3, style: 'curved' }],
      level: skill,
      tag: AbilityTag.AOE,
    },
    summon_skill: {
      energy: 10,
      trace: 'Memosprite Skill [1]',
      title: 'Baddies! Trouble!',
      content: `Deals <span class="text-desc">4</span> instance(s) of DMG, with each instance dealing <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of <b>Mem</b>'s ATK to one random enemy. Finally, deals <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of <b>Mem</b>'s ATK to all enemies.`,
      value: [
        { base: 18, growth: 3.6, style: 'linear' },
        { base: 45, growth: 9, style: 'linear' },
      ],
      level: memo_skill,
      tag: AbilityTag.AOE,
    },
    summon_skill_2: {
      energy: 10,
      trace: 'Memosprite Skill [2]',
      title: 'Lemme! Help You!',
      content: `<u>Advances the action</u> of one designated ally by <span class="text-desc">100%</span> and grants them <b class="text-hsr-ice">Mem's Support</b>, lasting for <span class="text-desc">3</span> turn(s).
      <br />For every <span class="text-desc">1</span> instance of DMG dealt by the target that has <b class="text-hsr-ice">Mem's Support</b>, additionally deals <span class="text-desc">1</span> instance of <b class="text-red">True DMG</b> equal to {{0}}% of the original DMG.
      <br />When using this ability on this unit, cannot trigger the <u>action advance</u> effect.`,
      value: [{ base: 18, growth: 2, style: 'linear' }],
      level: memo_skill,
      tag: AbilityTag.AOE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Together, Mem!`,
      content: `Summons memosprite <b>Mem</b>. Grants <b>Mem</b> <span class="text-desc">40%</span> <b>Charge</b>, then enables <b>Mem</b> to deal <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of <b>Mem</b>'s ATK to all enemies.`,
      value: [{ base: 120, growth: 12, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      energy: 10,
      trace: 'Talent',
      title: `Almighty Companion`,
      content: `Memosprite <b>Mem</b> has an initial SPD of <span class="text-desc">130</span> and Max HP equal to {{0}}% of Trailblazer's Max HP plus {{1}}. For every <span class="text-desc">10</span> Energy regenerated by all allies in total, <b>Mem</b> gains <span class="text-desc">1%</span> <b>Charge</b>.`,
      value: [
        { base: 50, growth: 3, style: 'heal' },
        { base: 400, growth: 24, style: 'heal' },
      ],
      level: talent,
      tag: AbilityTag.AOE,
    },
    summon_talent: {
      trace: 'Memosprite Talent',
      title: `Friends! Together!`,
      content: `All allies' CRIT DMG increases by {{0}}% of <b>Mem</b>'s CRIT DMG + {{1}}%.
      <br />If the <b>Charge</b> has yet to reach <span class="text-desc">100%</span>, <b>Mem</b> automatically uses <b>Baddies! Trouble!</b> during action. When the <b>Charge</b> reaches <span class="text-desc">100%</span>, <b>Mem</b> immediately takes action, and can select one ally unit to use <b>Lemme! Help You!</b> in the next action.`,
      value: [
        { base: 6, growth: 1.2, style: 'linear' },
        { base: 12, growth: 2.4, style: 'linear' },
      ],
      level: memo_talent,
      tag: AbilityTag.AOE,
    },
    technique: {
      trace: 'Technique',
      title: 'Memories Back as Echoes',
      content: `After using Technique, creates a Special Dimension that lasts for <span class="text-desc">10</span> second(s). Enemies within the Special Dimension are placed in a Time Stop state, halting all their actions.
      <br />After entering battle against enemies afflicted with the Time Stop state, delays the action of all enemies by <span class="text-desc">50%</span>, and then deals <b class="text-hsr-ice">Ice DMG</b> to all enemies equal to <span class="text-desc">100%</span> of Trailblazer's ATK.
      <br />Only <span class="text-desc">1</span> Dimension Effect created by allies can exist at the same time.`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Rhapsode's Scepter`,
      content: `When the battle starts, Trailblazer's <u>action advances</u> by <span class="text-desc">30%</span>. When <b>Mem</b> is first summoned, grants <b>Mem</b> <span class="text-desc">40%</span> <b>Charge</b>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Petite Parable`,
      content: `When using <b>Baddies! Trouble!</b>, <b>Mem</b> immediately gains <span class="text-desc">5%</span> <b>Charge</b>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Magnets and Long Chains`,
      content: `When the Max Energy of the ally target that has <b class="text-hsr-ice">Mem's Support</b> exceeds <span class="text-desc">100</span>, for every <span class="text-desc">10</span> excess Energy, additionally increases the multiplier of the <b class="text-red">True DMG</b> dealt via <b class="text-hsr-ice">Mem's Support</b> by <span class="text-desc">2%</span>, up to a max increase of <span class="text-desc">20%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Narrator of the Present`,
      content: `Increases the CRIT Rate of the ally target with <b class="text-hsr-ice">Mem's Support</b> by <span class="text-desc">10%</span>. When an ally target has <b class="text-hsr-ice">Mem's Support</b>, its effect also takes effect on the target's memosprite/memomaster. This effect cannot stack.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Gleaner of the Past`,
      content: `When ally memosprites (aside from <b>Mem</b>) take action, Trailblazer regenerates <span class="text-desc">8</span> Energy. This effect can trigger a max of <span class="text-desc">1</span> time(s) per turn. The trigger count resets at the start of Trailblazer's turn.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Chanter of the Future`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Memosprite Talent Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Dancer of the Muse',
      content: `When an ally target with <span class="text-desc">0</span> Max Energy actively uses an ability, <b>Mem</b> can also gain <span class="text-desc">3%</span> Charge, and the multiplier of the <b class="text-red">True DMG</b> dealt by this target via <b class="text-hsr-ice">Mem's Support</b> additionally increases by <span class="text-desc">6%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Seamster of the Ode`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Memosprite Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Bearer of the Revelation',
      content: `Ultimate's CRIT Rate is set at <span class="text-desc">100%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'mem_support',
      text: `Mem's Support`,
      ...talents.summon_skill_2,
      show: true,
      default: false,
    },
    {
      type: 'toggle',
      id: 'aglaea_a6',
      text: `A6 Garmentmaker DMG Bonus`,
      ...talents.a6,
      show: a.a6,
      default: true,
      duration: 5,
    },
    {
      type: 'number',
      id: 'aglaea_c1',
      text: `E1 DEF PEN`,
      ...talents.c1,
      show: c >= 1,
      default: 2,
      min: 0,
      max: 2,
    },
  ]

  const teammateContent: IContent[] = []

  const allyContent: IContent[] = [findContentById(content, 'mem_support')]

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
      base.SUMMON_STATS = _.cloneDeep({
        ...x,
        BASE_ATK: x.BASE_ATK,
        BASE_DEF: x.BASE_DEF,
        BASE_SPD: 130,
        ELEMENT: Element.NONE,
        BASE_HP: x.getHP() * calcScaling(0.5, 0.03, talent, 'heal') + calcScaling(400, 24, talent, 'heal'),
        SUMMON_ID: '8007',
        NAME: 'Mem',
        MAX_ENERGY: 0,
      })

      if (form.supreme_stance) base.BA_ALT = true

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
      base.SKILL_SCALING = []
      base.MEMO_SKILL_SCALING = [
        {
          name: 'Max Single Target DMG',
          value: [
            ...Array(4).fill({ scaling: calcScaling(0.18, 0.036, memo_skill, 'linear'), multiplier: Stats.ATK }),
            { scaling: calcScaling(0.45, 0.09, memo_skill, 'linear'), multiplier: Stats.ATK },
          ],
          element: Element.ICE,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 30,
          sum: true,
        },
        {
          name: 'Bounce DMG',
          value: [{ scaling: calcScaling(0.18, 0.036, memo_skill, 'linear'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 5,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.45, 0.09, memo_skill, 'linear'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 10,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.2, 0.12, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.SERVANT,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 1, multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          sum: true,
        },
      ]

      if (c >= 6) {
        base.SUMMON_STATS.ULT_CR.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 1,
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
      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      all: StatsObject[],
      allForm: Record<string, any>[],
      debuffs: {
        type: DebuffTypes
        count: number
      }[],
      weakness: Element[],
      broken: boolean
    ) => {
      const index = _.findIndex(team, (item) => item.cId === '8007')

      _.forEach(all, (y, i) => {
        const multiplier = calcScaling(0.6, 0.012, skill, 'curved')
        y?.X_CRIT_DMG.push({
          name: `Skill`,
          source: i === index && all[i].SUMMON_ID ? 'Self' : 'Mem',
          value: calcScaling(0.12, 0.024, skill, 'curved') + multiplier * base.getValue(Stats.CRIT_DMG),
          multiplier,
          base: toPercentage(base.getValue(Stats.CRIT_DMG)),
          flat: toPercentage(calcScaling(0.12, 0.024, skill, 'curved')),
        })
      })

      _.forEach(allForm, (f, i) => {
        const multiplier = calcScaling(0.18, 0.02, memo_skill, 'linear')

        const memomaster = f.mem_support || (c >= 1 && all[i]?.SUMMON_STATS && f.memo?.mem_support)
        const memosprite = (all[i]?.SUMMON_STATS && f.memo?.mem_support) || (f.mem_support && c >= 1)

        if ((memomaster || memosprite) && c >= 1) {
          const exist = checkBuffExist(all[i]?.[Stats.CRIT_RATE], {
            name: `Eidolon 1`,
            source: i === index && all[i].SUMMON_ID ? 'Self' : 'Mem',
          })
          if (!exist) {
            all[i]?.[Stats.CRIT_RATE].push({
              name: `Eidolon 1`,
              source: i === index && all[i].SUMMON_ID ? 'Self' : 'Mem',
              value: 0.1,
            })
            if (all[i]?.SUMMON_STATS) {
              all[i]?.SUMMON_STATS?.[Stats.CRIT_RATE].push({
                name: `Eidolon 1`,
                source: i === index && all[i].SUMMON_ID ? 'Self' : 'Mem',
                value: 0.1,
              })
            }
          }
        }

        if (memomaster) {
          const m =
            multiplier +
            (a.a6 && all[i]?.MAX_ENERGY > 100 ? _.min([_.max([all[i]?.MAX_ENERGY - 100, 0]) * 0.002, 0.2]) : 0) +
            (c >= 4 && all[i]?.MAX_ENERGY === 0 ? 0.06 : 0)
          _.forEach([all[i].BASIC_SCALING, all[i].SKILL_SCALING, all[i].ULT_SCALING, all[i].TALENT_SCALING], (s) => {
            _.forEach(s, (ss) => {
              if (_.includes([TalentProperty.NORMAL, TalentProperty.FUA], ss.property)) {
                s.push({
                  name: `${ss.name} - Mem's Support`,
                  value: ss.value,
                  multiplier: (ss.multiplier || 1) * m,
                  element: Element.NONE,
                  property: TalentProperty.TRUE,
                  type: TalentType.NONE,
                  sum: true,
                })
              }
            })
          })
        }
        if (memosprite) {
          const m = multiplier + (c >= 4 && all[i]?.SUMMON_STATS?.MAX_ENERGY === 0 ? 0.06 : 0)

          _.forEach(
            [
              all[i].BASIC_SCALING,
              all[i].SKILL_SCALING,
              all[i].ULT_SCALING,
              all[i].TALENT_SCALING,
              all[i].MEMO_SKILL_SCALING,
            ],
            (s) => {
              _.forEach(s, (ss) => {
                if (_.includes([TalentProperty.SERVANT], ss.property)) {
                  s.push({
                    name: `${ss.name} - Mem's Support`,
                    value: ss.value,
                    multiplier: (ss.multiplier || 1) * m,
                    element: Element.NONE,
                    property: TalentProperty.TRUE,
                    type: TalentType.NONE,
                    sum: true,
                  })
                }
              })
            }
          )
        }
      })

      return base
    },
  }
}

export default RMC