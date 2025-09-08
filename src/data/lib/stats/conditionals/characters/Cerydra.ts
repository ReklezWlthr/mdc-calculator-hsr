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
      title: `King's Castling`,
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Cerydra's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Pawn's Promotion`,
      content: `Grants <b class="text-blue">Military Merit</b> to one designated ally character and give Cerydra <span class="text-desc">1</span> points of <b>Charge</b>. Maximum <b>Charge</b> is <span class="text-desc">8</span> points. When <b>Charge</b> reaches <span class="text-desc">6</span> points, automatically upgrades the character's <b class="text-blue">Military Merit</b> to <b class="text-sky-500">Peerage</b> and dispels their Crowd Control debuffs. The character with <b class="text-sky-500">Peerage</b> are considered to have <b class="text-blue">Military Merit</b> simultaneously. The character with <b class="text-sky-500">Peerage</b> the CRIT DMG for their dealt Skill DMG by {{0}}%, increases their <b>All-Type RES PEN</b> by {{1}}%, and triggers <b class="text-desc">Coup de Main</b> when using their Skill on enemy targets. After <b class="text-desc">Coup de Main</b> ends, consumes <span class="text-desc">6</span> points of <b>Charge</b> to revert <b class="text-sky-500">Peerage</b> back to <b class="text-blue">Military Merit</b>.
      <br />
      <br /><b class="text-desc">Coup de Main</b>
      <br />Copy and immediately use the ability about to be used, then use the original ability.
      <br /><b class="text-desc">Coup de Main</b> won't trigger <b class="text-desc">Coup de Main</b> again.`,
      value: [
        { base: 36, growth: 3.6, style: 'curved' },
        { base: 8, growth: 0.2, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.ENHANCE,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Scholar's Mate`,
      content: `Gains <span class="text-desc">2</span> <b>Charge</b>. Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Cerydra's ATK to all enemies. If no character on the field has <b class="text-blue">Military Merit</b> on the field, prioritizes granting <b class="text-blue">Military Merit</b> to the first character in the current team.`,
      value: [{ base: 144, growth: 9.6, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `Ave Imperator`,
      content: `The character with <b class="text-blue">Military Merit</b> increases ATK by an amount equal to {{0}}% of Cerydra's ATK. When the character uses Basic ATK or Skill, Cerydra gains <span class="text-desc">1</span> <b>Charge</b>. During <b class="text-desc">Coup de Main</b>, Cerydra cannot gain <b>Charge</b>. After the character with <b class="text-blue">Military Merit</b> uses an attack, Cerydra additionally deals <span class="text-desc">1</span> instance of <b class="text-hsr-wind">Wind Additional DMG</b> equal to {{1}}% of her ATK. This effect can be triggered up to <span class="text-desc">20</span> time(s). The trigger count resets whenever Cerydra uses her Ultimate. <b class="text-blue">Military Merit</b> only takes effect on the most recent target. When the target changes, Cerydra's <b>Charge</b> is reset to <span class="text-desc">0</span>.`,
      value: [
        { base: 18, growth: 0.6, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    technique: {
      trace: 'Technique',
      title: `First-Move Advantage`,
      content: `After using Technique, gains <b class="text-blue">Military Merit</b>. When switching the active character, <b class="text-blue">Military Merit</b> transfers to the current active character. At the start of the next battle, automatically uses Skill <span class="text-desc">1</span> time on the character with <b class="text-blue">Military Merit</b> without consuming any Skill Points.`,
      tag: AbilityTag.SUPPORT,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Veni`,
      content: `For every <span class="text-desc">100</span> of Cerydra's ATK that exceeds <span class="text-desc">2,000</span>, increases her CRIT DMG by <span class="text-desc">18%</span>, up to a max increase of <span class="text-desc">360%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Vidi`,
      content: `Increases Cerydra's CRIT Rate by <span class="text-desc">100%</span>. While Cerydra's <b>Charge</b> is below its maximum, the character with <b class="text-blue">Military Merit</b> using their Ultimate grants Cerydra <span class="text-desc">1</span> <b>Charge</b>. This effect can trigger once per battle.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Vici`,
      content: `When using a Skill, increases SPD by <span class="text-desc">20</span> for this unit and the teammate with <b class="text-blue">Military Merit</b>, lasting for <span class="text-desc">3</span> turn(s). When the character with <b class="text-blue">Military Merit</b> uses Basic ATK or Skill, regenerates <span class="text-desc">5</span> Energy for Cerydra.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Seize the Crowns of All`,
      content: `The character with <b class="text-blue">Military Merit</b> ignores <span class="text-desc">16%</span> of their target's DEF when dealing DMG. If <b class="text-blue">Military Merit</b> is upgraded to <b class="text-sky-500">Peerage</b>, then the character additionally ignores <span class="text-desc">20%</span> of the target's DEF when dealing Skill DMG. When Cerydra uses her Skill, regenerates <span class="text-desc">2</span> Energy for the designated ally target.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Forge the Dreams of Many`,
      content: `The character with <b class="text-blue">Military Merit</b> deals <span class="text-desc">40%</span> increased DMG. While a teammate on the field has <b class="text-blue">Military Merit</b>, Cerydra's DMG dealt increases by <span class="text-desc">160%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Torch the Laws of Old`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Remake the Realms of Men`,
      content: `Increases Ultimate's DMG multiplier by <span class="text-desc">240%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Help and Hurt Repaid in Full`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `A Journey Set Starward`,
      content: `The character with <b class="text-blue">Military Merit</b> increases their <b>All-Type RES PEN</b> by <span class="text-desc">20%</span>, and the multiplier for the <b>Additional DMG</b> triggered via <b class="text-blue">Military Merit</b> increases by <span class="text-desc">300%</span>. While a teammate on the field has <b class="text-blue">Military Merit</b>, Cerydra's <b>All-Type RES PEN</b> increases by <span class="text-desc">20%</span>.`,
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
        { name: 'Peerage', value: '2' },
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
          name: 'Peerage',
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
                value: 0.16,
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
            _.forEach(
              [f.BASIC_SCALING, f.SKILL_SCALING, f.ULT_SCALING, f.TALENT_SCALING, f.MEMO_SKILL_SCALING],
              (item) => {
                if (_.some(item, (v) => _.includes([TalentProperty.NORMAL, TalentProperty.FUA], v.property))) {
                  item.push({
                    name: `Military Merit Additional DMG`,
                    value: [
                      { scaling: calcScaling(0.3, 0.03, talent, 'curved') + (c >= 6 ? 3 : 0), multiplier: Stats.ATK },
                    ],
                    element: Element.WIND,
                    property: TalentProperty.ADD,
                    type: TalentType.NONE,
                    sum: true,
                    overrideIndex: index,
                  })
                }
              }
            )
            if (allForm[i].military_merit >= 2) {
              f.SKILL_CD.push({ ...cd, source: index === i ? 'Self' : 'Cerydra' })
              f.ALL_TYPE_RES_PEN.push({
                name: 'Peerage',
                value: 0.1,
                source: index === i ? 'Self' : 'Cerydra',
              })
              if (c >= 1) {
                f.SKILL_DEF_PEN.push({
                  name: 'Eidolon 1',
                  value: 0.2,
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
        globalCallback.push(function P999(_1, _2, _3, a) {
          const base = _.max([a[index].getAtk() - 2000, 0])
          a[index][Stats.CRIT_DMG].push({
            name: 'Ascension 2 Passive',
            source: 'Self',
            value: _.min([(base / 100) * 0.18, 3.6]),
            base: `(${_.min([2000, base]).toLocaleString()} ÷ 100)`,
            multiplier: 0.18,
          })
          return a
        })
      }

      return base
    },
  }
}

export default Cerydra
