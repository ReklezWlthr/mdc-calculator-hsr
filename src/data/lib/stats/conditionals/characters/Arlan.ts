import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Arlan = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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
      title: 'Lightning Rush',
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Arlan's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      title: 'Shackle Breaker',
      content: `Consumes Arlan's HP equal to <span class="text-desc">15%</span> of his Max HP to deal <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Arlan's ATK to a single enemy. If Arlan does not have sufficient HP, his HP will be reduced to <span class="text-desc">1</span> after using his Skill.`,
      value: [{ base: 120, growth: 12, style: 'curved' }],
      level: skill,
    },
    ult: {
      title: `Frenzied Punishment`,
      content: `Deals <b class="text-hsr-lightning">Lightning DMG</b> equal to {{0}}% of Arlan's ATK to a single enemy and <b class="text-hsr-lightning">Lightning DMG</b> equal to {{1}}% of Arlan's ATK to enemies adjacent to it.`,
      value: [
        { base: 192, growth: 12.8, style: 'curved' },
        { base: 96, growth: 6.4, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      title: `Pain and Anger`,
      content: `Increases Arlan's DMG for every percent of HP below his Max HP, up to a max of {{0}}% more DMG.`,
      value: [{ base: 36, growth: 3.6, style: 'curved' }],
      level: talent,
    },
    technique: {
      title: 'Swift Harvest',
      content: `Immediately attacks the enemy. After entering battle, deals <b class="text-hsr-lightning">Lightning DMG</b> equal to <span class="text-desc">80%</span> of Arlan's ATK to all enemies.`,
    },
    a2: {
      title: `Revival`,
      content: `If the current HP percentage is <span class="text-desc">30%</span> or lower when defeating an enemy, immediately restores HP equal to <span class="text-desc">20%</span> of Max HP.`,
    },
    a4: {
      title: `Endurance`,
      content: `The chance to resist DoT Debuffs increases by <span class="text-desc">50%</span>.`,
    },
    a6: {
      title: `Repel`,
      content: `Upon entering battle, if Arlan's HP is less than or equal to <span class="text-desc">50%</span>, he can nullify all DMG received except for DoT until after he is attacked.`,
    },
    c1: {
      title: 'To the Bitter End',
      content: `When HP is lower than or equal to <span class="text-desc">50%</span> of Max HP, increases Skill's DMG by <span class="text-desc">10%</span>.`,
    },
    c2: {
      title: `Breaking Free`,
      content: `Using Skill or Ultimate removes <span class="text-desc">1</span> debuff from oneself.`,
    },
    c3: {
      title: 'Power Through',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      title: 'Turn the Tables',
      content: `When struck by a killing blow after entering battle, instead of becoming knocked down, Arlan immediately restores his HP to <span class="text-desc">25%</span> of his Max HP. This effect is automatically removed after it is triggered once or after <span class="text-desc">2</span> turn(s) have elapsed.`,
    },
    c5: {
      title: `Hammer and Tongs`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      title: 'Self-Sacrifice',
      content: `When HP drops to <span class="text-desc">50%</span> or below, Ultimate deals <span class="text-desc">20%</span> more DMG. The DMG multiplier of DMG taken by the target enemy now applies to adjacent enemies as well.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'arlan_hp',
      text: `Current HP%`,
      ...talents.talent,
      show: true,
      default: 50,
      min: 0,
      max: 100,
      unique: true,
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

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          energy: 20,
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.2, 0.12, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          energy: 30,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Main',
          value: [{ scaling: calcScaling(1.92, 0.128, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          energy: 5,
        },
        {
          name: 'Adjacent',
          value: [
            {
              scaling: c >= 6 ? calcScaling(1.92, 0.128, ult, 'curved') : calcScaling(0.96, 0.064, ult, 'curved'),
              multiplier: Stats.ATK,
            },
          ],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          energy: 5,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 0.8, multiplier: Stats.ATK }],
          element: Element.LIGHTNING,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          break: 20,
        },
      ]

      base[Stats.ALL_DMG].push({
        name: `Talent`,
        source: 'Self',
        value: calcScaling(0.36, 0.036, talent, 'curved') * (1 - form.arlan_hp / 100),
      })
      if (form.arlan_hp <= 30 && a.a2)
        base.SKILL_SCALING.push({
          name: 'Healing On-Kill',
          value: [{ scaling: 0.2, multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        })
      if (form.arlan_hp <= 50 && c >= 1)
        base.SKILL_DMG.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.1,
        })
      if (form.arlan_hp <= 50 && c >= 6)
        base.ULT_DMG.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.2,
        })

      if (c >= 4)
        base.SKILL_SCALING.push({
          name: 'E4 Revive Healing',
          value: [{ scaling: 0.25, multiplier: Stats.HP }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
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
      return base
    },
  }
}

export default Arlan
