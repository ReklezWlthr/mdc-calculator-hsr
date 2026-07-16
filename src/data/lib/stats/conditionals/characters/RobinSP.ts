import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject, StatsObjectKeys } from '../../baseConstant'
import {
  AbilityTag,
  Element,
  GlobalModifiers,
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
import { checkBuffExist } from '../../../../../core/utils/finder'
import { CallbackType } from '@src/domain/stats'

const RobinSP = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
    memo_skill: c >= 5 ? 1 : 0,
    memo_talent: c >= 3 ? 1 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent
  const memo_skill = t.memo_skill + upgrade.memo_skill
  const memo_talent = t.memo_talent + upgrade.memo_talent

  const index = _.findIndex(team, (item) => item?.cId === '1512')

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: 'Soundwaves, Tuning the Ocean Breeze',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Robin • Summeretto's Max HP to one enemy..`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      energy: 20,
      image: 'asset/traces/SkillIcon_1512_Normal.webp',
    },
    skill: {
      trace: 'Skill',
      title: 'Midsummer Is the Musician of the Soul',
      content: `Summons the memosprite <b>Summer Songbirds</b> Bessie. If <b>Summer Songbirds</b> is already on the field, restores its HP by an amount equal to {{0}}% of <b>Summer Songbirds</b>'s Max HP, and gains <span class="text-desc">6</span> <b class="text-blue">Vibes</b>.`,
      value: [{ base: 50, growth: 5, style: 'curved' }],
      level: skill,
      tag: AbilityTag.SUMMON,
      sp: -1,
      image: 'asset/traces/SkillIcon_1512_BP.webp',
    },
    summon_skill: {
      energy: 20,
      trace: 'Memosprite Skill',
      title: 'Twittering Quartet',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> to all enemies equal to {{0}}% of Summer Songbirds's Max HP.`,
      value: [{ base: 75, growth: 15, style: 'linear' }],
      level: memo_skill,
      tag: AbilityTag.AOE,
      image: 'asset/traces/SkillIcon_11512_Servant.webp',
    },
    ult: {
      trace: 'Ultimate',
      title: `Leap into the Ocean Blue Rhapsody`,
      content: `Advances the action of one designated ally unit (excluding Robin • Summeretto) by <span class="text-desc">100%</span> and regenerates a fixed amount of Energy equal to {{0}}% of their Max Energy. Then, this character gains the <b class="text-desc">Special Guest</b> effect. After the character with <b class="text-desc">Special Guest</b> attacks, Robin additionally gains <span class="text-desc">1</span> point of <b class="text-blue">Vibes</b>. This character and her memosprite cannot advance the actions of other targets. This effect lasts for <span class="text-desc">2</span> turn(s), and its duration decreases by <span class="text-desc">1</span> at the start of this character's turn.`,
      value: [{ base: 12, growth: 0.8, style: 'curved' }],
      level: ult,
      tag: AbilityTag.ENHANCE,
      energy: 5,
      image: 'asset/traces/SkillIcon_1512_Ultra_on.webp',
    },
    talent: {
      trace: 'Talent',
      title: `Cruising the Boundless Skies`,
      content: `The memosprite <b>Summer Songbirds</b> has an initial Max HP equal to <span class="text-desc">70%</span> of Robin • Summeretto's Max HP and an initial SPD equal to <span class="text-desc">180%</span> of Robin • Summeretto's SPD. When an ally target uses an attack, or when providing healing effect or Shield for the first time in any target's turn, Robin • Summeretto gains <span class="text-desc">1</span> <b class="text-blue">Vibes</b>, up to a max of <span class="text-desc">50</span>. While <b>Summer Songbirds</b> Bessie is on the field, if Robin's <b class="text-blue">Vibes</b> is <span class="text-desc">6</span> or more, immediately summons the <b>Summer Songbird</b> Drummie, and if <b class="text-blue">Vibes</b> is <span class="text-desc">12</span> or more, immediately summons the <b>Summer Songbird</b> Paddie. When all <b>Summer Songbirds</b> take the stage, dispels all Crowd Control debuffs that Robin • Summeretto and the <b>Summer Songbirds</b> are under, enter the <b class="text-orange-400">Fever</b> state and deploy a Zone. When ally targets deal DMG inside the Zone, they ignore {{0}}% plus <b class="text-blue">Vibes</b> × 0.5% of enemy targets' DEF.
      <br />While in the <b class="text-orange-400">Fever</b> state, Robin • Summeretto and the <b>Summer Songbirds</b> are immune to Crowd Control debuffs, and Robin • Summeretto will not enter her turns or take action until the <b class="text-orange-400">Fever</b> state ends.`,
      value: [{ base: 10, growth: 0.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1512_Passive.webp',
    },
    summon_talent: {
      trace: 'Memosprite Talent [1]',
      title: `Fluttering Harmony`,
      content: `While in the <b class="text-orange-400">Fever</b> state, <b>Summer Songbirds</b> and a countdown will appear on the action bar, increasing the DMG dealt by Robin • Summeretto and this unit by {{0}}% + <b class="text-blue">Vibes</b> × {{1}}%. When <b>Summer Songbirds</b>' turn starts, they use the Memosprite Skill. The countdown has an initial SPD of <span class="text-desc">140</span>. When their turn starts, <span class="text-desc">50%</span> of current <b class="text-blue">Vibes</b> (a minimum of <span class="text-desc">12</span> points) gets deducted. When <b class="text-blue">Vibes</b> reach <span class="text-desc">0</span>, the <b>Summer Songbirds</b> disappear and Robin • Summeretto exits the <b class="text-orange-400">Fever</b> state. While <b>Summer Songbirds</b> are on the field, increases the DMG taken by all enemies by {{2}}%/{{3}}%/{{4}}% respectively based on the number of members present.`,
      value: [
        { base: 30, growth: 6, style: 'linear' },
        { base: 1, growth: 0.2, style: 'linear' },
        { base: 5, growth: 1, style: 'linear' },
        { base: 7.5, growth: 1.5, style: 'linear' },
        { base: 10, growth: 2, style: 'linear' },
      ],
      level: memo_talent,
      tag: AbilityTag.SUPPORT,
      image: 'asset/traces/SkillIcon_11512_ServantPassive.webp',
    },
    summon_talent_2: {
      trace: 'Memosprite Talent [2]',
      title: `Nestle in the Heartbeat of the Sea`,
      content: `When <b>Summer Songbirds</b> are summoned, regenerates <span class="text-desc">20</span> Energy for Robin • Summeretto.`,
      value: [],
      level: memo_talent,
      tag: AbilityTag.SUPPORT,
      image: 'asset/traces/SkillIcon_11512_ServantPassive.webp',
    },
    summon_talent_3: {
      trace: 'Memosprite Talent [3]',
      title: `Ride the Summer Night Breeze`,
      content: `When <b>Summer Songbirds</b> disappear, Robin • Summeretto's action advances by <span class="text-desc">50%</span>.`,
      value: [],
      level: memo_talent,
      tag: AbilityTag.SUPPORT,
      image: 'asset/traces/SkillIcon_11512_ServantPassive.webp',
    },
    technique: {
      trace: 'Technique',
      title: 'We Form A Melody',
      content: `After using Technique, at the start of the next combat, immediately gains <span class="text-desc">6</span> <b class="text-blue">Vibes</b>, and grants all allies a <span class="text-desc">30%</span> DMG Boost for <span class="text-desc">2</span> turn(s).`,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1512_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Deviated Chord`,
      content: `When an ally target causes Robin • Summeretto to gain <b class="text-blue">Vibes</b>, if their ATK is higher than Robin • Summeretto's, increases that target's ATK by an amount equal to (<span class="text-desc">16%</span> + <b class="text-blue">Vibes</b> × <span class="text-desc">0.4%</span>) of Robin • Summeretto's Max HP. Otherwise, increases that target's CRIT DMG by <span class="text-desc">40%</span> + <b class="text-blue">Vibes</b> × <span class="text-desc">1%</span>. Lasts for <span class="text-desc">2</span> turn(s).`,
      image: 'asset/traces/SkillIcon_1512_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Improvised Blues`,
      content: `When Robin • Summeretto or <b>Summer Songbirds</b> receive healing or a Shield provided by teammates, they gain <span class="text-desc">12</span> stack(s) of <b class="text-heal">Groove</b>, up to a max of <span class="text-desc">12</span> stack(s). The first time Robin • Summeretto gains <b class="text-blue">Vibes</b> each turn, if she has <b class="text-heal">Groove</b>, she consumes <span class="text-desc">1</span> stack of <b class="text-heal">Groove</b> and regenerates a fixed amount of <span class="text-desc">3</span> Energy.`,
      image: 'asset/traces/SkillIcon_1512_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Reconstructed Harmony`,
      content: `Increases the CRIT Rate of Robin • Summeretto and <b>Summer Songbirds</b> by <span class="text-desc">50%</span>.`,
      image: 'asset/traces/SkillIcon_1512_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Stray Birds of Summer`,
      content: `Robin • Summeretto's Max <b class="text-blue">Vibes</b> increases by <span class="text-desc">20</span>. The first time an ally target uses a Skill that causes Robin • Summeretto to gain <b class="text-blue">Vibes</b> each turn, she gains an additional <span class="text-desc">2</span> points.`,
      image: 'asset/traces/SkillIcon_1512_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Heart Like Still Waters`,
      content: `<b>Summer Songbirds</b> records <span class="text-desc">100%</span> of the non-<b class="text-true">True DMG</b> dealt by ally targets. When using the Memosprite Skill, it additionally deals <b class="text-true">True DMG</b> equal to <span class="text-desc">11%</span> of the total DMG plus current <b class="text-blue">Vibes</b> stacks × <span class="text-desc">0.1%</span> to the enemy target with the highest HP, then clears <span class="text-desc">50%</span> of the recorded value.`,
      image: 'asset/traces/SkillIcon_1512_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Gleanings of Lost Echoes`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Memosprite Talent Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
      image: 'asset/traces/SkillIcon_1512_BP.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Hearing the Chord Variations',
      content: `Upon entering the <b class="text-orange-400">Fever</b> state, immediately gains <span class="text-desc">12</span> <b class="text-blue">Vibes</b>, and the SPD of <b>Summer Songbirds</b> increases by <span class="text-desc">20%</span> plus current <b class="text-blue">Vibes</b> × <span class="text-desc">0.5%</span>.`,
      image: 'asset/traces/SkillIcon_1512_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Together, Toward a New Dawn`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Memosprite Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
      image: 'asset/traces/SkillIcon_1512_Ultra.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'To Sing an Aria Untitled',
      content: `Ally targets' <b>All-Type RES PEN</b> increases by <span class="text-desc">20%</span>. The Memosprite Skill's DMG multiplier increases by <span class="text-desc">100%</span> of the original multiplier. When entering the <b class="text-orange-400">Fever</b> state, CRIT DMG for Robin • Summeretto and <b>Summer Songbirds</b> increases by <span class="text-desc">200%</span>.`,
      image: 'asset/traces/SkillIcon_1512_Rank6.webp',
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'vibes',
      text: `Vibes`,
      ...talents.talent,
      show: true,
      default: 12,
      min: 0,
      max: c >= 1 ? 70 : 50,
    },
    {
      type: 'toggle',
      id: 'fever',
      text: `Fever`,
      ...talents.talent,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'robin_sp_tech',
      text: `Technique DMG Bonus`,
      ...talents.technique,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'robin_sp_a2',
      text: `A2 ATK or CRIT DMG Bonus`,
      ...talents.a2,
      show: a.a2,
      default: true,
    },
    {
      type: 'number',
      id: 'robin_sp_c2',
      text: `E2 Non-True DMG Tally`,
      ...talents.c2,
      show: c >= 2,
      default: 10000,
      min: 0,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'vibes'),
    findContentById(content, 'fever'),
    findContentById(content, 'robin_sp_tech'),
  ]

  const allyContent: IContent[] = [findContentById(content, 'robin_sp_a2')]

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
      base.SUMMON_STATS = _.cloneDeep({
        ...x,
        BASE_ATK: x.BASE_ATK,
        BASE_DEF: x.BASE_DEF,
        BASE_SPD: 1.8 * x.BASE_SPD,
        ELEMENT: Element.NONE,
        BASE_HP: x.BASE_HP * 0.7,
        [Stats.HP]: _.map(x[Stats.HP], (item) => ({ ...item, value: item.value * 0.7 })),
        [Stats.P_HP]: x[Stats.P_HP],
        [Stats.P_SPD]: x[Stats.P_SPD],
        [Stats.SPD]: _.map(x[Stats.SPD], (item) => ({ ...item, value: item.value * 1.8 })),
        SUMMON_ID: '1512',
        NAME: 'Summer Songbirds',
        MAX_ENERGY: 0,
      })

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.25, 0.05, basic, 'linear'), multiplier: Stats.HP }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = []
      base.MEMO_SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.75, 0.15, memo_skill, 'linear'), multiplier: Stats.HP }],
          multiplier: c >= 6 ? 2 : 1,
          element: Element.WIND,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 10,
          sum: true,
        },
      ]
      base.ULT_SCALING = []
      base.TECHNIQUE_SCALING = []

      base.COUNTDOWN = 140

      if (form.robin_sp_tech) {
        base[Stats.ALL_DMG].push({
          name: `Technique`,
          source: 'Self',
          value: 0.3,
        })
      }

      if (a.a6) {
        base[Stats.CRIT_RATE].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.5,
        })
        base.SUMMON_STATS[Stats.CRIT_RATE].push({
          name: `Ascension 6 Passive`,
          source: 'Robin • Summeretto',
          value: 0.5,
        })
      }

      base.VULNERABILITY.push({
        name: `Memosprite Passive`,
        source: 'Summer Songbirds',
        value:
          form.vibes >= 12
            ? calcScaling(0.1, 0.02, memo_talent, 'linear')
            : form.vibes >= 6
              ? calcScaling(0.075, 0.015, memo_talent, 'linear')
              : calcScaling(0.05, 0.01, memo_talent, 'linear'),
      })
      base.SUMMON_STATS.VULNERABILITY.push({
        name: `Memosprite Passive`,
        source: 'Self',
        value:
          form.vibes >= 12
            ? calcScaling(0.1, 0.02, memo_talent, 'linear')
            : form.vibes >= 6
              ? calcScaling(0.075, 0.015, memo_talent, 'linear')
              : calcScaling(0.05, 0.01, memo_talent, 'linear'),
      })
      addDebuff(debuffs, DebuffTypes.OTHER)

      if (c >= 4) {
        base.SUMMON_STATS[Stats.P_SPD].push({
          name: `Eidolon 4`,
          source: 'Robin • Summeretto',
          value: 0.2 + (0.005 * form.vibes || 0),
          flat: '20%',
          base: form.vibes || 0,
          multiplier: 0.005,
        })
      }

      if (form.fever) {
        base.DEF_PEN.push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.1, 0.005, talent, 'curved') + (0.005 * form.vibes || 0),
          flat: toPercentage(calcScaling(0.1, 0.005, talent, 'curved')),
          multiplier: 0.005,
          base: form.vibes || 0,
        })
        base.SUMMON_STATS.DEF_PEN.push({
          name: `Talent`,
          source: 'Robin • Summeretto',
          value: calcScaling(0.1, 0.005, talent, 'curved') + (0.005 * form.vibes || 0),
          flat: toPercentage(calcScaling(0.1, 0.005, talent, 'curved')),
          multiplier: 0.005,
          base: form.vibes || 0,
        })

        base[Stats.ALL_DMG].push({
          name: `Memosprite Passive`,
          source: 'Summer Songbirds',
          value:
            calcScaling(0.3, 0.06, memo_talent, 'linear') +
            (calcScaling(0.01, 0.002, memo_talent, 'linear') * form.vibes || 0),
          flat: toPercentage(calcScaling(0.3, 0.06, memo_talent, 'linear')),
          multiplier: calcScaling(0.01, 0.002, memo_talent, 'linear'),
          base: form.vibes || 0,
        })
        base.SUMMON_STATS[Stats.ALL_DMG].push({
          name: `Memosprite Passive`,
          source: 'Self',
          value:
            calcScaling(0.3, 0.06, memo_talent, 'linear') +
            (calcScaling(0.01, 0.002, memo_talent, 'linear') * form.vibes || 0),
          flat: toPercentage(calcScaling(0.3, 0.06, memo_talent, 'linear')),
          multiplier: calcScaling(0.01, 0.002, memo_talent, 'linear'),
          base: form.vibes || 0,
        })

        if (c >= 6) {
          base[Stats.CRIT_DMG].push({
            name: `Eidolon 6`,
            source: 'Self',
            value: 2,
          })
          base.SUMMON_STATS[Stats.CRIT_DMG].push({
            name: `Eidolon 6`,
            source: 'Robin • Summeretto',
            value: 2,
          })
        }
      }

      if (form.robin_sp_c2) {
        base.MEMO_SKILL_SCALING.push({
          name: 'E2 True DMG',
          value: [],
          flat: form.robin_sp_c2,
          multiplier: 0.11 + 0.001 * form.vibes || 0,
          element: Element.NONE,
          property: TalentProperty.TRUE,
          type: TalentType.NONE,
          sum: true,
          trueRaw: true,
        })
      }

      if (c >= 6) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.2,
        })
        base.SUMMON_STATS.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Robin • Summeretto',
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
      if (form.robin_sp_tech) {
        base[Stats.ALL_DMG].push({
          name: `Technique`,
          source: 'Robin • Summeretto',
          value: 0.3,
        })
      }

      if (form.fever) {
        base.DEF_PEN.push({
          name: `Talent`,
          source: 'Robin • Summeretto',
          value: calcScaling(0.1, 0.005, talent, 'curved') + (0.005 * form.vibes || 0),
          flat: toPercentage(calcScaling(0.1, 0.005, talent, 'curved')),
          multiplier: 0.005,
          base: form.vibes || 0,
        })
      }

      base.VULNERABILITY.push({
        name: `Memosprite Passive`,
        source: 'Summer Songbirds',
        value:
          form.vibes >= 12
            ? calcScaling(0.1, 0.02, memo_talent, 'linear')
            : form.vibes >= 6
              ? calcScaling(0.075, 0.015, memo_talent, 'linear')
              : calcScaling(0.05, 0.01, memo_talent, 'linear'),
      })

      if (c >= 6) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Robin • Summeretto',
          value: 0.2,
        })
      }

      return base
    },
    postCompute: (
      x: StatsObject,
      form: Record<string, any>,
      _all: StatsObject[],
      allForm: Record<string, any>[],
      debuffs: {
        type: DebuffTypes
        count: number
      }[],
      weakness: Element[],
      broken: boolean,
      globalCallback: CallbackType[],
    ) => {
      if (x.SUMMON_STATS) {
        globalCallback.push(function P9999(_x, _d, _w, all) {
          const atk = all[index].getAtk()
          const hp = all[index].getHP()
          _.forEach(all, (t, i) => {
            if (allForm[i].robin_sp_a2) {
              if (t.getAtk() > atk) {
                t.X_ATK.push({
                  name: `Ascension 2 Passive`,
                  source: index === i ? 'Self' : 'Robin • Summeretto',
                  value: hp * (0.16 + 0.004 * (form.vibes || 0)),
                  base: hp,
                  multiplier: 0.16 + 0.004 * (form.vibes || 0),
                })
              } else {
                t.X_CRIT_DMG.push({
                  name: `Ascension 2 Passive`,
                  source: index === i ? 'Self' : 'Robin • Summeretto',
                  value: 0.4 + 0.001 * (form.vibes || 0),
                  base: form.vibes || 0,
                  multiplier: 0.01,
                  flat: '40%',
                })
              }
            }
            if (allForm[i].memo?.robin_sp_a2 && t.SUMMON_STATS) {
              if (t.getAtk() > atk) {
                t.SUMMON_STATS.X_ATK.push({
                  name: `Ascension 2 Passive`,
                  source: 'Robin • Summeretto',
                  value: hp * (0.16 + 0.004 * (form.vibes || 0)),
                  base: hp,
                  multiplier: 0.16 + 0.004 * (form.vibes || 0),
                })
              } else {
                t.SUMMON_STATS.X_CRIT_DMG.push({
                  name: `Ascension 2 Passive`,
                  source: 'Robin • Summeretto',
                  value: 0.4 + 0.001 * (form.vibes || 0),
                  base: form.vibes || 0,
                  multiplier: 0.01,
                  flat: '40%',
                })
              }
            }
          })

          return all
        })
      }

      return x
    },
  }
}

export default RobinSP
