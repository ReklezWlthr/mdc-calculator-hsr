import { findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, getPlungeScaling, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, Stats, TalentProperty, WeaponType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/data_format'

const Hutao = (c: number, a: number, t: ITalentLevel) => {
  const upgrade = {
    normal: false,
    skill: c >= 3,
    burst: c >= 5,
  }
  const normal = t.normal + (upgrade.normal ? 3 : 0)
  const skill = t.skill + (upgrade.skill ? 3 : 0)
  const burst = t.burst + (upgrade.burst ? 3 : 0)

  const talents: ITalent = {
    normal: {
      title: `Secret Spear of Wangsheng`,
      content: `<b>Normal Attack</b>
      <br />Performs up to 6 consecutive spear strikes.
      <br />
      <br /><b>Charged Attack</b>
      <br />Consumes a certain amount of Stamina to lunge forward, dealing damage to opponents along the way.
      <br />
      <br /><b>Plunging Attack</b>
      <br />Plunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.
      `,
    },
    skill: {
      title: `Guide to Afterlife`,
      content: `Only an unwavering flame can cleanse the impurities of this world.
      <br />Hu Tao consumes a set portion of her HP to knock the surrounding enemies back and enter the Paramita Papilio state.
      <br />
      <br /><b>Paramita Papilio</b>
      <br />- Increases Hu Tao's ATK based on her Max HP at the time of entering this state. ATK Bonus gained this way cannot exceed <span class="text-desc">400%</span> of Hu Tao's Base ATK.
      <br />- Converts attack DMG to <b class="text-genshin-pyro">Pyro DMG</b>, which cannot be overridden by any other elemental infusion.
      <br />- Charged Attacks apply the Blood Blossom effect to the enemies hit.
      <br />- Increases Hu Tao's resistance to interruption.
      <br />
      <br /><b>Blood Blossom</b>
      <br />Enemies affected by Blood Blossom will take <b class="text-genshin-pyro">Pyro DMG</b> every <span class="text-desc">4</span>s. This DMG is considered Elemental Skill DMG.
      <br />Each enemy can be affected by only one Blood Blossom effect at a time, and its duration may only be refreshed by Hu Tao herself.
      <br />
      <br />Paramita Papilio ends when its duration is over, or Hu Tao has left the battlefield or fallen.
      `,
    },
    burst: {
      title: `Spirit Soother`,
      content: `Commands a blazing spirit to attack, dealing <b class="text-genshin-pyro">Pyro DMG</b> in a large AoE.
      <br />Upon striking the enemy, regenerates a percentage of Hu Tao's Max HP. This effect can be triggered up to <span class="text-desc">5</span> times, based on the number of enemies hit.
      <br />If Hu Tao's HP is below or equal to <span class="text-desc">50%</span> when the enemy is hit, both the DMG and HP Regeneration are increased.`,
    },
    a1: {
      title: `A1: Flutter By`,
      content: `When a Paramita Papilio state activated by Guide to Afterlife ends, all allies in the party (excluding Hu Tao herself) will have their CRIT Rate increased by <span class="text-desc">12%</span> for <span class="text-desc">8</span>s.`,
    },
    a4: {
      title: `A4: Sanguine Rouge`,
      content: `When Hu Tao's HP is equal to or less than <span class="text-desc">50%</span>, her <b class="text-genshin-pyro">Pyro DMG Bonus</b> is increased by <span class="text-desc">33%</span>.`,
    },
    util: {
      title: `The More the Merrier`,
      content: `When Hu Tao cooks a dish perfectly, she has a <span class="text-desc">18%</span> chance to receive an additional "Suspicious" dish of the same type.`,
    },
    c1: {
      title: `C1: Crimson Bouquet`,
      content: `While in a Paramita Papilio state activated by Guide to Afterlife, Hu Tao's Charged Attacks do not consume Stamina.`,
    },
    c2: {
      title: `C2: Ominous Rainfall`,
      content: `Increases the Blood Blossom DMG by an amount equal to <span class="text-desc">10%</span> of Hu Tao's Max HP at the time the effect is applied.
      <br />Additionally, Spirit Soother will also apply the Blood Blossom effect.`,
    },
    c3: {
      title: `C3: Lingering Carmine`,
      content: `Increases the Level of Guide to Afterlife by <span class="text-desc">3</span>.
      <br />Maximum upgrade level is <span class="text-desc">15</span>.`,
    },
    c4: {
      title: `C4: Garden of Eternal Rest`,
      content: `Upon defeating an enemy affected by a Blood Blossom that Hu Tao applied herself, all nearby allies in the party (excluding Hu Tao herself) will have their CRIT Rate increased by <span class="text-desc">12%</span> for <span class="text-desc">15</span>s.`,
    },
    c5: {
      title: `C5: Butterfly's Embrace`,
      content: `Increases the Level of Spirit Soother by <span class="text-desc">3</span>.
      <br />Maximum upgrade level is <span class="text-desc">15</span>.`,
    },
    c6: {
      title: `C6: The Overflow`,
      content: `Triggers when Hu Tao's HP drops below <span class="text-desc">25%</span>, or when she suffers a lethal strike:
      <br />Hu Tao will not fall as a result of the DMG sustained. Additionally, for the next <span class="text-desc">10</span>s, all of her <b>Elemental and Physical RES</b> is increased by <span class="text-desc">200%</span>, her CRIT Rate is increased by <span class="text-desc">100%</span>, and her resistance to interruption is greatly increased.
      <br />This effect triggers automatically when Hu Tao has <span class="text-desc">1</span> HP left.
      <br />Can only occur once every <span class="text-desc">60</span>s.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'hu_skill',
      text: `Paramita Papilio`,
      ...talents.skill,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'hu_low',
      text: `Current HP < 50%`,
      ...talents.a4,
      show: a >= 4,
      default: true,
    },
    {
      type: 'toggle',
      id: 'hu_c6',
      text: `C6 Immortality`,
      ...talents.c6,
      show: c >= 6,
      default: false,
    },
  ]

  const teammateContent: IContent[] = [
    {
      type: 'toggle',
      id: 'hu_a1',
      text: `Skill Expired`,
      ...talents.a1,
      show: a >= 1,
      default: false,
    },
    {
      type: 'toggle',
      id: 'hu_a4',
      text: `On Blood Blossom Target Kill`,
      ...talents.c4,
      show: c >= 4,
      default: false,
    },
  ]

  return {
    upgrade,
    talents,
    content,
    teammateContent,
    allyContent: [],
    preCompute: (x: StatsObject, form: Record<string, any>) => {
      const base = _.cloneDeep(x)

      base.BASIC_SCALING = [
        {
          name: '1-Hit',
          value: [{ scaling: calcScaling(0.4689, normal, 'physical', '2'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '2-Hit',
          value: [{ scaling: calcScaling(0.4825, normal, 'physical', '2'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '3-Hit',
          value: [{ scaling: calcScaling(0.6105, normal, 'physical', '2'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '4-Hit',
          value: [{ scaling: calcScaling(0.6564, normal, 'physical', '2'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '5-Hit [1]',
          value: [{ scaling: calcScaling(0.3327, normal, 'physical', '2'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '5-Hit [2]',
          value: [{ scaling: calcScaling(0.352, normal, 'physical', '2'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '6-Hit',
          value: [{ scaling: calcScaling(0.8596, normal, 'physical', '2'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
      ]
      base.CHARGE_SCALING = [
        {
          name: 'Charged Attack DMG',
          value: [{ scaling: calcScaling(1.3596, normal, 'physical', '2'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.CA,
        },
      ]
      base.PLUNGE_SCALING = [
        {
          name: 'Plunge DMG',
          scale: Stats.ATK,
          value: [{ scaling: calcScaling(0.6542, normal, 'physical', '2'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.PA,
        },
        {
          name: 'Low Plunge DMG',
          scale: Stats.ATK,
          value: [{ scaling: calcScaling(1.3081, normal, 'physical', '2'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.PA,
        },
        {
          name: 'High Plunge DMG',
          scale: Stats.ATK,
          value: [{ scaling: calcScaling(1.6339, normal, 'physical', '2'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.PA,
        },
      ]

      const c2Blood = c >= 2 ? [{ scaling: 0.1, multiplier: Stats.HP }] : []

      base.SKILL_SCALING = [
        {
          name: 'Blood Blossom DMG',
          value: [{ scaling: calcScaling(0.64, skill, 'elemental', '1'), multiplier: Stats.ATK }, ...c2Blood],
          element: Element.PYRO,
          property: TalentProperty.SKILL,
        },
      ]
      base.BURST_SCALING = [
        {
          name: 'Skill DMG',
          value: [{ scaling: calcScaling(3.0327, burst, 'elemental', '2'), multiplier: Stats.ATK }],
          element: Element.PYRO,
          property: TalentProperty.BURST,
        },
        {
          name: 'Low HP Skill DMG',
          value: [{ scaling: calcScaling(3.7909, burst, 'elemental', '2'), multiplier: Stats.ATK }],
          element: Element.PYRO,
          property: TalentProperty.BURST,
        },
        {
          name: 'Skill HP Regeneration',
          value: [{ scaling: calcScaling(0.0626, burst, 'elemental', '2'), multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
        },
        {
          name: 'Low HP Skill HP Regeneration',
          value: [{ scaling: calcScaling(0.0835, burst, 'elemental', '2'), multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
        },
      ]

      if (form.hu_skill) base.infuse(Element.PYRO, true)
      if (form.hu_low) base[Stats.PYRO_DMG] += 0.33

      if (form.hu_c6) {
        base.ALL_TYPE_RES += 2
        base[Stats.CRIT_RATE] += 1
      }

      return base
    },
    preComputeShared: (own: StatsObject, base: StatsObject, form: Record<string, any>) => {
      if (form.hu_a1) base[Stats.CRIT_RATE] += 0.12
      if (form.hu_a4) base[Stats.CRIT_RATE] += 0.12

      return base
    },
    postCompute: (base: StatsObject, form: Record<string, any>) => {
      if (form.hu_skill)
        base[Stats.ATK] += _.min([calcScaling(0.0384, skill, 'elemental', '1') * base.getHP(), base.BASE_ATK * 4])

      return base
    },
  }
}

export default Hutao
