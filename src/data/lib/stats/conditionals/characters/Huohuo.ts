import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Huohuo = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1215')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Banner: Stormcaller`,
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Huohuo's Max HP to a target enemy.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Talisman: Protection`,
      content: `Dispels <span class="text-desc">1</span> debuff(s) from a single target ally and immediately restores this ally's HP by an amount equal to {{0}}% of Huohuo's Max HP plus {{1}}. At the same time, restores HP for allies that are adjacent to this target ally by an amount equal to {{2}}% of Huohuo's Max HP plus {{3}}.`,
      value: [
        { base: 14, growth: 0.875, style: 'heal' },
        { base: 140, growth: 84, style: 'flat' },
        { base: 11.2, growth: 0.7, style: 'heal' },
        { base: 112, growth: 67.2, style: 'flat' },
      ],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Tail: Spiritual Domination`,
      content: `Regenerates Energy for all allies (excluding this character) by an amount equal to {{0}}% of their respective Max Energy. At the same time, increases their ATK by {{1}}% for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 15, growth: 0.5, style: 'curved' },
        { base: 24, growth: 1.6, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Possession: Ethereal Metaflow`,
      content: `After using her Skill, Huohuo gains <b class="text-hsr-wind">Divine Provision</b>, lasting for <span class="text-desc">2</span> turn(s). This duration decreases by <span class="text-desc">1</span> turn at the start of each Huohuo's turn. If Huohuo has <b class="text-hsr-wind">Divine Provision</b> when an ally's turn starts or when an ally uses their Ultimate, restores HP for that ally by an amount equal to {{0}}% of Huohuo's Max HP plus {{1}}. At the same time, every ally with <span class="text-desc">50%</span> HP or lower receives healing once.
      <br />When <b class="text-hsr-wind">Divine Provision</b> is triggered to heal an ally, dispel <span class="text-desc">1</span> debuff(s) from that ally. This effect can be triggered up to <span class="text-desc">6</span> time(s). Using the skill again resets the effect's trigger count.`,
      value: [
        { base: 3, growth: 0.1875, style: 'heal' },
        { base: 30, growth: 18, style: 'flat' },
      ],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: `Fiend: Impeachment of Evil`,
      content: `Huohuo terrorizes surrounding enemies, afflicting Horror-Struck on them. Enemies in Horror-Struck will flee away from Huohuo for <span class="text-desc">10</span> second(s). When entering battle with enemies in Horror-Struck, there is a <span class="text-desc">100%</span> <u>base chance</u> of reducing every single enemy's ATK by <span class="text-desc">25%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Fearful to Act`,
      content: `When battle starts, Huohuo gains <b class="text-hsr-wind">Divine Provision</b>, lasting for <span class="text-desc">1</span> turn(s).`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `The Cursed One`,
      content: `The chance to resist Crowd Control Debuffs increases by <span class="text-desc">35%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Stress Reaction to Horror`,
      content: `When her Talent is triggered to heal allies, Huohuo regenerates <span class="text-desc">1</span> Energy.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Anchored to Vessel, Specters Nestled`,
      content: `The duration of <b class="text-hsr-wind">Divine Provision</b> produced by the Talent is extended by <span class="text-desc">1</span> turn(s). When Huohuo possesses <b class="text-hsr-wind">Divine Provision</b>, all allies' SPD increases by <span class="text-desc">12%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Sealed in Tail, Wraith Subdued`,
      content: `If Huohuo possesses <b class="text-hsr-wind">Divine Provision</b> when an ally is struck by a killing blow, the ally will not be knocked down, and their HP will immediately be restored by an amount equal to <span class="text-desc">50%</span> of their Max HP. This reduces the duration of <b class="text-hsr-wind">Divine Provision</b> by <span class="text-desc">1</span> turn. This effect can only be triggered <span class="text-desc">2</span> time(s) per battle.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Cursed by Fate, Moths to Flame`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Tied in Life, Bound to Strife`,
      content: `When healing a target ally via Skill or Talent, the less HP the target ally currently has, the higher the amount of healing they will receive. The maximum increase in healing provided by Huohuo is <span class="text-desc">80%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Mandated by Edict, Evils Evicted`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Woven Together, Cohere Forever`,
      content: `When healing a target ally, increases the target ally's DMG dealt by <span class="text-desc">50%</span> for <span class="text-desc">2</span> turn(s).`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'huohuo_ult',
      text: `Huohuo's Ult Bonus`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'huohuo_tech',
      text: `Horror-Struck`,
      ...talents.technique,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'huohuo_c1',
      text: `E1 ATK Bonus`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      duration: 2,
    },
    {
      type: 'number',
      id: 'huohuo_c4',
      text: `E4 Healing Bonus (%)`,
      ...talents.c4,
      show: c >= 4,
      default: 0,
      min: 0,
      max: 80,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'huohuo_tech'),
    findContentById(content, 'huohuo_ult'),
    findContentById(content, 'huohuo_c1'),
  ]

  const allyContent: IContent[] = [
    {
      type: 'toggle',
      id: 'huohuo_c6',
      text: `E6 On-Healed DMG Bonus`,
      ...talents.c6,
      show: c >= 6,
      default: false,
      duration: 2,
    },
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
          value: [{ scaling: calcScaling(0.25, 0.05, basic, 'linear'), multiplier: Stats.HP }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(0.14, 0.00875, skill, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(140, 84, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.112, 0.007, skill, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(112, 67.2, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Turn-Start Healing',
          value: [{ scaling: calcScaling(0.03, 0.001875, skill, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(30, 18, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
          sum: true,
        },
      ]

      if (form.huohuo_ult)
        base[Stats.P_ATK].push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.24, 0.016, ult, 'curved'),
        })
      if (form.huohuo_tech) {
        base.ATK_REDUCTION.push({
          name: 'Talent',
          source: 'Self',
          value: 0.25,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.huohuo_c1)
        base[Stats.P_SPD].push({
          name: 'Eidolon 1',
          source: 'Self',
          value: 0.12,
        })
      if (form.huohuo_c4)
        base[Stats.HEAL].push({
          name: 'Eidolon 4',
          source: 'Self',
          value: form.huohuo_c4 / 100,
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
      if (form.huohuo_ult)
        base[Stats.P_ATK].push({
          name: 'Ultimate',
          source: 'Huohuo',
          value: calcScaling(0.24, 0.016, ult, 'curved'),
        })
      if (form.huohuo_tech)
        base.ATK_REDUCTION.push({
          name: 'Talent',
          source: 'Huohuo',
          value: 0.25,
        })
      if (form.huohuo_c1)
        base[Stats.P_SPD].push({
          name: 'Eidolon 1',
          source: 'Huohuo',
          value: 0.12,
        })
      if (aForm.huohuo_c6)
        base[Stats.ALL_DMG].push({
          name: 'Eidolon 6',
          source: 'Huohuo',
          value: 0.5,
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

export default Huohuo
