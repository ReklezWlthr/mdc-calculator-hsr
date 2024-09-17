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

const Moze = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1223')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Hurlthorn`,
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Moze's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Fleetwinged Raid',
      content: `Marks a designated single enemy target as <b class="text-hsr-lightning">Prey</b> and deals to it <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Moze's ATK and gains <span class="text-desc">9</span> points of <b>Charge</b>.
        <br />When there are no other characters on the field that are capable of combat, Moze cannot use his Skill and dispels the enemy's <b class="text-hsr-lightning">Prey</b> state.`,
      value: [{ base: 75, growth: 7.5, style: 'curved' }],
      level: skill,
      tag: AbilityTag.ST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Dash In, Gash Out`,
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Moze's ATK to a single target enemy, and launches his Talent's <u>follow-up attack against</u> this target. If the target is defeated before this <u>follow-up attack</u> is used, then launches the <u>follow-up attack</u> against a random single enemy instead.`,
      value: [{ base: 162, growth: 10.8, style: 'curved' }],
      level: ult,
      tag: AbilityTag.ST,
    },
    talent: {
      energy: 10,
      trace: 'Talent',
      title: `Cascading Featherblade`,
      content: `When <b class="text-hsr-lightning">Prey</b> exists on the field, Moze will enter the <b>Departed</b> state.
        <br />After allies attack <b class="text-hsr-lightning">Prey</b>, Moze will additionally deal <span class="text-desc">1</span> instance of <b class="text-hsr-lightning">Additional Lightning DMG</b> equal to {{0}}% of his ATK and consumes <span class="text-desc">1</span> point of <b>Charge</b>. For every <span class="text-desc">3</span> point(s) of <b>Charge</b> consumed, Moze launches <span class="text-desc">1</span> <u>follow-up attack</u> to <b class="text-hsr-lightning">Prey</b>, dealing <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Moze's ATK. When <b>Charge</b> reaches <span class="text-desc">0</span>, dispels the target's <b class="text-hsr-lightning">Prey</b> state and reset the tally of <b>Charge</b> points required to launch <u>follow-up attack</u>. Talent's <u>follow-up attack</u> does not consume <b>Charge</b>.`,
      value: [
        { base: 15, growth: 1.5, style: 'curved' },
        { base: 80, growth: 8, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.ST,
    },
    technique: {
      trace: 'Technique',
      title: 'Bated Wings',
      content: `After using his Technique, enters the Stealth state for <span class="text-desc">20</span> second(s). While in Stealth, Moze is undetectable by enemies. If Moze attacks enemies to enter combat while in Stealth, increases DMG by <span class="text-desc">30%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Nightfeather`,
      content: `After using the Talent's <u>follow-up attack</u>, recover <span class="text-desc">1</span> Skill Point(s). This effect can trigger again after <span class="text-desc">1</span> turn(s).`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Daggerhold`,
      content: `When Moze dispels his <b>Departed</b> state, his <u>Action Advances</u> by <span class="text-desc">20%</span>. At the start of each wave, Moze's <u>Action Advances</u> by <span class="text-desc">30%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Vengewise`,
      content: `When dealing DMG by using Ultimate, it is considered as having launched a <u>follow-up attack</u>. The <u>follow-up attack</u> DMG taken by <b class="text-hsr-lightning">Prey</b> increases by <span class="text-desc">25%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Oathkeeper`,
      content: `After entering battle, Moze regenerates <span class="text-desc">20</span> Energy. Each time the Additional DMG from his Talent is triggered, Moze regenerates <span class="text-desc">2</span> Energy.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Wrathbearer`,
      content: `When all allies deal DMG to the enemy target marked as <b class="text-hsr-lightning">Prey</b>, increases CRIT DMG by <span class="text-desc">40%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Deathchaser`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Heathprowler`,
      content: `When using Ultimate, increases the DMG dealt by Moze by <span class="text-desc">30%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Truthbender`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Faithbinder`,
      content: `Increases the DMG multiplier of the Talent's <u>follow-up attack</u> by <span class="text-desc">25%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'prey',
      text: `Prey`,
      ...talents.talent,
      show: true,
      default: true,
      unique: true,
    },
    {
      type: 'toggle',
      id: 'moze_talent',
      text: `Technique DMG Bonus`,
      ...talents.technique,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'moze_c4',
      text: `E4 DMG Bonus`,
      ...talents.c4,
      show: c >= 4,
      default: true,
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'prey')]

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
          value: [{ scaling: calcScaling(0.75, 0.075, skill, 'curved'), multiplier: Stats.ATK }],
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
          value: [{ scaling: calcScaling(1.62, 0.108, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: a.a6 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.8, 0.08, talent, 'curved') + (c >= 6 ? 0.25 : 0), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 10,
          sum: true,
          hitSplit: [0.08, 0.08, 0.08, 0.08, 0.08, 0.6],
        },
      ]

      if (form.moze_talent) {
        base[Stats.ALL_DMG].push({
          name: 'Talent',
          source: 'Self',
          value: 0.3,
        })
      }
      if (form.moze_c4) {
        base[Stats.ALL_DMG].push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.3,
        })
      }
      if (form.prey) {
        base.ADD_DEBUFF.push({
          name: 'Prey',
          source: 'Self',
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
        if (c >= 2) {
          base[Stats.CRIT_DMG].push({
            name: 'Eidolon 2',
            source: 'Self',
            value: 0.4,
          })
        }
        if (a.a6) {
          base.FUA_VUL.push({
            name: 'Ascension 6 Passive',
            source: 'Self',
            value: 0.25,
          })
        }
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
      broken: boolean
    ) => {
      if (form.prey) {
        base.ADD_DEBUFF.push({
          name: 'Prey',
          source: 'Moze',
        })
        if (c >= 2) {
          base[Stats.CRIT_DMG].push({
            name: 'Eidolon 2',
            source: 'Moze',
            value: 0.4,
          })
        }
        if (a.a6) {
          base.FUA_VUL.push({
            name: 'Ascension 6 Passive',
            source: 'Moze',
            value: 0.25,
          })
        }
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
      broken: boolean
    ) => {
      if (form.prey) {
        _.forEach(team, (t, i) => {
          if (i !== index) {
            _.forEach([t.BASIC_SCALING, t.SKILL_SCALING, t.ULT_SCALING, t.TALENT_SCALING], (s) => {
              if (_.some(s, (item) => _.includes([TalentProperty.NORMAL, TalentProperty.FUA], item.property)))
                s.push({
                  name: `Prey Additional DMG`,
                  value: [{ scaling: calcScaling(0.15, 0.015, skill, 'curved'), multiplier: Stats.ATK }],
                  element: Element.LIGHTNING,
                  property: TalentProperty.ADD,
                  type: TalentType.NONE,
                  overrideIndex: index,
                  sum: true,
                })
            })
          }
        })
      }
      return base
    },
  }
}

export default Moze
