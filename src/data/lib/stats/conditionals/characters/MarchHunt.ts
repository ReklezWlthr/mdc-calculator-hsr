import { findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'
import { PathType } from '../../../../../domain/constant'

const MarchHunt = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'My Sword Zaps Demons',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of March 7th's ATK to a single target enemy and gains <span class="text-desc">1</span> point(s) of <b>Charge</b>.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    normal_alt: {
      energy: 20,
      trace: 'Enhanced Basic ATK',
      title: 'Brows Be Smitten, Heart Be Bitten',
      content: `Initially, deals <span class="text-desc">3</span> hits, each causing <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of March 7th's ATK to a single target enemy. Whenever dealing the final hit, there is a <span class="text-desc">60%</span> <u>fixed chance</u> to deal <span class="text-desc">1</span> additional hit of DMG, up to a max of <span class="text-desc">3</span> additional hit(s). Energy regenerated from using Enhanced Basic ATK does not increase with the number of hits.
      <br />Enhanced Basic ATK cannot recover Skill Points.`,
      value: [{ base: 40, growth: 8, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Shifu, It's Tea Time!`,
      content: `Designates a single ally (excluding this unit) as <b class="text-hsr-imaginary">Shifu</b> and increases <b class="text-hsr-imaginary">Shifu</b>'s SPD by {{0}}%. Only the most recent target of March 7th's Skill is considered as <b class="text-hsr-imaginary">Shifu</b>.
      <br />When using Basic ATK or dealing <span class="text-desc">1</span> hit of Enhanced Basic ATK's DMG, triggers the corresponding effect if <b class="text-hsr-imaginary">Shifu</b> with the specified Path is present on the field:
      <br /><b>Erudition, Destruction, The Hunt</b>: Deals Additional DMG (DMG Type based on <b class="text-hsr-imaginary">Shifu</b>'s Combat Type) equal to {{1}}% of March 7th's ATK.
      <br /><b>Harmony, Nihility, Preservation, Abundance</b>: Increases the Toughness Reduction of this instance of DMG by <span class="text-desc">100%</span>.`,
      value: [
        { base: 6, growth: 0.4, style: 'curved' },
        { base: 10, growth: 1, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.SUPPORT,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'March 7th, the Apex Heroine',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of March 7th's ATK to a single target enemy.
      <br />Increases the initial Hits Per Action of the next Enhanced Basic ATK by <span class="text-desc">2</span> hits and increase the <u>fixed chance</u> of additionally dealing DMG by <span class="text-desc">20%</span>.`,
      value: [{ base: 144, growth: 9.6, style: 'curved' }],
      level: ult,
      tag: AbilityTag.ST,
    },
    talent: {
      trace: 'Talent',
      title: `Shifu, I've Ascended!`,
      content: `After <b class="text-hsr-imaginary">Shifu</b> uses an attack or Ultimate, March 7th gains up to <span class="text-desc">1</span> point of <b>Charge</b> each time.
      <br />Upon reaching <span class="text-desc">7</span> or more points of <b>Charge</b>, March 7th immediately takes action again and increases the DMG she deals by {{0}}%. Her Basic ATK gets Enhanced, and her Skill cannot be used. After using Enhanced Basic ATK, consumes <span class="text-desc">7</span> point(s) of <b>Charge</b>. <b>Charge</b> is capped at <span class="text-desc">10</span>.`,
      value: [{ base: 40, growth: 4, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: 'Feast in One Go',
      content: `If March 7th is in the team, she gains <span class="text-desc">1</span> point of <b>Charge</b> at the start of the next battle whenever an ally uses Technique, up to a max of <span class="text-desc">3</span> point(s).
      <br />After using Technique, March 7th regenerates <span class="text-desc">30</span> Energy when the next battle starts.`,
      tag: AbilityTag.ENHANCE,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Tide Tamer',
      content: `After using Enhanced Basic ATK, increases <b class="text-hsr-imaginary">Shifu</b>'s CRIT DMG by <span class="text-desc">60%</span> and Break Effect by <span class="text-desc">36%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Filigree',
      content: `March 7th can reduce the Toughness of enemies whose Weakness Type is the same as <b class="text-hsr-imaginary">Shifu</b>'s Combat Type. When Breaking Weakness, triggers the <b class="text-hsr-imaginary">Imaginary</b> Weakness Break effect.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Swan Soar',
      content: `When the battle starts, March 7th's action is <u>Advanced Forward</u> by <span class="text-desc">25%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'My Sword Stirs Starlight',
      content: `When <b class="text-hsr-imaginary">Shifu</b> is on the field, increases March 7th's SPD by <span class="text-desc">10%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Blade Dances on Waves' Fight`,
      content: `After <b class="text-hsr-imaginary">Shifu</b> uses their Basic ATK or Skill to attack an enemy, March 7th immediately launches a <u>follow-up attack</u> and deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to <span class="text-desc">60%</span> of March 7th's ATK to the primary target of this attack. Additionally, triggers the corresponding effect based on <b class="text-hsr-imaginary">Shifu</b>'s Path and then gains <span class="text-desc">1</span> point(s) of <b>Charge</b>. If there is no primary target available to attack, then attacks a single random enemy instead. This effect can only be triggered once per turn.`,
      energy: 5,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Sharp Wit in Martial Might',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Being Fabulous Never Frights',
      content: `At the start of the turn, regenerates <span class="text-desc">5</span> Energy.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Sword Delights, Sugar Blights`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Me, the Best Girl on Sight',
      content: `After using Ultimate, increases the CRIT DMG dealt by the next Enhanced Basic ATK by <span class="text-desc">50%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'march_enhance',
      text: `Enhanced Basic ATK`,
      ...talents.talent,
      show: true,
      default: true,
      sync: true,
    },
    {
      type: 'toggle',
      id: 'h_march_ult',
      text: `Ult Enhanced Basic ATK`,
      ...talents.ult,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'h_march_c6',
      text: `E6 CRIT DMG Bonus`,
      ...talents.c6,
      show: c >= 6,
      default: true,
    },
  ]

  const teammateContent: IContent[] = []

  const allyContent: IContent[] = [
    {
      type: 'toggle',
      id: 'march_master',
      text: `March's Shifu`,
      ...talents.skill,
      show: true,
      default: false,
    },
    {
      type: 'toggle',
      id: 'h_march_a6',
      text: `A6 Shifu's Bonus`,
      ...talents.a6,
      duration: 2,
      show: a.a6,
      default: false,
    },
  ]

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

      base.BASIC_SCALING = form.march_enhance
        ? [
            {
              name: 'Base DMG',
              value: [{ scaling: calcScaling(0.4, 0.08, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              multiplier: form.h_march_ult ? 5 : 3,
              break: 5 * (form.h_march_ult ? 5 : 3),
              hitSplit: form.h_march_ult ? [1 / 5, 1 / 5, 1 / 5, 1 / 5, 1 / 5] : [1 / 3, 1 / 3, 1 / 3],
            },
            {
              name: 'DMG Per Hit',
              value: [{ scaling: calcScaling(0.4, 0.08, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 5,
              chance: { base: form.h_march_ult ? 0.8 : 0.6, fixed: true },
            },
            {
              name: 'Max Single Target DMG',
              value: [{ scaling: calcScaling(0.4, 0.08, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              multiplier: form.h_march_ult ? 8 : 6,
              break: 5 * (form.h_march_ult ? 8 : 6),
              chance: { base: (form.h_march_ult ? 0.8 : 0.6) ** 3, fixed: true },
              sum: true,
              hitSplit: form.h_march_ult
                ? [0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125]
                : [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6],
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
              hitSplit: [0.4, 0.6],
            },
          ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.44, 0.096, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
      ]

      if (form.march_enhance) {
        base.BA_ALT = true
        base[Stats.ALL_DMG].push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.4, 0.04, talent, 'curved'),
        })
        if (form.h_march_c6)
          base.BASIC_CD.push({
            name: `Eidolon 6`,
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
      debuffs: { type: DebuffTypes; count: number }[],
      weakness: Element[],
      broken: boolean
    ) => {
      if (aForm.march_master && aForm.h_march_a6) {
        base[Stats.CRIT_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'March 7th',
          value: 0.6,
        })
        base[Stats.BE].push({
          name: `Ascension 6 Passive`,
          source: 'March 7th',
          value: 0.36,
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
      const masterIndex = _.findIndex(allForm, (item) => item.march_master)
      if (masterIndex >= 0) {
        team[masterIndex][Stats.P_SPD].push({
          name: 'Skill',
          source: 'March 7th',
          value: calcScaling(0.06, 0.004, skill, 'curved'),
        })
        if (c >= 1)
          base[Stats.P_SPD].push({
            name: 'Eidolon 1',
            source: 'Self',
            value: 0.1,
          })
        if (c >= 2)
          base.SKILL_SCALING.push({
            name: `E2 FuA DMG`,
            value: [{ scaling: 0.6, multiplier: Stats.ATK }],
            element: Element.IMAGINARY,
            property: TalentProperty.FUA,
            type: TalentType.NONE,
            break: 15,
            sum: true,
            hitSplit: [0.4, 0.6],
          })
        if (_.includes([PathType.DESTRUCTION, PathType.HUNT, PathType.ERUDITION], team[masterIndex].PATH)) {
          base.CALLBACK.push((x, _d, _w, all) => {
            const add = {
              name: `${team[masterIndex].NAME}'s Additional DMG`,
              value: [{ scaling: calcScaling(0.1, 0.01, ult, 'curved'), multiplier: Stats.ATK }],
              element: team[masterIndex].ELEMENT,
              property: TalentProperty.ADD,
              type: TalentType.NONE,
              sum: true,
            }
            x.BASIC_SCALING.push(
              { ...add, multiplier: form.h_march_ult ? 5 : 3, sum: false },
              {
                ...add,
                name: `${team[masterIndex].NAME}'s Maximum Additional DMG`,
                multiplier: form.h_march_ult ? 8 : 6,
              }
            )
            if (c >= 2) x.SKILL_SCALING.push(add)
            return x
          })
        } else {
          base.BASIC_SCALING = _.map(base.BASIC_SCALING, (item) => ({ ...item, break: item.break * 2 }))
          if (c >= 2) base.SKILL_SCALING = _.map(base.SKILL_SCALING, (item) => ({ ...item, break: item.break * 2 }))
        }
      }

      return base
    },
  }
}

export default MarchHunt
