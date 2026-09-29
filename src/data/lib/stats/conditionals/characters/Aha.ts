import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import {
  AbilityTag,
  Element,
  GlobalModifiers,
  ITalentLevel,
  ITeamChar,
  PathType,
  Stats,
  TalentProperty,
  TalentType,
} from '@src/domain/constant'

import { teamOptionGenerator, toPercentage } from '@src/core/utils/data_format'
import { Banger, IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'
import { CallbackType } from '@src/domain/stats'

const Aha = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
    elation: c >= 5 ? 2 : c >= 3 ? 1 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent
  const elation = t.elation + upgrade.elation

  const index = _.findIndex(team, (item) => item?.cId === '1511')
  const elationCount = _.filter(team, (t) => findCharacter(t.cId)?.path === PathType.ELATION)?.length || 1

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: 'Starfrost, Showtime!',
      content: `Deals {{0}}% <b class="text-hsr-quantum">Quantum</b> <b class="elation">Elation DMG</b> to one designated enemy target.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      image: 'asset/traces/SkillIcon_1511_Normal.webp',
    },
    skill: {
      trace: 'Skill',
      title: `This Emanator Was Certified by Aha™`,
      content: `Causes one designated ally to gain the <b class="text-violet-400">Emanator of Elation</b> state, then immediately launches a <u>Follow-up ATK</u>, dealing {{0}}% <b class="text-hsr-quantum">Quantum</b> <b class="elation">Elation DMG</b> to all enemies. <b class="text-violet-400">Emanator of Elation</b> state lasts for the entire battle until switching to the next target. The target with the <b class="text-violet-400">Emanator of Elation</b> state has their Elation stat increased by {{1}}% and, at the start of their turn, causes Aeon ★ Aha to gain <span class="text-desc">1</span> point(s) of <b class="text-desc">Wishpower</b>.`,
      value: [
        { base: 25, growth: 2.5, style: 'curved' },
        { base: 10, growth: 1, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.SUPPORT,
      sp: -1,
      image: 'asset/traces/SkillIcon_1511_BP.webp',
    },
    summon_skill: {
      trace: 'Elation Skill',
      title: `Yes Aha At Full Moon`,
      content: `Deals {{0}}% <b class="text-hsr-quantum">Quantum</b> <b class="elation">Elation DMG</b> to all enemies, then deals <b class="text-true">True DMG</b> based on <span class="text-desc">20%</span> of the total DMG dealt by this <b class="text-aha">Aha Instant</b>, equally distributed among all enemies.`,
      value: [{ base: 30, growth: 3, style: 'curved' }],
      level: elation,
      tag: AbilityTag.AOE,
      image: 'asset/traces/SkillIcon_1511_Elation.webp',
    },
    ult: {
      trace: 'Ultimate',
      title: `Aha! Let There Be Laughter`,
      content: `Aeon ★ Aha gains the <b class="text-rose-400">Faces of Elation</b> state, lasting for <span class="text-desc">3</span> turn(s). At the start of each Aeon ★ Aha's turn, duration decreases by <span class="text-desc">1</span>. Deals {{0}}% <b class="text-hsr-quantum">Quantum</b> <b class="elation">Elation DMG</b> to all enemies, then deals <span class="text-desc">5</span> instance(s) of DMG. Each instance deals {{1}}% <b class="text-hsr-quantum">Quantum</b> <b class="elation">Elation DMG</b> to one random enemy.`,
      value: [
        { base: 120, growth: 8, style: 'curved' },
        { base: 36, growth: 2.4, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
      image: 'asset/traces/SkillIcon_1511_Ultra_on.webp',
    },
    talent: {
      trace: `Talent`,
      title: `Work Wonders with THEM`,
      content: `The Ultimate can be activated once <b class="text-desc">Wishpower</b> reaches <span class="text-desc">8</span> points. Aeon ★ Aha gains <span class="text-desc">1</span> point(s) of <b class="text-desc">Wishpower</b> after using Basic ATK, Skill, or Elation Skill. Once the team's <b class="text-orange-400">Punchline</b> reach <span class="text-desc">40</span> points for the first time, Aeon ★ Aha will immediately gain <span class="text-desc">1</span> point(s) of <b class="text-desc">Wishpower</b>, then increase all allies' CRIT DMG by {{0}}% for <span class="text-desc">3</span> turn(s). This can be triggered again after <b class="text-aha">Aha</b>'s turn ends.`,
      value: [{ base: 12, growth: 1.2, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1511_Passive.webp',
    },
    unique_talent: {
      trace: `Exclusive Talent`,
      title: `Aha Instant in`,
      content: `Effect obtained after acquiring Aeon ★ Aha or when Aeon ★ Aha is in the current team: In combat, Aeon ★ Aha will personally lead the <b class="text-aha">Aha Instant</b> and can fast-forward the Elation Skill being used. The base SPD of <b class="text-aha">Aha Instant</b> increases from <span class="text-desc">80</span> to Aeon ★ Aha's base SPD.`,
      value: [{ base: 12, growth: 1.2, style: 'curved' }],
      level: talent,
      tag: AbilityTag.SUPPORT,
      image: 'asset/traces/SkillIcon_1511_Passive.webp',
    },
    talent_2: {
      trace: `Additional Talent`,
      title: `The True Story of Aha`,
      content: `When Aeon ★ Aha and teammates deal DMG, additionally deal <b class="text-red">Elation Debt</b> effect equal to <span class="text-desc">25%</span> of the DMG to the enemy target. During the enemy target's phase transition, they maintain the <b class="text-red">Elation Debt</b> value, with a maximum not exceeding <span class="text-desc">10%</span> of the target's Max HP.`,
      value: [{ base: 12, growth: 1.2, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1511_Passive2.webp',
    },
    innate: {
      trace: `Innate Trace`,
      title: `Faces of Elation ★ Ex Nihilo`,
      content: `While possessing the <b class="text-rose-400">Faces of Elation</b> state, Aeon ★ Aha causes allies' <i class="text-red">Path of Elation to ascend</i>, enhancing <b class="text-orange-400">Punchline</b> and the <b class="text-blue">Certified Banger</b> state into <b class="text-orange-600">Bliss</b> and the <b class="text-indigo-300">Party Trick</b> state. <b class="text-orange-600">Bliss</b> recovers <span class="text-desc">10%</span> of the consumed <b class="text-orange-400">Punchline</b> at the end of the <b class="text-aha">Aha Instant</b> turn. During <b class="text-rose-400">Faces of Elation</b>, DMG dealt by Aeon ★ Aha ignores {{0}}% of the enemy target's DEF.`,
      value: [{ base: 30, growth: 30, style: 'linear' }],
      tag: AbilityTag.ENHANCE,
      level: c >= 2 ? 2 : 1,
      image: 'asset/traces/SkillIcon_1511_Innate.webp',
    },
    technique: {
      trace: 'Technique',
      title: 'ABRACADABRA!',
      content: `After using the Technique, creates a special zone around this unit lasting <span class="text-desc">20</span> seconds. Enemies within the special zone are inflicted with <b class="text-desc">Misjudgment</b>. Enemies under <b class="text-desc">Misjudgment</b> cannot detect our targets. Upon entering combat, <b class="text-aha">Aha</b> immediately gains <span class="text-desc">1</span> extra turn that adds a fixed <span class="text-desc">20</span> <b class="text-orange-400">Punchline</b> to the count.`,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1511_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'A Prank on Aeons',
      content: `Skill's <u>Follow-Up ATK</u> additionally deals <span class="text-desc">20%</span> <b class="elation">Elation DMG</b> of the corresponding Type to the target with <b class="text-violet-400">Emanator of Elation</b> state and recovers <span class="text-desc">1</span> Skill Point(s). The <b class="elation">Elation DMG</b> additionally dealt in this instance does not count as <span class="text-desc">1</span> instance of attack.`,
      image: 'asset/traces/SkillIcon_1511_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'A Carnival in Whimsy',
      content: `When receiving healing or a Shield provided by a teammate, gains <span class="text-desc">1</span> point(s) of <b class="text-desc">Wishpower</b>. This can be triggered up to <span class="text-desc">1</span> times. The trigger count resets after using Ultimate.`,
      image: 'asset/traces/SkillIcon_1511_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `A Box of Everything`,
      content: `When Aeon ★ Aha's SPD is <span class="text-desc">125</span>/<span class="text-desc">150</span> or higher, Elation increases by <span class="text-desc">120%</span>/<span class="text-desc">150%</span>.`,
      image: 'asset/traces/SkillIcon_1511_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Who Giggled at the Primordial Hush?',
      content: `When entering combat, immediately gain <span class="text-desc">4</span> point(s) of <b class="text-desc">Wishpower</b>, and merrymakes <b class="elation">Elation DMG</b> dealt by all ally targets by <span class="text-desc">15%</span>.`,
      image: 'asset/traces/SkillIcon_1511_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'Between THEIR Eyes and Yours',
      content: `Enhances <i class="text-red">Elation Path ascension</i> effects: Upgrading Elation characters' Innate Trace level by <span class="text-desc">1</span>.`,
      image: 'asset/traces/SkillIcon_1511_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'A Stacked Deck of Sorrow and Joy',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1511_Ultra.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: `A Joke's Fate Boxed in Black`,
      content: `Increases the multiplier of the <b class="text-true">True DMG</b> dealt by Elation Skills by <span class="text-desc">25%</span> of the original multiplier. When Aeon ★ Aha deals <b class="elation">Elation DMG</b>, an additional <span class="text-desc">100%</span> of the cumulative <b class="text-blue">Certified Banger</b> stacks possessed by teammates will be taken into the account.`,
      image: 'asset/traces/SkillIcon_1511_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Moi Onstage and Me Offstage',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1511_BP.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'For THEY Said: You Are Elation',
      content: `Enemy targets always have the <b class="text-red">Elation Debt</b> effect that is at least equal to <span class="text-desc">20%</span> of the target's Max HP. The first time Aeon ★ Aha casts the Ultimate, <b class="text-aha">Aha</b> immediately gains <span class="text-desc">1</span> extra turn that adds a fixed <span class="text-desc">40</span> <b class="text-orange-400">Punchline</b> to the count. Each subsequent Ultimate cast advances the <b class="text-aha">Aha</b>'s action by <span class="text-desc">20%</span>.`,
      image: 'asset/traces/SkillIcon_1511_Rank6.webp',
    },
  }

  const content: IContent[] = [
    { ...Banger },
    {
      type: 'element',
      id: 'emanator_elation',
      text: `Emanator of Elation`,
      ...talents.skill,
      show: true,
      default: '1',
      options: teamOptionGenerator(team),
    },
    {
      type: 'number',
      id: 'aha_elation_total',
      text: `Aha Instant Total DMG`,
      ...talents.summon_skill,
      show: true,
      default: 1000000,
    },
    {
      type: 'toggle',
      id: 'aha_talent',
      text: `Talent CRIT DMG`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'faces_of_elation',
      text: `Faces of Elation ★ Ex Nihilo`,
      ...talents.innate,
      show: true,
      default: true,
    },
  ]

  const teammateContent: IContent[] = []

  const allyContent: IContent[] = [findContentById(content, 'aha_talent')]

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
      broken: boolean,
      globalMod: GlobalModifiers,
    ) => {
      const base = _.cloneDeep(x)

      if (c >= 1) {
        base.ELATION_MERRYMAKE.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.15,
        })
      }

      if (form.emanator_elation) {
        base[Stats.ELATION].push({
          name: `Emanator of Elation`,
          source: 'Self',
          value: calcScaling(0.1, 0.01, skill, 'curved'),
        })
      }

      if (form.aha_talent) {
        base[Stats.CRIT_DMG].push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.12, 0.012, talent, 'curved'),
        })
      }

      if (form.faces_of_elation) {
        base.DEF_PEN.push({
          name: `Faces of Elation ★ Ex Nihilo`,
          source: 'Self',
          value: c >= 2 ? 0.6 : 0.3,
        })
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
      broken: boolean,
      globalMod: GlobalModifiers,
    ) => {
      if (form.emanator_elation) {
        base[Stats.ELATION].push({
          name: `Emanator of Elation`,
          source: 'Aeon ★ Aha',
          value: calcScaling(0.1, 0.01, skill, 'curved'),
        })
      }

      if (c >= 1) {
        base.ELATION_MERRYMAKE.push({
          name: `Eidolon 1`,
          source: 'Pearl',
          value: 0.15,
        })
      }

      if (form.aha_talent) {
        base[Stats.CRIT_DMG].push({
          name: `Talent`,
          source: 'Aeon ★ Aha',
          value: calcScaling(0.12, 0.012, talent, 'curved'),
        })
      }

      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      t: StatsObject[],
      allForm: Record<string, any>[],
      debuffs: {
        type: DebuffTypes
        count: number
      }[],
      weakness: Element[],
      broken: boolean,
      globalCallback: CallbackType[],
      globalMod: GlobalModifiers,
    ) => {
      const modBanger = c >= 4 ? _.sumBy(allForm, (af) => af.banger) : form.banger

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.25, 0.05, basic, 'linear'), multiplier: Stats.ELATION }],
          element: Element.QUANTUM,
          property: TalentProperty.ELATION,
          type: TalentType.BA,
          break: 10,
          sum: true,
          punchline: modBanger,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'AoE FUA',
          value: [{ scaling: calcScaling(0.25, 0.025, skill, 'curved'), multiplier: Stats.ELATION }],
          element: Element.QUANTUM,
          property: TalentProperty.ELATION,
          type: TalentType.SKILL,
          sum: true,
          break: 10,
          isFua: true,
          punchline: modBanger,
        },
      ]
      base.MEMO_SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.3, 0.03, elation, 'curved'), multiplier: Stats.ELATION }],
          element: Element.QUANTUM,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          sum: true,
          break: 10,
        },
        {
          name: 'Main Targe - True DMG',
          value: [],
          flat: (c >= 4 ? 0.2 * 1.25 : 0.2) * form.aha_elation_total,
          multiplier: 1 / globalMod.enemy_count,
          element: Element.NONE,
          property: TalentProperty.TRUE,
          type: TalentType.NONE,
          sum: true,
          trueRaw: true,
        },
      ]
      const emaIndex = Number(form.emanator_elation) - 1
      if (a.a2 && emaIndex >= 0) {
        base.SKILL_SCALING.push({
          name: 'A2 Extra Emanator DMG',
          value: [{ scaling: 0.2, multiplier: Stats.ELATION }],
          element: findCharacter(team[emaIndex].cId).element,
          property: TalentProperty.ELATION,
          type: TalentType.SKILL,
          sum: true,
        })
      }
      base.ULT_SCALING = [
        {
          name: 'Total Single Target DMG',
          value: [
            { scaling: calcScaling(1.2, 0.08, ult, 'curved'), multiplier: Stats.ELATION },
            { scaling: calcScaling(0.36, 0.024, ult, 'curved'), multiplier: Stats.ELATION, hits: 5 },
          ],
          element: Element.QUANTUM,
          property: TalentProperty.ELATION,
          type: TalentType.ULT,
          sum: true,
          break: 45,
          punchline: modBanger,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.2, 0.08, ult, 'curved'), multiplier: Stats.ELATION }],
          element: Element.QUANTUM,
          property: TalentProperty.ELATION,
          type: TalentType.ULT,
          break: 20,
          punchline: modBanger,
        },
        {
          name: 'DMG per Bounce',
          value: [{ scaling: calcScaling(0.36, 0.024, ult, 'curved'), multiplier: Stats.ELATION }],
          element: Element.QUANTUM,
          property: TalentProperty.ELATION,
          type: TalentType.ULT,
          break: 5,
          punchline: modBanger,
        },
      ]

      globalCallback.push(function P999(_x, _d, _w, all) {
        const spd = all[index].getSpd()
        if (spd >= 125 && a.a6) {
          all[index][Stats.ELATION].push({
            name: `Ascension 6 Passive`,
            source: 'Self',
            value: spd >= 150 ? 1.5 : 1.2,
          })
        }

        return all
      })

      return base
    },
  }
}

export default Aha
