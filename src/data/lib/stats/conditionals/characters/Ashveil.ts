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
      title: `Talons: Inculcate Decorum`,
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
      title: 'Flog: Smite Evil',
      content: `Makes one designated enemy become the <b class="text-red">Bait</b>, dealing it <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Ashveil's ATK. If the target is already the <b class="text-red">Bait</b>, additionally deals it <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Ashveil's ATK, and recovers <span class="text-desc">1</span> Skill Point(s). When the <b class="text-red">Bait</b> exists on the field, all enemies' DEF gets reduced by {{2}}%. When there is no <b class="text-red">Bait</b> on the field, Ashveil immediate makes the enemy target with the lowest HP on the field become the <b class="text-red">Bait</b>. The <b class="text-red">Bait</b> state only takes effect on the most recently applied target.`,
      value: [
        { base: 100, growth: 10, style: 'curved' },
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
      title: `Banquet: Insatiable Appetite`,
      content: `Makes one designated enemy become the <b class="text-red">Bait</b>, dealing it <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Ashveil's ATK. Then, immediately launches <span class="text-desc">1</span> instance of enhanced Talent's <u>Follow-Up ATK</u> against the <b class="text-red">Bait</b>. And Ashveil gains <span class="text-desc">3</span> <b>Charge</b>.
      <br />This enhanced Talent's <u>Follow-Up ATK</u> does not consume <b>Charge</b>. Whenever <b class="text-violet-400">Gluttony</b> reaches <span class="text-desc">4</span> stack(s) or more, consumes <span class="text-desc">4</span> stack(s) of <b class="text-violet-400">Gluttony</b> to additionally deal <span class="text-desc">1</span> instance of <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Ashveil's ATK. And when this instance of <u>Follow-Up ATK</u> deals a killing blow to the target, it will continue to deal DMG to a new <b class="text-red">Bait</b>. This triggers until <b class="text-violet-400">Gluttony</b> becomes lower than <span class="text-desc">4</span> stack(s). If all enemy targets currently on the field have been dealt killing blows, the enhanced Talent's <u>Follow-Up ATK</u> will immediately end.`,
      value: [
        { base: 200, growth: 20, style: 'curved' },
        { base: 100, growth: 10, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.ST,
      image: 'asset/traces/SkillIcon_1504_Ultra_on.webp',
    },
    talent: {
      energy: 5,
      trace: 'Talent',
      title: `Rancor: Enmity Reprisal`,
      content: `Ashveil has an initial <b>Charge(s)</b> of <span class="text-desc">2</span> and can hold up to a max of <span class="text-desc">3</span>. After the <b class="text-red">Bait</b> gets attacked by other ally targets, Ashveil regenerates a fixed amount of <span class="text-desc">8</span> Energy, then consumes <span class="text-desc">1</span> <b>Charge(s)</b> to launch a <u>Follow-Up ATK</u> against the <b class="text-red">Bait</b>, dealing <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Ashveil's ATK. Afterwards, gains <span class="text-desc">2</span> stack(s) of <b class="text-violet-400">Gluttony</b>, which can stack up to <span class="text-desc">12</span>.`,
      value: [{ base: 100, growth: 10, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ST,
      image: 'asset/traces/SkillIcon_1504_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: 'Devour: O Loathsome Hand',
      content: `After using Technique, inflicts Daze on enemies within a set area for <span class="text-desc">10</span> second(s). Dazed enemies will not actively attack ally targets.
      <br />When entering combat via actively attacking a Dazed enemy, deals <b class="text-hsr-lightning">Lightning DMG</b> to all enemies equal to <span class="text-desc">100%</span> of Ashveil's ATK, and grants Ashveil <span class="text-desc">1</span> <b>Charge</b>.`,
      tag: AbilityTag.IMPAIR,
      image: 'asset/traces/SkillIcon_1504_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Felonious Path`,
      content: `When Ashveil uses Skill/Ultimate, gains <span class="text-desc">1/2</span> stacks of <b class="text-violet-400">Gluttony</b>. During Ashveil's <u>Follow-Up ATK</u>, for every <span class="text-desc">1</span> enemy(ies) suffer a killing blow, Ashveil gains <span class="text-desc">1</span> stack(s) of <b class="text-violet-400">Gluttony</b>.`,
      image: 'asset/traces/SkillIcon_1504_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Phantom Limb`,
      content: `DMG dealt by Ashveil's <u>Follow-Up ATK</u> increases by by <span class="text-desc">80%</span>. And for every <span class="text-desc">1</span> stack(s) of <b class="text-violet-400">Gluttony</b> in possession, DMG dealt by <u>Follow-Up ATK</u> additionally increases by <span class="text-desc">10%</span>.`,
      image: 'asset/traces/SkillIcon_1504_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `First Fang`,
      content: `While Ashveil is on the field, CRIT DMG dealt by ally targets increases by <span class="text-desc">40%</span>, and CRIT DMG dealt by ally target's <u>Follow-Up ATK</u> additionally increases by <span class="text-desc">80%</span>.`,
      image: 'asset/traces/SkillIcon_1504_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Beware: Venture Not at Full Moon`,
      content: `While Ashveil is on the field, increases DMG taken by all enemies by <span class="text-desc">24%</span>. When an enemy target's current HP percentage is <span class="text-desc">50%</span> or lower, the DMG they take increases to <span class="text-desc">36%</span>.`,
      image: 'asset/traces/SkillIcon_1504_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Knock: Where Snickers Echo`,
      content: `The max stack limit of <b class="text-violet-400">Gluttony</b> increases to <span class="text-desc">18</span>. After each time Ashveil launches the enhanced Talent's <u>Follow-Up ATK</u>, refunds <span class="text-desc">35%</span> of the removed <b class="text-violet-400">Gluttony</b> stacks.`,
      image: 'asset/traces/SkillIcon_1504_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Hush: Unsaid Between Friends`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
      image: 'asset/traces/SkillIcon_1504_Ultra.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Heed: Swallow Truth Whole`,
      content: `When Ashveil uses his Ultimate, increases ATK by <span class="text-desc">40%</span> for <span class="text-desc">3</span> turn(s).`,
      image: 'asset/traces/SkillIcon_1504_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Caution: Sleuth Turns Slayer`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1504_BP.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Finale: And Then There Were None`,
      content: `When the <b class="text-red">Bait</b> exists on the field, reduces all enemies' <b>All-Type RES</b> by <span class="text-desc">20%</span>. For every <span class="text-desc">1</span> stack of <b class="text-violet-400">Gluttony</b> Ashveil has gained, the DMG dealt increases by <span class="text-desc">3%</span>. This effect can stack up to <span class="text-desc">30</span> time(s).`,
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
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [
            {
              scaling: calcScaling(1, 0.1, skill, 'curved') + (form.bait ? calcScaling(0.5, 0.05, ult, 'curved') : 0),
              multiplier: Stats.ATK,
            },
          ],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
          hitSplit: [0.6, 0.4],
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(2, 0.2, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
          hitSplit: Array(20).fill(0.05),
        },
        ...(form.gluttony >= 4
          ? [
              {
                name: 'Enhanced Follow-Up DMG',
                value: [{ scaling: calcScaling(1, 0.1, talent, 'curved'), multiplier: Stats.ATK }],
                element: Element.LIGHTNING,
                property: TalentProperty.FUA,
                type: TalentType.TALENT,
                break: 5,
                sum: true,
                hitSplit: Array(10).fill(0.1),
              },
              {
                name: 'Gluttony Additional DMG',
                value: [
                  {
                    scaling: calcScaling(1, 0.1, ult, 'curved'),
                    hits: _.floor(form.gluttony / 4),
                    multiplier: Stats.ATK,
                  },
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
          value: [{ scaling: calcScaling(1, 0.1, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 5,
          sum: true,
          hitSplit: Array(10).fill(0.1),
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
          value: 0.8 + 0.1 * form.gluttony,
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
