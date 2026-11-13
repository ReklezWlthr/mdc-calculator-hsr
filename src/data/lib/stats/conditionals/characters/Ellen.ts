import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import {
  AbilityTag,
  Element,
  GlobalModifiers,
  ITalentLevel,
  ITeamChar,
  Stats,
  TalentProperty,
  TalentType,
} from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/data_format'
import { IContent, IScaling, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'
import { PathType } from '../../../../../domain/constant'
import { CallbackType } from '@src/domain/stats'

const Ellen = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Saw Teeth Trimming',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Ellen's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      image: 'asset/traces/SkillIcon_1514_Normal.webp',
    },
    normal_alt: {
      energy: 20,
      trace: 'Enhanced Basic ATK',
      title: 'Ice Sea Diving',
      content: `Consumes all <b class="text-indigo-300">Shark's Gotta Bite</b>, inflicting <b class="text-red">Bite Mark</b> on the primary target and dealing <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Ellen's ATK to it. Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of Ellen's ATK to adjacent targets.
      <br />Activation Condition: Enhanced Basic ATK activates when <b class="text-indigo-300">Shark's Gotta Bite</b> is <span class="text-desc">3</span> or higher. If the <b class="text-indigo-300">Shark's Gotta Bite</b> consumed exceeds <span class="text-desc">3</span>, each additional <b class="text-indigo-300">Shark's Gotta Bite</b> consumed deals <span class="text-desc">1</span> instance of <b class="text-hsr-ice">Ice DMG</b> equal to {{2}}% of Ellen's ATK to one random enemy, prioritizing the primary target of this <b>Ice Sea Diving</b> and its adjacent targets.
      <br />This attack does not recover Skill Points.`,
      value: [
        { base: 200, growth: 40, style: 'linear' },
        { base: 120, growth: 24, style: 'linear' },
        { base: 160, growth: 32, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
      image: 'asset/traces/SkillIcon_1514_Normal_2.webp',
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Blizzard du Jour`,
      content: `Gains <span class="text-desc">1</span> point(s) of <b class="text-indigo-300">Shark's Gotta Bite</b>. Inflicts the <b class="text-red">Bite Mark</b> state on one designated enemy target, increasing the Basic ATK DMG taken by {{0}}%. Then, deals <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of Ellen's ATK to that target, while simultaneously dealing <b class="text-hsr-ice">Ice DMG</b> equal to {{2}}% of Ellen's ATK to adjacent targets. At the start of an ally target's turn or when they take action, if there are no enemy targets in the <b class="text-red">Bite Mark</b> state, Ellen causes the enemy target with the highest HP to become afflicted with <b class="text-red">Bite Mark</b>.`,
      value: [
        { base: 25, growth: 2.5, style: 'curved' },
        { base: 200, growth: 20, style: 'curved' },
        { base: 120, growth: 12, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
      sp: -1,
      image: 'asset/traces/SkillIcon_1514_BP.webp',
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Welcome to the Ice Age',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Ellen's ATK to all enemies. Additionally deals <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of Ellen's ATK to enemy targets in the <b class="text-red">Bite Mark</b> state. After using Ultimate, increases the DMG dealt by Ellen's next use of <b>Ice Sea Diving</b> by {{0}}%.`,
      value: [
        { base: 200, growth: 20, style: 'curved' },
        { base: 160, growth: 16, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
      image: 'asset/traces/SkillIcon_1514_Ultra_on.webp',
    },
    talent: {
      trace: 'Talent',
      title: `Better Call Bangboo`,
      content: `At the start of the battle, summons <b>Sharkboo</b> with an initial SPD of <span class="text-desc">200</span> points. When <b>Sharkboo</b> takes action, it launches <u>Follow-Up ATK</u>, dealing <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Ellen's ATK to one enemy. <b>Sharkboo</b> will prioritize attacking targets under the <b class="text-red">Bite Mark</b> state.
      <br />Ellen has a <b class="text-indigo-300">Shark's Gotta Bite</b> limit of <span class="text-desc">6</span> points. When an ally character uses a Basic ATK, Skill, or Ultimate to attack, Ellen gains <span class="text-desc">1</span> point(s) of <b class="text-indigo-300">Shark's Gotta Bite</b>.
      <br /><b>Ice Sea Diving</b> is unable to gain <b class="text-indigo-300">Shark's Gotta Bite</b>.
      <br />
      <br /><b>Zoned In on Zero</b>
      <br />When Astra Yao is on the team:
      <br />After Ellen uses her Ultimate, she automatically uses <b>Ice Sea Diving</b> <span class="text-desc">1</span> time, then immediately triggers Astra Yao's <b>Minuet Pianissimo</b> and grants Astra Yao <span class="text-desc">1</span> extra turn.
      <br />After Astra Yao uses her Ultimate, she automatically uses <b>Cadenza Cascade</b> <span class="text-desc">1</span> time, then immediately triggers Ellen's <b>Saw Teeth Trimming</b>, granting Ellen <span class="text-desc">1</span> point of <b class="text-indigo-300">Shark's Gotta Bite</b>, and then triggers Ellen's <b>Ice Sea Diving</b> <span class="text-desc">1</span> more time.
      <br />When attacks triggered by <b>Zoned In on Zero</b> select a primary target, both Ellen and Astra Yao prioritize enemy targets in the <b class="text-red">Bite Mark</b> state.
      <br />Basic ATKs triggered by <b>Zoned In on Zero</b> do not recover Skill Points, and <b>Ice Sea Diving</b> triggered by <b>Zoned In on Zero</b> does not consume <b class="text-indigo-300">Shark's Gotta Bite</b>.
      <br />After Ellen or Astra Yao uses their Ultimate, dispels the other's Crowd Control debuffs.`,
      value: [{ base: 300, growth: 30, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ST,
      image: 'asset/traces/SkillIcon_1514_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: `Roaming Hunt`,
      content: `Using the Technique grants the <b>Roaming</b> state for <span class="text-desc">20</span> seconds. While in the <b>Roaming</b> state, this unit moves forward rapidly, blocking all enemy attacks while moving. Using an attack or stopping while in the <b>Roaming</b> state ends it prematurely. After actively attacking an enemy and entering combat, this unit gains <span class="text-desc">3</span> <b class="text-indigo-300">Shark's Gotta Bite</b> and regenerates <span class="text-desc">10</span> Energy, and deals <b class="text-hsr-ice">Ice DMG</b> equal to <span class="text-desc">50%</span> of Ellen's ATK to all enemies.`,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1514_Maze.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Dining Etiquette`,
      content: `After <b>Sharkboo</b> attacks a target, Ellen gains <span class="text-desc">1</span> point of <b class="text-indigo-300">Shark's Gotta Bite</b>. This effect can trigger at most once per <b>Sharkboo</b> action. After Ellen consumes <span class="text-desc">6</span> points of <b class="text-indigo-300">Shark's Gotta Bite</b> to use <b>Ice Sea Diving</b>, for every <span class="text-desc">1</span> point of <b class="text-amber-300">Heat</b> cleared, <b>Sharkboo</b>'s action advances by <span class="text-desc">40%</span>.`,
      image: 'asset/traces/SkillIcon_1514_SkillTree3.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Diving Status`,
      content: `At the start of combat, Ellen gains <span class="text-desc">3</span> points of <b class="text-indigo-300">Shark's Gotta Bite</b>. Once <b class="text-indigo-300">Shark's Gotta Bite</b> reaches its limit, for every <span class="text-desc">2</span> points of excess <b class="text-indigo-300">Shark's Gotta Bite</b> accumulated, it is recorded as <span class="text-desc">1</span> point of <b class="text-amber-300">Heat</b>, up to a maximum of <span class="text-desc">2</span> points. After Ellen consumes <span class="text-desc">6</span> points of <b class="text-indigo-300">Shark's Gotta Bite</b> to use <b>Ice Sea Diving</b>, she clears all <b class="text-amber-300">Heat</b>, with every <span class="text-desc">1</span> point of <b class="text-amber-300">Heat</b> cleared recovering <span class="text-desc">1</span> point of <b class="text-indigo-300">Shark's Gotta Bite</b>.`,
      image: 'asset/traces/SkillIcon_1514_SkillTree2.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Roaming Mode`,
      content: `For each teammate who provides Ellen with at least <span class="text-desc">1</span> active buff, Ellen's CRIT DMG increases by <span class="text-desc">64%</span>, up to <span class="text-desc">2</span> teammates are taken into account. When <span class="text-desc">2</span> teammates are taken into account, DMG dealt by Ellen additionally increases by <span class="text-desc">48%</span>.`,
      image: 'asset/traces/SkillIcon_1514_SkillTree1.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Moods Packed and Ready`,
      content: `When Ellen consumes <span class="text-desc">6</span> <b class="text-indigo-300">Shark's Gotta Bite</b> to unleash <b>Ice Sea Diving</b>, all DMG dealt by this <b>Ice Sea Diving</b> ignores <span class="text-desc">30%</span> of the target's DEF. After this attack ends, Ellen's action advances by <span class="text-desc">25%</span> and she recovers <span class="text-desc">3</span> <b class="text-indigo-300">Shark's Gotta Bite</b>.`,
      image: 'asset/traces/SkillIcon_1514_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Pinch a Smile at the Mirror`,
      content: `After Ellen uses <b>Ice Sea Diving</b>, <b>Sharkboo</b>'s action advances by <span class="text-desc">100%</span>. When using each attack, <b>Sharkboo</b> regenerates <span class="text-desc">10</span> Energy and <span class="text-desc">1</span> <b class="text-indigo-300">Shark's Gotta Bite</b> for Ellen, and increases the CRIT DMG dealt by her next <b>Ice Sea Diving</b> by <span class="text-desc">50%</span>. This effect does not stack.`,
      image: 'asset/traces/SkillIcon_1514_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'The Morning Melts Sweet',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1514_BP.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: `A Heart Served All the Same`,
      content: `When Ellen uses <b>Ice Sea Diving</b>, every point of <b class="text-indigo-300">Shark's Gotta Bite</b> consumed increases the <b class="text-hsr-ice">Ice RES PEN</b> of all DMG dealt by this <b>Ice Sea Diving</b> by <span class="text-desc">2%</span>.`,
      image: 'asset/traces/SkillIcon_1514_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: `The Ocean Swims Her Home`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
      image: 'asset/traces/SkillIcon_1514_Ultra.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Fed, Rested, and Left Alone',
      content: `When Ellen uses <b>Ice Sea Diving</b>, <b class="text-hsr-ice">Ice RES PEN</b> increases by <span class="text-desc">20%</span>, and the number of instances of DMG dealt to random single enemy targets increases by <span class="text-desc">3</span>. After Ellen uses her Ultimate, she gains <span class="text-desc">1</span> stack(s) of <b class="text-desc">Revelry Instant</b>. The max limit of <b class="text-desc">Revelry Instant</b> stacks is <span class="text-desc">2</span>. While possessing <b class="text-desc">Revelry Instant</b>, after Ellen's turn or <b>Zoned In on Zero</b> ends, <span class="text-desc">1</span> stack of <b class="text-desc">Revelry Instant</b> is immediately consumed, and Ellen immediately gains <span class="text-desc">1</span> extra turn and regenerates <span class="text-desc">6</span> <b class="text-indigo-300">Shark's Gotta Bite</b>.`,
      image: 'asset/traces/SkillIcon_1514_Rank6.webp',
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'shark_gotta_bite',
      text: `Shark's Gotta Bite`,
      ...talents.normal_alt,
      show: true,
      default: 3,
      min: 0,
      max: 6,
      sync: true,
    },
    {
      type: 'toggle',
      id: 'bite_mark',
      text: `Bite Mark`,
      ...talents.skill,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'ellen_ult',
      text: `Enhanced BA Bonus DMG (Ult)`,
      ...talents.ult,
      show: true,
      default: true,
    },
    {
      type: 'number',
      id: 'ellen_a2',
      text: `A2 Buffing Ally Count`,
      ...talents.a2,
      show: a.a2,
      default: 2,
      min: 0,
      max: 2,
    },
    {
      type: 'toggle',
      id: 'ellen_e2',
      text: `E2 Enhanced BA CRIT DMG`,
      ...talents.c2,
      show: c >= 2,
      default: true,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'bite_mark')]

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
      broken: boolean,
    ) => {
      const base = _.cloneDeep(x)

      base.BA_ALT = form.shark_gotta_bite >= 3

      base.BASIC_SCALING = base.BA_ALT
        ? [
            {
              name: 'Main',
              value: [{ scaling: calcScaling(2, 0.4, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 20,
              sum: true,
              res_pen: (c >= 4 ? form.shark_gotta_bite * 0.02 : 0) + (c >= 6 ? 0.2 : 0),
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(1.2, 0.24, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: false,
              res_pen: (c >= 4 ? form.shark_gotta_bite * 0.02 : 0) + (c >= 6 ? 0.2 : 0),
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
          ]
      if (form.shark_gotta_bite > 3) {
        base.BASIC_SCALING.push({
          name: 'Total Bounce DMG',
          value: [
            {
              scaling: calcScaling(1.6, 0.32, basic, 'linear'),
              multiplier: Stats.ATK,
              hits: form.shark_gotta_bite - 3 + (c >= 6 ? 3 : 0),
            },
          ],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          sum: true,
          res_pen: (c >= 4 ? form.shark_gotta_bite * 0.02 : 0) + (c >= 6 ? 0.2 : 0),
        })
      }
      base.SKILL_SCALING = [
        {
          name: 'Main',
          value: [{ scaling: calcScaling(2, 0.2, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(1.2, 0.12, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(2, 0.2, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Sharkboo FUA DMG',
          value: [{ scaling: calcScaling(3, 0.3, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.5, multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          sum: true,
        },
      ]

      if (base.BA_ALT && form.ellen_ult) {
        base.BASIC_DMG.push({
          name: `Ultimate`,
          source: 'Self',
          value: calcScaling(2, 0.2, ult, 'curved'),
        })
      }
      if (form.bite_mark) {
        base.BASIC_VUL.push({
          name: `Bite Mark`,
          source: 'Self',
          value: calcScaling(0.25, 0.025, skill, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
        base.ULT_SCALING.push({
          name: 'Bite Mark Added DMG',
          value: [{ scaling: calcScaling(1.6, 0.16, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          sum: true,
        })
      }
      if (form.ellen_a2) {
        base[Stats.CRIT_DMG].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.64 * form.ellen_a2,
        })
      }
      if (form.ellen_a2 === 2) {
        base[Stats.ALL_DMG].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.48,
        })
      }
      if (form.shark_gotta_bite >= 6 && c >= 1) {
        base.BASIC_DEF_PEN.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.3,
        })
      }
      if (base.BA_ALT && form.ellen_e2) {
        base.BASIC_CD.push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.5,
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
    ) => {
      if (form.bite_mark) {
        base.BASIC_VUL.push({
          name: `Bite Mark`,
          source: 'Ellen',
          value: calcScaling(0.25, 0.025, skill, 'curved'),
        })
      }

      if (form.kings_acknowledgement && c >= 1) {
        base.DEF_PEN.push({
          name: `King's Acknowledgement`,
          source: 'Gilgamesh',
          value: calcScaling(0.15, 0.015, skill, 'curved'),
        })
      }
      if (a.a6) {
        base[Stats.P_ATK].push({
          name: `Ascension 6 Passive`,
          source: 'Gilgamesh',
          value: 0.2 + _.min([0.01 * _.max([base.MAX_ENERGY - 140, 0]), 1]),
        })
        base[Stats.CRIT_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Gilgamesh',
          value: 0.2 + _.min([0.01 * _.max([base.MAX_ENERGY - 140, 0]), 1]),
        })
      }
      if (c >= 6 && !base.SUMMON_ID) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Gilgamesh',
          value: 0.2,
        })
      }

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
      broken: boolean,
      globalCallback: CallbackType[],
      globalMod: GlobalModifiers,
    ) => {
      return base
    },
  }
}

export default Ellen
