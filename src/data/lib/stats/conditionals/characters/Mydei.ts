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
        { base: 55, growth: 5.5, style: 'curved' },
        { base: 33, growth: 3.3, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    skill_alt2: {
      energy: 30,
      trace: 'Enhanced Skill [2]',
      title: `Godslayer Be God`,
      content: `Consumes <span class="text-desc">150</span> point(s) of <b>Charge</b>. Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Mydei's Max HP to one enemy and <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{1}}% of Mydei's Max HP to adjacent targets.
      <br />This ability will be automatically used. While this ability is in use, <b>Charge</b> cannot be accumulated.`,
      value: [
        { base: 140, growth: 14, style: 'curved' },
        { base: 84, growth: 8.4, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Throne of Bones`,
      content: `Restores HP by {{2}}% of Mydei's Max HP and accumulates <span class="text-desc">20</span> Talent's <b>Charge</b> point(s). Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Mydei's Max HP to one designated enemy, and deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{1}}% of Mydei's Max HP to adjacent targets. Additionally, Taunts the target and targets adjacent to it, lasting for <span class="text-desc">2</span> turn(s). The next use of <b>Godslayer Be God</b> prioritizes attacking one designated enemy, and this effect only works on the latest target.`,
      value: [
        { base: 96, growth: 8.4, style: 'curved' },
        { base: 60, growth: 4, style: 'curved' },
        { base: 15, growth: 0.5, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.BLAST,
    },
    talent: {
      trace: 'Talent',
      title: `Blood for Blood`,
      content: `For each <span class="text-desc">1%</span> of HP lose, accumulates <span class="text-desc">1</span> point of <b>Charge</b> (up to <span class="text-desc">200</span> points). When losing HP, gains <b>Charge</b> at a <span class="text-desc">100%</span> rate. When <b>Charge</b> reaches <span class="text-desc">100</span>, consume <span class="text-desc">100</span> points of <b>Charge</b> to enter the <b class="text-red">Vendetta</b> state, restores HP by {{0}}% of Mydei's Max HP, and advances action by <span class="text-desc">100%</span>. While in <b class="text-red">Vendetta</b>, Max HP increases by <span class="text-desc">50%</span> of the current Max HP and DEF remains at <span class="text-desc">0</span>. Enhances Skill and cannot use Basic ATK. At the start of this unit's turn, automatically uses <b>Kingslayer Be King</b>.
      <br />When <b>Charge</b> reaches <span class="text-desc">150</span> points while in the <b class="text-red">Vendetta</b> state, Mydei immediately gains <span class="text-desc">1</span> extra turn and automatically uses <b>Godslayer Be God</b>.
      <br />When receiving a killing blow during the <b class="text-red">Vendetta</b> state, Mydei will not be knocked down, but will clear his <b>Charge</b>, exits the the <b class="text-red">Vendetta</b> state, and restores HP by <span class="text-desc">50%</span> of his Max HP.`,
      value: [{ base: 15, growth: 1, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: `Cage of Broken Lance`,
      content: `After using Technique, pulls in enemies within a certain area and inflicts Daze on them for <span class="text-desc">10</span> second(s). Dazed enemies will not actively attack ally targets.
      <br />If actively attacking Dazed enemies, when entering battle, deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to <span class="text-desc">80%</span> of Mydei's Max HP to all enemies, and Taunts the targets, lasting for <span class="text-desc">1</span> turn(s). This unit accumulates <span class="text-desc">50</span> Talent's <b>Charge</b>.`,
      tag: AbilityTag.IMPAIR,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Earth and Water`,
      content: `During the <b class="text-red">Vendetta</b> state, Mydei will not exit the <b class="text-red">Vendetta</b> state when receiving a killing blow. This effect can trigger <span class="text-desc">3</span> time(s) per battle.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Thirty Tyrants`,
      content: `While in the <b class="text-red">Vendetta</b> state, Mydei is immune to Crowd Control debuffs.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Bloodied Chiton`,
      content: `When battle starts, if Mydei's Max HP exceeds <span class="text-desc">4,000</span>, for every <span class="text-desc">100</span> excess HP, Mydei's CRIT Rate increases by <span class="text-desc">1.2%</span>, his <b>Charge</b> ratio from enemy targets' DMG increases by <span class="text-desc">2.5%</span>, and his Incoming Healing increases by <span class="text-desc">0.75%</span>. Up to <span class="text-desc">4,000</span> excess HP can be taken into account for this effect.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Frost Hones Spine of Steel`,
      content: `The DMG multiplier applied by <b>Godslayer Be God</b> to the primary target increases by <span class="text-desc">15%</span>. And <b>Godslayer Be God</b> becomes <b class="text-hsr-imaginary">Imaginary DMG</b> dealt to all enemies equal to the DMG multiplier applied to the primary target.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Strife Beholds Cry of Dead`,
      content: `During <b class="text-red">Vendetta</b>, the DMG dealt by Mydei ignores <span class="text-desc">15%</span> of enemy targets' DEF. And when receiving healing, converts <span class="text-desc">40%</span> of the healed amount to <b>Charge</b>. The tally of the converted <b>Charge</b> cannot exceed <span class="text-desc">40</span> point(s). Resets this tally of <b>Charge</b> after any unit takes action.`,
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
      content: `While in <b class="text-red">Vendetta</b>, increases CRIT DMG by <span class="text-desc">30%</span> and restores HP by <span class="text-desc">10%</span> of this unit's Max HP after receiving attacks from enemy targets.`,
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
      content: `When entering battle, immediately enters the <b class="text-red">Vendetta</b> state, and lowers the <b>Charge</b> required for <b>Godslayer Be God</b> to <span class="text-desc">100</span> point(s).`,
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
      type: 'toggle',
      id: 'godslayer',
      text: `Godslayer Be God`,
      ...talents.talent,
      show: true,
      default: true,
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
        ? form.godslayer
          ? c >= 1
            ? [
                {
                  name: 'AoE',
                  value: [{ scaling: calcScaling(1.4, 0.14, skill, 'curved') + 0.3, multiplier: Stats.HP }],
                  element: Element.IMAGINARY,
                  property: TalentProperty.NORMAL,
                  type: TalentType.SKILL,
                  break: 20,
                  sum: true,
                },
              ]
            : [
                {
                  name: 'Single Target',
                  value: [{ scaling: calcScaling(1.4, 0.14, skill, 'curved'), multiplier: Stats.HP }],
                  element: Element.IMAGINARY,
                  property: TalentProperty.NORMAL,
                  type: TalentType.SKILL,
                  break: 20,
                  sum: true,
                },
                {
                  name: 'Adjacent',
                  value: [{ scaling: calcScaling(0.84, 0.084, skill, 'curved'), multiplier: Stats.HP }],
                  element: Element.IMAGINARY,
                  property: TalentProperty.NORMAL,
                  type: TalentType.SKILL,
                  break: 10,
                },
              ]
          : [
              {
                name: 'Single Target',
                value: [{ scaling: calcScaling(0.55, 0.055, skill, 'curved'), multiplier: Stats.HP }],
                element: Element.IMAGINARY,
                property: TalentProperty.NORMAL,
                type: TalentType.SKILL,
                break: 20,
                sum: true,
              },
              {
                name: 'Adjacent',
                value: [{ scaling: calcScaling(0.33, 0.033, skill, 'curved'), multiplier: Stats.HP }],
                element: Element.IMAGINARY,
                property: TalentProperty.NORMAL,
                type: TalentType.SKILL,
                break: 10,
              },
            ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.45, 0.045, skill, 'curved'), multiplier: Stats.HP }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
              sum: true,
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.25, 0.025, skill, 'curved'), multiplier: Stats.HP }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 10,
            },
          ]
      base.ULT_SCALING = [
        {
          name: 'Activation Healing',
          value: [{ scaling: calcScaling(0.15, 0.005, ult, 'curved'), multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
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
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Activation Healing',
          value: [{ scaling: calcScaling(0.15, 0.01, talent, 'curved'), multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
        {
          name: 'Revive Healing',
          value: [{ scaling: 0.5, multiplier: Stats.HP }],
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

      if (form.vendetta) {
        base.SKILL_ALT = true
        if (c >= 2) {
          base.DEF_PEN.push({
            name: 'Eidolon 2',
            source: 'Self',
            value: 0.15,
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
            value: [{ scaling: 0.1, multiplier: Stats.HP }],
            element: TalentProperty.HEAL,
            property: TalentProperty.HEAL,
            type: TalentType.NONE,
          })
        }
      }
      if (form.godslayer) base.GODSLAYER = true

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
          x[Stats.DEF] = []
          x[Stats.P_DEF] = []
        }
        if (a.a6) {
          x[Stats.CRIT_RATE].push({
            name: 'Ascension 6 Passive',
            source: 'Self',
            value: _.min([(_.max([x.getOFCHP() - 4000, 0]) / 100) * 0.012, 0.48]),
            base: `${_.min([_.max([x.getOFCHP() - 4000, 0]), 4000]).toFixed(2)} ÷ 100`,
            multiplier: 0.016,
          })
          x.I_HEAL.push({
            name: 'Talent',
            source: 'Self',
            value: _.min([(_.max([x.getOFCHP() - 4000, 0]) / 100) * 0.0075, 0.3]),
            base: `${_.min([_.max([x.getOFCHP() - 4000, 0]), 4000]).toFixed(2)} ÷ 100`,
            multiplier: 0.005,
          })
        }

        return x
      })

      return base
    },
  }
}

export default Mydei
