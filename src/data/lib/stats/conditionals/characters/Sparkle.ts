import { findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
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

  const index = _.findIndex(team, (item) => item.cId === '1306')
  const quantumCount = _.filter(team, (item) => findCharacter(item.cId)?.element === Element.QUANTUM).length - 1

  const talents: ITalent = {
    normal: {
      title: 'Monodrama',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Sparkle's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      title: 'Dreamdiver',
      content: `Increases the CRIT DMG of a single ally by {{0}}% of Sparkle's CRIT DMG plus {{1}}%, lasting for <span class="text-desc">1</span> turn(s). And at the same time, Advances Forward this ally's action by <span class="text-desc">50%</span>.
      <br />When Sparkle uses this ability on herself, the Action Advance effect will not trigger.`,
      value: [
        { base: 12, growth: 1.2, style: 'curved' },
        { base: 27, growth: 1.8, style: 'curved' },
      ],
      level: skill,
    },
    ult: {
      title: 'The Hero with a Thousand Faces',
      content: `Recovers <span class="text-desc">4</span> Skill Points for the team and grants all allies <b>Cipher</b>. When allies with <b>Cipher</b> trigger the DMG Boost effect provided by Sparkle's Talent, each stack additionally increases its effect by {{0}}%, lasting for <span class="text-desc">2</span> turns.`,
      value: [{ base: 6, growth: 0.4, style: 'curved' }],
      level: ult,
    },
    talent: {
      title: 'Red Herring',
      content: `While Sparkle is on the battlefield, additionally increases the max number of Skill Points by <span class="text-desc">2</span>. Whenever an ally consumes <span class="text-desc">1</span> Skill Point, all allies' DMG increases by {{0}}%. This effect lasts for <span class="text-desc">2</span> turn(s) and can stack up to <span class="text-desc">3</span> time(s).`,
      value: [{ base: 3, growth: 0.3, style: 'curved' }],
      level: talent,
    },
    technique: {
      title: 'Unreliable Narrator',
      content: `Using the Technique grants all allies Misdirect for <span class="text-desc">20</span> seconds. Characters with Misdirect will not be detected by enemies, and entering battle in the Misdirect state recovers <span class="text-desc">3</span> Skill Point(s) for the team.`,
    },
    a2: {
      title: 'Almanac',
      content: `When using Basic ATK, additionally regenerates <span class="text-desc">10</span> Energy.`,
    },
    a4: {
      title: 'Artificial Flower',
      content: `The CRIT DMG Boost effect provided by the Skill will extend to last until the start of the target's next turn.`,
    },
    a6: {
      title: 'Nocturne',
      content: `Increases all allies' ATK by <span class="text-desc">15%</span>. When there are <span class="text-desc">1/2/3</span> <b class="text-hsr-quantum">Quantum</b> allies in your team, increases <b class="text-hsr-quantum">Quantum</b>-Type allies' ATK by <span class="text-desc">5%/15%/30%</span>.`,
    },
    c1: {
      title: 'Suspension of Disbelief',
      content: `The Cipher effect applied by the Ultimate lasts for <span class="text-desc">1</span> extra turn. All allies affected by Cipher have their ATK increased by <span class="text-desc">40%</span>.`,
    },
    c2: {
      title: 'Purely Fictitious',
      content: `Each Talent stack allows allies to ignore <span class="text-desc">8%</span> of the enemy target's DEF when dealing DMG to enemies.`,
    },
    c3: {
      title: 'Pipedream',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      title: 'Flitting Phantasm',
      content: `The Ultimate recovers <span class="text-desc">1</span> more Skill Point. The Talent additionally increases Max Skill Points by <span class="text-desc">1</span>.`,
    },
    c5: {
      title: 'Parallax Truth',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      title: 'Narrative Polysemy',
      content: `The CRIT DMG Boost effect of Sparkle's Skill additionally increases by <span class="text-desc">30%</span> of Sparkle's CRIT DMG, and when she uses her Skill, the CRIT DMG Boost effect will apply to all allies currently with Cipher. When Sparkle uses her Ultimate, this effect will spread to all allies with Cipher should the allied target have the CRIT DMG increase effect provided by the Skill active on them.`,
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
      text: `Red Herring Stacks`,
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
      }[]
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
          energy: a.a2 ? 30 : 20,
        },
      ]

      if (form.red_herring) {
        base[Stats.ALL_DMG].push({
          name: `Talent`,
          source: 'Self',
          value:
            form.red_herring *
            (calcScaling(0.03, 0.003, talent, 'curved') +
              (form.cipher ? calcScaling(0.06, 0.004, talent, 'curved') : 0)),
        })
        if (c >= 2)
          base.DEF_PEN.push({
            name: `Eidolon 2`,
            source: 'Self',
            value: 0.08 * form.red_herring,
          })
      }
      if (form.cipher && c >= 1)
        base[Stats.P_ATK].push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.4,
        })
      if (a.a6) {
        base[Stats.P_ATK].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.15,
        })
        if (quantumCount === 1)
          base[Stats.P_ATK].push({
            name: `Ascension 6 Passive`,
            source: 'Self',
            value: 0.05,
          })
        if (quantumCount === 2)
          base[Stats.P_ATK].push({
            name: `Ascension 6 Passive`,
            source: 'Self',
            value: 0.15,
          })
        if (quantumCount === 3)
          base[Stats.P_ATK].push({
            name: `Ascension 6 Passive`,
            source: 'Self',
            value: 0.3,
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
      if (aForm.sparkle_skill && (c < 6 || !form.cipher)) {
        base.CALLBACK.push((x, d, w, all) => {
          x.X_CRIT_DMG.push({
            name: `Skill`,
            source: 'Sparkle',
            value:
              calcScaling(0.27, 0.018, skill, 'curved') +
              (calcScaling(0.12, 0.012, skill, 'curved') + (c >= 6 ? 0.3 : 0)) * all[index].getValue(Stats.CRIT_DMG),
          })
          return x
        })
      }
      if (form.red_herring) {
        base[Stats.ALL_DMG].push({
          name: `Talent`,
          source: 'Sparkle',
          value: 0.2,
        })
        form.red_herring *
          (calcScaling(0.03, 0.003, talent, 'curved') + (form.cipher ? calcScaling(0.06, 0.004, talent, 'curved') : 0))
        if (c >= 2)
          base.DEF_PEN.push({
            name: `Eidolon 2`,
            source: 'Sparkle',
            value: 0.08 * form.red_herring,
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
          value: 0.15,
        })
        if (form.element === Element.QUANTUM) {
          if (quantumCount === 1)
            base[Stats.P_ATK].push({
              name: `Ascension 6 Passive`,
              source: 'Sparkle',
              value: 0.05,
            })
          if (quantumCount === 2)
            base[Stats.P_ATK].push({
              name: `Ascension 6 Passive`,
              source: 'Sparkle',
              value: 0.15,
            })
          if (quantumCount === 3)
            base[Stats.P_ATK].push({
              name: `Ascension 6 Passive`,
              source: 'Sparkle',
              value: 0.3,
            })
        }
      }
      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      team: StatsObject[],
      allForm: Record<string, any>[]
    ) => {
      if (form.sparkle_skill && (c < 6 || !form.cipher)) {
        base.X_CRIT_DMG.push({
          name: `Skill`,
          source: 'Self',
          value:
            calcScaling(0.27, 0.018, skill, 'curved') +
            (calcScaling(0.12, 0.012, skill, 'curved') + (c >= 6 ? 0.3 : 0)) * base.getValue(Stats.CRIT_DMG),
        })
      }
      if (c >= 6 && _.some(allForm, (item) => item.sparkle_skill) && form.cipher) {
        for (const y of team) {
          y.X_CRIT_DMG.push({
            name: `Skill`,
            source: 'Sparkle',
            value:
              calcScaling(0.27, 0.018, skill, 'curved') +
              (calcScaling(0.12, 0.012, skill, 'curved') + (c >= 6 ? 0.3 : 0)) * base.getValue(Stats.CRIT_DMG),
          })
        }
      }

      return base
    },
  }
}

export default Sparkle
