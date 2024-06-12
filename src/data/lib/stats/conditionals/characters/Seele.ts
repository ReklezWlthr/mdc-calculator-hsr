import { addDebuff, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Seele = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const talents: ITalent = {
    normal: {
      title: 'Thwack',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Seele's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      title: 'Sheathed Blade',
      content: `Increases Seele's SPD by <span class="text-desc">25%</span> for <span class="text-desc">2</span> turn(s) and deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Seele's ATK to a single enemy.`,
      value: [{ base: 110, growth: 11, style: 'curved' }],
      level: skill,
    },
    ult: {
      title: 'Butterfly Flurry',
      content: `Seele enters the buffed state and deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of her ATK to a single enemy.`,
      value: [{ base: 255, growth: 17, style: 'curved' }],
      level: ult,
    },
    talent: {
      title: 'Resurgence',
      content: `Enters the buffed state upon defeating an enemy with Basic ATK, Skill, or Ultimate, and receives an extra turn. While in the buffed state, the DMG of Seele's attacks increases by {{0}}% for 1 turn(s).
      <br />Enemies defeated in the extra turn provided by "Resurgence" will not trigger another "Resurgence."`,
      value: [{ base: 40, growth: 4, style: 'curved' }],
      level: talent,
    },
    technique: {
      title: 'Phantom Illusion',
      content: `After using her Technique, Seele gains Stealth for <span class="text-desc">20</span> second(s). While Stealth is active, Seele cannot be detected by enemies. And when entering battle by attacking enemies, Seele will immediately enter the buffed state.`,
    },
    a2: {
      title: 'A2: Nightshade',
      content: `When current HP percentage is <span class="text-desc">50%</span> or lower, reduces the chance of being attacked by enemies.`,
    },
    a4: {
      title: 'A4: Lacerate',
      content: `While Seele is in the buffed state, her <b class="text-hsr-quantum">Quantum RES PEN</b> increases by <span class="text-desc">20%</span>.`,
    },
    a6: {
      title: 'A6: Rippling Waves',
      content: `After using a Basic ATK, Seele's next action will be Advanced Forward by <span class="text-desc">20%</span>.`,
    },
    c1: {
      title: 'E1: Extirpating Slash',
      content: `When dealing DMG to an enemy whose HP percentage is <span class="text-desc">80%</span> or lower, CRIT Rate increases by <span class="text-desc">15%</span>.`,
    },
    c2: {
      title: 'E2: Dancing Butterfly',
      content: `The SPD Boost effect of Seele's Skill can stack up to <span class="text-desc">2</span> time(s).`,
    },
    c3: {
      title: 'E3: Dazzling Tumult',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      title: 'E4: Flitting Phantasm',
      content: `Seele regenerates <span class="text-desc">15</span> Energy when she defeats an enemy.`,
    },
    c5: {
      title: 'E5: Piercing Shards',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      title: 'E6: Shattering Shambles',
      content: `After Seele uses her Ultimate, inflict the target enemy with Butterfly Flurry for <span class="text-desc">1</span> turn(s). Enemies suffering from Butterfly Flurry will take Additional Quantum DMG equal to <span class="text-desc">15%</span> of Seele's Ultimate DMG every time they are attacked. If the target enemy is defeated by the Butterfly Flurry DMG triggered by other allies' attacks, Seele's Talent will not be triggered.
      <br />When Seele is knocked down, the Butterfly Flurry inflicted on the enemies will be removed.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'resurgence',
      text: `Resurgence Buffed State`,
      ...talents.talent,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'seele_spd',
      text: `Skill SPD Boost`,
      ...talents.skill,
      show: c < 2,
      default: true,
    },
    {
      type: 'number',
      id: 'seele_spd',
      text: `Skill SPD Boost`,
      ...talents.skill,
      show: c >= 2,
      default: 1,
      min: 0,
      max: 2,
    },
    {
      type: 'toggle',
      id: 'seele_a2',
      text: `Current HP <= 50%`,
      ...talents.a2,
      show: a.a2,
      default: false,
    },
    {
      type: 'toggle',
      id: 'seele_c1',
      text: `Target HP <= 80%`,
      ...talents.c1,
      show: c >= 1,
      default: false,
    },
    {
      type: 'toggle',
      id: 'seele_c6',
      text: `Butterfly Flurry`,
      ...talents.c6,
      show: c >= 6,
      default: true,
      debuff: true,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'seele_c6')]

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
      }[]
    ) => {
      const base = _.cloneDeep(x)

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 30,
          energy: 20,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.1, 0.11, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 60,
          energy: 30,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(2.55, 0.17, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 90,
          energy: 5,
        },
      ]

      if (form.resurgence) {
        base[Stats.ALL_DMG].push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.4, 0.04, talent, 'curved'),
        })
        if (a.a4)
          base.QUANTUM_RES_PEN.push({
            name: `Ascension 4 Passive`,
            source: 'Self',
            value: 0.2,
          })
      }
      if (form.seele_spd) {
        base[Stats.P_SPD].push({
          name: `Skill`,
          source: 'Self',
          value: form.seele_spd * 0.25,
        })
      }
      if (form.seele_a2)
        base.AGGRO.push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: -0.5,
        })
      if (form.seele_c1)
        base[Stats.CRIT_RATE].push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.15,
        })
      if (form.seele_c6) {
        base.ULT_SCALING.push({
          name: 'Butterfly Flurry DMG',
          value: [{ scaling: calcScaling(2.55, 0.17, ult, 'curved') * 0.15, multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.ADD,
          type: TalentType.ULT,
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
      debuffs: { type: DebuffTypes; count: number }[]
    ) => {
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

export default Seele
