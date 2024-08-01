import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Feixiao = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: `Boltsunder`,
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Feixiao's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      trace: 'Skill',
      title: 'Waraxe',
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Feixiao's ATK to a single target enemy, then <u>Advances Forward</u> Feixiao's next action by {{1}}%.`,
      value: [
        { base: 120, growth: 12, style: 'curved' },
        { base: 5, growth: 0.5, style: 'curved' },
      ],
      level: skill,
    },
    ult: {
      trace: 'Ultimate',
      title: `Terrasplit`,
      content: `Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% - {{1}}% of Feixiao's ATK to a single enemy, reducing its Toughness regardless of Weakness Type. If the target is not Weakness Broken, Feixiao's Weakness Break Efficiency increases by <span class="text-desc">100%</span>.
        <br />During the attack, Feixiao first launches <b>Boltsunder Blitz</b> or <b>Waraxe Skyward</b> multiple times, until <b class="text-hsr-wind">Flying Aureus</b> is depleted.
        <br />After that, she launches the final hit: For every point of <b class="text-hsr-wind">Flying Aureus</b> consumed, deals <b class="text-hsr-wind">Wind DMG</b> equal to {{2}}% of Feixiao's ATK to the target. If the target is Weakness Broken, the DMG multiplier increases by {{3}}%.
        <br />From hit no. <span class="text-desc">6</span> onward, if the target's HP is <span class="text-desc">0</span>, reserves the remaining <b class="text-hsr-wind">Flying Aureus</b> and launches the final hit immediately.
        <br /><br /><b>Boltsunder Blitz</b>: Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{4}}% of Feixiao's ATK to a single enemy. If the target enemy is Weakness Broken, the DMG multiplier increases by {{5}}%.
        <br /><b>Waraxe Skyward</b>: Deals <b class="text-hsr-wind">Wind DMG</b> equal to {{4}}% of Feixiao's ATK to a single enemy. If the target enemy is not Weakness Broken, the DMG multiplier increases by {{5}}%.`,
      value: [
        { base: 504, growth: 33.6, style: 'curved' },
        { base: 1008, growth: 67.2, style: 'curved' },
        { base: 6, growth: 0.4, style: 'curved' },
        { base: 9, growth: 0.6, style: 'curved' },
        { base: 45, growth: 3, style: 'curved' },
        { base: 24, growth: 1.6, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Thunderhunt`,
      content: `The Ultimate can be activated when <b class="text-hsr-wind">Flying Aureus</b> reaches <span class="text-desc">6</span> points, up to <span class="text-desc">12</span> points. Feixiao gains <span class="text-desc">1</span> point of <b class="text-hsr-wind">Flying Aureus</b> for every <span class="text-desc">2</span> attacks used by allies. Attacks from Feixiao's Ultimate are not counted.
        <br />After other teammates use an attack, Feixiao launches <u>follow-up attacks</u> against the primary target, deals <b class="text-hsr-wind">Wind DMG</b> equal to {{0}}% of Feixiao's ATK. If no primary targets are available to attack, Feixiao attacks a single random enemy instead. This effect can only trigger <span class="text-desc">1</span> time per turn and the trigger count is reset at the start of Feixiao's turn.`,
      value: [{ base: 100, growth: 10, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: 'Stormborn',
      content: `After using the Technique, this character enters the Onrush state, lasting for <span class="text-desc">20</span> seconds. While in the Onrush state, this character pulls in enemies within a certain range, increases SPD by <span class="text-desc">35%</span>, and receives <span class="text-desc">1</span> point(s) of <b class="text-hsr-wind">Flying Aureus</b> after entering battle.
        <br />Active attacks in the Onrush state will strike all pulled enemies and enter combat. After entering battle, deal <b class="text-hsr-wind">Wind DMG</b> equal to <span class="text-desc">200%</span> of Feixiao's ATK to all enemies at the start of each wave. This DMG is guaranteed to CRIT. When more than <span class="text-desc">1</span> enemy is pulled in, increase the multiplier of this DMG by <span class="text-desc">100%</span> for each additional enemy pulled in, up to an increase of <span class="text-desc">1,000%</span>.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Heavenpath`,
      content: `Receive <span class="text-desc">4</span> point(s) of <b class="text-hsr-wind">Flying Aureus</b> at the start of the battle. If there are no teammates active in battle on the field at the start of a turn, receive <span class="text-desc">1</span> point of <b class="text-hsr-wind">Flying Aureus</b>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Formshift`,
      content: `When dealing DMG to enemy targets via launching this unit's Ultimate, it will be considered as launching a <u>follow-up attack</u>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Boltcatch`,
      content: `<u>Follow-up attack</u> CRIT DMG increases by <span class="text-desc">60%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Skyward I Quell`,
      content: `When using Ultimate, for each point of <b class="text-hsr-wind">Flying Aureus</b> consumed, the final hit additionally deals <b class="text-hsr-wind">Wind DMG</b> equal to <span class="text-desc">30%</span> of Feixiao's ATK to a random enemy.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Moonward I Wish`,
      content: `In Talent's effect, the attack count required to gain <b class="text-hsr-wind">Flying Aureus</b> reduces by <span class="text-desc">1</span> count(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Starward I Bode`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Stormward I Hear`,
      content: `When Basic ATK or Skill deals DMG to the enemy target, it will be considered as a <u>follow-up attack</u>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Heavenward I Leap`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Homeward I Near`,
      content: `Increases <u>follow-up attacks</u>' <b class="text-hsr-wind">Wind RES PEN</b> by <span class="text-desc">20%</span>. Increases the DMG multiplier of the Talent's <u>follow-up attack</u> by <span class="text-desc">360%</span>, and the DMG dealt is considered as Ultimate DMG.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'aureus',
      text: `Flying Aureus Consumed`,
      ...talents.ult,
      show: true,
      default: 6,
      min: 6,
      max: 12,
      unique: true,
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
          element: Element.WIND,
          property: c >= 4 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.2, 0.12, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: c >= 4 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
      ]
      const c1Scaling =
        c >= 1
          ? [
              {
                name: 'E1 Total Bounce DMG',
                value: [{ scaling: 0.3, multiplier: Stats.ATK }],
                element: Element.WIND,
                property: a.a4 ? TalentProperty.FUA : TalentProperty.NORMAL,
                type: TalentType.ULT,
                multiplier: form.aureus,
                sum: true,
              },
            ]
          : []
      const hitScaling = (buff: boolean) =>
        calcScaling(0.45, 0.03, ult, 'curved') + (buff ? calcScaling(0.24, 0.016, ult, 'curved') : 0)
      const finalScaling = (buff: boolean) =>
        calcScaling(0.06, 0.004, ult, 'curved') + (buff ? calcScaling(0.09, 0.006, ult, 'curved') : 0)
      base.ULT_SCALING = [
        {
          name: 'Max Single Target DMG',
          value: [{ scaling: (hitScaling(true) + finalScaling(true)) * form.aureus, multiplier: Stats.ATK }],
          element: Element.WIND,
          property: a.a4 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 5 * (form.aureus + 1),
          sum: true,
        },
        {
          name: 'Boltsunder Blitz DMG',
          value: [{ scaling: hitScaling(broken), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: a.a4 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 5,
        },
        {
          name: 'Waraxe Skyward DMG',
          value: [{ scaling: hitScaling(!broken), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: a.a4 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 5,
        },
        {
          name: 'Final Hit DMG',
          value: [{ scaling: finalScaling(broken), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: a.a4 ? TalentProperty.FUA : TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 5,
          multiplier: form.aureus,
        },
        ...c1Scaling,
      ]
      base.TALENT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1, 0.1, talent, 'curved') + (c >= 6 ? 3.6 : 0), multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.FUA,
          type: c >= 6 ? TalentType.ULT : TalentType.TALENT,
          break: 5,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'Min AoE',
          value: [{ scaling: 2, multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 10,
          overrideCr: 1,
          sum: true,
        },
        {
          name: 'Max AoE',
          value: [{ scaling: 10, multiplier: Stats.ATK }],
          element: Element.WIND,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 10,
          overrideCr: 1,
        },
      ]

      if (a.a6) {
        base.FUA_CD.push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.6,
        })
      }
      if (c >= 6) {
        base.WIND_RES_PEN.push({
          name: 'Eidolon 6',
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

export default Feixiao
