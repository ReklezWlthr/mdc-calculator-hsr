import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
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
import { IContent, IScaling, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'
import { PathType } from '../../../../../domain/constant'
import { CallbackType } from '@src/domain/stats'

const Gilgamesh = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Halfhearted Blow',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Gilgamesh's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      image: 'asset/traces/SkillIcon_1509_Normal.webp',
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `King's Treasure`,
      content: `Obtains <b class="text-violet-400">King's Acknowledgement</b>, allowing this unit to ignore {{0}}% of the target's DEF when dealing DMG, lasting for <span class="text-desc">3</span> turn(s).
      <br />Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Gilgamesh's ATK to one designated enemy, and deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{2}}% of Gilgamesh's ATK to adjacent targets.`,
      value: [
        { base: 15, growth: 1.5, style: 'curved' },
        { base: 140, growth: 14, style: 'curved' },
        { base: 70, growth: 7, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
      image: 'asset/traces/SkillIcon_1509_BP.webp',
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Enuma Elish',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Gilgamesh's ATK to all enemies, and additionally deals <span class="text-desc">10</span> instance(s) of DMG, with each instance dealing <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Gilgamesh's ATK to one random enemy.`,
      value: [
        { base: 200, growth: 20, style: 'curved' },
        { base: 50, growth: 5, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
      image: 'asset/traces/SkillIcon_1509_Ultra_on.webp',
    },
    talent: {
      trace: 'Talent',
      title: `"Amuse Me to the Fullest"`,
      content: `When an ally teammate uses their Ultimate, Gilgamesh gains <b class="text-desc">King's Burden</b>, increasing Ultimate DMG dealt by this unit by {{0}}%, lasting for <span class="text-desc">3</span> turn(s).
      <br />Initially, automatically uses Basic ATK at the start of this unit's turn. When another ally target takes action, Gilgamesh gains <span class="text-desc">1</span> point of <b class="text-heal">Interest</b>. When <b class="text-heal">Interest</b> reaches <span class="text-desc">10</span> points, Gilgamesh consumes <span class="text-desc">10</span> points of <b class="text-heal">Interest</b> and immediately takes action.
      <br />When <b class="text-heal">Interest</b> reaches <span class="text-desc">10</span> point(s) for the first time, Gilgamesh enters the <b class="text-red">Interest Piqued!</b> state and can only use his Skill.
      <br />
      <br /><b>"I Grant You Permission To Strike"</b>
      <br />When Gilgamesh or Saber attacks, they accumulate <span class="text-desc">1</span> attack tally. After any unit attacks, if the accumulated attack tally reaches <span class="text-desc">8</span>, Gilgamesh and Saber launch a <u>Joint Follow-Up ATK</u> together, dealing <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Gilgamesh's ATK and <b class="text-hsr-wind">Wind DMG</b> equal to {{2}}% of Saber's ATK to all enemies. Then, Gilgamesh gains <span class="text-desc">3</span> point(s) of <b class="text-heal">Interest</b>, and Saber regenerates <span class="text-desc">120</span> Energy and the DMG dealt when she next uses her Ultimate becomes {{3}}% of the original DMG.
      <br />The accumulated attack tally is reset after using the <u>Joint Follow-Up ATK</u>.`,
      value: [
        { base: 20, growth: 2, style: 'curved' },
        { base: 150, growth: 15, style: 'curved' },
        { base: 200, growth: 20, style: 'curved' },
        { base: 120, growth: 8, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1509_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: `Enkidu`,
      content: `After using Technique, creates <span class="text-desc">1</span> Special Dimension lasting for <span class="text-desc">10</span> second(s). Enemies in the Special Dimension enter the <b>King's Permission</b> state. Enemies in the <b>King's Permission</b> state will stop all actions.
      <br />When entering combat by actively attacking an enemy in the <b>King's Permission</b> state, causes all enemies in the <b>King's Permission</b> state to enter combat, and deals <b class="text-hsr-lightning">Lightning DMG</b> equal to <span class="text-desc">200%</span> of Gilgamesh's ATK to all enemies after entering battle. Gilgamesh also immediately gains <span class="text-desc">3</span> point(s) of <b class="text-heal">Interest</b>. Only <span class="text-desc">1</span> Special Dimension created by allies can exist.`,
      tag: AbilityTag.IMPAIR,
      image: 'asset/traces/SkillIcon_1509_Maze.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Hegemon's Strife`,
      content: `While Gilgamesh is on the field, increases the ATK of all ally targets by <span class="text-desc">30%</span> and CRIT DMG by <span class="text-desc">30%</span>. If the target's Max Energy exceeds <span class="text-desc">140</span>, every <span class="text-desc">1</span> excess point of Max Energy additionally increases ATK and CRIT DMG by <span class="text-desc">1%</span>, up to a maximum of <span class="text-desc">60%</span>.`,
      image: 'asset/traces/SkillIcon_1509_SkillTree3.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Hero's Hauteur`,
      content: `During the battle, every <span class="text-desc">1</span> point of <b class="text-heal">Interest</b> gained by Gilgamesh increases his CRIT DMG by <span class="text-desc">25%</span>. This effect can stack up to <span class="text-desc">6</span> time(s).`,
      image: 'asset/traces/SkillIcon_1509_SkillTree2.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Epic's Opening`,
      content: `When Gilgamesh uses his Ultimate, he gains <span class="text-desc">2</span> point(s) of <b class="text-heal">Interest</b>. When other ally characters use their Ultimates, Gilgamesh additionally gains <span class="text-desc">2</span> point(s) of <b class="text-heal">Interest</b> and regenerates a fixed amount of Energy equal to <span class="text-desc">30%</span> of the Energy consumed this time.`,
      image: 'asset/traces/SkillIcon_1509_SkillTree1.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: `He Who Saw the Deep`,
      content: `When Gilgamesh possesses <b class="text-violet-400">King's Acknowledgement</b>, its DEF-ignoring effect will apply to other teammates as well, and <b class="text-violet-400">King's Acknowledgement</b> will additionally increase Gilgamesh's ATK by <span class="text-desc">60%</span>. After Gilgamesh consumes <b class="text-heal">Interest</b>, he additionally regenerates a fixed <span class="text-desc">60</span> Energy the next time he uses his Skill.`,
      image: 'asset/traces/SkillIcon_1509_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Wisdom That Encompassed All`,
      content: `When entering combat, Gilgamesh gains <span class="text-desc">8</span> point(s) of <b class="text-heal">Interest</b>, and additionally gains <span class="text-desc">3</span> point(s) of <b class="text-heal">Interest</b> when using his Ultimate. The DMG multiplier of the Skill <b>Gate of Babylon</b> dealt to the primary target increases by <span class="text-desc">100%</span>, and the DMG multiplier dealt to adjacent targets increases by <span class="text-desc">50%</span>.`,
      image: 'asset/traces/SkillIcon_1509_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Journey That Spanned Far',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
      image: 'asset/traces/SkillIcon_1509_Ultra.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: `King Who Bowed to None`,
      content: `Gilgamesh's Energy Regeneration Rate increases by <span class="text-desc">20%</span>.`,
      image: 'asset/traces/SkillIcon_1509_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Sword That Parted God from Man`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1509_BP.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Soul That Bore Friendship',
      content: `Increases the bounce DMG multiplier of the Ultimate <b>Enuma Elish</b> by <span class="text-desc">30%</span>. While Gilgamesh is on the field, increases the <b>All-Type RES PEN</b> of ally characters by <span class="text-desc">20%</span>, and when an ally character uses their Ultimate, Gilgamesh gains <span class="text-desc">1</span> point of <b class="text-desc">Golden Rule</b>, up to a total of <span class="text-desc">6</span> points. If Gilgamesh has <span class="text-desc">6</span> points of <b class="text-desc">Golden Rule</b> after using his Ultimate, he consumes all <b class="text-desc">Golden Rule</b> to activate his Ultimate.`,
      image: 'asset/traces/SkillIcon_1509_Rank6.webp',
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'kings_acknowledgement',
      text: `King's Acknowledgement`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'kings_burden',
      text: `King's Burden`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'number',
      id: 'gil_a4',
      text: `A4 CRIT DMG Stacks`,
      ...talents.a4,
      show: a.a4,
      default: 3,
      min: 0,
      max: 6,
    },
    {
      type: 'toggle',
      id: 'gil_saber_buff',
      text: `Saber's Ult Multiplier Buff`,
      ...talents.talent,
      show: true,
      default: true,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'gil_saber_buff')]

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
    ) => {
      const base = _.cloneDeep(x)

      base.SKILL_ALT = form.rin_gem >= 15 || form.rin_sp >= 7

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main',
          value: [{ scaling: calcScaling(1.4, 0.14, skill, 'curved') + (c >= 2 ? 1 : 0), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.7, 0.07, skill, 'curved') + (c >= 2 ? 0.5 : 0), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Total Single Target DMG',
          value: [
            { scaling: calcScaling(2, 0.2, ult, 'curved'), multiplier: Stats.ATK },
            { scaling: calcScaling(0.5, 0.05, ult, 'curved') + (c >= 6 ? 0.3 : 0), hits: 10, multiplier: Stats.ATK },
          ],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 60,
          sum: true,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(2, 0.2, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 40,
        },
        {
          name: 'Bounce',
          value: [{ scaling: calcScaling(0.5, 0.05, ult, 'curved') + (c >= 6 ? 0.3 : 0), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 2,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'Total Single Target DMG',
          value: [{ scaling: 2, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.TALENT,
          sum: true,
        },
      ]

      if (form.kings_acknowledgement) {
        base.DEF_PEN.push({
          name: `King's Acknowledgement`,
          source: 'Self',
          value: calcScaling(0.15, 0.015, skill, 'curved'),
        })
        if (c >= 1) {
          base[Stats.P_ATK].push({
            name: `Eidolon 1`,
            source: 'Self',
            value: 0.6,
          })
        }
      }
      if (form.kings_burden) {
        base.ULT_DMG.push({
          name: `King's Burden`,
          source: 'Self',
          value: calcScaling(0.2, 0.02, talent, 'curved'),
        })
      }
      if (form.gil_a4) {
        base[Stats.CRIT_DMG].push({
          name: `Ascension 4 Passive`,
          source: 'Self',
          value: 0.25 * form.gil_a4,
        })
      }
      if (a.a6) {
        base[Stats.P_ATK].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.3 + _.min([0.01 * _.max([base.MAX_ENERGY - 100, 0]), 1]),
        })
        base[Stats.CRIT_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.3 + _.min([0.01 * _.max([base.MAX_ENERGY - 100, 0]), 1]),
        })
      }
      if (c >= 4) {
        base[Stats.ERR].push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.2,
        })
      }
      if (c >= 6) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.2,
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
    ) => {
      if (base.ID === '1014') {
        const gilIndex = _.findIndex(team, (item) => item?.cId === own.ID)
        const saberIndex = _.findIndex(team, (item) => item?.cId === base.ID)

        const joint: IScaling[] = [
          {
            name: 'Gilgamesh Joint AoE DMG',
            value: [{ scaling: calcScaling(1.5, 0.15, talent, 'curved'), multiplier: Stats.ATK }],
            element: Element.LIGHTNING,
            property: TalentProperty.FUA,
            type: TalentType.TALENT,
            break: 20,
            overrideIndex: gilIndex,
            sum: true,
          },
          {
            name: 'Saber Joint AoE DMG',
            value: [{ scaling: calcScaling(2, 0.2, talent, 'curved'), multiplier: Stats.ATK }],
            element: Element.WIND,
            property: TalentProperty.FUA,
            type: TalentType.TALENT,
            break: 20,
            overrideIndex: saberIndex,
            sum: true,
          },
        ]
        base.TALENT_SCALING.push(...joint)
        own.TALENT_SCALING.push(...joint)

        if (form.gil_saber_buff) {
          base.ULT_SCALING = _.map(base.ULT_SCALING, (s) =>
            s.property === TalentProperty.NORMAL && s.type === TalentType.ULT
              ? {
                  ...s,
                  multiplier: calcScaling(1.2, 0.08, talent, 'curved'),
                }
              : s,
          )
        }
      }

      if (form.kings_acknowledgement && c >= 1) {
        base.DEF_PEN.push({
          name: `King's Acknowledgement`,
          source: 'Gilgamesh',
          value: calcScaling(0.15, 0.015, skill, 'curved'),
        })
      }
      if (a.a6) {
        base[Stats.P_ATK].push({
          name: `Ascension 6 Passive`,
          source: 'Gilgamesh',
          value: 0.3 + _.min([0.01 * _.max([base.MAX_ENERGY - 140, 0]), 0.6]),
        })
        base[Stats.CRIT_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Gilgamesh',
          value: 0.3 + _.min([0.01 * _.max([base.MAX_ENERGY - 140, 0]), 0.6]),
        })
      }
      if (c >= 6 && !base.SUMMON_ID) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Gilgamesh',
          value: 0.2,
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
      return base
    },
  }
}

export default Gilgamesh
