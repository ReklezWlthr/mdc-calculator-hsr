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

const Topaz = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: `Deficit...	`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Topaz's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Difficulty Paying?',
      content: `Inflicts a single target enemy with a <b>Proof of Debt</b> status, increasing the DMG it takes from <u>follow-up attacks</u> by {{0}}%. <b>Proof of Debt</b> only takes effect on the most recent target it is applied to. If there are no enemies inflicted with <b>Proof of Debt</b> on the field when an ally's turn starts or when an ally takes action, Topaz will inflict a random enemy with <b>Proof of Debt</b>.
      <br />Numby deals <b class="text-hsr-fire">Fire DMG</b> equal to {{1}}% of Topaz's ATK to this target. Using this Skill to deal DMG is considered as launching a <u>follow-up attack</u>.`,
      value: [
        { base: 25, growth: 2.5, style: 'curved' },
        { base: 75, growth: 7.5, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.ST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Turn a Profit!`,
      content: `Numby enters the <b>Windfall Bonanza!</b> state and its DMG multiplier increases by {{0}}% and CRIT DMG increases by {{1}}%. Also, when enemies with <b>Proof of Debt</b> are hit by an ally's Basic ATK, Skill, or Ultimate, Numby's action is <u>Advanced Forward</u> by <span class="text-desc">50%</span>. Numby exits the <b>Windfall Bonanza!</b> state after using <span class="text-desc">2</span> attacks.`,
      value: [
        { base: 75, growth: 7.5, style: 'curved' },
        { base: 12.5, growth: 1.25, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.ENHANCE,
    },
    talent: {
      trace: 'Talent',
      title: `Trotter Market!?`,
      content: `Summons Numby at the start of battle. Numby has <span class="text-desc">80</span> SPD by default. When taking action, Numby launches <u>follow-up attacks</u> on a single enemy target afflicted with <b>Proof of Debt</b>, dealing <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Topaz's ATK.
      <br />When enemies afflicted with <b>Proof of Debt</b> receive an ally's <u>follow-up attacks</u>, Numby's action is <u>Advanced Forward</u> by <span class="text-desc">50%</span>. The action <u>Advance Forward</u> effect cannot be triggered during Numby's own turn.
      <br />When Topaz is downed, Numby disappears.`,
      value: [{ base: 75, growth: 7.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ST,
    },
    technique: {
      trace: 'Technique',
      title: 'Explicit Subsidy',
      content: `Summons Numby when Topaz enters the overworld. Numby will automatically search for Basic Treasures and Trotters within a set radius.
      <br />Using her Technique will regenerate <span class="text-desc">60</span> Energy for Topaz after Numby's first attack in the next battle.
      <br />If Topaz is still in the team after using her Technique and defeating overworld enemies, a small bonus amount of credits will be added to the earned credits. A maximum of <span class="text-desc">10,000</span> bonus credits can be received per calendar day.
      <br />After using her Technique and defeating enemies in Simulated Universe, additionally receive a small amount of Cosmic Fragments with a small chance to obtain <span class="text-desc">1</span> random Curio.`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Overdraft`,
      content: `When Topaz uses Basic ATK to deal DMG, it will be considered as a <u>follow-up attack</u>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Financial Turmoil`,
      content: `Increases Topaz and Numby's DMG dealt to enemy targets with <b class="text-hsr-fire">Fire</b> Weakness by <span class="text-desc">15%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Stonks Market`,
      content: `After Numby uses an attack while in the <b>Windfall Bonanza!</b> state, Topaz additionally regenerates <span class="text-desc">10</span> Energy.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Future Market`,
      content: `When enemies afflicted with <b>Proof of Debt</b> receive <u>follow-up attacks</u>, they will enter the <b>Debtor</b> state. This can take effect only once within a single action.
      <br />The <b>Debtor</b> state increases the CRIT DMG of <u>follow-up attacks</u> inflicted on the target enemies by <span class="text-desc">25%</span>, stacking up to <span class="text-desc">2</span> time(s). When <b>Proof of Debt</b> is removed, the <b>Debtor</b> state is also removed.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Bona Fide Acquisition`,
      content: `After Numby takes action and launches an attack, Topaz regenerates <span class="text-desc">5</span> Energy.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Seize the Big and Free the Small`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Agile Operation`,
      content: `After Numby's turn begins, Topaz's action is <u>Advanced Forward</u> by <span class="text-desc">20%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Inflationary Demand`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Incentive Mechanism`,
      content: `Numby's attack count during the <b>Windfall Bonanza!</b> state increases by <span class="text-desc">1</span>, and its <b class="text-hsr-fire">Fire RES PEN</b> increases by <span class="text-desc">10%</span> when it attacks.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'debt',
      text: `Proof of Debt`,
      ...talents.skill,
      show: true,
      default: true,
      debuff: true,
    },
    {
      type: 'number',
      id: 'debtor',
      text: `Debtor`,
      ...talents.c1,
      show: c >= 1,
      default: 2,
      min: 0,
      max: 2,
      debuff: true,
    },
    {
      type: 'toggle',
      id: 'windfall',
      text: `Windfall Bonanza!`,
      ...talents.ult,
      show: true,
      default: true,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'debt'), findContentById(content, 'debtor')]

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
          element: Element.FIRE,
          property: a.a2 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [
            {
              scaling:
                calcScaling(0.75, 0.075, skill, 'curved') +
                (form.windfall ? calcScaling(0.75, 0.075, ult, 'curved') : 0),
              multiplier: Stats.ATK,
            },
          ],
          element: Element.FIRE,
          property: TalentProperty.FUA,
          type: TalentType.SKILL,
          break: 20,
          res_pen: form.windfall && c >= 6 ? 0.1 : 0,
          cd: form.windfall ? calcScaling(0.125, 0.0125, ult, 'curved') : 0,
          sum: true,
          hitSplit: form.windfall
            ? [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.3]
            : [1 / 7, 1 / 7, 1 / 7, 1 / 7, 1 / 7, 1 / 7, 1 / 7],
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Single Target',
          value: [
            {
              scaling:
                calcScaling(0.75, 0.075, talent, 'curved') +
                (form.windfall ? calcScaling(0.75, 0.075, ult, 'curved') : 0),
              multiplier: Stats.ATK,
            },
          ],
          element: Element.FIRE,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 20,
          res_pen: form.windfall && c >= 6 ? 0.1 : 0,
          cd: form.windfall ? calcScaling(0.125, 0.0125, ult, 'curved') : 0,
          sum: true,
          hitSplit: form.windfall
            ? [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.3]
            : [1 / 7, 1 / 7, 1 / 7, 1 / 7, 1 / 7, 1 / 7, 1 / 7],
          summon: true,
        },
      ]

      if (form.debt) {
        base.FUA_VUL.push({
          name: 'Proof of Debt',
          source: 'Self',
          value: calcScaling(0.25, 0.025, skill, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.debtor) {
        base.FUA_CD.push({
          name: 'Debtor',
          source: 'Self',
          value: form.debtor * 0.25,
        })
        base.ADD_DEBUFF.push({
          name: 'Debtor',
          source: 'Self',
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
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
      if (form.debt)
        base.FUA_VUL.push({
          name: 'Proof of Debt',
          source: 'Topaz and Numby',
          value: calcScaling(0.25, 0.025, skill, 'curved'),
        })
      if (form.debtor) {
        base.FUA_CD.push({
          name: 'Debtor',
          source: 'Topaz and Numby',
          value: form.debtor * 0.25,
        })
        base.ADD_DEBUFF.push({
          name: 'Debtor',
          source: 'Topaz and Numby',
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
      if (a.a4 && _.includes(weakness, Element.FIRE))
        base[Stats.ALL_DMG].push({
          name: 'Ascension 4 Passive',
          source: 'Self',
          value: 0.15,
        })

      return base
    },
  }
}

export default Topaz
