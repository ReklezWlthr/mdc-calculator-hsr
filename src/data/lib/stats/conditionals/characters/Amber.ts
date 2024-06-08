import { findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, getPlungeScaling, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty } from '@src/domain/constant'
import { toPercentage } from '@src/core/utils/converter'
import { IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/data_format'

const Amber = (c: number, a: number, t: ITalentLevel) => {
  const upgrade = {
    normal: false,
    skill: c >= 5,
    burst: c >= 3,
  }
  const normal = t.normal + (upgrade.normal ? 3 : 0)
  const skill = t.skill + (upgrade.skill ? 3 : 0)
  const burst = t.burst + (upgrade.burst ? 3 : 0)

  const talents: ITalent = {
    normal: {
      title: `Sharpshooter`,
      content: `<b>Normal Attack</b>
      <br />Performs up to 5 consecutive shots with a bow.
      <br />
      <br /><b>Charged Attack</b>
      <br />Performs a more precise Aimed Shot with increased DMG.
      <br />While aiming, flames will accumulate on the arrowhead. A fully charged flaming arrow will deal <b class="text-genshin-pyro">Pyro DMG</b>.
      <br />
      <br /><b>Plunging Attack</b>
      <br />Fires off a shower of arrows in mid-air before falling and striking the ground, dealing AoE DMG upon impact.
      `,
    },
    skill: {
      title: `Explosive Puppet`,
      content: `The ever-reliable Baron Bunny takes the stage.
      <br />
      <br /><b>Baron Bunny</b>
      <br />- Continuously taunts the enemy, drawing their fire.
      <br />- Baron Bunny's HP scales with Amber's Max HP.
      <br />- When destroyed or when its timer expires, Baron Bunny explodes, dealing <b class="text-genshin-pyro">AoE Pyro DMG</b>.
      <br />
      <br /><b>Hold</b>
      <br />Adjusts the throwing direction of Baron Bunny.
      <br />The longer the button is held, the further the throw.`,
    },
    burst: {
      title: `Fiery Rain`,
      content: `Fires off a shower of arrows, dealing continuous <b class="text-genshin-pyro">AoE Pyro DMG</b>.
      `,
    },
    a1: {
      title: `A1: Every Arrow Finds Its Target`,
      content: `Increases the CRIT Rate of Fiery Rain by <span class="text-desc">10%</span> and widens its AoE by <span class="text-desc">30%</span>.`,
    },
    a4: {
      title: `A4: Precise Shot`,
      content: `Aimed Shot hits on weak spots increase ATK by <span class="text-desc">15%</span> for <span class="text-desc">10</span>s.`,
    },
    util: {
      title: `Gliding Champion`,
      content: `Decreases gliding Stamina consumption for your own party members by <span class="text-desc">20%</span>.
      <br />Not stackable with Passive Talents that provide the exact same effects.`,
    },
    c1: {
      title: `C1: One Arrow to Rule Them All`,
      content: `Fires <span class="text-desc">2</span> arrows per Aimed Shot. The second arrow deals <span class="text-desc">20%</span> of the first arrow's DMG.`,
    },
    c2: {
      title: `C2: Bunny Triggered`,
      content: `Baron Bunny, new and improved! Hitting Baron Bunny's foot with a fully-charged Aimed Shot manually detonates it.
      <br />Explosion via manual detonation deals <span class="text-desc">200%</span> additional DMG.`,
    },
    c3: {
      title: `C3: It Burns!`,
      content: `Increases the Level of Fiery Rain by <span class="text-desc">3</span>.
      <br />Maximum upgrade level is <span class="text-desc">15</span>.`,
    },
    c4: {
      title: `C4: It's Not Just Any Doll...`,
      content: `Decreases Explosive Puppet's CD by <span class="text-desc">20%</span>. Adds <span class="text-desc">1</span> additional charge.`,
    },
    c5: {
      title: `C5: It's Baron Bunny!`,
      content: `Increases the Level of Explosive Puppet by <span class="text-desc">3</span>.
      <br />Maximum upgrade level is <span class="text-desc">15</span>.`,
    },
    c6: {
      title: `C6: Wildfire`,
      content: `Fiery Rain increases all party members' Movement SPD by <span class="text-desc">15%</span> and ATK by <span class="text-desc">15%</span> for <span class="text-desc">10</span>s.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'amber_a4',
      text: `A4 Weak Spot Hit Buff`,
      ...talents.burst,
      show: a >= 4,
      default: true,
    },
    {
      type: 'toggle',
      id: 'amber_c6',
      text: `C6 Burst Team Buff`,
      ...talents.c6,
      show: c >= 6,
      default: true,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'amber_c6')]

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
          name: '1-Hit [x2]',
          value: [{ scaling: calcScaling(0.3612, normal, 'physical', '1'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '2-Hit',
          value: [{ scaling: calcScaling(0.3612, normal, 'physical', '1'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '3-Hit',
          value: [{ scaling: calcScaling(0.4644, normal, 'physical', '1'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '4-Hit',
          value: [{ scaling: calcScaling(0.473, normal, 'physical', '1'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NA,
        },
        {
          name: '5-Hit',
          value: [{ scaling: calcScaling(0.5934, normal, 'physical', '1'), multiplier: Stats.ATK }],
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
          element: Element.PYRO,
          property: TalentProperty.CA,
        },
      ]
      base.PLUNGE_SCALING = getPlungeScaling('catalyst', normal)

      base.SKILL_SCALING = [
        {
          name: 'Explosion DMG',
          value: [{ scaling: calcScaling(1.232, skill, 'elemental', '1'), multiplier: Stats.ATK }],
          element: Element.PYRO,
          property: TalentProperty.SKILL,
        },
      ]
      base.BURST_SCALING = [
        {
          name: `Fiery Rain DMG Per Wave`,
          value: [{ scaling: calcScaling(0.2802, burst, 'elemental', '1'), multiplier: Stats.ATK }],
          element: Element.PYRO,
          property: TalentProperty.BURST,
          cr: a >= 1 ? 0.1 : 0,
        },
        {
          name: `Total Fiery Rain DMG`,
          value: [{ scaling: calcScaling(5.0544, burst, 'elemental', '1'), multiplier: Stats.ATK }],
          element: Element.PYRO,
          property: TalentProperty.BURST,
          cr: a >= 1 ? 0.1 : 0,
        },
      ]

      if (form.amber_a4) base[Stats.P_ATK] += 0.15

      if (c >= 1)
        base.CHARGE_SCALING.push(
          {
            name: 'C1 Additional Aimed Shot',
            value: [{ scaling: calcScaling(0.4386, normal, 'physical', '1') * 0.2, multiplier: Stats.ATK }],
            element: Element.PHYSICAL,
            property: TalentProperty.CA,
          },
          {
            name: 'C1 Additional Fully-Charged Aimed Shot',
            value: [{ scaling: calcScaling(1.24, normal, 'elemental', '1_alt') * 0.2, multiplier: Stats.ATK }],
            element: Element.PYRO,
            property: TalentProperty.CA,
          }
        )

      if (c >= 2)
        base.SKILL_SCALING.push({
          name: 'C2 Manual Explosion DMG',
          value: [{ scaling: calcScaling(1.232, skill, 'elemental', '1') * 2, multiplier: Stats.ATK }],
          element: Element.PYRO,
          property: TalentProperty.SKILL,
        })

      if (c >= 4) base.SKILL_CD_RED += 0.2
      if (form.amber_c6) base[Stats.P_ATK] += 0.15

      return base
    },
    preComputeShared: (own: StatsObject, base: StatsObject, form: Record<string, any>) => {
      if (form.amber_c6) base[Stats.P_ATK] += 0.15

      return base
    },
    postCompute: (base: StatsObject, form: Record<string, any>) => {
      return base
    },
  }
}

export default Amber
