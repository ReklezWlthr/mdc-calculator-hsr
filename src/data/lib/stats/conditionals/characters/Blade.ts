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
      energy: 20,
      trace: 'Basic ATK',
      title: `Shard Sword`,
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Blade's Max HP to one designated enemy.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    normal_alt: {
      energy: 30,
      trace: 'Enhanced Basic ATK',
      title: `Forest of Swords`,
      content: `Consumes HP equal to <span class="text-desc">10%</span> of Blade's Max HP and deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of his Max HP to one designated enemy. In addition, deals <b class="text-hsr-wind">Wind DMG</b> equal to {{1}}% of Blade's Max HP to adjacent targets.
      <br />If Blade's current HP is insufficient, his HP will be reduced to <span class="text-desc">1</span> when using <b>Forest of Swords</b>.
      <br /><b>Forest of Swords</b> cannot regenerate Skill Points.`,
      value: [
        { base: 65, growth: 13, style: 'linear' },
        { base: 26, growth: 5.2, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
    },
    skill: {
      trace: 'Skill',
      title: `Hellscape`,
      content: `Consumes HP equal to <span class="text-desc">30%</span> of Blade's Max HP to enter the <b>Hellscape</b> state.
      <br />While under the <b>Hellscape</b> state, his Skill cannot be used, his DMG dealt increases by {{0}}%, the chance of receiving attacks from enemy targets greatly increases, and his Basic ATK <b>Shard Sword</b> is enhanced to <b>Forest of Swords</b> for <span class="text-desc">3</span> turn(s).
      <br />If Blade's current HP is insufficient, his HP will be reduced to <span class="text-desc">1</span> when he uses his Skill.
      <br />This Skill does not regenerate Energy. Using this Skill does not end the current turn.`,
      value: [{ base: 12, growth: 2.8, style: 'curved' }],
      level: skill,
      tag: AbilityTag.ENHANCE,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Death Sentence',
      content: `Sets Blade's current HP to <span class="text-desc">50%</span> of his Max HP and deals <b class="text-hsr-wind">Wind DMG</b> to one designated enemy equal to the sum of {{0}}% of his Max HP, and {{1}}% of the tally of Blade's HP loss in the current battle. At the same time, deals <b class="text-hsr-wind">Wind DMG</b> to adjacent targets equal to the sum of {{2}}% of his Max HP, and {{1}}% of the tally of his HP loss in the current battle. The tally of Blade's HP loss in the current battle is capped at <span class="text-desc">90%</span> of his Max HP. This value will be reset and re-accumulated after his Ultimate has been used.`,
      value: [
        { base: 90, growth: 6, style: 'curved' },
        { base: 72, growth: 4.8, style: 'curved' },
        { base: 36, growth: 2.4, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.BLAST,
    },
    talent: {
      energy: 10,
      trace: 'Talent',
      title: `Shuhu's Gift`,
      content: `When Blade sustains DMG or consumes his HP, he gains <span class="text-desc">1</span> stack of <b>Charge</b>, stacking up to <span class="text-desc">5</span> times. A max of <span class="text-desc">1</span> <b>Charge</b> stack can be gained every time he is attacked.
      <br />When <b>Charge</b> stack reaches maximum, immediately launches <span class="text-desc">1</span> <u>Follow-up ATK</u> on all enemies, dealing <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Blade's Max HP. At the same time, restores Blade's HP by <span class="text-desc">25%</span> of his Max HP. After the <u>Follow-up ATK</u>, all <b>Charges</b> are consumed.`,
      value: [{ base: 65, growth: 6.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.AOE,
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
      content: `When Blade uses Ultimate, the total accumulated HP loss will be set to <span class="text-desc">50%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Neverending Deaths`,
      content: `HP restored from healing increases by <span class="text-desc">20%</span>. After receiving healing <span class="text-desc">25%</span> of the healed amount will be converted to Ultimate's tally of HP lost.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Cyclone of Destruction`,
      content: `DMG dealt by Talent's <u>Follow-up ATK</u> increases by <span class="text-desc">20%</span>. Additionally regenerates <span class="text-desc">15</span> Energy.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Blade Cuts the Deepest in Hell`,
      content: `Blade's Enhanced Basic ATK and Ultimate deals additionally increased DMG to one designated enemy, with the increased amount equal to <span class="text-desc">150%</span> of the tally of Blade's HP loss from his Ultimate.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Ten Thousand Sorrows From One Broken Dream`,
      content: `When Blade is in the <b>Hellscape</b> state, his CRIT Rate increases by <span class="text-desc">15%</span>.`,
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
      content: `When Blade's current HP percentage drops from above <span class="text-desc">50%</span> to <span class="text-desc">50%</span> of his Max HP or lower, increases his Max HP by <span class="text-desc">20%</span>. Stacks up to <span class="text-desc">/2</span> time(s).`,
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
      content: `The maximum number of <b>Charge</b> stacks is reduced to <span class="text-desc">4</span>. The <u>Follow-up ATK</u> triggered by Talent deals additionally increased DMG equal to <span class="text-desc">50%</span> of his Max HP.`,
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
      sync: true,
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
              name: 'Main Target',
              value: [{ scaling: calcScaling(0.65, 0.13, basic, 'linear'), multiplier: Stats.HP }],
              element: Element.WIND,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 20,
              sum: true,
              hitSplit: [0.5, 0.5],
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.26, 0.052, basic, 'linear'), multiplier: Stats.HP }],
              element: Element.WIND,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.25, 0.05, basic, 'linear'), multiplier: Stats.HP }],
              element: Element.WIND,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
              hitSplit: [0.5, 0.5],
            },
          ]
      base.TALENT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.65, 0.065, talent, 'curved') + (c >= 6 ? 0.5 : 0), multiplier: Stats.HP }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
          hitSplit: [0.33, 0.33, 0.34],
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
          sum: true,
        },
      ]

      if (form.hellscape) {
        base.BA_ALT = true
        base[Stats.ALL_DMG].push({
          name: 'Skill',
          source: 'Self',
          value: calcScaling(0.12, 0.028, skill, 'curved'),
        })
        base.AGGRO.push({
          name: 'Skill',
          source: 'Self',
          value: 10,
        })
        if (c >= 2)
          base[Stats.CRIT_RATE].push({
            name: 'Eidolon 2',
            source: 'Self',
            value: 0.15,
          })
      }
      if (a.a4)
        base.I_HEAL.push({
          name: 'Ascension 4 Passive',
          source: 'Self',
          value: 0.2,
        })
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
        x.ULT_SCALING = [
          {
            name: 'Main Target',
            value: [{ scaling: calcScaling(0.9, 0.06, ult, 'curved'), multiplier: Stats.HP }],
            flat: (calcScaling(0.72, 0.048, ult, 'curved') + (c >= 1 ? 1.5 : 0)) * loss,
            element: Element.WIND,
            property: TalentProperty.NORMAL,
            type: TalentType.ULT,
            break: 20,
            sum: true,
          },
          {
            name: 'Adjacent',
            value: [{ scaling: calcScaling(0.36, 0.024, ult, 'curved'), multiplier: Stats.HP }],
            flat: calcScaling(0.36, 0.024, ult, 'curved') * loss,
            element: Element.WIND,
            property: TalentProperty.NORMAL,
            type: TalentType.ULT,
            break: 20,
          },
        ]
        if (c >= 1 && form.hellscape) {
          _.head(x.BASIC_SCALING).flat = 1.5 * loss
        }

        return x
      })
      return base
    },
  }
}

export default Blade
