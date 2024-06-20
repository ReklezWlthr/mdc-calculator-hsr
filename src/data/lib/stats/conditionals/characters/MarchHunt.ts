import { findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

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
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of March 7th's ATK to a single enemy and gains 1<span class="text-desc">1</span> <b>Charge(s)</b>.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    normal_alt: {
      energy: 20,
      trace: 'Enhanced Basic ATK',
      title: 'Brows Be Smitten, Heart Be Bitten',
      content: `This attack deals <span class="text-desc">3</span> Hits Per Action initially. Each hit against the target enemy deals Imaginary DMG equal to {{0}}% of March 7th's ATK. After dealing the final hit, there is a <span class="text-desc">60%</span> <u>fixed chance</u> to deal <span class="text-desc">1</span> extra hit, up to <span class="text-desc">3</span> extra hit(s). Energy regenerated from using Enhanced Basic ATK does not increase with the number of Hits Per Action.
      <br />Enhanced Basic ATK cannot recover Skill Points.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Master, It's Tea Time!`,
      content: `Designates a single ally (excluding this character) as the <b class="text-hsr-imaginary">Master</b> and increases <b class="text-hsr-imaginary">Master</b>'s SPD by {{0}}%. Only the latest target of March 7th's Skill will be regarded as her "<b class="text-hsr-imaginary">Master</b>."
      <br />When using Basic ATK or dealing DMG from <span class="text-desc">1</span> hit of her Enhanced Basic ATK, triggers the following effects based on the specific Path of the <b class="text-hsr-imaginary">Master</b>:
      <br />Erudition, Destruction, The Hunt: Additionally deals Additional DMG (Combat Type based on the <b class="text-hsr-imaginary">Master</b>'s Combat Type) equal to {{1}}% of March 7th's ATK.
      <br />Harmony, Nihility, Preservation, Abundance: The Toughness Reduction for this DMG increases by <span class="text-desc">100%</span>.`,
      value: [
        { base: 6, growth: 0.4, style: 'curved' },
        { base: 10, growth: 1, style: 'curved' },
      ],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'March 7th, the Apex Heroine',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of March 7th's ATK to a single target enemy.
      <br />Increases the initial Hits Per Action of the next Enhanced Basic ATK by <span class="text-desc">2</span> hits and increase the <u>fixed chance</u> of additionally dealing DMG by <span class="text-desc">20%</span>.`,
      value: [{ base: 144, growth: 9.6, style: 'curved' }],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Master, I've Ascended!`,
      content: `After the <b class="text-hsr-imaginary">Master</b> uses an attack or Ultimate, March 7th gains up to <span class="text-desc">1</span> <b>Charge</b> each time.
      <br />When the <b>Charge</b> is at <span class="text-desc">7</span> or more, March 7th immediately takes action again, and increases the DMG she deals by {{0}}%. Her Basic ATK is Enhanced, and only her Enhanced Basic ATK can be used. After using Enhanced Basic ATK, consumes <span class="text-desc">7</span> <b>Charge</b>.`,
      value: [{ base: 40, growth: 4, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'Feast in One Go',
      content: `If March 7th is in the team, every time an ally uses Technique, March 7th gains a <b>Charge</b> upon entering the next battle, up to <span class="text-desc">3</span> <b>Charge(s)</b>.
      <br />After using her Technique, March 7th regenerates <span class="text-desc">30</span> Energy upon entering the next battle.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Gliding Waves',
      content: `When <b class="text-hsr-imaginary">Master</b> is on the field, increases March 7th's SPD by <span class="text-desc">10%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Acute Smarts',
      content: `March 7th can reduce the Toughness of enemies with Weakness of <b class="text-hsr-imaginary">Master</b>'s Type. When inflicting Weakness Break, also triggers the <b class="text-hsr-imaginary">Imaginary</b> Weakness Break effect.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Soaring Swan',
      content: `When the battle starts, March 7th's action is Advanced Forward by <span class="text-desc">25%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'My Sword Stirs Starlight',
      content: `After using Ultimate, increases the CRIT DMG of the next Enhanced Basic ATK by <span class="text-desc">36%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Blade Dances on Waves' Fight`,
      content: `After the <b class="text-hsr-imaginary">Master</b> uses their Basic ATK or Skill to attack an enemy, March 7th immediately launches a follow-up attack and deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to <span class="text-desc">60%</span> of March 7th's ATK to the target enemy. Additionally, triggers an effect corresponding to <b class="text-hsr-imaginary">Master</b>'s Path and gains <span class="text-desc">1</span> Charge(s). If there is no target enemy that can be attacked, March 7th attacks a random enemy. This effect can only be triggered once per turn.`,
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
      content: `After using Enhanced Basic ATK, increases the <b class="text-hsr-imaginary">Master</b>'s CRIT DMG by <span class="text-desc">60%</span> and Break Effect by <span class="text-desc">36%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
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
      id: 'h_march_c1',
      text: `E1 CRIT DMG Bonus`,
      ...talents.c1,
      show: c >= 1,
      default: true,
    },
  ]

  const teammateContent: IContent[] = []

  const allyContent: IContent[] = [
    {
      type: 'toggle',
      id: 'march_master',
      text: `March's Master`,
      ...talents.skill,
      show: true,
      default: false,
    },
    {
      type: 'toggle',
      id: 'h_march_c6',
      text: `E6 Master's Bonus`,
      ...talents.c6,
      duration: 2,
      show: c >= 6,
      default: true,
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
              name: 'Initial DMG',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              multiplier: form.h_march_ult ? 5 : 3,
              break: 5 * (form.h_march_ult ? 5 : 3),
            },
            {
              name: 'Extra Attack DMG [x3]',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 5,
              chance: { base: form.h_march_ult ? 0.8 : 0.6, fixed: true },
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
        },
      ]

      if (form.march_enhance) {
        base.BA_ALT = true
        base[Stats.ALL_DMG].push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.4, 0.04, skill, 'curved'),
        })
        if (form.h_march_c1)
          base.BASIC_CD.push({
            name: `Eidolon 1`,
            source: 'Self',
            value: 0.36,
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
      if (aForm.march_master && aForm.h_march_c6) {
        base[Stats.CRIT_DMG].push({
          name: `Eidolon 6`,
          source: 'March 7th',
          value: 0.6,
        })
        base[Stats.BE].push({
          name: `Eidolon 6`,
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
        if (a.a2)
          base[Stats.P_SPD].push({
            name: 'Ascension 2 Passive',
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
          })
        if (_.includes([PathType.DESTRUCTION, PathType.HUNT, PathType.ERUDITION], team[masterIndex].PATH)) {
          base.CALLBACK.push((x, _d, _w, all) => {
            const add = {
              name: `${team[masterIndex].NAME}'s Additional DMG`,
              value: [
                {
                  scaling: calcScaling(0.1, 0.01, ult, 'curved'),
                  multiplier: Stats.ATK,
                  override: all[masterIndex].getAtk(),
                },
              ],
              element: team[masterIndex].ELEMENT,
              property: TalentProperty.ADD,
              type: TalentType.NONE,
            }
            x.BASIC_SCALING.push(add)
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
