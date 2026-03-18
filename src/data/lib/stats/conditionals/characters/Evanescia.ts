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

const Evanescia = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
    elation: c >= 5 ? 2 : c >= 3 ? 1 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent
  const elation = t.elation + upgrade.elation

  const index = _.findIndex(team, (item) => item?.cId === '1505')

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: 'Schoolwork: Surprise Inspection',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Evanescia's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      energy: 20,
      image: 'asset/traces/SkillIcon_1505_Normal.webp',
    },
    skill: {
      trace: 'Skill',
      title: `Discipline: Inevitable Judgment`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Evanescia's ATK to a designated enemy target and <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Evanescia's ATK to adjacent targets. Additionally gains <span class="text-desc">5</span> <b class="text-orange-400">Punchline</b> point(s).`,
      value: [{ base: 80, growth: 8, style: 'curved' }],
      level: skill,
      tag: AbilityTag.AOE,
      sp: -1,
      energy: 30,
      image: 'asset/traces/SkillIcon_1505_BP.webp',
    },
    summon_skill: {
      participantId: 146,
      trace: 'Elation Skill',
      title: 'Scarlet: Sombre Rend',
      content: `Deals <b class="text-hsr-physical">Physical</b> <b class="elation">Elation DMG</b> equal to {{0}}% to all enemies and additionally gains <span class="text-desc">10</span> point(s) of <b class="text-blue">Certified Banger</b>.`,
      value: [{ base: 50, growth: 5, style: 'curved' }],
      level: elation,
      tag: AbilityTag.AOE,
      energy: 5,
      image: 'asset/traces/SkillIcon_1505_Elation.webp',
    },
    ult: {
      trace: 'Ultimate',
      title: `Swordsong: Hew Gods, Slay Devils`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Evanescia's ATK to all enemies, then deals <span class="text-desc">5</span> instances of DMG, with each instance dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Evanescia's ATK to one random enemy target.`,
      value: [
        { base: 144, growth: 9.6, style: 'curved' },
        { base: 96, growth: 6.4, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
      energy: 5,
      image: 'asset/traces/SkillIcon_1505_Ultra_on.webp',
    },
    talent: {
      trace: `Talent`,
      title: `Youth: Timeless Radiance`,
      content: `Evanescia gains Elation equal to <span class="text-desc">25%</span> of her CRIT DMG. When Evanescia gains Energy, she simultaneously gains an equal amount of <b class="text-blue">Certified Banger</b>. When Evanescia gains <b class="text-blue">Certified Banger</b>, she simultaneously gains an equal amount of Energy. The <b class="text-blue">Certified Banger</b> gained through this method in a single instance cannot exceed <span class="text-desc">100</span> points. When Evanescia possesses <b class="text-blue">Certified Banger</b>:
      <br />Using her Skill deals <b class="text-hsr-physical">Physical</b> <b class="elation">Elation DMG</b> equal to {{0}}% to the attacked enemy target.
      <br />Using her Ultimate deals <b class="text-hsr-physical">Physical</b> <b class="elation">Elation DMG</b> equal to {{1}}% to all enemies and deals <b class="text-hsr-physical">Physical</b> <b class="elation">Elation DMG</b> equal to {{2}}% to one random enemy target. When <b class="text-blue">Certified Banger</b> is at Max Energy or less, the Ultimate is considered as having an amount of <b class="text-blue">Certified Banger</b> equal to Max Energy.
      <br />When her Energy is accumulated to <span class="text-desc">240</span>, <b>Fox Teacher</b> deals {{3}}% <b class="text-hsr-physical">Physical</b> <b class="elation">Elation DMG</b> to all enemies and regenerates <span class="text-desc">10</span> Energy to Evanescia and clears the accumulated value.`,
      value: [
        { base: 8, growth: 0.8, style: 'curved' },
        { base: 11, growth: 1.1, style: 'curved' },
        { base: 12, growth: 1.3, style: 'curved' },
        { base: 12.5, growth: 1.25, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1505_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: 'Martyred: Memory of the Lost',
      content: `Immediately attacks all enemies within a certain range. After entering combat, deals <b class="text-hsr-physical">Physical DMG</b> equal to <span class="text-desc">100%</span> of Evanescia's ATK to all enemies and gains <span class="text-desc">20</span> point(s) of <b class="text-blue">Certified Banger</b>.`,
      tag: AbilityTag.SUMMON,
      image: 'asset/traces/SkillIcon_1505_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Shared Exultation',
      content: `Increases Evanescia's CRIT Rate by <span class="text-desc">30%</span>. When there are <span class="text-desc">3 or more</span>/<span class="text-desc">2</span>/<span class="text-desc">1</span> enemy target(s) on the field, her Ultimate's bounce count increases by <span class="text-desc">1</span>/<span class="text-desc">2</span>/<span class="text-desc">4</span>. When a teammate with an Elation Skill Participation ID lower than Evanescia's gains <b class="text-blue">Certified Banger</b>, Evanescia converts <span class="text-desc">50%</span> of it into her own <b class="text-blue">Certified Banger</b>.`,
      image: 'asset/traces/SkillIcon_1505_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Fulfilled Adjudication',
      content: `When <b>Fox Teacher</b> uses an attack, it additionally inflicts Vulnerability on the target, increasing the DMG they take by <span class="text-desc">12%</span> for <span class="text-desc">3</span> turn(s).`,
      image: 'asset/traces/SkillIcon_1505_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Unending Resolve',
      content: `When a teammate's <b class="text-blue">Certified Banger</b> ends, Evanescia converts <span class="text-desc">50%</span> of it into her own <b class="text-blue">Certified Banger</b>.`,
      image: 'asset/traces/SkillIcon_1505_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Homeland, Dance in Prayer',
      content: `Increases <b>All-Type PEN</b> by <span class="text-desc">20%</span>. After <b>Fox Teacher</b> uses an attack, triggers <span class="text-desc">1</span> additional Elation Skill. Elation Skill grants this unit <span class="text-desc">10</span> additional <b class="text-blue">Certified Banger</b> stack(s).`,
      image: 'asset/traces/SkillIcon_1505_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'Long May the Road Be',
      content: `Increases Elation by <span class="text-desc">25%</span>. The Vulnerability effect of the Trace <b>Fulfilled Adjudication</b> can stack, up to <span class="text-desc">2</span> stacks.`,
      image: 'asset/traces/SkillIcon_1505_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Blade, Devour the Crimson Demonic Moon',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1505_Ultra.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Purloined Garden',
      content: `Evanescia's DMG dealt ignores <span class="text-desc">15%</span> of the enemy target's DEF.`,
      image: 'asset/traces/SkillIcon_1505_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Arcadia, Witness Emotions Converge',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1505_BP.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Girl Dreaming in Vicissitude',
      content: `<b class="elation">Elation DMG</b> dealt by Evanescia merrymakes by <span class="text-desc">25%</span>. When teammates whose Participant ID is lower than Evanescia's gain <b class="text-blue">Certified Banger</b> or when ally teammates' <b class="text-blue">Certified Banger</b> expires, Evanescia additionally gains <span class="text-desc">50%</span>/<span class="text-desc">50%</span> of it as her own <b class="text-blue">Certified Banger</b>. After using her Ultimate for the first time upon entering combat, Evanescia regenerates <span class="text-desc">120</span> Energy. This effect can trigger <span class="text-desc">1</span> time for every <span class="text-desc">4</span> Ultimates used.`,
      image: 'asset/traces/SkillIcon_1505_Rank6.webp',
    },
  }

  const content: IContent[] = [
    { ...Banger, default: 280 },
    {
      type: 'number',
      id: 'eva_enemy_count',
      trace: 'Miscellaneous',
      text: `On-Field Enemy Count`,
      content: 'Used for Ascension 2 Passive bounce increment.',
      title: 'On-Field Enemy Count',
      show: a.a2,
      default: 5,
      min: 1,
      max: 5,
    },
    {
      type: 'toggle',
      id: 'fox_vuln',
      text: `Fox Teacher Vulnerability`,
      ...talents.a4,
      show: a.a4 && c < 2,
      default: true,
      debuff: true,
      duration: 3,
    },
    {
      type: 'number',
      id: 'fox_vuln',
      text: `Fox Teacher Vulnerability`,
      ...talents.a4,
      show: a.a4 && c >= 2,
      default: 2,
      debuff: true,
      duration: 3,
      min: 0,
      max: 2,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'fox_vuln')]

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
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(2.4, 0.24, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(1.2, 0.12, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
        },
        ...(form.banger
          ? [
              {
                name: 'Certified Banger DMG',
                value: [{ scaling: calcScaling(0.08, 0.008, talent, 'curved'), multiplier: Stats.ELATION }],
                element: Element.PHYSICAL,
                property: TalentProperty.ELATION,
                type: TalentType.SKILL,
                sum: true,
                punchline: form.banger,
              },
            ]
          : []),
      ]
      const bounce = form.eva_enemy_count === 1 ? 9 : form.eva_enemy_count === 2 ? 7 : form.eva_enemy_count >= 3 ? 6 : 5
      base.ULT_SCALING = [
        {
          name: 'Total Single-Target DMG',
          value: [
            { scaling: calcScaling(1.44, 0.096, ult, 'curved'), multiplier: Stats.ATK },
            { scaling: calcScaling(0.96, 0.064, ult, 'curved') * bounce, multiplier: Stats.ATK },
          ],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 1,
          sum: true,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.44, 0.096, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 10,
        },
        {
          name: 'DMG per Bounce',
          value: [{ scaling: calcScaling(0.96, 0.064, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 1,
        },
        ...(form.banger
          ? [
              {
                name: 'Total Certified Banger DMG',
                value: [
                  { scaling: calcScaling(0.11, 0.011, talent, 'curved'), multiplier: Stats.ELATION },
                  { scaling: calcScaling(0.12, 0.013, talent, 'curved') * bounce, multiplier: Stats.ELATION },
                ],
                element: Element.PHYSICAL,
                property: TalentProperty.ELATION,
                type: TalentType.ULT,
                sum: true,
                punchline: _.max([form.banger, 480]),
              },
              {
                name: 'AoE Certified Banger DMG',
                value: [{ scaling: calcScaling(0.11, 0.011, talent, 'curved'), multiplier: Stats.ELATION }],
                element: Element.PHYSICAL,
                property: TalentProperty.ELATION,
                type: TalentType.ULT,
                punchline: _.max([form.banger, 480]),
              },
              {
                name: 'Bounce Certified Banger DMG',
                value: [{ scaling: calcScaling(0.12, 0.013, talent, 'curved'), multiplier: Stats.ELATION }],
                element: Element.PHYSICAL,
                property: TalentProperty.ELATION,
                type: TalentType.ULT,
                punchline: _.max([form.banger, 480]),
              },
            ]
          : []),
      ]
      base.MEMO_SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.5, 0.05, elation, 'curved'), multiplier: Stats.ELATION }],
          element: Element.PHYSICAL,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: 20,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.125, 0.0125, talent, 'curved'), multiplier: Stats.ELATION }],
          element: Element.PHYSICAL,
          property: TalentProperty.ELATION,
          type: TalentType.TALENT,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 1, multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          sum: true,
        },
      ]

      if (a.a2) {
        base[Stats.CRIT_RATE].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.3,
        })
      }
      if (form.fox_vuln) {
        base.VULNERABILITY.push({
          name: `Ascension 4 Passive`,
          source: 'Self',
          value: 0.12 * (form.fox_vuln || 1),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (c >= 1) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.3,
        })
      }
      if (c >= 2) {
        base[Stats.ELATION].push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.25,
        })
      }
      if (c >= 4) {
        base.DEF_PEN.push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.12,
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
      if (form.fox_vuln) {
        base.VULNERABILITY.push({
          name: `Ascension 4 Passive`,
          source: 'Evanescia',
          value: 0.12 * (form.fox_vuln || 1),
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

export default Evanescia
