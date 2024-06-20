import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Bailu = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      trace: 'Basic ATK',
      title: `Diagnostic Kick`,
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Bailu's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      trace: 'Skill',
      title: `Singing Among Clouds`,
      content: `Heals a single ally for {{0}}% of Bailu's Max HP plus {{1}}. Bailu then heals random allies <span class="text-desc">2</span> time(s). After each healing, HP restored from the next healing is reduced by <span class="text-desc">15%</span>.`,
      value: [
        { base: 7.8, growth: 0.4875, style: 'heal' },
        { base: 78, growth: 46.8, style: 'flat' },
      ],
      level: skill,
    },
    ult: {
      trace: 'Ultimate',
      title: 'Felicitous Thunderleap',
      content: `Heals all allies for {{0}}% of Bailu's Max HP plus {{1}}. Bailu applies <b>Invigoration</b> to allies that are not already <b>Invigorated</b>. For those already <b>Invigorated</b>, Bailu extends the duration of their <b>Invigoration</b> by <span class="text-desc">1</span> turn. The effect of <b>Invigoration</b> can last for <span class="text-desc">2</span> turn(s). This effect cannot stack.`,
      value: [
        { base: 9, growth: 0.5625, style: 'heal' },
        { base: 90, growth: 54, style: 'flat' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Gourdful of Elixir`,
      content: `After an ally with <b>Invigoration</b> is hit, restores the ally's HP for {{0}}% of Bailu's Max HP plus {{1}}. This effect can trigger <span class="text-desc">2</span> time(s). When an ally receives a killing blow, they will not be knocked down. Bailu immediately heals the ally for {{2}}% of Bailu's Max HP plus {{3}} HP. This effect can be triggered <span class="text-desc">1</span> time per battle.`,
      value: [
        { base: 3.6, growth: 0.225, style: 'heal' },
        { base: 36, growth: 21.6, style: 'flat' },
        { base: 12, growth: 0.75, style: 'heal' },
        { base: 120, growth: 72, style: 'flat' },
      ],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: `Saunter in the Rain`,
      content: `After using Technique, at the start of the next battle, all allies are granted <b>Invigoration</b> for <span class="text-desc">2</span> turn(s).`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Qihuang Analects`,
      content: `When Bailu heals a target ally above their normal Max HP, the target's Max HP increases by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turns.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Vidyadhara Ichor Lines`,
      content: `Invigoration can trigger <span class="text-desc">1</span> more time(s).`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Aquatic Benediction`,
      content: `Characters with <b>Invigoration</b> receive <span class="text-desc">10%</span> less DMG.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Ambrosial Aqua`,
      content: `If the target ally's current HP is equal to their Max HP when <b>Invigoration</b> ends, regenerates <span class="text-desc">8</span> extra Energy for this target.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Sylphic Slumber`,
      content: `After using her Ultimate, Bailu's Outgoing Healing increases by an additional <span class="text-desc">15%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Omniscient Opulence`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Evil Excision`,
      content: `Every healing provided by the Skill makes the recipient deal <span class="text-desc">10%</span> more DMG for <span class="text-desc">2</span> turn(s). This effect can stack up to <span class="text-desc">3</span> time(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Waning Worries`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Drooling Drop of Draconic Divinity`,
      content: `Bailu can heal allies who received a killing blow <span class="text-desc">1</span> more time(s) in a single battle.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'bailu_a2',
      text: `A2 Overheal HP Bonus`,
      ...talents.a2,
      show: a.a2,
      default: false,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'bailu_a6',
      text: `A6 Invigoration DMG Reduction`,
      ...talents.a6,
      show: a.a6,
      default: false,
    },
    {
      type: 'toggle',
      id: 'bailu_c2',
      text: `E2 Healing Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      duration: 2,
    },
    {
      type: 'number',
      id: 'bailu_c4',
      text: `E4 Skill Healing DMG Bonus`,
      ...talents.c4,
      show: c >= 4,
      default: 0,
      min: 0,
      max: 3,
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = []

  const allyContent: IContent[] = [
    findContentById(content, 'bailu_a2'),
    findContentById(content, 'bailu_a6'),
    findContentById(content, 'bailu_c4'),
  ]

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
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
        },
      ]
      const baseHeal = {
        value: [{ scaling: calcScaling(0.078, 0.004875, skill, 'heal'), multiplier: Stats.HP }],
        flat: calcScaling(78, 46.8, skill, 'flat'),
        element: TalentProperty.HEAL,
        property: TalentProperty.HEAL,
        type: TalentType.NONE,
      }
      base.SKILL_SCALING = [
        {
          name: 'Target Healing',
          ...baseHeal,
        },
        {
          name: 'Bounce 1 Healing',
          ...baseHeal,
          multiplier: 0.85,
        },
        {
          name: 'Bounce 2 Healing',
          ...baseHeal,
          multiplier: 0.7,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE Healing',
          value: [{ scaling: calcScaling(0.09, 0.005625, ult, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(90, 54, ult, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Invigoration Healing',
          value: [{ scaling: calcScaling(0.036, 0.00225, talent, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(36, 19.6, talent, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
        {
          name: 'Revive Healing',
          value: [{ scaling: calcScaling(0.12, 0.0075, talent, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(120, 72, talent, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]

      if (form.bailu_a2)
        base[Stats.P_HP].push({
          name: 'Ascension 2 Passive',
          source: 'Self',
          value: 0.1,
        })
      if (form.bailu_a6)
        base.DMG_REDUCTION.push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.1,
        })
      if (form.bailu_c2)
        base[Stats.HEAL].push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.15,
        })
      if (form.bailu_c4)
        base[Stats.ALL_DMG].push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.1 * form.bailu_c4,
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
      if (aForm.bailu_a2)
        base[Stats.P_HP].push({
          name: 'Ascension 2 Passive',
          source: 'Bailu',
          value: 0.1,
        })
      if (aForm.bailu_a6)
        base.DMG_REDUCTION.push({
          name: 'Ascension 6 Passive',
          source: 'Bailu',
          value: 0.1,
        })
      if (aForm.bailu_c4)
        base[Stats.ALL_DMG].push({
          name: 'Eidolon 4',
          source: 'Bailu',
          value: 0.1 * form.bailu_c4,
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

export default Bailu
