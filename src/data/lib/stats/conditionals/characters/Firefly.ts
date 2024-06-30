import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { add, chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Firefly = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const index = _.findIndex(team, (item) => item.cId === '8005')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Order: Flare Propulsion`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of SAM's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    normal_alt: {
      trace: 'Enhanced Basic ATK',
      title: `Fyrefly Type-IV: Pyrogenic Decimation`,
      content: `Restores HP by an amount equal to <span class="text-desc">20%</span> of this unit's Max HP. Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of SAM's ATK to a single target enemy.`,
      value: [{ base: 100, growth: 20, style: 'linear' }],
      level: basic,
    },
    skill: {
      trace: 'Skill',
      title: `Order: Aerial Bombardment`,
      content: `Consumes SAM's HP equal to <span class="text-desc">40%</span> of SAM's Max HP and regenerates a fixed amount of Energy equal to {{1}}% of SAM's Max Energy. Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of SAM's ATK to a single target enemy. If the current HP is not sufficient, then SAM's HP is reduced to <span class="text-desc">1</span> when using this Skill. Enables this unit's next Action to be Advanced by <span class="text-desc">25%</span>.`,
      value: [
        { base: 100, growth: 10, style: 'curved' },
        { base: 50, growth: 1, style: 'curved' },
      ],
      level: skill,
    },
    skill_alt: {
      trace: 'Enhanced Skill',
      title: `Fyrefly Type-IV: Deathstar Overload`,
      content: `Restores HP by an amount equal to <span class="text-desc">25%</span> of this unit's Max HP. Applies <b class="text-hsr-fire">Fire</b> Weakness to a single target enemy, lasting for <span class="text-desc">2</span> turn(s). Deals <b class="text-hsr-fire">Fire DMG</b> equal to (<span class="text-desc">0.2</span> x Break Effect + {{0}}%) of SAM's ATK to this target. At the same time, deals <b class="text-hsr-fire">Fire DMG</b> equal to (<span class="text-desc">0.1</span> x Break Effect + {{1}}%) of SAM's ATK to adjacent targets. The Break Effect taken into the calculation is capped at <span class="text-desc">360%</span>.`,
      value: [
        { base: 100, growth: 10, style: 'curved' },
        { base: 50, growth: 5, style: 'curved' },
      ],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Fyrefly Type-IV: Complete Combustion`,
      content: `Upon entering the <b class="text-hsr-fire">Complete Combustion</b> state, Advances SAM's Action by <span class="text-desc">100%</span> and gains Enhanced Basic ATK and Enhanced Skill. While in <b class="text-hsr-fire">Complete Combustion</b>, increases SPD by {{0}}, and when using the Enhanced Basic ATK or Enhanced Skill, increases this unit's Weakness Break efficiency by <span class="text-desc">50%</span> and the Break DMG received by the enemy targets by {{1}}%, lasting until the current attack ends.
      <br />A countdown timer for the <b class="text-hsr-fire">Complete Combustion</b> state appears on the Action Order. When the countdown turn starts, SAM exits the <b class="text-hsr-fire">Complete Combustion</b> state. The countdown has a fixed SPD of <span class="text-desc">70</span>.
      <br />SAM cannot use Ultimate while in <b class="text-hsr-fire">Complete Combustion</b>.`,
      value: [
        { base: 30, growth: 3, style: 'curved' },
        { base: 10, growth: 1, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Chrysalid Pyronexus`,
      content: `The lower the HP, the less DMG received. When HP is <span class="text-desc">20%</span> or lower, the DMG Reduction reaches its maximum effect, reducing up to {{0}}%. During the <b class="text-hsr-fire">Complete Combustion</b>, the DMG Reduction remains at its maximum effect, and the Effect RES increases by {{1}}%.
      <br />If Energy is lower than <span class="text-desc">50%</span> when the battle starts, regenerates Energy to <span class="text-desc">50%</span>. Once Energy is regenerated to its maximum, dispels all debuffs on this unit.`,
      value: [
        { base: 20, growth: 2, style: 'curved' },
        { base: 10, growth: 2, style: 'curved' },
      ],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: `Δ Order: Meteoric Incineration`,
      content: `Leaps into the air and moves about freely for <span class="text-desc">5</span> seconds, which can be ended early by launching a plunging attack. When the duration ends, plunges and immediately attacks all enemies within a set area. At the start of each wave, applies a <b class="text-hsr-fire">Fire</b> Weakness to all enemies, lasting for <span class="text-desc">2</span> turn(s). Then, deals <b class="text-hsr-fire">Fire DMG</b> equal to <span class="text-desc">200%</span> of SAM's ATK to all enemies.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Module γ: Core Overload`,
      content: `For every <span class="text-desc">10</span> of SAM's ATK that exceeds <span class="text-desc">1800</span>, increases SAM's Break Effect by <span class="text-desc">0.8%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Module β: Autoreactive Armor`,
      content: `When SAM is in <b class="text-hsr-fire">Complete Combustion</b> with a Break Effect that is equal to or greater than <span class="text-desc">200%</span>/<span class="text-desc">360%</span>, attacking a Weakness-Broken enemy target will convert the Toughness Reduction of this attack into <span class="text-desc">1</span> instance of <span class="text-desc">35%</span>/<span class="text-desc">50%</span> Super Break DMG.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Module α: Antilag Outburst`,
      content: `During the <b class="text-hsr-fire">Complete Combustion</b>, attacking enemies that have no <b class="text-hsr-fire">Fire</b> Weakness can also reduce their Toughness, with the effect being equivalent to <span class="text-desc">55%</span> of the original Toughness Reduction from abilities.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `In Reddened Chrysalis, I Once Rest`,
      content: `When using the Enhanced Skill, ignores <span class="text-desc">15%</span> of the target's DEF. And the Enhanced Skill does not consume Skill Points.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `From Shattered Sky, I Free Fall`,
      content: `When using the Enhanced Basic ATK or the Enhanced Skill in <b class="text-hsr-fire">Complete Combustion</b> state to defeat an enemy target or cause them to be Weakness Broken, SAM immediately gains <span class="text-desc">1</span> extra turn. This effect can trigger again after <span class="text-desc">1</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Amidst Silenced Stars, I Deep Sleep`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Upon Lighted Fyrefly, I Soon Gaze`,
      content: `While in <b class="text-hsr-fire">Complete Combustion</b>, increases SAM's Effect RES by <span class="text-desc">50%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `From Undreamt Night, I Thence Shine`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `In Finalized Morrow, I Full Bloom`,
      content: `While in <b class="text-hsr-fire">Complete Combustion</b>, increases SAM's <b class="text-hsr-fire">Fire RES PEN</b> by <span class="text-desc">20%</span>. When using the Enhanced Basic ATK or Enhanced Skill, increases the Weakness Break efficiency by <span class="text-desc">50%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'complete_combustion',
      text: `Complete Combustion`,
      ...talents.ult,
      show: true,
      default: true,
      sync: true
    },
    {
      type: 'toggle',
      id: 'ff_implant',
      text: `Fire Weakness Implant`,
      ...talents.skill_alt,
      show: true,
      default: true,
      debuff: true,
      duration: 2,
    },
    {
      type: 'number',
      id: 'ff_talent',
      text: `Current HP (%)`,
      ...talents.talent,
      show: true,
      default: 100,
      min: 20,
      max: 100,
      unique: true,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'ff_implant')]

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

      base.BASIC_SCALING = form.complete_combustion
        ? [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(1, 0.2, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 15,
            },
            {
              name: 'Healing',
              value: [{ scaling: 0.2, multiplier: Stats.HP }],
              element: TalentProperty.HEAL,
              property: TalentProperty.HEAL,
              type: TalentType.NONE,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
            },
          ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1, 0.1, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 2, multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
        },
      ]

      base.DMG_REDUCTION.push({
        name: 'Talent',
        source: 'Self',
        value:
          (form.complete_combustion ? 1 : 1 - (form.ff_talent - 20) / 80) * calcScaling(0.2, 0.02, talent, 'curved'),
      })
      if (form.ff_implant && !_.includes(weakness, Element.FIRE)) weakness.push(Element.FIRE)
      if (form.complete_combustion) {
        base.BA_ALT = true
        base.SKILL_ALT = true
        base[Stats.SPD].push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(30, 3, ult, 'curved'),
        })
        base.BREAK_EFF.push({
          name: 'Ultimate',
          source: 'Self',
          value: 0.5,
        })
        base.BREAK_VUL.push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.1, 0.01, ult, 'curved'),
        })
        base[Stats.E_RES].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.1, 0.02, talent, 'curved'),
        })
        if (c >= 1)
          base.SKILL_DEF_PEN.push({
            name: 'Eidolon 1',
            source: 'Self',
            value: 0.15,
          })
        if (c >= 4)
          base[Stats.E_RES].push({
            name: 'Eidolon 4',
            source: 'Self',
            value: 0.5,
          })
        if (c >= 6) {
          base.FIRE_RES_PEN.push({
            name: 'Eidolon 6',
            source: 'Self',
            value: 0.2,
          })
          base.BREAK_EFF.push({
            name: 'Eidolon 6',
            source: 'Self',
            value: 0.5,
          })
        }
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
      base.CALLBACK.push((x) => {
        if (a.a6)
          x[Stats.BE].push({
            name: 'Ascension 6 Passive',
            source: 'Self',
            value: (_.max([0, x.getAtk() - 1800]) / 10) * 0.008,
          })
        const superBreak = x.getValue(Stats.BE) >= 3.6 ? 0.5 : x.getValue(Stats.BE) >= 2 ? 0.35 : 0
        if (superBreak && form.complete_combustion) {
          base.SUPER_BREAK = true
          base.SUPER_BREAK_MULT.push({
            name: 'Ascension 4 Passive',
            source: 'Self',
            value: superBreak,
          })
        }
        if (form.complete_combustion)
          x.SKILL_SCALING = [
            {
              name: 'Main',
              value: [
                {
                  scaling: calcScaling(1, 0.1, skill, 'curved') + _.min([x.getValue(Stats.BE), 3.6]) * 0.2,
                  multiplier: Stats.ATK,
                },
              ],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 30,
            },
            {
              name: 'Adjacent',
              value: [
                {
                  scaling: calcScaling(0.5, 0.05, skill, 'curved') + _.min([x.getValue(Stats.BE), 3.6]) * 0.1,
                  multiplier: Stats.ATK,
                },
              ],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 15,
            },
            {
              name: 'Healing',
              value: [{ scaling: 0.25, multiplier: Stats.HP }],
              element: TalentProperty.HEAL,
              property: TalentProperty.HEAL,
              type: TalentType.NONE,
            },
          ]

        return x
      })
      return base
    },
  }
}

export default Firefly
