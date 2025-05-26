import { addDebuff, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Archer = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: 'Kanshou and Bakuya',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Archer's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Caladbolg: Fake Spiral Sword',
      content: `Enters the <b>Circuit Connection</b> state. Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Archer's ATK to one designated enemy target.
      In the <b>Circuit Connection</b> state, the turn does not end after using Skill, and increases the DMG dealt by Archer's Skill by {{1}}%. This effect can be stacked up to <span class="text-desc">2</span> times, lasting until he exits the <b>Circuit Connection</b> state.
      After actively using Skill <span class="text-desc">5</span> times or when there are insufficient Skill Points, using Skill again causes him to exit the <b>Circuit Connection</b> state and ends the turn. Exits the <b>Circuit Connection</b> state after all enemies have been defeated in each wave.`,
      value: [
        { base: 200, growth: 20, style: 'curved' },
        { base: 60, growth: 4, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.ST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Unlimited Blade Works',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Archer's ATK to one designated enemy and gains <span class="text-desc">2</span> <b>Charge</b>, up to a maximum of <span class="text-desc">4</span> <b>Charge</b>.`,
      value: [{ base: 720, growth: 48, style: 'curved' }],
      level: ult,
      tag: AbilityTag.ST,
    },
    talent: {
      trace: 'Talent',
      title: `Mind's Eye (True)`,
      content: `When Archer's teammate attacks an enemy target, Archer consumes <span class="text-desc">1</span> <b>Charge</b> and immediately launches Follow-up ATK on the primary target, dealing <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Archer's ATK and recovering <span class="text-desc">1</span> Skill Point.`,
      value: [{ base: 120, growth: 12, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ST,
    },
    technique: {
      trace: 'Technique',
      title: 'Clairvoyance',
      content: `Immediately attacks the enemy. After entering combat, deals <b class="text-hsr-quantum">Quantum DMG</b> equal to <span class="text-desc">200%</span> of Archer's ATK to all enemies and gains <span class="text-desc">1</span> <b>Charge</b>.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Projection Magecraft',
      content: `When Archer is on the field, increases the maximum Skill Point limit by <span class="text-desc">1</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Hero of Justice',
      content: `When Archer enters battle, gains <span class="text-desc">1</span> <b>Charge</b>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Guardian',
      content: `After allies gain a Skill Point, if there are <span class="text-desc">4</span> Skill Points or more, increases Archer's CRIT DMG by <span class="text-desc">60%</span> for <span class="text-desc">1</span> turns.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'The Unreached Dream',
      content: `After using Skill <span class="text-desc">3</span> time(s) in a single turn, the next Skill use in the current turn will not consume Skill Points.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'The Unfulfilled Happiness',
      content: `Increases DMG dealt by Ultimate by <span class="text-desc">120%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'The Untamed Will',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'The Unsung Life',
      content: `If the target of the Ultimate does not possess <b class="text-hsr-quantum">Quantum</b> Weakness, <b class="text-hsr-quantum">Quantum</b> Weakness will be applied during the Ultimate and reduces the target's <b class="text-hsr-quantum">Quantum RES</b> by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'The Nameless Watch',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'The Endless Pilgrimage',
      content: `When the turn begins, immediately recovers <span class="text-desc">1</span> Skill Point for allies. Increases the maximum stacks for the DMG boost provided by his own Skill by <span class="text-desc">1</span> stacks. DMG dealt by his Skill ignores <span class="text-desc">20%</span> of DEF.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'archer_skill',
      text: `Skill Bonus Stacks`,
      ...talents.skill,
      show: true,
      default: 2,
      min: 0,
      max: c >= 6 ? 3 : 2,
    },
    {
      type: 'toggle',
      id: 'archer_a6',
      text: `A6 CRIT DMG Bonus`,
      ...talents.a6,
      show: a.a6,
      default: true,
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'archer_c4',
      text: `C4 Quantum Weakness Implant`,
      ...talents.c4,
      show: c >= 4,
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
      weakness: Element[]
    ) => {
      const base = _.cloneDeep(x)

      base.MAX_SP += 1

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(2, 0.2, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(7.2, 0.48, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.2, 0.12, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 10,
          sum: true,
        },
      ]

      if (form.archer_skill) {
        base.SKILL_DMG.push({
          name: `Skill`,
          source: 'Self',
          value: calcScaling(0.6, 0.04, skill, 'curved') * form.archer_skill,
        })
      }
      if (form.archer_a6) {
        base[Stats.CRIT_DMG].push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: 0.6,
        })
      }
      if (c >= 2) {
        base.ULT_DMG.push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 1.2,
        })
      }
      if (form.archer_c4) {
        base.QUANTUM_RES_RED.push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.1,
        })
        weakness.push(Element.QUANTUM)
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (c >= 6) {
        base.SKILL_DEF_PEN.push({
          name: `Eidolon 6`,
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
      debuffs: { type: DebuffTypes; count: number }[]
    ) => {
      base.MAX_SP += 1

      if (form.archer_c4) {
        base.QUANTUM_RES_RED.push({
          name: `Eidolon 4`,
          source: 'Archer',
          value: 0.1,
        })
      }

      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      team: StatsObject[],
      allForm: Record<string, any>[]
    ) => {
      return base
    },
  }
}

export default Archer
