import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Sampo = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const names = _.map(team, (item) => findCharacter(item?.cId)?.name)
  const index = _.findIndex(team, (item) => item?.cId === '1108')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Dazzling Blades',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Sampo's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: c >= 1 ? 36 : 30,
      trace: 'Skill',
      title: 'Ricochet Love',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Sampo's ATK to a single enemy, and further deals DMG for <span class="text-desc">4</span> extra time(s), with each time dealing <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Sampo's ATK to a random enemy.`,
      value: [{ base: 28, growth: 2.8, style: 'curved' }],
      level: skill,
      tag: AbilityTag.BOUNCE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Surprise Present`,
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Sampo's ATK to all enemies, with a <span class="text-desc">100%</span> <u>base chance</u> to increase the targets' DoT taken by {{1}}% for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 96, growth: 6.4, style: 'curved' },
        { base: 20, growth: 1, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `Windtorn Dagger`,
      content: `Sampo's attacks have a <span class="text-desc">65%</span> <u>base chance</u> to inflict <b class="text-hsr-wind">Wind Shear</b> for <span class="text-desc">3</span> turn(s).
      <br />Enemies inflicted with <b class="text-hsr-wind">Wind Shear</b> will take <b class="text-hsr-wind">Wind DoT</b> equal to {{0}}% of Sampo's ATK at the beginning of each turn. <b class="text-hsr-wind">Wind Shear</b> can stack up to <span class="text-desc">5</span> time(s).`,
      value: [{ base: 20, growth: 2, style: 'dot' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: 'Shining Bright',
      content: `After Sampo uses Technique, enemies in a set area are inflicted with <b>Blind</b> for <span class="text-desc">10</span> second(s). <b>Blinded</b> enemies cannot detect your team.
      <br />When initiating combat against a <b>Blinded</b> enemy, there is a <span class="text-desc">100%</span> <u>fixed chance</u> to delay all enemies' action by <span class="text-desc">25%</span>.`,
      tag: AbilityTag.IMPAIR,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Trap`,
      content: `Extends the duration of <b class="text-hsr-wind">Wind Shear</b> caused by Talent by <span class="text-desc">1</span> turn(s).`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Defensive Position`,
      content: `Using Ultimate additionally regenerates <span class="text-desc">10</span> Energy.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Spice Up`,
      content: `Enemies with <b class="text-hsr-wind">Wind Shear</b> effect deal <span class="text-desc">15%</span> less DMG to Sampo.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Rising Love`,
      content: `When using Skill, deals DMG for <span class="text-desc">1</span> extra time(s) to a random enemy.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Infectious Enthusiasm`,
      content: `Defeating an enemy with <b class="text-hsr-wind">Wind Shear</b> has a <span class="text-desc">100%</span> <u>base chance</u> to inflict all enemies with <span class="text-desc">1</span> stack(s) of <b class="text-hsr-wind">Wind Shear</b>, equivalent to the Talent's <b class="text-hsr-wind">Wind Shear</b>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Big Money!`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `The Deeper the Love, the Stronger the Hate`,
      content: `When Skill hits an enemy with <span class="text-desc">5</span> or more stack(s) of <b class="text-hsr-wind">Wind Shear</b>, the enemy immediately takes <span class="text-desc">8%</span> of current <b class="text-hsr-wind">Wind Shear</b> DMG.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Huuuuge Money!`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Increased Spending`,
      content: `Talent's <b class="text-hsr-wind">Wind Shear</b> DMG multiplier increases by <span class="text-desc">15%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'sampo_ult',
      text: `Surprise Present DoT Vulnerability`,
      ...talents.ult,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1, fixed: false },
      duration: 2,
    },
    {
      type: 'number',
      id: 'sampo_wind_shear',
      text: `Talent Wind Shear`,
      ...talents.talent,
      show: true,
      default: 1,
      min: 0,
      max: 5,
      debuff: true,
      chance: { base: 0.65, fixed: false },
      duration: a.a2 ? 4 : 3,
      debuffElement: Element.WIND,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'sampo_ult'),
    findContentById(content, 'sampo_wind_shear'),
  ]

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
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'First Hit',
          value: [{ scaling: calcScaling(0.28, 0.028, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
        {
          name: `Bounce`,
          value: [{ scaling: calcScaling(0.28, 0.028, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 5,
        },
        {
          name: `Max Single Target DMG`,
          value: [{ scaling: calcScaling(0.28, 0.028, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          multiplier: c >= 1 ? 6 : 5,
          break: 10 + (c >= 1 ? 5 : 4) * 5,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.96, 0.064, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
      ]
      const wind_shear = {
        name: 'Wind Shear DMG',
        value: [{ scaling: calcScaling(0.2, 0.02, talent, 'dot') + (c >= 6 ? 0.15 : 0), multiplier: Stats.ATK }],
        element: Element.WIND,
        property: TalentProperty.DOT,
        type: TalentType.NONE,
        chance: { base: 0.65, fixed: false },
        multiplier: form.sampo_wind_shear,
        debuffElement: Element.WIND,
        sum: true,
      }
      base.TALENT_SCALING = form.sampo_wind_shear ? [wind_shear] : []

      if (form.sampo_ult) {
        base.DOT_VUL.push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.2, 0.01, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }

      if (form.sampo_wind_shear) {
        base.DOT_SCALING.push({
          ...wind_shear,
          overrideIndex: index,
          dotType: DebuffTypes.WIND_SHEAR,
        })
        addDebuff(debuffs, DebuffTypes.WIND_SHEAR)
        base.WIND_SHEAR_STACK += form.sampo_wind_shear
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
      if (form.sampo_ult)
        base.DOT_VUL.push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.2, 0.01, ult, 'curved'),
        })
      if (form.sampo_wind_shear) base.WIND_SHEAR_STACK += form.sampo_wind_shear

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
      if (countDot(debuffs, DebuffTypes.WIND_SHEAR) && a.a6) {
        base.WEAKEN.push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.15,
        })
      }
      if (base.WIND_SHEAR_STACK >= 5)
        base.CALLBACK.push((x, d, w, all) => {
          const wind_shear = _.filter(
            _.flatMap(all, (item) => item.DOT_SCALING),
            (item) => _.includes([DebuffTypes.WIND_SHEAR, DebuffTypes.DOT], item.dotType)
          )
          x.SKILL_SCALING.push(
            ..._.map(wind_shear, (item, i) => ({
              ...item,
              chance: undefined,
              name: `${names?.[item.overrideIndex]}'s ${item.name}`.replace('DMG', 'Detonation'),
              multiplier: (item.multiplier || 1) * 0.08,
              sum: true,
            }))
          )
          return x
        })

      return base
    },
  }
}

export default Sampo
