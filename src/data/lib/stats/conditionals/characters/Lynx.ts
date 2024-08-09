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

const Lynx = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1110')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Ice Crampon Technique`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of this character's Max HP to a single enemy.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Salted Camping Cans',
      content: `Applies <b>Survival Response</b> to a single target ally and increases their Max HP by {{0}}% of Lynx's Max HP plus {{1}}. If the target ally is a character on the Path of Destruction or Preservation, the chance of them being attacked by enemies will greatly increase. <b>Survival Response</b> lasts for <span class="text-desc">2</span> turn(s).
      <br />Restores the target's HP by {{2}}% of Lynx's Max HP plus {{3}}.`,
      value: [
        { base: 5, growth: 0.25, style: 'curved' },
        { base: 50, growth: 30, style: 'flat' },
        { base: 8, growth: 0.5, style: 'heal' },
        { base: 80, growth: 48, style: 'flat' },
      ],
      level: skill,
      tag: AbilityTag.RESTORE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Snowfield First Aid`,
      content: `Dispels <span class="text-desc">1</span> debuff(s) from all allies and immediately restores their respective HP by an amount equal to {{0}}% of Lynx's Max HP plus {{1}}.`,
      value: [
        { base: 9, growth: 0.5625, style: 'heal' },
        { base: 90, growth: 54, style: 'flat' },
      ],
      level: ult,
      tag: AbilityTag.RESTORE,
    },
    talent: {
      trace: 'Talent',
      title: `Outdoor Survival Experience`,
      content: `When using Lynx's Skill or Ultimate, applies continuous healing to the target ally for <span class="text-desc">2</span> turn(s), restoring the target ally's HP by an amount equal to {{0}}% of Lynx's Max HP plus {{1}} at the start of each their turn. If the target has <b>Survival Response</b>, the continuous healing effect additionally restores HP by an amount equal to {{2}}% of Lynx's Max HP plus {{3}}.`,
      value: [
        { base: 2.4, growth: 0.15, style: 'heal' },
        { base: 24, growth: 14.4, style: 'flat' },
        { base: 3, growth: 0.1875, style: 'heal' },
        { base: 30, growth: 18, style: 'flat' },
      ],
      level: talent,
      tag: AbilityTag.RESTORE,
    },
    technique: {
      trace: 'Technique',
      title: 'Chocolate Energy Bar',
      content: `After Lynx uses her Technique, at the start of the next battle, all allies are granted her Talent's continuous healing effect, lasting for <span class="text-desc">2</span> turn(s).`,
      tag: AbilityTag.RESTORE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Advance Surveying`,
      content: `After a target with <b>Survival Response</b> is hit, Lynx regenerates <span class="text-desc">2</span> Energy immediately.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Exploration Techniques`,
      content: `Increases the chance to resist Crowd Control debuffs by <span class="text-desc">35%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Survival in the Extreme`,
      content: `Extends the duration of the continuous healing effect granted by Talent for <span class="text-desc">1</span> turn(s).`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Morning of Snow Hike`,
      content: `When healing allies with HP equal to or lower than <span class="text-desc">50%</span>, Lynx's Outgoing Healing increases by <span class="text-desc">20%</span>. This effect also works on continuous healing.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Noon of Portable Furnace`,
      content: `A target with <b>Survival Response</b> can resist debuff application for <span class="text-desc">1</span> time(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Afternoon of Avalanche Beacon`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Dusk of Warm Campfire`,
      content: `When <b>Survival Response</b> is gained, increases the target's ATK by an amount equal to <span class="text-desc">3%</span> of Lynx's Max HP for <span class="text-desc">1</span> turn(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Night of Aurora Tea`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Dawn of Explorers' Chart`,
      content: `Additionally boosts the Max HP increasing effect of <b>Survival Response</b> by an amount equal to <span class="text-desc">6%</span> of Lynx's Max HP and increases Effect RES by <span class="text-desc">30%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'survival_response',
      text: `Survival Response`,
      ...talents.skill,
      show: true,
      default: false,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'lynx_c1',
      text: `Target Ally HP <= 50%`,
      ...talents.c1,
      show: c >= 1,
      default: true,
    },
  ]

  const teammateContent: IContent[] = []

  const allyContent: IContent[] = [findContentById(content, 'survival_response')]

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
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Healing',
          value: [{ scaling: calcScaling(0.08, 0.005, skill, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(80, 48, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Healing',
          value: [{ scaling: calcScaling(0.09, 0.005625, ult, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(90, 54, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Healing Over Time',
          value: [{ scaling: calcScaling(0.024, 0.0015, ult, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(24, 14.4, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
          sum: true,
        },
        {
          name: 'Survival Response Healing Over Time',
          value: [{ scaling: calcScaling(0.03, 0.001875, ult, 'heal'), multiplier: Stats.HP }],
          flat: calcScaling(30, 18, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]

      if (form.lynx_c1)
        base[Stats.HEAL].push({
          name: 'Eidolon 1',
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
      if (aForm.survival_response && _.includes([PathType.DESTRUCTION, PathType.PRESERVATION], form.path))
        base.AGGRO.push({
          name: 'Skill',
          source: 'Lynx',
          value: 5,
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
      _.forEach(allForm, (f, i) => {
        if (f.survival_response) {
          team[i].X_HP.push({
            name: 'Skill',
            source: index === i ? 'Self' : 'Lynx',
            value: (calcScaling(0.05, 0.0025, skill, 'curved') + (c >= 6 ? 0.06 : 0)) * base.getHP(true),
          })
          team[i][Stats.HP].push({
            name: 'Skill',
            source: index === i ? 'Self' : 'Lynx',
            value: calcScaling(50, 30, skill, 'flat'),
          })
          if (c >= 4)
            team[i][Stats.ATK].push({
              name: 'Eidolon 4',
              source: index === i ? 'Self' : 'Lynx',
              value: 0.03 * base.getHP(),
            })
          if (c >= 6)
            team[i][Stats.E_RES].push({
              name: 'Eidolon 6',
              source: index === i ? 'Self' : 'Lynx',
              value: 0.3,
            })
        }
      })

      return base
    },
  }
}

export default Lynx
