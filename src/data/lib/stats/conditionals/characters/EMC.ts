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

const EMC = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
    elation: c >= 5 ? 2 : c >= 3 ? 1 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent
  const elation = t.elation + upgrade.elation

  const index = _.findIndex(team, (item) => item?.cId === '8009')

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: 'Fan Support Is Here',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Trailblazer's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      energy: 20,
      image: 'asset/traces/SkillIcon_8009_Normal.webp',
    },
    skill: {
      trace: 'Skill',
      title: `So Wild the Storm Rages`,
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of the Trailblazer's ATK to all enemies and gains <span class="text-desc">20</span> point(s) of <b class="text-blue">Certified Banger</b>.`,
      value: [{ base: 30, growth: 3, style: 'curved' }],
      level: skill,
      tag: AbilityTag.AOE,
      sp: -1,
      energy: 30,
      image: 'asset/traces/SkillIcon_8009_BP.webp',
    },
    summon_skill: {
      participantId: 120,
      trace: 'Elation Skill',
      title: 'Elation, Are You Deaf or Something?',
      content: `Deals <span class="text-desc">8</span> instances of DMG, with each instance dealing {{0}}% <b class="text-hsr-lightning">Lightning</b> <b class="elation">Elation DMG</b> to one random enemy. Then, deals {{1}}% <b class="text-hsr-lightning">Lightning</b> <b class="elation">Elation DMG</b>, which is split evenly among all enemies.`,
      value: [
        { base: 10, growth: 1, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
      ],
      level: elation,
      tag: AbilityTag.BOUNCE,
      energy: 5,
      image: 'asset/traces/SkillIcon_8009_Elation.webp',
    },
    ult: {
      trace: 'Ultimate',
      title: `Fly High, Trailblaze's by Your Side`,
      content: `Gains <span class="text-desc">5</span> Punchline point(s), increases the CRIT DMG of a designated ally by {{0}}% for <span class="text-desc">3</span> turn(s), and dispels Crowd Control debuffs from them.
      <br />If the target possesses an Elation Skill, they additionally gain <span class="text-desc">10</span> point(s) of <b class="text-blue">Certified Banger</b> and immediately use their Elation Skill <span class="text-desc">1</span> time, taking <span class="text-desc">20</span> <b class="text-orange-400">Punchline</b> point(s) into account.
      <br />If the target does not possess an Elation Skill, their action is advanced by <span class="text-desc">50%</span>.`,
      value: [{ base: 30, growth: 2, style: 'curved' }],
      level: ult,
      tag: AbilityTag.SUPPORT,
      energy: 5,
      image: 'asset/traces/SkillIcon_8009_Ultra_on.webp',
    },
    talent: {
      trace: `Talent`,
      title: `When Heroes Laugh, Lives Hang in the Balance`,
      content: `Regenerates <span class="text-desc">10</span> Energy and gains <span class="text-desc">2</span> <b class="text-orange-400">Punchline</b> point(s) after using an attack.
      <br />When the Trailblazer possesses <b class="text-blue">Certified Banger</b>, their Skill deals additional <b class="text-hsr-lightning">Lightning</b> <b class="elation">Elation DMG</b> equal to {{0}}% to all enemies. This DMG is calculated using the highest <b class="text-blue">Certified Banger</b> value among all allies.`,
      value: [{ base: 15, growth: 1.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.SUPPORT,
      image: 'asset/traces/SkillIcon_8009_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: `The Mood's On Fire!`,
      content: `After using Technique, <span class="text-desc">1</span> of the following effects will be randomly granted:
      <br />Small chance to gain <b class="text-desc">Peal of Laughter</b>: Increases Elation by <span class="text-desc">30%</span>.
      <br />High chance to gain <b class="text-red">Unrestrained Laughter</b>: Increases Elation by <span class="text-desc">20%</span>.
      <br />When the next battle begins, increases all allies' Elation stat by the corresponding amount for <span class="text-desc">3</span> turn(s).`,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_8009_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Faster! Faster!',
      content: `For every <span class="text-desc">200</span> point(s) of ATK that exceeds <span class="text-desc">1,000</span>, increases this unit's Elation by <span class="text-desc">10%</span>, up to a maximum increase of <span class="text-desc">60%</span>.`,
      image: 'asset/traces/SkillIcon_8009_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Game Over With You',
      content: `Increases this unit's CRIT Rate by <span class="text-desc">15%</span>. After using Ultimate, recovers <span class="text-desc">1</span> Skill Point(s) for the team.`,
      image: 'asset/traces/SkillIcon_8009_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Bite Them, Aha!',
      content: `After an ally target uses an Elation Skill, Trailblazer additionally gains <span class="text-desc">2</span> point(s) of <b class="text-blue">Certified Banger</b> the next time they use their Skill.`,
      image: 'asset/traces/SkillIcon_8009_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Believe in the Light',
      content: `After using a Skill, the next Ultimate increases the <b class="text-blue">Certified Banger</b> gained by ally targets by <span class="text-desc">2</span>. This effect can stack up to <span class="text-desc">3</span> times.`,
      image: 'asset/traces/SkillIcon_8009_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'Iconic Scene in Progress...',
      content: `Ultimate additionally increases the Elation of a designated ally by <span class="text-desc">12%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
      image: 'asset/traces/SkillIcon_8009_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Eyes On Me',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_8009_BP.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Saving the World Just Cause',
      content: `When using an Elation Skill, increases DMG taken by enemy targets by <span class="text-desc">12%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
      image: 'asset/traces/SkillIcon_8009_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Love and Courage Never Go Out of Style',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_8009_Ultra.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'A Cosmic Legend Cometh!',
      content: `When the Trailblazer uses their Ultimate on an ally target other than themselves, the Trailblazer also gains the same Ultimate effect.`,
      image: 'asset/traces/SkillIcon_8009_Rank6.webp',
    },
  }

  const content: IContent[] = [
    Banger,
    {
      type: 'element',
      id: 'emc_tech',
      text: `Technique Elation Bonus`,
      ...talents.technique,
      show: true,
      default: '0.2',
      duration: 3,
      options: [
        { name: 'Peal of Laughter', value: '0.3' },
        { name: 'Unrestrained Laughter', value: '0.2' },
        { name: 'None', value: '0' },
      ],
    },
    {
      type: 'number',
      id: 'emc_enemy_count',
      trace: 'Miscellaneous',
      text: `On-Field Enemy Count`,
      content: 'Used for DMG distribution of Elation Skill.',
      title: 'On-Field Enemy Count',
      show: a.a2,
      default: 5,
      min: 1,
      max: 5,
    },
    {
      type: 'toggle',
      id: 'emc_ult',
      text: `EMC CRIT DMG Bonus`,
      ...talents.ult,
      show: true,
      default: false,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'emc_e2',
      text: `E2 Elation Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: false,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'emc_e4',
      text: `E2 Vulnerability`,
      ...talents.c4,
      show: c >= 4,
      default: false,
      duration: 2,
      debuff: true,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'emc_e4')]

  const allyContent: IContent[] = [findContentById(content, 'emc_ult'), findContentById(content, 'emc_e2')]

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
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.3, 0.3, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
      ]
      base.MEMO_SKILL_SCALING = [
        {
          name: 'Total Bounce DMG',
          value: [{ scaling: calcScaling(0.1, 0.01, elation, 'curved') * 8, multiplier: Stats.ELATION }],
          element: Element.LIGHTNING,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          sum: true,
        },
        {
          name: 'DMG per Bounce',
          value: [{ scaling: calcScaling(0.1, 0.01, elation, 'curved'), multiplier: Stats.ELATION }],
          element: Element.LIGHTNING,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.3, 0.03, elation, 'curved'), multiplier: Stats.ELATION }],
          multiplier: 1 / form.emc_enemy_count,
          element: Element.LIGHTNING,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: 20,
          sum: true,
        },
      ]

      if (a.a4) {
        base[Stats.CRIT_RATE].push({
          name: `Ascension 4 Passive`,
          source: 'Self',
          value: 0.15,
        })
      }
      if (form.emc_ult) {
        base[Stats.CRIT_DMG].push({
          name: `Ultimate`,
          source: 'Self',
          value: calcScaling(0.3, 0.02, ult, 'curved'),
        })
      }
      if (form.emc_e2) {
        base[Stats.ELATION].push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.12,
        })
      }
      if (form.emc_e4) {
        base.VULNERABILITY.push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.1,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (+form.emc_tech) {
        base[Stats.ELATION].push({
          name: `Technique`,
          source: 'Self',
          value: +form.emc_tech,
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
      if (+form.emc_tech) {
        base[Stats.ELATION].push({
          name: `Technique`,
          source: 'Trailblazer',
          value: +form.emc_tech,
        })
      }
      if (aForm.emc_ult) {
        base[Stats.CRIT_DMG].push({
          name: `Ultimate`,
          source: 'Trailblazer',
          value: calcScaling(0.3, 0.02, ult, 'curved'),
        })
      }
      if (aForm.emc_e2) {
        base[Stats.ELATION].push({
          name: `Eidolon 2`,
          source: 'Trailblazer',
          value: 0.12,
        })
      }
      if (form.emc_e4) {
        base.VULNERABILITY.push({
          name: `Eidolon 4`,
          source: 'Trailblazer',
          value: 0.1,
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
      base.CALLBACK.push(function P99(x) {
        const atk = x.getAtk(true)
        if (atk > 1000)
          x.Elation.push({
            name: `Ascension 2 Passive`,
            source: 'Self',
            value: _.min([((atk - 1000) / 200) * 0.1, 0.6]),
            base: `${_.floor(_.min([atk - 1000, 1200]), 1).toLocaleString()} ÷ 100`,
            multiplier: 0.1,
          })

        return x
      })
      base.SKILL_SCALING.push({
        name: 'Certified Banger DMG',
        value: [{ scaling: calcScaling(0.15, 0.015, talent, 'curved'), multiplier: Stats.ELATION }],
        element: Element.LIGHTNING,
        property: TalentProperty.ELATION,
        type: TalentType.SKILL,
        sum: true,
        punchline: _.max(_.map(allForm, (f) => f.banger || 0)),
      })
      return base
    },
  }
}

export default EMC
