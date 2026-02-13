import { addDebuff, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import {
  AbilityTag,
  Element,
  GlobalModifiers,
  ITalentLevel,
  ITeamChar,
  Stats,
  TalentProperty,
  TalentType,
} from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/data_format'
import { Banger, IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'
import { CallbackType } from '@src/domain/stats'

const YaoGuang = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
    elation: c >= 5 ? 2 : c >= 3 ? 1 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent
  const elation = t.elation + upgrade.elation

  const index = _.findIndex(team, (item) => item?.cId === '1502')

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: 'Whistlebolt Sings Joy',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Yao Guang's ATK to one designated enemy and <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Yao Guang's ATK to enemies adjacent to it. Increases Energy regenerated from Basic ATK to <span class="text-desc">30</span>.`,
      value: [
        { base: 45, growth: 9, style: 'linear' },
        { base: 15, growth: 3, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
      sp: 1,
      energy: 30,
      image: 'asset/traces/SkillIcon_1502_Normal.webp',
    },
    skill: {
      trace: 'Skill',
      title: `Decalight Unveils All`,
      content: `Deploys a Zone for <span class="text-desc">3</span> turn(s). The Zone's remaining duration is reduced by <span class="text-desc">1</span> at the start of this unit's turn. While the Zone is active, increases the Elation of all allies by an amount equal to {{0}}% of Yao Guang's Elation. After using Basic ATK or Skill, Yao Guang gains <span class="text-desc">3</span> <b class="text-orange-400">Punchline(s)</b>.`,
      value: [{ base: 10, growth: 1, style: 'curved' }],
      level: skill,
      tag: AbilityTag.SUPPORT,
      sp: -1,
      energy: 30,
      image: 'asset/traces/SkillIcon_1502_BP.webp',
    },
    summon_skill: {
      trace: 'Elation Skill',
      title: 'Let Thy Fortune Burst in Flames',
      content: `Inflicts <b class="text-red">Woe's Whisper</b> on all enemies, lasting for <span class="text-desc">3</span> turn(s). Increases DMG received by enemy targets under the <b class="text-red">Woe's Whisper</b> state by <span class="text-desc">16%</span>. Deals {{0}}% <b class="text-hsr-physical">Physical <b class="elation">Elation DMG</b></b> to all enemies. Then, deals <span class="text-desc">5</span> instance(s) of {{1}}% <b class="text-hsr-physical">Physical <b class="elation">Elation DMG</b></b> to one random enemy.`,
      value: [
        { base: 50, growth: 5, style: 'curved' },
        { base: 10, growth: 1, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.AOE,
      energy: 5,
      image: 'asset/traces/SkillIcon_1502_Elation.webp',
    },
    ult: {
      trace: 'Ultimate',
      title: 'Hexagram of Feathered Fortune',
      content: `Gains <span class="text-desc">5</span> <b class="text-orange-400">Punchline(s)</b>. <b class="text-aha">Aha</b> immediately gains <span class="text-desc">1</span> extra turn where a fixed amount of <span class="text-desc">20</span> <b class="text-orange-400">Punchline(s)</b> is taken into account. This turn, does not consume <b class="text-orange-400">Punchline(s)</b>, and increases all allies' <b>All-Type RES PEN</b> by {{0}}% for <span class="text-desc">3</span> turn(s).`,
      value: [{ base: 10, growth: 1, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
      energy: 5,
      image: 'asset/traces/SkillIcon_1502_Ultra_on.webp',
    },
    talent: {
      trace: `Talent`,
      title: `Behold Wherever Light Unfolds`,
      content: `When Yao Guang possesses <b class="text-blue">Certified Banger</b>:
      <br />After an ally target uses an attack, triggers the <b class="text-desc">Great Boon</b> effect after using an attack, dealing <span class="text-desc">1</span> instance of {{0}}% <b class="elation">Elation DMG</b> of the corresponding Type to <span class="text-desc">1</span> random target hit. If Skill Points are consumed during this attack, additionally triggers <b class="text-desc">Great Boon</b> <span class="text-desc">1</span> additional time.
      <br />When triggering the <b class="text-desc">Great Boon</b> effect, if the attacker's Elation is lower than Yao Guang's, this instance of <b class="elation">Elation DMG</b> will use Yao Guang's Elation for calculation.
      <br />Triggering the <b class="text-desc">Great Boon</b> effect is not considered as using an attack.`,
      value: [{ base: 12, growth: 1.2, style: 'curved' }],
      level: talent,
      tag: AbilityTag.SUPPORT,
      image: 'asset/traces/SkillIcon_1502_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: 'Untethered Glimmer Sails Far',
      content: `After using the Technique, automatically triggers Skill <span class="text-desc">1</span> time at the start of the next battle without consuming any Skill Points. When Yao Guang is in the team, breaking destructible objects immediately grants <b>Fortune Pouch</b>, up to <span class="text-desc">8</span> within every Earth Week.`,
      tag: AbilityTag.SUPPORT,
      image: 'asset/traces/SkillIcon_1502_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Amaze-In Grace',
      content: `When Yao Guang's SPD is <span class="text-desc">120</span> or higher, increases this unit's Elation by <span class="text-desc">30%</span>. For every <span class="text-desc">1</span> points of SPD exceeded, increases this unit's Elation by <span class="text-desc">1%</span>, up to <span class="text-desc">200</span> points of excess SPD.`,
      image: 'asset/traces/SkillIcon_1502_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Poised and Sated',
      content: `Increases this unit's CRIT DMG by <span class="text-desc">60%</span>. After using Elation Skill, recovers <span class="text-desc">1</span> Skill Point(s) for the team.`,
      image: 'asset/traces/SkillIcon_1502_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Felicity Ensemble',
      content: `When Yao Guang obtains <b class="text-blue">Certified Banger</b>, increase its duration by <span class="text-desc">1</span> turn(s).`,
      image: 'asset/traces/SkillIcon_1502_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Chuckle Chimes Where Jade Falls',
      content: `In <b class="text-aha">Aha</b>'s extra turn triggered by Yao Guang's Ultimate, the fixed amount of <b class="text-orange-400">Punchline</b> taken into account increases to <span class="text-desc">40</span>. When all all targets deal <b class="elation">Elation DMG</b>, ignores <span class="text-desc">20%</span> of the target's DEF.`,
      image: 'asset/traces/SkillIcon_1502_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'Blind Arrows Guided by Feathers',
      content: `While the Zone is active, increases all ally targets' SPD by <span class="text-desc">12%</span>, and additionally increases Elation by <span class="text-desc">16%</span>.`,
      image: 'asset/traces/SkillIcon_1502_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Auspices Mirrored In Decalight',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1502_BP.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Threads of Fate Colored by Plumes',
      content: `In <b class="text-aha">Aha</b>'s extra turn triggered by Yao Guang's Ultimate, the DMG dealt by all ally characters' Elation Skill becomes <span class="text-desc">150%</span> of the original DMG.`,
      image: 'asset/traces/SkillIcon_1502_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Bejeweled in Radiant Grace',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1502_Ultra.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Ferried Along the Astral Arc',
      content: `All ally targets' <b class="elation">Elation DMG</b> merrymakes by <span class="text-desc">25%</span>. Increases the DMG multiplier of Yao Guang's Elation Skill by <span class="text-desc">100%</span> of the original multiplier.`,
      image: 'asset/traces/SkillIcon_1502_Rank6.webp',
    },
  }

  const content: IContent[] = [
    Banger,
    {
      type: 'toggle',
      id: 'yao_skill',
      text: `Yao Guang's Zone`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'yao_ult',
      text: `Ultimate All-Type RES PEN`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'woe_whisper',
      text: `Woe's Whisper`,
      ...talents.summon_skill,
      show: true,
      default: true,
      debuff: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'yao_e4',
      text: `E4 Elation Skill Multiplier`,
      ...talents.c4,
      show: c >= 4,
      default: false,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'yao_skill'),
    findContentById(content, 'yao_ult'),
    findContentById(content, 'woe_whisper'),
    findContentById(content, 'yao_e4'),
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
      broken: boolean,
      globalMod: GlobalModifiers,
    ) => {
      const base = _.cloneDeep(x)

      base.BASIC_SCALING = [
        {
          name: 'Main',
          value: [{ scaling: calcScaling(0.45, 0.09, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.15, 0.03, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 5,
        },
      ]
      base.MEMO_SKILL_SCALING = [
        {
          name: 'Max Single Target DMG',
          value: [
            { scaling: calcScaling(0.5, 0.05, elation, 'curved') * (c >= 6 ? 2 : 1), multiplier: Stats.ELATION },
            { scaling: calcScaling(0.1, 0.01, elation, 'curved') * 5 * (c >= 6 ? 2 : 1), multiplier: Stats.ELATION },
          ],
          element: Element.PHYSICAL,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: 70,
          sum: true,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.5, 0.05, elation, 'curved') * (c >= 6 ? 2 : 1), multiplier: Stats.ELATION }],
          element: Element.PHYSICAL,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: 20,
        },
        {
          name: 'DMG per Bounce',
          value: [{ scaling: calcScaling(0.1, 0.01, elation, 'curved') * (c >= 6 ? 2 : 1), multiplier: Stats.ELATION }],
          element: Element.PHYSICAL,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: 10,
        },
      ]

      if (form.yao_ult) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Ultimate`,
          source: 'Self',
          value: calcScaling(0.1, 0.01, ult, 'curved'),
        })
      }
      if (form.woe_whisper) {
        base.VULNERABILITY.push({
          name: `Woe's Whisper`,
          source: 'Self',
          value: 0.16,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (a.a4) {
        base[Stats.CRIT_DMG].push({
          name: `Ascension 4 Pasive`,
          source: 'Self',
          value: 0.6,
        })
      }
      if (c >= 1) {
        base.ELATION_DEF_PEN.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.2,
        })
      }
      if (form.yao_e4) {
        base.ELATION_SKILL_MULT.push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.5,
        })
      }
      if (c >= 6) {
        base.ELATION_MERRYMAKE.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.25,
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
      broken: boolean,
      globalMod: GlobalModifiers,
    ) => {
      if (form.yao_ult) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Ultimate`,
          source: 'Yao Guang',
          value: calcScaling(0.1, 0.01, ult, 'curved'),
        })
      }
      if (form.woe_whisper) {
        base.VULNERABILITY.push({
          name: `Woe's Whisper`,
          source: 'Yao Guang',
          value: 0.16,
        })
      }
      if (c >= 1) {
        base.ELATION_DEF_PEN.push({
          name: `Eidolon 1`,
          source: 'Yao Guang',
          value: 0.2,
        })
      }
      if (form.yao_e4) {
        base.ELATION_SKILL_MULT.push({
          name: `Eidolon 4`,
          source: 'Yao Guang',
          value: 0.5,
        })
      }
      if (c >= 6) {
        base.ELATION_MERRYMAKE.push({
          name: `Eidolon 6`,
          source: 'Yao Guang',
          value: 0.25,
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
      globalCallback: CallbackType[],
      globalMod: GlobalModifiers,
    ) => {
      globalCallback.push(function P1(_x, _d, _w, a) {
        const spd = a[index].getSpd()

        if (spd >= 120) {
          a[index][Stats.ELATION].push({
            name: `Ascension 2 Passive`,
            source: 'Self',
            value: 0.3 + _.min([spd - 120, 200]) * 0.01,
            base: _.floor(_.min([spd - 120, 200]), 1).toLocaleString(),
            multiplier: 0.01,
            flat: `30%`,
          })
        }

        _.forEach(a, (item, i) => {
          if (form.yao_skill) {
            if (c >= 2) {
              item[Stats.P_SPD].push({
                name: `Eidolon 2`,
                source: i === index ? 'Self' : 'Yao Guang',
                value: 0.12,
              })
              item[Stats.ELATION].push({
                name: `Eidolon 2`,
                source: i === index ? 'Self' : 'Yao Guang',
                value: 0.16,
              })
            }

            const elation = a[index].getValue(Stats.ELATION)

            item.X_ELATION.push({
              name: `Skill`,
              source: i === index ? 'Self' : 'Yao Guang',
              value: elation * calcScaling(0.1, 0.01, skill, 'curved'),
              base: toPercentage(elation),
              multiplier: calcScaling(0.1, 0.01, skill, 'curved'),
            })
          }
        })
        _.forEach(a, (item) => {
          if (form.banger) {
            _.forEach(
              [item.BASIC_SCALING, item.SKILL_SCALING, item.ULT_SCALING, item.TALENT_SCALING, item.MEMO_SKILL_SCALING],
              (s, ix) => {
                const add = {
                  name: 'Great Boon DMG',
                  value: [{ scaling: calcScaling(0.12, 0.012, talent, 'curved'), multiplier: Stats.ELATION }],
                  element: item.ELEMENT,
                  property: TalentProperty.ELATION,
                  type: TalentType.NONE,
                  sum: true,
                  elation: a[index].getTotalElation(),
                  punchline: form.banger,
                }
                if (
                  _.some(s, (item) =>
                    _.includes([TalentProperty.NORMAL, TalentProperty.FUA, TalentProperty.ELATION], item.property),
                  )
                ) {
                  s.push(add)
                  if (ix === 1) s.push({ ...add, name: 'Extra Great Boon DMG' })
                }
                if (_.some(s, (item) => item.property === TalentProperty.SERVANT)) {
                  s.push({
                    ...add,
                    name: add.name + ` (${item.SUMMON_STATS?.NAME})`,
                  })
                }
              },
            )
          }
        })

        return a
      })
      return base
    },
  }
}

export default YaoGuang
