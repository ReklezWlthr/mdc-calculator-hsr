import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Luocha = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: 'Thorns of the Abyss',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Luocha's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Prayer of Abyss Flower',
      content: `After using his Skill, Luocha immediately restores the target ally's HP equal to {{0}}% of Luocha's ATK plus {{1}}. Meanwhile, Luocha gains <span class="text-desc">1</span> stack of <b>Abyss Flower</b>.
      <br />When any ally's HP percentage drops to <span class="text-desc">50%</span> or lower, an effect equivalent to Luocha's Skill will immediately be triggered and applied to this ally for one time (without consuming Skill Points). This effect can be triggered again after <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 40, growth: 2.5, style: 'heal' },
        { base: 200, growth: 120, style: 'flat' },
      ],
      level: skill,
      tag: AbilityTag.RESTORE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Death Wish',
      content: `Removes <span class="text-desc">1</span> buff(s) from all enemies and deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Luocha's ATK to all enemies. Luocha gains <span class="text-desc">1</span> stack of <b>Abyss Flower</b>.`,
      value: [{ base: 120, growth: 8, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: 'Cycle of Life',
      content: `When <b>Abyss Flower</b> reaches <span class="text-desc">2</span> stacks, Luocha consumes all stacks of <b>Abyss Flower</b> to deploy a <b>Field</b> against the enemy.
      <br />When any enemy in the <b>Field</b> is attacked by an ally, the attacking ally's HP is immediately restored by an amount equal to {{0}}% of Luocha's ATK plus {{1}}.
      <br />The <b>Field</b>'s effect lasts for <span class="text-desc">2</span> turns. When Luocha is knocked down, the <b>Field</b> will be dispelled.`,
      value: [
        { base: 12, growth: 0.75, style: 'heal' },
        { base: 60, growth: 36, style: 'flat' },
      ],
      level: talent,
      tag: AbilityTag.RESTORE,
    },
    technique: {
      trace: 'Technique',
      title: 'Mercy of a Fool',
      content: `After the Technique is used, the Talent will be immediately triggered at the start of the next battle.`,
      tag: AbilityTag.RESTORE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Cleansing Revival',
      content: `When the Skill's effect is triggered, removes <span class="text-desc">1</span> debuff(s) from a target ally.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Sanctified',
      content: `When any enemy in the <b>Field</b> is attacked by an ally, all allies (except the attacker) restore HP equal to <span class="text-desc">7%</span> of Luocha's ATK plus <span class="text-desc">93</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Through the Valley',
      content: `The chance to resist Crowd Control debuffs increases by <span class="text-desc">70%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Ablution of the Quick',
      content: `While the <b>Field</b> is active, ATK of all allies increases by <span class="text-desc">20%</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'Bestowal From the Pure',
      content: `When his Skill is triggered, if the target ally's HP is lower than <span class="text-desc">50%</span>, Luocha's Outgoing Healing increases by <span class="text-desc">30%</span>. If the target ally's HP is at <span class="text-desc">50%</span> or higher, the ally receives a <b class="text-indigo-300">Shield</b> that can absorb DMG equal to <span class="text-desc">10%</span> of Luocha's ATK plus <span class="text-desc">240</span>, lasting for <span class="text-desc">2</span> turns.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Surveyal by the Fool',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Heavy Lies the Crown',
      content: `When Luocha's <b>Field</b> is active, enemies become Weakened and deal <span class="text-desc">12%</span> less DMG.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Cicatrix 'Neath the Pain`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Reunion With the Dust',
      content: `When Ultimate is used, there is a <span class="text-desc">100%</span> <u>fixed chance</u> to reduce all enemies' All-Type RES by <span class="text-desc">20%</span> for <span class="text-desc">2</span> turn(s).`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'abyss_field',
      text: `Abyss Field`,
      ...talents.talent,
      show: c >= 1,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'luocha_c2',
      text: `Healed Ally HP < 50%`,
      ...talents.c2,
      show: c >= 2,
      default: true,
    },
    {
      type: 'toggle',
      id: 'luocha_c6',
      text: `E6 Ult All-Type RES Reduction`,
      ...talents.c6,
      show: c >= 6,
      default: true,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'abyss_field'), findContentById(content, 'luocha_c6')]

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
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          energy: 20,
          sum: true,
          hitSplit: [0.3, 0.3, 0.4],
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Skill Healing',
          value: [{ scaling: calcScaling(0.4, 0.025, skill, 'heal'), multiplier: Stats.ATK }],
          flat: calcScaling(200, 120, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1.2, 0.08, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          energy: 5,
          sum: true,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Healing On-Hit',
          value: [{ scaling: calcScaling(0.12, 0.0075, talent, 'heal'), multiplier: Stats.ATK }],
          flat: calcScaling(60, 36, skill, 'flat'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
          sum: true,
        },
      ]

      if (form.abyss_field) {
        if (c >= 1)
          base[Stats.P_ATK].push({
            name: `Eidolon 1`,
            source: 'Self',
            value: 0.2,
          })
        if (c >= 4) {
          base.WEAKEN.push({
            name: `Eidolon 4`,
            source: 'Self',
            value: 0.12,
          })
          addDebuff(debuffs, DebuffTypes.OTHER)
        }
      }
      if (form.luocha_c2)
        base[Stats.HEAL].push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.3,
        })
      if (c >= 2)
        base.SKILL_SCALING.push({
          name: 'E2 Shield',
          value: [{ scaling: 0.1, multiplier: Stats.ATK }],
          flat: 240,
          element: TalentProperty.SHIELD,
          property: TalentProperty.SHIELD,
          type: TalentType.NONE,
        })
      if (a.a4)
        base.TALENT_SCALING.push({
          name: 'Allied Healing On-Hit',
          value: [{ scaling: 0.07, multiplier: Stats.ATK }],
          flat: 93,
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        })
      if (form.luocha_c6) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.2,
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
      if (form.abyss_field) {
        if (c >= 1)
          base[Stats.P_ATK].push({
            name: `Eidolon 1`,
            source: 'Luocha',
            value: 0.2,
          })
        if (c >= 4)
          base.WEAKEN.push({
            name: `Eidolon 4`,
            source: 'Luocha',
            value: 0.12,
          })
      }
      if (form.luocha_c6)
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Luocha',
          value: 0.2,
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
      return base
    },
  }
}

export default Luocha
