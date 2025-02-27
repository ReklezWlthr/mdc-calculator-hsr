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

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Tribbie = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1403')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Hundred Rockets`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Tribbie's Max HP to one designated enemy. Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{1}}% of Tribbie's Max HP to adjacent targets.`,
      value: [
        { base: 15, growth: 3, style: 'linear' },
        { base: 7.5, growth: 1.5, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Where'd the Gifts Go`,
      content: `Gains <b class="text-violet-300">Numinosity</b>, lasting for <span class="text-desc">3</span> turn(s). This duration decreases by <span class="text-desc">1</span> at the start of this unit's every turn. While Tribbie has <b class="text-violet-300">Numinosity</b>, increases all ally targets' All-Type RES PEN by {{0}}%.`,
      value: [{ base: 12, growth: 1.2, style: 'curved' }],
      level: skill,
      tag: AbilityTag.SUPPORT,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Guess Who Lives Here`,
      content: `Activates a Zone and deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Tribbie's Max HP to all enemies.
      <br />While the Zone lasts, increases enemy targets' DMG taken by {{0}}%. After an ally target attacks, for every <span class="text-desc">1</span> target hit, deals <span class="text-desc">1</span> instance of <b class="text-hsr-quantum">Quantum Additional DMG</b> equal to {{1}}% of Tribbie's Max HP to the target that has the highest HP among the hit targets.
      <br />The Zone lasts for <span class="text-desc">2</span> turn(s). This duration decreases by <span class="text-desc">1</span> at the start of this unit's every turn.`,
      value: [
        { base: 15, growth: 1.5, style: 'curved' },
        { base: 6, growth: 0.6, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      energy: 5,
      trace: 'Talent',
      title: `Busy as Tribbie`,
      content: `After other ally characters use Ultimate, Tribbie launches <u>Follow-up ATK</u>, dealing <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Tribbie's Max HP to all enemies. This effect can only be triggered <span class="text-desc">1</span> time per character. When Tribbie uses Ultimate, resets the trigger count for other ally characters. If the target was defeated before the <u>Follow-up ATK</u> is launched, then launches the <u>Follow-up ATK</u> against new enemy targets entering the battlefield.`,
      value: [{ base: 9, growth: 0.9, style: 'curved' }],
      level: talent,
      tag: AbilityTag.AOE,
    },
    technique: {
      trace: 'Technique',
      title: `If You're Happy and You Know It`,
      content: `After using Technique and upon entering battle, obtains <b class="text-violet-300">Numinosity</b>, lasting for <span class="text-desc">3</span> turn(s).`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Lamb Outside the Wall...`,
      content: `After using Talent's <u>Follow-up ATK</u>, increases the DMG dealt by Tribbie by <span class="text-desc">72%</span>. This effect can stack up to <span class="text-desc">3</span> time(s), lasting for <span class="text-desc">3</span> turn(s).`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Glass Ball with Wings!`,
      content: `While the Zone lasts, Tribbie's Max HP increases by an amount equal to <span class="text-desc">9%</span> of the sum of all ally characters' Max HP.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Pebble at Crossroads?`,
      content: `At the start of the battle, Tribbie regenerates <span class="text-desc">30</span> Energy. After other ally targets attack, Tribbie regenerates <span class="text-desc">1.5</span> Energy for each target hit.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Rite of Sugar Scoop`,
      content: `While the Zone lasts, after ally targets attack enemies, additionally deals <b class="text-red">True DMG</b> equal to <span class="text-desc">24%</span> of the total DMG of this attack to the targets that have been dealt Additional DMG by the Zone.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Guide of Dream Tour`,
      content: `The Additional DMG dealt by the Zone increases to <span class="text-desc">120%</span> of the original DMG. When the Zone deals Additional DMG, further deals <span class="text-desc">1</span> instance(s) of Additional DMG.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Trove of Morning Glow`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Peace of Empathy Bond`,
      content: `While <b class="text-violet-300">Numinosity</b> lasts, the DMG dealt by all allies ignores <span class="text-desc">18%</span> of the target's DEF.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Clock of Wonder Origin`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Morrow of Star Shine`,
      content: `After Tribbie uses Ultimate, launches her Talent's <u>Follow-up ATK</u> against all enemies. The DMG dealt by Talent's <u>Follow-up ATK</u> increases by <span class="text-desc">729%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'numinosity',
      text: `Numinosity`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'tribbie_ult',
      text: `Guess Who Lives Here`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 3,
      unique: true,
    },
    {
      type: 'number',
      id: 'tribbie_a2',
      text: `A2 DMG Bonus`,
      ...talents.a2,
      show: a.a2,
      default: 1,
      min: 0,
      max: 3,
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'numinosity'), findContentById(content, 'tribbie_ult')]

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
          value: [{ scaling: calcScaling(0.15, 0.03, basic, 'linear'), multiplier: Stats.HP }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.075, 0.015, basic, 'linear'), multiplier: Stats.HP }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 5,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.15, 0.015, ult, 'curved'), multiplier: Stats.HP }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.09, 0.009, talent, 'curved'), multiplier: Stats.HP }],
          element: Element.QUANTUM,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 5,
          bonus: c >= 6 ? 7.29 : 0,
          sum: true,
        },
      ]

      if (form.numinosity) {
        base.ALL_TYPE_RES_PEN.push({
          name: 'Numinosity',
          source: 'Self',
          value: calcScaling(0.12, 0.012, skill, 'curved'),
        })
        if (c >= 4) {
          base.DEF_PEN.push({
            name: 'Eidolon 2',
            source: 'Self',
            value: 0.18,
          })
        }
      }
      if (form.tribbie_ult) {
        base.VULNERABILITY.push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.15, 0.015, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.tribbie_a2) {
        base[Stats.ALL_DMG].push({
          name: 'Ascension 2 Passive',
          source: 'Self',
          value: 0.72 * form.tribbie_a2,
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
      if (form.numinosity) {
        base.ALL_TYPE_RES_PEN.push({
          name: 'Numinosity',
          source: 'Tribbie',
          value: calcScaling(0.12, 0.012, skill, 'curved'),
        })
        if (c >= 4) {
          base.DEF_PEN.push({
            name: 'Eidolon 2',
            source: 'Tribbie',
            value: 0.18,
          })
        }
      }
      if (form.tribbie_ult) {
        base.VULNERABILITY.push({
          name: 'Ultimate',
          source: 'Tribbie',
          value: calcScaling(0.15, 0.015, ult, 'curved'),
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
      broken: boolean
    ) => {
      _.last(team).CALLBACK.push(function P99(x, _d, _w, all) {
        if (form.tribbie_ult && a.a4) {
          all[index].X_HP.push({
            name: 'Ascension 4 Passive',
            source: 'Self',
            value: _.sumBy(all, (t) => t.getHP()) * 0.09,
            base: _.sumBy(all, (t) => t.getHP()),
            multiplier: 0.09,
          })
        }
        if (form.tribbie_ult) {
          _.forEach(all, (t) =>
            _.forEach([t.BASIC_SCALING, t.SKILL_SCALING, t.ULT_SCALING, t.TALENT_SCALING], (s) => {
              if (
                _.some(
                  s,
                  (ss) => !_.includes([TalentProperty.HEAL, TalentProperty.SHIELD, TalentProperty.TRUE], ss.property)
                )
              ) {
                s.push({
                  name: 'Additional DMG per Enemy',
                  value: [{ scaling: calcScaling(0.06, 0.006, ult, 'curved'), multiplier: Stats.HP }],
                  element: Element.QUANTUM,
                  property: TalentProperty.ADD,
                  type: TalentType.NONE,
                  multiplier: c >= 2 ? 1.2 : 1,
                  overrideIndex: index,
                  sum: true,
                })
              }
              if (c >= 1) {
                _.forEach(s, (ss) => {
                  if (!_.includes([TalentProperty.HEAL, TalentProperty.SHIELD, TalentProperty.TRUE], ss.property)) {
                    s.push({
                      name: `${ss.name} - Tribbie`,
                      value: ss.value,
                      multiplier: (ss.multiplier || 1) * 0.24,
                      element: ss.element,
                      property: TalentProperty.TRUE,
                      type: ss.type,
                      sum: ss.sum,
                      break: ss.break * 0.24,
                    })
                  }
                })
              }
            })
          )
        }
        return x
      })

      return base
    },
  }
}

export default Tribbie
