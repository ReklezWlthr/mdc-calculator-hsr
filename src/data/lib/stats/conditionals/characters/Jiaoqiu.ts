import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'
import { PathType } from '../../../../../domain/constant'

const Jiaoqiu = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1218')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Heart Afire',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Jiaoqiu's ATK to a single target enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Scorch Onslaught`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Jiaoqiu's ATK to a single target enemy and <b class="text-hsr-fire">Fire DMG</b> equal to {{1}}% of Jiaoqiu's ATK to adjacent targets, with a <span class="text-desc">100%</span> <u>base chance</u> to inflict <span class="text-desc">1</span> stack of <b>Ashen Roast</b> on the primary target.`,
      value: [
        { base: 75, growth: 7.5, style: 'curved' },
        { base: 45, growth: 4.5, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Pyrograph Arcanum',
      content: `Sets the number of <b>Ashen Roast</b> stacks on enemy targets to the highest number of <b>Ashen Roast</b> stacks present on the battlefield. Then, activates a Zone and deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Jiaoqiu's ATK to all enemies.
      <br />While inside the Zone, enemy targets take {{1}}% increased Ultimate DMG, with a {{2}}% <u>base chance</u> of being inflicted with <span class="text-desc">1</span> stack of <b>Ashen Roast</b> when taking action. While the Zone exists, this effect can trigger up to <span class="text-desc">6</span> time(s). And for each enemy target, it can only trigger once per turn. This trigger count resets every time Jiaoqiu uses Ultimate.
      <br />The Zone lasts for <span class="text-desc">3</span> turn(s), and its duration decreases by <span class="text-desc">1</span> at the start of this unit's every turn. If Jiaoqiu gets knocked down, the Zone will also be dispelled.`,
      value: [
        { base: 60, growth: 4, style: 'curved' },
        { base: 9, growth: 0.6, style: 'curved' },
        { base: 50, growth: 1, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: `Quartet Finesse, Octave Finery`,
      content: `When Jiaoqiu hits an enemy with Basic ATK, Skill or Ultimate, there is a <span class="text-desc">100%</span> <u>base chance</u> of dealing <span class="text-desc">1</span> stack of <b>Ashen Roast</b> on them. At <span class="text-desc">1</span> stack, increases DMG received by the enemy by {{0}}%. Then, each subsequent stack increases this by {{1}}%.
      <br /><b>Ashen Roast</b> is capped at <span class="text-desc">5</span> stack(s) and last <span class="text-desc">2</span> turn(s).
      <br />When the enemy target is in the <b>Ashen Roast</b> state, they are also considered as being <b class="text-hsr-fire">Burned</b> at the same time, taking <b class="text-hsr-fire">Fire DoT</b> equal to {{2}}% Jiaoqiu's ATK at the start of each turn.`,
      value: [
        { base: 7.5, growth: 0.75, style: 'curved' },
        { base: 2.5, growth: 0.25, style: 'curved' },
        { base: 90, growth: 9, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.IMPAIR,
    },
    technique: {
      trace: 'Technique',
      title: 'Fiery Queller',
      content: `After using Technique, creates a Special Dimension that lasts for <span class="text-desc">15</span> second(s). After entering enemies in this Special Dimension, deals <b class="text-hsr-fire">Fire DMG</b> equal to <span class="text-desc">100%</span> of Jiaoqiu's ATK to all enemies, with a <span class="text-desc">100%</span> <u>base chance</u> of applying 1 <b>Ashen Roast</b> stack. Only <span class="text-desc">1</span> dimension created by Party characters can exist at the same time.`,
      tag: AbilityTag.IMPAIR,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Seared Scent',
      content: `When a Zone exists, enemies entering combat will be inflicted with <b>Ashen Roast</b> stacks. The number of stacks applied will match the highest number of <b>Ashen Roast</b> stacks inflicted while the Zone is active, with a minimum of <span class="text-desc">1</span> stack(s).`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Hearth Kindle',
      content: `For every <span class="text-desc">15%</span> of Jiaoqiu's Effect Hit Rate that exceeds <span class="text-desc">80%</span>, additionally increases ATK by <span class="text-desc">60%</span>, up to <span class="text-desc">240%</span>.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Pyre Cleanse',
      content: `When battle starts, immediately regenerates <span class="text-desc">15</span> Energy.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Pentapathic Transference',
      content: `Allies deal <span class="text-desc">40%</span> increased DMG to enemy targets afflicted with <b>Ashen Roast</b>. Whenever inflicting <b>Ashen Roast</b> on an enemy target via triggering the Talent's effect, additionally increases the number of <b>Ashen Roast</b> stacks applied this time by <span class="text-desc">1</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `From Savor Comes Suffer`,
      content: `When an enemy target is afflicted with <b>Ashen Roast</b>, increases the multiplier for the <b class="text-hsr-fire">Fire DoT</b> dealt by <b>Ashen Roast</b> to this target by <span class="text-desc">300%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Flavored Euphony Reigns Supreme',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Leisure In, Luster Out',
      content: `When the Zone exists, reduces enemy target's ATK by <span class="text-desc">15%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Duel in Dawn, Dash in Dusk`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Nonamorphic Pyrobind',
      content: `When the enemy target gets defeated, their accumulated <b>Ashen Roast</b> stacks will transfer to the enemy with the lowest number <b>Ashen Roast</b> stacks on the battlefield. The maximum stack limit of <b>Ashen Roast</b> increases to <span class="text-desc">9</span>, and each <b>Ashen Roast</b> stack reduces the target's All-Type RES by <span class="text-desc">3%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'jq_ult',
      text: `Pyrograph Arcanum`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 3,
      debuff: true,
    },
    {
      type: 'number',
      id: 'ashen_roast',
      text: `Ashen Roast Stacks`,
      ...talents.talent,
      show: true,
      debuff: true,
      duration: 2,
      default: c >= 6 ? 9 : 5,
      min: 0,
      max: c >= 6 ? 9 : 5,
      debuffElement: Element.FIRE,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'jq_ult'), findContentById(content, 'ashen_roast')]

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
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(0.75, 0.075, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          chance: { base: 1, fixed: false },
          break: 20,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.45, 0.045, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.6, 0.04, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          chance: { base: calcScaling(0.5, 0.01, ult, 'curved'), fixed: false },
          break: 20,
          sum: true,
        },
      ]

      if (form.jq_ult) {
        base.ULT_VUL.push({
          name: `Ultimate`,
          source: 'Self',
          value: calcScaling(0.09, 0.006, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
        if (c >= 4) {
          base.ATK_REDUCTION.push({
            name: `Eidolon 4`,
            source: 'Self',
            value: 0.15,
          })
          addDebuff(debuffs, DebuffTypes.ATK_RED)
        }
      }
      if (form.ashen_roast) {
        base.VULNERABILITY.push({
          name: `Ashen Roast`,
          source: 'Self',
          value:
            calcScaling(0.075, 0.0075, talent, 'curved') +
            calcScaling(0.025, 0.0025, talent, 'curved') * (form.ashen_roast - 1),
        })
        const burn = {
          name: 'Burn DMG',
          value: [{ scaling: calcScaling(0.9, 0.09, talent, 'curved') + (c >= 2 ? 3 : 0), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.DOT,
          type: TalentType.NONE,
        }
        base.TALENT_SCALING.push({ ...burn, sum: true })
        base.DOT_SCALING.push({
          ...burn,
          overrideIndex: index,
          dotType: DebuffTypes.BURN,
        })
        addDebuff(debuffs, DebuffTypes.BURN)
        if (c >= 6) {
          base.ALL_TYPE_RES_RED.push({
            name: `Eidolon 6`,
            source: 'Self',
            value: 0.03 * form.ashen_roast,
          })
        }
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
      if (form.jq_ult) {
        base.ULT_VUL.push({
          name: `Ultimate`,
          source: 'Jiaoqiu',
          value: calcScaling(0.09, 0.006, ult, 'curved'),
        })
        if (c >= 4) {
          base.ATK_REDUCTION.push({
            name: `Eidolon 4`,
            source: 'Jiaoqiu',
            value: 0.15,
          })
        }
      }
      if (form.ashen_roast) {
        base.VULNERABILITY.push({
          name: `Ashen Roast`,
          source: 'Jiaoqiu',
          value:
            calcScaling(0.075, 0.0075, talent, 'curved') +
            calcScaling(0.025, 0.0025, talent, 'curved') * (form.ashen_roast - 1),
        })
        if (c >= 1)
          base[Stats.ALL_DMG].push({
            name: `Eidolon 1`,
            source: 'Jiaoqiu',
            value: 0.48,
          })
        if (c >= 6) {
          base.ALL_TYPE_RES_RED.push({
            name: `Eidolon 6`,
            source: 'Self',
            value: 0.03 * form.ashen_roast,
          })
        }
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
      if (a.a4)
        base.CALLBACK.push((x) => {
          if (x.getValue(Stats.EHR) >= 0.8)
            x[Stats.P_ATK].push({
              name: `Ascension 4 Passive`,
              source: 'Self',
              value: _.min([_.max([x.getValue(Stats.EHR) - 0.8, 0]) / 0.15, 4]) * 0.6,
            })
          return x
        })

      return base
    },
  }
}

export default Jiaoqiu
