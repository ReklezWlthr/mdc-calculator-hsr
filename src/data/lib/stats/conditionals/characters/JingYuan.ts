import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const JingYuan = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const names = _.map(team, (item) => findCharacter(item?.cId)?.name)
  const index = _.findIndex(team, (item) => item?.cId === '1202')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Glistening Light`,
      content: `Jing Yuan deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of his ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Rifting Zenith`,
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Jing Yuan's ATK to all enemies and increases <b class="text-hsr-lightning">Lightning-Lord</b>'s Hits Per Action by <span class="text-desc">2</span> for the next turn.`,
      value: [{ base: 50, growth: 5, style: 'curved' }],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Lightbringer',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Jing Yuan's ATK to all enemies and increases <b class="text-hsr-lightning">Lightning-Lord</b>'s Hits Per Action by <span class="text-desc">3</span> for the next turn.`,
      value: [{ base: 20, growth: 3, style: 'curved' }],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Prana Extirpated`,
      content: `Summons <b class="text-hsr-lightning">Lightning-Lord</b> at the start of the battle. <b class="text-hsr-lightning">Lightning-Lord</b> has <span class="text-desc">60</span> base SPD and <span class="text-desc">3</span> base Hits Per Action. When the <b class="text-hsr-lightning">Lightning-Lord</b> takes action, its hits are considered as <u>follow-up attack</u>s, with each hit dealing <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Jing Yuan's ATK to a random single enemy, and enemies adjacent to it also receive <b class="text-hsr-lightning">Lightning DMG</b> equal to <span class="text-desc">25%</span> of the DMG dealt to the target enemy.
      <br />The <b class="text-hsr-lightning">Lightning-Lord</b>'s Hits Per Action can reach a max of <span class="text-desc">10</span>. Every time <b class="text-hsr-lightning">Lightning-Lord</b>'s Hits Per Action increases by <span class="text-desc">1</span>, its SPD increases by <span class="text-desc">10</span>. After the <b class="text-hsr-lightning">Lightning-Lord</b>'s action ends, its SPD and Hits Per Action return to their base values.
      <br />When Jing Yuan is knocked down, the <b class="text-hsr-lightning">Lightning-Lord</b> will disappear.
      <br />When Jing Yuan is affected by Crowd Control debuff, the <b class="text-hsr-lightning">Lightning-Lord</b> is unable to take action.`,
      value: [{ base: 30, growth: 3, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'Spirit Invocation',
      content: `After the Technique is used, the <b class="text-hsr-lightning">Lightning-Lord</b>'s Hits Per Action in the first turn increases by <span class="text-desc">3</span> at the start of the next battle.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Battalia Crush`,
      content: `If the <b class="text-hsr-lightning">Lightning-Lord</b>'s Hits Per Action is greater or equal to <span class="text-desc">6</span> in the next turn, its CRIT DMG increases by <span class="text-desc">25%</span> for the next turn.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Savant Providence`,
      content: `At the start of the battle, immediately regenerates <span class="text-desc">15</span> Energy.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `War Marshal`,
      content: `After the Skill is used, the CRIT Rate increases by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Slash, Seas Split`,
      content: `When <b class="text-hsr-lightning">Lightning-Lord</b> attacks, the DMG multiplier on enemies adjacent to the target enemy increases by an extra amount equal to <span class="text-desc">25%</span> of the DMG multiplier against the target enemy.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Swing, Skies Squashed`,
      content: `After <b class="text-hsr-lightning">Lightning-Lord</b> takes action, DMG caused by Jing Yuan's Basic ATK, Skill, and Ultimate increases by <span class="text-desc">20%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Strike, Suns Subdued`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Spin, Stars Sieged`,
      content: `For each hit performed by the <b class="text-hsr-lightning">Lightning-Lord</b> when it takes action, Jing Yuan regenerates <span class="text-desc">2</span> Energy.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Stride, Spoils Seized`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Sweep, Souls Slain`,
      content: `Each hit performed by the <b class="text-hsr-lightning">Lightning-Lord</b> when it takes action will make the target enemy <b>Vulnerable</b>.
      <br />While <b>Vulnerable</b>, enemies receive <span class="text-desc">12%</span> more DMG until the end of the <b class="text-hsr-lightning">Lightning-Lord</b>'s current turn, stacking up to <span class="text-desc">3</span> time(s).`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'jingyuan_talent',
      text: `Lightning-Lord's Hits Per Action`,
      ...talents.talent,
      show: true,
      default: 3,
      min: 3,
      max: 10,
      unique: true,
    },
    {
      type: 'toggle',
      id: 'jingyuan_a6',
      text: `A6 CRIT Rate Bonus`,
      ...talents.a6,
      show: a.a6,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'jingyuan_c2',
      text: `E2 Self DMG Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      duration: 2,
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
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.5, 0.05, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.2, 0.08, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
      ]
      const vul =
        c >= 6
          ? _.reduce(Array(form.jingyuan_talent), (acc, _c, i) => acc + _.min([i + 1, 3]) * 0.12, 0) /
            form.jingyuan_talent
          : 0
      base.TALENT_SCALING = [
        {
          name: 'Bounce Main Per Hit',
          value: [{ scaling: calcScaling(0.33, 0.033, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 5,
          cd: form.jingyuan_talent >= 6 && a.a2 ? 0.25 : 0,
          vul,
        },
        {
          name: 'Bounce Adjacent Per Hit',
          value: [
            { scaling: calcScaling(0.33, 0.033, talent, 'curved') * (c >= 1 ? 0.5 : 0.25), multiplier: Stats.ATK },
          ],
          element: Element.LIGHTNING,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          cd: form.jingyuan_talent >= 6 && a.a2 ? 0.25 : 0,
          vul,
        },
        {
          name: 'Total Single Target',
          value: [{ scaling: calcScaling(0.33, 0.033, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 5 * form.jingyuan_talent,
          multiplier: form.jingyuan_talent,
          cd: form.jingyuan_talent >= 6 && a.a2 ? 0.25 : 0,
          vul,
          sum: true,
        },
        {
          name: 'Total Adjacent',
          value: [
            { scaling: calcScaling(0.33, 0.033, talent, 'curved') * (c >= 1 ? 0.5 : 0.25), multiplier: Stats.ATK },
          ],
          element: Element.LIGHTNING,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          multiplier: form.jingyuan_talent,
          cd: form.jingyuan_talent >= 6 && a.a2 ? 0.25 : 0,
          vul,
        },
      ]

      if (form.jingyuan_a6)
        base[Stats.CRIT_RATE].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.1,
        })
      if (form.jingyuan_c2) {
        base.BASIC_DMG.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.2,
        })
        base.SKILL_DMG.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.2,
        })
        base.ULT_DMG.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.2,
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

export default JingYuan
