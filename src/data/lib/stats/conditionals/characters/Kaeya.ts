import { findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, getPlungeScaling, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty } from '@src/domain/constant'
import { toPercentage } from '@src/core/utils/converter'
import { IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/data_format'

const Kaeya = (c: number, a: number, t: ITalentLevel) => {
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
      title: `Ceremonial Bladework`,
      content: `<b>Normal Attack</b>
      <br />Performs up to 5 rapid strikes.
      <br />
      <br /><b>Charged Attack</b>
      <br />Consumes a certain amount of Stamina to unleash 2 rapid sword strikes.
      <br />
      <br /><b>Plunging Attack</b>
      <br />Plunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.
      `,
    },
    skill: {
      title: `Frostgnaw`,
      content: `Unleashes a frigid blast, dealing <b class="text-genshin-cryo">Cryo DMG</b> to opponents in front of Kaeya.
      `,
    },
    burst: {
      title: `Glacial Waltz`,
      content: `Coalescing the frost in the air, Kaeya summons <span class="text-desc">3</span> icicles that revolve around him.
      <br />These icicles will follow the character around and deal <b class="text-genshin-cryo">Cryo DMG</b> to opponents in their path for the ability's duration.`,
    },
    a1: {
      title: `A1: Cold-Blooded Strike`,
      content: `Every hit with Frostgnaw regenerates HP for Kaeya equal to <span class="text-desc">15%</span> of his ATK.`,
    },
    a4: {
      title: `A4: Glacial Heart`,
      content: `Opponents <b class="text-genshin-cryo">Frozen</b> by Frostgnaw will drop additional Elemental Particles.
      <br />Frostgnaw may only produce a maximum of <span class="text-desc">2</span> additional Elemental Particles per use.`,
    },
    util: {
      title: `Hidden Strength`,
      content: `Decreases sprinting Stamina consumption for your own party members by <span class="text-desc">20%</span>.
      <br />Not stackable with Passive Talents that provide the exact same effects.`,
    },
    c1: {
      title: `C1: Excellent Blood`,
      content: `The CRIT Rate of Kaeya's Normal and Charge Attacks against opponents affected by <b class="text-genshin-cryo">Cryo</b> is increased by <span class="text-desc">15%</span>.`,
    },
    c2: {
      title: `C2: Never-Ending Performance`,
      content: `When Glacial Waltz is in effect, for each opponent defeated, its base duration is increased by <span class="text-desc">2.5</span>s, up to a maximum of <span class="text-desc">15</span>s.`,
    },
    c3: {
      title: `C3: Dance of Frost`,
      content: `Increases the Level of Frostgnaw by <span class="text-desc">3</span>.
      <br />Maximum upgrade level is <span class="text-desc">15</span>.`,
    },
    c4: {
      title: `C4: Frozen Kiss`,
      content: `Triggers automatically when Kaeya's HP falls below <span class="text-desc">20%</span>:
      <br />Creates a shield that absorbs damage equal to <span class="text-desc">30%</span> of Kaeya's Max HP. Lasts for <span class="text-desc">20</span>s.
      <br />This shield absorbs <b class="text-genshin-cryo">Cryo DMG</b> with 250% efficiency.
      <br />Can only occur once every <span class="text-desc">60</span>s.`,
    },
    c5: {
      title: `C5: Frostbiting Embrace`,
      content: `Increases the Level of Glacial Waltz by <span class="text-desc">3</span>.
      <br />Maximum upgrade level is <span class="text-desc">15</span>.`,
    },
    c6: {
      title: `C6: Glacial Whirlwind`,
      content: `Glacial Waltz will generate <span class="text-desc">1</span> additional icicle, and will regenerate <span class="text-desc">15</span> Energy when cast.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'kaeya_c1',
      text: `C1 CRIT Rate`,
      ...talents.c1,
      show: c >= 1,
      default: true,
    },
  ]

  const teammateContent: IContent[] = []

  return {
    upgrade,
    talents,
    content,
    teammateContent,
    allyContent: [],
    preCompute: (x: StatsObject, form: Record<string, any>) => {
      const base = _.cloneDeep(x)
      base.MAX_ENERGY = 80

      base.BASIC_SCALING = [
        {
          name: '1-Hit',
          value: [{ scaling: calcScaling(0.5375, normal, 'physical', '1_alt'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '2-Hit',
          value: [{ scaling: calcScaling(0.5169, normal, 'physical', '1_alt'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '3-Hit',
          value: [{ scaling: calcScaling(0.6527, normal, 'physical', '1_alt'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '4-Hit',
          value: [{ scaling: calcScaling(0.7086, normal, 'physical', '1_alt'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '5-Hit',
          value: [{ scaling: calcScaling(0.8824, normal, 'physical', '1_alt'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
      ]
      base.CHARGE_SCALING = [
        {
          name: 'Charged Attack DMG [1]',
          value: [{ scaling: calcScaling(0.5504, normal, 'physical', '1_alt'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.CA,
        },
        {
          name: 'Charged Attack DMG [2]',
          value: [{ scaling: calcScaling(0.731, normal, 'physical', '1_alt'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.CA,
        },
      ]
      base.PLUNGE_SCALING = getPlungeScaling('base', normal)

      base.SKILL_SCALING = [
        {
          name: 'Skill DMG',
          value: [{ scaling: calcScaling(1.912, skill, 'elemental', '1'), multiplier: Stats.ATK }],
          element: Element.CRYO,
          property: TalentProperty.SKILL,
        },
      ]
      base.BURST_SCALING = [
        {
          name: 'Skill DMG',
          value: [{ scaling: calcScaling(0.776, burst, 'elemental', '1'), multiplier: Stats.ATK }],
          element: Element.CRYO,
          property: TalentProperty.BURST,
        },
      ]

      if (a >= 1)
        base.SKILL_SCALING.push({
          name: `Healing On-Hit`,
          value: [{ scaling: 0.15, multiplier: Stats.ATK }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
        })

      if (form.kae_c1) {
        base.BASIC_CR += 0.15
        base.CHARGE_CR += 0.15
      }
      if (c >= 4)
        base.SKILL_SCALING.push({
          name: `C4 Shield`,
          value: [{ scaling: 0.3, multiplier: Stats.HP }],
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
        })

      return base
    },
    preComputeShared: (own: StatsObject, base: StatsObject, form: Record<string, any>) => {
      return base
    },
    postCompute: (base: StatsObject, form: Record<string, any>) => {
      return base
    },
  }
}

export default Kaeya
