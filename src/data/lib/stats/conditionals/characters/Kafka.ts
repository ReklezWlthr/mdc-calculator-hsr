import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Kafka = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const names = _.map(team, (item) => findCharacter(item?.cId)?.name)
  const index = _.findIndex(team, (item) => item?.cId === '1005')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Midnight Tumult',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Kafka's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Caressing Moonlight',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Kafka's ATK to one designated enemy and <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Kafka's ATK to their adjacent units.
      <br />If the designated enemy or their adjacent target(s) is currently receiving DoT, all DoTs currently placed on that enemy immediately produce DMG equal to {{2}}% or {{3}}% of their original DMG.`,
      value: [
        { base: 80, growth: 8, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
        { base: 60, growth: 1.5, style: 'curved' },
        { base: 40, growth: 1, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Twilight Trill',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Kafka's ATK to all enemies, with a <span class="text-desc">100%</span> <u>base chance</u> for attacked enemy targets to become <b class="text-hsr-lightning">Shocked</b> and immediately take DMG from their current DoT debuff(s), equal to {{1}}% of its original DMG. <b class="text-hsr-lightning">Shock</b> lasts for <span class="text-desc">2</span> turn(s).
      <br />While <b class="text-hsr-lightning">Shocked</b>, enemy targets receive <b class="text-hsr-lightning">Lightning DoT</b> equal to {{2}}% of Kafka's ATK at the beginning of each turn.`,
      value: [
        { base: 48, growth: 3.2, style: 'curved' },
        { base: 100, growth: 2, style: 'curved' },
        { base: 116, growth: 10.875, style: 'dot' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      energy: 10,
      trace: 'Talent',
      title: 'Gentle but Cruel',
      content: `After Kafka's teammate uses attacks on an enemy target, Kafka immediately launches <u>Follow-up ATK</u> and deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Kafka's ATK to the primary target, with a <span class="text-desc">100%</span> <u>base chance</u> to inflict <b class="text-hsr-lightning">Shock</b> equivalent to that applied by her Ultimate to the attacked enemy target, lasting for <span class="text-desc">2</span> turns. This effect can be triggered up to <span class="text-desc">2</span> time(s), with <span class="text-desc">1</span> use(s) recovered at the end of Kafka's turn.`,
      value: [{ base: 42, growth: 9.8, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ST,
    },
    technique: {
      trace: 'Technique',
      title: 'Mercy Is Not Forgiveness',
      content: `Immediately attacks all enemies within a set range. After entering battle, deals <b class="text-hsr-lightning">Lightning DMG</b> equal to <span class="text-desc">50%</span> of Kafka's ATK to all enemies, with a <span class="text-desc">100%</span> <u>base chance</u> to inflict <b class="text-hsr-lightning">Shock</b> equivalent to that applied by her Ultimate on every enemy target for <span class="text-desc">2</span> turn(s).`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Torture',
      content: `When an ally target's Effect Hit Rate is <span class="text-desc">75%</span> or more, Kafka increases the target's ATK by <span class="text-desc">100%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Plunder',
      content: `If an enemy is defeated while <b class="text-hsr-lightning">Shocked</b>, Kafka additionally regenerates <span class="text-desc">5</span> Energy.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Thorns',
      content: `After using Ultimate, Talent's <u>Follow-up ATK</u> regains <span class="text-desc">1</span> trigger count. The Talent's <u>Follow-up ATK</u> can cause all DoT debuffs the target is currently under to immediately deal DMG equal to <span class="text-desc">80%</span> of the original DMG.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Da Capo',
      content: `When using an attack, there is a <span class="text-desc">100%</span> <u>base chance</u> to cause the target to take <span class="text-desc">30%</span> more DoT for <span class="text-desc">2</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Fortississimo`,
      content: `While Kafka is on the field, DoT dealt by all allies increases by <span class="text-desc">33%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Capriccio',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Recitativo',
      content: `When an enemy target takes DMG from the <b class="text-hsr-lightning">Shock</b> status inflicted by Kafka, Kafka additionally regenerates <span class="text-desc">2</span> Energy.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Doloroso`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Leggiero',
      content: `The <b class="text-hsr-lightning">Shock</b> inflicted on the enemy target by the Ultimate, Technique, or the Talent-triggered <u>follow-up attack</u> has a DMG multiplier increase of <span class="text-desc">156%</span> and lasts <span class="text-desc">1</span> turn(s) longer.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'kafka_c1',
      text: `E1 DoT Vulnerability`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'kafka_ult',
      text: `Ult Shock`,
      ...talents.ult,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: c >= 6 ? 3 : 2,
      debuffElement: Element.LIGHTNING,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'kafka_c1'), findContentById(content, 'kafka_ult')]

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
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          energy: 20,
          sum: true,
          hitSplit: [0.5, 0.5],
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(0.8, 0.08, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          energy: 30,
          sum: true,
          hitSplit: [0.2, 0.3, 0.5],
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.3, 0.03, skill, 'curved') + (c >= 6 ? 1.56 : 0), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          energy: 30,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.48, 0.032, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          energy: 5,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Follow-Up',
          value: [{ scaling: calcScaling(0.42, 0.098, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          sum: true,
          hitSplit: [0.15, 0.15, 0.15, 0.15, 0.15, 0.25],
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.5, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          sum: true,
        },
      ]

      if (form.kafka_ult) {
        const shock = {
          name: 'Shocked DMG',
          value: [{ scaling: calcScaling(1.16, 0.10875, ult, 'dot'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.DOT,
          type: TalentType.NONE,
          chance: { base: 1, fixed: false },
          debuffElement: Element.LIGHTNING,
        }

        base.ULT_SCALING.push(shock)
        base.TALENT_SCALING.push(shock)
        base.TECHNIQUE_SCALING.push(shock)
        base.DOT_SCALING.push({
          ...shock,
          overrideIndex: index,
          dotType: DebuffTypes.SHOCKED,
        })
        addDebuff(debuffs, DebuffTypes.SHOCKED)
      }
      if (form.kafka_c1) {
        base.DOT_VUL.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.3,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (c >= 2) {
        base.DOT_DMG.push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.33,
        })
      }
      if (a.a2 && base.getValue(Stats.EHR) > 0.75) {
        base[Stats.P_ATK].push({
          name: `Ascension 2 Passive`,
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
      if (form.kafka_c1)
        base.DOT_VUL.push({
          name: `Eidolon 1`,
          source: 'Kafka',
          value: 0.3,
        })
      if (a.a2 && base.getValue(Stats.EHR) > 0.75) {
        base[Stats.P_ATK].push({
          name: `Ascension 2 Passive`,
          source: 'Kafka',
          value: 1,
        })
      }
      if (c >= 2) {
        base.DOT_DMG.push({
          name: `Eidolon 2`,
          source: 'Kafka',
          value: 0.33,
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
      base.CALLBACK.push((x, d, w, all) => {
        const dots = _.flatMap(all, (item) => item.DOT_SCALING)
        x.SKILL_SCALING.push(
          ..._.map(dots, (item) => ({
            ...item,
            chance: undefined,
            name: `${names?.[item.overrideIndex]}'s ${item.name}`.replace('DMG', 'Detonation'),
            multiplier: (item.multiplier || 1) * calcScaling(0.6, 0.015, skill, 'curved'),
            sum: true,
            detonate: true,
          })),
          ..._.map(dots, (item) => ({
            ...item,
            chance: undefined,
            name: `${names?.[item.overrideIndex]}'s ${item.name}`.replace('DMG', 'Detonation - Adjacent'),
            multiplier: (item.multiplier || 1) * calcScaling(0.4, 0.01, skill, 'curved'),
            sum: false,
            detonate: true,
          }))
        )
        x.ULT_SCALING.push(
          ..._.map(dots, (item, i) => ({
            ...item,
            chance: undefined,
            name: `${names?.[item.overrideIndex]}'s ${item.name}`.replace('DMG', 'Detonation'),
            multiplier: (item.multiplier || 1) * calcScaling(1, 0.02, ult, 'curved'),
            sum: true,
            detonate: true,
          }))
        )
        if (a.a6) {
          x.TALENT_SCALING.push(
            ..._.map(dots, (item, i) => ({
              ...item,
              chance: undefined,
              name: `${names?.[item.overrideIndex]}'s ${item.name}`.replace('DMG', 'Detonation'),
              multiplier: (item.multiplier || 1) * 0.8,
              sum: true,
              detonate: true,
            }))
          )
        }

        return x
      })

      return base
    },
  }
}

export default Kafka
