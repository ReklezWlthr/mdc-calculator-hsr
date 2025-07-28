import { addDebuff, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Phainon = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: 'Stride to Deliverance',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Phainon's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    normal_alt: {
      trace: 'Enhanced Basic ATK',
      title: 'Creation: Bloodthorn Ferry',
      content: `Obtains <span class="text-desc">2</span> <b class="text-red">Scourge</b>, dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Khaslana's ATK to one designated enemy and <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Khaslana's ATK to enemies adjacent to it.`,
      value: [
        { base: 125, growth: 25, style: 'linear' },
        { base: 37.5, growth: 7.5, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
    },
    skill: {
      trace: 'Skill',
      title: 'Let There Be Light',
      content: `Gains <span class="text-desc">2</span> point(s) of <b class="text-desc">Coreflame</b>, dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Phainon's ATK to one designated enemy and <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Phainon's ATK to adjacent targets.`,
      value: [
        { base: 150, growth: 15, style: 'curved' },
        { base: 60, growth: 6, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
      sp: -1,
    },
    skill_alt: {
      trace: 'Enhanced Skill [1]',
      title: 'Calamity: Soulscorch Edict',
      content: `Gains <b class="text-red">Scourge</b> by an amount equal to the number of enemy targets present and <span class="text-desc">1</span> stack of <b class="text-amber-500">Soulscorch</b>, then causes all enemy targets to immediately take action.
      <br />When in the <b class="text-amber-500">Soulscorch</b> state, reduces DMG received by Khaslana by <span class="text-desc">75%</span> and gains <span class="text-desc">1</span> additional stack of <b class="text-amber-500">Soulscorch</b> after enemy targets attack or take action. Immediately launches a <u>Counter</u> after the aforementioned enemy targets take their actions, dealing <b class="text-hsr-physical">Physical DMG</b> to all enemies equal to {{0}}% of Khaslana's ATK, as well as additionally deals <span class="text-desc">4</span> instance(s) of DMG, each instance being <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Khaslana's ATK. Then, <b class="text-amber-500">Soulscorch</b> is dispelled. Each stack of <b class="text-amber-500">Soulscorch</b> increases this <u>Counter</u>'s DMG multiplier by <span class="text-desc">20%</span> of the original multiplier.
      <br />DMG dealt through this ability is considered as Skill DMG. If <b class="text-amber-500">Soulscorch</b> is still active at the start of Khaslana's extra turn, immediately launches <u>Counter</u>.`,
      value: [
        { base: 150, growth: 15, style: 'curved' },
        { base: 60, growth: 6, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.ENHANCE,
    },
    summon_skill: {
      trace: 'Enhanced Skill [2]',
      title: 'Foundation: Stardeath Verdict',
      content: `Dispels all debuffs from this unit, then deals <b class="text-hsr-physical">Physical DMG</b> up to {{0}}% of Khaslana's ATK.
      <br />In that, for every <span class="text-desc">1</span> <b class="text-red">Scourge</b> consumed, deals <span class="text-desc">4</span> instance(s) of DMG, each instance being <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Khaslana's ATK dealt to one random enemy. When consuming <span class="text-desc">4</span> <b class="text-red">Scourge</b>, additionally deals <b class="text-hsr-physical">Physical DMG</b> equal to {{2}}% of Khaslana's ATK, and this DMG is evenly distributed to all enemies.`,
      value: [
        { base: 585, growth: 58.5, style: 'curved' },
        { base: 22.5, growth: 2.25, style: 'curved' },
        { base: 225, growth: 22.5, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BOUNCE,
      image: 'asset/traces/SkillIcon_1408_BP03.png',
    },
    ult: {
      trace: 'Ultimate',
      title: 'He Who Bears the World Must Burn',
      content: `Transforms into Khaslana and deploys Territory while Transformed. Other teammates in the Territory becomes <b>Departed</b> and cannot take action, and all enemies gain <b class="text-hsr-physical">Physical</b> Weakness for the duration.
      <br />Khaslana does not have his own turn, but has <span class="text-desc">8</span> Khaslana's extra turn(s) with a fixed SPD equal to <span class="text-desc">60%</span> of Khaslana's base SPD. At the start of the final Khaslana's extra turn, immediately uses Final Hit and deals <b class="text-hsr-physical">Physical Ultimate DMG</b> equal to {{0}}% of Khaslana's ATK that is distributed evenly across all enemies.`,
      value: [{ base: 480, growth: 48, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: `Talent`,
      title: `Pyric Corpus`,
      content: `Phainon's Talent. When <b class="text-desc">Coreflame</b> reaches <span class="text-desc">12</span> point(s), Ultimate can be activated. After reaching the max limit, up to <span class="text-desc">3</span> excess point(s) can be accumulated. At the end of the Transformation, gains <b class="text-desc">Coreflames</b> based on the excess points.
      <br />When Phainon is the target of any target's ability, he gains <span class="text-desc">1</span> point of <b class="text-desc">Coreflame</b>. If the ability's user is Phainon's teammate, additionally increases Phainon's CRIT DMG by {{0}}% for <span class="text-desc">3</span> turn(s).`,
      value: [{ base: 15, growth: 1.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    summon_talent: {
      trace: `Enhanced Talent`,
      title: `Fate: Divine Vessel`,
      content: `Khaslana's Talent. When Transforming, gains <span class="text-desc">4</span> <b class="text-red">Scourge</b>. If it is during an ally target's turn, all buffs on that ally target will be extended by <span class="text-desc">1</span> turn and the current turn ends.
      <br />Khaslana is immune to Crowd Control debuffs and has <span class="text-desc">1</span> Enhanced Basic ATK and <span class="text-desc">2</span> Enhanced Skills, but cannot use Ultimate. During his Transformation, increases ATK by {{0}}% and Max HP by {{1}}%. He will not be knocked down upon taking a killing blow, but will restore HP equal to <span class="text-desc">25%</span> of Max HP and immediately trigger Final Hit. For every <span class="text-desc">1</span> remaining extra turn Khaslana has, the Final Hit's DMG multiplier reduces by <span class="text-desc">12.5%</span> of its original multiplier.
      <br />When the Transformation ends, increases all allies' SPD by <span class="text-desc">15%</span>, lasting for <span class="text-desc">1</span> turn.`,
      value: [
        { base: 40, growth: 4, style: 'curved' },
        { base: 135, growth: 13.5, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1408_Passive.png',
    },
    technique: {
      trace: 'Technique',
      title: 'Beginning of the End',
      content: `When Phainon is in the team, increases Max Technique Points by <span class="text-desc">3</span>.
      <br />When actively using this Technique, by consuming <span class="text-desc">2</span> Technique Points to immediately attack all enemies within a certain range. After entering battle, regenerates <span class="text-desc">25</span> Energy for allies, gains <span class="text-desc">2</span> <b class="text-red">Scourge</b> and <span class="text-desc">1</span> Skill Point(s). Deals <b class="text-hsr-physical">Physical DMG</b> equal to <span class="text-desc">200%</span> of Phainon's ATK to all enemies at the start of each wave.
      <br />If attacking a normal enemy, immediately defeats them without entering combat. When not hitting enemies, no Technique Points are consumed.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'March to Oblivion',
      content: `At the start of the battle, gains <span class="text-desc">1</span> point(s) of <b class="text-desc">Coreflame</b>. When the transformation ends, gains <span class="text-desc">3</span> point(s) of <b class="text-desc">Coreflame</b>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Bide in Flames',
      content: `When receiving healing effects or Shields from a teammate, increases DMG dealt by <span class="text-desc">45%</span> for <span class="text-desc">4</span> turn(s). This effect cannot be triggered repeatedly within one turn.
      <br />When receiving Energy regeneration ability effects provided by teammates, gains <span class="text-desc">1</span> point(s) of <b class="text-desc">Coreflame</b>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Shine with Valor',
      content: `When entering battle or when transformation ends, increases ATK by <span class="text-desc">50%</span>. This effect can stack up to <span class="text-desc">2</span> time(s).`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Flame and Light, Shadow of Good and Evil',
      content: `For every enemy target defeated within <span class="text-desc">1</span> Transformation, the inheritance ratio of Khaslana's extra turn's SPD further increases by <span class="text-desc">1.5%</span>, up to <span class="text-desc">84%</span>.
      <br />When using Ultimate, CRIT DMG increases by <span class="text-desc">50%</span>, lasting for <span class="text-desc">3</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'Heaven and Earth, Illusions of the Realm',
      content: `Khaslana's <b class="text-hsr-physical">Physical RES PEN</b> increases by <span class="text-desc">20%</span>. When consuming <span class="text-desc">4</span> <b class="text-red">Scourge</b> to use <b>Foundation: Stardeath Verdict</b>, gains <span class="text-desc">1</span> extra turn.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Fathomless Stillness, Buried into Irontomb',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Countless Titans, Their Faces Lost to Time',
      content: `When using <b>Calamity: Soulscorch Edict</b>, additionally gains <span class="text-desc">4</span> stack(s) of <b class="text-amber-500">Soulscorch</b>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Thirty Million Cycles, Descending into Doom',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Ascent of Eternity Moribundly Fades',
      content: `The number of Overflow point for <b class="text-desc">Coreflame</b> no longer has an upper limit. When battle starts, gains <span class="text-desc">6</span> <b class="text-desc">Coreflame(s)</b>. After using <b>Foundation: Stardeath Verdict</b>'s attack, additionally deals <b class="text-true">True DMG</b> equal to <span class="text-desc">36%</span> of the total DMG dealt in this attack to the enemy with the highest HP.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'phainon_transform',
      text: `Transformation - Khaslana`,
      ...talents.ult,
      show: true,
      default: true,
      sync: true,
    },
    {
      type: 'number',
      id: 'soulrending_blaze',
      text: `Soulscorch`,
      ...talents.skill_alt,
      show: true,
      default: c >= 4 ? 5 : 1,
      min: 0,
    },
    {
      type: 'number',
      id: 'scourge',
      text: `Scourge`,
      ...talents.summon_skill,
      show: true,
      default: 4,
      min: 0,
      max: 4,
    },
    {
      type: 'number',
      id: 'phainon_enemy',
      text: `Enemies on Field`,
      content:
        'Used in calculating the DMG distribution from <b>Foundation: Stardeath Verdict</b> and <b>He Who Bears the World Must Burn</b>.',
      title: 'Enemies on Field',
      trace: 'Utility',
      show: true,
      default: 1,
      min: 1,
    },
    {
      type: 'toggle',
      id: 'phainon_talent',
      text: `Talent CRIT DMG Bonus`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'phainon_talent_spd',
      text: `Talent SPD Bonus`,
      ...talents.summon_talent,
      show: true,
      default: false,
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'phainon_a4',
      text: `A4 DMG Bonus`,
      ...talents.a4,
      show: a.a4,
      default: true,
      duration: 4,
    },
    {
      type: 'number',
      id: 'phainon_a6',
      text: `A6 ATK Bonus`,
      ...talents.a6,
      show: a.a6,
      default: 1,
      min: 1,
      max: 2,
    },
    {
      type: 'toggle',
      id: 'phainon_e1',
      text: `E1 CRIT DMG`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      duration: 3,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'phainon_talent_spd')]

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
      weakness: Element[]
    ) => {
      const base = _.cloneDeep(x)

      if (form.phainon_transform) {
        base.BA_ALT = true
        base.SKILL_ALT = true
      }

      base.BASIC_SCALING = form.phainon_transform
        ? [
            {
              name: 'Main Target',
              value: [{ scaling: calcScaling(1.25, 0.25, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 30,
              sum: true,
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.375, 0.075, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 20,
            },
          ]
        : [
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
      base.SKILL_SCALING = form.phainon_transform
        ? [
            {
              name: 'Total Single Target DMG',
              value: [
                { scaling: calcScaling(0.2, 0.02, skill, 'curved'), multiplier: Stats.ATK },
                ..._.map(Array(4), (_v) => ({
                  scaling: calcScaling(0.15, 0.015, skill, 'curved'),
                  multiplier: Stats.ATK,
                })),
              ],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              multiplier: 1 + (form.soulrending_blaze || 0) * 0.2,
              break: 45,
              sum: true,
            },
            {
              name: 'AoE',
              value: [{ scaling: calcScaling(0.2, 0.02, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              multiplier: 1 + (form.soulrending_blaze || 0) * 0.2,
              break: 5,
            },
            {
              name: 'DMG per Bounce',
              value: [{ scaling: calcScaling(0.15, 0.015, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              multiplier: 1 + (form.soulrending_blaze || 0) * 0.2,
              break: 10,
            },
          ]
        : [
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
              value: [{ scaling: calcScaling(0.6, 0.06, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 10,
            },
          ]
      base.MEMO_SKILL_SCALING =
        form.phainon_transform && form.scourge
          ? [
              {
                name: 'Max Single Target DMG',
                value: [
                  {
                    scaling:
                      (form.scourge >= 4 ? calcScaling(2.25, 0.225, skill, 'curved') : 0) +
                      calcScaling(0.225, 0.0225, skill, 'curved') * 4 * form.scourge,
                    multiplier: Stats.ATK,
                  },
                ],
                element: Element.PHYSICAL,
                property: TalentProperty.NORMAL,
                type: TalentType.SKILL,
                break: (10 / 3) * 4 * form.scourge + 20,
                sum: true,
              },
              {
                name: 'AoE (Distributed)',
                value: [{ scaling: calcScaling(2.25, 0.225, skill, 'curved'), multiplier: Stats.ATK }],
                element: Element.PHYSICAL,
                property: TalentProperty.NORMAL,
                type: TalentType.SKILL,
                break: 20,
                multiplier: 1 / form.phainon_enemy,
              },
              {
                name: 'DMG per Bounce',
                value: [{ scaling: calcScaling(0.225, 0.0225, skill, 'curved'), multiplier: Stats.ATK }],
                element: Element.PHYSICAL,
                property: TalentProperty.NORMAL,
                type: TalentType.SKILL,
                break: 10 / 3,
              },
            ]
          : []
      base.ULT_SCALING = [
        {
          name: 'AoE (Distributed)',
          value: [{ scaling: calcScaling(4.8, 0.48, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          multiplier: 1 / form.phainon_enemy,
          sum: true,
        },
      ]
      base.MEMO_TALENT_SCALING = [
        {
          name: 'Revive Healing',
          value: [{ scaling: 0.25, multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 2, multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          sum: true,
        },
      ]

      if (form.phainon_transform) {
        base[Stats.P_ATK].push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.4, 0.04, talent, 'curved'),
        })
        base[Stats.P_HP].push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(1.35, 0.135, talent, 'curved'),
        })
        if (c >= 2) {
          base.PHYSICAL_RES_PEN.push({
            name: `Talent`,
            source: 'Self',
            value: 0.2,
          })
        }
      }

      if (form.phainon_talent) {
        base[Stats.CRIT_DMG].push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.15, 0.015, talent, 'curved'),
        })
      }
      if (form.phainon_talent_spd) {
        base[Stats.P_SPD].push({
          name: `Talent`,
          source: 'Self',
          value: 0.15,
        })
      }
      if (form.phainon_a4) {
        base[Stats.ALL_DMG].push({
          name: `Ascension 4 Passive`,
          source: 'Self',
          value: 0.45,
        })
      }
      if (form.phainon_a6) {
        base[Stats.P_ATK].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.5 * form.phainon_a6,
        })
      }
      if (form.phainon_e1) {
        base[Stats.CRIT_DMG].push({
          name: `Eidolon 1`,
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
      debuffs: { type: DebuffTypes; count: number }[]
    ) => {
      if (form.phainon_talent_spd) {
        base[Stats.P_SPD].push({
          name: `Talent`,
          source: 'Phainon',
          value: 0.15,
        })
      }

      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      team: StatsObject[],
      allForm: Record<string, any>[]
    ) => {
      if (c >= 6) {
        _.forEach([base.MEMO_SKILL_SCALING], (s) => {
          _.forEach(s, (ss) => {
            if (!_.includes([TalentProperty.HEAL, TalentProperty.SHIELD, TalentProperty.TRUE], ss.property)) {
              s.push({
                ...ss,
                name: `${ss.name} - Phainon E6`,
                multiplier: (ss.multiplier || 1) * 0.36,
                property: TalentProperty.TRUE,
                break: ss.break * 0.36,
              })
            }
          })
        })
      }
      return base
    },
  }
}

export default Phainon
