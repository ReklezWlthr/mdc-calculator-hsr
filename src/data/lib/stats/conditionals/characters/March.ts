import { findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const March = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: 'Frigid Cold Arrow',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of March 7th's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      title: 'The Power of Cuteness',
      content: `Provides a single ally with a Shield that can absorb DMG equal to {{0}}% of March 7th's DEF plus {{1}} for <span class="text-desc">3</span> turn(s).
      <br />If the ally's current HP percentage is <span class="text-desc">30%</span> or higher, greatly increases the chance of enemies attacking that ally.`,
      value: [
        { base: 38, growth: 2.375, style: 'heal' },
        { base: 190, growth: 114, style: 'flat' },
      ],
      level: skill,
    },
    ult: {
      title: 'Glacial Cascade',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of March 7th's ATK to all enemies. Hit enemies have a <span class="text-desc">50%</span> base chance to be <b class="text-hsr-ice">Frozen</b> for <span class="text-desc">1</span> turn(s).
      <br />While <b class="text-hsr-ice">Frozen</b>, enemies cannot take action and will receive Additional <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of March 7th's ATK at the beginning of each turn.`,
      value: [
        { base: 90, growth: 6, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      title: 'Girl Power',
      content: `After a Shielded ally is attacked by an enemy, March 7th immediately Counters, dealing Ice DMG equal to {{0}}% of her ATK. This effect can be triggered <span class="text-desc">2</span> time(s) each turn.`,
      value: [{ base: 50, growth: 5, style: 'curved' }],
      level: talent,
    },
    technique: {
      title: 'Freezing Beauty',
      content: `Immediately attacks the enemy. After entering battle, there is a <span class="text-desc">100%</span> base chance to <b class="text-hsr-ice">Freeze</b> a random enemy for <span class="text-desc">1</span> turn(s).
      <br />While <b class="text-hsr-ice">Frozen</b>, the enemy cannot take action and will take Additional <b class="text-hsr-ice">Ice DMG</b> equal to <span class="text-desc">50%</span> of March 7th's ATK at the beginning of each turn.`,
    },
    a2: {
      title: 'A2: Purify',
      content: `Skill removes <span class="text-desc">1</span> debuff from an ally.`,
    },
    a4: {
      title: 'A4: Reinforce',
      content: `The duration of the Shield generated from Skill is extended for <span class="text-desc">1</span> turn(s).`,
    },
    a6: {
      title: 'A6: Ice Spell',
      content: `Increases Ultimate's base chance to <b class="text-hsr-ice">Freeze</b> enemies by <span class="text-desc">15%</span>.`,
    },
    c1: {
      title: 'E1: Memory of You',
      content: `Every time March 7th's Ultimate <b class="text-hsr-ice">Freezes</b> a target, she regenerates <span class="text-desc">6</span> Energy.`,
    },
    c2: {
      title: `E2: Memory of It`,
      content: `Upon entering battle, grants a Shield equal to <span class="text-desc">24%</span> of March 7th's DEF plus <span class="text-desc">320</span> to the ally with the lowest HP percentage, lasting for <span class="text-desc">3</span> turn(s).`,
    },
    c3: {
      title: 'E3: Memory of Everything',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      title: 'E4: Never Forfeit Again',
      content: `The Talent's Counter effect can be triggered <span class="text-desc">1</span> more time in each turn. The DMG dealt by Counter increases by an amount that is equal to <span class="text-desc">30%</span> of March 7th's DEF.`,
    },
    c5: {
      title: `E5: Never Forget Again`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      title: 'E6: Just Like This, Always...',
      content: `Allies under the protection of the Shield granted by the Skill restores HP equal to <span class="text-desc">4%</span> of their Max HP plus <span class="text-desc">106</span> at the beginning of each turn.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'march_aggro',
      text: `Skill Shield Aggro Increase`,
      ...talents.skill,
      show: true,
      default: false,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'march_aggro')]

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
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 30,
          energy: 20,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Skill Shield',
          value: [{ scaling: calcScaling(0.38, 0.02375, skill, 'heal'), multiplier: Stats.DEF }],
          flat: calcScaling(190, 114, skill, 'flat'),
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.9, 0.06, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 60,
          energy: 5,
        },
        {
          name: 'Frozen DMG',
          value: [{ scaling: calcScaling(0.3, 0.03, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.FROZEN,
          type: TalentType.NONE,
          chance: { base: 0.5 + (a.a6 ? 0.15 : 0), fixed: false },
        },
      ]
      const c4Scaling = c >= 4 ? [{ scaling: 0.3, multiplier: Stats.DEF }] : []
      base.TALENT_SCALING = [
        {
          name: 'Follow-Up Counter',
          value: [{ scaling: calcScaling(0.5, 0.05, talent, 'curved'), multiplier: Stats.ATK }, ...c4Scaling],
          element: Element.ICE,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'Frozen DMG',
          value: [{ scaling: 0.5, multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.FROZEN,
          type: TalentType.NONE,
          chance: { base: 1, fixed: false },
        },
      ]

      if (c >= 2)
        base.SKILL_SCALING.push({
          name: 'Passive E2 Shield',
          value: [{ scaling: 0.24, multiplier: Stats.DEF }],
          flat: 320,
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
        })
      if (form.march_aggro) base.AGGRO += 5

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
      if (aForm.march_aggro) base.AGGRO += 5

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

export default March
