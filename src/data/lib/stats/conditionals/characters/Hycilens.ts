import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Hycilens = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
  const index = _.findIndex(team, (item) => item?.cId === '1410')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Aeolian Mode: Echoes in Still Waters',
      content: `Deals <b class="text-hsr-physical">Physical DMG</b> equal to {{0}}% of Hysilens's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Overtone Hum: Chorus After Dark Tides',
      content: `Has a <span class="text-desc">100%</span> <u>base chance</u> to increase DMG taken by all enemies by {{0}}%, lasting for <span class="text-desc">3</span> turn(s), while dealing <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Hysilens's ATK to all enemies.`,
      value: [
        { base: 10, growth: 1, style: 'curved' },
        { base: 70, growth: 7, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Maelstrom Rhapsody',
      content: `Hycilens deploys a Zone that reduces enemy target's ATK by <span class="text-desc">15%</span> and DEF by {{0}}%, and deals <b class="text-hsr-physical">Physical DMG</b> equal to {{1}}% of Hysilens's ATK to all enemies.
      <br />Whenever an enemy target within the Zone takes DMG from DoT, Hysilens deals <b class="text-hsr-physical">Physical DoT</b> equal to {{2}}% of her ATK to them. The DoT cannot repeatedly trigger this effect, and this effect can be triggered up to <span class="text-desc">8</span> time(s) per turn or per ally target's single attack.
      <br />The Zone lasts for <span class="text-desc">3</span> turn(s), decreasing by <span class="text-desc">1</span> turn at the start of each turn. The Zone will be dispelled if Hysilens becomes knocked down.`,
      value: [
        { base: 15, growth: 1, style: 'curved' },
        { base: 120, growth: 8, style: 'curved' },
        { base: 32, growth: 5.28, style: 'hycilens' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: 'Sirenic Serenade',
      content: `When an ally target attacks, there is a <span class="text-desc">100%</span> <u>base chance</u> for Hysilens to inflict <b class="text-hsr-wind">Wind Shear</b>/<b class="text-hsr-physical">Bleed</b>/<b class="text-hsr-fire">Burn</b>/<b class="text-hsr-lightning">Shock</b> on the hit enemy target, prioritizing to inflict different states.
      <br />Under the <b class="text-hsr-wind">Wind Shear</b>/<b class="text-hsr-fire">Burn</b>/<b class="text-hsr-lightning">Shock</b> state, at the start of each turn, the enemy target takes <b class="text-hsr-wind">Wind</b>/<b class="text-hsr-fire">Fire</b>/<b class="text-hsr-lightning">Lightning DoT</b> equal to {{0}}% of Hysilens' ATK for <span class="text-desc">2</span> turn(s).
      <br />Under the <b class="text-hsr-physical">Bleed</b> state, at the start of each turn, the enemy target takes <b class="text-hsr-physical">Physical DoT</b> equal to <span class="text-desc">20%</span> of their Max HP, up to {{0}}% of Hysilens' ATK, lasting for <span class="text-desc">2</span> turn(s).`,
      value: [{ base: 10, growth: 1.65, style: 'hycilens' }],
      level: talent,
      tag: AbilityTag.ST,
    },
    technique: {
      trace: 'Technique',
      title: `At Ocean's Abode`,
      content: `After using Technique, creates a Special Dimension that lasts for <span class="text-desc">20</span> seconds and automatically moves forward. Enemies within the Special Dimension enter the <b>Soulstruck</b> state. Enemies in the <b>Soulstruck</b> state will not attack ally targets and will follow the dimension while it persists.
      <br />After entering battle with enemies in the <b>Soulstruck</b> state, there is a <span class="text-desc">100%</span> <u>base chance</u> for each enemy to be inflicted with <span class="text-desc">2</span> of the following states that is the same as Hysilens's Talent's effects: <b class="text-hsr-wind">Wind Shear</b>/<b class="text-hsr-physical">Bleed</b>/<b class="text-hsr-fire">Burn</b>/<b class="text-hsr-lightning">Shock</b>. Only <span class="text-desc">1</span> Dimension Effect created by allies can exist at a time.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'The Gladiorum of Conquest',
      content: `At the start of combat, Hysilens creates a Zone with the same effect as her Ultimate, lasting for <span class="text-desc">3</span> turns. Whenever Hysilens creates a Zone, she recovers <span class="text-desc">1</span> Skill Points.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'The Bubble of Banquets',
      content: `When Hysilens uses Ultimate, if the enemy target is currently afflicted with DoT(s), all DoTs currently applied on the target will immediately deal DMG equal to <span class="text-desc">150%</span> of their original DMG.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'The Fiddle of Pearls',
      content: `If Hysilens's Effect Hit Rate is above <span class="text-desc">60%</span>, for every <span class="text-desc">10%</span> exceeded , increases this unit's DMG by <span class="text-desc">15%</span>, up to <span class="text-desc">90%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'You Ask Why Hearts Cry',
      content: `While Hysilens is on the field, the DoT dealt by ally targets becomes <span class="text-desc">124%</span> of the original value.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Tell Me Why Waves Roar High`,
      content: `While the Zone is active, the DMG Boost effect from Trace <b>The Fiddle of Pearls</b> applies to all allies.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Why Do Lights Bid Goodbye',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Lo, How Time Flows By',
      content: `While the Zone is active, reduces <b>All-Type RES</b> of all enemies by <span class="text-desc">20%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `In Ablution, I Hum and Sigh`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'When to Return From Where You Lie',
      content: `When Hysilens inflicts <b class="text-hsr-wind">Wind Shear</b>/<b class="text-hsr-physical">Bleed</b>/<b class="text-hsr-fire">Burn</b>/<b class="text-hsr-lightning">Shock</b> state on enemies through Talent, there is a <span class="text-desc">100%</span> <u>base chance</u> to additionally inflict a <b class="text-hsr-wind">Wind Shear</b>/<b class="text-hsr-physical">Bleed</b>/<b class="text-hsr-fire">Burn</b>/<b class="text-hsr-lightning">Shock</b> state that is identical to and coexists with the original Talent effect. While the Zone is active, at the start of each turn or in each attack by an ally target, the maximum trigger count for Hysilens's <b class="text-hsr-physical">Physical DoT</b> effect increases to <span class="text-desc">12</span> times.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'hycilens_skill',
      text: `Skill Vulnerability`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 3,
      debuff: true,
      chance: { base: 1, fixed: false },
    },
    {
      type: 'toggle',
      id: 'hycilens_ult',
      text: `Hycilens Zone`,
      ...talents.ult,
      show: true,
      default: true,
      unique: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'hycilens_wind',
      text: `Hycilens's Wind Shear`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 2,
      debuff: true,
      chance: { base: 1, fixed: false },
    },
    {
      type: 'toggle',
      id: 'hycilens_shock',
      text: `Hycilens's Shock`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 2,
      debuff: true,
      chance: { base: 1, fixed: false },
    },
    {
      type: 'toggle',
      id: 'hycilens_burn',
      text: `Hycilens's Burn`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 2,
      debuff: true,
      chance: { base: 1, fixed: false },
    },
    {
      type: 'toggle',
      id: 'hycilens_bleed',
      text: `Hycilens's Bleed`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 2,
      debuff: true,
      chance: { base: 1, fixed: false },
    },
    {
      type: 'toggle',
      id: 'hycilens_e6_wind',
      text: `Hycilens's E6 Wind Shear`,
      ...talents.c6,
      show: c >= 6,
      default: true,
      duration: 2,
      debuff: true,
      chance: { base: 1, fixed: false },
    },
    {
      type: 'toggle',
      id: 'hycilens_e6_shock',
      text: `Hycilens's E6 Shock`,
      ...talents.c6,
      show: c >= 6,
      default: true,
      duration: 2,
      debuff: true,
      chance: { base: 1, fixed: false },
    },
    {
      type: 'toggle',
      id: 'hycilens_e6_burn',
      text: `Hycilens's E6 Burn`,
      ...talents.c6,
      show: c >= 6,
      default: true,
      duration: 2,
      debuff: true,
      chance: { base: 1, fixed: false },
    },
    {
      type: 'toggle',
      id: 'hycilens_e6_bleed',
      text: `Hycilens's E6 Bleed`,
      ...talents.c6,
      show: c >= 6,
      default: true,
      duration: 2,
      debuff: true,
      chance: { base: 1, fixed: false },
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'hycilens_skill'),
    findContentById(content, 'hycilens_ult'),
    findContentById(content, 'hycilens_wind'),
    findContentById(content, 'hycilens_shock'),
    findContentById(content, 'hycilens_burn'),
    findContentById(content, 'hycilens_bleed'),
    findContentById(content, 'hycilens_e6_wind'),
    findContentById(content, 'hycilens_e6_shock'),
    findContentById(content, 'hycilens_e6_burn'),
    findContentById(content, 'hycilens_e6_bleed'),
  ]

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
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.7, 0.07, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.2, 0.08, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
        },
        {
          name: `Zone DoT`,
          value: [{ scaling: calcScaling(0.32, 0.0528, ult, 'hycilens'), multiplier: Stats.ATK }],
          element: Element.PHYSICAL,
          property: TalentProperty.DOT,
          type: TalentType.NONE,
          sum: false,
        },
      ]
      base.TALENT_SCALING = []
      base.TECHNIQUE_SCALING = []

      const dot = {
        value: [{ scaling: calcScaling(0.1, 0.0165, talent, 'hycilens'), multiplier: Stats.ATK }],
        property: TalentProperty.DOT,
        type: TalentType.NONE,
        sum: false,
        chance: { base: 1, fixed: false },
      }

      if (form.hycilens_shock) {
        const shock = {
          ...dot,
          name: 'Shocked DMG',
          element: Element.LIGHTNING,
          debuffElement: Element.LIGHTNING,
        }
        base.TALENT_SCALING.push(shock)
        base.DOT_SCALING.push({ ...shock, overrideIndex: index, dotType: DebuffTypes.SHOCKED })
        addDebuff(debuffs, DebuffTypes.SHOCKED)
      }
      if (form.hycilens_burn) {
        const burn = {
          ...dot,
          name: 'Burn DMG',
          element: Element.FIRE,
          debuffElement: Element.FIRE,
        }
        base.TALENT_SCALING.push(burn)
        base.DOT_SCALING.push({ ...burn, overrideIndex: index, dotType: DebuffTypes.BURN })
        addDebuff(debuffs, DebuffTypes.BURN)
      }
      if (form.hycilens_wind) {
        const wind = {
          ...dot,
          name: 'Wind Shear DMG',
          element: Element.WIND,
          debuffElement: Element.WIND,
        }
        base.TALENT_SCALING.push(wind)
        base.DOT_SCALING.push({ ...wind, overrideIndex: index, dotType: DebuffTypes.WIND_SHEAR })
        addDebuff(debuffs, DebuffTypes.WIND_SHEAR)
      }
      if (form.hycilens_bleed) {
        const bleed = {
          ...dot,
          name: 'Bleed DMG',
          element: Element.PHYSICAL,
          debuffElement: Element.PHYSICAL,
          value: [{ scaling: 0.2, multiplier: Stats.EHP }],
          cap: { scaling: calcScaling(0.1, 0.0165, talent, 'hycilens'), multiplier: Stats.ATK },
        }
        base.TALENT_SCALING.push(bleed)
        base.DOT_SCALING.push({ ...bleed, overrideIndex: index, dotType: DebuffTypes.BLEED })
        addDebuff(debuffs, DebuffTypes.BLEED)
      }

      if (form.hycilens_e6_shock) {
        const shock = {
          ...dot,
          name: 'E6 Shocked DMG',
          element: Element.LIGHTNING,
          debuffElement: Element.LIGHTNING,
        }
        base.TALENT_SCALING.push(shock)
        base.DOT_SCALING.push({ ...shock, overrideIndex: index, dotType: DebuffTypes.SHOCKED })
        addDebuff(debuffs, DebuffTypes.SHOCKED)
      }
      if (form.hycilens_e6_burn) {
        const burn = {
          ...dot,
          name: 'E6 Burn DMG',
          element: Element.FIRE,
          debuffElement: Element.FIRE,
        }
        base.TALENT_SCALING.push(burn)
        base.DOT_SCALING.push({ ...burn, overrideIndex: index, dotType: DebuffTypes.BURN })
        addDebuff(debuffs, DebuffTypes.BURN)
      }
      if (form.hycilens_e6_wind) {
        const wind = {
          ...dot,
          name: 'E6 Wind Shear DMG',
          element: Element.WIND,
          debuffElement: Element.WIND,
        }
        base.TALENT_SCALING.push(wind)
        base.DOT_SCALING.push({ ...wind, overrideIndex: index, dotType: DebuffTypes.WIND_SHEAR })
        addDebuff(debuffs, DebuffTypes.WIND_SHEAR)
      }
      if (form.hycilens_e6_bleed) {
        const bleed = {
          ...dot,
          name: 'E6 Bleed DMG',
          element: Element.PHYSICAL,
          debuffElement: Element.PHYSICAL,
          value: [{ scaling: 0.2, multiplier: Stats.EHP }],
          cap: { scaling: calcScaling(0.1, 0.0165, talent, 'hycilens'), multiplier: Stats.ATK },
        }
        base.TALENT_SCALING.push(bleed)
        base.DOT_SCALING.push({ ...bleed, overrideIndex: index, dotType: DebuffTypes.BLEED })
        addDebuff(debuffs, DebuffTypes.BLEED)
      }

      if (form.hycilens_skill) {
        base.VULNERABILITY.push({
          name: `Skill`,
          source: 'Self',
          value: calcScaling(0.1, 0.01, skill, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.hycilens_ult) {
        base.ATK_REDUCTION.push({
          name: `Ultimate`,
          source: 'Self',
          value: 0.15,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)

        base.DEF_REDUCTION.push({
          name: `Ultimate`,
          source: 'Self',
          value: calcScaling(0.15, 0.01, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)

        if (c >= 4) {
          base.ALL_TYPE_RES_RED.push({
            name: `Eidolon 4`,
            source: 'Self',
            value: 0.2,
          })
          addDebuff(debuffs, DebuffTypes.OTHER)
        }
      }

      if (c >= 1) {
        base.DOT_MULT.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.24,
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
      if (form.hycilens_skill) {
        base.VULNERABILITY.push({
          name: `Skill`,
          source: 'Hycilens',
          value: calcScaling(0.1, 0.01, skill, 'curved'),
        })
      }
      if (form.hycilens_ult) {
        base.ATK_REDUCTION.push({
          name: `Ultimate`,
          source: 'Hycilens',
          value: 0.15,
        })

        base.DEF_REDUCTION.push({
          name: `Ultimate`,
          source: 'Hycilens',
          value: calcScaling(0.15, 0.01, ult, 'curved'),
        })

        if (c >= 4) {
          base.ALL_TYPE_RES_RED.push({
            name: `Eidolon 4`,
            source: 'Self',
            value: 0.2,
          })
        }
      }
      if (c >= 1) {
        base.DOT_MULT.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.24,
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
      if (a.a6) {
        base.CALLBACK.push((x, d, w, all) => {
          const ehr = _.max([0, x.getValue(Stats.EHR) - 0.6])
          const buff = {
            name: 'Ascension 6 Passive',
            source: 'Self',
            value: _.min([ehr * 1.5, 0.9]),
            base: toPercentage(_.min([ehr, 0.6])),
            multiplier: 1.5,
          }
          if (c >= 2) {
            _.forEach(all, (char) => char[Stats.ALL_DMG].push(buff))
          } else {
            x[Stats.ALL_DMG].push(buff)
          }
          return x
        })
      }

      base.CALLBACK.push(function P99(x, d, w, all) {
        _.map(all, (char) => {
          _.map([char.BASIC_SCALING, char.SKILL_SCALING, char.ULT_SCALING, char.TALENT_SCALING], (item) => {
            const dot = _.filter(item, (v) => v.property === TalentProperty.DOT && _.endsWith(v.name, 'Detonation'))
            if (_.size(dot)) {
              item.push({
                name: `Hycilens's Zone DoT`,
                value: [{ scaling: calcScaling(0.32, 0.0528, ult, 'hycilens'), multiplier: Stats.ATK }],
                multiplier: _.min([_.size(dot), c >= 6 ? 12 : 8]),
                element: Element.PHYSICAL,
                property: TalentProperty.DOT,
                type: TalentType.NONE,
                sum: true,
                detonate: true,
              })
            }
          })
        })

        return x
      })

      if (a.a4) {
        base.CALLBACK.push((x, d, w, all) => {
          const dots = _.flatMap(all, (item) => item.DOT_SCALING)
          x.ULT_SCALING.push(
            ..._.map(dots, (item, i) => ({
              ...item,
              chance: undefined,
              name: `${names?.[item.overrideIndex]}'s ${item.name}`.replace('DMG', 'Detonation'),
              multiplier: (item.multiplier || 1) * 1.5,
              sum: true,
              detonate: true,
            }))
          )

          return x
        })
      }

      return base
    },
  }
}

export default Hycilens
