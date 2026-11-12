import {
  addDebuff,
  checkBuffExist,
  countDebuff,
  countDot,
  findCharacter,
  findContentById,
} from '@src/core/utils/finder'
import _, { add, chain } from 'lodash'
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
import { CallbackType } from '@src/domain/stats'
import { teamOptionGenerator } from '@src/core/utils/data_format'

const Astra = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const index = _.findIndex(team, (item) => item?.cId === '1515')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Pirouette Pianissimo`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Astra Yao's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      image: 'asset/traces/SkillIcon_1515_Normal.webp',
    },
    normal_alt1: {
      energy: 30,
      trace: 'Enhanced Basic ATK [1]',
      title: `Cadenza Cascade`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Astra Yao's ATK to all enemies.`,
      value: [{ base: 80, growth: 16, style: 'linear' }],
      level: basic,
      tag: AbilityTag.AOE,
      sp: 1,
      image: 'asset/traces/SkillIcon_1515_Normal2.webp',
    },
    normal_alt2: {
      energy: 10,
      trace: 'Enhanced Basic ATK [2]',
      title: `Minuet Pianissimo`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Astra Yao's ATK to a designated target, and <b class="text-hsr-quantum">Quantum DMG</b> equal to {{1}}% of Astra Yao's ATK to adjacent targets.`,
      value: [
        { base: 90, growth: 18, style: 'linear' },
        { base: 45, growth: 9, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
      sp: 1,
      image: 'asset/traces/SkillIcon_1515_Normal.webp',
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Shine for You in Every Hue`,
      content: `Increases the ATK of all ally targets by an amount equal to {{0}}% of Astra Yao's ATK plus {{1}}, and enhances Astra Yao's Basic ATK, lasting for <span class="text-desc">3</span> turn(s). At the start of this unit's turn, this duration decreases by <span class="text-desc">1</span>.`,
      value: [
        { base: 12, growth: 1.2, style: 'curved' },
        { base: 150, growth: 15, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.SUPPORT,
      sp: -1,
      image: 'asset/traces/SkillIcon_1515_BP.webp',
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Astral Encore`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Astra Yao's ATK to all enemies and deploys a Zone that lasts for <span class="text-desc">4</span> turn(s). At the start of this unit's turn, the Zone's duration decreases by <span class="text-desc">1</span>. While the Zone is active, DMG taken by all enemies increases by {{1}}%. After an ally character uses a Basic ATK to attack enemies, Astra Yao deals <span class="text-desc">1</span> instance of <b class="text-hsr-quantum">Quantum Additional DMG</b> equal to {{2}}% of her ATK to the target hit by this Basic ATK.`,
      value: [
        { base: 160, growth: 16, style: 'curved' },
        { base: 16, growth: 1.6, style: 'curved' },
        { base: 20, growth: 2, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
      image: 'asset/traces/SkillIcon_1515_Ultra_on.webp',
    },
    talent: {
      trace: 'Talent',
      title: `Play the Galaxy's Message`,
      content: `When an ally target attacks an enemy, Astra Yao gains <span class="text-desc">1</span> <b class="text-pink-400">Syncopation</b>. Each <b class="text-pink-400">Syncopation</b> increases DMG dealt by all ally characters' Basic ATK by {{0}}%, lasting for <span class="text-desc">3</span> turn(s). Astra Yao can gain a maximum of <span class="text-desc">10</span> <b class="text-pink-400">Syncopation</b>.
      <br />
      <br /><b>Zoned In on Zero</b>
      <br />When Ellen is in the team:
      <br />After Astra Yao uses her Ultimate, she automatically uses <b>Cadenza Cascade</b> <span class="text-desc">1</span> once, then immediately triggers Ellen's <b>Saw Teeth Trimming</b>, causing Ellen to gain <span class="text-desc">1</span> point of <b class="text-indigo-300">Shark's Gotta Bite</b>, and <b>Ice Sea Diving</b>.
      <br />After Ellen uses her Ultimate, she automatically uses <b>Ice Sea Diving</b> once, then immediately triggers Astra Yao's <b>Minuet Pianissimo</b> and grants Astra Yao <span class="text-desc">1</span> extra turn.
      <br />While <b>Zoned In on Zero</b> is active, when Ellen and Astra Yao's attacks select a primary target, they both prioritize selecting enemy targets in the <b class="text-red">Bite Mark</b> state.
      <br />Basic ATKs triggered by <b>Zoned In on Zero</b> do not recover Skill Points.
      <br />After Ellen or Astra Yao uses their Ultimate, they dispel Crowd Control debuffs from the other.
      <br />When Ellen is not in the team: After Astra Yao uses her Ultimate, she additionally regenerates <span class="text-desc">40</span> Energy.`,
      value: [{ base: 2.5, growth: 0.25, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1515_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: `An Overture in Reverie`,
      content: `After using Technique, automatically triggers Skill <span class="text-desc">1</span> time at the start of the next battle. This trigger does not consume Skill Points.`,
      tag: AbilityTag.SUPPORT,
      image: 'asset/traces/SkillIcon_1515_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Fantasia Scale`,
      content: `Increases CRIT Rate by <span class="text-desc">50%</span>. When Astra Yao's ATK exceeds <span class="text-desc">2,000</span>, for every <span class="text-desc">200</span> ATK above that, increases this unit's CRIT DMG by <span class="text-desc">20%</span>, up to a max increase of <span class="text-desc">200%</span>.`,
      image: 'asset/traces/SkillIcon_1515_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Filigree Aria`,
      content: `When using <b>Cadenza Cascade</b>, additionally regenerates <span class="text-desc">10</span> Energy.`,
      image: 'asset/traces/SkillIcon_1515_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Nevernight Tour`,
      content: `When an ally character uses Basic ATK, Astra Yao additionally gains <span class="text-desc">1</span> <b class="text-pink-400">Syncopation</b>. While possessing <b class="text-pink-400">Syncopation</b>, DMG dealt by all allies increases by <span class="text-desc">40%</span>.`,
      image: 'asset/traces/SkillIcon_1515_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Her Drumbeat Moves the Stars`,
      content: `While the Zone is active, the DMG boost effect of <b class="text-pink-400">Syncopation</b> takes effect for all attacks of all ally targets. For each <b class="text-pink-400">Syncopation</b> Astra Yao has, DMG dealt by ally targets ignores <span class="text-desc">1.5%</span> of enemy targets' DEF. The Energy regeneration effect of the Trace <b>Filigree Aria</b> increases to <span class="text-desc">20</span>. At the start of each wave, Astra Yao regenerates <span class="text-desc">30</span> Energy.`,
      image: 'asset/traces/SkillIcon_1515_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: `The Sun Sets in Her Eyes`,
      content: `The Skill's ATK boost effect additionally increases by an amount equal to <span class="text-desc">12%</span> of Astra Yao's ATK. The Additional DMG dealt by the Zone increases by <span class="text-desc">80%</span>.`,
      image: 'asset/traces/SkillIcon_1515_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Shh, the Wind Has Ears`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1515_BP.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Toasted Alone on Both Sides`,
      content: `The DMG multiplier of <b>Cadenza Cascade</b> increases by <span class="text-desc">60%</span> of the original multiplier, and the DMG multiplier of the Ultimate increases by <span class="text-desc">100%</span> of the original multiplier.`,
      image: 'asset/traces/SkillIcon_1515_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: `The Stylus Scripts Her Soul`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
      image: 'asset/traces/SkillIcon_1515_Ultra.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Until the Footlights Flare`,
      content: `While the Zone is active, all ally targets' <b>All-Type RES PEN</b> increases by <span class="text-desc">20%</span>. After Astra Yao uses her Ultimate, regenerates a fixed <span class="text-desc">240</span> Energy. This effect can be triggered again after every <span class="text-desc">4</span> Ultimate(s) used. At the start of combat, Astra Yao gains <span class="text-desc">10</span> <b class="text-pink-400">Syncopation</b>.`,
      image: 'asset/traces/SkillIcon_1515_Rank6.webp',
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'astra_skill',
      text: `Shine for You in Every Hue`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'astra_ult',
      text: `Astral Encore`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'number',
      id: 'syncopation',
      text: `Syncopation`,
      ...talents.talent,
      show: true,
      default: 10,
      min: 0,
      max: 10,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'astra_skill'),
    findContentById(content, 'astra_ult'),
    findContentById(content, 'syncopation'),
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
      broken: boolean,
    ) => {
      const base = _.cloneDeep(x)

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.6, 0.16, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Cadenza Cascade - AoE',
          value: [{ scaling: calcScaling(0.8, 0.16, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 20,
          sum: true,
          multiplier: c >= 4 ? 1.6 : 1,
        },
        {
          name: 'Minuet Pianissimo - Main',
          value: [{ scaling: calcScaling(0.9, 0.18, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 20,
        },
        {
          name: 'Minuet Pianissimo - Adjacent',
          value: [{ scaling: calcScaling(0.45, 0.09, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
        },
      ]

      if (a.a2) {
        base[Stats.CRIT_RATE].push({
          name: 'Ascension 2 Passive',
          source: 'Self',
          value: 0.5,
        })
      }

      if (form.astra_ult) {
        base.VULNERABILITY.push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.16, 0.016, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
        if (c >= 6) {
          base.ALL_TYPE_RES_PEN.push({
            name: 'Eidolon 6',
            source: 'Self',
            value: 0.2,
          })
        }
      }
      if (form.syncopation) {
        const target = c >= 1 && form.astra_ult ? base[Stats.ALL_DMG] : base.BASIC_DMG
        target.push({
          name: 'Syncopation',
          source: 'Self',
          value: calcScaling(0.025, 0.0025, talent, 'curved') * form.syncopation,
        })
        if (a.a6) {
          base[Stats.ALL_DMG].push({
            name: 'Ascension 6 Passive',
            source: 'Self',
            value: 0.4,
          })
        }
        if (c >= 1) {
          base.DEF_PEN.push({
            name: 'Eidolon 1',
            source: 'Self',
            value: 0.015 * form.syncopation,
          })
        }
      }
      if (c >= 4) {
        base.ULT_MULT.push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 1,
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
      if (form.astra_ult) {
        base.VULNERABILITY.push({
          name: 'Ultimate',
          source: 'Astra Yao',
          value: calcScaling(0.16, 0.016, ult, 'curved'),
        })
        if (c >= 6) {
          base.ALL_TYPE_RES_PEN.push({
            name: 'Eidolon 6',
            source: 'Astra Yao',
            value: 0.2,
          })
        }
      }
      if (form.syncopation) {
        const target = c >= 1 && form.astra_ult ? base[Stats.ALL_DMG] : base.BASIC_DMG
        target.push({
          name: 'Syncopation',
          source: 'Astra Yao',
          value: calcScaling(0.025, 0.0025, talent, 'curved') * form.syncopation,
        })
        if (a.a6) {
          base[Stats.ALL_DMG].push({
            name: 'Ascension 6 Passive',
            source: 'Astra Yao',
            value: 0.4,
          })
        }
        if (c >= 1) {
          base.DEF_PEN.push({
            name: 'Eidolon 1',
            source: 'Astra Yao',
            value: 0.015 * form.syncopation,
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
      broken: boolean,
      globalCallback: CallbackType[],
    ) => {
      if (form.astra_skill) {
        globalCallback.push(function P99(_b, _d, _w, a) {
          const atk = a[index].getAtk(true)
          _.forEach(a, (x, i) => {
            const multiplier = calcScaling(0.12, 0.012, skill, 'curved') + (c >= 2 ? 0.12 : 0)
            const xATK = {
              name: 'Skill',
              source: index === i ? 'Self' : 'Astra Yao',
              value: multiplier * atk,
              base: atk,
              multiplier,
            }
            const bATK = {
              name: 'Skill',
              source: index === i ? 'Self' : 'Astra Yao',
              value: calcScaling(150, 15, skill, 'curved'),
              flat: calcScaling(150, 15, skill, 'curved'),
            }
            x.X_ATK.push(xATK)
            x[Stats.ATK].push(bATK)
            if (x.SUMMON_STATS) {
              x.SUMMON_STATS.X_ATK.push(xATK)
              x.SUMMON_STATS[Stats.ATK].push(bATK)
            }
          })
          return a
        })
      }

      if (form.astra_ult) {
        _.forEach(team, (x) => {
          const s = x.BASIC_SCALING
          const add = {
            name: "Astra's Additional DMG",
            value: [{ scaling: calcScaling(0.2, 0.02, ult, 'curved'), multiplier: Stats.ATK }],
            element: Element.QUANTUM,
            property: TalentProperty.ADD,
            type: TalentType.NONE,
            overrideIndex: index,
            sum: true,
            bonus: c >= 2 ? 0.8 : 0,
          }
          if (
            _.some(s, (item) =>
              _.includes([TalentProperty.NORMAL, TalentProperty.FUA, TalentProperty.ELATION], item.property),
            )
          ) {
            s.push(add)
          }
          if (_.some(s, (item) => item.property === TalentProperty.SERVANT)) {
            s.push({
              ...add,
              name: add.name + ` (${x.SUMMON_STATS?.NAME})`,
            })
          }
        })
      }

      if (a.a2) {
        globalCallback.push(function P999(_1, _2, _3, a) {
          const base = _.max([a[index].getAtk() - 2000, 0])
          a[index][Stats.CRIT_DMG].push({
            name: 'Ascension 2 Passive',
            source: 'Self',
            value: _.min([(base / 200) * 0.2, 2]),
            base: `(${_.min([2000, base]).toLocaleString()} ÷ 200)`,
            multiplier: 0.2,
          })
          return a
        })
      }

      return base
    },
  }
}

export default Astra
