import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

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
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Fleetwinged Raid',
      content: `Marks a designated single enemy target as the <b class="text-hsr-lightning">Prey</b> and deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Moze's ATK to it.
        <br />When there are no other characters on the field that are capable of combat, Moze cannot use his Skill and dispels the enemy's <b class="text-hsr-lightning">Prey</b> state.`,
      value: [{ base: 75, growth: 7.5, style: 'curved' }],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Dash In, Gash Out`,
      content: `Increases the DMG dealt by this character by {{0}}%, lasting for <span class="text-desc">2</span> turn(s), and deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Moze's ATK to a single target enemy.`,
      value: [
        { base: 30, growth: 2, style: 'curved' },
        { base: 210, growth: 14, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Cascading Featherblade`,
      content: `Moze will enter the <b>Departed</b> state while a <b class="text-hsr-lightning">Prey</b> exists on the field.
        <br />After allies attack the <b class="text-hsr-lightning">Prey</b>, Moze will additionally deal <span class="text-desc">1</span> instance of <b class="text-hsr-lightning">Additional Lightning DMG</b> equal to {{0}}% of his ATK and gains <span class="text-desc">1</span> <b>Charge</b>. When Moze's <b>Charge</b> reaches <span class="text-desc">7</span> points, consume all <b>Charges</b> to launch <span class="text-desc">1</span> <u>follow-up attack</u> to the <b class="text-hsr-lightning">Prey</b>, dealing <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Moze's ATK and dispel the target's <b class="text-hsr-lightning">Prey</b> state.`,
      value: [
        { base: 15, growth: 1.5, style: 'curved' },
        { base: 100, growth: 10, style: 'curved' },
      ],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'Bated Wings',
      content: `After using his Technique, Moze gains Stealth for <span class="text-desc">20</span> second(s). While Stealth is active, Moze cannot be detected by enemies. Action Advances by <span class="text-desc">50%</span> and increases the DMG Moze deals by <span class="text-desc">30%</span> when he enters combat by attacking enemies while in Stealth mode, lasting for <span class="text-desc">1</span> turn(s).`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Nightfeather`,
      content: `Recover <span class="text-desc">1</span> Skill Point(s) after using a <u>follow-up attack</u>. This effect can be triggered again after <span class="text-desc">1</span> turn(s).`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Daggerhold`,
      content: `Moze's Action is <u>Advanced Forward</u> by <span class="text-desc">30%</span> when his <b>Departed</b> status is dispelled. If Moze's current <b>Charge</b> equals <span class="text-desc">4</span> or greater, then his action will instead be <u>Advanced Forward</u> by <span class="text-desc">60%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Vengewise`,
      content: `When an ally attacks an enemy marked as <b class="text-hsr-lightning">Prey</b>, increases the CRIT DMG dealt by <span class="text-desc">20%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Oathkeeper`,
      content: `When this character deals DMG with his Ultimate, it is considered as having launched a <u>follow-up attack</u>. Increases <u>follow-up attack DMG</u> taken by the enemy marked as <b class="text-hsr-lightning">Prey</b> by <span class="text-desc">25%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Wrathbearer`,
      content: `After entering battle, Moze regenerates <span class="text-desc">20</span> point(s) of Energy. For every time the Additional DMG from his Talent is triggered, Moze regenerates <span class="text-desc">3</span> point(s) of Energy.`,
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
      content: `The CRIT DMG boost effect of the <b>Vengewise</b> additionally increases by <span class="text-desc">20%</span>.`,
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
      content: `After using the Ultimate to attack an enemy target, Moze immediately launches the <u>follow-up attack</u> from Talent against this target. If the target is defeated before this <u>follow-up attack</u> is used, then activate the <u>follow-up attack</u> against a random single enemy.`,
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
      id: 'moze_ult',
      text: `Ult DMG Bonus`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'moze_talent',
      text: `Talent DMG Bonus`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 1,
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
          value: [{ scaling: calcScaling(2.1, 0.14, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: c >= 1 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1, 0.1, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 20,
          sum: true,
        },
      ]

      if (form.moze_ult) {
        base[Stats.ALL_DMG].push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.3, 0.02, ult, 'curved'),
        })
      }
      if (form.moze_talent) {
        base[Stats.ALL_DMG].push({
          name: 'Talent',
          source: 'Self',
          value: 0.3,
        })
      }
      if (form.prey) {
        if (a.a6) {
          base[Stats.CRIT_DMG].push({
            name: 'Ascension 6 Passive',
            source: 'Self',
            value: 0.2 + (c >= 4 ? 0.2 : 0),
          })
        }
        if (c >= 1) {
          base.FUA_VUL.push({
            name: 'Eidolon 1',
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
        if (a.a6) {
          base[Stats.CRIT_DMG].push({
            name: 'Ascension 6 Passive',
            source: 'Moze',
            value: 0.2 + (c >= 4 ? 0.2 : 0),
          })
        }
        if (c >= 1) {
          base.FUA_VUL.push({
            name: 'Eidolon 1',
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
