import { addDebuff, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/data_format'
import { IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
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

  const index = _.findIndex(team, (item) => item?.cId === '1102')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Thwack',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Seele's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Sheathed Blade',
      content: `Increases Seele's SPD by <span class="text-desc">25%</span> for <span class="text-desc">3</span> turn(s) and deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Seele's ATK to one designated enemy target.
      <br />After an ally target attacks, if the attack target's current HP percentage is <span class="text-desc">50%</span> or below, Seele will automatically use her Skill at that target <span class="text-desc">1</span> time. This Skill does not consume Skill Points or regenerate Energy. This effect can only be triggered <span class="text-desc">1</span> time per turn and resets at the start of Seele's turn. If there are no valid targets to attack, she attacks the enemy target with the lowest HP percentage instead.`,
      value: [{ base: 180, growth: 18, style: 'curved' }],
      level: skill,
      tag: AbilityTag.ST,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Butterfly Flurry',
      content: `Seele enters the Amplification state and deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of her ATK to a single enemy.`,
      value: [{ base: 360, growth: 36, style: 'curved' }],
      level: ult,
      tag: AbilityTag.ST,
    },
    talent: {
      trace: 'Talent',
      title: 'Resurgence',
      content: `Enters the Amplification state upon defeating an enemy with Basic ATK, Skill, or Ultimate, and receives an extra turn. While in the Amplification state, the DMG dealt by Seele increases by {{0}}% for <span class="text-desc">3</span> turn(s).
      <br />Enemies defeated in the extra turn provided by <b>Resurgence</b> will not trigger another <b>Resurgence</b>.`,
      value: [{ base: 40, growth: 4, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: 'Phantom Illusion',
      content: `After using her Technique, Seele gains Stealth for <span class="text-desc">20</span> second(s). While Stealth is active, Seele cannot be detected by enemies. And when entering battle by attacking enemies, Seele will immediately enter the Amplification state and deals <b class="text-hsr-quantum">Quantum DMG</b> equal to Seele's Skill DMG multiplier to random enemy target <span class="text-desc">1</span> time. This DMG is a guaranteed CRIT Hit.`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Nightshade',
      content: `When defeating an enemy target, increases the wearer's DMG dealt by <span class="text-desc">50%</span>. This effect can stack up to <span class="text-desc">3</span> time(s) and lasts for <span class="text-desc">3</span> turn(s).`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Lacerate',
      content: `While Seele is in the Amplification state, her <b class="text-hsr-quantum">Quantum RES PEN</b> increases by <span class="text-desc">25%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Rippling Waves',
      content: `After using a Basic ATK, Seele's next action will be <u>Advanced Forward</u> by <span class="text-desc">20%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Extirpating Slash',
      content: `When dealing DMG to an enemy whose HP percentage is <span class="text-desc">80%</span> or lower, increases CRIT Rate by <span class="text-desc">15%</span>, and DMG ignores <span class="text-desc">20%</span> of target's DEF.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'Dancing Butterfly',
      content: `The SPD Boost effect of Seele's Skill can stack up to <span class="text-desc">2</span> time(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Dazzling Tumult',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Flitting Phantasm',
      content: `Seele regenerates <span class="text-desc">15</span> Energy when she defeats an enemy.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Piercing Shards',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Shattering Shambles',
      content: `After attacking with Ultimate, Seele inflicts <b class="text-hsr-quantum">Butterfly Flurry</b> on the target for <span class="text-desc">3</span> turn(s). Enemies targets in <b class="text-hsr-quantum">Butterfly Flurry</b> will additionally take <span class="text-desc">1</span> instance of <b class="text-true">True DMG</b> equal to <span class="text-desc">30%</span> of Seele's Ultimate DMG after receiving an attack. When the target under the <b class="text-hsr-quantum">Butterfly Flurry</b> state is defeated by any unit, Seele's Talent will also be triggered.
      <br />When Seele is knocked down, the <b class="text-hsr-quantum">Butterfly Flurry</b> inflicted on the enemies will be removed.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'resurgence',
      text: `Amplification State`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'seele_spd',
      text: `Skill SPD Boost`,
      ...talents.skill,
      show: c < 2,
      default: true,
      duration: 3,
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
      type: 'number',
      id: 'seele_a2',
      text: `A2 Dmg Bonus Stack`,
      ...talents.a2,
      show: a.a2,
      default: 1,
      min: 0,
      max: 3,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'seele_c1',
      text: `E1 CRIT Rate & DEF PEN`,
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
      }[],
    ) => {
      const base = _.cloneDeep(x)

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          energy: 20,
          sum: true,
          hitSplit: [0.3, 0.7],
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.8, 0.18, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          energy: 30,
          sum: true,
          hitSplit: [0.2, 0.1, 0.1, 0.6],
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(3.6, 0.36, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          energy: 5,
          sum: true,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.8, 0.18, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
          sum: true,
          cr: 1,
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
            value: 0.25,
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
        base[Stats.ALL_DMG].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.5 * form.seele_a2,
        })
      if (form.seele_c1) {
        base[Stats.CRIT_RATE].push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.15,
        })
        base.DEF_PEN.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.2,
        })
      }
      if (form.seele_c6) {
        base.ADD_DEBUFF.push({
          name: 'Butterfly Flurry',
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
    ) => {
      if (form.seele_c6) {
        base.ADD_DEBUFF.push({
          name: 'Butterfly Flurry',
          source: 'Seele',
        })
      }
      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      team: StatsObject[],
      allForm: Record<string, any>[],
    ) => {
      if (form.seele_c6) {
        _.forEach(team, (t) => {
          _.forEach(
            [
              t.BASIC_SCALING,
              t.SKILL_SCALING,
              t.ULT_SCALING,
              t.TALENT_SCALING,
              t.MEMO_SKILL_SCALING,
              t.MEMO_TALENT_SCALING,
            ],
            (s) => {
              const add = {
                name: 'Blutterfly Flurry Additional DMG',
                value: [{ scaling: calcScaling(3.6, 0.36, ult, 'curved') * 0.3, multiplier: Stats.ATK }],
                element: Element.QUANTUM,
                property: TalentProperty.TRUE,
                type: TalentType.NONE,
                overrideIndex: index,
                sum: true,
              }
              if (_.some(s, (item) => _.includes([TalentProperty.NORMAL, TalentProperty.FUA], item.property))) {
                s.push(add)
              }
              if (_.some(s, (item) => item.property === TalentProperty.SERVANT)) {
                s.push({
                  ...add,
                  name: add.name + ` (${t.SUMMON_STATS?.NAME})`,
                })
              }
            },
          )
        })
      }
      return base
    },
  }
}

export default Seele
