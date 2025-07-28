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

const Jingliu = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Lucent Moonglow`,
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Jingliu's Max HP to one designated enemy.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 20,
      trace: 'Skill',
      title: `Transcendent Flash`,
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Jingliu's Max HP to one designated enemy and obtains <span class="text-desc">1</span> stack(s) of <b class="text-hsr-ice">Syzygy</b>.`,
      value: [{ base: 75, growth: 7.5, style: 'curved' }],
      level: skill,
      tag: AbilityTag.ST,
      sp: -1,
    },
    skill_alt: {
      energy: 30,
      trace: 'Enhanced Skill',
      title: `Moon On Glacial River`,
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Jingliu's Max HP to one designated enemy, and deals <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of Jingliu's Max HP to adjacent enemies. Consumes <span class="text-desc">1</span> stack(s) of <b class="text-hsr-ice">Syzygy</b>. Using this ability does not consume Skill Points.`,
      value: [
        { base: 75, growth: 7.5, style: 'curved' },
        { base: 37.5, growth: 3.75, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Florephemeral Dreamflux',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Jingliu's Max HP to one designated enemy, and deals <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of Jingliu's Max HP to their adjacent enemies. Gains <span class="text-desc">1</span> stack(s) of <b class="text-hsr-ice">Syzygy</b> after attack ends.`,
      value: [
        { base: 90, growth: 9, style: 'curved' },
        { base: 45, growth: 4.5, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.BLAST,
    },
    talent: {
      trace: 'Talent',
      title: `Crescent Transmigration`,
      content: `When Jingliu has <span class="text-desc">2</span> stack(s) of <b class="text-hsr-ice">Syzygy</b>, she enters the <b>Spectral Transmigration</b> state, gains <span class="text-desc">1</span> additional stack of <b class="text-hsr-ice">Syzygy</b>, <u>action advances</u> by <span class="text-desc">100%</span>, and her CRIT Rate increases by {{0}}%.
      Then, Jingliu's Skill <b>Transcendent Flash</b> is enhanced to <b>Moon On Glacial River</b>, and only this enhanced Skill is available for use in battle. When Jingliu uses an attack in the <b>Spectral Transmigration</b> state, she consumes HP from all other allies equal to <span class="text-desc">5%</span> of their respective Max HP (this cannot reduce teammates' HP to lower than <span class="text-desc">1</span>). When in the <b>Spectral Transmigration</b> state, Jingliu gains <span class="text-desc">1</span> stack of <b class="text-desc">Moonlight</b> whenever ally targets receive DMG or consume HP. Each stack of <b class="text-desc">Moonlight</b> increases Jingliu's CRIT DMG by {{1}}%, up to <span class="text-desc">5</span> stacks. Jingliu cannot enter the <b>Spectral Transmigration</b> state again until the current <b>Spectral Transmigration</b> state ends. <b class="text-hsr-ice">Syzygy</b> can stack up to <span class="text-desc">4</span> times. When <b class="text-hsr-ice">Syzygy</b> stacks become <span class="text-desc">0</span>, Jingliu will exit the <b>Spectral Transmigration</b> state and remove all <b class="text-desc">Moonlight</b>.
      After ally targets receive DMG or consume HP a total of <span class="text-desc">20</span> times, Jingliu gains <span class="text-desc">1</span> stack of <b class="text-hsr-ice">Syzygy</b>. This takes effect a maximum of <span class="text-desc">1</span> time per attack received by each target.`,
      value: [
        { base: 40, growth: 1, style: 'curved' },
        { base: 22, growth: 2.2, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: `Shine of Truth`,
      content: `After using this Technique, creates a Special Dimension around Jingliu that lasts for <span class="text-desc">20</span> seconds, and all enemies in this Special Dimension will become <b class="text-hsr-ice">Frozen</b>. After entering combat with enemies in the Special Dimension, Jingliu immediately regenerates <span class="text-desc">15</span> Energy and obtains <span class="text-desc">1</span> stack(s) of <b class="text-hsr-ice">Syzygy</b>, with a <span class="text-desc">100%</span> <u>base chance</u> of <b class="text-hsr-ice">Freezing</b> enemy targets for <span class="text-desc">1</span> turn(s). While <b class="text-hsr-ice">Frozen</b>, enemy targets cannot take action, and receive <b class="text-hsr-ice">Ice Additional DMG</b> equal to <span class="text-desc">80%</span> of Jingliu's Max HP at the start of every turn. Only <span class="text-desc">1</span> Dimension Effect created by allies can exist at the same time.`,
      tag: AbilityTag.IMPAIR,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Deathrealm`,
      content: `While in the <b>Spectral Transmigration</b> state, Effect RES increases by <span class="text-desc">35%</span>, and Ultimate DMG dealt increases by <span class="text-desc">20%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Sword Champion`,
      content: `After using <b>Transcendent Flash</b>, additionally regenerates <span class="text-desc">15</span> Energy, and after using <b>Moon On Glacial River</b>, regenerate an additional <span class="text-desc">8</span> Energy.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Frost Wraith`,
      content: `When obtaining <b class="text-hsr-ice">Syzygy</b> at max stacks, Jingliu's next attack ignores <span class="text-desc">25%</span> of the target's DEF.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Moon Crashes Tianguan Gate`,
      content: `When using her Ultimate or Enhanced Skill, Jingliu's CRIT DMG increases by <span class="text-desc">36%</span> for <span class="text-desc">1</span> turn(s). Moreover, additionally deals <span class="text-desc">1</span> instance of <b class="text-hsr-ice">Ice DMG</b> equal to <span class="text-desc">80%</span> of Jingliu's Max HP to the primary target.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Crescent Shadows Qixing Dipper`,
      content: `After using Ultimate, increases the DMG of the next Enhanced Skill by <span class="text-desc">80%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Halfmoon Gapes Mercurial Haze`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Lunarlance Shines Skyward Dome`,
      content: `While in the <b>Spectral Transmigration</b> state, each stack of <b class="text-desc">Moonlight</b> additionally increases CRIT DMG by <span class="text-desc">20%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Night Shades Astral Radiance`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Eclipse Hollows Corporeal Husk`,
      content: `When Jingliu enters the <b>Spectral Transmigration</b> state, the <b class="text-hsr-ice">Syzygy</b> stack limit increases by <span class="text-desc">1</span>, and Jingliu obtains <span class="text-desc">2</span> stack(s) of <b class="text-hsr-ice">Syzygy</b>. While she is in the <b>Spectral Transmigration</b> state, her <b class="text-hsr-ice">Ice RES PEN</b> increases by <span class="text-desc">30%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'spectral_transmigration',
      text: `Spectral Transmigration`,
      ...talents.talent,
      show: true,
      default: true,
      sync: true,
    },
    {
      type: 'number',
      id: 'moonlight',
      text: `Moonlight`,
      ...talents.talent,
      show: true,
      default: 5,
      min: 0,
      max: 5,
    },
    {
      type: 'toggle',
      id: 'jingliu_a6',
      text: `A6 DEF PEN`,
      ...talents.a6,
      show: a.a6,
      default: false,
    },
    {
      type: 'toggle',
      id: 'jingliu_c1_crit',
      text: `E1 CRIT DMG Bonus`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'jingliu_c2',
      text: `E2 Enhanced Skill DMG`,
      ...talents.c2,
      show: c >= 2,
      default: true,
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
      weakness: Element[],
      broken: boolean
    ) => {
      const base = _.cloneDeep(x)

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.25, 0.05, basic, 'linear'), multiplier: Stats.HP }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
          hitSplit: [0.3, 0.7],
        },
      ]
      base.SKILL_SCALING = form.spectral_transmigration
        ? [
            {
              name: 'Main Target',
              value: [{ scaling: calcScaling(0.75, 0.075, skill, 'curved'), multiplier: Stats.HP }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
              sum: true,
              hitSplit: [0.1, 0.1, 0.1, 0.2, 0.5],
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.375, 0.0375, skill, 'curved'), multiplier: Stats.HP }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 10,
              hitSplit: [0.1, 0.1, 0.1, 0.2, 0.5],
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.75, 0.075, skill, 'curved'), multiplier: Stats.HP }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
              sum: true,
            },
          ]
      base.ULT_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(0.9, 0.09, ult, 'curved'), multiplier: Stats.HP }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.45, 0.045, ult, 'curved'), multiplier: Stats.HP }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'Frozen DMG',
          value: [{ scaling: 0.8, multiplier: Stats.HP }],
          element: Element.ICE,
          property: TalentProperty.FROZEN,
          type: TalentType.NONE,
          chance: { base: 1, fixed: false },
        },
      ]

      if (form.spectral_transmigration) {
        base.SKILL_ALT = true
        base[Stats.CRIT_RATE].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.4, 0.01, talent, 'curved'),
        })
        if (form.moonlight) {
          base[Stats.CRIT_DMG].push({
            name: 'Moonlight',
            source: 'Self',
            value: (calcScaling(0.22, 0.022, talent, 'curved') + (c >= 4 ? 0.2 : 0)) * form.moonlight,
          })
        }
        if (a.a2) {
          base[Stats.E_RES].push({
            name: 'Ascension 2 Passive',
            source: 'Self',
            value: 0.35,
          })
          base.ULT_DMG.push({
            name: 'Ascension 2 Passive',
            source: 'Self',
            value: 0.2,
          })
        }
        if (form.jingliu_a6) {
          base.DEF_PEN.push({
            name: 'Ascension 6 Passive',
            source: 'Self',
            value: 0.25,
          })
        }
        if (c >= 6)
          base.ICE_RES_PEN.push({
            name: 'Eidolon 6',
            source: 'Self',
            value: 0.3,
          })
      }
      if (form.jingliu_c1_crit) {
        base[Stats.CRIT_DMG].push({
          name: 'Eidolon 1',
          source: 'Self',
          value: 0.36,
        })
      }
      if (c >= 1) {
        base.ULT_SCALING.push({
          name: 'E1 Additional DMG',
          value: [{ scaling: 0.8, multiplier: Stats.HP }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          sum: true,
        })
        if (form.spectral_transmigration)
          base.SKILL_SCALING.push({
            name: 'E1 Additional DMG',
            value: [{ scaling: 0.8, multiplier: Stats.HP }],
            element: Element.ICE,
            property: TalentProperty.NORMAL,
            type: TalentType.SKILL,
            sum: true,
          })
      }
      if (form.jingliu_c2 && form.spectral_transmigration)
        base.SKILL_DMG.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.8,
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
      return base
    },
  }
}

export default Jingliu
