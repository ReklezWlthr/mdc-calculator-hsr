import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import {
  AbilityTag,
  Element,
  GlobalModifiers,
  ITalentLevel,
  ITeamChar,
  Stats,
  TalentProperty,
  TalentType,
} from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/data_format'
import { IContent, IScaling, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'
import { PathType } from '../../../../../domain/constant'
import { CallbackType } from '@src/domain/stats'

const Rin = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: 'Bajiquan',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Rin Tohsaka's ATK to one designated enemy target.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      image: 'asset/traces/SkillIcon_1508_Normal.webp',
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Jeweled Sword Zelretch`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Rin Tohsaka's ATK to one designated enemy target.`,
      value: [{ base: 90, growth: 0.9, style: 'curved' }],
      level: skill,
      tag: AbilityTag.ST,
      sp: -1,
      image: 'asset/traces/SkillIcon_1508_BP.webp',
    },
    skill_alt: {
      trace: 'Enhanced Skill',
      title: 'Second Magic Experiment',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Rin Tohsaka's ATK to all enemies. Then, consumes <span class="text-desc">3</span> points of <b class="text-indigo-400">Gem Energy</b> to deal additional <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Rin Tohsaka's ATK to one random enemy target. This repeats until <b class="text-indigo-400">Gem Energy</b> is less than <span class="text-desc">3</span> or there are no enemy targets with current HP greater than <span class="text-desc">0</span>, up to a maximum of <span class="text-desc">33</span> times. When used, if current Skill Points are greater than <span class="text-desc">2</span>, consumes Skill Points until only <span class="text-desc">2</span> points left, immediately gaining <span class="text-desc">2</span> points of <b class="text-indigo-400">Gem Energy</b> for every <span class="text-desc">1</span> Skill Point consumed.`,
      value: [{ base: 45, growth: 4.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.BOUNCE,
      energy: 30,
      image: 'asset/traces/SkillIcon_1508_BP02.webp',
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'An Gal Ta Ki Gal Šè',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Rin Tohsaka's ATK to a single designated enemy, and <b class="text-hsr-quantum">Quantum DMG</b> equal to {{1}}% of Rin Tohsaka's ATK to other enemy targets. When used, recovers <span class="text-desc">1</span> Skill Point(s) for allies, and increases the DMG taken by all enemies by {{2}}% for <span class="text-desc">3</span> turn(s).`,
      value: [
        { base: 300, growth: 30, style: 'curved' },
        { base: 100, growth: 10, style: 'curved' },
        { base: 10, growth: 1, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
      image: 'asset/traces/SkillIcon_1508_Ultra_on.webp',
    },
    talent: {
      trace: 'Talent',
      title: `Gem Magecraft`,
      content: `When entering combat, gains <span class="text-desc">20</span> <b class="text-indigo-400">Gem Energy</b>. When an ally consumes or recovers Skill Points, CRIT DMG increases by {{0}}% for <span class="text-desc">2</span> turn(s). For every <span class="text-desc">1</span> Skill Point consumed or recovered, Rin Tohsaka gains <span class="text-desc">1</span> <b class="text-indigo-400">Gem Energy</b>. If Rin Tohsaka possesses <span class="text-desc">15</span> or more <b class="text-indigo-400">Gem Energy</b> or if current Skill Points are <span class="text-desc">7</span> or more, her Skill is enhanced into <b>Second Magic Experiment</b>.
      <br />
      <br /><b>Freeform Tohsaka Style</b>
      <br />After attacking Archer uses his Skill <b>Caladbolg II: Fake Spiral Sword</b>, if there are fewer or equal to <span class="text-desc">3</span> Skill Point(s), Rin Tohsaka and Archer will launch a <u>Joint Follow-Up ATK</u> on all enemies, each dealing <b class="text-hsr-quantum">Quantum DMG</b> equal to {{1}}% of Rin Tohsaka's ATK and {{1}}% of Archer's ATK, and recover <span class="text-desc">4</span> Skill Point(s) for allies. This <u>Joint ATK</u> can only trigger once. The trigger count resets after Rin Tohsaka's turn ends.`,
      value: [
        { base: 50, growth: 5, style: 'curved' },
        { base: 150, growth: 15, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1508_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: `Conversion Charge`,
      content: `After using the Technique, gains <span class="text-desc">10</span> point(s) of <b class="text-indigo-400">Gem Energy</b> at the start of the next combat.`,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1508_Maze.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Inbound Prosperity',
      content: `When Rin Tohsaka uses her Ultimate, she gains <span class="text-desc">12</span> point(s) of <b class="text-indigo-400">Gem Energy</b>.`,
      image: 'asset/traces/SkillIcon_1508_SkillTree3.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Ladylike Poise`,
      content: `After Rin Tohsaka uses her Enhanced Skill, her SPD increases by <span class="text-desc">20%</span> for <span class="text-desc">3</span> turn(s).`,
      image: 'asset/traces/SkillIcon_1508_SkillTree2.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Elegant Conduct',
      content: `When Rin Tohsaka is on the field, additionally increases the max number of Skill Points by <span class="text-desc">2</span>. When entering combat, Rin Tohsaka's ATK increases by <span class="text-desc">150%</span>, and DMG dealt ignores <span class="text-desc">20%</span> of the target's DEF. If Archer is in the team, Archer also gains this effect.`,
      image: 'asset/traces/SkillIcon_1508_SkillTree1.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Zelretch's Apprentice`,
      content: `If the amount of <b class="text-indigo-400">Gem Energy</b> consumed by a single Enhanced Skill is <span class="text-desc">30</span> or more, Rin Tohsaka gains <b class="text-red">Shadow Gem</b> equal to the amount of <b class="text-indigo-400">Gem Energy</b> consumed.
      <br />While possessing <b class="text-red">Shadow Gem</b>, Skill is enhanced to <b>Second Magic Experiment</b>. The Enhanced Skill consumes all <b class="text-red">Shadow Gem</b>, does not trigger the effect of converting Skill Points into <b class="text-indigo-400">Gem Energy</b>, and does not consume <b class="text-indigo-400">Gem Energy</b>.`,
      image: 'asset/traces/SkillIcon_1508_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Dimensional Traveler`,
      content: `Increases Rin Tohsaka's Skill DMG by <span class="text-desc">30%</span>. While Rin Tohsaka is on the field, Skill DMG dealt by all allies becomes <span class="text-desc">110%</span> of the original DMG.`,
      image: 'asset/traces/SkillIcon_1508_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Holy Grail War: Victory Memorial',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
      image: 'asset/traces/SkillIcon_1508_Ultra.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Red Devil: Triple Speed`,
      content: `While Rin Tohsaka is on the field, when an ally target consumes or recovers Skill Points, increases their SPD by <span class="text-desc">10%</span> for <span class="text-desc">3</span> turn(s).`,
      image: 'asset/traces/SkillIcon_1508_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Goddess of Venus's Favor`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1508_BP.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Nailed It This Time!',
      content: `Rin Tohsaka's <b>All-Type RES PEN</b> increases by <span class="text-desc">20%</span>. When using Ultimate, gains <span class="text-desc">18</span> point(s) of <b class="text-indigo-400">Gem Energy</b> and <span class="text-desc">1</span> extra turn.`,
      image: 'asset/traces/SkillIcon_1508_Rank6.webp',
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'rin_gem',
      text: `Gem Energy`,
      ...talents.skill_alt,
      show: true,
      default: 30,
      min: 0,
    },
    {
      type: 'number',
      id: 'rin_sp',
      text: `Current Skill Point`,
      ...talents.skill_alt,
      show: true,
      default: 3,
      min: 0,
    },
    {
      type: 'toggle',
      id: 'rin_ult',
      text: `Ult Vulnerability`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 3,
      debuff: true,
    },
    {
      type: 'toggle',
      id: 'rin_talent',
      text: `Talent CRIT DMG`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'rin_a4',
      text: `A4 SPD Bonus`,
      ...talents.a4,
      show: a.a4,
      default: true,
      duration: 3,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'rin_ult')]

  const allyContent: IContent[] = [
    {
      type: 'toggle',
      id: 'rin_c4',
      text: `E4 SPD Bonus`,
      ...talents.c4,
      show: c >= 4,
      default: true,
      duration: 3,
    },
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
    ) => {
      const base = _.cloneDeep(x)

      base.SKILL_ALT = form.rin_gem >= 15 || form.rin_sp >= 7

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
      const totalHits = _.min([_.floor((form.rin_gem + _.max([form.rin_sp - 2, 0]) * 2) / 3), 33])
      base.SKILL_SCALING = base.SKILL_ALT
        ? [
            {
              name: 'Total Single Target DMG',
              value: [
                { scaling: calcScaling(0.45, 0.045, skill, 'curved'), hits: totalHits + 1, multiplier: Stats.ATK },
              ],
              element: Element.QUANTUM,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20 + 2 * totalHits,
              sum: true,
            },
            {
              name: 'AoE',
              value: [{ scaling: calcScaling(0.45, 0.045, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.QUANTUM,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
            },
            {
              name: 'Bounce',
              value: [{ scaling: calcScaling(0.45, 0.045, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.QUANTUM,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 2,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.9, 0.09, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.QUANTUM,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
              sum: true,
            },
          ]
      base.ULT_SCALING = [
        {
          name: 'Main',
          value: [{ scaling: calcScaling(3, 0.3, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
        {
          name: 'Others',
          value: [{ scaling: calcScaling(1, 0.1, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
        },
      ]

      if (form.rin_ult) {
        base.VULNERABILITY.push({
          name: `Ultimate`,
          source: 'Self',
          value: calcScaling(0.1, 0.01, ult, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.rin_talent) {
        base[Stats.CRIT_DMG].push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.5, 0.05, talent, 'curved'),
        })
      }
      if (a.a2) {
        base[Stats.P_ATK].push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 1.5,
        })
        base.DEF_PEN.push({
          name: `Ascension 2 Passive`,
          source: 'Self',
          value: 0.2,
        })
      }
      if (form.rin_a4) {
        base[Stats.P_SPD].push({
          name: `Ascension 4 Passive`,
          source: 'Self',
          value: 0.2,
        })
      }
      if (c >= 2) {
        base.SKILL_DMG.push({
          name: `Eidolon 2`,
          source: 'Self',
          value: 0.3,
        })
        base.SKILL_MULT.push({
          name: `Eisolon 2`,
          source: 'Self',
          value: 0.1,
        })
      }
      if (form.rin_c4) {
        base[Stats.P_SPD].push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.1,
        })
      }
      if (c >= 6) {
        base.ALL_TYPE_RES_PEN.push({
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
      debuffs: { type: DebuffTypes; count: number }[],
      weakness: Element[],
      broken: boolean,
    ) => {
      if (base.ID === '1015') {
        const rinIndex = _.findIndex(team, (item) => item?.cId === own.ID)
        const archerIndex = _.findIndex(team, (item) => item?.cId === base.ID)

        const joint: IScaling[] = [
          {
            name: 'Rin Joint AoE DMG',
            value: [{ scaling: calcScaling(1.5, 0.15, talent, 'curved'), multiplier: Stats.ATK }],
            element: Element.QUANTUM,
            property: TalentProperty.FUA,
            type: TalentType.TALENT,
            break: 20,
            overrideIndex: rinIndex,
          },
          {
            name: 'Archer Joint AoE DMG',
            value: [{ scaling: calcScaling(1.5, 0.15, talent, 'curved'), multiplier: Stats.ATK }],
            element: Element.QUANTUM,
            property: TalentProperty.FUA,
            type: TalentType.TALENT,
            break: 20,
            overrideIndex: archerIndex,
          },
        ]
        base.TALENT_SCALING.push(...joint)
        own.TALENT_SCALING.push(..._.map(joint, (j) => ({ ...j, sum: true })))

        if (a.a2) {
          base[Stats.P_ATK].push({
            name: `Ascension 2 Passive`,
            source: 'Rin Tohsaka',
            value: 1.5,
          })
          base.DEF_PEN.push({
            name: `Ascension 2 Passive`,
            source: 'Rin Tohsaka',
            value: 0.2,
          })
        }
      }

      if (form.rin_ult) {
        base.VULNERABILITY.push({
          name: `Ultimate`,
          source: 'Rin Tohsaka',
          value: calcScaling(0.1, 0.01, ult, 'curved'),
        })
      }
      if (c >= 2) {
        base.SKILL_MULT.push({
          name: `Eisolon 2`,
          source: 'Rin Tohsaka',
          value: 0.1,
        })
      }
      if (aForm.rin_c4) {
        base[Stats.P_SPD].push({
          name: `Eidolon 4`,
          source: 'Rin Tohsaka',
          value: 0.1,
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
      broken: boolean,
      globalCallback: CallbackType[],
      globalMod: GlobalModifiers,
    ) => {
      return base
    },
  }
}

export default Rin
