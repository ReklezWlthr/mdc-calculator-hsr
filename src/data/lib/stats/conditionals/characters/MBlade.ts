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
import { IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'
import { PathType } from '../../../../../domain/constant'
import { CallbackType } from '@src/domain/stats'

const MBlade = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const nihilityCount = _.filter(team, (t) => findCharacter(t.cId)?.path === PathType.NIHILITY)?.length || 1

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'A Broken Blade Still Slays',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Mortenax Blade's Max HP to one designated enemy, and causes the target to enter the Taunt state for <span class="text-desc">1</span> turn.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      image: 'asset/traces/SkillIcon_1507_Normal.webp',
    },
    normal_alt: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'A Tempered Blade Severs Souls',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Mortenax Blade's Max HP to one designated enemy, and causes the target to enter the Taunt state for <span class="text-desc">1</span> turn.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      image: 'asset/traces/SkillIcon_1507_Normal02.webp',
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `A Rain of Blades Seals Fate`,
      content: `Consumes HP equal to <span class="text-desc">15%</span> of Mortenax Blade's Max HP and deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Mortenax Blade's Max HP to all enemies, and additionally deals <span class="text-desc">4</span> instance(s) of DMG, with each instance dealing <b class="text-hsr-fire">Fire DMG</b> equal to {{1}}% of Mortenax Blade's Max HP to one random enemy.
      <br />If the current HP is insufficient, Mortenax Blade's current HP will be reduced to <span class="text-desc">1</span> when using his Skill.
      <br />Using Skill does not consume Skill Points.`,
      value: [
        { base: 36, growth: 3.6, style: 'curved' },
        { base: 12, growth: 1.2, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.AOE,
      sp: -1,
      image: 'asset/traces/SkillIcon_1507_BP.webp',
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Fornax Ex Corpore',
      content: `Inflicts <b class="text-red">Balefire Bind</b> on all enemies. Enemy targets in the <b class="text-red">Balefire Bind</b> state have their DEF reduced by {{0}}% and DMG received increased by {{1}}%, lasting for <span class="text-desc">2</span> turn(s). Then, consumes HP equal to <span class="text-desc">30%</span> of Mortenax Blade's Max HP to deploy a Zone. While the Zone is active, Mortenax Blade enters the <b class="text-orange-400">Infinite Fury</b> state.
      <br />While in the <b class="text-orange-400">Infinite Fury</b> state, CRIT Rate increases by <span class="text-desc">20%</span> and CRIT DMG increases by {{2}}%, unlocks his Skill, and gains a new Ultimate <b>Tenax Per Ignem</b>. When receiving a killing blow, this unit will not be knocked down, but will dispel the Zone, exit the <b class="text-orange-400">Infinite Fury</b> state, and recover HP equal to <span class="text-desc">50%</span> of this unit's Max HP.
      <br />When entering the <b class="text-orange-400">Infinite Fury</b> state, a corresponding countdown appears on the Action Order. The countdown has a fixed SPD of <span class="text-desc">70</span>. At the start of the countdown's turn, dispels the Zone and exits the <b class="text-orange-400">Infinite Fury</b> state.
      <br />If the current HP is insufficient, Mortenax Blade's current HP will be reduced to <span class="text-desc">1</span> when using this ability.
      <br />Mortenax Blade cannot use his Skill when not in the <b class="text-orange-400">Infinite Fury</b> state.`,
      value: [
        { base: 20, growth: 1, style: 'curved' },
        { base: 30, growth: 2, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1507_Ultra_on.webp',
    },
    ult_alt: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Tenax Per Ignem',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Mortenax Blade's Max HP to all enemies.`,
      value: [{ base: 180, growth: 12, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
      image: 'asset/traces/SkillIcon_1507_Ultra02_on.webp',
    },
    talent: {
      trace: 'Talent',
      title: `All Karma Comes Due`,
      content: `While the Zone is active, after each attack an ally target uses on an enemy, inflicts the <b class="text-red">Balefire Bind</b> state on the corresponding enemy target and grants <span class="text-desc">1</span> <b>Charge</b> to Mortenax Blade. When <b>Charge</b> reaches <span class="text-desc">9</span> points, Mortenax Blade consumes <span class="text-desc">9</span> <b>Charge</b> points, regenerates {{0}} Energy, and uses his Skill <span class="text-desc">1</span> extra time. This extra Skill usage does not consume HP and is considered as a <u>Follow-Up ATK</u>.`,
      value: [{ base: 15, growth: 1, style: 'curved' }],
      level: talent,
      tag: AbilityTag.IMPAIR,
      image: 'asset/traces/SkillIcon_1507_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: `Blade's Reach Spares None`,
      content: `Immediately attacks all enemies within range. After entering combat, Taunts the target for <span class="text-desc">1</span> turn and decreases DMG taken by this unit by <span class="text-desc">90%</span> for <span class="text-desc">2</span> turn(s).`,
      tag: AbilityTag.IMPAIR,
      image: 'asset/traces/SkillIcon_1507_Maze.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Heart, Refined ad Infinitum',
      content: `While the Zone is active, DMG dealt by ally targets increases by <span class="text-desc">50%</span>. If there are other Nihility characters aside from Mortenax Blade in the ally team, Ultimate DMG dealt by ally targets increases by <span class="text-desc">50%</span>. Otherwise, <u>Follow-Up ATK</u> DMG dealt by ally targets increases by <span class="text-desc">50%</span>.`,
      image: 'asset/traces/SkillIcon_1507_SkillTree3.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Soul, Tempered ad Mortem',
      content: `While the Zone is active, increases the chance of being attacked by enemies. After being attacked, inflicts the <b class="text-red">Balefire Bind</b> state on the attacker and Mortenax Blade gains <span class="text-desc">1</span> <b>Charge</b>.`,
      image: 'asset/traces/SkillIcon_1507_SkillTree2.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Bone, Hardened ad Nauseam',
      content: `Mortenax Blade can accumulate up to <span class="text-desc">80</span> Energy overflow. After using Ultimate, the Energy overflow is cleared and a corresponding amount of Energy is regenerated. When the battle starts or when the Zone is dispelled, if Energy is below <span class="text-desc">50%</span>, it is immediately regenerated to <span class="text-desc">50%</span>.`,
      image: 'asset/traces/SkillIcon_1507_SkillTree1.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Ere My Death, I Stood Unmade',
      content: `While the Zone is active, decreases all enemies' <b>All-Type RES</b> by <span class="text-desc">20%</span>. After using the extra Skill from Talent, the <b class="text-orange-400">Infinite Fury</b> countdown has its action delayed by <span class="text-desc">15%</span>.`,
      image: 'asset/traces/SkillIcon_1507_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Ash Was My Heart, Yet the Flame Stayed`,
      content: `Increases DMG dealt by the extra Skill from Talent by <span class="text-desc">50%</span>. When an ally character uses their Ultimate to deal DMG, it is considered as launching a <u>Follow-Up ATK</u>. While the Zone is active, when other allies use a <u>Follow-Up ATK</u>, Mortenax Blade gains <span class="text-desc">1</span> Charge. This effect can be triggered up to <span class="text-desc">9</span> time(s), and the trigger count resets at the start of Mortenax Blade's turn or when the Zone is deployed.`,
      image: 'asset/traces/SkillIcon_1507_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Across the Shore, Wrath Laid Bare',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1507_Ultra.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Odium I've Smitten, Thence Came the Blade`,
      content: `<b>Heart, Refined ad Infinitum</b> additionally increases ally targets' DMG dealt by <span class="text-desc">50%</span>.`,
      image: 'asset/traces/SkillIcon_1507_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: `I Severed My Woes, Knowing Death Begets Life`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
      image: 'asset/traces/SkillIcon_1507_BP.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'If Immortality Could Die, I Swore THEM Slain',
      content: `While the Zone is active, when Mortenax Blade takes DMG or consumes HP, he gains <span class="text-desc">1</span> <b>Charge</b>. This effect can be triggered again after any target's turn ends. The DMG multiplier of <b>Tenax Per Ignem</b> increases to <span class="text-desc">150%</span> of the original multiplier.`,
      image: 'asset/traces/SkillIcon_1507_Rank6.webp',
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'mblade_ult',
      text: `Infinite Fury`,
      ...talents.ult,
      show: true,
      default: true,
      sync: true,
    },
    {
      type: 'toggle',
      id: 'balefire_bind',
      text: `Balefire Bind`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 2,
      debuff: true,
    },
    {
      type: 'toggle',
      id: 'mblade_tech',
      text: `Technique DMG Reduction`,
      ...talents.technique,
      show: true,
      default: true,
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'balefire_bind')]

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

      base.COUNTDOWN = 70
      if (form.mblade_ult) {
        base.BA_ALT = true
        base.ULT_ALT = true
      }

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [
            {
              scaling: form.mblade_ult
                ? calcScaling(0.5, 0.1, basic, 'linear')
                : calcScaling(0.25, 0.05, basic, 'linear'),
              multiplier: Stats.ATK,
            },
          ],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Total Single Target DMG',
          value: [
            { scaling: calcScaling(0.36, 0.036, skill, 'curved'), multiplier: Stats.HP },
            { scaling: calcScaling(0.12, 0.012, skill, 'curved'), hits: 4, multiplier: Stats.HP },
          ],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 30,
          sum: true,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.36, 0.036, skill, 'curved'), multiplier: Stats.HP }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
        {
          name: 'DMG per Bounce',
          value: [{ scaling: calcScaling(0.12, 0.012, skill, 'curved'), multiplier: Stats.HP }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 5,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.8, 0.12, ult, 'curved'), multiplier: Stats.HP }],
          element: Element.FIRE,
          property: c >= 2 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
          multiplier: c >= 6 ? 1.5 : 1,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Total Single Target DMG',
          value: [
            { scaling: calcScaling(0.36, 0.036, skill, 'curved'), multiplier: Stats.HP },
            { scaling: calcScaling(0.12, 0.012, skill, 'curved'), hits: 4, multiplier: Stats.HP },
          ],
          element: Element.FIRE,
          property: TalentProperty.FUA,
          type: TalentType.SKILL,
          break: 30,
          sum: true,
          bonus: c >= 2 ? 0.5 : 0,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.36, 0.036, skill, 'curved'), multiplier: Stats.HP }],
          element: Element.FIRE,
          property: TalentProperty.FUA,
          type: TalentType.SKILL,
          break: 10,
          bonus: c >= 2 ? 0.5 : 0,
        },
        {
          name: 'DMG per Bounce',
          value: [{ scaling: calcScaling(0.12, 0.012, skill, 'curved'), multiplier: Stats.HP }],
          element: Element.FIRE,
          property: TalentProperty.FUA,
          type: TalentType.SKILL,
          break: 5,
          bonus: c >= 2 ? 0.5 : 0,
        },
      ]

      if (form.mblade_ult) {
        base[Stats.CRIT_RATE].push({
          name: `Infinite Fury`,
          source: 'Self',
          value: 0.2,
        })
        base[Stats.CRIT_DMG].push({
          name: `Infinite Fury`,
          source: 'Self',
          value: calcScaling(0.3, 0.03, ult, 'curved'),
        })
        if (a.a6) {
          base[Stats.ALL_DMG].push({
            name: `Ascension 6 Passive`,
            source: 'Self',
            value: c >= 4 ? 1 : 0.5,
          })
          if (nihilityCount > 1) {
            base.ULT_DMG.push({
              name: `Ascension 6 Passive`,
              source: 'Self',
              value: 0.5,
            })
          } else {
            base.FUA_DMG.push({
              name: `Ascension 6 Passive`,
              source: 'Self',
              value: 0.5,
            })
          }
        }
        if (c >= 1) {
          base.ALL_TYPE_RES_RED.push({
            name: `Eidolon 1`,
            source: 'Self',
            value: 0.2,
          })
          addDebuff(debuffs, DebuffTypes.OTHER)
        }
      }
      if (form.balefire_bind) {
        base.VULNERABILITY.push({
          name: `Balefire Bind`,
          source: 'Self',
          value: calcScaling(0.3, 0.02, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
        base.DEF_REDUCTION.push({
          name: `Balefire Bind`,
          source: 'Self',
          value: calcScaling(0.2, 0.01, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      if (form.mblade_tech) {
        base.DMG_REDUCTION.push({
          name: `Technique`,
          source: 'Self',
          value: 0.9,
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
      if (form.mblade_ult) {
        if (a.a6) {
          base[Stats.ALL_DMG].push({
            name: `Ascension 6 Passive`,
            source: 'Mortenax Blade',
            value: c >= 4 ? 1 : 0.5,
          })
          if (nihilityCount > 1) {
            base.ULT_DMG.push({
              name: `Ascension 6 Passive`,
              source: 'Mortenax Blade',
              value: 0.5,
            })
          } else {
            base.FUA_DMG.push({
              name: `Ascension 6 Passive`,
              source: 'Mortenax Blade',
              value: 0.5,
            })
          }
        }
        if (c >= 1) {
          base.ALL_TYPE_RES_RED.push({
            name: `Eidolon 1`,
            source: 'Mortenax Blade',
            value: 0.2,
          })
        }
      }
      if (form.balefire_bind) {
        base.VULNERABILITY.push({
          name: `Balefire Bind`,
          source: 'Mortenax Blade',
          value: calcScaling(0.3, 0.02, ult, 'curved'),
        })
        base.DEF_REDUCTION.push({
          name: `Balefire Bind`,
          source: 'Mortenax Blade',
          value: calcScaling(0.2, 0.01, ult, 'curved'),
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
      globalCallback.push(function P999(_x, _d, _w, a) {
        if (c >= 2) {
          _.forEach(a, (c) => {
            c.ULT_SCALING = _.map(c.ULT_SCALING, (u) =>
              u.property === TalentProperty.NORMAL ? { ...u, property: TalentProperty.FUA } : u,
            )
          })
        }
        return a
      })

      return base
    },
  }
}

export default MBlade
