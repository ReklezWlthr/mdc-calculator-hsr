import { addDebuff, findContentById } from '@src/core/utils/finder'
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
import { Banger, IContent, ITalent } from '@src/domain/conditional'
import { DebuffTypes } from '@src/domain/constant'
import { calcScaling } from '@src/core/utils/calculator'
import { CallbackType } from '@src/domain/stats'

const SilverWolfSP = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 3 ? 2 : 0,
    ult: c >= 5 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
    elation: c >= 5 ? 2 : c >= 3 ? 1 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent
  const elation = t.elation + upgrade.elation

  const index = _.findIndex(team, (item) => item?.cId === '1506')

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: 'One Punch!',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Silver Wolf LV.999's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
      energy: 0,
      image: 'asset/traces/SkillIcon_1506_Normal.webp',
    },
    normal_alt: {
      trace: 'Enhanced Basic ATK',
      title: 'Bonus Stage: α Wolf Instant',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Silver Wolf LV.999's ATK, split evenly into <span class="text-desc">100</span> bounces that hit random single enemies. After bouncing a certain number of times, the bouncing pauses and triggers <b>Top Loot Box</b> <span class="text-desc">1</span> time, for a total of <span class="text-desc">3</span> triggers.
      <br />If all enemies on the field take fatal damage, this ability ends. After enemy targets that can be attacked emerges, gains <span class="text-desc">1</span> extra turn and uses this ability again based on the remaining bounces and <b>Top Loot Box</b> triggers. The first time this effect triggers per turn, extends the duration of all buffs on this unit by <span class="text-desc">1</span> turn.
      <br />After all of the above DMG is dealt, unleashes a Final Hit that deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{1}}% of Silver Wolf LV.999's ATK, split evenly among all enemies.
      <br />Enhanced Basic ATK cannot recover Skill Points. For every <span class="text-desc">60</span> points of <b class="text-violet-300">Hidden MMR</b>, increases DMG dealt during Enhanced Basic ATK by <span class="text-desc">15%</span> of the original DMG, stackable up to <span class="text-desc">2</span> times.`,
      value: [
        { base: 120, growth: 24, style: 'linear' },
        { base: 50, growth: 10, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BOUNCE,
      sp: 0,
      energy: 0,
      image: 'asset/traces/SkillIcon_1506_Normal.webp',
    },
    skill: {
      trace: 'Skill',
      title: `Trigger Happy`,
      content: `Gains <span class="text-desc">5</span> <b class="text-orange-400">Punchline</b> point(s) and deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Silver Wolf LV.999's ATK to all enemies.`,
      value: [{ base: 80, growth: 8, style: 'curved' }],
      level: skill,
      tag: AbilityTag.AOE,
      sp: -1,
      image: 'asset/traces/SkillIcon_1506_BP.webp',
    },
    summon_skill: {
      participantId: 999,
      trace: 'Elation Skill',
      title: 'Honkai-DMG Demo',
      content: `<span class="text-xs opacity-75 text-gray">Elation Skill</span>
      <br /><b>Pro-Gamer Move</b>
      <br />Gains <span class="text-desc">15</span> <b class="text-violet-300">Hidden MMR</b> point(s).
      <br />
      <br /><span class="text-xs opacity-75 text-gray">Enhanced Elation Skill</span>
      <br /><b>Honkai-DMG Demo</b>
      <br />Deals <span class="text-desc">6</span> instances of DMG, with each instance dealing {{0}}% <b class="text-hsr-imaginary">Imaginary</b> <b class="elation">Elation DMG</b> one random enemy. Then, resets the <u>fixed chance</u> to trigger <b>Top Loot Box</b> to its initial value.`,
      value: [{ base: 45, growth: 4.5, style: 'curved' }],
      level: elation,
      tag: AbilityTag.BOUNCE,
      energy: 0,
      image: 'asset/traces/SkillIcon_1506_Elation.webp',
    },
    ult: {
      trace: 'Ultimate',
      title: `God Mode: ON!`,
      content: `Enters the <b class="text-red">Godmode Player</b> state, and advances action by <span class="text-desc">100%</span>.
      <br />Deploys a Zone while in the <b class="text-red">Godmode Player</b> state. While Silver Wolf LV.999 possesses <b class="text-blue">Certified Banger</b>, each time an ally target within the Zone consumes <span class="text-desc">1</span> Skill Point, there is a chance to trigger <span class="text-desc">1</span> instance of Silver Wolf LV.999's <b>Top Loot Box</b>: Deal <b class="text-hsr-imaginary">Imaginary</b> <b class="elation">Elation DMG</b> equal to {{0}}% split evenly among all enemies, and randomly trigger <span class="text-desc">1</span> of the following effects:
      <br /><b class="text-true">Big Flipping Sword</b>: Additionally deals <b class="text-true">True DMG</b> to the enemy target with the highest HP equal to <span class="text-desc">20%</span> of the total DMG dealt this time;
      <br /><b class="text-sky-300">Kaboom Eggsplosion</b>: Recovers <span class="text-desc">2</span> Skill Point(s);
      <br /><b class="text-orange-300">Funky Munch Bean</b>: Gains <span class="text-desc">3</span> <b class="text-orange-400">Punchline(s)</b>.
      <br />The initial <u>fixed chance</u> to trigger this effect is <span class="text-desc">100%</span>. After successfully triggering, the <u>fixed chance</u> for the subsequent trigger is reduced to <span class="text-desc">20%</span> of the current chance. If the target is defeated before triggering, this effect triggers on the enemy target that just entered instead.`,
      value: [{ base: 45, growth: 4.5, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
      energy: 0,
      image: 'asset/traces/SkillIcon_1506_Ultra_on.webp',
    },
    talent: {
      trace: `Talent`,
      title: `I Carry, We Win`,
      content: `After reaching <span class="text-desc">60</span> <b class="text-violet-300">Hidden MMR</b> points, the Ultimate can be activated. After reaching the maximum limit, it can overflow by an additional <span class="text-desc">240</span> point(s).
      <br />When gaining <b class="text-orange-400">Punchline</b>, Silver Wolf LV.999 also gains an equal amount of <b class="text-violet-300">Hidden MMR</b>. Each point of <b class="text-violet-300">Hidden MMR</b> increases CRIT Rate by {{1}}%. After CRIT Rate increases to <span class="text-desc">100%</span>, each remaining point of <b class="text-violet-300">Hidden MMR</b> switches to increasing CRIT DMG by {{2}}%.
      <br />While in the <b class="text-red">Godmode Player</b> state, Silver Wolf LV.999 is immune to Crowd Control debuffs, cannot use her Ultimate, and gains Enhanced Basic ATK and Enhanced Elation Skill. After completely using Enhanced Basic ATK usage <span class="text-desc">3</span> time(s), she exits the <b class="text-red">Godmode Player</b> state. After exiting the <b class="text-red">Godmode Player</b> state, <b class="text-violet-300">Hidden MMR</b> is cleared.
      <br />While in possession of <b class="text-blue">Certified Banger</b>, using Basic ATK or Skill against attacked enemy targets deals {{0}}% <b class="text-hsr-imaginary">Imaginary</b> <b class="elation">Elation DMG</b>. Enhanced Basic ATK's ability DMG is converted to <b class="elation">Elation DMG</b> at the same multiplier.`,
      value: [
        { base: 20, growth: 2, style: 'curved' },
        { base: 0.2, growth: 0.02, style: 'curved' },
        { base: 0.4, growth: 0.04, style: 'curved' },
      ],
      level: talent,
      tag: AbilityTag.ENHANCE,
      image: 'asset/traces/SkillIcon_1506_Passive.webp',
    },
    unique_talent: {
      trace: 'Exclusive Talent',
      title: `"999" Security Guard`,
      content: `After obtaining Silver Wolf LV.999 or when Silver Wolf LV.999 is in the current team, gain the following effect: In Combat, when an enemy target inflicts a Crowd Control debuff on an ally, all allies gain <b class="text-desc">Firewall</b> for <span class="text-desc">1</span> turn. While in the <b class="text-desc">Firewall</b> state, ally targets are immune to Crowd Control debuffs inflicted by enemy targets. This effect can trigger at most <span class="text-desc">1</span> time per wave.`,
      value: [],
      level: talent,
      tag: AbilityTag.SUPPORT,
      image: 'asset/traces/SkillIcon_1506_Passive.webp',
    },
    technique: {
      trace: 'Technique',
      title: 'This? Absolute Meta!',
      content: `Summons <b class="text-orange-300">Funky Munch Bean</b>. Use again to dismiss. Using Technique does not consume Technique Points. When Technique Points reach <span class="text-desc">0</span>, the summon is dismissed and Technique cannot be used.
      <br /><b class="text-orange-300">Funky Munch Bean</b> causes Normal Enemies within a certain range to enter a Terrified state. It will also automatically search for and attack Normal Enemies, consuming <span class="text-desc">1</span> Technique Point to instantly defeat them without entering combat.
      <br />While <b class="text-orange-300">Funky Munch Bean</b> is present, after entering combat, <span class="text-desc">1</span> instance of <b>Top Loot Box</b> from <b class="text-orange-300">Funky Munch Bean</b> is triggered at the start of each wave. The <b class="elation">Elation DMG</b> dealt in this instance takes into account a fixed amount of <span class="text-desc">99</span> <b class="text-blue">Certified Banger</b> points.`,
      tag: AbilityTag.SUMMON,
      image: 'asset/traces/SkillIcon_1506_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'False Ending Speedrun',
      content: `When SPD is <span class="text-desc">160</span> or higher, increases this unit's Elation by <span class="text-desc">50%</span>. For every <span class="text-desc">1</span> SPD exceeded, increases this unit's Elation by <span class="text-desc">2%</span>. Up to a max of <span class="text-desc">100</span> excess SPD can be taken into account for this effect.`,
      image: 'asset/traces/SkillIcon_1506_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'True Ending Unlocked',
      content: `If the number of <b class="text-orange-400">Punchlines</b> taken into account when using an Elation Skill is <span class="text-desc">20</span> or more, gain an additional <span class="text-desc">20</span> <b class="text-violet-300">Hidden MMR</b> points (if <span class="text-desc">40</span> or more, gain <span class="text-desc">20</span> points on top of that).`,
      image: 'asset/traces/SkillIcon_1506_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Secret Level Maxed',
      content: `After entering the <b class="text-red">Godmode Player</b> state, gains <span class="text-desc">20</span> point(s) of <b class="text-violet-300">Hidden MMR</b>.`,
      image: 'asset/traces/SkillIcon_1506_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Aether Editing: Eidolon +1',
      content: `Increases the DMG taken by enemy targets in the Zone by <span class="text-desc">20%</span>.
      <br />When leaving the <b class="text-red">Godmode Player</b> state, <b class="text-violet-300">Hidden MMR</b> will not be cleared, <span class="text-desc">20%</span> of <b class="text-violet-300">Hidden MMR</b> will be retained instead.`,
      image: 'asset/traces/SkillIcon_1506_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: `It's a Feature, Not a Bug`,
      content: `After entering the <b class="text-red">Godmode Player</b> state, all buffs on this unit are extended by <span class="text-desc">1</span> turn. In the current <b class="text-red">Godmode Player</b> state, for every <span class="text-desc">120</span> point(s) of <b class="text-violet-300">Hidden MMR</b> (including the initial <b class="text-violet-300">Hidden MMR</b>) increased, Silver Wolf LV.999 gains <span class="text-desc">1</span> extra turn and regains <span class="text-desc">1</span> use of Enhanced Basic ATK.`,
      image: 'asset/traces/SkillIcon_1506_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Max Lv. 15? Says who?',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1506_BP.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'I Came. I Saw. I One-Shot.',
      content: `<b class="elation">Elation DMG</b> dealt by <b>Honkai-DMG Demo</b> additionally takes into account <b class="text-orange-400">Punchline</b> points times <span class="text-desc">5</span>.`,
      image: 'asset/traces/SkillIcon_1506_Rank4.webp',
    },
    c5: {
      trace: 'Eidolon 5',
      title: 'Basic ATK Is the New Ultimate',
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1506_Ultra.webp',
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Max Solo Leveling',
      content: `<b class="elation">Elation DMG</b> dealt during Enhanced Basic ATK merrymakes by <span class="text-desc">50%</span>.
      <br />When enemy targets enter combat, they are inflicted with <b class="text-desc">Absolute Weakness</b>: Has All-Type Weakness, and <b>All-Type Base RES</b> is reduced to <span class="text-desc">0</span> (If <b>Base RES</b> is already <span class="text-desc">0</span>, then the corresponding Type <b>RES</b> decreases by <span class="text-desc">20%</span>).`,
      image: 'asset/traces/SkillIcon_1506_Rank6.webp',
    },
  }

  const content: IContent[] = [
    Banger,
    {
      type: 'toggle',
      id: 'invincible_player',
      text: `Godmode Player`,
      ...talents.ult,
      show: true,
      default: true,
      sync: true,
    },
    {
      type: 'number',
      id: 'hidden_ranking',
      text: `Hidden MMR`,
      ...talents.talent,
      show: true,
      default: 60,
      min: 0,
      max: 300,
    },
    {
      type: 'toggle',
      id: 'swsp_e6',
      text: `Absolute Weakness`,
      ...talents.c6,
      show: c >= 6,
      default: true,
      debuff: true,
    },
    {
      type: 'toggle',
      id: 'swsp_e6_merry',
      text: `E6 Enhanced BA Merrymake`,
      ...talents.c6,
      show: c >= 6,
      default: true,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'swsp_e6')]

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
      broken: boolean,
      globalMod: GlobalModifiers,
    ) => {
      const base = _.cloneDeep(x)

      if (form.invincible_player) {
        base.BA_ALT = true
        base.VULNERABILITY.push({
          name: `Eidolon 1`,
          source: 'Self',
          value: 0.2,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }

      base.BASIC_SCALING = form.invincible_player
        ? [
            {
              name: 'Total Bounce DMG',
              value: [
                {
                  scaling: calcScaling(1.2, 0.24, basic, 'linear'),
                  multiplier: form.banger ? Stats.ELATION : Stats.ATK,
                },
              ],
              multiplier: 1 + _.min([_.floor(form.hidden_ranking / 60), 2]) * 0.15,
              element: Element.IMAGINARY,
              property: form.banger ? TalentProperty.ELATION : TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
              punchline: form.banger,
              merrymake: form.swsp_e6_merry ? 0.4 : 0,
            },
            {
              name: 'Final Hit AoE',
              value: [
                {
                  scaling: calcScaling(0.5, 0.1, basic, 'linear'),
                  multiplier: form.banger ? Stats.ELATION : Stats.ATK,
                },
              ],
              multiplier: (1 + _.min([_.floor(form.hidden_ranking / 60), 2]) * 0.15) / globalMod.enemy_count,
              element: Element.IMAGINARY,
              property: form.banger ? TalentProperty.ELATION : TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
              punchline: form.banger,
              merrymake: form.swsp_e6_merry ? 0.4 : 0,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.5, 0.1, basic, 'linear'), multiplier: Stats.ATK }],
              element: Element.IMAGINARY,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
          ]
      base.SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.8, 0.08, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.NONE,
          break: 10,
          sum: true,
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Top Loot Box AoE',
          value: [{ scaling: calcScaling(0.45, 0.045, skill, 'curved'), multiplier: Stats.ELATION }],
          multiplier: 1 / globalMod.enemy_count,
          element: Element.IMAGINARY,
          property: TalentProperty.ELATION,
          type: TalentType.NONE,
          sum: true,
          punchline: form.banger,
          merrymake: form.swsp_e6_merry ? 0.4 : 0,
        },
        {
          name: 'Big Flipping Sword True DMG',
          value: [{ scaling: calcScaling(0.45, 0.045, skill, 'curved'), multiplier: Stats.ELATION }],
          multiplier: 0.2 / globalMod.enemy_count,
          element: Element.IMAGINARY,
          property: TalentProperty.TRUE,
          type: TalentType.SKILL,
          sum: true,
          punchline: form.banger,
          merrymake: form.swsp_e6_merry ? 0.4 : 0,
        },
      ]
      base.MEMO_SKILL_SCALING = [
        {
          name: 'Total Single Target DMG',
          value: [{ scaling: calcScaling(0.45, 0.045, elation, 'curved'), hits: 6, multiplier: Stats.ELATION }],
          element: Element.IMAGINARY,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: 60,
          sum: true,
          punchlineBonus: c >= 4 ? globalMod.punchline * 5 : 0,
        },
        {
          name: 'DMG per Bounce',
          value: [{ scaling: calcScaling(0.45, 0.045, elation, 'curved'), multiplier: Stats.ELATION }],
          element: Element.IMAGINARY,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: 10,
          punchlineBonus: c >= 4 ? globalMod.punchline * 5 : 0,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'Funky Munch Bean',
          value: [{ scaling: calcScaling(0.45, 0.045, skill, 'curved'), multiplier: Stats.ELATION }],
          multiplier: 1 / globalMod.enemy_count,
          element: Element.IMAGINARY,
          property: TalentProperty.ELATION,
          type: TalentType.NONE,
          break: 10,
          sum: true,
          punchline: 99,
        },
      ]

      if (form.banger) {
        const add = {
          name: 'Talent Elation DMG',
          value: [{ scaling: calcScaling(0.2, 0.02, talent, 'curved'), multiplier: Stats.ELATION }],
          element: Element.IMAGINARY,
          property: TalentProperty.ELATION,
          type: TalentType.BA,
          sum: true,
          punchline: form.banger,
        }
        base.BASIC_SCALING.push({ ...add, merrymake: form.swsp_e6_merry ? 0.4 : 0 })
        base.SKILL_SCALING.push(add)
      }

      if (form.swsp_e6) {
        weakness.push(
          ..._.filter<Element>(
            _.filter(Element, (item) => item !== Element.NONE),
            (item) => !_.includes(weakness, item),
          ),
        )
        base.ADD_DEBUFF.push({
          name: `Absolute Weakness`,
          source: 'Self',
        })
        addDebuff(debuffs, DebuffTypes.ABSOLUTE)
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
      if (form.swsp_e6) {
        base.ADD_DEBUFF.push({
          name: `Absolute Weakness`,
          source: 'Silver Wolf LV.999',
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
      globalCallback.push(function P999(_x, _d, _w, a) {
        const spd = a[index].getSpd()
        if (spd >= 160) {
          a[index][Stats.ELATION].push({
            name: `Ascension 2 Passive`,
            source: 'Self',
            value: 0.5 + _.min([spd - 160, 100]) * 0.02,
            base: _.floor(_.min([spd - 160, 100]), 1).toLocaleString(),
            multiplier: 0.02,
            flat: `50%`,
          })
        }

        return a
      })
      base.CALLBACK.push(function P99(x) {
        if (form.invincible_player) {
          const cr = _.min([x.getValue(Stats.CRIT_RATE), 1])
          const stacksForCr = _.ceil((1 - cr) / calcScaling(0.002, 0.0002, talent, 'curved'))
          x[Stats.CRIT_RATE].push({
            name: `Talent`,
            source: 'Self',
            value: _.min([form.hidden_ranking, stacksForCr]) * calcScaling(0.002, 0.0002, talent, 'curved'),
            base: _.min([form.hidden_ranking, stacksForCr]),
            multiplier: calcScaling(0.002, 0.0002, talent, 'curved'),
          })
          if (form.hidden_ranking > stacksForCr) {
            x[Stats.CRIT_DMG].push({
              name: `Talent`,
              source: 'Self',
              value: (form.hidden_ranking - stacksForCr) * calcScaling(0.004, 0.0004, talent, 'curved'),
              base: form.hidden_ranking - stacksForCr,
              multiplier: calcScaling(0.004, 0.0004, talent, 'curved'),
            })
          }
        }

        return x
      })
      return base
    },
  }
}

export default SilverWolfSP
