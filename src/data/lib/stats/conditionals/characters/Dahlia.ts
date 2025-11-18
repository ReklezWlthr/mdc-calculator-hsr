import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
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
import { teamOptionGenerator } from '@src/core/utils/data_format'

const Dahlia = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1321')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Fiddle... Fissured Memory`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of the The Dahlia's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Lick... Enkindled Betrayal`,
      content: `Deploys a Zone that lasts for <span class="text-desc">3</span> turn(s), with the Zone's duration decreasing by <span class="text-desc">1</span> at the start of The Dahlia's turn. Then, deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of The Dahlia's ATK to one designated enemy and their adjacent targets.
      <br />While the Zone is active, increases all allies' Weakness Break Efficiency by <span class="text-desc">50%</span>. Toughness Reduction taken by enemy targets while not Weakness Broken can be converted into Super Break DMG.`,
      value: [{ base: 80, growth: 8, style: 'curved' }],
      level: skill,
      tag: AbilityTag.BLAST,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Wallow...Entombed Ash`,
      content: `Inflicts <b class="text-red">Wilt</b> state on all enemies, lasting for <span class="text-desc">4</span> turn(s). Then, deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of The Dahlia's ATK, which is distributed across all enemies.
      <br />Reduces DEF of enemy targets in the <b class="text-red">Wilt</b> state by {{1}}% and applies Weakness of all <b class="text-desc">Dance Partners</b>' Types to enemy targets.`,
      value: [
        { base: 180, growth: 12, style: 'curved' },
        { base: 8, growth: 1, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `Who's Afraid of Constance?`,
      content: `When entering combat, The Dahlia regenerates <span class="text-desc">35</span> Energy and grants <b class="text-desc">Dance Partner</b> to this unit and the teammate who triggered combat. Whenever there is no other <b class="text-desc">Dance Partner</b> on the field, grants <b class="text-desc">Dance Partner</b> to this unit and the teammate with the highest Break Effect. After a <b class="text-desc">Dance Partner</b> attacks a Weakness Broken enemy target, the Toughness Reduction from this attack is converted into <span class="text-desc">1</span> instance of Super Break DMG at {{0}}%.
      <br />After an enemy target is attacked by the other <b class="text-desc">Dance Partner</b>, The Dahlia launches a <u>Follow-Up ATK</u>, dealing <span class="text-desc">5</span> instance(s) of DMG, each dealing <b class="text-hsr-fire">Fire DMG</b> equal to {{1}}% of The Dahlia's ATK to one random enemy. After each instance of DMG dealt to a Weakness Broken enemy target, the Toughness Reduction from this DMG is converted into <span class="text-desc">1</span> instance of Super Break DMG at {{2}}%.
      <br />This effect can only trigger once per turn. If the target is defeated before the <u>Follow-Up ATK</u> is used, it will be launched at one random enemy instead.`,
      value: [
        { base: 30, growth: 3, style: 'curved' },
        { base: 15, growth: 1.5, style: 'curved' },
        { base: 100, growth: 10, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.BOUNCE,
    },
    technique: {
      trace: 'Technique',
      title: `The Heart Makes the Finest Tomb`,
      content: `After using Technique, creates a Special Dimension that lasts for <span class="text-desc">20</span> second(s). Enemies within this dimension will not actively attack ally targets. After entering combat with enemies in the Special Dimension, The Dahlia immediately deploys her Skill's Zone, and converts the combat-triggering Toughness Reduction into <span class="text-desc">1</span> instance of Super Break DMG at <span class="text-desc">60%</span> against enemy targets that are Weakness Broken.
      <br />Only <span class="text-desc">1</span> Dimension Effect created by allies can exist at the same time.`,
      tag: AbilityTag.IMPAIR,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Yet Another Funeral`,
      content: `When entering combat, increases other characters' Break Effect equal to <span class="text-desc">24%</span> of The Dahlia's Break Effect plus <span class="text-desc">50%</span> for <span class="text-desc">1</span> turn(s). This effect triggers again lasting <span class="text-desc">3</span> turn(s) when The Dahlia receives healing or a Shield from a teammate, but cannot be triggered repeatedly within a single turn.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Lament, Lost Soul`,
      content: `When using Talent's <u>Follow-Up ATK</u>, recovers <span class="text-desc">1</span> Skill Point for allies. This effect can be triggered once for every <span class="text-desc">2</span> Talent's <u>Follow-Up ATKs</u> used.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Outgrow the Old, Espouse the New`,
      content: `When an ally target applies Weakness to an enemy target, increases SPD by <span class="text-desc">30%</span> for <span class="text-desc">2</span> turn(s). When this effect is triggered by an ally <b class="text-hsr-fire">Fire</b> character, also regenerates a set amount of Energy equal to <span class="text-desc">10%</span> of Max Energy, capping at <span class="text-desc">50%</span> of Max Energy. This effect can only be triggered once for each character in each turn.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `When a Bud Readies to Bloom`,
      content: `Applies Talent's Super Break DMG multiplier provided to <b class="text-desc">Dance Partner</b> to all ally characters, with <b class="text-desc">Dance Partner</b> additionally receiving a <span class="text-desc">40%</span> boost. After <b class="text-desc">Dance Partner</b> uses an attack, deals an additional fixed amount of Toughness Reduction equal to <span class="text-desc">25%</span> of the enemy target's Max Toughness (minimum of <span class="text-desc">10</span> points, up to <span class="text-desc">300</span> points). This effect can only trigger once per enemy target, and the trigger count for each target resets after the enemy target receives a killing blow.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Fresh, Ethereal, and Beloved`,
      content: `<b class="text-red">Wilt</b> additionally reduces the target's <b>All-Type RES</b> by <span class="text-desc">18%</span>. When an enemy target enters the field, immediately inflicts <b class="text-red">Wilt</b> state on them, lasting for <span class="text-desc">3</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Pity Its Petals Thin as Mist`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Pity Its Heart Gnawed by Worms`,
      content: `Increases the instances of DMG dealt by Talent's <u>Follow-Up ATK</u> by <span class="text-desc">5</span>, and every hit increases the target's DMG taken by <span class="text-desc">12%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Fallen, Decayed, and Despised`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `And Yet, Always, Deathly Beautiful`,
      content: `Increases The Dahlia's Break Effect by <span class="text-desc">150%</span>. When using her Talent's <u>Follow-Up ATK</u>, advances the next action of all <b class="text-desc">Dance Partners</b> by <span class="text-desc">15%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'element',
      id: 'dance_partner',
      text: `Dance Partner`,
      ...talents.talent,
      show: true,
      default: '1',
      options: _.filter(teamOptionGenerator(team), (item) => item.value !== (index + 1).toString()),
    },
    {
      type: 'toggle',
      id: 'wilt',
      text: `Wilt`,
      ...talents.ult,
      show: true,
      default: true,
      debuff: true,
    },
    {
      type: 'toggle',
      id: 'dahlia_zone',
      text: `Dahlia's Zone`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'dahlia_tech',
      text: `Technique Super Break`,
      ...talents.technique,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'dahlia_a2',
      text: `A2 Break Effect Share`,
      ...talents.a2,
      show: a.a2,
      default: true,
    },
    {
      type: 'toggle',
      id: 'dahlia_a6',
      text: `A6 SPD Bonus`,
      ...talents.a6,
      show: a.a6,
      default: true,
    },
    {
      type: 'number',
      id: 'dahlia_e4',
      text: `E4 Bounce Vulnerability`,
      ...talents.c4,
      show: c >= 4,
      default: 5,
      max: 10,
      min: 0,
    },
    {
      type: 'toggle',
      id: 'dahlia_e1',
      text: `E1 Toughness DMG Bonus`,
      ...talents.c1,
      show: c >= 1,
      default: 5,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'dahlia_zone'),
    findContentById(content, 'wilt'),
    findContentById(content, 'dance_partner'),
    findContentById(content, 'dahlia_tech'),
    findContentById(content, 'dahlia_a2'),
    findContentById(content, 'dahlia_e4'),
    findContentById(content, 'dahlia_e1'),
  ]

  const allyContent: IContent[] = [{ ...findContentById(content, 'dahlia_a6'), default: false }]

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
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Blast',
          value: [{ scaling: calcScaling(0.8, 0.08, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.8, 0.12, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
      ]
      base.TALENT_SCALING = +form.dance_partner
        ? [
            {
              name: 'Total Single Target DMG',
              value: [{ scaling: calcScaling(0.15, 0.015, talent, 'curved'), multiplier: Stats.ATK }],
              multiplier: c >= 4 ? 10 : 5,
              element: Element.FIRE,
              property: TalentProperty.FUA,
              type: TalentType.TALENT,
              break: c >= 4 ? 30 : 15,
              sum: true,
            },
            {
              name: 'Bounce',
              value: [{ scaling: calcScaling(0.15, 0.015, talent, 'curved'), multiplier: Stats.ATK }],
              element: Element.FIRE,
              property: TalentProperty.FUA,
              type: TalentType.TALENT,
              break: 3,
            },
          ]
        : []

      if (+form.dance_partner) {
        base.SUPER_BREAK = true
        base.SUPER_BREAK_MULT.push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.3, 0.03, talent, 'curved') + (c >= 1 ? 0.4 : 0),
        })
        base.TALENT_SUPER_BREAK.push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(1, 0.1, talent, 'curved'),
        })
        if (form.wilt) {
          weakness.push(Element.FIRE)
        }
        if (form.dahlia_e1) {
          base.SUPER_BREAK_SCALING.push({
            name: 'Dahlia E1 Bonus Toughness DMG',
            break: 0.25,
            element: Element.FIRE,
            min: 10,
            max: 300,
          })
        }
      }

      if (form.wilt) {
        base.DEF_REDUCTION.push({
          name: 'Wilt',
          source: 'Self',
          value: calcScaling(0.08, 0.01, skill, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
        if (c >= 2) {
          base.ALL_TYPE_RES_RED.push({
            name: 'Eidolon 2',
            source: 'Self',
            value: 0.18,
          })
          addDebuff(debuffs, DebuffTypes.OTHER)
        }
      }

      if (form.dahlia_zone) {
        base.BREAK_EFF.push({
          name: 'Skill',
          source: 'Self',
          value: 0.5,
        })
      }

      if (form.dahlia_a6) {
        base[Stats.P_SPD].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.3,
        })
      }

      if (c >= 6) {
        base[Stats.BE].push({
          name: 'Eidolon 6',
          source: 'Self',
          value: 1.5,
        })
      }

      if (form.dahlia_e4) {
        base.VULNERABILITY.push({
          name: 'Eidolon 4',
          source: 'Self',
          value: form.dahlia_e4 * 0.12,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
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
      const isPartner = +form.dance_partner - 1 === _.findIndex(team, (item) => item.cId === base.ID)
      if (isPartner || (c >= 1 && +form.dance_partner)) {
        base.SUPER_BREAK = true
        base.SUPER_BREAK_MULT.push({
          name: 'Talent',
          source: 'The Dahlia',
          value: calcScaling(0.3, 0.03, talent, 'curved') + (c >= 1 && isPartner ? 0.4 : 0),
        })
        if (form.wilt) {
          weakness.push(base.ELEMENT)
        }
        if (form.dahlia_e1) {
          base.SUPER_BREAK_SCALING.push({
            name: 'Dahlia E1 Bonus Toughness DMG',
            break: 0.25,
            element: Element.FIRE,
            min: 10,
            max: 300,
          })
        }
      }

      if (form.wilt) {
        base.DEF_REDUCTION.push({
          name: 'Wilt',
          source: 'The Dahlia',
          value: calcScaling(0.08, 0.01, skill, 'curved'),
        })
        if (c >= 2) {
          base.ALL_TYPE_RES_RED.push({
            name: 'Eidolon 2',
            source: 'The Dahlia',
            value: 0.18,
          })
        }
      }

      if (form.dahlia_zone) {
        base.BREAK_EFF.push({
          name: 'Skill',
          source: 'The Dahlia',
          value: 0.5,
        })
      }

      if (form.dahlia_tech) {
        base.TECHNIQUE_SUPER_BREAK.push({
          name: 'Technique',
          source: 'The Dahlia',
          value: 0.6,
        })
      }

      if (aForm.dahlia_a6) {
        base[Stats.P_SPD].push({
          name: 'Ascension 6 Passive',
          source: 'The Dahlia',
          value: 0.3,
        })
      }

      if (form.dahlia_e4) {
        base.VULNERABILITY.push({
          name: 'Eidolon 4',
          source: 'The Dahlia',
          value: form.dahlia_e4 * 0.12,
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
      broken: boolean
    ) => {
      if (form.dahlia_a2) {
        _.forEach(team, (t, i) => {
          if (index !== i)
            t[Stats.BE].push({
              name: 'Ascension 2 Passive',
              source: 'The Dahlia',
              value: 0.5 + 0.24 * base.getValue(Stats.BE),
              flat: '50%',
              base: toPercentage(base.getValue(Stats.BE)),
              multiplier: 0.24,
            })
        })
      }

      return base
    },
  }
}

export default Dahlia
