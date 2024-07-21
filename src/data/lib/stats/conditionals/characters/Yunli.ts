import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Yunli = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: `Galespin Summersault`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Yunli's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Bladeborne Quake`,
      content: `Restores HP equal to {{2}}% of Yunli's ATK plus {{3}}. Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Yunli's ATK to a single target enemy and <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Yunli's ATK to adjacent targets.`,
      value: [
        { base: 60, growth: 6, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
        { base: 20, growth: 1.25, style: 'heal' },
        { base: 50, growth: 30, style: 'flat' },
      ],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Earthbind, Etherbreak`,
      content: `Consumes <span class="text-desc">120</span> Energy. Yunli gains Parry and Taunts all enemies, lasting until the end of the next ally's or enemy's turn. Increases the CRIT DMG dealt by Yunli's next Counter by {{3}}%. When triggering the Counter effect from Talent, launches the <b>Counter Intuit: Cull</b> instead and removes the Parry effect. If no Counter is triggered while Parry is active, Yunli will immediately launch the <b>Counter Intuit: Slash</b> on a random enemy target.
      <br /><b>Intuit: Slash</b>: Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Yunli's ATK to the target, and deals <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Yunli's ATK to adjacent targets.
      <br /><b>Intuit: Cull</b>: Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Yunli's ATK to the target, and deals <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Yunli's ATK to adjacent targets. Then, additionally deals <span class="text-desc">6</span> instances of DMG, each dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{2}}% of Yunli's ATK to a random single enemy.
      <br />When Yunli deals DMG via this ability, it will be viewed as Ultimate DMG.
      <br />Each instance of <b>Intuit: Cull</b>'s bounce DMG deals <span class="text-desc">25%</span> of the Toughness reduction DMG of this skill's central target DMG.`,
      value: [
        { base: 132, growth: 8.8, style: 'curved' },
        { base: 66, growth: 4.4, style: 'curved' },
        { base: 43.2, growth: 2.88, style: 'curved' },
        { base: 60, growth: 4, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      energy: 10,
      trace: 'Talent',
      title: `Flashforge`,
      content: `When Yunli gets attacked by an enemy target, additionally regenerates <span class="text-desc">15</span> Energy and immediately launches a Counter on the attacker, dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Yunli's ATK to the attacker, and <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Yunli's ATK to adjacent targets. If there is no immediate target to Counter, then Counters a random enemy target instead.`,
      value: [
        { base: 60, growth: 6, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
      ],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: `Posterior Precedence`,
      content: `This unit gains the Ward effect, lasting for <span class="text-desc">20</span> seconds. During this time, upon entering combat by either attacking enemies or receiving an attack, immediately casts <b>Intuit: Cull</b> on a random enemy, and increases the DMG dealt by this attack by <span class="text-desc">80%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `True Sunder`,
      content: `When using a Counter, increases Yunli's ATK by <span class="text-desc">30%</span>. lasting for <span class="text-desc">1</span> turn.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Demon Quell`,
      content: `While in the Parry state, resists the Crowd Control debuff received and reduces DMG received by <span class="text-desc">20%</span>.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Fiery Wheel`,
      content: `After each use of <b>Intuit: Slash</b>, the next <b>Intuit: Slash</b> will be replaced by <b>Intuit: Cull</b>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Weathered Blade Does Not Sully`,
      content: `Increases DMG dealt by <b>Intuit: Slash</b> and <b>Intuit: Cull</b> increases by <span class="text-desc">20%</span>. Increases the number of additional DMG instances for <b>Intuit: Cull</b> by <span class="text-desc">3</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `First Luster Breaks Dawn`,
      content: `When dealing DMG via Counter, ignores <span class="text-desc">20%</span> of the target's DEF.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Mastlength Twirls Mountweight`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Artisan's Ironsong`,
      content: `After launching <b>Intuit: Slash</b> or <b>Intuit: Cull</b>, increases this unit's Effect RES by <span class="text-desc">50%</span>, lasting for <span class="text-desc">1</span> turn(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Blade of Old Outlasts All`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Walk in Blade, Talk in Zither`,
      content: `While Parry is active, if an enemy actively uses their abilities, regardless of whether it attacks Yunli or not, it will trigger <b>Intuit: Cull</b> and remove the Parry effect. When dealing DMG via <b>Intuit: Slash</b> or <b>Intuit: Cull</b>, increases CRIT Rate by <span class="text-desc">15%</span> and <b class="text-hsr-physical">Physical RES PEN</b> by <span class="text-desc">20%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'yunli_block',
      text: `Parry State`,
      ...talents.ult,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'yunli_a6',
      text: `A6 ATK Bonus`,
      ...talents.a6,
      show: a.a6,
      default: true,
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'yunli_c4',
      text: `E4 Effect RES Bonus`,
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
          break: 10,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(0.6, 0.06, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.3, 0.03, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
        {
          name: 'Healing',
          value: [{ scaling: calcScaling(0.2, 0.0125, skill, 'heal'), multiplier: Stats.ATK }],
          flat: calcScaling(50, 30, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Intuit Main',
          value: [{ scaling: calcScaling(1.32, 0.088, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.ULT,
          break: 20,
          cr: c >= 6 ? 0.15 : 0,
          res_pen: c >= 6 ? 0.2 : 0,
        },
        {
          name: 'Intuit Adjacent',
          value: [{ scaling: calcScaling(0.66, 0.047, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.ULT,
          break: 10,
          cr: c >= 6 ? 0.15 : 0,
          res_pen: c >= 6 ? 0.2 : 0,
        },
        {
          name: `Cull Extra DMG`,
          value: [{ scaling: calcScaling(0.432, 0.0288, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.ULT,
          cr: c >= 6 ? 0.15 : 0,
          res_pen: c >= 6 ? 0.2 : 0,
          break: 5,
        },
        {
          name: `Total Cull Extra DMG`,
          value: [{ scaling: calcScaling(0.432, 0.0288, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.ULT,
          multiplier: c >= 1 ? 9 : 6,
          cr: c >= 6 ? 0.15 : 0,
          res_pen: c >= 6 ? 0.2 : 0,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Counter Main',
          value: [{ scaling: calcScaling(0.6, 0.06, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 10,
        },
        {
          name: 'Counter Adjacent',
          value: [{ scaling: calcScaling(0.3, 0.03, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 10,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'Intuit Main',
          value: [{ scaling: calcScaling(1.32, 0.088, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.ULT,
          bonus: 0.8,
          break: 20,
          cr: c >= 6 ? 0.15 : 0,
          res_pen: c >= 6 ? 0.2 : 0,
        },
        {
          name: 'Intuit Adjacent',
          value: [{ scaling: calcScaling(0.66, 0.044, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.ULT,
          bonus: 0.8,
          break: 10,
          cr: c >= 6 ? 0.15 : 0,
          res_pen: c >= 6 ? 0.2 : 0,
        },
        {
          name: `Cull Extra DMG`,
          value: [{ scaling: calcScaling(0.432, 0.0288, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.ULT,
          bonus: 0.8,
          cr: c >= 6 ? 0.15 : 0,
          res_pen: c >= 6 ? 0.2 : 0,
          break: 5,
        },
        {
          name: `Total Cull Extra DMG`,
          value: [{ scaling: calcScaling(0.432, 0.0288, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.ULT,
          bonus: 0.8,
          multiplier: c >= 1 ? 9 : 6,
          cr: c >= 6 ? 0.15 : 0,
          res_pen: c >= 6 ? 0.2 : 0,
        },
      ]

      if (form.yunli_block) {
        base.FUA_CD.push({
          name: 'Ultimate',
          source: 'Self',
          value: calcScaling(0.6, 0.04, ult, 'curved'),
        })
        if (a.a4)
          base.DMG_REDUCTION.push({
            name: 'Ascension 4 Passive',
            source: 'Self',
            value: 0.2,
          })
      }
      if (form.yunli_a6)
        base[Stats.P_ATK].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.3,
        })
      if (c >= 1)
        base.ULT_DMG.push({
          name: 'Eidolon 1',
          source: 'Self',
          value: 0.2,
        })
      if (c >= 2)
        base.FUA_DEF_PEN.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.2,
        })
      if (form.yunli_c4)
        base[Stats.E_RES].push({
          name: 'Eidolon 4',
          source: 'Self',
          value: 0.5,
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

export default Yunli
