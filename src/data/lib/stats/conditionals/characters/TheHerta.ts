import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
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

const TheHerta = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const eruditionCount = _.filter(team, (m) => findCharacter(m.cId)?.path === PathType.ERUDITION).length

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Wake Me up When Slumber Ends',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of The Herta's ATK to one designated enemy target.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Big Brain Energy',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of The Herta's ATK to one designated enemy, and inflicts <span class="text-desc">1</span> stack(s) of <b class="text-hsr-ice">Interpretation</b>. Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of The Herta's ATK to the target that has been hit by this instance of Skill and their respective adjacent targets. This effect can repeat <span class="text-desc">2</span> times.`,
      value: [{ base: 35, growth: 3.5, style: 'curved' }],
      level: skill,
      tag: AbilityTag.AOE,
    },
    skill_alt: {
      energy: 30,
      trace: 'Enhanced Skill',
      title: 'Hear Me Out',
      content: `Consumes <span class="text-desc">1</span> stack of <b class="text-desc">Inspiration</b>. Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of The Herta's ATK to one designated enemy and inflicts <span class="text-desc">1</span> stack(s) of <b class="text-hsr-ice">Interpretation</b>. Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of The Herta's ATK to the target hit by this instance of Skill and adjacent targets, repeating <span class="text-desc">2</span> times. Finally, deals <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of The Herta's ATK to all enemies.`,
      value: [
        { base: 40, growth: 4, style: 'curved' },
        { base: 20, growth: 2, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.AOE,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Told Ya! Magic Happens`,
      content: `Rearranges the number of <b class="text-hsr-ice">Interpretation</b> stacks on all enemies, prioritizing the transfer of a higher number of <b class="text-hsr-ice">Interpretation</b> stacks to Elite level targets and above. Then, deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% The Herta's ATK to all enemies. When using Ultimate, increases The Herta's ATK by {{1}}%, lasting for <span class="text-desc">3</span> turn(s). using the Ultimate, The Herta immediately takes action and gains <span class="text-desc">1</span> stack of <b class="text-desc">Inspiration</b>. <b class="text-desc">Inspiration</b> can stack up to <span class="text-desc">4</span> time(s). While having <b class="text-desc">Inspiration</b>, enhances Skill to <b>Hear Me Out</b>.`,
      value: [
        { base: 100, growth: 10, style: 'curved' },
        { base: 40, growth: 4, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      energy: 5,
      trace: 'Talent',
      title: `Hand Them Over`,
      content: `When enemy targets enter battle, The Herta inflicts <span class="text-desc">1</span> stack of <b class="text-hsr-ice">Interpretation</b> on them. At the start of each wave, applies <span class="text-desc">25</span> <b class="text-hsr-ice">Interpretation</b> stack(s) to a random enemy target, prioritizing Elite enemy targets or higher. When the Enhanced Skill's primary target has <b class="text-hsr-ice">Interpretation</b>, the multiplier for the DMG dealt increases, with each stack granting an increase of {{0}}%/{{1}}% on the primary target/other targets respectively. If <span class="text-desc">2</span> or more characters follow the Path of Erudition in the team, each stack grants an additional increase of {{0}}%/{{1}}% on the primary target/other targets respectively. <b class="text-hsr-ice">Interpretation</b> can stack up to <span class="text-desc">42</span> time(s). When using the Enhanced Skill, resets the number of <b class="text-hsr-ice">Interpretation</b> stacks on the ability's target to <span class="text-desc">1</span>. After the enemy target leaves the battle or gets defeated by any unit, <b class="text-hsr-ice">Interpretation</b> will be transferred, prioritizing the transfer to Elite-level targets and above.`,
      value: [
        { base: 4, growth: 0.4, style: 'curved' },
        { base: 2, growth: 0.2, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.AOE,
    },
    technique: {
      trace: 'Technique',
      title: 'Vibe Check',
      content: `After using Technique, The Herta's ATK increases by <span class="text-desc">60%</span> at the start of the next battle, lasting for <span class="text-desc">2</span> turn(s).
      <br />If there are Basic Treasures in this current map, using Technique will mark up to <span class="text-desc">3</span> Basic Treasures' locations.
      <br />After entering battle by using Technique in Simulated Universe or Divergent Universe, deals <b class="text-red">True DMG</b> equal to <span class="text-desc">99%</span> of the target's Max HP to enemy targets lower than Elite-level, and <b class="text-red">True DMG</b> equal to <span class="text-desc">30%</span> of the target's Max HP to enemy targets at Elite-level and above.`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Aloofly Honest`,
      content: `When ally targets attack, inflicts <span class="text-desc">1</span> stack of <b class="text-hsr-ice">Interpretation</b> on the hit enemy target. After attacking, for every <span class="text-desc">1</span> target hit by this attack, regenerates <span class="text-desc">3</span> fixed Energy for The Herta, counting up to a maximum of <span class="text-desc">5</span> targets. When using Enhanced Skill and if the primary target's <b class="text-hsr-ice">Interpretation</b> stack is <span class="text-desc">42</span>, increases <b class="text-hsr-ice">Ice DMG</b> dealt by The Herta by <span class="text-desc">50%</span> until the end of this attack`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Message From Beyond the Veil`,
      content: `When entering battle, if the team has at least <span class="text-desc">2</span> characters following the Path of Erudition, increases all allies' CRIT DMG by <span class="text-desc">80%</span>, calculates at least <span class="text-desc">3</span> target(s) when the Trace <b>Aloofly Honest</b> calculates hit targets, applies <span class="text-desc">1</span> stack(s) of <b class="text-hsr-ice">Interpretation</b> to the target that has the highest existing current <b class="text-hsr-ice">Interpretation</b> stacks among the hit enemy targets after attacking, and additionally applies <span class="text-desc">2</span> stack(s) of <b class="text-hsr-ice">Interpretation</b> if the attacker is a character following the Path of Erudition.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Starved Landscape of Vacua`,
      content: `For every <span class="text-desc">1</span> stack of <b class="text-hsr-ice">Interpretation</b> inflicted on enemy targets, The Herta gains <span class="text-desc">1</span> stack of <b class="text-hsr-quantum">Answer</b> up to <span class="text-desc">99</span> stack(s). When using the Ultimate, every stack of <b class="text-hsr-quantum">Answer</b> increases the Ultimate's DMG multiplier by <span class="text-desc">1%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Night at Shorefall`,
      content: `When Enhanced Skill calculates <b class="text-hsr-ice">Interpretation</b>, additionally calculates <span class="text-desc">50%</span> of the <b class="text-hsr-ice">Interpretation</b> stacks on the <span class="text-desc">1</span> target with the highest stacks out of the primary target and adjacent targets. When using Enhanced Skill to reset <b class="text-hsr-ice">Interpretation</b>, reset the stack number to <span class="text-desc">15</span> instead.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Wind Through Keyhole`,
      content: `If enemy <b class="text-hsr-ice">Interpretation</b> reaches <span class="text-desc">42</span> when stacks are applied or transferred to them, then The Herta gains <span class="text-desc">1</span> stack of <b class="text-desc">Inspiration</b>. This effect can only trigger once per enemy target. When using Enhanced Skill, The Herta's action advances by <span class="text-desc">35%</span>. If the target's <b class="text-hsr-ice">Interpretation</b> stack is <span class="text-desc">42</span>, additionally advance The Herta's action by <span class="text-desc">25%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Door into Summer`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'The Sixteenth Keys',
      content: `The SPD of characters following the Path of Erudition in the team increases by <span class="text-desc">12%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Bitter Pill of Truth`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Sweet Lure of Answer',
      content: `The Herta's <b class="text-hsr-ice">Ice RES PEN</b> increases by <span class="text-desc">20%</span>. When the number of enemy targets on the field is <span class="text-desc">3</span> (or more)/<span class="text-desc">2</span>/<span class="text-desc">1</span>, Ultimate's DMG multiplier increases by <span class="text-desc">140%</span>/<span class="text-desc">250%</span>/<span class="text-desc">400%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'the_herta_skill',
      text: `Enhanced Skill`,
      ...talents.skill_alt,
      show: true,
      default: true,
      sync: true,
    },
    {
      type: 'number',
      id: 'interpretation_c1_r',
      text: `Interpretation (Right)`,
      ...talents.c1,
      show: c >= 1,
      default: 1,
      min: 1,
      max: 42,
    },
    {
      type: 'number',
      id: 'interpretation',
      text: `Interpretation (Main)`,
      ...talents.talent,
      show: true,
      default: 1,
      min: 1,
      max: 42,
    },
    {
      type: 'number',
      id: 'interpretation_c1_l',
      text: `Interpretation (Left)`,
      ...talents.c1,
      show: c >= 1,
      default: 1,
      min: 1,
      max: 42,
    },
    {
      type: 'toggle',
      id: 'the_herta_ult',
      text: `Ult ATK Bonus`,
      ...talents.ult,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'the_herta_tech',
      text: `Technique ATK Bonus`,
      ...talents.technique,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'number',
      id: 'interpretation_a6',
      text: `Answer Stacks`,
      ...talents.a6,
      show: a.a6,
      default: 1,
      min: 1,
      max: 99,
    },
    {
      type: 'number',
      id: 'the_herta_c6',
      text: `Enemies on Field`,
      ...talents.c6,
      show: c >= 6,
      default: 3,
      min: 1,
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

      if (form.the_herta_skill) base.SKILL_ALT = true
      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          energy: 20,
          sum: true,
        },
      ]
      const additionalStackCount = _.head(
        _.sortBy([form.interpretation, form.interpretation_c1_l, form.interpretation_c1_r]).reverse()
      )
      const stackCount =
        (c >= 1 ? form.interpretation + _.floor(additionalStackCount * 0.5) : form.interpretation) *
        (eruditionCount >= 2 ? 2 : 1)
      const enhancedSkill =
        calcScaling(0.4, 0.04, skill, 'curved') + stackCount * calcScaling(0.04, 0.004, talent, 'curved')
      const enhancedLastHit =
        calcScaling(0.2, 0.02, skill, 'curved') + stackCount * calcScaling(0.04, 0.004, talent, 'curved')
      const enhancedSkillOther =
        calcScaling(0.4, 0.04, skill, 'curved') + stackCount * calcScaling(0.02, 0.002, talent, 'curved')
      const enhancedLastHitOther =
        calcScaling(0.2, 0.02, skill, 'curved') + stackCount * calcScaling(0.02, 0.002, talent, 'curved')
      base.SKILL_SCALING = form.the_herta_skill
        ? [
            {
              name: 'Main Target',
              value: [
                { scaling: enhancedSkill, multiplier: Stats.ATK },
                { scaling: enhancedSkill, multiplier: Stats.ATK },
                { scaling: enhancedSkill, multiplier: Stats.ATK },
                { scaling: enhancedLastHit, multiplier: Stats.ATK },
              ],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
              sum: true,
              bonus: a.a2 && form.interpretation === 42 ? 0.5 : 0,
            },
            {
              name: 'Adjacent',
              value: [
                { scaling: enhancedSkillOther, multiplier: Stats.ATK },
                { scaling: enhancedSkillOther, multiplier: Stats.ATK },
                { scaling: enhancedLastHitOther, multiplier: Stats.ATK },
              ],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 15,
              sum: false,
              bonus: a.a2 && form.interpretation === 42 ? 0.5 : 0,
            },
            {
              name: 'Others',
              value: [{ scaling: enhancedLastHitOther, multiplier: Stats.ATK }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 10,
              sum: false,
              bonus: a.a2 && form.interpretation === 42 ? 0.5 : 0,
            },
          ]
        : [
            {
              name: 'Main Target',
              value: [
                { scaling: calcScaling(0.35, 0.035, skill, 'curved'), multiplier: Stats.ATK },
                { scaling: calcScaling(0.35, 0.035, skill, 'curved'), multiplier: Stats.ATK },
                { scaling: calcScaling(0.35, 0.035, skill, 'curved'), multiplier: Stats.ATK },
              ],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 15,
              sum: false,
            },
            {
              name: 'Adjacent',
              value: [
                { scaling: calcScaling(0.35, 0.035, skill, 'curved'), multiplier: Stats.ATK },
                { scaling: calcScaling(0.35, 0.035, skill, 'curved'), multiplier: Stats.ATK },
              ],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 10,
              sum: false,
            },
            {
              name: 'Others',
              value: [{ scaling: calcScaling(0.35, 0.035, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 5,
              sum: false,
            },
          ]
      const c6Scaling = form.the_herta_c6 >= 3 ? 4 : form.the_herta_c6 === 2 ? 2.5 : form.the_herta_c6 === 1 ? 1.4 : 0
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1, 0.1, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          multiplier: 1 + (form.interpretation_a6 / 100 + (c >= 6 ? c6Scaling : 0)),
          sum: true,
        },
      ]

      if (form.the_herta_ult)
        base[Stats.P_ATK].push({
          name: `Ultimate`,
          source: 'Self',
          value: calcScaling(0.4, 0.04, ult, 'curved'),
        })
      if (form.the_herta_tech)
        base[Stats.P_ATK].push({
          name: `Technique`,
          source: 'Self',
          value: 0.6,
        })
      if (c >= 4) {
        base[Stats.P_SPD].push({
          name: `Eidolon 4`,
          source: 'Self',
          value: 0.12,
        })
      }
      if (a.a4 && eruditionCount >= 2) {
        base[Stats.CRIT_DMG].push({
          name: `Ascension 4 Passive`,
          source: 'Self',
          value: 0.8,
        })
      }
      if (c >= 6) {
        base.ICE_RES_PEN.push({
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
      broken: boolean
    ) => {
      if (a.a4 && eruditionCount >= 2) {
        base[Stats.CRIT_DMG].push({
          name: `Ascension 4 Passive`,
          source: 'The Herta',
          value: 0.8,
        })
      }

      if (c >= 4 && base.PATH === PathType.ERUDITION) {
        base[Stats.P_SPD].push({
          name: `Eidolon 4`,
          source: 'The Herta',
          value: 0.12,
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
      return base
    },
  }
}

export default TheHerta
