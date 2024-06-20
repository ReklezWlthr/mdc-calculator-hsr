import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { add, chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Boothill = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: `Skullcrush Spurs`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Boothill's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    normal_alt: {
      trace: 'Enhanced Basic ATK',
      title: `Fanning the Hammer`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Boothill's ATK to a single target enemy.
      <br />The Enhanced Basic Attack cannot recover Skill Points and can only target the enemy that is in the <b>Standoff</b>.`,
      value: [{ base: 110, growth: 22, style: 'linear' }],
      level: basic,
    },
    skill: {
      trace: 'Skill',
      title: `Sizzlin' Tango`,
      content: `Forces Boothill and a single target enemy into the <b>Standoff</b> state. Boothill's Basic ATK gets Enhanced, and he cannot use his Skill, lasting for <span class="text-desc">2</span> turn(s). This duration reduces by <span class="text-desc">1</span> at the start of Boothill's every turn.
      <br />The enemy target in the <b>Standoff</b> becomes Taunted. When this enemy target/Boothill gets attacked by the other party in the Standoff, the DMG they receive increases by {{0}}%/<span class="text-desc">15%</span>.
      <br />After this target is defeated or becomes Weakness Broken, Boothill gains <span class="text-desc">1</span> stack of <b>Pocket Trickshot</b>, then dispels the <b>Standoff</b>.
      <br />This Skill cannot regenerate Energy. After using this Skill, the current turn does not end.`,
      value: [{ base: 15, growth: 1.5, style: 'curved' }],
      level: skill,
    },
    ult: {
      trace: 'Ultimate',
      title: `Dust Devil's Sunset Rodeo`,
      content: `Applies <b class="text-hsr-physical">Physical</b> Weakness to a single target enemy, lasting for <span class="text-desc">2</span> turn(s).
      <br />Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Boothill's ATK to the target and delays their action by {{1}}%.`,
      value: [
        { base: 36, growth: 2.4, style: 'curved' },
        { base: 12, growth: 0.8, style: 'curved' },
        { base: 18, growth: 1.2, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Five Peas in a Pod`,
      content: `Each stack of <b>Pocket Trickshot</b> increases the Enhanced Basic Attack's Toughness Reduction by <span class="text-desc">50%</span>, stacking up to <span class="text-desc">3</span> time(s).
      <br />If the target is Weakness Broken when the Enhanced Basic Attack is used, based on the number of <b>Pocket Trickshot</b> stacks, deals Break DMG to this target equal to {{0}}%/{{1}}%/{{2}}% of Boothill's <b class="text-hsr-physical">Physical Break DMG</b>. The max Toughness taken into account for this DMG cannot exceed <span class="text-desc">16</span> times the base Toughness Reduction of the Basic Attack "Skullcrush Spurs."
      <br />After winning the battle, Boothill can retain <b>Pocket Trickshot</b> for the next battle.`,
      value: [
        { base: 35, growth: 3.5, style: 'curved' },
        { base: 60, growth: 6, style: 'curved' },
        { base: 85, growth: 8.5, style: 'curved' },
      ],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: `3-9x Smile`,
      content: `After the Technique is used, when casting the Skill for the first time in the next battle, applies the same <b class="text-hsr-physical">Physical</b> Weakness to the target as the one induced by the Ultimate, lasting for 2 turn(s).`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Ghost Load`,
      content: `Increase this character's CRIT Rate/CRIT DMG, by an amount equal to <span class="text-desc">10%</span>/<span class="text-desc">50%</span> of Break Effect, up to a max increase of <span class="text-desc">30%</span>/<span class="text-desc">150%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Above Snakes`,
      content: `Reduces the DMG this character receives from targets that are not in the <b>Standoff</b> by <span class="text-desc">30%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Point Blank`,
      content: `When in <b>Standoff</b> and gaining <b>Pocket Trickshot</b>, regenerates <span class="text-desc">10</span> Energy. Can also trigger this effect when gaining <b>Pocket Trickshot</b> stacks that exceed the max limit.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Dusty Trail's Lone Star`,
      content: `When the battle starts, obtains <span class="text-desc">1</span> stack of <b>Pocket Trickshot</b>. When Boothill deals DMG, ignores <span class="text-desc">16%</span> of the enemy target's DEF.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Milestonemonger`,
      content: `When in <b>Standoff</b> and gaining <b>Pocket Trickshot</b>, recovers <span class="text-desc">1</span> Skill Point(s) and increases Break Effect by <span class="text-desc">30%</span>, lasting for <span class="text-desc">2</span> turn(s). Can also trigger this effect when gaining <b>Pocket Trickshot</b> stacks that exceed the max limit. But cannot trigger repeatedly within one turn.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Marble Orchard's Guard`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Cold Cuts Chef`,
      content: `When the enemy target in the <b>Standoff</b> is attacked by Boothill, the DMG they receive additionally increases by <span class="text-desc">12%</span>. When Boothill is attacked by the enemy target in the <b>Standoff</b>, the effect of him receiving increased DMG is offset by <span class="text-desc">12%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Stump Speech`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Crowbar Hotel's Raccoon`,
      content: `When triggering the Talent's Break DMG, additionally deals Break DMG to the target equal to <span class="text-desc">40%</span> of the original DMG multiplier and additionally deals Break DMG to adjacent targets equal to <span class="text-desc">70%</span> of the original DMG multiplier.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'boothill_enhance',
      text: `Enhanced Basic ATK`,
      ...talents.skill,
      show: true,
      default: true,
      unique: true,
    },
    {
      type: 'number',
      id: 'trickshot',
      text: `Pocket Trickshot Stacks`,
      ...talents.talent,
      show: true,
      default: 1,
      min: 0,
      max: 3,
      unique: true,
    },
    {
      type: 'toggle',
      id: 'boothill_implant',
      text: `Physical Weakness Implant`,
      ...talents.ult,
      show: true,
      default: true,
      debuff: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'standoff',
      text: `Standoff`,
      ...talents.skill,
      show: true,
      default: true,
      debuff: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'boothill_c2',
      text: `E2 Break Effect Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'boothill_implant')]

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

      const breakScale =
        form.trickshot === 3
          ? calcScaling(0.85, 0.085, talent, 'curved')
          : form.trickshot === 2
          ? calcScaling(0.6, 0.06, talent, 'curved')
          : calcScaling(0.35, 0.035, talent, 'curved')
      const c6Scale =
        c >= 6
          ? [
              {
                name: 'E6 Main Add Break DMG',
                value: [],
                multiplier: breakScale * 0.4,
                element: Element.PHYSICAL,
                property: TalentProperty.BREAK,
                type: TalentType.NONE,
                toughCap: 16 * 30,
              },
              {
                name: 'E6 Adjacent Break DMG',
                value: [],
                multiplier: breakScale * 0.7,
                element: Element.PHYSICAL,
                property: TalentProperty.BREAK,
                type: TalentType.NONE,
                toughCap: 16 * 30,
              },
            ]
          : []
      const talentScale =
        broken && form.trickshot
          ? [
              {
                name: 'Additional Break DMG',
                value: [],
                multiplier: breakScale,
                element: Element.PHYSICAL,
                property: TalentProperty.BREAK,
                type: TalentType.NONE,
                toughCap: 16 * 30,
              },
              ...c6Scale,
            ]
          : []
      base.BASIC_SCALING = form.boothill_enhance
        ? [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(1.1, 0.22, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: (1 + form.trickshot * 0.5) * 20,
            },
            ...talentScale,
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.PHYSICAL,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
            },
          ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(2.4, 0.16, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
        },
      ]

      if (form.boothill_enhance) base.BA_ALT = true
      if (form.boothill_implant && !_.includes(weakness, Element.PHYSICAL)) {
        weakness.push(Element.PHYSICAL)
      }
      if (form.standoff) {
        base.VULNERABILITY.push({
          name: 'Skill',
          source: 'Self',
          value: calcScaling(0.15, 0.015, skill, 'curved') + (c >= 4 ? 0.12 : 0),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (c >= 1)
        base.DEF_PEN.push({
          name: 'Eidolon 1',
          source: 'Self',
          value: 0.16,
        })
      if (form.boothill_c2)
        base[Stats.BE].push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.3,
        })

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
      if (a.a2)
        base.CALLBACK.push((x) => {
          x[Stats.CRIT_RATE].push({
            name: 'Ascension 2 Passive',
            source: 'Self',
            value: _.min([0.1 * x.getValue(Stats.BE), 0.3]),
          })
          x[Stats.CRIT_DMG].push({
            name: 'Ascension 2 Passive',
            source: 'Self',
            value: _.min([0.5 * x.getValue(Stats.BE), 1.5]),
          })

          return x
        })
      return base
    },
  }
}

export default Boothill
