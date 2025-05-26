import { addDebuff, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Saber = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Invisible Air: Barrier of the Wind King',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Saber's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    normal_alt: {
      energy: 20,
      trace: 'Enhanced Basic ATK',
      title: 'Release, the Golden Scepter',
      content: `Gains <span class="text-desc">2</span> <b class="text-green-400">Core Resonance</b> and deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Saber's ATK to all enemies. If there are <span class="text-desc">2</span>/<span class="text-desc">1</span> enemy(ies) on the field, additionally deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}%/{{1}}% of Saber's ATK to all enemies.`,
      value: [
        { base: 75, growth: 15, style: 'linear' },
        { base: 35, growth: 7, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.AOE,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Strike Air: Hammer of the Wind King',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Saber's ATK to one designated enemy, and deals <b class="text-hsr-wind">Wind DMG</b> equal to {{1}}% of Saber's ATK to enemies adjacent to it. If currently holding <b class="text-green-400">Core Resonance</b>, and consuming it after this Skill usage would fully regenerate Saber's Energy, then increases the DMG multiplier for this usage of Skill. Each <b class="text-green-400">Core Resonance</b> increases the DMG multiplier for this usage of Skill by {{2}}%, then immediately consumes all <b class="text-green-400">Core Resonance</b> to fully regenerate Energy for Saber. Otherwise, immediately gains <span class="text-desc">2</span> <b class="text-green-400">Core Resonance</b>.`,
      value: [
        { base: 75, growth: 7.5, style: 'curved' },
        { base: 37.5, growth: 3.75, style: 'curved' },
        { base: 7, growth: 0.7, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Excalibur',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Saber's ATK to all enemies. Then, deals <b class="text-hsr-wind">Wind DMG</b> equal to {{1}}% of Saber's ATK to one random enemy, occurring <span class="text-desc">10</span> time(s). After using Ultimate, the next Basic ATK switches to <b>Release, the Golden Scepter</b> and only <b>Release, the Golden Scepter</b> can be used.`,
      value: [
        { base: 140, growth: 14, style: 'curved' },
        { base: 55, growth: 5.5, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `Dragon Reactor Core`,
      content: `Obtains <span class="text-desc">1</span> <b class="text-green-400">Core Resonance</b> point(s) when entering battle. When any ally target uses an Ultimate, increases DMG dealt by Saber by {{0}}% for <span class="text-desc">2</span> turn(s) and obtains <span class="text-desc">3</span> <b class="text-green-400">Core Resonance</b> point(s). Consuming <span class="text-desc">1</span> <b class="text-green-400">Core Resonance</b> point will regenerate a fixed <span class="text-desc">10</span> Energy for Saber.`,
      value: [{ base: 20, growth: 2, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: 'Behold, the King of Knights',
      content: `After using Technique, increases Saber's ATK by <span class="text-desc">35%</span> for <span class="text-desc">2</span> turn(s) and grants <span class="text-desc">2</span> <b class="text-green-400">Core Resonance</b> at the start of the next battle.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Knight of the Dragon',
      content: `Increases Saber's CRIT Rate by <span class="text-desc">20%</span>. When entering battle and using an Enhanced Basic ATK, obtains <b class="text-sky-300">Mana Burst</b>. If Saber has <b class="text-sky-300">Mana Burst</b> and <b class="text-green-400">Core Resonance</b> at the same time, then she can fully regenerate her Energy after using a Skill and consumes <b class="text-sky-300">Mana Burst</b> to allow allies to recover <span class="text-desc">1</span> Skill Point while letting her immediately take action.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Blessing of the Lake',
      content: `Saber can accumulate up to <span class="text-desc">120</span> excess Energy. After using Ultimate, the excess Energy is cleared and a corresponding amount is regenerated. When the battle starts, if Energy is below <span class="text-desc">40%</span>, it is regenerated to <span class="text-desc">40%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Crown of the Star',
      content: `When using Skill, increases Saber's CRIT DMG by  <span class="text-desc">50%</span> for  <span class="text-desc">2</span> turns.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'The Lost White Walls',
      content: `Increases DMG dealt by Saber by <span class="text-desc">50%</span>. After Saber uses a Basic ATK or Skill, additionally gains <span class="text-desc">1</span> <b class="text-green-400">Core Resonance</b>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'The Sealed Round Table',
      content: `Increases CRIT DMG dealt with <b>Release, the Golden Scepter</b> and <b>Strike Air: Hammer of the Wind King</b> by <span class="text-desc">50%</span>. For every <span class="text-desc">1</span> <b class="text-green-400">Core Resonance</b> gained, additionally increases CRIT DMG dealt by <span class="text-desc">5%</span>. This effect can be stacked up to <span class="text-desc">10</span> time(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'The Fabled Fifteen Centuries',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'The Wondrous Fourteen Nights',
      content: `Increases Saber's <b class="text-hsr-wind">Wind RES PEN</b> by <span class="text-desc">4%</span>. After using Ultimate, increases Saber's <b class="text-hsr-wind">Wind RES PEN</b> by <span class="text-desc">4%</span>, stacking up to <span class="text-desc">4</span> time(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'The Dreamed Utopian Dawn',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'The Long Fated Night',
      content: `Increases the <b>RES PEN</b> caused by Saber's Ultimate DMG by <span class="text-desc">20%</span>. Upon entering battle and using the Ultimate for the first time, regenerates a fixed <span class="text-desc">300</span> Energy for Saber. After an Ultimate is used <span class="text-desc">4</span> time(s), this effect can be triggered once more.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'saber_eba',
      text: `Enhanced Basic Attack`,
      ...talents.ult,
      show: true,
      default: true,
      sync: true,
    },
    {
      type: 'number',
      id: 'core_resonance',
      text: `Core Resonance`,
      ...talents.skill,
      show: true,
      default: 2,
      min: 0,
    },
    {
      type: 'toggle',
      id: 'saber_talent',
      text: `Talent DMG Bonus`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'saber_tech',
      text: `Technique ATK Bonus`,
      ...talents.technique,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'saber_a6',
      text: `A6 CRIT DMG Bonus`,
      ...talents.a6,
      show: a.a6,
      default: true,
      duration: 2,
    },
    {
      type: 'number',
      id: 'saber_c2',
      text: `E2 CRIT DMG Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: 2,
      min: 0,
      max: 10,
    },
    {
      type: 'toggle',
      id: 'saber_c4',
      text: `E4 Wind RES PEN`,
      ...talents.c4,
      show: c >= 4,
      default: 0,
      min: 0,
      max: 4,
    },
  ]

  const teammateContent: IContent[] = []

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
      weakness: Element[]
    ) => {
      const base = _.cloneDeep(x)

      if (form.saber_eba) base.BA_ALT = true

      base.BASIC_SCALING = form.saber_eba
        ? [
            {
              name: 'AoE',
              value: [{ scaling: calcScaling(0.75, 0.15, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.WIND,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 20,
              sum: true,
              cd: c >= 2 ? 0.5 + form.saber_c2 * 0.05 : 0,
            },
            {
              name: '2-Target DMG',
              value: [
                { scaling: calcScaling(0.75, 0.15, basic, 'linear'), multiplier: Stats.ATK },
                { scaling: calcScaling(0.75, 0.15, basic, 'linear'), multiplier: Stats.ATK },
              ],
              element: Element.WIND,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 20,
              cd: c >= 2 ? 0.5 + form.saber_c2 * 0.05 : 0,
            },
            {
              name: '1-Target DMG',
              value: [
                { scaling: calcScaling(0.75, 0.15, basic, 'linear'), multiplier: Stats.ATK },
                { scaling: calcScaling(0.35, 0.07, basic, 'linear'), multiplier: Stats.ATK },
              ],
              element: Element.WIND,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 20,
              cd: c >= 2 ? 0.5 + form.saber_c2 * 0.05 : 0,
            },
          ]
        : [
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
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [
            {
              scaling:
                calcScaling(0.75, 0.075, skill, 'curved') +
                calcScaling(0.07, 0.007, skill, 'curved') * (form.core_resonance || 0),
              multiplier: Stats.ATK,
            },
          ],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
          cd: c >= 2 ? 0.5 + form.saber_c2 * 0.05 : 0,
        },
        {
          name: 'Adjacent',
          value: [
            {
              scaling:
                calcScaling(0.375, 0.0375, skill, 'curved') +
                calcScaling(0.07, 0.007, skill, 'curved') * (form.core_resonance || 0),
              multiplier: Stats.ATK,
            },
          ],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          cd: c >= 2 ? 0.5 + form.saber_c2 * 0.05 : 0,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Total Single Target DMG',
          value: [
            { scaling: calcScaling(1.4, 0.14, ult, 'curved'), multiplier: Stats.ATK },
            { scaling: calcScaling(0.55, 0.055, ult, 'curved') * 10, multiplier: Stats.ATK },
          ],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 40,
          sum: true,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.4, 0.14, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 40,
        },
        {
          name: 'DMG Per Bounce',
          value: [{ scaling: calcScaling(0.55, 0.055, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
        },
      ]

      if (form.saber_talent) {
        base[Stats.ALL_DMG].push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.2, 0.02, talent, 'curved'),
        })
      }
      if (form.saber_tech) {
        base[Stats.P_ATK].push({
          name: `Technique`,
          source: 'Self',
          value: 0.35,
        })
      }
      if (a.a2) {
        base[Stats.CRIT_RATE].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.2,
        })
      }
      if (form.saber_a6) {
        base[Stats.CRIT_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.5,
        })
      }
      if (c >= 1) {
        base[Stats.ALL_DMG].push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.5,
        })
      }
      if (c >= 4) {
        base.WIND_RES_PEN.push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.04 + (form.saber_c4 || 0) * 0.04,
        })
      }
      if (c >= 6) {
        base.ULT_RES_PEN.push({
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
      debuffs: { type: DebuffTypes; count: number }[]
    ) => {
      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      team: StatsObject[],
      allForm: Record<string, any>[]
    ) => {
      return base
    },
  }
}

export default Saber
