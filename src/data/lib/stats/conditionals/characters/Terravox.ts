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
import { CallbackType } from '@src/domain/stats'
import { teamOptionGenerator } from '@src/core/utils/data_format'

const Terravox = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1414')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Aegis Vitae`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Dan Heng • Permansor Terrae's ATK to one designated enemy.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Terra Omnibus`,
      content: `Designates one ally character as a <b class="text-desc">Bondmate</b> and provides all allies with a <b class="text-indigo-300">Shield</b> that can offset DMG equal to {{0}}% of Dan Heng • Permansor Terrae's ATK plus {{1}} for <span class="text-desc">3</span> turn(s). When receiving Dan Heng • Permansor Terrae's <b class="text-indigo-300">Shield</b> repeatedly, the <b class="text-indigo-300">Shield</b> Effect can stack but will not exceed <span class="text-desc">300%</span> of the <b class="text-indigo-300">Shield</b> provided by the current Skill.
      <br /><b class="text-desc">Bondmate</b> only applies to the most recent target of Dan Heng • Permansor Terrae's Skill.`,
      value: [
        { base: 14, growth: 0.75, style: 'heal' },
        { base: 100, growth: 60, style: 'flat' },
      ],
      level: skill,
      tag: AbilityTag.DEFENSE,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `A Dragon's Zenith Knows No Rue`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Dan Heng • Permansor Terrae's ATK to all enemies, and provides a <b class="text-indigo-300">Shield</b> to all allies that can offset DMG equal to {{1}}% of Dan Heng • Permansor Terrae's ATK plus {{2}}, lasting for <span class="text-desc">3</span> turn(s). When repeatedly receiving Dan Heng • Permansor Terrae's <b class="text-indigo-300">Shield</b>, the <b class="text-indigo-300">Shield</b> Effect can be stacked, up to <span class="text-desc">300%</span> of the <b class="text-indigo-300">Shield</b> provided by the current Skill.
      <br /><b class="text-hsr-physical">Souldragon</b> becomes enhanced, and when <b class="text-hsr-physical">Souldragon</b> takes action, triggers a <u>Follow-up ATK</u> that deals <b class="text-hsr-physical">Physical DMG</b> equal to {{3}}% of Dan Heng • Permansor Terrae's ATK and <b>Additional DMG</b> of the <b class="text-desc">Bondmate</b>'s Type equal to {{3}}% of the <b class="text-desc">Bondmate</b>'s ATK to all enemies. Enhancement lasts for <span class="text-desc">2</span> <b class="text-hsr-physical">Souldragon</b> action(s).`,
      value: [
        { base: 150, growth: 15, style: 'curved' },
        { base: 14, growth: 0.75, style: 'heal' },
        { base: 100, growth: 60, style: 'flat' },
        { base: 40, growth: 4, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `Of Virtue, Forms Unfold`,
      content: `When an ally character becomes a <b class="text-desc">Bondmate</b>, Dan Heng • Permansor Terrae summons <b class="text-hsr-physical">Souldragon</b> with an initial SPD of <span class="text-desc">165</span>.
      <br />When <b class="text-hsr-physical">Souldragon</b> takes action, dispels <span class="text-desc">1</span> debuff(s) from all allies and provides a <b class="text-indigo-300">Shield</b> that can offset DMG equal to {{0}}% of Dan Heng • Permansor Terrae's ATK plus {{1}} for <span class="text-desc">3</span> turn(s). The <b class="text-indigo-300">Shield</b> Effect provided by Dan Heng • Permansor Terrae and <b class="text-hsr-physical">Souldragon</b> can be stacked, up to <span class="text-desc">300%</span> of the <b class="text-indigo-300">Shield</b> provided by Dan Heng • Permansor Terrae's Skill.
      <br /><b class="text-hsr-physical">Souldragon</b> disappears when Dan Heng • Permansor Terrae or the <b class="text-desc">Bondmate</b> is knocked down.`,
      value: [
        { base: 7, growth: 0.375, style: 'heal' },
        { base: 50, growth: 30, style: 'flat' },
      ],
      level: talent,
      tag: AbilityTag.DEFENSE,
    },
    technique: {
      trace: 'Technique',
      title: `Earthrend`,
      content: `After using Technique, gains <b class="text-desc">Bondmate</b> and inflict Daze on enemies in a certain area for <span class="text-desc">10</span> second(s). Enemies in Daze state will not actively attack ally targets.
      <br />When switching active characters, <b class="text-desc">Bondmate</b> transfers to the current active character. At the start of the next combat, automatically use Skill once on the character with <b class="text-desc">Bondmate</b> without consuming Skill Points.`,
      tag: AbilityTag.IMPAIR,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Empyreanity`,
      content: `When using Skill, increases the ATK of the <b class="text-desc">Bondmate</b> target by <span class="text-desc">15%</span> of Dan Heng • Permansor Terrae's ATK.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Sylvanity`,
      content: `When the battle begins, advances Dan Heng • Permansor Terrae's action by <span class="text-desc">40%</span>. When the <b class="text-desc">Bondmate</b> uses an attack, Dan Heng • Permansor Terrae regenerates <span class="text-desc">6</span> Energy and advances <b class="text-hsr-physical">Souldragon</b>'s action by <span class="text-desc">15%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Sublimity`,
      content: `When <b class="text-hsr-physical">Souldragon</b> takes action, additionally provides a <b class="text-indigo-300">Shield</b> that can offset DMG equal to <span class="text-desc">5%</span> of Dan Heng • Permansor Terrae's ATK plus <span class="text-desc">100</span> to the ally target with the lowest current <b class="text-indigo-300">Shield</b> Effect. When repeatedly receiving Dan Heng • Permansor Terrae's <b class="text-indigo-300">Shield</b>, the <b class="text-indigo-300">Shield</b> Effect can be stacked, up to <span class="text-desc">300%</span> of the <b class="text-indigo-300">Shield</b> provided by the current Skill. When enhanced <b class="text-hsr-physical">Souldragon</b> takes action, further deals <span class="text-desc">1</span> instance of <b>Additional DMG</b> of the <b class="text-desc">Bondmate</b>'s Type equal to <span class="text-desc">40%</span> of <b class="text-desc">Bondmate</b>'s ATK to the enemy with the highest current HP.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Shed Scales of Old`,
      content: `When Dan Heng • Permansor Terrae uses his Ultimate, recovers <span class="text-desc">1</span> Skill Point(s) for the team and increases the <b class="text-desc">Bondmate</b>'s <b>All-Type RES PEN</b> by <span class="text-desc">18%</span> for <span class="text-desc">3</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Watch Trails to Blaze`,
      content: `Additionally increases the number of Ultimate enhancements by <span class="text-desc">2</span> time(s). After Dan Heng • Permansor Terrae uses Ultimate, <b class="text-hsr-physical">Souldragon</b>'s action advances by <span class="text-desc">100%</span>. When the enhanced <b class="text-hsr-physical">Souldragon</b> takes action, the <b>Additional DMG</b> dealt by the <b class="text-desc">Bondmate</b> is <span class="text-desc">200%</span> of the original DMG, and the <b class="text-indigo-300">Shield</b> Effect it provides in this instance is <span class="text-desc">200%</span> of the original <b class="text-indigo-300">Shield</b> Effect.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Bear Weight of Worlds`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `By Oath, This Vessel Is I`,
      content: `Reduces DMG taken by <b class="text-desc">Bondmate</b> by <span class="text-desc">20%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `The Path of Permanence Sweeps Far`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `One Dream to Enfold All Wilds`,
      content: `When there is a <b class="text-desc">Bondmate</b> on the field, increases the DMG received by all enemies by <span class="text-desc">20%</span>. When the <b class="text-desc">Bondmate</b> deals DMG, ignores <span class="text-desc">12%</span> of the enemy target's DEF. When Dan Heng • Permansor Terrae uses his Ultimate, the <b class="text-desc">Bondmate</b> will deal <b>Additional DMG</b> of their corresponding Type to all enemies equal to <span class="text-desc">330%</span> of <b class="text-desc">Bondmate</b>'s ATK.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'element',
      id: 'bondmate',
      text: `Bondmate`,
      ...talents.skill,
      show: true,
      default: '1',
      options: teamOptionGenerator(team),
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'bondmate')]

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
          hitSplit: [0.3, 0.7],
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Maximum Shield',
          value: [{ scaling: calcScaling(0.14, 0.0075, skill, 'heal'), multiplier: Stats.ATK }],
          flat: calcScaling(100, 60, skill, 'flat'),
          multiplier: 3,
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
          sum: true,
        },
        {
          name: 'Cast Shield',
          value: [{ scaling: calcScaling(0.14, 0.0075, skill, 'heal'), multiplier: Stats.ATK }],
          flat: calcScaling(100, 60, skill, 'flat'),
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.5, 0.15, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
        {
          name: 'Cast Shield',
          value: [{ scaling: calcScaling(0.14, 0.0075, ult, 'heal'), multiplier: Stats.ATK }],
          flat: calcScaling(100, 60, ult, 'flat'),
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
          multiplier: c >= 2 ? 2 : 1,
        },
        {
          name: `Souldragon Follow-up ATK`,
          value: [{ scaling: calcScaling(0.4, 0.04, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.NONE,
          hitSplit: [0.25, 0.25, 0.25, 0.25],
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Souldragon Shield',
          value: [{ scaling: calcScaling(0.07, 0.00375, talent, 'heal'), multiplier: Stats.ATK }],
          flat: calcScaling(50, 30, talent, 'flat'),
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
        },
      ]

      if (a.a6) {
        base.TALENT_SCALING.push({
          name: 'Souldragon Shield (A6 Least Shield)',
          value: [{ scaling: calcScaling(0.07, 0.00375, talent, 'heal') + 0.05, multiplier: Stats.ATK }],
          flat: calcScaling(50, 30, talent, 'flat') + 100,
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
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
      _.forEach(team, (x, i) => {
        if (+form.bondmate - 1 === i && x?.cId === base.ID) {
          base.SUMMON = true
        }
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
      globalCallback.push(function P99(_b, _d, _w, all) {
        const atk = all[index].getAtk(true)
        const xATK = {
          name: 'Bondmate',
          value: 0.15 * atk,
          base: atk,
          multiplier: 0.15,
        }
        _.forEach(all, (x, i) => {
          if (+form.bondmate - 1 === i && x?.ID) {
            x.X_ATK.push({ ...xATK, source: index === i ? 'Self' : 'Dan Heng • Permansor Terrae' })
            if (x.SUMMON_STATS) {
              x.SUMMON_STATS.X_ATK.push({ ...xATK, source: index === i ? 'Self' : 'Dan Heng • Permansor Terrae' })
            }
            base.ULT_SCALING.push({
              name: `Souldragon Additional DMG (${x.NAME})`,
              value: [{ scaling: calcScaling(0.4, 0.04, ult, 'curved'), multiplier: Stats.ATK }],
              element: x.ELEMENT,
              property: TalentProperty.ADD,
              type: TalentType.NONE,
              multiplier: c >= 2 ? 2 : 1,
              overrideIndex: i,
            })
            if (a.a6) {
              base.ULT_SCALING.push({
                name: `A6 Souldragon Additional DMG (${x.NAME})`,
                value: [{ scaling: 0.4, multiplier: Stats.ATK }],
                element: x.ELEMENT,
                property: TalentProperty.ADD,
                type: TalentType.NONE,
                multiplier: c >= 2 ? 2 : 1,
                overrideIndex: i,
              })
            }
            if (c >= 1) {
              x.ALL_TYPE_RES_PEN.push({
                name: 'Eidolon 1',
                value: 0.18,
                source: index === i ? 'Self' : 'Dan Heng • Permansor Terrae',
              })
            }
            if (c >= 6) {
              x.DEF_PEN.push({
                name: 'Eidolon 6',
                value: 0.12,
                source: index === i ? 'Self' : 'Dan Heng • Permansor Terrae',
              })
            }
            if (c >= 6) {
              x.ULT_SCALING.push({
                name: `E6 Souldragon Additional DMG (${x.NAME})`,
                value: [{ scaling: 3.3, multiplier: Stats.ATK }],
                element: x.ELEMENT,
                property: TalentProperty.ADD,
                type: TalentType.NONE,
                overrideIndex: i,
              })
            }
          }
          if (_.some(allForm, (af) => af?.bondmate) && c >= 6) {
            x.VULNERABILITY.push({
              name: 'Eidolon 6',
              value: 0.2,
              source: index === i ? 'Self' : 'Dan Heng • Permansor Terrae',
            })
          }
        })
        return all
      })

      return base
    },
  }
}

export default Terravox
