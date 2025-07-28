import { findCharacter, findContentById } from '@src/core/utils/finder'
import _ from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const FuXuan = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const index = _.findIndex(team, (item) => item?.cId === '1208')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Novaburst',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Fu Xuan's Max HP to a single target enemy.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Known by Stars, Shown by Hearts',
      content: `Activates <b>Matrix of Prescience</b>, via which other team members will Distribute <span class="text-desc">65%</span> of the DMG they receive (before this DMG is mitigated by any Shields) to Fu Xuan for <span class="text-desc">3</span> turn(s).
      <br />While affected by <b>Matrix of Prescience</b>, all team members gain the <b>Knowledge</b> effect, which increases their respective Max HP by {{0}}% of Fu Xuan's Max HP, and increases CRIT Rate by {{1}}%.
      <br />When Fu Xuan is knocked down, the <b>Matrix of Prescience</b> will be dispelled.`,
      value: [
        { base: 3, growth: 0.3, style: 'curved' },
        { base: 6, growth: 0.6, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.DEFENSE,
      sp: -1,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Woes of Many Morphed to One',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Fu Xuan's Max HP to all enemies and obtains <span class="text-desc">1</span> trigger count for the HP Restore effect granted by Fu Xuan's Talent.`,
      value: [{ base: 60, growth: 4, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
    },
    talent: {
      trace: 'Talent',
      title: 'Bleak Breeds Bliss',
      content: `While Fu Xuan is still active in battle, <b>Misfortune Avoidance</b> is applied to the entire team. With <b>Misfortune Avoidance</b>, allies take {{0}}% less DMG.
      <br />When Fu Xuan's current HP falls to <span class="text-desc">50%</span> of her Max HP or less, HP Restore will be triggered for Fu Xuan, restoring her HP by {{1}}% of the amount of HP she is currently missing. This effect cannot be triggered if she receives a killing blow. This effect possesses <span class="text-desc">1</span> trigger count by default and can have a maximum of <span class="text-desc">2</span> trigger counts.`,
      value: [
        { base: 10, growth: 0.8, style: 'curved' },
        { base: 80, growth: 1, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.RESTORE,
    },
    technique: {
      trace: 'Technique',
      title: 'Of Fortune Comes Fate',
      content: `After the Technique is used, all team members receive a Barrier, lasting for <span class="text-desc">20</span> seconds. This Barrier can block all enemy attacks, and the team will not enter battle when attacked. Entering battle while the Barrier is active will have Fu Xuan automatically activate <b>Matrix of Prescience</b> at the start of the battle, lasting for <span class="text-desc">2</span> turn(s).`,
      tag: AbilityTag.DEFENSE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'Taiyi, the Macrocosmic',
      content: `When Matrix of Prescience is active, Fu Xuan will regenerate <span class="text-desc">20</span> extra Energy when she uses her Skill.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'Dunjia, the Metamystic',
      content: `When Fu Xuan's Ultimate is used, heals all other allies by an amount equal to <span class="text-desc">5%</span> of Fu Xuan's Max HP plus <span class="text-desc">133</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Liuren, the Sexagenary',
      content: `If a target enemy applies Crowd Control debuffs to allies while the <b>Matrix of Prescience</b> is active, all allies will resist all Crowd Control debuffs applied by the enemy target during the current action. This effect can only be triggered once. When <b>Matrix of Prescience</b> is activated again, the number of times this effect can be triggered will reset.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Dominus Pacis',
      content: `The Knowledge effect increases CRIT DMG by 30%.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'Optimus Felix',
      content: `If any team member is struck by a killing blow while <b>Matrix of Prescience</b> is active, then all allies who were struck by a killing blow during this action will not be knocked down, and <span class="text-desc">70%</span> of their Max HP is immediately restored. This effect can trigger <span class="text-desc">1</span> time per battle.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Apex Nexus',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Fortuna Stellaris',
      content: `When other allies under <b>Matrix of Prescience</b> are attacked, Fu Xuan regenerates <span class="text-desc">5</span> Energy.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Arbiter Primus',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Omnia Vita',
      content: `Once <b>Matrix of Prescience</b> is activated, it will keep a tally of the total HP lost by all team members in the current battle. Fu Xuan's Ultimate DMG will increase by <span class="text-desc">200%</span> of this tally of HP loss.
      <br />This tally is also capped at <span class="text-desc">120%</span> of Fu Xuan's Max HP and the tally value will reset and re-accumulate after Fu Xuan's Ultimate is used.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'knowledge',
      text: `Knowledge`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 3,
    },
    {
      type: 'toggle',
      id: 'misfortune',
      text: `Misfortune Avoidance`,
      ...talents.talent,
      show: true,
      default: true,
      duration: 2,
    },

    {
      type: 'toggle',
      id: 'fx_c6',
      text: `Total HP Loss Tally`,
      ...talents.c6,
      show: c >= 6,
      default: 0,
      min: 0,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'knowledge'), findContentById(content, 'misfortune')]

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
      }[]
    ) => {
      const base = _.cloneDeep(x)

      base.BASIC_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(0.25, 0.05, basic, 'linear'), multiplier: Stats.HP }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          energy: 20,
          sum: true,
        },
      ]

      if (form.knowledge) {
        base[Stats.CRIT_RATE].push({
          name: `Skill`,
          source: 'Self',
          value: calcScaling(0.06, 0.006, skill, 'curved'),
        })
        if (c >= 1)
          base[Stats.CRIT_DMG].push({
            name: `Eidolon 1`,
            source: 'Self',
            value: 0.3,
          })
      }
      if (form.misfortune)
        base.DMG_REDUCTION.push({
          name: `Talent`,
          source: 'Self',
          value: calcScaling(0.1, 0.008, talent, 'curved'),
        })
      if (a.a4)
        base.ULT_SCALING.push({
          name: 'Ally Healing',
          value: [{ scaling: 0.05, multiplier: Stats.HP }],
          flat: 133,
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.ULT,
        })

      return base
    },
    preComputeShared: (
      own: StatsObject,
      base: StatsObject,
      form: Record<string, any>,
      aForm: Record<string, any>,
      debuffs: { type: DebuffTypes; count: number }[]
    ) => {
      if (form.knowledge) {
        base[Stats.CRIT_RATE].push({
          name: `Skill`,
          source: 'Fu Xuan',
          value: calcScaling(0.06, 0.006, skill, 'curved'),
        })
        base.CALLBACK.push((x, d, w, all) => {
          x.X_HP.push({
            name: `Skill`,
            source: 'Fu Xuan',
            value: calcScaling(0.03, 0.003, skill, 'curved') * all[index].getHP(true),
            base: all[index].getHP(true),
            multiplier: calcScaling(0.03, 0.003, skill, 'curved'),
          })
          return x
        })
        if (c >= 1)
          base[Stats.CRIT_DMG].push({
            name: `Eidolon 6`,
            source: 'Fu Xuan',
            value: 0.3,
          })
      }
      if (form.misfortune)
        base.DMG_REDUCTION.push({ name: `Talent`, source: 'Fu Xuan', value: calcScaling(0.1, 0.008, talent, 'curved') })

      return base
    },
    postCompute: (
      base: StatsObject,
      form: Record<string, any>,
      team: StatsObject[],
      allForm: Record<string, any>[]
    ) => {
      if (form.knowledge)
        base.X_HP.push({
          name: `Skill`,
          source: 'Self',
          value: calcScaling(0.03, 0.003, skill, 'curved') * base.getHP(true),
          base: base.getHP(true),
          multiplier: calcScaling(0.03, 0.003, skill, 'curved'),
        })
      base.ULT_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.6, 0.04, ult, 'curved'), multiplier: Stats.HP }],
          flat: form.fx_c6 ? _.min([base.getHP() * 1.2, form.fx_c6 * 2]) : 0,
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          energy: 5,
          sum: true,
        },
      ]

      return base
    },
  }
}

export default FuXuan
