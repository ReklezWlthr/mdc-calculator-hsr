import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

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
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Kafka's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Caressing Moonlight',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Kafka's ATK to a target enemy and <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Kafka's ATK to enemies adjacent to it.
      <br />If the target enemy is currently receiving DoT, all DoTs currently placed on that enemy immediately produce DMG equal to {{2}}% of their original DMG.`,
      value: [
        { base: 80, growth: 8, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
        { base: 60, growth: 1.5, style: 'curved' },
      ],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Twilight Trill',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Kafka's ATK to all enemies, with a <span class="text-desc">100%</span> <u>base chance</u> for enemies hit to become <b class="text-hsr-lightning">Shocked</b> and immediately take DMG from their current <b class="text-hsr-lightning">Shock</b> state, equal to {{1}}% of its original DMG. <b class="text-hsr-lightning">Shock</b> lasts for <span class="text-desc">2</span> turn(s).
      <br />While <b class="text-hsr-lightning">Shocked</b>, enemies receive <b class="text-hsr-lightning">Lightning DoT</b> equal to {{2}}% of Kafka's ATK at the beginning of each turn.`,
      value: [
        { base: 48, growth: 3.2, style: 'curved' },
        { base: 80, growth: 2, style: 'curved' },
        { base: 116, growth: 10.875, style: 'dot' },
      ],
      level: ult,
    },
    talent: {
      energy: 10,
      trace: 'Talent',
      title: 'Gentle but Cruel',
      content: `After an ally of Kafka's uses Basic ATK on an enemy target, Kafka immediately launches <span class="text-desc">1</span> <u>follow-up attack</u> and deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of her ATK to that target, with a <span class="text-desc">100%</span> <u>base chance</u> to inflict <b class="text-hsr-lightning">Shock</b> equivalent to that applied by her Ultimate to the attacked enemy target for <span class="text-desc">2</span> turns. This effect can only be triggered <span class="text-desc">1</span> time per turn.`,
      value: [{ base: 42, growth: 9.8, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'Mercy Is Not Forgiveness',
      content: `Immediately attacks all enemies within a set range. After entering battle, deals <b class="text-hsr-lightning">Lightning DMG</b> equal to <span class="text-desc">50%</span> of Kafka's ATK to all enemies, with a <span class="text-desc">100%</span> <u>base chance</u> to inflict <b class="text-hsr-lightning">Shock</b> equivalent to that applied by her Ultimate on every enemy target for <span class="text-desc">2</span> turn(s).`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Torture',
      content: `When the Ultimate is used, enemy targets will now receive DMG immediately from all currently applied DoT sources instead of just receiving DMG immediately from the currently applied <b class="text-hsr-lightning">Shock</b> state.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Plunder',
      content: `If an enemy is defeated while <b class="text-hsr-lightning">Shocked</b>, Kafka additionally regenerates <span class="text-desc">5</span> Energy.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Thorns',
      content: `The <u>base chance</u> for Ultimate, Technique, or the <u>follow-up attack</u> triggered by the Talent to inflict <b class="text-hsr-lightning">Shock</b> increases by <span class="text-desc">30%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Da Capo',
      content: `When the Talent triggers a <u>follow-up attack</u>, there is a <span class="text-desc">100%</span> <u>base chance</u> to increase the DoT received by the target by <span class="text-desc">30%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Fortississimo`,
      content: `While Kafka is on the field, DoT dealt by all allies increases by <span class="text-desc">25%</span>.`,
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
      content: `The <b class="text-hsr-lightning">Shock</b> inflicted on the enemy target by the Ultimate, the Technique, or the Talent-triggered <u>follow-up attack</u> has a DMG multiplier increase of <span class="text-desc">156%</span> and lasts <span class="text-desc">1</span> turn(s) longer.`,
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
      chance: { base: 1 + (a.a6 ? 0.3 : 0), fixed: false },
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
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Follow-Up',
          value: [{ scaling: calcScaling(0.42, 0.098, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.5, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
        },
      ]

      if (form.kafka_ult) {
        const shock = {
          name: 'Shocked DMG',
          value: [{ scaling: calcScaling(1.16, 0.10875, ult, 'dot'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.DOT,
          type: TalentType.NONE,
          chance: { base: 1 + (a.a6 ? 0.3 : 0), fixed: false },
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
      if (c >= 2)
        base.DOT_DMG.push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.25,
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
      if (form.kafka_c1)
        base.DOT_VUL.push({
          name: `Eidolon 1`,
          source: 'Kafka',
          value: 0.3,
        })
      if (c >= 2)
        base.DOT_DMG.push({
          name: `Eidolon 2`,
          source: 'Kafka',
          value: 0.25,
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
      broken: boolean
    ) => {
      base.CALLBACK.push((x, d, w, all) => {
        const dots = _.flatMap(all, (item) => item.DOT_SCALING)
        const shock = _.filter(dots, (item) => _.includes([DebuffTypes.SHOCKED, DebuffTypes.DOT], item.dotType))
        x.SKILL_SCALING.push(
          ..._.map(dots, (item) => ({
            ...item,
            chance: undefined,
            name: `${names?.[item.overrideIndex]}'s ${item.name}`.replace('DMG', 'Detonation'),
            multiplier: (item.multiplier || 1) * calcScaling(0.6, 0.015, skill, 'curved'),
          }))
        )
        x.ULT_SCALING.push(
          ..._.map(a.a2 ? dots : shock, (item, i) => ({
            ...item,
            chance: undefined,
            name: `${names?.[item.overrideIndex]}'s ${item.name}`.replace('DMG', 'Detonation'),
            multiplier: (item.multiplier || 1) * calcScaling(0.8, 0.02, ult, 'curved'),
          }))
        )

        return x
      })

      return base
    },
  }
}

export default Kafka
