import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { add, chain } from 'lodash'
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

const PMC = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const names = _.map(team, (item) => findCharacter(item?.cId)?.name)

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Ice-Breaking Light`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of the Trailblazer's ATK to a single enemy and gains <span class="text-desc">1</span> stack of <b class="text-hsr-fire">Magma Will</b>.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    normal_alt: {
      energy: 30,
      trace: 'Enhanced Basic ATK',
      title: `Ice-Breaking Light`,
      content: `Consumes <span class="text-desc">4</span> stacks of <b class="text-hsr-fire">Magma Will</b> to enhance Basic ATK, dealing <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of the Trailblazer's ATK to a single enemy and <b class="text-hsr-fire">Fire DMG</b> to equal to {{1}}% of the Trailblazer's ATK to enemies adjacent to it.`,
      value: [
        { base: 90, growth: 9, style: 'linear' },
        { base: 36, growth: 3.6, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Ever-Burning Amber`,
      content: `Increases the Trailblazer's DMG Mitigation by {{0}}% and gains <span class="text-desc">1</span> stack of <b class="text-hsr-fire">Magma Will</b>, with a <span class="text-desc">100%</span> <u>base chance</u> to Taunt all enemies for <span class="text-desc">1</span> turn(s).`,
      value: [{ base: 40, growth: 1, style: 'curved' }],
      level: skill,
      tag: AbilityTag.DEFENSE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `War-Flaming Lance`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of the Trailblazer's ATK plus {{1}}% of the Trailblazer's DEF to all enemies. The next Basic ATK will be automatically enhanced and does not cost <b class="text-hsr-fire">Magma Will</b>.`,
      value: [
        { base: 50, growth: 5, style: 'curved' },
        { base: 75, growth: 7.5, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `Treasure of the Architects`,
      content: `Each time the Trailblazer is hit, they gain <span class="text-desc">1</span> stack of <b class="text-hsr-fire">Magma Will</b> for a max of <span class="text-desc">8</span> stack(s).
      <br />When <b class="text-hsr-fire">Magma Will</b> has no fewer than <span class="text-desc">4</span> stacks, the Trailblazer's Basic ATK becomes enhanced, dealing DMG to a single enemy and enemies adjacent to it.
      <br />When the Trailblazer uses Basic ATK, Skill, or Ultimate, provides all Party characters with a <b class="text-indigo-300">Shield</b> that can offset DMG equal to {{0}}% of the Trailblazer's DEF plus {{1}}, lasting for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 4, growth: 0.25, style: 'heal' },
        { base: 20, growth: 12, style: 'flat' },
      ],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: `Call of the Guardian`,
      content: `After using Technique, at the start of the next battle, gains a <b class="text-indigo-300">Shield</b> that absorbs DMG equal to <span class="text-desc">30%</span> of the Trailblazer's DEF plus <span class="text-desc">384</span> for <span class="text-desc">1</span> turn(s).`,
      tag: AbilityTag.DEFENSE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `The Strong Defend the Weak`,
      content: `After using Skill, all Party characters receive <span class="text-desc">15%</span> reduced DMG for <span class="text-desc">1</span> turn(s).`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Unwavering Gallantry`,
      content: `Using Enhanced Basic ATK restores the Trailblazer's HP by <span class="text-desc">5%</span> of their Max HP.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Action Beats Overthinking`,
      content: `When the Trailblazer is protected by a <b class="text-indigo-300">Shield</b> at the beginning of the turn, increases their ATK by <span class="text-desc">15%</span> and regenerates <span class="text-desc">5</span> Energy until the action is over.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Earth-Shaking Resonance`,
      content: `When the Trailblazer uses their Basic ATK, additionally deals <b class="text-hsr-fire">Fire DMG</b> equal to <span class="text-desc">25%</span> of the Trailblazer's DEF. When the Trailblazer uses their enhanced Basic ATK, additionally deals <b class="text-hsr-fire">Fire DMG</b> equal to <span class="text-desc">50%</span> of the Trailblazer's DEF.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Time-Defying Tenacity`,
      content: `The <b class="text-indigo-300">Shield</b> provided to all Party characters by the Trailblazer's Talent will additionally offset DMG equal to <span class="text-desc">2%</span> of the Trailblazer's DEF plus <span class="text-desc">27</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Trail-Blazing Blueprint`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Nation-Building Oath`,
      content: `At the start of the battle, immediately gains <span class="text-desc">4</span> stack(s) of <b class="text-hsr-fire">Magma Will</b>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Spirit-Warming Flame`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `City-Forging Bulwarks`,
      content: `After the Trailblazer use enhanced Basic ATK or Ultimate, their DEF increases by <span class="text-desc">10%</span>. Stacks up to <span class="text-desc">3</span> time(s).`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'pmc_enhance',
      text: `Enhanced Basic ATK`,
      ...talents.talent,
      show: true,
      default: true,
      unique: true,
      sync: true,
    },
    {
      type: 'toggle',
      id: 'pmc_a2',
      text: `A2 Team DMG Reduction`,
      ...talents.a2,
      show: a.a2,
      default: true,
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'pmc_a6',
      text: `A6 Shielded ATK Bonus`,
      ...talents.a6,
      show: a.a6,
      default: true,
    },
    {
      type: 'number',
      id: 'pmc_c6',
      text: `E6 DEF Bonus Stacks`,
      ...talents.c6,
      show: c >= 6,
      default: 3,
      min: 0,
      max: 3,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'pmc_a2')]

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

      const c1Scaling = c >= 1 ? [{ scaling: 0.25 * (form.pmc_enhance ? 2 : 1), multiplier: Stats.DEF }] : []
      base.BASIC_SCALING = form.pmc_enhance
        ? [
            {
              name: 'Main Target',
              value: [{ scaling: calcScaling(0.9, 0.09, basic, 'linear'), multiplier: Stats.ATK }, ...c1Scaling],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 20,
              sum: true,
              hitSplit: [0.5, 0.5],
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.36, 0.036, basic, 'linear'), multiplier: Stats.ATK }, ...c1Scaling],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }, ...c1Scaling],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
          ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [
            { scaling: calcScaling(0.5, 0.05, ult, 'curved'), multiplier: Stats.ATK },
            { scaling: calcScaling(0.75, 0.075, ult, 'curved'), multiplier: Stats.DEF },
          ],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'AoE Shield',
          value: [{ scaling: calcScaling(0.04, 0.0025, ult, 'curved') + (c >= 2 ? 0.02 : 0), multiplier: Stats.DEF }],
          flat: calcScaling(20, 12, ult, 'curved') + (c >= 2 ? 27 : 0),
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE Shield',
          value: [{ scaling: 0.3, multiplier: Stats.DEF }],
          flat: 384,
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
          sum: true,
        },
      ]

      if (form.pmc_enhance) base.BA_ALT = true
      if (form.pmc_a2)
        base.DMG_REDUCTION.push({
          name: 'Ascension 2 Passive',
          source: 'Self',
          value: 0.15,
        })

      if (a.a4 && form.pmc_enhance)
        base.BASIC_SCALING.push({
          name: 'Healing',
          value: [{ scaling: 0.05, multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        })
      if (form.pmc_a6)
        base[Stats.P_ATK].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.15,
        })
      if (form.pmc_c6)
        base[Stats.P_DEF].push({
          name: 'Eidolon 6',
          source: 'Self',
          value: 0.1 * form.pmc_c6,
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
      if (form.pmc_a2)
        base.DMG_REDUCTION.push({
          name: 'Ascension 2 Passive',
          source: 'Trailblazer',
          value: 0.15,
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
      return base
    },
  }
}

export default PMC
