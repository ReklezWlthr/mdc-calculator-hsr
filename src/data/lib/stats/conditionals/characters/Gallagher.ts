import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Gallagher = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: 'Corkage Fee',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Gallagher's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    normal_alt: {
      title: 'Nectar Blitz',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Gallagher's ATK to a single target enemy. Reduces the target's ATK by {{1}}%, lasting for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 125, growth: 25, style: 'linear' },
        { base: 10, growth: 1, style: 'linear' },
      ],
      level: basic,
    },
    skill: {
      title: 'Special Brew',
      content: `Immediately heals a target ally for {{0}} HP.`,
      value: [{ base: 200, growth: 140, style: 'pure' }],
      level: skill,
    },
    ult: {
      title: 'Champagne Etiquette',
      content: `Inflicts <b>Besotted</b> on all enemies, lasting for <span class="text-desc">2</span> turn(s). At the same time, deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Gallagher's ATK to all enemies, and enhances this unit's next Basic ATK to <b>Nectar Blitz</b>.`,
      value: [{ base: 75, growth: 7.5, style: 'curved' }],
      level: ult,
    },
    talent: {
      title: 'Tipsy Tussle',
      content: `The <b>Besotted</b> state increases the Break DMG that targets receive by {{0}}%. Every time a <b>Besotted</b> target is attacked by an ally, the attacker's HP gets restored by {{1}}.`,
      value: [
        { base: 6, growth: 0.6, style: 'heal' },
        { base: 80, growth: 136, style: 'pure' },
      ],
      level: talent,
    },
    technique: {
      title: 'Artisan Elixir',
      content: `Immediately attacks the enemy. Upon entering battle, inflicts Besotted on all enemies, lasting for <span class="text-desc">2</span> turn(s). And deals <b class="text-hsr-fire">Fire DMG</b> equal to <span class="text-desc">50%</span> of Gallagher's ATK to all enemies.`,
    },
    a2: {
      title: 'A2: Novel Concoction',
      content: `Increases this unit's Outgoing Healing by an amount equal to <span class="text-desc">50%</span> of Break Effect, up to a maximum Outgoing Healing increase of <span class="text-desc">75%</span>.`,
    },
    a4: {
      title: 'A4: Organic Yeast',
      content: `After using the Ultimate, immediately Advances Forward this unit's Action by <span class="text-desc">100%</span>.`,
    },
    a6: {
      title: 'A6: Bottoms Up',
      content: `When Gallagher uses Nectar Blitz to attack Besotted enemies, the HP Restore effect of his Talent will also apply to other allies for this time.`,
    },
    c1: {
      title: 'E1: Salty Dog',
      content: `When Gallagher enters the battle, regenerates <span class="text-desc">20</span> Energy and increases Effect RES by <span class="text-desc">50%</span>.`,
    },
    c2: {
      title: `E2: Lion's Tail`,
      content: `When using the Skill, removes <span class="text-desc">1</span> debuff(s) from a target ally. At the same time, increases their Effect RES by <span class="text-desc">30%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
    },
    c3: {
      title: 'E3: Corpse Reviver',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      title: 'E4: Last Word',
      content: `Extends the duration of the <b>Besotted</b> state inflicted by Gallagher's Ultimate by <span class="text-desc">1</span> turn(s).`,
    },
    c5: {
      title: `E5: Death in the Afternoon`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      title: 'E6: Blood and Sand',
      content: `Increases Gallagher's Break Effect by <span class="text-desc">20%</span> and Weakness Break Efficiency by <span class="text-desc">20%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'gall_ba',
      text: `Enhanced Basic Attack`,
      ...talents.ult,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'besotted',
      text: `Besotted`,
      ...talents.talent,
      show: true,
      default: true,
      debuff: true,
      duration: c >= 4 ? 3 : 2,
    },
    {
      type: 'toggle',
      id: 'gall_ba_debuff',
      text: `Enhanced BA ATK Reduction`,
      ...talents.normal_alt,
      show: true,
      default: true,
      debuff: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'gall_c2',
      text: `E2 Effect RES Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: false,
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'besotted'), findContentById(content, 'gall_ba_debuff')]

  const allyContent: IContent[] = [findContentById(content, 'gall_c2')]

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

      base.BASIC_SCALING = form.gall_ba
        ? [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(1.25, 0.25, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 90,
              energy: 20,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 30,
              energy: 20,
            },
          ]
      base.SKILL_SCALING = [
        {
          name: 'Skill Healing',
          value: [],
          flat: calcScaling(200, 140, skill, 'pure'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.75, 0.075, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 60,
          energy: 5,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Besotted Healing On-Hit',
          value: [],
          flat: calcScaling(80, 56, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.8, multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 60,
        },
      ]

      if (form.gall_ba) base.BA_ALT = true
      if (form.besotted) {
        base.BREAK_VUL.push({
          name: `Ultimate`,
          source: 'Self',
          value: calcScaling(0.06, 0.006, talent, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.gall_ba_debuff) {
        base.ATK_REDUCTION.push({
          name: `Enhanced Basic ATK`,
          source: 'Self',
          value: calcScaling(0.1, 0.01, basic, 'linear'),
        })
        addDebuff(debuffs, DebuffTypes.ATK_RED)
      }
      if (c >= 1)
        base[Stats.E_RES].push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.5,
        })
      if (form.gall_c2)
        base[Stats.E_RES].push({
          name: `Skill (Eidolon 2)`,
          source: 'Self',
          value: 0.3,
        })
      if (c >= 6)
        base.BREAK_EFF.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.2,
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
      if (form.besotted)
        base.BREAK_VUL.push({
          name: `Ultimate`,
          source: 'Gallagher',
          value: calcScaling(0.06, 0.006, talent, 'curved'),
        })
      if (form.gall_ba_debuff)
        base.ATK_REDUCTION.push({
          name: `Enhanced Basic ATK`,
          source: 'Gallagher',
          value: calcScaling(0.1, 0.01, basic, 'linear'),
        })
      if (aForm.gall_c2)
        base[Stats.E_RES].push({
          name: `Skill (Eidolon 2)`,
          source: 'Gallagher',
          value: 0.3,
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
      if (a.a2)
        base[Stats.HEAL].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: _.min([base.getValue(Stats.BE) * 0.5, 0.75]),
        })

      return base
    },
  }
}

export default Gallagher
