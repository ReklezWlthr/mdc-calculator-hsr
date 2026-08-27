import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import {
  AbilityTag,
  Element,
  GlobalModifiers,
  ITalentLevel,
  ITeamChar,
  PathType,
  Stats,
  TalentProperty,
  TalentType,
} from '@src/domain/constant'

import { teamOptionGenerator, toPercentage } from '@src/core/utils/data_format'
import { Banger, IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'
import { CallbackType } from '@src/domain/stats'

const Pearl = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
    elation: c >= 5 ? 2 : c >= 3 ? 1 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent
  const elation = t.elation + upgrade.elation

  const index = _.findIndex(team, (item) => item?.cId === '1503')
  const elationCount = _.filter(team, (t) => findCharacter(t.cId)?.path === PathType.ELATION)?.length || 1

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: 'Brushstroke: Trace the Severed Stream',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Pearl's DEF to one designated enemy.`,
      value: [{ base: 45, growth: 9, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      energy: 20,
      image: 'asset/traces/SkillIcon_1503_Normal.webp',
    },
    normal_alt1: {
      trace: 'Enhanced Basic ATK [1]',
      title: 'Brushstroke: Render the Great Wave',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Pearl's DEF to all enemies. Restores HP for all allies equal to {{1}}% of Pearl's DEF plus {{2}}, and additionally restores HP for the ally with the lowest HP percentage equal to {{1}}% of Pearl's DEF plus {{2}}.`,
      value: [
        { base: 50, growth: 10, style: 'linear' },
        { base: 4, growth: 0.8, style: 'linear' },
        { base: 80, growth: 16, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.AOE,
      sp: 1,
      energy: 30,
      image: 'asset/traces/SkillIcon_1503_Normal_2.webp',
    },
    normal_alt2: {
      trace: 'Enhanced Basic ATK [2]',
      title: 'Brushstroke: Imagenate the Starry Night',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Pearl's DEF to all enemies, restores HP for all allies equal to {{1}}% of Pearl's DEF plus {{2}}, and additionally restores HP for the ally target with the lowest HP percentage equal to {{1}}% of Pearl's DEF plus {{2}}. When in possession of <b class="text-blue">Certified Banger</b>, additionally deals <b class="text-hsr-ice">Ice</b> <b class="elation">Elation DMG</b> equal to {{3}}% of Pearl's DEF to the attacked enemy targets.`,
      value: [
        { base: 50, growth: 10, style: 'linear' },
        { base: 4, growth: 0.8, style: 'linear' },
        { base: 80, growth: 16, style: 'linear' },
        { base: 10, growth: 1, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.AOE,
      sp: 1,
      energy: 30,
      image: 'asset/traces/SkillIcon_1503_Normal_3.webp',
    },
    skill: {
      trace: 'Skill',
      title: `Relume Life's Light`,
      content: `Gains <span class="text-desc">15</span> point(s) of <b class="text-blue">Certified Banger</b>, restores HP for all allies equal to {{0}}% of Pearl's DEF plus {{1}}, and additionally restores HP for the ally target with the lowest current HP percentage equal to {{0}}% of Pearl's DEF plus {{1}}.`,
      value: [
        { base: 6, growth: 0.6, style: 'curved' },
        { base: 120, growth: 12, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.AOE,
      energy: 30,
      sp: -1,
      image: 'asset/traces/SkillIcon_1503_BP.webp',
    },
    summon_skill: {
      participantId: 104,
      trace: 'Elation Skill',
      title: `Dissolve Reason into Elation`,
      content: `When there are <span class="text-desc">1</span>/<span class="text-desc">2</span>/<span class="text-desc">3</span>/<span class="text-desc">4</span> or more Elation characters in the team, this causes all ally targets to additionally deal <b class="elation">Elation DMG</b> of their corresponding Type equal to {{0}}/{{1}}/{{2}}/{{3}}% to the attack target after their next attack.`,
      value: [
        { base: 5, growth: 0.5, style: 'curved' },
        { base: 7.5, growth: 0.75, style: 'curved' },
        { base: 10, growth: 1, style: 'curved' },
        { base: 20, growth: 2, style: 'curved' },
      ],
      level: elation,
      tag: AbilityTag.SUPPORT,
      energy: 5,
      image: 'asset/traces/SkillIcon_1503_Elation.webp',
    },
    ult: {
      trace: 'Ultimate',
      title: `Appraise Soul's Ground`,
      content: `Gains <span class="text-desc">20</span> point(s) of <b class="text-blue">Certified Banger</b>. Uses <b class="text-purple">Deep Learning</b> on one designated ally other than this unit, making the target the <b class="text-sky-500">Aesthetic Archetype</b>.
      <br />When there are <span class="text-desc">1</span>/<span class="text-desc">2</span>/<span class="text-desc">3</span> or more Elation characters on the team, advances the <b class="text-sky-500">Aesthetic Archetype</b>'s action by <span class="text-desc">10%</span>/<span class="text-desc">15%</span>/<span class="text-desc">30%</span>. When there are <span class="text-desc">4</span> or more Elation characters on the team, the <b class="text-sky-500">Aesthetic Archetype</b> gains <span class="text-desc">1</span> extra turn. At the start of this extra turn, the <b class="text-sky-500">Aesthetic Archetype</b> gains <span class="text-desc">30</span> point(s) of <b class="text-blue">Certified Banger</b> and <span class="text-desc">60</span> point(s) of <b class="text-orange-400">Punchline</b>, which are removed at the end of the extra turn.
      <br />While in <b class="text-purple">Deep Learning</b>, Basic ATK <b>Brushstroke: Trace the Severed Stream</b> is enhanced to <b>Brushstroke: Render the Great Wave</b>. If the <b class="text-sky-500">Aesthetic Archetype</b> is on the Path of Elation, it is instead enhanced to <b>Brushstroke: Imagenate the Starry Night</b>. When dealing DMG, additionally deals {{0}}% <b class="text-hsr-ice">Ice</b> <b class="elation">Elation DMG</b>. This <b class="elation">Elation DMG</b> is calculated using the <b class="text-sky-500">Aesthetic Archetype</b>'s stats. <b class="text-purple">Deep Learning</b> has <span class="text-desc">3</span> point(s) of <b>Charge</b>. After Pearl uses an Enhanced Basic ATK, <span class="text-desc">1</span> point of <b>Charge</b> is consumed. If no <b>Charge</b> remains after taking action, <b class="text-purple">Deep Learning</b> ends.`,
      value: [{ base: 30, growth: 3, style: 'curved' }],
      level: ult,
      tag: AbilityTag.SUPPORT,
      energy: 5,
      image: 'asset/traces/SkillIcon_1503_Ultra_on.webp',
    },
    talent: {
      trace: `Talent`,
      title: `Grow Grace from Grit`,
      content: `Pearl can use <b class="text-blue">Certified Banger</b> as <b class="text-teal-500">Repellency</b>. Each point of <b class="text-blue">Certified Banger</b> is equal to <span class="text-desc">200</span> point(s) of <b class="text-teal-500">Repellency</b>. When an ally target takes DMG, Pearl can consume <b class="text-teal-500">Repellency</b> to block <span class="text-desc">60%</span> of the DMG for the ally target. Pearl's <b class="text-blue">Certified Banger</b> lasts indefinitely and has a max limit of <span class="text-desc">50</span> point(s).
      <br />When an ally target's current HP percentage is <span class="text-desc">50%</span> or lower, DMG taken is reduced by {{0}}%.`,
      value: [{ base: 15, growth: 1.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.DEFENSE,
      image: 'asset/traces/SkillIcon_1503_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: 'Recast Masterwork in Nacre',
      content: `After using Technique, gains <b class="text-sky-500">Aesthetic Archetype</b>. When switching active characters, <b class="text-sky-500">Aesthetic Archetype</b> transfers to the active character. At the start of the next battle, gains <span class="text-desc">20</span> point(s) of <b class="text-blue">Certified Banger</b>, and Pearl applies <b class="text-purple">Deep Learning</b> to the character with <b class="text-sky-500">Aesthetic Archetype</b>. This <b class="text-purple">Deep Learning</b> has <span class="text-desc">2</span> Charge. Pearl can only apply <b class="text-purple">Deep Learning</b> to characters other than herself.`,
      tag: AbilityTag.IMPAIR,
      image: 'asset/traces/SkillIcon_1503_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Panoptic Vision',
      content: `When DEF is <span class="text-desc">2400</span> or higher, increases this unit's Elation by <span class="text-desc">32%</span>. For every <span class="text-desc">100</span> DEF exceeded, increases this unit's Elation by <span class="text-desc">3%</span>. Up to a max of <span class="text-desc">3600</span> excess DEF can be taken into account for this effect.`,
      image: 'asset/traces/SkillIcon_1503_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Sensory Latitude',
      content: `When an ally target's turn begins, Pearl gains <span class="text-desc">5</span> point(s) of <b class="text-blue">Certified Banger</b>, up to a max of <span class="text-desc">50</span> point(s) of <b class="text-blue">Certified Banger</b>. The obtainable amount of <b class="text-blue">Certified Banger</b> resets at the start of Pearl's turn. When using Enhanced Basic ATK or Skill, dispels <span class="text-desc">1</span> debuff(s) from all allies.`,
      image: 'asset/traces/SkillIcon_1503_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Aesthetic Firewall`,
      content: `After entering combat and using Ultimate, if the <b class="text-sky-500">Aesthetic Archetype</b> is an Elation character, their next Ultimate use regenerates a fixed <span class="text-desc">90</span> Energy for Pearl. This effect cannot stack.`,
      image: 'asset/traces/SkillIcon_1503_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Nestle That Pearl in Uninked Tides',
      content: `When there are <span class="text-desc">2</span>/<span class="text-desc">3</span>/<span class="text-desc">4</span> or more Elation characters in the team, increases all allies' Elation stat by an amount equal to <span class="text-desc">10%</span>/<span class="text-desc">20%</span>/<span class="text-desc">80%</span> of Pearl's Elation, up to a max increase of <span class="text-desc">60%</span> Elation.`,
      image: 'asset/traces/SkillIcon_1503_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'Crop That Dappled Dawn',
      content: `Merrymakes all ally targets' <b class="elation">Elation DMG</b> by <span class="text-desc">15%</span>. When using Ultimate, causes other ally Elation characters (excluding Pearl and <b class="text-sky-500">Aesthetic Archetype</b>) to also trigger the action advance effect, and increases the <b class="text-blue">Certified Banger</b> and <b class="text-orange-400">Punchline</b> gained at the start of the extra turn provided by the Ultimate by <span class="text-desc">100%</span>.`,
      image: 'asset/traces/SkillIcon_1503_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Sketch That Suspended Wave',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1503_BP.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Study That Veiled Smile',
      content: `In the Talent <b>Grow Grace from Grit</b>, <b class="text-teal-500">Repellency</b> provided by each point of <b class="text-blue">Certified Banger</b> increases by <span class="text-desc">40</span>, and the percentage of DMG it can block increases by <span class="text-desc">5%</span>.`,
      image: 'asset/traces/SkillIcon_1503_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Render Those Starlit Swirls',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1503_Ultra.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Compute Life From One Shell',
      content: `While in <b class="text-purple">Deep Learning</b>, all allies' <b>All-Type RES PEN</b> increases by <span class="text-desc">20%</span>. Pearl's Enhanced Basic ATK additionally deals <b class="text-hsr-ice">Ice</b> <b class="elation">Elation DMG</b> equal to <span class="text-desc">240%</span> of the stats of <b class="text-sky-500">Aesthetic Archetype</b>.`,
      image: 'asset/traces/SkillIcon_1503_Rank6.webp',
    },
  }

  const content: IContent[] = [
    { ...Banger, max: 50 },
    {
      type: 'element',
      id: 'aesthetic_archetype',
      text: `Aesthetic Archetype`,
      ...talents.ult,
      show: true,
      default: '1',
      options: _.filter(teamOptionGenerator(team), (item) => item.value !== (index + 1).toString()),
    },
    {
      type: 'toggle',
      id: 'pearl_elation_add',
      text: `Pearl's Elation Add DMG`,
      ...talents.summon_skill,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'pearl_talent',
      text: `Talent DMG Reduction`,
      ...talents.talent,
      show: true,
      default: false,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'aesthetic_archetype')]

  const allyContent: IContent[] = [
    findContentById(content, 'pearl_elation_add'),
    findContentById(content, 'pearl_talent'),
  ]

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
      broken: boolean,
      globalMod: GlobalModifiers,
    ) => {
      const base = _.cloneDeep(x)

      const aesIndex = Number(form.aesthetic_archetype) - 1
      if (aesIndex >= 0) {
        if (findCharacter(team[aesIndex]?.cId)?.path === PathType.ELATION) {
          base.BASIC_SCALING = [
            {
              name: 'AoE',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.DEF }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
            {
              name: 'Healing',
              value: [{ scaling: calcScaling(0.04, 0.008, basic, 'linear'), multiplier: Stats.DEF }],
              flat: calcScaling(80, 16, basic, 'linear'),
              element: TalentProperty.HEAL,
              property: TalentProperty.HEAL,
              type: TalentType.BA,
            },
            {
              name: 'Lowest HP Healing',
              value: [{ scaling: calcScaling(0.04, 0.008, basic, 'linear'), multiplier: Stats.DEF }],
              flat: calcScaling(80, 16, basic, 'linear'),
              multiplier: 2,
              element: TalentProperty.HEAL,
              property: TalentProperty.HEAL,
              type: TalentType.BA,
            },
          ]
          if (form.banger) {
            base.BASIC_SCALING.push({
              name: 'Certified Banger DMG',
              value: [{ scaling: calcScaling(0.1, 0.01, basic, 'curved'), multiplier: Stats.ELATION }],
              element: Element.ICE,
              property: TalentProperty.ELATION,
              type: TalentType.BA,
              sum: true,
              punchline: form.banger,
            })
          }
        } else {
          base.BASIC_SCALING = [
            {
              name: 'AoE',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.DEF }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
            {
              name: 'Healing',
              value: [{ scaling: calcScaling(0.04, 0.008, basic, 'linear'), multiplier: Stats.DEF }],
              flat: calcScaling(80, 16, basic, 'linear'),
              element: TalentProperty.HEAL,
              property: TalentProperty.HEAL,
              type: TalentType.BA,
            },
            {
              name: 'Lowest HP Healing',
              value: [{ scaling: calcScaling(0.04, 0.008, basic, 'linear'), multiplier: Stats.DEF }],
              flat: calcScaling(80, 16, basic, 'linear'),
              multiplier: 2,
              element: TalentProperty.HEAL,
              property: TalentProperty.HEAL,
              type: TalentType.BA,
            },
          ]
        }
      } else {
        base.BASIC_SCALING = [
          {
            name: 'Single Target',
            value: [{ scaling: calcScaling(0.45, 0.09, basic, 'linear'), multiplier: Stats.DEF }],
            element: Element.ICE,
            property: TalentProperty.NORMAL,
            type: TalentType.BA,
            break: 10,
            sum: true,
          },
        ]
      }

      base.SKILL_SCALING = [
        {
          name: 'Healing',
          value: [{ scaling: calcScaling(0.06, 0.006, skill, 'curved'), multiplier: Stats.DEF }],
          flat: calcScaling(120, 12, skill, 'curved'),
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.SKILL,
          sum: true,
        },
        {
          name: 'Lowest HP Healing',
          value: [{ scaling: calcScaling(0.06, 0.006, skill, 'curved'), multiplier: Stats.DEF }],
          flat: calcScaling(120, 12, skill, 'curved'),
          multiplier: 2,
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.SKILL,
        },
      ]
      base.MEMO_SKILL_SCALING = []

      if (c >= 2) {
        base.ELATION_MERRYMAKE.push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.15,
        })
      }

      if (c >= 6) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.2,
        })
      }

      if (form.pearl_talent) {
        base.DMG_REDUCTION.push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.15, 0.015, talent, 'curved'),
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
      broken: boolean,
      globalMod: GlobalModifiers,
    ) => {
      if (c >= 2) {
        base.ELATION_MERRYMAKE.push({
          name: `Eidolon 2`,
          source: 'Pearl',
          value: 0.15,
        })
      }

      if (c >= 6) {
        base.ALL_TYPE_RES_PEN.push({
          name: `Eidolon 6`,
          source: 'Pearl',
          value: 0.2,
        })
      }

      if (aForm.pearl_talent) {
        base.DMG_REDUCTION.push({
          name: `Talent`,
          source: 'Pearl',
          value: calcScaling(0.15, 0.015, talent, 'curved'),
        })
      }

      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      t: StatsObject[],
      allForm: Record<string, any>[],
      debuffs: {
        type: DebuffTypes
        count: number
      }[],
      weakness: Element[],
      broken: boolean,
      globalCallback: CallbackType[],
      globalMod: GlobalModifiers,
    ) => {
      globalCallback.push(function P999(_x, _d, _w, all) {
        const def = all[index].getDef()
        if (def >= 2400 && a.a2) {
          all[index][Stats.ELATION].push({
            name: `Ascension 2 Passive`,
            source: 'Self',
            value: 0.32 + (_.min([def - 2400, 3600]) / 100) * 0.03,
            base: _.floor(_.min([def - 2400, 3600]) / 100, 1).toLocaleString(),
            multiplier: 0.03,
            flat: `32%`,
          })
        }

        if (c >= 1) {
          const elation = all[index].getValue(Stats.ELATION)

          let scaling = 0
          switch (elationCount) {
            case 2:
              scaling = 0.1
              break
            case 3:
              scaling = 0.2
              break
            case 4:
              scaling = 0.8
              break
          }

          if (scaling) {
            _.forEach(all, (item, i) => {
              item.X_ELATION.push({
                name: `Eidolon 1`,
                source: i === index ? 'Self' : 'Pearl',
                value: _.min([elation * scaling, 0.6]),
                base: _.min([toPercentage(elation), toPercentage(0.6 / scaling)]),
                multiplier: scaling,
              })
            })
          }
        }

        return all
      })

      globalCallback.push(function P99999(_x, _d, _w, all) {
        const aesIndex = Number(form.aesthetic_archetype) - 1
        if (findCharacter(team[aesIndex]?.cId)?.path === PathType.ELATION) {
          all[index].BASIC_SCALING.push({
            name: 'Additional Deep Learning DMG',
            value: [{ scaling: calcScaling(0.3, 0.03, ult, 'curved'), multiplier: Stats.ELATION }],
            overrideIndex: aesIndex,
            element: Element.ICE,
            property: TalentProperty.NORMAL,
            type: TalentType.ULT,
            sum: true,
            punchline: allForm[aesIndex].banger,
          })
        }

        if (aesIndex >= 0 && c >= 6) {
          base.BASIC_SCALING.push({
            name: 'E6 Add DMG',
            value: [{ scaling: 2.4, multiplier: Stats.ELATION }],
            element: Element.ICE,
            property: TalentProperty.ELATION,
            type: TalentType.BA,
            sum: true,
            overrideIndex: aesIndex,
          })
        }

        let scaling = 0
        switch (elationCount) {
          case 1:
            scaling = calcScaling(0.05, 0.005, elation, 'curved')
            break
          case 2:
            scaling = calcScaling(0.075, 0.0075, elation, 'curved')
            break
          case 3:
            scaling = calcScaling(0.1, 0.01, elation, 'curved')
            break
          case 4:
            scaling = calcScaling(0.2, 0.02, elation, 'curved')
            break
        }
        _.forEach(all, (c, i) => {
          if (allForm[i].pearl_elation_add) {
            _.forEach(
              [c.BASIC_SCALING, c.SKILL_SCALING, c.ULT_SCALING, c.TALENT_SCALING, c.MEMO_SKILL_SCALING],
              (s) => {
                const add = {
                  name: "Pearl's Elation Skill Add DMG",
                  value: [{ scaling, multiplier: Stats.ELATION }],
                  element: c.ELEMENT,
                  property: TalentProperty.ELATION,
                  type: TalentType.NONE,
                  overrideIndex: index,
                  elation: all[index].getTotalElation(),
                  punchline: allForm[index].banger,
                  sum: true,
                }
                if (
                  _.some(s, (item) =>
                    _.includes([TalentProperty.NORMAL, TalentProperty.FUA, TalentProperty.ELATION], item.property),
                  )
                ) {
                  s.push(add)
                }
                if (_.some(s, (item) => item.property === TalentProperty.SERVANT)) {
                  s.push({
                    ...add,
                    name: add.name + ` (${c.SUMMON_STATS?.NAME})`,
                  })
                }
              },
            )
          }
        })

        return all
      })

      return base
    },
  }
}

export default Pearl
