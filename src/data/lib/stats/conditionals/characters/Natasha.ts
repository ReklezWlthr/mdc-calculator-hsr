import { addDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Natasha = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      trace: 'Basic ATK',
      title: 'Behind the Kindness',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Natasha's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      trace: 'Skill',
      title: 'Love, Heal, and Choose',
      content: `Restores a single ally for {{0}}% of Natasha's Max HP plus {{1}}. Restores the ally for another {{2}}% of Natasha's Max HP plus {{3}} at the beginning of each turn for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 7, growth: 0.4375, style: 'heal' },
        { base: 70, growth: 52, style: 'flat' },
        { base: 4.8, growth: 0.3, style: 'curved' },
        { base: 48, growth: 28.8, style: 'flat' },
      ],
      level: skill,
    },
    ult: {
      trace: 'Ultimate',
      title: `Gift of Rebirth`,
      content: `Heals all allies for {{0}}% of Natasha's Max HP plus {{1}}.`,
      value: [
        { base: 9.2, growth: 0.575, style: 'heal' },
        { base: 92, growth: 55.2, style: 'heal' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Innervation`,
      content: `When healing allies with HP percentage at <span class="text-desc">30%</span> or lower, increases Natasha's Outgoing Healing by {{0}}%. This effect also works on continuous healing.`,
      value: [{ base: 25, growth: 2.5, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'Hypnosis Research',
      content: `Immediately attacks the enemy. After entering battle, deals <b class="text-hsr-physical">Physical DMG</b> equal to <span class="text-desc">80%</span> of Natasha's ATK to a random enemy, with a <span class="text-desc">100%</span> <u>base chance</u> to <b>Weaken</b> all enemies.
      <br />While <b>Weakened</b>, enemies deal <span class="text-desc">30%</span> less DMG to allies for <span class="text-desc">1</span> turn(s).`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Soothe`,
      content: `Skill has a <span class="text-desc">20%</span> increased <u>base chance</u> to <b class="text-hsr-lightning">Shock</b> enemies.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Healer`,
      content: `Natasha's Outgoing Healing increases by <span class="text-desc">10%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Recuperation`,
      content: `Increases the duration of Skill's continuous healing effect for <span class="text-desc">1</span> turn(s).`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Pharmacology Expertise`,
      content: `After being attacked, if the current HP percentage is <span class="text-desc">30%</span> or lower, heals self for <span class="text-desc">1</span> time to restore HP by an amount equal to <span class="text-desc">15%</span> of Max HP plus <span class="text-desc">400</span>. This effect can only be triggered <span class="text-desc">1</span> time per battle.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Clinical Research`,
      content: `When Natasha uses her Ultimate, grant continuous healing for <span class="text-desc">1</span> turn(s) to all allies whose HP is at <span class="text-desc">30%</span> or lower. And at the beginning of their turn, their HP is restored by an amount equal to <span class="text-desc">6%</span> of Natasha's Max HP plus <span class="text-desc">160</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `The Right Cure`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Miracle Cure',
      content: `After being attacked, regenerates <span class="text-desc">5</span> extra Energy.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Preventive Treatment`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Doctor's Grace`,
      content: `Natasha's Basic ATK additionally deals <b class="text-hsr-physical">Physical DMG</b> equal to <span class="text-desc">40%</span> of her Max HP.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'nat_talent',
      text: `Target Ally HP <=30%`,
      ...talents.talent,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'nat_tech',
      text: `Technique Weaken`,
      ...talents.technique,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 1,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'nat_tech')]

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

      const c6 = c >= 6 ? [{ scaling: 0.4, multiplier: Stats.HP }] : []
      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }, ...c6],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Cast Healing',
          value: [{ scaling: calcScaling(0.07, 0.004375, skill, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(70, 52, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
        {
          name: 'Healing Over Time',
          value: [{ scaling: calcScaling(0.048, 0.003, skill, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(48, 28.8, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Healing',
          value: [{ scaling: calcScaling(0.092, 0.00575, ult, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(92, 55.2, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.8, multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
        },
      ]

      if (form.nat_talent)
        base[Stats.HEAL].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.25, 0.025, talent, 'curved'),
        })
      if (form.nat_tech) {
        base.WEAKEN.push({
          name: 'Technique',
          source: 'Self',
          value: 0.1,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (a.a4)
        base[Stats.HEAL].push({
          name: 'Ascension 4 Passive',
          source: 'Self',
          value: 0.1,
        })
      if (c >= 1)
        base.SKILL_SCALING.push({
          name: 'E1 Auto Healing',
          value: [{ scaling: 0.15, multiplier: Stats.HP }],
          flat: 400,
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        })
      if (c >= 1)
        base.ULT_SCALING.push({
          name: 'E2 Healing Over Time',
          value: [{ scaling: 0.06, multiplier: Stats.HP }],
          flat: 160,
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
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
      if (form.nat_tech)
        base.WEAKEN.push({
          name: 'Technique',
          source: 'Natasha',
          value: 0.1,
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
      if (c >= 6 && countDot(debuffs, DebuffTypes.SHOCKED))
        base[Stats.ALL_DMG].push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.3,
        })

      return base
    },
  }
}

export default Natasha
