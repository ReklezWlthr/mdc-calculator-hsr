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

const HimekoNova = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: 'Enkindle the First Lodestar',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Himeko • Nova's ATK to one enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      image: 'asset/traces/SkillIcon_1510_Normal.webp',
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Upraise the Vanward Cresset`,
      content: `After using Skill, immediately regains all uses of <u>Assist Skill</u> and Himeko • Nova gains <b class="text-hsr-fire">Navigator's Semaphore</b>, lasting for <span class="text-desc">3</span> turn(s). At the start of each of Himeko • Nova's turn, the duration is reduced by <span class="text-desc">1</span>. When Himeko • Nova has <b class="text-hsr-fire">Navigator's Semaphore</b>, DMG dealt by all allies increases by {{0}}%. At the start of every turn, immediately regains <span class="text-desc">1</span> use of <u>Assist Skill</u>.`,
      value: [{ base: 10, growth: 1, style: 'curved' }],
      level: skill,
      tag: AbilityTag.SUPPORT,
      sp: -1,
      image: 'asset/traces/SkillIcon_1510_BP.webp',
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'We, Too, Stride the Stars',
      content: `Immediately takes control of <b class="text-orange-500">Starblazer</b>. <b class="text-orange-500">Starblazer</b> can launch <b>Hyperluminal Particle Beam</b> against enemies <span class="text-desc">6</span> times, or consume <b class="text-desc">Source Energy</b> to launch <b>Orbital Annihilation Pulse</b>, dealing <b class="text-hsr-fire">Fire DMG</b> up to {{4}}% of Himeko • Nova's ATK to one designated enemy, and <b class="text-hsr-fire">Fire DMG</b> up to {{5}}% of Himeko • Nova's ATK to other targets.
      <br />When the uses of <b>Hyperluminal Particle Beam</b> are depleted, automatically launches <b>Orbital Annihilation Pulse</b>, followed by Final Hit, dealing <span class="text-desc">3</span> instances of DMG, with each instance dealing <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Himeko • Nova's ATK to one random enemy.
      <br />When <b>Hyperluminal Particle Beam</b> or <b>Orbital Annihilation Pulse</b> deals fatal damage to all enemies on the field, or when enemy HP can no longer be reduced, immediately launches Final Hit.
      <br />
      <br /><b>Hyperluminal Particle Beam</b>
      <br />Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{1}}% of Himeko • Nova's ATK to all enemies and gains <span class="text-desc">1</span> point(s) of <b class="text-desc">Source Energy</b>. A maximum of <span class="text-desc">3</span> <b class="text-desc">Source Energy</b> can be held.
      <br />
      <br /><b>Orbital Annihilation Pulse</b>
      <br />Consumes <span class="text-desc">1</span> point of <b class="text-desc">Source Energy</b> to deal <b class="text-hsr-fire">Fire DMG</b> equal to {{2}}% of Himeko • Nova's ATK to all enemies. When current <b class="text-desc">Source Energy</b> is more than <span class="text-desc">1</span> point, for every <span class="text-desc">1</span> point(s) of <b class="text-desc">Source Energy</b> consumed, additionally deals <span class="text-desc">1</span> instance of <b class="text-hsr-fire">Fire DMG</b> equal to {{3}}% of Himeko • Nova's ATK to one random enemy.`,
      value: [
        { base: 40, growth: 4, style: 'curved' },
        { base: 16, growth: 1.6, style: 'curved' },
        { base: 10, growth: 1, style: 'curved' },
        { base: 15, growth: 1.5, style: 'curved' },
        { base: 381, growth: 38.1, style: 'curved' },
        { base: 126, growth: 12.6, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
      image: 'asset/traces/SkillIcon_1510_Ultra_on.webp',
    },
    talent: {
      trace: 'Exclusive Talent',
      title: `Of Fire and Far Faring`,
      content: `While Himeko • Nova is on the field, immediately deploys the Territory <b>Starblazer Visioscape</b>, causing a <b class="text-orange-500">Starblazer</b> to appear on the field and granting all ally characters <span class="text-desc">1</span> <u>Assist Skill</u> usage. Ally characters can use the <u>Assist Skill</u> to command the <b class="text-orange-500">Starblazer</b> to attack enemies.
      <br />Using the <u>Assist Skill</u> is considered as Himeko • Nova using her Skill. Himeko • Nova's <b>All-Type RES PEN</b> by {{0}}% and CRIT DMG by {{1}}%. Attacks can ignore Weakness Types to reduce enemy Toughness. When Weakness is Broken, triggers the <b class="text-hsr-fire">Fire</b> Weakness Break effect.
      <br />When an ally character other than Himeko • Nova uses the <u>Assist Skill</u>, they regenerate <span class="text-desc">4</span> Energy.
      <br />
      <br /><span class="text-primary-lighter text-xs">Assist Skill</span>
      <br /><b>Trailblaze, By Your Side</b>
      <br />Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{2}}% of Himeko • Nova's ATK to all enemies, and deals <span class="text-desc">3</span> extra instances of DMG, with each instance dealing <b class="text-hsr-fire">Fire DMG</b> equal to {{3}}% of Himeko • Nova's ATK to one random enemy. When used by Himeko • Nova, deals <b class="text-hsr-fire">Fire DMG</b> equal to {{4}}% of Himeko • Nova's ATK to all enemies, and deals <span class="text-desc">4</span> extra instances of DMG, with each instance dealing <b class="text-hsr-fire">Fire DMG</b> equal to {{5}}% of Himeko • Nova's ATK to one random enemy.
      <br />If used by a <u>Trailblaze Companions</u> character other than Himeko • Nova, Himeko • Nova will gain additionally gain <span class="text-desc">1</span> of the <u>Special Effects</u> depending on the user.
      <br />The extra <u>Assist Skill</u> triggered by all <b>Special Effects</b> can be triggered up to <span class="text-desc">2</span> time(s) per battle, and the trigger count is reset after Himeko • Nova uses her Ultimate.`,
      value: [
        { base: 10, growth: 1, style: 'curved' },
        { base: 40, growth: 4, style: 'curved' },
        { base: 80, growth: 8, style: 'curved' },
        { base: 12, growth: 1.2, style: 'curved' },
        { base: 100, growth: 10, style: 'curved' },
        { base: 18, growth: 1.4, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1510_Passive.webp',
    },
    summon_skill: {
      trace: 'Assist Skill',
      title: 'Trailblaze, By Your Side',
      content: `<b>Companion Protocol: Verdict</b>
      <br />Enters the <b>Companion Protocol: Verdict</b> state. Increases DMG dealt by Himeko • Nova by {{0}}%, and additionally increases her Ultimate DMG dealt by {{0}}%. After Himeko • Nova's teammates actively use their Ultimate <span class="text-desc">2</span> time(s), Himeko • Nova immediately launches <span class="text-desc">1</span> <u>Assist Skill</u> against the enemy at no cost.
      <br />
      <br /><b>Companion Protocol: Decimation</b>
      <br />Enters the <b>Companion Protocol: Decimation</b> state. Increases all allies' CRIT DMG by {{0}}%, and additionally increases the CRIT DMG dealt by Skills by {{0}}%. Gains <span class="text-desc">1</span> point of <b>Charge</b> for each enemy target hit by an ally. When <b>Charge</b> reaches <span class="text-desc">9</span> points, consumes all <b>Charge</b>, and Himeko • Nova immediately launches <span class="text-desc">1</span> <u>Assist Skill</u> against the enemy at no cost. This instance of <u>Assist Skill</u> cannot gain <b>Charge</b>.`,
      value: [{ base: 50, growth: 5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.AOE,
      energy: 18,
      image: 'asset/traces/SkillIcon_1510_Assist.webp',
    },
    technique: {
      trace: 'Technique',
      title: `Starcharter Cruise`,
      content: `When Himeko • Nova is in the team, increases max Technique Points by <span class="text-desc">3</span>.
      <br />After using the Technique, she enters the <b>Cruise</b> state, lasting for <span class="text-desc">30</span> seconds. Actively using the Technique consumes <span class="text-desc">2</span> Technique Points and immediately attacks all enemies within a certain range. After entering combat, immediately uses Skill <span class="text-desc">1</span> time at the start of each wave.
      <br />If attacking a Normal Enemy, immediately defeats them without entering combat. No Technique Points are consumed if no enemies are hit.`,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1510_Maze.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'The Silver Rail, Hushed in Antiquity',
      content: `When using Ultimate, immediately gains <span class="text-desc">3</span> point(s) of <b class="text-desc">Source Energy</b>. If current <b class="text-desc">Source Energy</b> is <span class="text-desc">3</span> point(s) or more, when using the <b>Orbital Annihilation Pulse</b> attack, the DMG multiplier of <b>Orbital Annihilation Pulse</b> against random single enemies increases by <span class="text-desc">30%</span>.`,
      image: 'asset/traces/SkillIcon_1510_SkillTree3.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Hark! The Express's Pulse Roars`,
      content: `When a <u>Trailblaze Companions</u> character other than Himeko • Nova actively uses an <u>Assist Skill</u>, that character immediately gains <span class="text-desc">1</span> extra turn during which they can use their Ultimate. An extra turn gained from an <u>Assist Skill</u> will not repeatedly trigger this Trace effect.`,
      image: 'asset/traces/SkillIcon_1510_SkillTree2.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Whither, the Last and First Men?',
      content: `When Himeko • Nova uses her <u>Assist Skill</u>, it does not consume <u>Assist Skill</u> uses. At the start of the turn, if the current <u>Assist Skill</u> uses equal the current maximum limit, Himeko • Nova additionally regenerates <span class="text-desc">5</span> Energy.`,
      image: 'asset/traces/SkillIcon_1510_SkillTree1.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'That Which We Stride Is the Trailblaze',
      content: `Increases the number of times the Talent triggers the extra <u>Assist Skill</u> effect by <span class="text-desc">1</span>. When in the <b>Companion Protocol: Verdict</b> state, the number of Ultimate uses required to launch the <u>Assist Skill</u> is reduced by <span class="text-desc">1</span>. When in the <b>Companion Protocol: Decimation</b> state, the <b>Charge</b> required to launch the <u>Assist Skill</u> is reduced by <span class="text-desc">3</span>. When Himeko • Nova launches the <u>Assist Skill</u>, the number of times the extra DMG effect is triggered increases by <span class="text-desc">1</span>.`,
      image: 'asset/traces/SkillIcon_1510_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: `The Colors We Never Strike`,
      content: `Max uses of <u>Assist Skill</u> increase to <span class="text-desc">2</span>, and DMG dealt by Ultimate and <u>Assist Skill</u> increases by <span class="text-desc">130%</span> of their original DMG. At the start of each turn in the <b class="text-hsr-fire">Navigator's Semaphore</b> state, immediately recovers <span class="text-desc">1</span> extra <u>Assist Skill</u> use. Trace <b>Hark! The Express's Pulse Roars</b> effect: When characters other than <u>Trailblaze Companions</u> use <u>Assist Skill</u>, they also gain <span class="text-desc">1</span> extra turn.`,
      image: 'asset/traces/SkillIcon_1510_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'We Who Are Starborn Muse Starward',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
      image: 'asset/traces/SkillIcon_1510_Ultra.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Let No Skyward Hand Stay Unheld`,
      content: `When using the <u>Assist Skill</u> from Talent <b>Of Fire and Far Faring</b>, the <b>All-Type RES PEN</b> increase effect applies to all allies. When Himeko • Nova gains this effect, her <b>All-Type RES PEN</b> increases by an additional <span class="text-desc">10%</span>.`,
      image: 'asset/traces/SkillIcon_1510_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: `To Cross the Cosmos and Beyond`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1510_BP.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Ours Is the Oath to Sail Starward',
      content: `Himeko • Nova's <b class="text-hsr-fire">Fire RES PEN</b> increases by <span class="text-desc">20%</span>. Max <b class="text-desc">Source Energy</b> increases to <span class="text-desc">6</span> point(s), and when an ally uses or triggers an <u>Assist Skill</u>, DMG dealt by the <u>Assist Skill</u> increases by <span class="text-desc">75%</span>, and Himeko • Nova gains <span class="text-desc">1</span> point(s) of <b class="text-desc">Source Energy</b>. When launching an <b>Hyperluminal Particle Beam</b> attack during the Ultimate, additionally gains <span class="text-desc">1</span> point of <b class="text-desc">Source Energy</b>. When launching <b>Orbital Annihilation Pulse</b>, if current <b class="text-desc">Source Energy</b> is greater than or equal to <span class="text-desc">6</span> point(s), additionally deals <b class="text-hsr-fire">Fire DMG</b> equal to <span class="text-desc">160%</span> of Himeko • Nova's ATK to all enemies <span class="text-desc">1</span> time.`,
      image: 'asset/traces/SkillIcon_1510_Rank6.webp',
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'nova_skill',
      text: `Navigator's Semaphore`,
      ...talents.skill,
      show: true,
      default: true,
    },
    {
      type: 'element',
      id: 'companion_protocol',
      text: `Companion Protocol`,
      ...talents.summon_skill,
      show: true,
      default: 'none',
      options: [
        { name: 'None', value: 'none' },
        { name: 'Verdict', value: 'verdict' },
        { name: 'Decimation', value: 'decimation' },
      ],
    },
    {
      type: 'number',
      id: 'source_energy',
      text: `Source Energy`,
      ...talents.ult,
      show: true,
      default: 3,
      min: 0,
      max: c >= 6 ? 6 : 3,
    },
    {
      type: 'toggle',
      id: 'nova_e6',
      text: `E6 Extra AoE Hit`,
      ...talents.c6,
      show: c >= 6,
      default: true,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'nova_skill'),
    findContentById(content, 'companion_protocol'),
  ]

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

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Total Single Target DMG',
          value: [
            { scaling: calcScaling(0.8, 0.08, talent, 'curved'), multiplier: Stats.ATK },
            { scaling: calcScaling(0.12, 0.012, talent, 'curved'), hits: 3, multiplier: Stats.ATK },
          ],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 25,
          assist: true,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.8, 0.08, talent, 'curved'), multiplier: Stats.HP }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          assist: true,
        },
        {
          name: 'DMG per Bounce',
          value: [{ scaling: calcScaling(0.12, 0.012, talent, 'curved'), multiplier: Stats.HP }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 5,
          assist: true,
        },
        {
          name: 'Himeko - Total Single Target DMG',
          value: [
            { scaling: calcScaling(1, 0.1, talent, 'curved'), multiplier: Stats.ATK },
            { scaling: calcScaling(0.18, 0.014, talent, 'curved'), hits: c >= 1 ? 5 : 4, multiplier: Stats.ATK },
          ],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 30,
          sum: true,
          assist: true,
        },
        {
          name: 'Himeko - AoE',
          value: [{ scaling: calcScaling(1, 0.1, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          assist: true,
        },
        {
          name: 'Himeko - DMG per Bounce',
          value: [{ scaling: calcScaling(0.18, 0.014, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 5,
          assist: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: `Max Main DMG (6 Beams + 3 Pulses + ${c >= 6 ? 18 : 9} Enhanced Bounces + 3 Final Hits)`,
          value: [
            // Beam
            { scaling: calcScaling(0.16, 0.016, ult, 'curved'), hits: 6, multiplier: Stats.ATK },
            // Orbital AoE
            { scaling: calcScaling(0.1, 0.01, ult, 'curved'), hits: 3, multiplier: Stats.ATK },
            // Orbital Bounce
            {
              scaling: calcScaling(0.15, 0.015, ult, 'curved') + (form.source_energy >= 3 ? 0.3 : 0),
              hits: c >= 6 ? 18 : 9,
              multiplier: Stats.ATK,
            },
            // Final Hit
            { scaling: calcScaling(0.4, 0.04, ult, 'curved'), hits: 3, multiplier: Stats.ATK },
          ],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 48,
          sum: true,
        },
        {
          name: 'Max Other DMG (6 Beams + 3 Pulses)',
          value: [
            // Beam
            { scaling: calcScaling(0.16, 0.016, ult, 'curved'), hits: 6, multiplier: Stats.ATK },
            // Orbital AoE
            { scaling: calcScaling(0.1, 0.01, ult, 'curved'), hits: 3, multiplier: Stats.ATK },
          ],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 18,
        },
        {
          name: 'Hyperluminal Particle Beam',
          value: [{ scaling: calcScaling(0.16, 0.016, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 2,
        },
        {
          name: 'Orbital Annihilation Pulse',
          value: [{ scaling: calcScaling(0.1, 0.01, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 2,
        },
        {
          name: 'Final Hit (Each)',
          value: [{ scaling: calcScaling(0.4, 0.04, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 4,
        },
        {
          name: 'Source Energy Bounce',
          value: [{ scaling: calcScaling(0.15, 0.015, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 2,
        },
      ]
      if (a.a6) {
        base.ULT_SCALING.push({
          name: 'A6 Enhanced Source Energy Bounce',
          value: [{ scaling: calcScaling(0.15, 0.015, ult, 'curved') + 0.3, multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 2,
        })
      }
      if (form.nova_e6) {
        base.ULT_SCALING.push(
          {
            name: 'Max E6 Source Energy AoE',
            value: [{ scaling: 1.6, hits: 3, multiplier: Stats.ATK }],
            element: Element.FIRE,
            property: TalentProperty.NORMAL,
            type: TalentType.ULT,
            sum: true,
          },
          {
            name: 'E6 Source Energy AoE',
            value: [{ scaling: 1.6, multiplier: Stats.ATK }],
            element: Element.FIRE,
            property: TalentProperty.NORMAL,
            type: TalentType.ULT,
            sum: true,
          },
        )
      }

      if (form.nova_skill) {
        base[Stats.ALL_DMG].push({
          name: `Navigator's Semaphore`,
          source: 'Self',
          value: calcScaling(0.1, 0.01, skill, 'curved'),
        })
      }
      if (form.companion_protocol === 'verdict') {
        base[Stats.ALL_DMG].push({
          name: `Companion Protocol: Verdict`,
          source: 'Self',
          value: calcScaling(0.5, 0.05, skill, 'curved'),
        })
        base.ULT_DMG.push({
          name: `Companion Protocol: Verdict`,
          source: 'Self',
          value: calcScaling(0.5, 0.05, skill, 'curved'),
        })
      }
      if (form.companion_protocol === 'decimation') {
        base[Stats.CRIT_DMG].push({
          name: `Companion Protocol: Decimation`,
          source: 'Self',
          value: calcScaling(0.5, 0.05, skill, 'curved'),
        })
        base.SKILL_CD.push({
          name: `Companion Protocol: Decimation`,
          source: 'Self',
          value: calcScaling(0.5, 0.05, skill, 'curved'),
        })
      }
      base.ALL_TYPE_RES_PEN.push({
        name: 'Talent',
        source: 'Self',
        value: calcScaling(0.1, 0.01, talent, 'curved') + (c >= 4 ? 0.1 : 0),
      })
      base[Stats.CRIT_DMG].push({
        name: 'Talent',
        source: 'Self',
        value: calcScaling(0.4, 0.04, talent, 'curved'),
      })
      if (c >= 6) {
        base.FIRE_RES_PEN.push({
          name: 'Eidolon 6',
          source: 'Self',
          value: 0.2,
        })
        base.ASSIST_DMG.push({
          name: 'Eidolon 6',
          source: 'Self',
          value: 0.75,
        })
      }
      if (c >= 2) {
        base.ULT_MULT.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.3,
        })
        base.ASSIST_MULT.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.3,
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
      if (form.nova_skill) {
        base[Stats.ALL_DMG].push({
          name: `Navigator's Semaphore`,
          source: 'Himeko • Nova',
          value: calcScaling(0.1, 0.01, skill, 'curved'),
        })
      }
      if (form.companion_protocol === 'decimation') {
        base[Stats.CRIT_DMG].push({
          name: `Companion Protocol: Decimation`,
          source: 'Himeko • Nova',
          value: calcScaling(0.25, 0.025, skill, 'curved'),
        })
        base.SKILL_CD.push({
          name: `Companion Protocol: Decimation`,
          source: 'Himeko • Nova',
          value: calcScaling(0.25, 0.025, skill, 'curved'),
        })
      }
      if (form.nova_assist && c >= 4) {
        base.ALL_TYPE_RES_PEN.push({
          name: 'Talent',
          source: 'Himeko • Nova',
          value: calcScaling(0.1, 0.01, talent, 'curved'),
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

export default HimekoNova
