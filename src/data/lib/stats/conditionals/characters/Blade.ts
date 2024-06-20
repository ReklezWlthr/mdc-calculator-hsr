import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Blade = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: `Shard Sword`,
      content: `Deals {{0}}% of Blade's ATK as <b class="text-hsr-wind">Wind DMG</b> to a target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    normal_alt: {
      trace: 'Enhanced Basic ATK',
      title: `Forest of Swords`,
      content: `Consumes HP equal to <span class="text-desc">10%</span> of Blade's Max HP and deals <b class="text-hsr-wind">Wind DMG</b> equal to the sum of {{0}}% of his ATK and {{1}}% of his Max HP to a single enemy. In addition deals <b class="text-hsr-wind">Wind DMG</b> equal to the sum of {{2}}% of Blade's ATK and {{0}}% of his Max HP to adjacent targets.
      <br />If Blade's current HP is insufficient, his HP will be reduced to <span class="text-desc">1</span> when using Forest of Swords.
      <br />Forest of Swords cannot regenerate Skill Points.`,
      value: [
        { base: 20, growth: 4, style: 'linear' },
        { base: 50, growth: 10, style: 'linear' },
        { base: 8, growth: 1.6, style: 'linear' },
      ],
      level: basic,
    },
    skill: {
      trace: 'Skill',
      title: `Hellscape`,
      content: `Consumes HP equal to <span class="text-desc">30%</span> of Blade's Max HP to enter the <b>Hellscape</b> state.
      <br />When <b>Hellscape</b> is active, his Skill cannot be used, his DMG dealt increases by {{0}}%, and his Basic ATK Shard Sword is enhanced to Forest of Swords for <span class="text-desc">3</span> turn(s).
      <br />If Blade's current HP is insufficient, his HP will be reduced to <span class="text-desc">1</span> when he uses his Skill.
      <br />This Skill does not regenerate Energy. Using this Skill does not end the current turn.`,
      value: [{ base: 12, growth: 2.8, style: 'curved' }],
      level: skill,
    },
    ult: {
      trace: 'Ultimate',
      title: 'Death Sentence',
      content: `Sets Blade's current HP to <span class="text-desc">50%</span> of his Max HP and deals to single enemy <b class="text-hsr-wind">Wind DMG</b> equal to the sum of {{0}}% of his ATK, {{1}}% of his Max HP, and {{1}}% of the total HP he has lost in the current battle. At the same time, deals <b class="text-hsr-wind">Wind DMG</b> to adjacent targets equal to the sum of {{2}}% of his ATK, {{3}}% of his Max HP, and {{3}}% of the total HP he has lost in the current battle. The total HP Blade has lost in the current battle is capped at <span class="text-desc">90%</span> of his Max HP. This value will be reset and re-accumulated after his Ultimate is used.`,
      value: [
        { base: 24, growth: 1.6, style: 'curved' },
        { base: 60, growth: 4, style: 'curved' },
        { base: 9.6, growth: 0.64, style: 'curved' },
        { base: 24, growth: 1.6, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Shuhu's Gift`,
      content: `When Blade sustains DMG or consumes his HP, he gains <span class="text-desc">1</span> stack of <b>Charge</b>, stacking up to <span class="text-desc">5</span> times. A max of <span class="text-desc">1</span> <b>Charge</b> stack can be gained every time he is attacked.
      <br />When <b>Charge</b> stack reaches maximum, immediately launches a follow-up attack on all enemies, dealing <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Blade's ATK plus {{1}}% of his Max HP. At the same time, restores Blade's HP by <span class="text-desc">25%</span> of his Max HP. After the follow-up attack, all <b>Charges</b> are consumed.`,
      value: [
        { base: 22, growth: 2.2, style: 'curved' },
        { base: 55, growth: 5.5, style: 'curved' },
      ],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: `Karma Wind`,
      content: `Immediately attacks the enemy.
      <br />After entering combat, consumes <span class="text-desc">20%</span> of Blade's Max HP while dealing <b class="text-hsr-wind">Wind DMG</b> equal to <span class="text-desc">40%</span> of his Max HP to all enemies.
      <br />If Blade's current HP is insufficient, his HP will be reduced to <span class="text-desc">1</span> when this Technique is used.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Vita Infinita`,
      content: `When Blade's current HP is at <span class="text-desc">50%</span> of Max HP or lower, Incoming Healing increases by <span class="text-desc">20%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Neverending Deaths`,
      content: `If Blade hits a Weakness Broken enemy after using Forest of Swords, he will restore HP equal to <span class="text-desc">5%</span> of his Max HP plus <span class="text-desc">100</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Cyclone of Destruction`,
      content: `DMG dealt by Talent's follow-up attack increases by <span class="text-desc">20%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Blade Cuts the Deepest in Hell`,
      content: `Blade's Ultimate deals additionally increased DMG to a single enemy target, with the increased amount equal to <span class="text-desc">150%</span> of Blade's total HP loss in the current battle.
      <br />The total HP Blade has lost in the current battle is capped at <span class="text-desc">90%</span> of his Max HP. This value will be reset and re-accumulated after his Ultimate has been used.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Ten Thousand Sorrows From One Broken Dream`,
      content: `When Blade is in the Hellscape state, his CRIT Rate increases by <span class="text-desc">15%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Hardened Blade Bleeds Coldest Shade`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Rejected by Death, Infected With Life`,
      content: `When Blade's current HP drops to <span class="text-desc">50%</span> or lower of his Max HP, increases his Max HP by <span class="text-desc">20%</span>. Stacks up to <span class="text-desc">/2</span> time(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Death By Ten Lords' Gaze`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Reborn Into an Empty Husk`,
      content: `The maximum number of <b>Charge</b> stacks is reduced to <span class="text-desc">4</span>. The DMG of the follow-up attack triggered by Blade's Talent additionally increases by <span class="text-desc">50%</span> of his Max HP.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'hellscape',
      text: `Hellscape`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'number',
      id: 'blade_c4',
      text: `E4 HP Bonus Stacks`,
      ...talents.c4,
      show: c >= 4,
      default: 0,
      min: 0,
      max: 2,
    },
    {
      type: 'number',
      id: 'blade_hp_loss',
      text: `Total HP Loss Per Ult`,
      ...talents.ult,
      show: true,
      default: 0,
      min: 0,
      unique: true,
    },
    {
      type: 'toggle',
      id: 'blade_a2',
      text: `Current HP <= 50%`,
      ...talents.a2,
      show: a.a2,
      default: true,
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

      base.BASIC_SCALING = form.hellscape
        ? [
            {
              name: 'Main',
              value: [
                { scaling: calcScaling(0.2, 0.04, basic, 'linear'), multiplier: Stats.ATK },
                { scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.HP },
              ],
              element: Element.WIND,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 20,
            },
            {
              name: 'Adjacent',
              value: [
                { scaling: calcScaling(0.08, 0.016, basic, 'linear'), multiplier: Stats.ATK },
                { scaling: calcScaling(0.2, 0.04, basic, 'linear'), multiplier: Stats.HP },
              ],
              element: Element.WIND,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.WIND,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
            },
          ]
      base.TALENT_SCALING = [
        {
          name: 'AoE',
          value: [
            { scaling: calcScaling(0.22, 0.022, talent, 'curved'), multiplier: Stats.ATK },
            { scaling: calcScaling(0.55, 0.055, talent, 'curved') + (c >= 6 ? 0.5 : 0), multiplier: Stats.HP },
          ],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
        },
        {
          name: 'Healing',
          value: [{ scaling: 0.25, multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.4, multiplier: Stats.HP }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
        },
      ]

      if (form.hellscape) {
        base.BA_ALT = true
        base[Stats.ALL_DMG].push({
          name: 'Skill',
          source: 'Self',
          value: calcScaling(0.12, 0.028, skill, 'curved'),
        })
        if (c >= 2)
          base[Stats.CRIT_RATE].push({
            name: 'Eidolon 2',
            source: 'Self',
            value: 0.15,
          })
      }
      if (form.blade_a2)
        base.I_HEAL.push({
          name: 'Ascension 2 Passive',
          source: 'Self',
          value: 0.2,
        })
      if (a.a4 && broken && form.hellscape) {
        base.BASIC_SCALING.push({
          name: 'Healing',
          value: [{ scaling: 0.05, multiplier: Stats.HP }],
          flat: 100,
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        })
      }
      if (a.a6)
        base.TALENT_DMG.push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.2,
        })
      if (form.blade_c4)
        base[Stats.P_HP].push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.2 * form.blade_c4,
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
      base.CALLBACK.push((x) => {
        const loss = _.min([form.blade_hp_loss, x.getHP() * 0.9])
        base.ULT_SCALING = [
          {
            name: 'Main',
            value: [
              { scaling: calcScaling(0.24, 0.016, ult, 'curved'), multiplier: Stats.ATK },
              { scaling: calcScaling(0.6, 0.04, ult, 'curved'), multiplier: Stats.HP },
            ],
            flat: (calcScaling(0.6, 0.04, ult, 'curved') + (c >= 1 ? 1.5 : 0)) * loss,
            element: Element.WIND,
            property: TalentProperty.NORMAL,
            type: TalentType.ULT,
            break: 20,
          },
          {
            name: 'Adjacent',
            value: [
              { scaling: calcScaling(0.096, 0.0064, ult, 'curved'), multiplier: Stats.ATK },
              { scaling: calcScaling(0.24, 0.016, ult, 'curved'), multiplier: Stats.HP },
            ],
            flat: calcScaling(0.24, 0.016, ult, 'curved') * loss,
            element: Element.WIND,
            property: TalentProperty.NORMAL,
            type: TalentType.ULT,
            break: 20,
          },
        ]

        return x
      })
      return base
    },
  }
}

export default Blade
