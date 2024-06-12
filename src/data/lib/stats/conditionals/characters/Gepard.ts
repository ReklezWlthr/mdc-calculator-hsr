import { addDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Gepard = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: 'Fist of Conviction',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Gepard's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      title: 'Daunting Smite',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Gepard's ATK to a single enemy, with a 65% base chance to <b class="text-hsr-ice">Freeze</b> the enemy for <span class="text-desc">1</span> turn(s).
      <br />While <b class="text-hsr-ice">Frozen</b>, the enemy cannot take action and will take Additional <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of Gepard's ATK at the beginning of each turn.`,
      value: [
        { base: 100, growth: 10, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
      ],
      level: skill,
    },
    ult: {
      title: `Enduring Bulwark`,
      content: `Applies a <b class="text-indigo-300">Shield</b> to all allies, absorbing DMG equal to {{0}}% of Gepard's DEF plus {{1}} for <span class="text-desc">3</span> turn(s).`,
      value: [
        { base: 30, growth: 1.875, style: 'heal' },
        { base: 150, growth: 90, style: 'flat' },
      ],
      level: ult,
    },
    talent: {
      title: `Unyielding Will`,
      content: `When struck with a killing blow, instead of becoming knocked down, Gepard's HP immediately restores to {{0}}% of his Max HP. This effect can only trigger once per battle.`,
      value: [{ base: 25, growth: 2.5, style: 'curved' }],
      level: talent,
    },
    technique: {
      title: 'Comradery',
      content: `After Gepard uses his Technique, when the next battle begins, a <b class="text-indigo-300">Shield</b> will be applied to all allies, absorbing DMG equal to <span class="text-desc">24%</span> of Gepard's DEF plus <span class="text-desc">150</span> for <span class="text-desc">2</span> turn(s).`,
    },
    a2: {
      title: `A2: Integrity`,
      content: `Gepard has a higher chance to be attacked by enemies.`,
    },
    a4: {
      title: `A4: Commander`,
      content: `When "Unyielding Will" is triggered, Gepard's Energy will be restored to <span class="text-desc">100%</span>.`,
    },
    a6: {
      title: `A6: Fighting Spirit`,
      content: `Gepard's ATK increases by 35% of his current DEF. This effect will refresh at the start of each turn.`,
    },
    c1: {
      title: `E1: Due Diligence`,
      content: `When using Skill, increases the base chance to <b class="text-hsr-ice">Freeze</b> enemies by <span class="text-desc">35%</span>.`,
    },
    c2: {
      title: `E2: Lingering Cold`,
      content: `After an enemy <b class="text-hsr-ice">Frozen</b> by Skill is unfrozen, their SPD is reduced by <span class="text-desc">20%</span> for <span class="text-desc">1</span> turn(s).`,
    },
    c3: {
      title: `E3: Never Surrender`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      title: 'E4: Faith Moves Mountains',
      content: `When Gepard is in battle, all allies' Effect RES increases by <span class="text-desc">20%</span>.`,
    },
    c5: {
      title: `E5: Cold Iron Fist`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      title: 'E6: Unyielding Resolve',
      content: `When his Talent is triggered, Gepard immediately takes action again and restores extra HP equal to <span class="text-desc">50%</span> of his Max HP.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'gepard_c2',
      text: `E2 Frozen SPD Reduction`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      debuff: true,
      duration: 1,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'gepard_c2')]

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
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main',
          value: [{ scaling: calcScaling(1, 0.1, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 60,
        },
        {
          name: 'Frozen DMG',
          value: [{ scaling: calcScaling(0.3, 0.03, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.FROZEN,
          type: TalentType.NONE,
          chance: { base: c >= 1 ? 1 : 0.65, fixed: false },
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE Shield',
          value: [{ scaling: calcScaling(0.3, 0.01875, ult, 'heal'), multiplier: Stats.DEF }],
          flat: calcScaling(150, 90, ult, 'flat'),
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Revive Healing',
          value: [{ scaling: calcScaling(0.25, 0.025, talent, 'curved') + (c >= 6 ? 0.5 : 0), multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE Shield',
          value: [{ scaling: 0.24, multiplier: Stats.DEF }],
          flat: 150,
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
        },
      ]

      if (a.a2)
        base.AGGRO.push({
          name: 'Ascension 2 Passive',
          source: 'Self',
          value: 3,
        })
      if (form.gepard_c2) {
        base.SPD_REDUCTION.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.2,
        })
        addDebuff(debuffs, DebuffTypes.SPD_RED)
      }
      if (c >= 4)
        base[Stats.E_RES].push({
          name: 'Eidolon 4',
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
      if (form.gepard_c2) {
        base.SPD_REDUCTION.push({
          name: 'Eidolon 2',
          source: 'Gepard',
          value: 0.2,
        })
      }
      if (c >= 4)
        base[Stats.E_RES].push({
          name: 'Eidolon 4',
          source: 'Gepard',
          value: 0.2,
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
      if (a.a6)
        base[Stats.ATK].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: base.getHP() * 0.35,
        })

      return base
    },
  }
}

export default Gepard
