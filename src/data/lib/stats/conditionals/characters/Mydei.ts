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

const Mydei = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1403')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Vow of Voyage`,
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Mydei's Max HP to one designated enemy.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Deaths are Legion, Regrets are None`,
      content: `Consumes HP by an amount equal to <span class="text-desc">50%</span> of Mydei's current HP. Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Mydei's Max HP to one designated enemy and <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{1}}% of Mydei's Max HP to adjacent targets.
      <br />If the current HP is not sufficient, using Skill reduces Mydei's current HP to <span class="text-desc">1</span>.`,
      value: [
        { base: 45, growth: 4.5, style: 'curved' },
        { base: 25, growth: 2.5, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    skill_alt: {
      energy: 30,
      trace: 'Enhanced Skill [1]',
      title: `Kingslayer Be King`,
      content: `Consumes HP by an amount equal to <span class="text-desc">35%</span> of Mydei's current HP. Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Mydei's Max HP to one enemy and <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{1}}% of Mydei's Max HP to adjacent targets.
      <br />If the current HP is not sufficient, using Skill reduces Mydei's current HP to <span class="text-desc">1</span>.
      <br />This ability will be automatically used.`,
      value: [
        { base: 50, growth: 5, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    skill_alt2: {
      energy: 30,
      trace: 'Enhanced Skill [2]',
      title: `Godslayer Be God`,
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> to one enemy by an amount equal to {{0}}% of Mydei's Max HP, plus {{0}}% of the tally of HP loss during <b class="text-red">Vendetta</b>. At the same time, deals <b class="text-hsr-imaginary">Imaginary DMG</b> to adjacent targets by an amount equal to {{1}}% of Mydei's Max HP, plus {{1}}% of the tally of HP loss during <b class="text-red">Vendetta</b>.
      <br />This ability will be automatically used.`,
      value: [
        { base: 50, growth: 5, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Throne of Bones`,
      content: `Restores HP equal to <span class="text-desc">15%</span> of Mydei's Max HP. Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Mydei's Max HP to one designated enemy and <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{1}}% of Mydei's Max HP to adjacent targets, with a <span class="text-desc">100%</span> <u>base chance</u> to Taunt the target and their adjacent targets, lasting for <span class="text-desc">1</span> turn(s).
      <br />When using Ultimate, if the <b class="text-red">Vendetta</b> state is active, immediately increases the tally of HP loss by an amount equal to <span class="text-desc">30%</span> of the current Max HP.`,
      value: [
        { base: 96, growth: 8.4, style: 'curved' },
        { base: 60, growth: 4, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.BLAST,
    },
    talent: {
      trace: 'Talent',
      title: `Blood for Blood`,
      content: `When losing HP, gains <b>Charge</b> at a <span class="text-desc">100%</span> rate. When <b>Charge</b> is full, enters the <b class="text-red">Vendetta</b> state, restores HP by {{0}}% of Mydei's Max HP, and advances action by <span class="text-desc">100%</span>. While in <b class="text-red">Vendetta</b>, becomes immune to Crowd Control debuffs, increases Max HP by an amount equal to <span class="text-desc">50%</span> of the current Max HP, maintains <span class="text-desc">0</span> DEF, and massively increases the chance of getting attacked. Enhances Skill and cannot use Basic ATK. When this unit's turn starts, automatically uses Enhanced Skill.
      <br />During <b class="text-red">Vendetta</b>, keeps a tally of HP loss. When the tally reaches <span class="text-desc">180%</span> of Mydei's Max HP, Mydei advances action by <span class="text-desc">50%</span> and uses <b>Godslayer Be God</b> instead. Then, clears an amount equal to <span class="text-desc">180%</span> of Mydei's Max HP from the tally of HP loss.`,
      value: [{ base: 25, growth: 1, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: `Cage of Broken Lance`,
      content: `After using Technique, pulls in enemies within a certain area and inflicts Daze on them for <span class="text-desc">10</span> second(s). Dazed enemies will not actively attack ally targets.
      <br />If actively attacking Dazed enemies, when entering battle, deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to <span class="text-desc">80%</span> of Mydei's Max HP to all enemies, with a <span class="text-desc">100%</span> <u>base chance</u> to Taunt the targets, lasting for <span class="text-desc">1</span> turn(s). This unit gains <span class="text-desc">50%</span> Talent Charge.`,
      tag: AbilityTag.IMPAIR,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Earth and Water`,
      content: `During <b class="text-red">Vendetta</b>, when Mydei receives fatal DMG, immediately restores HP equal to <span class="text-desc">35%</span> of this unit's Max HP and exits the <b class="text-red">Vendetta</b> state.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Thirty Tyrants`,
      content: `During <b class="text-red">Vendetta</b>, Mydei's HP loss caused by enemy targets will be counted towards the tally of HP loss at a <span class="text-desc">250%</span> rate.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Bloodied Chiton`,
      content: `When battle starts, if Mydei's Max HP exceeds <span class="text-desc">5,000</span>, for every <span class="text-desc">100</span> excess HP, increases this unit's CRIT Rate by <span class="text-desc">1.6%</span>, up to a max increase of <span class="text-desc">48%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Frost Hones Spine of Steel`,
      content: `During <b class="text-red">Vendetta</b>, the DMG dealt by Mydei ignores <span class="text-desc">12%</span> of enemy targets' DEF. And each time healing is received, adds <span class="text-desc">40%</span> of the healed amount to the tally of HP loss.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Strife Beholds Cry of Dead`,
      content: `When using Ultimate, additionally increases the restored HP by <span class="text-desc">10%</span>. If in the <b class="text-red">Vendetta</b> state, additionally increases the tally of HP loss by an amount equal to <span class="text-desc">30%</span> of the current Max HP.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Honor Exalts Feast of Faith`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Siren Jolts the Laconic Lion`,
      content: `While in <b class="text-red">Vendetta</b>, increases CRIT DMG by <span class="text-desc">30%</span> and restores HP by <span class="text-desc">8%</span> of this unit's Max HP after receiving attacks from enemy targets.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `War Chisels Flesh of Flame`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Legacy Scales Mound of Blood`,
      content: `When entering battle, immediately gains the <b class="text-red">Vendetta</b> state. While the state is active, decreases the upper limit of the tally of HP loss by <span class="text-desc">30%</span> and increases this unit's Max HP by <span class="text-desc">100%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'vendetta',
      text: `Vendetta`,
      ...talents.talent,
      show: true,
      default: true,
    },
    {
      type: 'number',
      id: 'godslayer',
      text: `Tallied HP Lost (%)`,
      ...talents.talent,
      show: true,
      default: c >= 6 ? 150 : 180,
      min: 0,
      max: Infinity,
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
      broken: boolean
    ) => {
      const base = _.cloneDeep(x)

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.25, 0.05, basic, 'linear'), multiplier: Stats.HP }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = form.vendetta
        ? [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.05, basic, 'curved'), multiplier: Stats.HP }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
              sum: true,
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.3, 0.03, basic, 'curved'), multiplier: Stats.HP }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 10,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.45, 0.045, basic, 'curved'), multiplier: Stats.HP }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
              sum: true,
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.25, 0.025, basic, 'curved'), multiplier: Stats.HP }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 10,
            },
          ]
      base.ULT_SCALING = [
        {
          name: 'Healing',
          value: [{ scaling: 0.15, multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
          bonus: c >= 2 ? 0.1 : 0,
        },
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.96, 0.084, ult, 'curved'), multiplier: Stats.HP }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.6, 0.04, ult, 'curved'), multiplier: Stats.HP }],
          element: Element.IMAGINARY,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
          break: 20,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Healing',
          value: [{ scaling: calcScaling(0.25, 0.01, talent, 'curved'), multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.8, multiplier: Stats.HP }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          sum: true,
        },
      ]

      if (a.a2) {
        base.TALENT_SCALING.push({
          name: 'Revive Healing',
          value: [{ scaling: 0.35, multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        })
      }
      if (form.vendetta) {
        base.SKILL_ALT = true
        if (c >= 1) {
          base.DEF_PEN.push({
            name: 'Eidolon 1',
            source: 'Self',
            value: 0.12,
          })
        }
        if (c >= 4) {
          base[Stats.CRIT_DMG].push({
            name: 'Eidolon 4',
            source: 'Self',
            value: 0.3,
          })
          base.TALENT_SCALING.push({
            name: 'On-Attacked Healing',
            value: [{ scaling: 0.08, multiplier: Stats.HP }],
            element: TalentProperty.HEAL,
            property: TalentProperty.HEAL,
            type: TalentType.NONE,
          })
        }
        if (c >= 6) {
          base[Stats.P_HP].push({
            name: 'Eidolon 6',
            source: 'Self',
            value: 1,
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
      base.CALLBACK.push(function P3(x, _d, _w, _all) {
        if (form.vendetta) {
          x.X_HP.push({
            name: 'Vendetta',
            source: 'Self',
            value: x.getHP() * 0.5,
            base: x.getHP(),
            multiplier: 0.5,
          })
          x.BASE_DEF = 0
          x.AGGRO.push({
            name: 'Vendetta',
            source: 'Self',
            value: 5,
          })
        }
        if (a.a6) {
          x[Stats.CRIT_RATE].push({
            name: 'Ascension 6 Passive',
            source: 'Self',
            value: _.min([(_.max([x.getHP() - 5000, 0]) / 100) * 0.016, 0.48]),
            base: _.min([_.max([x.getHP() - 5000, 0]) / 100, 30]),
            multiplier: 0.016,
          })
        }
        if (form.godslayer >= (c >= 6 ? 150 : 180)) {
          base.GODSLAYER = true
          const hp = x.getHP() * (form.godslayer / 100)
          x.SKILL_SCALING = [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.05, basic, 'curved'), multiplier: Stats.HP }],
              flat: hp * calcScaling(0.5, 0.05, basic, 'curved'),
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
              sum: true,
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.3, 0.03, basic, 'curved'), multiplier: Stats.HP }],
              flat: hp * calcScaling(0.3, 0.03, basic, 'curved'),
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 10,
            },
          ]
        }

        return x
      })

      return base
    },
  }
}

export default Mydei
