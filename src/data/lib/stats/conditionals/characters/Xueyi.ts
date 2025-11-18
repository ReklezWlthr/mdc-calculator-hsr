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

const Xueyi = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: `Mara-Sunder Awl`,
      content: `Deals {{0}}% of Xueyi's ATK as <b class="text-hsr-quantum">Quantum DMG</b> to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Iniquity Obliteration`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Xueyi's ATK to a single enemy, and <b class="text-hsr-quantum">Quantum DMG</b> equal to {{1}}% of Xueyi's ATK to any adjacent enemies.`,
      value: [
        { base: 70, growth: 7, style: 'curved' },
        { base: 35, growth: 3.5, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Divine Castigation`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Xueyi's ATK to a single target enemy. This attack ignores Weakness Types and reduces the enemy's Toughness. When the enemy's Weakness is Broken, the <b class="text-hsr-quantum">Quantum</b> Weakness Break effect is triggered.
      <br />In this attack, the more Toughness is reduced, the higher the DMG will be dealt, up to a max of {{1}}% increase.`,
      value: [
        { base: 150, growth: 10, style: 'curved' },
        { base: 36, growth: 2.4, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.ST,
    },
    talent: {
      energy: 6,
      trace: 'Talent',
      title: `Karmic Perpetuation`,
      content: `When Xueyi reduces enemy Toughness with attacks, <b>Karma</b> will be stacked. The more Toughness is reduced, the more stacks of <b>Karma</b> are added, up to <span class="text-desc">8</span> stacks.
      <br />When Xueyi's allies reduce enemy Toughness with attacks, Xueyi gains <span class="text-desc">1</span> stacks of <b>Karma</b>.
      <br />When <b>Karma</b> reaches the max number of stacks, consumes all current <b>Karma</b> stacks and immediately launches a <u>follow-up attack</u> against an enemy target, dealing DMG for <span class="text-desc">3</span> times, with each time dealing <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Xueyi's ATK to a single random enemy. This <u>follow-up attack</u> will not add <b>Karma</b> stacks.`,
      value: [{ base: 45, growth: 4.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.BOUNCE,
    },
    technique: {
      trace: 'Technique',
      title: `Summary Execution`,
      content: `Immediately attacks the enemy. After entering combat, deals <span class="text-desc">80%</span> of Xueyi's ATK as <b class="text-hsr-quantum">Quantum DMG</b> to all enemies.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Clairvoyant Loom`,
      content: `Increases DMG dealt by this unit by an amount equal to <span class="text-desc">100%</span> of Break Effect, up to a maximum DMG increase of <span class="text-desc">240%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Intrepid Rollerbearings`,
      content: `If the enemy target's Toughness is equal to or higher than <span class="text-desc">50%</span> of their Max Toughness, deals <span class="text-desc">10%</span> more DMG when using Ultimate.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Perspicacious Mainframe`,
      content: `Xueyi will keep a tally of the number of <b>Karma</b> stacks that exceed the max stack limit, up to <span class="text-desc">6</span> stacks in the tally. After Xueyi's Talent is triggered, she will gain a corresponding number of tallied <b>Karma</b> stacks.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Dvesha, Inhibited`,
      content: `Increases the DMG dealt by the Talent's <u>follow-up attack</u> by <span class="text-desc">40%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Klesha, Breached`,
      content: `Talent's <u>follow-up attack</u> reduces enemy Toughness regardless of Weakness types. At the same time, restores Xueyi's HP by an amount equal to <span class="text-desc">5%</span> of her Max HP. When breaking Weakness, triggers the <b class="text-hsr-quantum">Quantum</b> Break Effect.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Duḥkha, Ceased`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Karma, Severed`,
      content: `When using Ultimate, increases Break Effect by <span class="text-desc">40%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Deva, Enthralled`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Saṃsāra, Mastered`,
      content: `The max stack limit for <b>Karma</b> decreases to <span class="text-desc">6</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'xueyi_ult',
      text: `Ult Toughness DMG Dealt`,
      ...talents.ult,
      show: true,
      default: 40,
      min: 0,
      max: 40,
      unique: true,
    },
    {
      type: 'toggle',
      id: 'xueyi_a4',
      text: `Target Toughness >= 50%`,
      ...talents.a4,
      show: a.a4,
      default: true,
    },
    {
      type: 'toggle',
      id: 'xueyi_c4',
      text: `E4 Break Effect Bonus`,
      ...talents.c4,
      show: c >= 4,
      default: true,
      duration: 2,
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
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
          hitSplit: [0.4, 0.6],
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(0.7, 0.07, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.35, 0.035, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.5, 0.1, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 40,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Bounce',
          value: [{ scaling: calcScaling(0.45, 0.045, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 5,
        },
        {
          name: 'Max Single Target DMG',
          value: [{ scaling: calcScaling(0.45, 0.045, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          multiplier: 3,
          break: 15,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.8, multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
          sum: true,
        },
      ]

      if (form.xueyi_ult)
        base.ULT_DMG.push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.36, 0.024, ult, 'curved') * (form.xueyi_ult / 40),
        })
      if (form.xueyi_a4)
        base.ULT_DMG.push({
          name: 'Ascension 4 Passive',
          source: 'Self',
          value: 0.1,
        })
      if (c >= 1)
        base.TALENT_DMG.push({
          name: 'Eidolon 1',
          source: 'Self',
          value: 0.4,
        })
      if (c >= 2)
        base.TALENT_SCALING.push({
          name: 'Healing',
          value: [{ scaling: 0.5, multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        })
      if (form.xueyi_c4)
        base[Stats.BE].push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.4,
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
      if (a.a2)
        base.CALLBACK.push((x) => {
          x[Stats.ALL_DMG].push({
            name: 'Ascension 2 Passive',
            source: 'Self',
            value: _.min([x.getValue(Stats.BE), 2.4]),
          })
          return x
        })
      return base
    },
  }
}

export default Xueyi
