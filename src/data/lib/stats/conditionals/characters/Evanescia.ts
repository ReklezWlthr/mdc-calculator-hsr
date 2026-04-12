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

const Evanescia = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1505')

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: 'Syllabus: Pop Quiz',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Evanescia's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      energy: 20,
      image: 'asset/traces/SkillIcon_1505_Normal.webp',
    },
    skill: {
      trace: 'Skill',
      title: `Discipline: Final Verdict`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Evanescia's ATK to one designated enemy target and <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Evanescia's ATK to adjacent targets. Additionally gains <span class="text-desc">10</span> <b class="text-orange-400">Punchline</b> point(s).`,
      value: [
        { base: 150, growth: 15, style: 'curved' },
        { base: 75, growth: 7.5, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.AOE,
      sp: -1,
      energy: 30,
      image: 'asset/traces/SkillIcon_1505_BP.webp',
    },
    summon_skill: {
      participantId: 146,
      trace: 'Elation Skill',
      title: 'Scarlet: Elation or Execution',
      content: `Deals <b class="text-hsr-physical">Physical</b> <b class="elation">Elation DMG</b> equal to {{0}}% to all enemies and additionally gains <span class="text-desc">5</span> point(s) of <b class="text-blue">Certified Banger</b>.`,
      value: [{ base: 55, growth: 5.5, style: 'curved' }],
      level: elation,
      tag: AbilityTag.AOE,
      energy: 5,
      image: 'asset/traces/SkillIcon_1505_Elation.webp',
    },
    ult: {
      trace: 'Ultimate',
      title: `Swordsong: Absolution Denied`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Evanescia's ATK to all enemy targets, then deals <span class="text-desc">5</span> instances of DMG, with each instance of DMG dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Evanescia's ATK to one random enemy target.`,
      value: [
        { base: 80, growth: 8, style: 'curved' },
        { base: 72, growth: 6.8, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
      energy: 5,
      image: 'asset/traces/SkillIcon_1505_Ultra_on.webp',
    },
    talent: {
      trace: `Talent`,
      title: `Youth: Halcyon Evermore`,
      content: `Evanescia gains Elation equal to <span class="text-desc">20%</span> of her CRIT DMG. When Evanescia gains Energy, she simultaneously gains an equal amount of <b class="text-blue">Certified Banger</b>. When Evanescia gains <b class="text-blue">Certified Banger</b>, she simultaneously gains an equal amount of Energy. The <b class="text-blue">Certified Banger</b> gained through this method in a single instance cannot exceed <span class="text-desc">100</span> points.
      <br />After accumulating <span class="text-desc">240</span> Energy, she consumes <span class="text-desc">240</span> accumulated amount, and <b>Master Fox</b> launches <u>Follow-Up ATK</u>, dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{4}}% of Evanescia's ATK to all enemies and regenerating <span class="text-desc">10</span> Energy for Evanescia, with each instance of Energy regeneration gaining up to an accumulated total of <span class="text-desc">240</span> Energy. When Evanescia possesses <b class="text-blue">Certified Banger</b>:
      <br />Using her Skill deals <b class="text-hsr-physical">Physical</b> <b class="elation">Elation DMG</b> equal to {{0}}% to the attacked enemy target.
      <br />Using her Ultimate deals <b class="text-hsr-physical">Physical</b> <b class="elation">Elation DMG</b> equal to {{1}}% to all enemies and deals <b class="text-hsr-physical">Physical</b> <b class="elation">Elation DMG</b> equal to {{2}}% to the enemy target randomly attacked by Ultimate. When Ultimate deals <b class="elation">Elation DMG</b>, it takes into account <b class="text-blue">Certified Banger</b> at least equal to Max Energy.
      <br /><b>Master Fox</b>'s <u>Follow-Up ATK</u> deals <b class="text-hsr-physical">Physical</b> <b class="elation">Elation DMG</b> equal to {{3}}% of ATK to all enemies.`,
      value: [
        { base: 8, growth: 0.8, style: 'curved' },
        { base: 12, growth: 1.2, style: 'curved' },
        { base: 14, growth: 1.4, style: 'curved' },
        { base: 12.5, growth: 1.25, style: 'curved' },
        { base: 50, growth: 5, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1505_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: 'Petalfall: Floral Reminiscence',
      content: `Immediately attacks all enemies within a certain range. After entering combat, deals <b class="text-hsr-physical">Physical DMG</b> equal to <span class="text-desc">100%</span> of Evanescia's ATK to all enemies and gains <span class="text-desc">20</span> point(s) of <b class="text-blue">Certified Banger</b>.`,
      tag: AbilityTag.SUMMON,
      image: 'asset/traces/SkillIcon_1505_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Watch All Revels',
      content: `Increases Evanescia's CRIT Rate by <span class="text-desc">30%</span>. When there are <span class="text-desc">3 or more</span>/<span class="text-desc">2</span>/<span class="text-desc">1</span> enemy target(s) on the field, her Ultimate's bounce count increases by <span class="text-desc">1</span>/<span class="text-desc">2</span>/<span class="text-desc">4</span>. When a teammate with an Elation Skill Participant ID lower than Evanescia's gains <b class="text-blue">Certified Banger</b>, Evanescia converts <span class="text-desc">50%</span> of it into her own <b class="text-blue">Certified Banger</b>.`,
      image: 'asset/traces/SkillIcon_1505_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Weigh All Truths',
      content: `When <b>Master Fox</b> uses an attack, it additionally inflicts Vulnerability on the target, increasing the DMG they take by <span class="text-desc">12%</span> for <span class="text-desc">3</span> turn(s).`,
      image: 'asset/traces/SkillIcon_1505_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Best All Blooms',
      content: `When a teammate's <b class="text-blue">Certified Banger</b> ends, Evanescia converts <span class="text-desc">50%</span> of it into her own <b class="text-blue">Certified Banger</b>.`,
      image: 'asset/traces/SkillIcon_1505_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Home: A Prayer in Dance',
      content: `Increases <b>All-Type RES PEN</b> by <span class="text-desc">20%</span>. After <b>Master Fox</b> uses an attack, triggers <span class="text-desc">1</span> additional Elation Skill. Elation Skill grants this unit <span class="text-desc">10</span> additional <b class="text-blue">Certified Banger</b> point(s).`,
      image: 'asset/traces/SkillIcon_1505_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'Voyage: A Wish for Everbloom',
      content: `CRIT DMG increases by <span class="text-desc">36%</span>. triggering the Trace <b>Watch All Revels</b> or <b>Best All Blooms</b> and gaining <b class="text-blue">Certified Banger</b>, additionally gains <b class="text-blue">Certified Banger</b> equal to <span class="text-desc">50%</span>/<span class="text-desc">100%</span> of the <b class="text-blue">Certified Banger</b> gained this time.`,
      image: 'asset/traces/SkillIcon_1505_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Blade: A Feast on Evils`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1505_Ultra.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Meadow: A Ruin by Vice',
      content: `Evanescia's DMG dealt ignores <span class="text-desc">15%</span> of the enemy target's DEF.`,
      image: 'asset/traces/SkillIcon_1505_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Arcadia: A Glimpse of Fates',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1505_BP.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Maiden: A Step into Dreams',
      content: `The duration of Evanescia's <b class="text-blue">Certified Banger</b> increases by <span class="text-desc">1</span> turn(s). <b class="elation">Elation DMG</b> dealt by Evanescia merrymakes by <span class="text-desc">15%</span>. For every <span class="text-desc">100</span> points of <b class="text-blue">Certified Banger</b> possessed, it additionally merrymakes by <span class="text-desc">2%</span>, with a maximum of <span class="text-desc">1,000</span> points of <b class="text-blue">Certified Banger</b> taken into account. After using her Ultimate for the first time upon entering combat, Evanescia regenerates <span class="text-desc">120</span> Energy. This effect can trigger <span class="text-desc">1</span> time for every <span class="text-desc">4</span> Ultimates used.`,
      image: 'asset/traces/SkillIcon_1505_Rank6.webp',
    },
  }

  const content: IContent[] = [
    { ...Banger, default: 280 },
    {
      type: 'toggle',
      id: 'fox_vuln',
      text: `Master Fox Vulnerability`,
      ...talents.a4,
      show: a.a4,
      default: true,
      debuff: true,
      duration: 3,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'fox_vuln')]

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

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(1.5, 0.15, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.75, 0.075, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
      ]
      const bounce =
        globalMod.enemy_count === 1 ? 9 : globalMod.enemy_count === 2 ? 7 : globalMod.enemy_count >= 3 ? 6 : 5
      base.ULT_SCALING = [
        {
          name: 'Total Single-Target DMG',
          value: [
            { scaling: calcScaling(0.8, 0.08, ult, 'curved'), multiplier: Stats.ATK },
            { scaling: calcScaling(0.72, 0.048, ult, 'curved') * (a.a2 ? bounce : 5), multiplier: Stats.ATK },
          ],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 45,
          sum: true,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.44, 0.096, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
        },
        {
          name: 'DMG per Bounce',
          value: [{ scaling: calcScaling(0.96, 0.064, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 5,
        },
      ]
      base.MEMO_SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.55, 0.055, elation, 'curved'), multiplier: Stats.ELATION }],
          element: Element.PHYSICAL,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: 20,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.5, 0.05, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 10,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 1, multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          sum: true,
        },
      ]

      if (form.banger) {
        base.SKILL_SCALING.push({
          name: 'Certified Banger DMG',
          value: [{ scaling: calcScaling(0.08, 0.008, talent, 'curved'), multiplier: Stats.ELATION }],
          element: Element.PHYSICAL,
          property: TalentProperty.ELATION,
          type: TalentType.SKILL,
          sum: true,
          punchline: form.banger,
        })
        base.ULT_SCALING.push(
          {
            name: 'Total Certified Banger DMG',
            value: [
              { scaling: calcScaling(0.12, 0.012, talent, 'curved'), multiplier: Stats.ELATION },
              {
                scaling: calcScaling(0.14, 0.014, talent, 'curved') * (a.a2 ? bounce : 5),
                multiplier: Stats.ELATION,
              },
            ],
            element: Element.PHYSICAL,
            property: TalentProperty.ELATION,
            type: TalentType.ULT,
            sum: true,
            punchline: _.max([form.banger, 480]),
          },
          {
            name: 'AoE Certified Banger DMG',
            value: [{ scaling: calcScaling(0.12, 0.012, talent, 'curved'), multiplier: Stats.ELATION }],
            element: Element.PHYSICAL,
            property: TalentProperty.ELATION,
            type: TalentType.ULT,
            punchline: _.max([form.banger, 480]),
          },
          {
            name: 'Bounce Certified Banger DMG',
            value: [{ scaling: calcScaling(0.14, 0.014, talent, 'curved'), multiplier: Stats.ELATION }],
            element: Element.PHYSICAL,
            property: TalentProperty.ELATION,
            type: TalentType.ULT,
            punchline: _.max([form.banger, 480]),
          },
        )
        base.TALENT_SCALING.push({
          name: 'AoE Certified Banger DMG',
          value: [{ scaling: calcScaling(0.125, 0.0125, talent, 'curved'), multiplier: Stats.ELATION }],
          element: Element.PHYSICAL,
          property: TalentProperty.ELATION,
          type: TalentType.TALENT,
          sum: true,
        })
      }

      if (a.a2) {
        base[Stats.CRIT_RATE].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.3,
        })
      }
      if (form.fox_vuln) {
        base.VULNERABILITY.push({
          name: `Ascension 4 Passive`,
          source: 'Self',
          value: 0.12 * (form.fox_vuln || 1),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (c >= 2) {
        base[Stats.CRIT_DMG].push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.36,
        })
      }
      if (c >= 1) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.2,
        })
      }
      if (c >= 4) {
        base.DEF_PEN.push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.12,
        })
      }
      if (c >= 6) {
        base.ELATION_MERRYMAKE.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.15 + (_.min([form.banger || 0, 1000]) / 100) * 0.02,
          base: `${_.min([form.banger || 0, 1000]).toLocaleString()} ÷ 100`,
          multiplier: 0.02,
          flat: '15%',
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
      if (form.fox_vuln) {
        base.VULNERABILITY.push({
          name: `Ascension 4 Passive`,
          source: 'Evanescia',
          value: 0.12 * (form.fox_vuln || 1),
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
      globalCallback.push(function P999(_x, _d, _w, a) {
        const cdmg = a[index].getValue(Stats.CRIT_DMG)
        a[index][Stats.ELATION].push({
          name: `Talent`,
          source: 'Self',
          value: cdmg * 0.2,
          base: toPercentage(cdmg),
          multiplier: 0.2,
        })

        return a
      })

      return base
    },
  }
}

export default Evanescia
