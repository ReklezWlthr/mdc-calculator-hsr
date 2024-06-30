import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Guinaifen = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const names = _.map(team, (item) => findCharacter(item.cId)?.name)
  const index = _.findIndex(team, (item) => item.cId === '1210')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Standing Ovation`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Guinaifen's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: `Blazing Welcome`,
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Guinaifen's ATK to a single enemy and deals <b class="text-hsr-fire">Fire DMG</b> equal to {{1}}% of Guinaifen's ATK to any adjacent enemies with a <span class="text-desc">100%</span> <u>base chance</u> to <b class="text-hsr-fire">Burn</b> the target and adjacent targets. When <b class="text-hsr-fire">Burned</b>, enemies will take a <b class="text-hsr-fire">Fire DoT</b> equal to {{2}}% of Guinaifen's ATK at the beginning of each turn, lasting for <span class="text-desc">2</span> turn(s).`,
      value: [
        { base: 60, growth: 6, style: 'curved' },
        { base: 20, growth: 2, style: 'curved' },
        { base: 83.904, growth: 8.394, style: 'dot' },
      ],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Watch This Showstopper',
      content: `Deals <b class="text-hsr-fire">Fire DMG</b> equal to {{0}}% of Guinaifen's ATK to all enemies. If the target enemy is currently inflicted with <b class="text-hsr-fire">Burn</b>, then their <b class="text-hsr-fire">Burn</b> status immediately produce DMG equal to {{1}}% of their original DMG.`,
      value: [
        { base: 72, growth: 4.8, style: 'curved' },
        { base: 72, growth: 2, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `PatrAeon Benefits`,
      content: `When Guinaifen is on the field, there is a <span class="text-desc">100%</span> <u>base chance</u> to apply <b>Firekiss</b> to an enemy after their <b class="text-hsr-fire">Burn</b> status causes DMG. While inflicted with <b>Firekiss</b>, the enemy receives {{0}}% increased DMG, which lasts for <span class="text-desc">3</span> turn(s) and can stack up to <span class="text-desc">3</span> time(s).`,
      value: [{ base: 4, growth: 0.3, style: 'curved' }],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: `Skill Showcase`,
      content: `Immediately attacks the enemy. After entering battle, deals DMG for <span class="text-desc">4</span> time(s), dealing <b class="text-hsr-fire">Fire DMG</b> equal to <span class="text-desc">50%</span> of Guinaifen's ATK to a random single enemy target each time, with a <span class="text-desc">100%</span> <u>base chance</u> of inflicting <b>Firekiss</b> on them.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `High Poles`,
      content: `Basic ATK has a <span class="text-desc">80%</span> <u>base chance</u> of inflicting an enemy with a <b class="text-hsr-fire">Burn</b>, equivalent to that of Skill.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Bladed Hoop`,
      content: `When the battle begins, Guinaifen's action is advanced forward by <span class="text-desc">25%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Walking on Knives`,
      content: `Deals <span class="text-desc">20%</span> more DMG to <b class="text-hsr-fire">Burned</b> enemies.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Slurping Noodles During Handstand`,
      content: `When Skill is used, there is a <span class="text-desc">100%</span> <u>base chance</u> to reduce the attacked target enemy's Effect RES by <span class="text-desc">10%</span> for <span class="text-desc">2</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Brushing Teeth While Whistling`,
      content: `When an enemy target is <b class="text-hsr-fire">Burned</b>, Guinaifen's Basic ATK and Skill can increase the DMG multiplier of their <b class="text-hsr-fire">Burn</b> status by 40%.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Smashing Boulder on Chest`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Blocking Pike with Neck`,
      content: `Every time the <b class="text-hsr-fire">Burn</b> status inflicted by Guinaifen causes DMG, Guinaifen regenerates <span class="text-desc">2</span> Energy.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Swallowing Sword to Stomach`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Catching Bullet with Hands`,
      content: `Increases the stackable Firekiss count by <span class="text-desc">1</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'firekiss',
      text: `Firekiss Stacks`,
      ...talents.talent,
      show: true,
      default: 1,
      min: 0,
      max: c >= 6 ? 4 : 3,
      chance: { base: 1, fixed: false },
      debuff: true,
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'gui_burn',
      text: `Skill Burn`,
      ...talents.skill,
      show: true,
      default: true,
      chance: { base: 1, fixed: false },
      debuff: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'gui_c1',
      text: `E1 Effect RES Reduction`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      chance: { base: 1, fixed: false },
      debuff: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'gui_c2',
      text: `Enhanced Burn DMG`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      unique: true,
    },
  ]

  const teammateContent: IContent[] = [
    findContentById(content, 'firekiss'),
    findContentById(content, 'gui_burn'),
    findContentById(content, 'gui_c1'),
    findContentById(content, 'gui_c2'),
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
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(0.6, 0.06, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.2, 0.02, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.72, 0.048, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'Bounce [x4]',
          value: [{ scaling: 0.5, multiplier: Stats.ATK }],
          element: Element.FIRE,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
        },
      ]

      if (form.gui_burn) {
        const burn = {
          name: 'Burn DMG',
          value: [
            { scaling: calcScaling(0.83904, 0.08394, skill, 'dot') + (form.gui_c2 ? 0.4 : 0), multiplier: Stats.ATK },
          ],
          element: Element.FIRE,
          property: TalentProperty.DOT,
          type: TalentType.NONE,
          chance: { base: 1, fixed: false },
        }
        base.SKILL_SCALING.push(burn)
        base.DOT_SCALING.push({
          ...burn,
          overrideIndex: index,
          dotType: DebuffTypes.BURN,
        })
        if (a.a2) base.BASIC_SCALING.push({ ...burn, chance: { base: 0.8, fixed: false } })
        addDebuff(debuffs, DebuffTypes.BURN)
      }
      if (form.firekiss) {
        base.VULNERABILITY.push({
          name: 'Firekiss',
          source: 'Self',
          value: calcScaling(0.04, 0.003, talent, 'curved') * form.firekiss,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.gui_c1) {
        base.E_RES_RED.push({
          name: 'Eidolon 1',
          source: 'Self',
          value: 0.1,
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
      if (form.firekiss)
        base.VULNERABILITY.push({
          name: 'Firekiss',
          source: 'Guinaifen',
          value: calcScaling(0.04, 0.003, talent, 'curved') * form.firekiss,
        })
      if (form.gui_c1)
        base.E_RES_RED.push({
          name: 'Eidolon 1',
          source: 'Guinaifen',
          value: 0.1,
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
      if (countDebuff(debuffs, DebuffTypes.BURN) && a.a6)
        base[Stats.ALL_DMG].push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.2,
        })
      base.CALLBACK.push((x, d, w, all) => {
        const burn = _.filter(
          _.flatMap(all, (item) => item.DOT_SCALING),
          (item) => _.includes([DebuffTypes.BURN, DebuffTypes.DOT], item.dotType)
        )
        x.ULT_SCALING.push(
          ..._.map(burn, (item, i) => ({
            ...item,
            chance: undefined,
            name: `${names?.[item.overrideIndex]}'s ${item.name}`.replace('DMG', 'Detonation'),
            multiplier: (item.multiplier || 1) * calcScaling(0.72, 0.02, talent, 'curved'),
          }))
        )
        return x
      })

      return base
    },
  }
}

export default Guinaifen
