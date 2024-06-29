import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { add, chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Aventurine = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      energy: 20,
      trace: 'Basic ATK',
      title: `Straight Bet`,
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Aventurine's DEF to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Cornerstone Deluxe`,
      content: `Provides all allies with a <b class="text-indigo-300">Fortified Wager</b> shield that can block DMG equal to {{0}}% of Aventurine's DEF plus {{1}}, lasting for <span class="text-desc">3</span> turn(s). When repeatedly gaining <b class="text-indigo-300">Fortified Wager</b>, the <b class="text-indigo-300">Shield</b> effect can stack, up to <span class="text-desc">200%</span> of the <b class="text-indigo-300">Shield</b> provided by the current Skill.`,
      value: [
        { base: 16, growth: 1, style: 'heal' },
        { base: 80, growth: 48, style: 'flat' },
      ],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Roulette Shark`,
      content: `Randomly gains <span class="text-desc">1</span> to <span class="text-desc">7</span> points of <b>Blind Bet</b>. Then inflicts <b>Unnerved</b> on a single target enemy, lasting for <span class="text-desc">3</span> turn(s). And deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Aventurine's DEF to the single target enemy. When an ally hits an <b>Unnerved</b> enemy target, the CRIT DMG dealt increases by {{1}}%.`,
      value: [
        { base: 162, growth: 10.8, style: 'curved' },
        { base: 9, growth: 0.6, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      energy: c >= 4 ? 10 : 7,
      trace: 'Talent',
      title: `Shot Loaded Right`,
      content: `For any single ally with <b class="text-indigo-300">Fortified Wager</b>, their Effect RES increases by {{0}}%, and when they get attacked, Aventurine gains <span class="text-desc">1</span> point of <b>Blind Bet</b>. When Aventurine has <b class="text-indigo-300">Fortified Wager</b>, he can resist Crowd Control debuffs. This effect can trigger again after <span class="text-desc">2</span> turn(s). Aventurine additionally gains <span class="text-desc">1</span> point(s) of <b>Blind Bet</b> after getting attacked. Upon reaching <span class="text-desc">7</span> points of <b>Blind Bet</b>, Aventurine consumes the <span class="text-desc">7</span> points to launch a <span class="text-desc">7</span>-hit follow-up attack, with each hit dealing <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{1}}% of Aventurine's DEF to a single random enemy. <b>Blind Bet</b> is capped at <span class="text-desc">10</span> points.`,
      value: [
        { base: 25, growth: 2.5, style: 'curved' },
        { base: 12.5, growth: 1.25, style: 'curved' },
      ],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: `The Red or the Black`,
      content: `After using the Technique, <span class="text-desc">1</span> of the following effects will be granted:
      <br />There is a chance for DEF to increase by <span class="text-desc">24%</span>.
      <br />There is a high chance for DEF to increase by <span class="text-desc">36%</span>.
      <br />There is a small chance for DEF to increase by <span class="text-desc">60%</span>.
      <br />
      <br />When this Technique is used repeatedly, the acquired effect with the highest buff value is retained.
      <br />When the next battle starts, increases all allies' DEF by the corresponding value, lasting for <span class="text-desc">3</span> turn(s).`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Leverage`,
      content: `For every <span class="text-desc">100</span> of Aventurine's DEF that exceeds <span class="text-desc">1600</span>, increases his own CRIT Rate by <span class="text-desc">2%</span>, up to a maximum increase of <span class="text-desc">48%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Hot Hand`,
      content: `When battle starts, grants all allies a <b class="text-indigo-300">Fortified Wager</b> shield, whose <b class="text-indigo-300">Shield</b> effect is equal to <span class="text-desc">100%</span> of the one provided by the Skill, lasting for <span class="text-desc">3</span> turn(s).`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Bingo!`,
      content: `After an ally with <b class="text-indigo-300">Fortified Wager</b> launches a follow-up attack, Aventurine accumulates <span class="text-desc">1</span> Blind Bet point. This effect can trigger up to <span class="text-desc">3</span> time(s). And its trigger count resets at the start of Aventurine's turn. After Aventurine launches his Talent's follow-up attack, provides all allies with a <b class="text-indigo-300">Fortified Wager</b> that can block DMG equal to <span class="text-desc">7.2%</span> of Aventurine's DEF plus <span class="text-desc">96</span>, and additionally grants a <b class="text-indigo-300">Fortified Wager</b> that can block DMG equal to <span class="text-desc">7.2%</span> of Aventurine's DEF plus <span class="text-desc">96</span> to the ally with the lowest <b class="text-indigo-300">Shield</b> effect, lasting for 3<span class="text-desc">3</span> turns.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Prisoner's Dilemma`,
      content: `Increases CRIT DMG by <span class="text-desc">20%</span> for allies with <b class="text-indigo-300">Fortified Wager</b>. After using the Ultimate, provides all allies with a <b class="text-indigo-300">Fortified Wager</b> shield, whose <b class="text-indigo-300">Shield</b> effect is equal to <span class="text-desc">100%</span> of the one provided by the Skill, lasting for <span class="text-desc">3</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Bounded Rationality`,
      content: `When using Basic ATK, reduces the target's All-Type RES by <span class="text-desc">12%</span> for <span class="text-desc">3</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Droprate Maxing`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Unexpected Hanging Paradox`,
      content: `When triggering his Talent's follow-up attack, first increases Aventurine's DEF by <span class="text-desc">40%</span> for <span class="text-desc">2</span> turn(s), and additionally increases the Hits Per Action for his talent's follow-up attack by <span class="text-desc">3</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Ambiguity Aversion`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Stag Hunt Game`,
      content: `For every ally with a <b class="text-indigo-300">Shield</b>, the DMG dealt by Aventurine increases by <span class="text-desc">50%</span>, up to a maximum of <span class="text-desc">150%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'wager',
      text: `Fortified Wager`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'aven_ult',
      text: `Unnerved`,
      ...talents.ult,
      show: true,
      default: true,
      debuff: true,
      duration: 3,
    },
    {
      type: 'element',
      id: 'aven_tech',
      text: `Technique DEF Bonus`,
      ...talents.technique,
      show: true,
      default: '3',
      options: [
        { name: 'None', value: '0' },
        { name: '24%', value: '1' },
        { name: '36%', value: '2' },
        { name: '60%', value: '3' },
      ],
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'aven_c2',
      text: `E2 RES Reduction`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      debuff: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'aven_c4',
      text: `E4 DEF Bonus`,
      ...talents.c4,
      show: c >= 4,
      default: true,
      duration: 2,
    },
    {
      type: 'number',
      id: 'aven_c6',
      text: `Allies with Shield`,
      ...talents.c6,
      show: c >= 6,
      default: 3,
      min: 0,
      max: 3,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'aven_ult'),
    findContentById(content, 'aven_tech'),
    findContentById(content, 'aven_c2'),
  ]

  const allyContent: IContent[] = [findContentById(content, 'wager')]

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
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.DEF }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Fortified Wager Shield',
          value: [{ scaling: calcScaling(0.16, 0.01, skill, 'heal'), multiplier: Stats.DEF }],
          flat: calcScaling(80, 48, skill, 'flat'),
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
        },
        {
          name: 'Max Stackable Shield',
          value: [{ scaling: calcScaling(0.16, 0.01, skill, 'heal') * 2, multiplier: Stats.DEF }],
          flat: calcScaling(80, 48, skill, 'flat') * 2,
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.62, 0.108, skill, 'curved'), multiplier: Stats.DEF }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: `Bounce [x${c >= 4 ? 10 : 7}]`,
          value: [{ scaling: calcScaling(0.125, 0.0125, skill, 'curved'), multiplier: Stats.DEF }],
          element: Element.IMAGINARY,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 10 / 3,
        },
      ]

      if (form.wager) {
        base[Stats.E_RES].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.25, 0.025, talent, 'curved'),
        })
        if (c >= 1)
          base[Stats.CRIT_DMG].push({
            name: 'Eidolon 1',
            source: 'Self',
            value: 0.2,
          })
      }
      if (form.aven_ult) {
        base[Stats.CRIT_DMG].push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.09, 0.006, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.aven_tech)
        base[Stats.P_DEF].push({
          name: 'Technique',
          source: 'Self',
          value: form.aven_tech === 3 ? 0.6 : form.aven_tech === 2 ? 0.36 : 0.24,
        })
      if (a.a6)
        base.SKILL_SCALING.push(
          {
            name: 'A6 Shield',
            value: [{ scaling: 0.072, multiplier: Stats.DEF }],
            flat: 96,
            element: TalentProperty.SHIELD,
            property: TalentProperty.SHIELD,
            type: TalentType.NONE,
          },
          {
            name: 'A6 Extra Shield',
            value: [{ scaling: 0.072 * 2, multiplier: Stats.DEF }],
            flat: 96 * 2,
            element: TalentProperty.SHIELD,
            property: TalentProperty.SHIELD,
            type: TalentType.NONE,
          }
        )
      if (form.aven_c2) {
        base.ALL_TYPE_RES_RED.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.12,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.aven_c4)
        base[Stats.P_DEF].push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.4,
        })
      if (form.aven_c6)
        base[Stats.ALL_DMG].push({
          name: 'Eidolon 6',
          source: 'Self',
          value: 0.5 * form.aven_c6,
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
      if (aForm.wager) {
        base[Stats.E_RES].push({
          name: 'Talent',
          source: 'Aventurine',
          value: calcScaling(0.25, 0.025, talent, 'curved'),
        })
        if (c >= 1)
          base[Stats.CRIT_DMG].push({
            name: 'Eidolon 1',
            source: 'Aventurine',
            value: 0.2,
          })
      }
      if (form.aven_ult)
        base[Stats.CRIT_DMG].push({
          name: 'Ultimate',
          source: 'Aventurine',
          value: calcScaling(0.09, 0.006, ult, 'curved'),
        })
      if (form.aven_tech)
        base[Stats.P_DEF].push({
          name: 'Technique',
          source: 'Aventurine',
          value: form.aven_tech === 3 ? 0.6 : form.aven_tech === 2 ? 0.36 : 0.24,
        })
      if (form.aven_c2)
        base.ALL_TYPE_RES_RED.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.12,
        })

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
        base[Stats.CRIT_RATE].push({
          name: 'Ascension 2 Passive',
          source: 'Self',
          value: _.min([(_.max([base.getDef() - 1600, 0]) / 100) * 0.02, 0.48]),
        })

      return base
    },
  }
}

export default Aventurine
