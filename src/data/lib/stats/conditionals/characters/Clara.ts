import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Clara = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: 'I Want to Help',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Clara's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      title: 'Svarog Watches Over You',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Clara's ATK to all enemies, and additionally deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Clara's ATK to enemies marked by Svarog with a <b>Mark of Counter</b>.
      <br />All <b>Marks of Counter</b> will be removed after this Skill is used.`,
      value: [{ base: 60, growth: 6, style: 'curved' }],
      level: skill,
    },
    ult: {
      title: `Promise, Not Command`,
      content: `After Clara uses Ultimate, DMG dealt to her is reduced by an extra {{0}}%, and she has greatly increased chances of being attacked by enemies for <span class="text-desc">2</span> turn(s).
      <br />In addition, Svarog's Counter is enhanced. When an ally is attacked, Svarog immediately launches a Counter, and its DMG multiplier against the enemy increases by {{1}}%. Enemies adjacent to it take <span class="text-desc">50%</span> of the DMG dealt to the target enemy. Enhanced Counter(s) can take effect <span class="text-desc">2</span> time(s).`,
      value: [
        { base: 15, growth: 1, style: 'curved' },
        { base: 96, growth: 6.4, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      title: `Because We're Family`,
      content: `Under the protection of Svarog, DMG taken by Clara when hit by enemy attacks is reduced by <span class="text-desc">10%</span>. Svarog will mark enemies who attack Clara with his Mark of Counter and retaliate with a Counter, dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Clara's ATK.`,
      value: [{ base: 80, growth: 8, style: 'curved' }],
      level: talent,
    },
    technique: {
      title: 'A Small Price for Victory',
      content: `Immediately attacks the enemy. Upon entering battle, the chance Clara will be attacked by enemies increases for <span class="text-desc">2</span> turn(s).`,
    },
    a2: {
      title: `A2: Kinship`,
      content: `When attacked, this character has a <span class="text-desc">35%</span> fixed chance to remove a debuff placed on them.`,
    },
    a4: {
      title: `A4: Under Protection`,
      content: `The chance to resist Crowd Control Debuffs increases by <span class="text-desc">35%</span>.`,
    },
    a6: {
      title: `A6: Revenge`,
      content: `Increases Svarog's Counter DMG by <span class="text-desc">30%</span>.`,
    },
    c1: {
      title: `E1: A Tall Figure`,
      content: `Using Skill will not remove Marks of Counter on the enemy.`,
    },
    c2: {
      title: `E2: A Tight Embrace`,
      content: `After using the Ultimate, ATK increases by <span class="text-desc">30%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c3: {
      title: `E3: Cold Steel Armor`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      title: `E4: Family's Warmth`,
      content: `After Clara is hit, the DMG taken by Clara is reduced by <span class="text-desc">30%</span>. This effect lasts until the start of her next turn.`,
    },
    c5: {
      title: `E5: A Small Promise`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      title: `E6: Long Company`,
      content: `After other allies are hit, Svarog also has a <span class="text-desc">50%</span> fixed chance to trigger a Counter on the attacker and mark them with a <b>Mark of Counter</b>. When using Ultimate, the number of Enhanced Counters increases by <span class="text-desc">1</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'mark_of_counter',
      text: `Mark of Counter`,
      ...talents.talent,
      show: true,
      default: true,
      unique: true,
    },
    {
      type: 'toggle',
      id: 'clara_ult',
      text: `Promise, Not Command`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'clara_tech',
      text: `Technique Aggro Bonus`,
      ...talents.technique,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'clara_c2',
      text: `E2 ATK Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'clara_c4',
      text: `E4 DMG Reduction`,
      ...talents.c4,
      show: c >= 4,
      default: true,
      duration: 1,
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
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 30,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [
            {
              scaling: calcScaling(0.6, 0.06, skill, 'curved') * (form.mark_of_counter ? 2 : 1),
              multiplier: Stats.ATK,
            },
          ],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 30,
        },
      ]
      const ult_adj = form.clara_ult
        ? [
            {
              name: 'Adjacent',
              value: [
                {
                  scaling: (calcScaling(0.8, 0.08, talent, 'curved') + calcScaling(0.96, 0.064, ult, 'curved')) * 0.5,
                  multiplier: Stats.ATK,
                },
              ],
              element: Element.PHYSICAL,
              property: TalentProperty.FUA,
              type: TalentType.TALENT,
              break: 60,
            },
          ]
        : []
      base.TALENT_SCALING = [
        {
          name: 'Counter',
          value: [
            {
              scaling:
                calcScaling(0.8, 0.08, talent, 'curved') +
                (form.clara_ult ? calcScaling(0.96, 0.064, talent, 'curved') : 0),
              multiplier: Stats.ATK,
            },
          ],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 60,
        },
        ...ult_adj,
      ]
      base.DMG_REDUCTION.push({
        name: 'Talent',
        source: 'Self',
        value: 0.1,
      })
      if (form.clara_ult) {
        base.DMG_REDUCTION.push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.15, 0.01, talent, 'curved'),
        })
        base.AGGRO.push({
          name: 'Ultimate',
          source: 'Self',
          value: 5,
        })
      }
      if (form.clara_tech)
        base.AGGRO.push({
          name: 'Technique',
          source: 'Self',
          value: 5,
        })
      if (a.a6)
        base.TALENT_DMG.push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.3,
        })
      if (form.clara_c2)
        base[Stats.P_ATK].push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.3,
        })
      if (form.clara_c4)
        base.DMG_REDUCTION.push({
          name: 'Eidolon 4',
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
      return base
    },
  }
}

export default Clara
