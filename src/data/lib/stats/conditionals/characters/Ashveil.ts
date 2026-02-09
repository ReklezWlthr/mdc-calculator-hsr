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

import { toPercentage } from '@src/core/utils/data_format'
import { IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'

const Ashveil = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const index = _.findIndex(team, (item) => item?.cId === '1223')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Talons: Induction of Etiquette`,
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Ashveil's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      image: 'asset/traces/SkillIcon_1504_Normal.webp',
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Flog: Purge the Vile Beasts',
      content: `Marks one designated enemy target as <b class="text-red">Bait</b>, dealing <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Ashveil's ATK, and Ashveil gains <span class="text-desc">1</span> <b>Charge(s)</b>. If the target is already marked as <b class="text-red">Bait</b>, additionally deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Ashveil's ATK to the target, as well as recovers <span class="text-desc">1</span> Skill Point(s). When <b class="text-red">Bait</b> does not exist on the field, Ashveil immediate inflicts <b class="text-red">Bait</b> on the enemy target with the lowest HP on the current field. The <b class="text-red">Bait</b> state only applies to the most recently marked target. When <b class="text-red">Bait</b> receives a killing blow, marks the enemy target with the lowest HP on the current field as the new <b class="text-red">Bait</b>. While <b class="text-red">Bait</b> exists on the field, all enemies' DEF is reduced by {{2}}%.`,
      value: [
        { base: 150, growth: 15, style: 'curved' },
        { base: 50, growth: 5, style: 'curved' },
        { base: 20, growth: 2, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.ST,
      sp: -1,
      image: 'asset/traces/SkillIcon_1504_BP.webp',
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Banquet: Infinite Eucharist`,
      content: `Marks one designated enemy as <b class="text-red">Bait</b>, deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Ashveil's ATK to them, then immediately launches enhanced Talent's <u>Follow-Up ATK</u> to them <span class="text-desc">1</span> time, and Ashveil gains <span class="text-desc">2</span> <b>Charge(s)</b>.
      <br />This enhanced Talent's <u>Follow-Up ATK</u> does not consume <b>Charge</b>, and for every <span class="text-desc">4</span> stacks of <b class="text-violet-400">Gluttony</b> possessed, consumes <span class="text-desc">4</span> stacks of <b class="text-violet-400">Gluttony</b> to additionally deal <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Ashveil's ATK. During the enhanced Talent's <u>Follow-Up ATK</u>, if the original <b class="text-red">Bait</b> receives a killing blow, and the stack count of <b class="text-violet-400">Gluttony</b> is <span class="text-desc">4</span> or more, Ashveil will continue to consume <b class="text-violet-400">Gluttony</b> to deal DMG to a new <b class="text-red">Bait</b>. The enhanced Talent's <u>Follow-Up ATK</u> immediately ends after all enemy targets in the current field receive a killing blow.`,
      value: [
        { base: 250, growth: 25, style: 'curved' },
        { base: 300, growth: 30, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.ST,
      image: 'asset/traces/SkillIcon_1504_Ultra_on.webp',
    },
    talent: {
      energy: 5,
      trace: 'Talent',
      title: `Rancor: Retribution in Kind`,
      content: `Ashveil starts with <span class="text-desc">3</span> <b>Charge(s)</b>, up to a max of <span class="text-desc">5</span>. After <b class="text-red">Bait</b> is attacked by another ally target, Ashveil consumes <span class="text-desc">4</span> <b>Charge(s)</b> to launch a <u>Follow-Up ATK</u> against <b class="text-red">Bait</b>, dealing <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Ashveil's ATK, and subsequently gaining <span class="text-desc">1</span> stack(s) of <b class="text-violet-400">Gluttony</b>, stacking up to <span class="text-desc">12</span> time(s).`,
      value: [{ base: 180, growth: 18, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ST,
      image: 'asset/traces/SkillIcon_1504_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: 'Devour: O Loathsome Hand',
      content: `After using Technique, enemies within a set area are inflicted with Daze for <span class="text-desc">10</span> second(s). Dazed enemies will not actively attack ally targets.
      <br />When attacking a Dazed enemy to enter combat, deals <b class="text-hsr-lightning">Lightning DMG</b> to all enemies equal to <span class="text-desc">100%</span> of Ashveil's ATK, and Ashveil gains <span class="text-desc">1</span> point(s) of <b>Charge</b>.`,
      tag: AbilityTag.IMPAIR,
      image: 'asset/traces/SkillIcon_1504_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Felonious Path`,
      content: `When Ashveil uses Skill or Ultimate, gains <span class="text-desc">1/2</span> stacks of <b class="text-violet-400">Gluttony</b>. During Ashveil's <u>Follow-Up ATK</u>, whenever <span class="text-desc">1</span> enemies suffer a killing blow, Ashveil gains <span class="text-desc">1</span> stack(s) of <b class="text-violet-400">Gluttony</b>.`,
      image: 'asset/traces/SkillIcon_1504_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Umbral Limb`,
      content: `When an ally target launches a <u>Follow-Up ATK</u>, increases the DMG dealt by this <u>Follow-Up ATK</u> by <span class="text-desc">80%</span>. If the <u>Follow-Up ATK</u> is launched by Ashveil, additionally regenerates <span class="text-desc">3</span> Energy for Ashveil.`,
      image: 'asset/traces/SkillIcon_1504_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `First Fang`,
      content: `While Ashveil is on the field, CRIT DMG dealt by ally targets increases by <span class="text-desc">40%</span>, and CRIT DMG dealt by ally target's <u>Follow-Up ATKs</u> increases by an additional <span class="text-desc">80%</span>.`,
      image: 'asset/traces/SkillIcon_1504_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Beware: Wander Not in Full Moon`,
      content: `While Ashveil is on the field, increases DMG taken by all enemies by <span class="text-desc">24%</span>. When an enemy target's current HP percentage is <span class="text-desc">80%</span> or lower, the DMG they take increases to <span class="text-desc">36%</span>.`,
      image: 'asset/traces/SkillIcon_1504_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Knock: Where Snickers Echo`,
      content: `The max stack limit of <b class="text-violet-400">Gluttony</b> increases to <span class="text-desc">18</span>. Whenever Ashveil triggers an enhanced Talent's <u>Follow-Up ATK</u>, refunds <span class="text-desc">35%</span> of the removed <b class="text-violet-400">Gluttony</b> stacks.`,
      image: 'asset/traces/SkillIcon_1504_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Hush: Weight of Unspoken Truths`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
      image: 'asset/traces/SkillIcon_1504_Ultra.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Heed: Truth Needs No Mastication`,
      content: `When Ashveil uses his Ultimate, increases ATK by <span class="text-desc">40%</span> for <span class="text-desc">3</span> turn(s).`,
      image: 'asset/traces/SkillIcon_1504_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Advisory: The Sleuth Is But the Slayer`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1504_BP.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Finale: And Then There Were None`,
      content: `While <b class="text-red">Bait</b> exists on the field, reduces all enemies' <b>All-Type RES</b> by <span class="text-desc">20%</span>. For each stack of <b class="text-violet-400">Gluttony</b> Ashveil has gained, his DMG dealt increases by <span class="text-desc">3%</span>. This effect can stack up to <span class="text-desc">30</span> time(s).`,
      image: 'asset/traces/SkillIcon_1504_Rank6.webp',
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'bait',
      text: `Bait`,
      ...talents.skill,
      show: true,
      default: true,
      debuff: true,
    },
    {
      type: 'number',
      id: 'gluttony',
      text: `Gluttony`,
      ...talents.ult,
      show: true,
      default: 4,
      min: 0,
      max: c >= 2 ? 18 : 12,
    },
    {
      type: 'toggle',
      id: 'ash_c1',
      text: `E1 Additional Vulnerability`,
      ...talents.c1,
      show: c >= 1,
      default: true,
    },
    {
      type: 'toggle',
      id: 'ash_c4',
      text: `E4 ATK Bonus`,
      ...talents.c4,
      show: c >= 4,
      default: true,
      duration: 3,
    },
    {
      type: 'number',
      id: 'ash_c6',
      text: `E6 GLuttony Gain Count`,
      ...talents.c6,
      show: c >= 6,
      default: 4,
      min: 0,
      max: 30,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'bait')]

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

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
          hitSplit: [0.15, 0.15, 0.7],
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [
            {
              scaling:
                calcScaling(1.5, 0.15, skill, 'curved') + (form.bait ? calcScaling(0.5, 0.05, ult, 'curved') : 0),
              multiplier: Stats.ATK,
            },
          ],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(2.5, 0.25, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
        ...(form.gluttony >= 4
          ? [
              {
                name: 'Enhanced Follow-Up DMG',
                value: [{ scaling: calcScaling(1.8, 0.18, talent, 'curved'), multiplier: Stats.ATK }],
                element: Element.LIGHTNING,
                property: TalentProperty.FUA,
                type: TalentType.TALENT,
                break: 5,
                sum: true,
              },
              {
                name: 'Gluttony Additional DMG',
                value: [
                  { scaling: calcScaling(3, 0.3, ult, 'curved') * _.floor(form.gluttony / 4), multiplier: Stats.ATK },
                ],
                element: Element.LIGHTNING,
                property: TalentProperty.ADD,
                type: TalentType.NONE,
                sum: true,
              },
            ]
          : []),
      ]
      base.TALENT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.8, 0.18, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 5,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 1, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
          sum: true,
        },
      ]

      if (form.bait) {
        base.DEF_REDUCTION.push({
          name: 'Bait',
          source: 'Self',
          value: calcScaling(0.2, 0.02, skill, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
        if (c >= 6) {
          base.ALL_TYPE_RES_RED.push({
            name: 'Bait',
            source: 'Self',
            value: 0.2,
          })
          addDebuff(debuffs, DebuffTypes.OTHER)
        }
      }
      if (a.a4) {
        base.FUA_DMG.push({
          name: 'Ascension 4 Passive',
          source: 'Self',
          value: 0.8,
        })
      }
      if (a.a6) {
        base[Stats.CRIT_DMG].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.4,
        })
        base.FUA_CD.push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.8,
        })
      }
      if (c >= 1) {
        base.VULNERABILITY.push({
          name: 'Eidolon 1',
          source: 'Self',
          value: form.ash_c1 ? 0.36 : 0.24,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.ash_c4) {
        base[Stats.P_ATK].push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.4,
        })
      }
      if (form.ash_c6) {
        base[Stats.ALL_DMG].push({
          name: 'Eidolon 6',
          source: 'Self',
          value: 0.03 * form.ash_c6,
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
      if (form.bait) {
        base.DEF_REDUCTION.push({
          name: 'Bait',
          source: 'Ashveil',
          value: calcScaling(0.2, 0.02, skill, 'curved'),
        })
        if (c >= 6) {
          base.ALL_TYPE_RES_RED.push({
            name: 'Bait',
            source: 'Ashveil',
            value: 0.2,
          })
        }
      }
      if (a.a4) {
        base.FUA_DMG.push({
          name: 'Ascension 4 Passive',
          source: 'Ashveil',
          value: 0.8,
        })
      }
      if (a.a6) {
        base[Stats.CRIT_DMG].push({
          name: 'Ascension 6 Passive',
          source: 'Ashveil',
          value: 0.4,
        })
        base.FUA_CD.push({
          name: 'Ascension 6 Passive',
          source: 'Ashveil',
          value: 0.8,
        })
      }
      if (c >= 1) {
        base.VULNERABILITY.push({
          name: 'Eidolon 1',
          source: 'Ashveil',
          value: form.ash_c1 ? 0.36 : 0.24,
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
    ) => {
      return base
    },
  }
}

export default Ashveil
