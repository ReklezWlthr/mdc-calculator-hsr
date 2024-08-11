import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import {
  AbilityTag,
  Element,
  ITalentLevel,
  ITeamChar,
  PathType,
  Stats,
  TalentProperty,
  TalentType,
} from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const DHIL = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: `Beneficent Lotus`,
      content: `Uses a 2-hit attack and deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    normal_alt1: {
      energy: 30,
      trace: 'Enhanced Basic ATK [1]',
      title: `Transcendence`,
      content: `Uses a 3-hit attack and deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target.`,
      value: [{ base: 130, growth: 26, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    normal_alt2: {
      energy: 35,
      trace: 'Enhanced Basic ATK [2]',
      title: `Divine Spear`,
      content: `Uses a 5-hit attack and deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target. From the fourth hit onward, simultaneously deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{1}}% of Dan Heng • Imbibitor Lunae's ATK to adjacent targets.`,
      value: [
        { base: 190, growth: 38, style: 'linear' },
        { base: 30, growth: 6, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
    },
    normal_alt3: {
      energy: 40,
      trace: 'Enhanced Basic ATK [3]',
      title: `Fulgurant Leap`,
      content: `Uses a 7-hit attack and deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target. From the fourth hit onward, simultaneously deal <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{1}}% of Dan Heng • Imbibitor Lunae's ATK to adjacent targets.`,
      value: [
        { base: 250, growth: 50, style: 'linear' },
        { base: 90, growth: 18, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BLAST,
    },
    skill: {
      trace: 'Skill',
      title: `Dracore Libre`,
      content: `Enhances Basic ATK. Enhancements may be applied up to <span class="text-desc">3</span> times consecutively. Using this ability does not consume Skill Points and is not considered as using a Skill.
      <br />Enhanced once, <b>Beneficent Lotus</b> becomes <b>Transcendence</b>.
      <br />Enhanced twice, <b>Beneficent Lotus</b> becomes <b>Divine Spear</b>.
      <br />Enhanced thrice, <b>Beneficent Lotus</b> becomes <b>Fulgurant Leap</b>.
      <br />When using <b>Divine Spear</b> or <b>Fulgurant Leap</b>, starting from the fourth hit, <span class="text-desc">1</span> stack of <b>Outroar</b> is gained before every hit. Each stack of <b>Outroar</b> increases Dan Heng • Imbibitor Lunae's CRIT DMG by {{0}}%, for a max of <span class="text-desc">4</span> stacks. These stacks last until the end of his turn.`,
      value: [{ base: 6, growth: 0.6, style: 'curved' }],
      level: skill,
      tag: AbilityTag.ENHANCE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Azure's Aqua Ablutes All`,
      content: `Uses a 3-hit attack and deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target. At the same time, deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{1}}% of Dan Heng • Imbibitor Lunae's ATK to adjacent targets. Then, obtains <span class="text-desc">2</span> <b class="text-hsr-imaginary">Squama Sacrosancta</b>.
      <br />It's possible to hold up to <span class="text-desc">3</span> <b class="text-hsr-imaginary">Squama Sacrosancta</b>, which can be used to offset Dan Heng • Imbibitor Lunae's consumption of skill points. Consuming <b class="text-hsr-imaginary">Squama Sacrosancta</b> is considered equivalent to consuming skill points.`,
      value: [
        { base: 180, growth: 12, style: 'curved' },
        { base: 84, growth: 5.6, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.BLAST,
    },
    talent: {
      trace: 'Talent',
      title: `Righteous Heart`,
      content: `After each hit dealt during an attack, Dan Heng • Imbibitor Lunae gains <span class="text-desc">1</span> stack of <b>Righteous Heart</b>, increasing his DMG by {{0}}%. This effect can stack up to <span class="text-desc">6</span> time(s), lasting until the end of his turn.`,
      value: [{ base: 5, growth: 0.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: `Heaven-Quelling Prismadrakon`,
      content: `After using his Technique, Dan Heng • Imbibitor Lunae enters the Leaping Dragon state for <span class="text-desc">20</span> seconds. While in the Leaping Dragon state, using his attack enables him to move forward rapidly for a set distance, attacking all enemies he touches and blocking all incoming attacks. After entering combat via attacking enemies in the Leaping Dragon state, Dan Heng • Imbibitor Lunae deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to <span class="text-desc">120%</span> of his ATK to all enemies, and gains <span class="text-desc">1</span> <b class="text-hsr-imaginary">Squama Sacrosancta</b>.`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Star Veil`,
      content: `At the start of the battle, immediately regenerates <span class="text-desc">15</span> Energy.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Aqua Reign`,
      content: `Increases the chance to resist Crowd Control debuffs by <span class="text-desc">35%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Jolt Anew`,
      content: `This character's CRIT DMG increases by <span class="text-desc">24%</span> when dealing DMG to enemy targets with <b class="text-hsr-imaginary">Imaginary</b> Weakness.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Tethered to Sky`,
      content: `Increases the stackable <b>Righteous Heart</b> count by <span class="text-desc">4</span>, and gains <span class="text-desc">1</span> extra stack of <b>Righteous Heart</b> for each hit during an attack.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Imperium On Cloud Nine`,
      content: `After using his Ultimate, Dan Heng • Imbibitor Lunae's action is <u>Advanced Forward</u> by <span class="text-desc">100%</span> and gains <span class="text-desc">1</span> extra <b class="text-hsr-imaginary">Squama Sacrosancta</b>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Clothed in Clouds`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Zephyr's Bliss`,
      content: `The buff effect granted by <b>Outroar</b> lasts until the end of this character's next turn.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Fall is the Pride`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Reign, Returned`,
      content: `After any other ally uses their Ultimate, the <b class="text-hsr-imaginary">Imaginary RES PEN</b> of Dan Heng • Imbibitor Lunae's next <b>Fulgurant Leap</b> attack increases by <span class="text-desc">20%</span>. This effect can stack up to <span class="text-desc">3</span> time(s).`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'dhil_sp',
      text: `Skill Point Consumed`,
      ...talents.skill,
      show: true,
      default: 3,
      min: 0,
      max: 3,
      unique: true,
      sync: true,
    },
    {
      type: 'number',
      id: 'righteous_heart',
      text: `Initial Righteous Heart Stacks`,
      ...talents.talent,
      show: true,
      default: 0,
      min: 0,
      max: c >= 1 ? 10 : 6,
      unique: true,
    },
    {
      type: 'number',
      id: 'outroar',
      text: `Initial Outroar Stacks`,
      ...talents.skill,
      show: true,
      default: 0,
      min: 0,
      max: 4,
      unique: true,
    },
    {
      type: 'number',
      id: 'dhil_e6',
      text: `E6 Imaginary RES PEN Stacks`,
      ...talents.c6,
      show: c >= 6,
      default: 0,
      min: 0,
      max: 3,
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

      // For attacks that can't increase stack
      const outroar_norm = form.outroar * calcScaling(0.06, 0.006, skill, 'curved')

      const righteous_heart = (hit: number, offset: number = 0) =>
        // Offset is used for adjacent attack that starts from 4th hit
        // Stack is gained AFTER the previous hit land (Start from 0)
        _.map(Array(hit - offset).fill(form.righteous_heart), (value, i) => {
          const currentStacks = _.min([c >= 1 ? 10 : 6, value + (offset + i) * (c >= 1 ? 2 : 1)])
          return currentStacks * (calcScaling(5, 0.5, talent, 'curved') / 100)
        })

      const outroar = (hit: number, padding: number = 0) =>
        // Stack is gained BEFORE the previous hit land (Start from 1, at 4th hit)
        // +1 Stack before calculating the first hit
        [
          ...(padding ? _.map(Array(padding), () => calcScaling(0.06, 0.006, skill, 'curved') * form.outroar) : []),
          ..._.map(Array(hit - 3).fill(form.outroar), (value, i) => {
            const currentStacks = _.min([4, value + i + 1])
            return currentStacks * calcScaling(0.06, 0.006, skill, 'curved')
          }),
        ]

      switch (form.dhil_sp) {
        case 1:
          base.BASIC_SCALING = [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(1.3, 0.26, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 20,
              bonusSplit: righteous_heart(3),
              cd: outroar_norm,
              sum: true,
              hitSplit: [0.33, 0.33, 0.34],
            },
          ]
          break
        case 2:
          base.BASIC_SCALING = [
            {
              name: 'Main Target',
              value: [{ scaling: calcScaling(1.9, 0.38, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 30,
              bonusSplit: righteous_heart(5),
              cdSplit: outroar(5, 3),
              sum: true,
              hitSplit: [0.2, 0.2, 0.2, 0.2, 0.2],
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.3, 0.06, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              bonusSplit: righteous_heart(5, 3),
              cdSplit: outroar(5),
              hitSplit: [0.5, 0.5],
            },
          ]
          break
        case 3:
          base.BASIC_SCALING = [
            {
              name: 'Main Target',
              value: [{ scaling: calcScaling(2.5, 0.5, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 40,
              bonusSplit: righteous_heart(7),
              cdSplit: outroar(7, 3),
              res_pen: form.dhil_e6 * 0.2,
              sum: true,
              hitSplit: [0.142, 0.142, 0.142, 0.142, 0.142, 0.142, 0.148],
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.9, 0.18, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 20,
              bonusSplit: righteous_heart(7, 3),
              cdSplit: outroar(7),
              res_pen: form.dhil_e6 * 0.2,
              hitSplit: [0.25, 0.25, 0.25, 0.25],
            },
          ]
          break
        default:
          base.BASIC_SCALING = [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              bonusSplit: righteous_heart(2),
              cd: outroar_norm,
              sum: true,
              hitSplit: [0.3, 0.7],
            },
          ]
      }
      base.ULT_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(1.8, 0.12, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: true,
          hitSplit: [0.3, 0.3, 0.4],
          cd: outroar_norm,
          bonusSplit: righteous_heart(3),
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.84, 0.056, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          cd: outroar_norm,
          bonusSplit: righteous_heart(3),
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 1.2, multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
          sum: true,
          bonusSplit: righteous_heart(3),
        },
      ]

      if (form.dhil_sp) {
        base.BA_ALT = true
      }

      const r_offset = (hit: number) => _.min([form.righteous_heart + hit * (c >= 1 ? 2 : 1), c >= 1 ? 10 : 6])
      const o_offset = (hit: number) => _.min([4, form.outroar + hit])

      base.CALLBACK.push((x) => {
        let hit = 2

        switch (form.dhil_sp) {
          case 1:
            hit = 3
            break
          case 2:
            hit = 5
            break
          case 3:
            hit = 7
            break
        }

        x.BASIC_SCALING = _.map(x.BASIC_SCALING, (item) =>
          item.property === TalentProperty.ADD
            ? {
                ...item,
                bonus: r_offset(hit) * calcScaling(0.05, 0.005, talent, 'curved'),
                cd: o_offset(hit) * calcScaling(0.06, 0.006, skill, 'curved'),
              }
            : item
        )
        x.ULT_SCALING = _.map(x.ULT_SCALING, (item) =>
          item.property === TalentProperty.ADD
            ? {
                ...item,
                bonus: r_offset(3) * calcScaling(0.05, 0.005, talent, 'curved'),
                cd: o_offset(0) * calcScaling(0.06, 0.006, skill, 'curved'),
              }
            : item
        )

        return x
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
      if (_.includes(weakness, Element.IMAGINARY) && a.a6)
        base[Stats.CRIT_DMG].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.24,
        })
      return base
    },
  }
}

export default DHIL
