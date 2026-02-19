import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/data_format'
import { IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'

const Sparkle = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1306')
  const multiplier = calcScaling(0.12, 0.012, skill, 'curved') + (c >= 6 ? 0.3 : 0)

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Monodrama',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Sparkle's ATK to one designated enemy target.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Dreamdiver',
      content: `Increases the CRIT DMG of a designated ally by {{0}}% of Sparkle's CRIT DMG plus {{1}}%, lasting for <span class="text-desc">1</span> turn(s). And at the same time, advances this ally's action by <span class="text-desc">50%</span>.
      <br />When Sparkle uses this ability on herself, the Action Advance effect will not trigger.`,
      value: [
        { base: 12, growth: 1.2, style: 'curved' },
        { base: 27, growth: 1.8, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.SUPPORT,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'The Hero with a Thousand Faces',
      content: `Recovers <span class="text-desc">6</span> Skill Points for the team. If Skill Points overflow during recovery, overflowing Skill Points are recorded up to <span class="text-desc">10</span> point(s). When an ally character's turn ends, if the team has fewer Skill Points than the maximum, Sparkle consumes the recorded value to recover Skill Points for the team, until the limit is reached. Then, grants all allies <b class="text-hsr-quantum">Cipher</b>. For ally targets with <b class="text-hsr-quantum">Cipher</b>, each stack of Boost of DMG taken by enemies effect provided by Sparkle's Talent additionally increases by {{0}}%, lasting for <span class="text-desc">3</span> turns.`,
      value: [{ base: 3.6, growth: 0.24, style: 'curved' }],
      level: ult,
      tag: AbilityTag.SUPPORT,
    },
    talent: {
      trace: 'Talent',
      title: 'Red Herring',
      content: `While Sparkle is on the field, additionally increases the max number of Skill Points by <span class="text-desc">2</span>. Whenever an ally consumes <span class="text-desc">1</span> Skill Point, Sparkle gains <span class="text-desc">1</span> stack of <b class="true">Figment</b>, with each stack increasing all enemies' DMG received by {{0}}%. This effect lasts for <span class="text-desc">2</span> turn(s) and can stack up to <span class="text-desc">3</span> time(s).`,
      value: [{ base: 2, growth: 0.2, style: 'curved' }],
      level: talent,
      tag: AbilityTag.SUPPORT,
    },
    technique: {
      trace: 'Technique',
      title: 'Unreliable Narrator',
      content: `Using the Technique grants all allies Misdirect for <span class="text-desc">20</span> seconds. Characters with Misdirect will not be detected by enemies, and entering battle in the Misdirect state recovers <span class="text-desc">3</span> Skill Point(s) for the team and regenerates <span class="text-desc">20</span> Energy for Sparkle.`,
      tag: AbilityTag.SUPPORT,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Almanac',
      content: `Using Basic ATK additionally regenerates <span class="text-desc">10</span> Energy. When an ally character who possesses the CRIT DMG Boost effect provided by the Skill consumes Skill Points, Sparkle additionally regenerates <span class="text-desc">1</span> Energy.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Artificial Flower',
      content: `If an ally character consumes <span class="text-desc">3</span> or more Skill Points in a single turn, Sparkle's next Skill usage will not consume Skill Points.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Nocturne',
      content: `Increases ATK for all allies by <span class="text-desc">45%</span>. When an ally character possesses the CRIT DMG Boost effect provided by the Skill, their <b>All-Type RES PEN</b> increases by <span class="text-desc">10%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Suspension of Disbelief',
      content: `Increases the ATK of ally targets with <b class="text-hsr-quantum">Cipher</b> by <span class="text-desc">40%</span>. When the battle starts or when using Skill, increases Sparkle's SPD by <span class="text-desc">15%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'Purely Fictitious',
      content: `Each stack of the Talent additionally reduces the enemy target's DEF by <span class="text-desc">10%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Pipedream',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Flitting Phantasm',
      content: `The Ultimate recovers <span class="text-desc">1</span> more Skill Point. The Talent additionally increases the Max Skill Points by <span class="text-desc">1</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Parallax Truth',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Narrative Polysemy',
      content: `The CRIT DMG Boost effect provided by the Skill additionally increases by an amount equal to <span class="text-desc">30%</span> of Sparkle's CRIT DMG. When Sparkle uses Skill, her Skill's CRIT DMG Boost effect will apply to all teammates with <b class="text-hsr-quantum">Cipher</b>. When Sparkle uses her Ultimate, any single ally who benefits from her Skill's CRIT DMG Boost will spread that effect to teammates with <b class="text-hsr-quantum">Cipher</b>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'sparkle_skill',
      text: `Dreamdiver CRIT DMG`,
      ...talents.skill,
      show: true,
      default: false,
      duration: a.a4 ? 2 : 1,
    },
    {
      type: 'number',
      id: 'red_herring',
      text: `Figment Stacks`,
      ...talents.talent,
      show: true,
      default: 3,
      min: 0,
      max: 3,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'cipher',
      text: `Cipher Effect`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'sparkle_c1',
      text: `E1 SPD Bonus`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'red_herring'), findContentById(content, 'cipher')]

  const allyContent: IContent[] = [findContentById(content, 'sparkle_skill')]

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
    ) => {
      const base = _.cloneDeep(x)

      base.MAX_SP += c >= 4 ? 3 : 2

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          energy: a.a2 ? 30 : 20,
          sum: true,
        },
      ]

      if (form.red_herring) {
        base.VULNERABILITY.push({
          name: `Talent`,
          source: 'Self',
          value:
            form.red_herring *
            (calcScaling(0.02, 0.002, talent, 'curved') +
              (form.cipher ? calcScaling(0.036, 0.0024, talent, 'curved') : 0)),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
        if (c >= 2)
          base.DEF_PEN.push({
            name: `Eidolon 2`,
            source: 'Self',
            value: 0.1 * form.red_herring,
          })
      }
      if (form.cipher && c >= 1)
        base[Stats.P_ATK].push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.4,
        })
      if (form.sparkle_c1) {
        base[Stats.P_SPD].push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.15,
        })
      }
      if (a.a6) {
        base[Stats.P_ATK].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.45,
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
    ) => {
      base.MAX_SP += c >= 4 ? 3 : 2

      if (aForm.sparkle_skill && (c < 6 || !form.cipher)) {
        base.CALLBACK.push((x, d, w, all) => {
          x.X_CRIT_DMG.push({
            name: `Skill`,
            source: 'Sparkle',
            value: calcScaling(0.27, 0.018, skill, 'curved') + multiplier * all[index].getValue(Stats.CRIT_DMG),
            multiplier,
            base: toPercentage(all[index].getValue(Stats.CRIT_DMG)),
            flat: toPercentage(calcScaling(0.27, 0.018, skill, 'curved')),
          })
          if (a.a6) {
            base.ALL_TYPE_RES_PEN.push({
              name: `Ascension 6 Passive`,
              source: 'Sparkle',
              value: 0.1,
            })
          }
          return x
        })
      }
      if (form.red_herring) {
        base.VULNERABILITY.push({
          name: `Talent`,
          source: 'Sparkle',
          value:
            form.red_herring *
            (calcScaling(0.02, 0.002, talent, 'curved') +
              (form.cipher ? calcScaling(0.036, 0.0024, talent, 'curved') : 0)),
        })
        if (c >= 2)
          base.DEF_PEN.push({
            name: `Eidolon 2`,
            source: 'Sparkle',
            value: 0.1 * form.red_herring,
          })
      }
      if (form.cipher && c >= 1)
        base[Stats.P_ATK].push({
          name: `Eidolon 1`,
          source: 'Sparkle',
          value: 0.4,
        })
      if (a.a6) {
        base[Stats.P_ATK].push({
          name: `Ascension 6 Passive`,
          source: 'Sparkle',
          value: 0.45,
        })
      }

      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      team: StatsObject[],
      allForm: Record<string, any>[],
    ) => {
      if (form.sparkle_skill && (c < 6 || !form.cipher)) {
        base.X_CRIT_DMG.push({
          name: `Skill`,
          source: 'Self',
          value: calcScaling(0.27, 0.018, skill, 'curved') + multiplier * base.getValue(Stats.CRIT_DMG),
          multiplier,
          base: toPercentage(base.getValue(Stats.CRIT_DMG)),
          flat: toPercentage(calcScaling(0.27, 0.018, skill, 'curved')),
        })
        if (a.a6) {
          base.ALL_TYPE_RES_PEN.push({
            name: `Ascension 6 Passive`,
            source: 'Self',
            value: 0.1,
          })
        }
      }
      if (c >= 6 && _.some(allForm, (item) => item.sparkle_skill) && form.cipher) {
        for (const y of team) {
          y.X_CRIT_DMG.push({
            name: `Skill`,
            source: 'Sparkle',
            value: calcScaling(0.27, 0.018, skill, 'curved') + multiplier * base.getValue(Stats.CRIT_DMG),
            multiplier,
            base: toPercentage(base.getValue(Stats.CRIT_DMG)),
            flat: toPercentage(calcScaling(0.27, 0.018, skill, 'curved')),
          })
          if (a.a6) {
            base.ALL_TYPE_RES_PEN.push({
              name: `Ascension 6 Passive`,
              source: 'Sparkle',
              value: 0.1,
            })
          }
        }
      }

      return base
    },
  }
}

export default Sparkle
