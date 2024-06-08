import { findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, getPlungeScaling, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty } from '@src/domain/constant'
import { toPercentage } from '@src/core/utils/converter'
import { IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/data_format'

const Fischl = (c: number, a: number, t: ITalentLevel) => {
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
      title: `Bolts of Downfall`,
      content: `<b>Normal Attack</b>
      <br />Performs up to 5 consecutive shots with a bow.
      <br />
      <br /><b>Charged Attack</b>
      <br />Performs a more precise Aimed Shot with increased DMG.
      <br />While aiming, the dark lightning spirits of Immernachtreich shall heed the call of their Prinzessin and indwell the enchanted arrowhead. When fully indwelt, the Rachsüchtig Blitz shall deal immense <b class="text-genshin-electro">Electro DMG</b>.
      <br />
      <br /><b>Plunging Attack</b>
      <br />Fires off a shower of arrows in mid-air before falling and striking the ground, dealing AoE DMG upon impact.
      `,
    },
    skill: {
      title: `Nightrider`,
      content: `Summons Oz. The night raven forged of darkness and lightning descends upon the land, dealing <b class="text-genshin-electro">Electro DMG</b> in a small AoE.
      <br />For the ability's duration, Oz will continuously attack nearby opponents with <b class="text-genshin-electro">Freikugel</b>.
      <br />
      <br /><b>Hold</b> to adjust the location Oz will be summoned to.
      <br /><b>Press</b> again any time during the ability's duration to once again summon him to Fischl's side.`,
    },
    burst: {
      title: `Midnight Phantasmagoria`,
      content: `Summons Oz to spread his twin wings of twilight and defend Fischl.
      <br />Has the following properties during the ability's duration:
      <br />- Fischl takes on Oz's form, greatly increasing her Movement Speed.
      <br />- Strikes nearby opponents with lightning, dealing <b class="text-genshin-electro">Electro DMG</b> to opponents she comes into contact with. Each opponent can only be struck once.
      <br />- Once this ability's effects end, Oz will remain on the battlefield and attack his Prinzessin's foes. If Oz is already on the field, then this will reset the duration of his presence.
      `,
    },
    a1: {
      title: `A1: Stellar Predator`,
      content: `When Fischl hits Oz with a fully-charged Aimed Shot, Oz brings down Thundering Retribution, dealing <b class="text-genshin-electro">AoE Electro DMG</b> equal to <span class="text-desc">152.7%</span> of the arrow's DMG.`,
    },
    a4: {
      title: `A4: Undone Be Thy Sinful Hex`,
      content: `If your active character triggers an Electro-related Elemental Reaction when Oz is on the field, the opponent shall be stricken with Thundering Retribution that deals <b class="text-genshin-electro">Electro DMG</b> equal to <span class="text-desc">80%</span> of Fischl's ATK.`,
    },
    util: {
      title: `Mein Hausgarten`,
      content: `When dispatched on an expedition in Mondstadt, time consumed is reduced by <span class="text-desc">25%</span>.`,
    },
    c1: {
      title: `C1: Gaze of the Deep`,
      content: `Even when Oz is not present in combat, he can still watch over Fischl through his raven eyes. When Fischl performs a Normal Attack against an opponent, Oz fires a coordinated attack, dealing DMG equal to <span class="text-desc">22%</span> of Fischl's ATK.`,
    },
    c2: {
      title: `C2: Devourer of All Sins`,
      content: `When Nightrider is used, it deals an additional <span class="text-desc">200%</span> ATK as DMG, and its AoE is increased by <span class="text-desc">50%</span>.`,
    },
    c3: {
      title: `C3: Wings of Nightmare`,
      content: `Increases the Level of Nightrider by <span class="text-desc">3</span>.
      <br />Maximum upgrade level is <span class="text-desc">15</span>.`,
    },
    c4: {
      title: `C4: Her Pilgrimage of Bleak`,
      content: `When Midnight Phantasmagoria is used, it deals <span class="text-desc">222%</span> of ATK as <b class="text-genshin-electro">Electro DMG</b> to surrounding opponents.
      When the skill duration ends, Fischl regenerates <span class="text-desc">20%</span> of her HP.`,
    },
    c5: {
      title: `C5: Against the Fleeing Light`,
      content: `Increases the Level of Midnight Phantasmagoria by <span class="text-desc">3</span>.
      <br />Maximum upgrade level is <span class="text-desc">15</span>.`,
    },
    c6: {
      title: `C6: Evernight Raven`,
      content: `Extends the duration of Oz's presence on the field by <span class="text-desc">2</span>s. Additionally, Oz performs coordinated attacks with your active character when present, dealing <span class="text-desc">30%</span> of Fischl's ATK as <b class="text-genshin-electro">Electro DMG</b>.`,
    },
  }

  const content: IContent[] = []

  const teammateContent: IContent[] = []

  return {
    upgrade,
    talents,
    content,
    teammateContent,
    allyContent: [],
    preCompute: (x: StatsObject, form: Record<string, any>) => {
      const base = _.cloneDeep(x)
      base.MAX_ENERGY = 60

      base.BASIC_SCALING = [
        {
          name: '1-Hit',
          value: [{ scaling: calcScaling(0.4412, normal, 'physical', '1'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '2-Hit',
          value: [{ scaling: calcScaling(0.4678, normal, 'physical', '1'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '3-Hit',
          value: [{ scaling: calcScaling(0.5814, normal, 'physical', '1'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '4-Hit',
          value: [{ scaling: calcScaling(0.57721, normal, 'physical', '1'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '5-Hit',
          value: [{ scaling: calcScaling(0.7207, normal, 'physical', '1'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
      ]
      base.CHARGE_SCALING = [
        {
          name: 'Aimed Shot',
          value: [{ scaling: calcScaling(0.4386, normal, 'physical', '1'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.CA,
        },
        {
          name: 'Fully-Charged Aimed Shot',
          value: [{ scaling: calcScaling(1.24, normal, 'elemental', '1_alt'), multiplier: Stats.ATK }],
          element: Element.ELECTRO,
          property: TalentProperty.CA,
        },
      ]
      base.PLUNGE_SCALING = getPlungeScaling('catalyst', normal)

      base.SKILL_SCALING = [
        {
          name: 'Summoning DMG',
          value: [{ scaling: calcScaling(1.1544, skill, 'elemental', '1') + (c >= 2 ? 2 : 0), multiplier: Stats.ATK }],
          element: Element.ELECTRO,
          property: TalentProperty.SKILL,
        },
        {
          name: `Freikugel DMG`,
          value: [{ scaling: calcScaling(0.888, skill, 'elemental', '1'), multiplier: Stats.ATK }],
          element: Element.ELECTRO,
          property: TalentProperty.SKILL,
        },
      ]
      base.BURST_SCALING = [
        {
          name: `Falling Thunder DMG`,
          value: [{ scaling: calcScaling(2.08, burst, 'elemental', '1'), multiplier: Stats.ATK }],
          element: Element.ELECTRO,
          property: TalentProperty.BURST,
        },
      ]

      if (a >= 1)
        base.CHARGE_SCALING.push({
          name: `A1 Thundering Retribution DMG`,
          value: [{ scaling: calcScaling(1.24, normal, 'elemental', '1_alt') * 1.527, multiplier: Stats.ATK }],
          element: Element.ELECTRO,
          property: TalentProperty.ADD,
        })

      if (a >= 4)
        base.SKILL_SCALING.push({
          name: `A4 Thundering Retribution DMG`,
          value: [{ scaling: 0.8, multiplier: Stats.ATK }],
          element: Element.ELECTRO,
          property: TalentProperty.ADD,
        })

      if (c >= 1)
        base.BASIC_SCALING.push({
          name: `C1 Coordinated ATK DMG`,
          value: [{ scaling: 0.22, multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        })

      if (c >= 4)
        base.BURST_SCALING.push(
          {
            name: `C4 Cast DMG`,
            value: [{ scaling: 2.22, multiplier: Stats.ATK }],
            element: Element.ELECTRO,
            property: TalentProperty.BURST,
          },
          {
            name: `C4 Expire Healing`,
            value: [{ scaling: 0.2, multiplier: Stats.HP }],
            element: TalentProperty.HEAL,
            property: TalentProperty.HEAL,
          }
        )

      if (c >= 6)
        base.SKILL_SCALING.push({
          name: `C6 Coordinated ATK DMG`,
          value: [{ scaling: 0.3, multiplier: Stats.ATK }],
          element: Element.ELECTRO,
          property: TalentProperty.SKILL,
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

export default Fischl
