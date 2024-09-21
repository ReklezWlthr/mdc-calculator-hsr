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

const Rappa = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1317')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Ninjutsu: Rise Above Tumbles`,
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Rappa's ATK to one designated Enemy unit.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    normal_alt: {
      energy: 20,
      trace: 'Enhanced Basic ATK',
      title: `Ningu: Demonbane Petalblade`,
      content: `Launches <b>Ningu: Demonbane Petalblade</b>. The first <span class="text-desc">2</span> hits deal <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Rappa's ATK to one designated Enemy unit and <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{1}}% of Rappa's ATK to adjacent targets, and the <span class="text-desc">3rd</span> hit deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{2}}% of Rappa's ATK to all Enemy units.
      <br />Enhanced Basic ATK will not recover Skill Points. When attacking enemies that don't have <b class="text-hsr-imaginary">Imaginary</b> Weakness, Enhanced Basic ATK can still deal Toughness Reduction equal to <span class="text-desc">50%</span> of the original Toughness Reduction value. When Breaking Weakness, triggers the <b class="text-hsr-imaginary">Imaginary</b> Weakness Break effect.`,
      value: [
        { base: 60, growth: 8, style: 'linear' },
        { base: 30, growth: 4, style: 'linear' },
        { base: 60, growth: 8, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
      image: `https://homdgcat.wiki/images/skillicons/avatar/1317/SkillIcon_1317_Ultra.png`,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Ninja Strike: Rooted Resolute`,
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Rappa's ATK to all Enemy units.`,
      value: [{ base: 60, growth: 6, style: 'curved' }],
      level: skill,
      tag: AbilityTag.AOE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Nindō Supreme: Lovedeep`,
      content: `Enters the <b>Sealform</b> state. Immediately gains <span class="text-desc">1</span> extra turn, obtains <span class="text-desc">3</span> points of <b class="text-hsr-imaginary">Chroma Ink</b>, and increases Weakness Break Efficiency by <span class="text-desc">50%</span> and Break Effect by {{0}}%.
      <br />While in the <b>Sealform</b> state, Basic ATK is enhanced, and Skill and Ultimate cannot be used. After using Enhanced Basic ATK, consumes <span class="text-desc">1</span> point of <b class="text-hsr-imaginary">Chroma Ink</b>. When <b class="text-hsr-imaginary">Chroma Ink</b> is depleted, exits the <b>Sealform</b> state.`,
      value: [{ base: 10, growth: 2, style: 'curved' }],
      level: ult,
      tag: AbilityTag.ENHANCE,
    },
    talent: {
      trace: 'Talent',
      title: `Ninja Tech: Endurance Gauge`,
      content: `When enemy targets' Weakness are Broken, Rappa deals Break DMG equal to {{0}}% of Rappa's <b class="text-hsr-imaginary">Imaginary Break DMG</b> to them that additionally Bounces <span class="text-desc">2</span> time(s). Each instance of DMG deals Break DMG equal to {{1}}% of Rappa's <b class="text-hsr-imaginary">Imaginary Break DMG</b> and <span class="text-desc">5</span> Toughness Reduction regardless of Weakness Type to random enemy units. The Toughness Reduction effect only takes effect against enemy targets with Toughness greater than <span class="text-desc">0</span>. The added instances of DMG will prioritize targets with Toughness greater than <span class="text-desc">0</span>.
      <br />When inflicting Weakness Break, triggers the <b class="text-hsr-imaginary">Imaginary</b> Weakness Break effect.`,
      value: [
        { base: 120, growth: 6, style: 'curved' },
        { base: 50, growth: 2.5, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.BLAST,
    },
    technique: {
      trace: 'Technique',
      title: `Ninja Dash: By Leaps and Bounds`,
      content: `After using Technique, enters the Graffiti state for <span class="text-desc">20</span> seconds. While in the Graffiti state, move forward rapidly for a set distance and attack any enemies touched. Block all enemies' incoming during the movement. Using an attack in the Graffiti state can pre-emptively end the state's duration. After entering combat via attacking enemies, ignores Weakness Type to deal <span class="text-desc">30</span> Toughness Reduction to each enemy target, deals Break DMG equal to <span class="text-desc">200%</span> of Rappa's <b class="text-hsr-imaginary">Imaginary Break DMG</b> to the targets, and deals Break DMG equal to <span class="text-desc">180%</span> of Rappa's <b class="text-hsr-imaginary">Imaginary Break DMG</b> to the adjacent targets. At the same time, this unit regenerates <span class="text-desc">15</span> Energy.`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Ninjutsu Inscription: Sky High`,
      content: `When the Weakness of Elite enemy targets or greater is broken, Rappa regenerates <span class="text-desc">10</span> Energy.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Ninjutsu Inscription: Sea Echo`,
      content: `While in the <b>Sealform</b> state, after Rappa uses Enhanced Basic ATK to deal DMG to a Weakness Broken Enemy target, converts the Toughness Reduction from this instance of DMG to <span class="text-desc">1</span> instance of <span class="text-desc">60%</span> Super Break DMG.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Ninjutsu Inscription: Withered Leaf`,
      content: `When Enemy target becomes Weakness Broken, increases the Break DMG taken by <span class="text-desc">3%</span>. If Rappa's current ATK is higher than <span class="text-desc">2,000</span>, for every <span class="text-desc">100</span> of Rappa's current ATK that excess ATK, additionally increase this boost by <span class="text-desc">1%</span>, up to a max additional increase of <span class="text-desc">12%</span>. This effect lasts for <span class="text-desc">2</span> turn(s).`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Returned Is the Revenant With No Ferry Toll`,
      content: `When using Ultimate to enter the <b>Sealform</b> state, DMG dealt by Rappa ignores <span class="text-desc">15%</span> of the targets' DEF, and Rappa regenerates <span class="text-desc">20</span> Energy when she leaves the <b>Sealform</b> state.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Free Is the Mind Enlightened by Haikus`,
      content: `The Toughness Reduction of the first <span class="text-desc">2</span> hits of the Enhanced Basic ATK against the designated enemy unit increases by <span class="text-desc">50%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Many Are the Shrines That Repel No Hell`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Lost Is the Nindō Devoured by Time`,
      content: `While in the <b>Sealform</b> state, increases all Party units' SPD by <span class="text-desc">12%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Steady Is the Ranger With Unerring Arrows`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Righteous Is the Wrath That Spares No Evil`,
      content: `The Break DMG multiplier of the Talent's effect increases by <span class="text-desc">400%</span>on the enemy target that triggered it, and the number of additional instances of DMG increases by <span class="text-desc">1</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'sealform',
      text: `Sealform`,
      ...talents.ult,
      show: true,
      default: true,
      sync: true,
    },
    {
      type: 'toggle',
      id: 'rappa_a6',
      text: `A6 Break Vulnerability`,
      ...talents.a6,
      show: a.a6,
      default: true,
      debuff: true,
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

      if (form.sealform) base.BA_ALT = true

      base.BASIC_SCALING = form.sealform
        ? [
            {
              name: 'Max Single Target DMG',
              value: [{ scaling: calcScaling(0.6, 0.08, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              multiplier: 3,
              break: 25 + (c >= 2 ? 10 : 0),
              sum: true,
            },
            {
              name: 'Blast Main Target',
              value: [{ scaling: calcScaling(0.6, 0.08, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10 + (c >= 2 ? 5 : 0),
            },
            {
              name: 'Blast Adjacent',
              value: [{ scaling: calcScaling(0.3, 0.04, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 5,
            },
            {
              name: 'Final AoE',
              value: [{ scaling: calcScaling(0.6, 0.08, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 5,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
          ]
      base.SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.6, 0.06, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Max Single Target DMG',
          value: [],
          multiplier:
            calcScaling(2.2, 0.11, talent, 'curved') + (c >= 6 ? 4 + calcScaling(0.5, 0.025, talent, 'curved') : 0),
          element: Element.IMAGINARY,
          property: TalentProperty.BREAK,
          type: TalentType.TALENT,
          sum: true,
        },
        {
          name: 'Main Target',
          value: [],
          multiplier: calcScaling(1.2, 0.06, talent, 'curved') + (c >= 6 ? 4 : 0),
          element: Element.IMAGINARY,
          property: TalentProperty.BREAK,
          type: TalentType.TALENT,
        },
        {
          name: 'Bounce',
          value: [],
          multiplier: calcScaling(0.5, 0.025, talent, 'curved'),
          element: Element.IMAGINARY,
          property: TalentProperty.BREAK,
          type: TalentType.TALENT,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'Max Single Target DMG',
          value: [],
          multiplier: 5.6,
          element: Element.IMAGINARY,
          property: TalentProperty.BREAK,
          type: TalentType.TECH,
          sum: true,
        },
        {
          name: 'Main Target',
          value: [],
          multiplier: 2,
          element: Element.IMAGINARY,
          property: TalentProperty.BREAK,
          type: TalentType.TECH,
        },
        {
          name: 'Adjacent',
          value: [],
          multiplier: 1.8,
          element: Element.IMAGINARY,
          property: TalentProperty.BREAK,
          type: TalentType.TECH,
        },
      ]

      if (form.sealform) {
        base[Stats.BE].push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.1, 0.02, ult, 'curved'),
        })
        base.BREAK_EFF.push({
          name: 'Ultimate',
          source: 'Self',
          value: 0.5,
        })
        if (c >= 4) {
          base[Stats.P_SPD].push({
            name: 'Eidolon 4',
            source: 'Self',
            value: 0.12,
          })
        }
      }
      if (a.a4 && form.sealform) {
        base.SUPER_BREAK = true
        base.BASIC_SUPER_BREAK.push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.6,
        })
      }
      if (c >= 1) {
        base.DEF_PEN.push({
          name: 'Eidolon 1',
          source: 'Self',
          value: 0.15,
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
      broken: boolean
    ) => {
      if (form.sealform && c >= 4) {
        base[Stats.P_SPD].push({
          name: 'Eidolon 4',
          source: 'Rappa',
          value: 0.12,
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
      broken: boolean
    ) => {
      _.last(team).CALLBACK.push(function P99(b, d, w, all) {
        const x = all[index]
        _.forEach(all, (item) => {
          if (form.rappa_a6) {
            const base = _.min([_.max([0, x.getAtk() - 2000]) / 100, 12])
            const multiplier = 0.01
            item.BREAK_VUL.push({
              name: 'Ascension 6 Passive',
              source: 'Self',
              value: 0.03 + base * multiplier,
              base: `(${_.floor(base * 100).toLocaleString()} ÷ 100)`,
              multiplier,
              flat: '3%',
            })
          }
        })

        return b
      })

      return base
    },
  }
}

export default Rappa
