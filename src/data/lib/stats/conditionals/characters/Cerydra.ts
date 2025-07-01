import {
  addDebuff,
  checkBuffExist,
  countDebuff,
  countDot,
  findCharacter,
  findContentById,
} from '@src/core/utils/finder'
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
import { CallbackType } from '@src/domain/stats'

const Cerydra = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1412')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Maneuver: Expeditious Relocation`,
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Cerydra's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Ascend: From Pawn to Queen`,
      content: `Grants <b class="text-blue">Military Merit</b> to one designated ally character and give Cerydra <span class="text-desc">1</span> points of <b>Charge</b>. Maximum <b>Charge</b> is <span class="text-desc">8</span> points. When <b>Charge</b> reaches <span class="text-desc">6</span> points, <b class="text-blue">Military Merit</b> upgrades to <b class="text-sky-500">Nobility</b> and dispels their Crowd Control debuff. Characters with <b class="text-sky-500">Nobility</b> gain {{0}}% CRIT DMG boost for Skill DMG, and trigger a <b class="text-desc">Coup de Main</b> when using their Skill on enemies. After <b class="text-desc">Coup de Main</b> ends, consumes <span class="text-desc">6</span> points of <b>Charge</b> to revert <b class="text-sky-500">Nobility</b> back to <b class="text-blue">Military Merit</b>.
      <br />
      <br /><b class="text-desc">Coup de Main</b>
      <br />Copy and immediately use the ability about to be used, then use the original ability.
      <br /><b class="text-desc">Coup de Main</b> won't trigger <b class="text-desc">Coup de Main</b> again.`,
      value: [{ base: 36, growth: 3.6, style: 'curved' }],
      level: skill,
      tag: AbilityTag.ENHANCE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `All is Chess, Checkmate in Four`,
      content: `Gains <span class="text-desc">2</span> <b>Charge</b>. Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Cerydra's ATK to all enemies. If there are no characters with <b class="text-blue">Military Merit</b> on the field, prioritizes granting <b class="text-blue">Military Merit</b> to the character in position <span class="text-desc">1</span> in the team lineup.`,
      value: [{ base: 144, growth: 9.6, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `Glory to the Imperator`,
      content: `Characters with <b class="text-blue">Military Merit</b> gain increased ATK equal to {{0}}% of Cerydra's ATK. When the character uses Basic ATK or Skill, Cerydra gains <span class="text-desc">1</span> <b>Charge</b>. <b>Charge</b> cannot be gained while <b class="text-desc">Coup de Main</b> is in effect. <b class="text-blue">Military Merit</b> only takes effect the most recently affected target. When the target changes, Cerydra's <b>Charge</b> is reset to <span class="text-desc">0</span>.`,
      value: [{ base: 18, growth: 0.6, style: 'curved' }],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    technique: {
      trace: 'Technique',
      title: `First-Move Advantage`,
      content: `After using Technique, gains <b class="text-blue">Military Merit</b>. When switching active characters, <b class="text-blue">Military Merit</b> transfers to the current active character. At the start of the next battle, the Skill will automatically be used on the character holding <b class="text-blue">Military Merit</b> once without consuming any Skill Points.`,
      tag: AbilityTag.SUPPORT,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Seeker`,
      content: `When Cerydra's ATK is greater than <span class="text-desc">2000</span>, for every <span class="text-desc">100</span> ATK exceeded, increases this unit's CRIT DMG by <span class="text-desc">18%</span>, up to a maximum of <span class="text-desc">360%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Observer`,
      content: `Increases Cerydra's CRIT Rate by <span class="text-desc">100%</span>. When Cerydra's Charge is less than maximum, when a character with <b class="text-blue">Military Merit</b> uses their Ultimate for the first time, Cerydra gains <span class="text-desc">1</span> point(s) of <b>Charge</b>. This effect can only be triggered once per battle.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Conqueror`,
      content: `When using a Skill, increases the SPD of this unit and teammates with <b class="text-blue">Military Merit</b> by <span class="text-desc">20</span> for <span class="text-desc">3</span> turn(s). When a character with <b class="text-blue">Military Merit</b> uses Basic ATK or Skill, Cerydra regenerates <span class="text-desc">5</span> Energy.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Crown of Absolute Claim`,
      content: `Characters with <b class="text-blue">Military Merit</b> ignore <span class="text-desc">15%</span> of target's DEF when dealing DMG. While in <b class="text-sky-500">Nobility</b> state, additionally ignores <span class="text-desc">18%</span> of target's DEF when dealing Skill DMG.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Aspiration of the Collective`,
      content: `Characters with <b class="text-blue">Military Merit</b> deal <span class="text-desc">40%</span> more DMG. When there are teammates with <b class="text-blue">Military Merit</b> on the field, increases Cerydra's DMG by <span class="text-desc">160%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Burning of the Ancient Laws`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `The Realms Reforged`,
      content: `Increases Ultimate DMG multiplier by <span class="text-desc">240%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `A Reckoning of Deeds`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Fate in the Sea of Stars`,
      content: `Characters with <b class="text-blue">Military Merit</b> gain <span class="text-desc">20%</span> <b>All-Type RES PEN</b>, Cerydra deals an additional instance of <b class="text-hsr-wind">Wind Additional DMG</b> equal to <span class="text-desc">360%</span> of her ATK after they use an attack. This effect can be triggered up to <span class="text-desc">20</span> time(s). The trigger count resets whenever Cerydra uses her Ultimate. When an ally with <b class="text-blue">Military Merit</b> is present, Cerydra gains <span class="text-desc">20%</span> <b>All-Type RES PEN</b>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'cerydra_a6',
      text: `A6 SPD Bonus`,
      ...talents.a6,
      show: a.a6,
      default: false,
      duration: 3,
    },
    {
      type: 'element',
      id: 'military_merit',
      text: `Military Merit Tier`,
      ...talents.talent,
      show: true,
      default: '0',
      options: [
        { name: 'None', value: '0' },
        { name: 'Military Merit', value: '1' },
        { name: 'Nobility', value: '2' },
      ],
      excludeSummon: true,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'cerydra_a6')]

  const allyContent: IContent[] = [findContentById(content, 'military_merit')]

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
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.44, 0.096, ult, 'linear') + (c >= 4 ? 2.4 : 0), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
      ]

      if (a.a4) {
        base[Stats.CRIT_RATE].push({
          name: 'Ascension 4 Passive',
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
      globalCallback.push(function P3(_x, _d, _w, all) {
        const cap = calcScaling(0.18, 0.006, ult, 'curved') * all[index].getAtk()
        const atk = {
          name: 'Military Merit',
          value: cap,
          base: all[index].getAtk(),
          multiplier: calcScaling(0.18, 0.006, ult, 'curved'),
        }
        const cd = {
          name: 'Nobility',
          value: calcScaling(0.36, 0.036, skill, 'curved'),
        }

        _.forEach(all, (f, i) => {
          if (allForm[i].military_merit >= 1) {
            f.X_ATK.push({ ...atk, source: index === i ? 'Self' : 'Cerydra' })
            if (form.cerydra_a6 && index !== i) {
              f[Stats.SPD].push({
                name: 'Ascension 6 Passive',
                value: 20,
                source: 'Cerydra',
              })
            }
            if (c >= 6 && index !== i) {
              if (c >= 6) {
                base.ALL_TYPE_RES_PEN.push({
                  name: 'Eidolon 6',
                  value: 0.2,
                  source: 'Cerydra',
                })
              }
            }
            if (c >= 1) {
              f.DEF_PEN.push({
                name: 'Eidolon 1',
                value: 0.15,
                source: index === i ? 'Self' : 'Cerydra',
              })
            }
            if (c >= 2) {
              f[Stats.ALL_DMG].push({
                name: 'Eidolon 2',
                value: 0.4,
                source: index === i ? 'Self' : 'Cerydra',
              })
            }
            if (c >= 6) {
              _.forEach([f.BASIC_SCALING, f.SKILL_SCALING, f.ULT_SCALING, f.TALENT_SCALING], (item) => {
                if (_.some(item, (v) => _.includes([TalentProperty.NORMAL, TalentProperty.FUA], v.property))) {
                  item.push({
                    name: `Cerydra's E6 Additional DMG`,
                    value: [{ scaling: 3.6, multiplier: Stats.ATK }],
                    element: Element.WIND,
                    property: TalentProperty.ADD,
                    type: TalentType.NONE,
                    sum: true,
                  })
                }
              })
            }
            if (allForm[i].military_merit >= 2) {
              f.SKILL_CD.push({ ...cd, source: index === i ? 'Self' : 'Cerydra' })
              if (c >= 1) {
                f.SKILL_DEF_PEN.push({
                  name: 'Eidolon 1',
                  value: 0.18,
                  source: index === i ? 'Self' : 'Cerydra',
                })
              }
            }
          }
        })
        return all
      })

      if (_.some(allForm, (item) => item.military_merit)) {
        if (form.cerydra_a6) {
          base[Stats.SPD].push({
            name: 'Ascension 6 Passive',
            value: 20,
            source: 'Self',
          })
        }
        if (c >= 2) {
          base[Stats.CRIT_DMG].push({
            name: 'Eidolon 2',
            value: 1.6,
            source: 'Self',
          })
        }
        if (c >= 6) {
          base.ALL_TYPE_RES_PEN.push({
            name: 'Eidolon 6',
            value: 0.2,
            source: 'Self',
          })
        }
      }

      if (a.a2) {
        base.CALLBACK.push(function P99(f) {
          const base = _.max([f.getAtk() - 2000, 0])
          f[Stats.CRIT_DMG].push({
            name: 'Ascension 2 Passive',
            source: 'Self',
            value: _.min([(base / 100) * 0.18, 3.6]),
            base: `(${_.min([2000, base]).toLocaleString()} ÷ 100)`,
            multiplier: 0.18,
          })
          return f
        })
      }

      return base
    },
  }
}

export default Cerydra
