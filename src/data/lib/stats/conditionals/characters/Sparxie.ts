import { addDebuff, findContentById } from '@src/core/utils/finder'
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
import { Banger, IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'
import { CallbackType } from '@src/domain/stats'

const Sparxie = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
    elation: c >= 5 ? 2 : c >= 3 ? 1 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent
  const elation = t.elation + upgrade.elation

  const index = _.findIndex(team, (item) => item?.cId === '1501')

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: 'Cat Got Your Flametongue?',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Sparxie's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      energy: 20,
      image: 'asset/traces/SkillIcon_1501_Normal.webp',
    },
    normal_alt: {
      trace: 'Enhanced Basic ATK',
      title: 'Bloom! Winner Takes All',
      content: `Upon finalizing the livestream connection results, deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Sparxie's ATK to one designated enemy, and <b class="text-hsr-fire">Fire DMG</b> equal to {{1}}% of Sparxie's ATK to adjacent targets.`,
      value: [
        { base: 50, growth: 10, style: 'linear' },
        { base: 25, growth: 5, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
      sp: 1,
      energy: 40,
      image: 'asset/traces/SkillIcon_1501_Normal2.webp',
    },
    skill: {
      trace: 'Skill',
      title: `Boom! Sparxicle's Poppin'`,
      content: `Start a livestream connection to transform Basic ATK into <b>Bloom! Winner Takes All</b> and trigger <b>Engagement Farming</b> <span class="text-desc">1</span> time. During this ability, <b>Engagement Farming</b> can be triggered repeatedly, up to <span class="text-desc">20</span> time(s). Using this ability is not considered as using a Skill.
      <br />
      <br /><b>Engagement Farming</b>
      <br />Causes <b>Bloom! Winner Takes All</b> to increase the DMG multiplier against one designated enemy by {{0}}% and the DMG multiplier against adjacent targets by {{1}}%. Randomly gains one of the following gifts:
      <br /><b class="text-hsr-fire">Straight Fire</b>: <span class="text-desc">2</span> <b class="text-orange-400">Punchline</b> point(s) and <span class="text-desc">2</span> Skill Point(s).
      <br /><b class="text-desc">Unreal Banger</b>: <span class="text-desc">1</span> <b class="text-orange-400">Punchline</b> point(s).`,
      value: [
        { base: 10, growth: 1, style: 'curved' },
        { base: 5, growth: 0.5, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.ENHANCE,
      sp: -1,
      image: 'asset/traces/SkillIcon_1501_BP.webp',
    },
    summon_skill: {
      trace: 'Elation Skill',
      title: 'Signal Overflow: The Great Encore!',
      content: `Deals {{0}}% <b class="text-hsr-fire">Fire <b class="elation">Elation DMG</b></b> all enemies and deals <span class="text-desc">20</span> additional instance(s) of DMG. Each instance deals {{1}}% <b class="text-hsr-fire">Fire <b class="elation">Elation DMG</b></b> to one random enemy. Grants <span class="text-desc">2</span> <b class="text-desc">Thrill</b> point(s) to Sparxie, which can be used to offset Sparxie's Skill Point consumption. Consuming <b class="text-desc">Thrill</b> is considered as consuming Skill Points.`,
      value: [
        { base: 25, growth: 2.5, style: 'curved' },
        { base: 12.5, growth: 1.25, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.AOE,
      energy: 5,
      image: 'asset/traces/SkillIcon_1501_Elation.webp',
    },
    ult: {
      trace: 'Ultimate',
      title: `Party's Wildin' and Camera's Rollin'`,
      content: `Gains <span class="text-desc">2</span> <b class="text-orange-400">Punchline</b> point(s). Deals <b class="text-hsr-fire">Fire DMG</b> equal to (<span class="text-desc">0.6</span> × Elation + {{0}}%) of Sparxie's ATK to all enemies.`,
      value: [{ base: 30, growth: 2, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
      energy: 5,
      image: 'asset/traces/SkillIcon_1501_Ultra_on.webp',
    },
    talent: {
      trace: `Talent`,
      title: `Sleight of Sparx Hand`,
      content: `When Sparxie possesses <b class="text-blue">Certified Banger</b>:
      <br />Using Enhanced Basic ATK deals <b class="text-hsr-fire">Fire <b class="elation">Elation DMG</b></b> equal to {{0}}% to one designated enemy, and <b class="text-hsr-fire">Fire <b class="elation">Elation DMG</b></b> equal to {{1}}% to adjacent targets. Additionally, for every time <b>Engagement Farming</b> is triggered, the Enhanced Basic ATK deals <span class="text-desc">1</span> extra instance of <b class="text-hsr-fire">Fire <b class="elation">Elation DMG</b></b> equal to {{2}}% to <span class="text-desc">1</span> random attacked enemy target.
      <br />Using Ultimate deals <b class="text-hsr-fire">Fire <b class="elation">Elation DMG</b></b> equal to {{3}}% to all enemies.`,
      value: [
        { base: 20, growth: 2, style: 'curved' },
        { base: 10, growth: 1, style: 'curved' },
        { base: 10, growth: 1, style: 'curved' },
        { base: 24, growth: 2.4, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1501_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: 'Content Monetization',
      content: `After using the Technique, inflicts enemies within a set area with <b>Block</b> for <span class="text-desc">10</span> second(s). <b>Blocked</b> enemies cannot detect ally targets.
      <br />After entering combat via actively attacking a <b>Blocked</b> enemy, deals <b class="text-hsr-fire">Fire DMG</b> to all enemies equal to <span class="text-desc">50%</span> of Sparxie's ATK and recovers <span class="text-desc">2</span> Skill Point(s) for allies.`,
      tag: AbilityTag.IMPAIR,
      image: 'asset/traces/SkillIcon_1501_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Sweet! Punchline Signing',
      content: `For every <span class="text-desc">100</span> point(s) of Sparxie's ATK that exceeds <span class="text-desc">2,000</span>, increases this unit's Elation by <span class="text-desc">5%</span>, up to a maximum increase of <span class="text-desc">80%</span>.`,
      image: 'asset/traces/SkillIcon_1501_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Dazzling! Persona Kaleidoscope',
      content: `When there are <span class="text-desc">1/2/3</span> or more Elation characters in the team, using Sparxie's Ultimate will additionally gain <span class="text-desc">2/4/8</span> <b class="text-orange-400">Punchline(s)</b> and <span class="text-desc">1/1/4</span> <b class="text-desc">Thrill(s)</b>.`,
      image: 'asset/traces/SkillIcon_1501_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Frenzy! Palette of Truth and Lies',
      content: `For every <span class="text-desc">1</span> <b class="text-orange-400">Punchline</b> currently owned, increases all allies' CRIT DMG by <span class="text-desc">8%</span>, up to a max increase of <span class="text-desc">80%</span>.`,
      image: 'asset/traces/SkillIcon_1501_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: '#GoingViral #WhoIsShe',
      content: `When <b class="text-aha">Aha Instant</b> ends, gains an additional <span class="text-desc">5</span> <b class="text-orange-400">Punchline</b>. For every <span class="text-desc">1</span> <b class="text-orange-400">Punchline</b> owned, increases <b>All-Type RES PEN</b> for all allies by <span class="text-desc">1.5%</span>, up to a max increase of <span class="text-desc">15%</span>.`,
      image: 'asset/traces/SkillIcon_1501_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: '#AudienceKnows',
      content: `When <b class="text-aha">Aha Instant</b> ends, Sparxie gains <span class="text-desc">1</span> extra turn and <span class="text-desc">2</span> <b class="text-desc">Thrill</b>. Each time a <b class="text-desc">Thrill</b> is consumed, increases this unit's CRIT DMG by <span class="text-desc">10%</span>, lasting for <span class="text-desc">2</span> turn(s). This effect can stack up to <span class="text-desc">4</span> time(s).`,
      image: 'asset/traces/SkillIcon_1501_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: '#LinkUp #HeartSkip',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1501_BP.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: '#LockedIn #FaceCard',
      content: `When using Ultimate, additionally gains <span class="text-desc">5</span> <b class="text-orange-400">Punchline</b> point(s) and increases Elation by <span class="text-desc">36%</span> for <span class="text-desc">3</span> turn(s).`,
      image: 'asset/traces/SkillIcon_1501_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: '#HealingTheWorld #GoodVibesOnly',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1501_Ultra.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: '#BuiltDifferent #GoingExtinct',
      content: `Increases <b>All-Type RES PEN</b> by <span class="text-desc">20%</span>. For every <span class="text-desc">1</span> <b class="text-orange-400">Punchline</b> taken into account, the Elation Skill additionally deals <span class="text-desc">1</span> instance of, up to a max of <span class="text-desc">40</span> times.`,
      image: 'asset/traces/SkillIcon_1501_Rank6.webp',
    },
  }

  const content: IContent[] = [
    Banger,
    {
      type: 'number',
      id: 'engagement',
      text: `Engagement Farming`,
      ...talents.skill,
      show: true,
      default: 10,
      min: 0,
      max: 20,
      sync: true,
    },
    {
      type: 'number',
      id: 'sparxie_c2',
      text: `E2 CRIT DMG Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: 1,
      min: 0,
      max: 4,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'sparxie_c4',
      text: `E4 Elation Bonus`,
      ...talents.c4,
      show: c >= 4,
      default: true,
      duration: 3,
    },
  ]

  const teammateContent: IContent[] = []

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
      globalMod: GlobalModifiers,
    ) => {
      const base = _.cloneDeep(x)

      if (form.engagement) {
        base.BA_ALT = true
      }

      base.BASIC_SCALING = form.engagement
        ? [
            {
              name: 'Main Target',
              value: [
                { scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK },
                { scaling: calcScaling(0.1, 0.01, skill, 'curved') * form.engagement, multiplier: Stats.ATK },
              ],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
            {
              name: 'Adjacent',
              value: [
                { scaling: calcScaling(0.25, 0.05, basic, 'linear'), multiplier: Stats.ATK },
                { scaling: calcScaling(0.05, 0.005, skill, 'curved') * form.engagement, multiplier: Stats.ATK },
              ],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 5,
            },
            ...(form.banger
              ? [
                  {
                    name: 'Certified Banger Main DMG',
                    value: [{ scaling: calcScaling(0.2, 0.02, talent, 'curved'), multiplier: Stats.ELATION }],
                    element: Element.FIRE,
                    property: TalentProperty.ELATION,
                    type: TalentType.BA,
                    sum: true,
                    punchline: form.banger,
                  },
                  {
                    name: 'Certified Banger Adjacent DMG',
                    value: [{ scaling: calcScaling(0.1, 0.01, talent, 'curved'), multiplier: Stats.ELATION }],
                    element: Element.FIRE,
                    property: TalentProperty.ELATION,
                    type: TalentType.BA,
                    punchline: form.banger,
                  },
                  {
                    name: 'Certified Banger Bounce DMG',
                    value: [{ scaling: calcScaling(0.1, 0.01, talent, 'curved'), multiplier: Stats.ELATION }],
                    multiplier: form.engagement,
                    element: Element.FIRE,
                    property: TalentProperty.ELATION,
                    type: TalentType.BA,
                    sum: true,
                    punchline: form.banger,
                  },
                ]
              : []),
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.FIRE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
          ]
      base.SKILL_SCALING = []
      base.MEMO_SKILL_SCALING = [
        {
          name: 'Max Single Target DMG',
          value: [
            { scaling: calcScaling(0.25, 0.025, elation, 'curved'), multiplier: Stats.ELATION },
            {
              scaling:
                calcScaling(0.125, 0.0125, elation, 'curved') * (c >= 6 ? _.min([20 + globalMod.punchline, 40]) : 20),
              multiplier: Stats.ELATION,
            },
          ],
          element: Element.FIRE,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: 25 / 3,
          sum: true,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.25, 0.025, elation, 'curved'), multiplier: Stats.ELATION }],
          element: Element.FIRE,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: 20 / 3,
        },
        {
          name: 'DMG per Bounce',
          value: [{ scaling: calcScaling(0.125, 0.0125, elation, 'curved'), multiplier: Stats.ELATION }],
          element: Element.FIRE,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: 5 / 3,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.5, multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          sum: true,
        },
      ]

      if (a.a6 && globalMod.punchline) {
        base[Stats.CRIT_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: _.min([globalMod.punchline * 0.08, 0.8]),
        })
      }
      if (c >= 1 && globalMod.punchline) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: _.min([globalMod.punchline * 0.015, 0.15]),
        })
      }
      if (form.sparxie_c2) {
        base[Stats.CRIT_DMG].push({
          name: `Eidolon 2`,
          source: 'Self',
          value: form.sparxie_c2 * 0.1,
        })
      }
      if (form.sparxie_c4) {
        base[Stats.ELATION].push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.36,
        })
      }
      if (c >= 6) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.2,
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
      if (a.a6 && globalMod.punchline) {
        base[Stats.CRIT_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Sparxie',
          value: _.min([globalMod.punchline * 0.08, 0.8]),
        })
      }
      if (c >= 1 && globalMod.punchline) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 1`,
          source: 'Sparxie',
          value: _.min([globalMod.punchline * 0.015, 0.15]),
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
      base.CALLBACK.push(function P99(x) {
        const atk = x.getAtk(true)
        if (atk > 2000)
          x.Elation.push({
            name: `Ascension 2 Passive`,
            source: 'Self',
            value: _.min([((atk - 2000) / 100) * 0.05, 0.8]),
            base: `${_.floor(_.min([atk - 2000, 2000]), 1).toLocaleString()} ÷ 100`,
            multiplier: 0.05,
          })

        return x
      })
      globalCallback.push(function P99(_x, _d, _w, a) {
        a[index].ULT_SCALING = [
          {
            name: 'AoE',
            value: [
              { scaling: calcScaling(0.3, 0.02, ult, 'curved'), multiplier: Stats.ATK },
              { scaling: 0.6 * a[index].getTotalElation(), multiplier: Stats.ATK },
            ],
            element: Element.FIRE,
            property: TalentProperty.NORMAL,
            type: TalentType.ULT,
            break: 20,
            sum: true,
          },
          ...(form.banger
            ? [
                {
                  name: 'Certified Banger DMG',
                  value: [{ scaling: calcScaling(0.24, 0.024, talent, 'curved'), multiplier: Stats.ELATION }],
                  element: Element.FIRE,
                  property: TalentProperty.ELATION,
                  type: TalentType.ULT,
                  sum: true,
                  punchline: form.banger,
                },
              ]
            : []),
        ]
        return a
      })
      return base
    },
  }
}

export default Sparxie
