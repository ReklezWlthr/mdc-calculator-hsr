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
      title: `Galespin Summersault`,
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Yunli's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Bladeborne Quake`,
      content: `Restores HP equal to {{2}}% of Yunli's ATK plus {{3}}, and deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Yunli's ATK to a single enemy target and <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Yunli's ATK to adjacent targets.`,
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
      content: `Consumes <span class="text-desc">120</span> Energy. Yunli gains Parry and Taunts all enemies, lasting until the end of the next turn of an ally or an enemy, and increases the CRIT DMG of Yunli's next Counter by {{3}}%. When the Counter Talent effect is triggered while Parry is active, it will be switched to a <b>Counter Intuit: Cull</b> effect and also dispel Parry. If no Counters are triggered while Parry is active, when the effect ends, Yunli will immediately launch a <b>Counter Intuit: Slash</b> effect on a random enemy target.
      <br /><b>Intuit: Slash</b>: Deals <b class="text-hsr-physical">Physical DMG</b> to the target equal to {{0}}% of Yunli's ATK, and deals <b class="text-hsr-physical">Physical DMG</b> to adjacent targets equal to {{1}}% of Yunli's ATK.
      <br /><b>Intuit: Cull</b>: Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Yunli's ATK to the target, and deals <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Yunli's ATK to adjacent targets. Then, additionally deals <span class="text-desc">6</span> instance(s) of DMG, with each instance dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{2}}% of Yunli's ATK to a random single enemy target.
      <br />When Yunli deals DMG through this ability, it will be viewed as Ultimate DMG.`,
      value: [
        { base: 120, growth: 8, style: 'curved' },
        { base: 60, growth: 4, style: 'curved' },
        { base: 36, growth: 2.4, style: 'curved' },
        { base: 60, growth: 4, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      energy: 10,
      trace: 'Talent',
      title: `Flashforge`,
      content: `When Yunli is attacked by an enemy target, additionally regenerates <span class="text-desc">15</span> Energy and immediately launches a Counter on the attacker, dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Yunli's ATK, and <b class="text-hsr-physical">Physical DMG</b> to adjacent targets equal to {{1}}% of Yunli's ATK.`,
      value: [
        { base: 60, growth: 6, style: 'curved' },
        { base: 30, growth: 3, style: 'curved' },
      ],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: `Posterior Precedence`,
      content: `Gains the Ward effect for <span class="text-desc">20</span> seconds. When entering combat by attacking enemies or receiving an attack, immediately inflicts <b>Intuit: Cull</b> on a random enemy target, and increases this attack's DMG by <span class="text-desc">80%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `True Sunder`,
      content: `When using a Counter, increases Yunli's ATK by <span class="text-desc">30%</span> for <span class="text-desc">1</span> turn.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Demon Quell`,
      content: `While in the Parry state, resists the Crowd Control debuff received and reduces DMG received by <span class="text-desc">20%</span>.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Fiery Wheel`,
      content: `Every time <span class="text-desc">1</span> <b>Intuit: Slash</b> is used, the next <b>Intuit: Slash</b> will become <b>Intuit: Cull</b>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Weathered Blade Does Not Sully`,
      content: `DMG from <b>Intuit: Slash</b> and <b>Intuit: Cull</b> increases by <span class="text-desc">20%</span>, and <b>Intuit: Cull</b>'s extra DMG Hits increases by <span class="text-desc">3</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `First Luster Breaks Dawn`,
      content: `When dealing DMG by launching a Counter, ignores <span class="text-desc">20%</span> of the target's DEF.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Mastlength Twirls Mountweight`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
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
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Walk in Blade, Talk in Zither`,
      content: `After using Ultimate, if the next unit to act is an enemy unit, <b>Intuit: Cull</b> will be triggered regardless if they attack Yunli, and when dealing DMG via <b>Intuit: Slash</b> or <b>Intuit: Cull</b>, increases Yunli's CRIT Rate by <span class="text-desc">15%</span> and <b class="text-hsr-physical">Physical RES PEN</b> by <span class="text-desc">20%</span>.`,
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
          value: [{ scaling: calcScaling(1.2, 0.08, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.ULT,
          break: 20,
          cr: c >= 6 ? 0.15 : 0,
          res_pen: c >= 6 ? 0.2 : 0,
        },
        {
          name: 'Intuit Adjacent',
          value: [{ scaling: calcScaling(0.6, 0.04, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.ULT,
          break: 10,
          cr: c >= 6 ? 0.15 : 0,
          res_pen: c >= 6 ? 0.2 : 0,
        },
        {
          name: `Cull Extra DMG [x${c >= 1 ? 9 : 6}]`,
          value: [{ scaling: calcScaling(0.36, 0.024, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.ULT,
          cr: c >= 6 ? 0.15 : 0,
          res_pen: c >= 6 ? 0.2 : 0,
        },
        {
          name: `Total Cull Extra DMG`,
          value: [{ scaling: calcScaling(0.36, 0.024, ult, 'curved'), multiplier: Stats.ATK }],
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
          value: [{ scaling: calcScaling(1.2, 0.08, ult, 'curved'), multiplier: Stats.ATK }],
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
          value: [{ scaling: calcScaling(0.6, 0.04, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.FUA,
          type: TalentType.ULT,
          bonus: 0.8,
          break: 10,
          cr: c >= 6 ? 0.15 : 0,
          res_pen: c >= 6 ? 0.2 : 0,
        },
      ]

      if (form.yunli_block) {
        base[Stats.CRIT_DMG].push({
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
