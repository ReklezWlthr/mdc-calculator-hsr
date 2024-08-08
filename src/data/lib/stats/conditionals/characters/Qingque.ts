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

const Qingque = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Flower Pick`,
      content: `Tosses <span class="text-desc">1</span> jade tile from the suit with the fewest tiles in hand to deal <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Qingque's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    normal_alt: {
      energy: 20,
      trace: 'Enhanced Basic ATK',
      title: `Cherry on Top!`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Qingque's ATK to a single enemy, and deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{1}}% of Qingque's ATK to enemies adjacent to it.
      <br /><b>Cherry on Top!</b> cannot recover Skill Points.`,
      value: [
        { base: 120, growth: 24, style: 'linear' },
        { base: 50, growth: 10, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
    },
    skill: {
      trace: 'Skill',
      title: 'A Scoop of Moon',
      content: `Immediately draws <span class="text-desc">2</span> jade tile(s) and increases DMG by {{0}}% until the end of the current turn. This effect can stack up to <span class="text-desc">4</span> time(s). The turn will not end after this Skill is used.`,
      value: [{ base: 14, growth: 1.4, style: 'curved' }],
      level: skill,
      tag: AbilityTag.ENHANCE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `A Quartet? Woo-hoo!`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Qingque's ATK to all enemies, and obtains <span class="text-desc">4</span> jade tiles of the same suit.`,
      value: [{ base: 120, growth: 8, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `Celestial Jade`,
      content: `When an ally's turn starts, Qingque randomly draws <span class="text-desc">1</span> tile from <span class="text-desc">3</span> different suits and can hold up to <span class="text-desc">4</span> tiles at one time.
      <br />If Qingque starts her turn with <span class="text-desc">4</span> tiles of the same suit, she consumes all tiles to enter the <b>Hidden Hand</b> state.
      <br />While in this state, Qingque cannot use her Skill again. At the same time, Qingque's ATK increases by {{0}}%, and her Basic ATK <b>Flower Pick</b> is enhanced, becoming <b>Cherry on Top!</b>. The <b>Hidden Hand</b> state ends after using <b>Cherry on Top!</b>.`,
      value: [{ base: 36, growth: 3.6, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: 'Game Solitaire',
      content: `After using Technique, Qingque draws <span class="text-desc">2</span> jade tile(s) when the battle starts.`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Tile Battle`,
      content: `Restores <span class="text-desc">1</span> Skill Point when using the Skill. This effect can only be triggered <span class="text-desc">1</span> time per battle.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Bide Time`,
      content: `Using the Skill increases DMG Boost effect of attacks by an extra <span class="text-desc">10%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Winning Hand`,
      content: `Qingque's SPD increases by <span class="text-desc">10%</span> for <span class="text-desc">1</span> turn after using the Enhanced Basic ATK.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Rise Through the Tiles`,
      content: `Ultimate deals <span class="text-desc">10%</span> more DMG.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Sleep on the Tiles`,
      content: `Every time <b>Draw Tile</b> is triggered, Qingque immediately regenerates <span class="text-desc">1</span> Energy.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Read Between the Tiles`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Right on the Tiles`,
      content: `After this character's Skill is used, there is a 24% <u>fixed chance</u> to gain <b>Autarky</b>, which lasts until the end of the current turn.
      <br />With <b>Autarky</b>, using Basic ATK or Enhanced Basic ATK immediately launches <span class="text-desc">1</span> <u>follow-up attack</u> on the same target, dealing <b class="text-hsr-quantum">Quantum DMG</b> equal to <span class="text-desc">100%</span> of the previous Basic ATK (or Enhanced Basic ATK)'s DMG.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Gambit for the Tiles`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Prevail Beyond the Tiles`,
      content: `Recovers <span class="text-desc">1</span> Skill Point after using Enhanced Basic ATK.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'qq_enhance',
      text: `Hidden Hand`,
      ...talents.talent,
      show: true,
      default: true,
      unique: true,
      sync: true,
    },
    {
      type: 'number',
      id: 'qq_skill',
      text: `Skill DMG Bonus Stacks`,
      ...talents.skill,
      show: true,
      default: 0,
      min: 0,
      max: 4,
    },
    {
      type: 'toggle',
      id: 'qq_a6',
      text: `A6 SPD Bonus`,
      ...talents.a6,
      show: a.a6,
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

      base.BASIC_SCALING = form.qq_enhance
        ? [
            {
              name: 'Main Target',
              value: [{ scaling: calcScaling(1.2, 0.24, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.QUANTUM,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 20,
              sum: true,
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.QUANTUM,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
            },
          ]
        : [
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
          value: [{ scaling: calcScaling(1.2, 0.08, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
      ]

      if (c >= 1)
        base.ULT_DMG.push({
          name: 'Eidolon 1',
          source: 'Self',
          value: 0.1,
        })
      if (form.qq_enhance) {
        base.BA_ALT = true
        base[Stats.P_ATK].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.36, 0.036, talent, 'curved'),
        })
      }
      if (form.qq_skill) {
        base[Stats.ALL_DMG].push({
          name: 'Skill',
          source: 'Self',
          value: form.qq_skill * (calcScaling(0.14, 0.014, skill, 'curved') + (a.a4 ? 0.1 : 0)),
        })
      }
      if (form.qq_a6) {
        base[Stats.P_SPD].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.1,
        })
      }
      if (c >= 4)
        base.BASIC_SCALING.push(
          ...(form.qq_enhance
            ? [
                {
                  name: 'Autarky Main',
                  value: [{ scaling: calcScaling(1.2, 0.24, basic, 'linear'), multiplier: Stats.ATK }],
                  element: Element.QUANTUM,
                  property: TalentProperty.FUA,
                  type: TalentType.BA,
                  break: 20,
                  chance: { base: 0.24, fixed: true },
                  sum: true,
                },
                {
                  name: 'Autarky Adjacent',
                  value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
                  element: Element.QUANTUM,
                  property: TalentProperty.FUA,
                  type: TalentType.BA,
                  break: 10,
                  chance: { base: 0.24, fixed: true },
                },
              ]
            : [
                {
                  name: 'Autarky',
                  value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
                  element: Element.QUANTUM,
                  property: TalentProperty.FUA,
                  type: TalentType.BA,
                  break: 10,
                  chance: { base: 0.24, fixed: true },
                  sum: true,
                },
              ])
        )

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
      return base
    },
  }
}

export default Qingque
