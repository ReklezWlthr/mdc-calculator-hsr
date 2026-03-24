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
      title: 'Catch These Hands!',
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
      title: 'Bonus Stage: Esteemed Wolf Mode',
      content: `Deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Silver Wolf LV.999's ATK, split evenly into <span class="text-desc">100</span> bounces that hit random single enemies. After bouncing a certain number of times, the bouncing pauses and triggers <b>Premium Supply Mystery Box</b> <span class="text-desc">1</span> time, for a total of <span class="text-desc">2</span> triggers. When <b class="text-violet-300">Hidden Ranking</b> reaches <span class="text-desc">40</span>/<span class="text-desc">80</span> points, triggers an additional <span class="text-desc">1</span>/<span class="text-desc">2</span> times.
      <br />If all enemies on the field take fatal damage, this ability ends. When enemy targets that can be attacked remain, gains <span class="text-desc">1</span> extra turn and uses this ability again based on the remaining bounces and <b>Premium Supply Mystery Box</b> triggers. The first time this effect triggers per turn, extends the duration of all buffs on this unit by <span class="text-desc">1</span> turn.
      <br />After all of the above DMG is dealt, unleashes a Final Hit that deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{1}}% of Silver Wolf LV.999's ATK, split evenly among all enemies.
      <br />Each point of <b class="text-violet-300">Hidden Ranking</b> increases DMG dealt during Enhanced Basic ATK by <span class="text-desc">0.3%</span> of the original DMG. <b class="text-violet-300">Hidden Ranking</b> accumulated during Enhanced Basic ATK is temporarily not taken into account toward the total. After using the Final Hit, clears <b class="text-violet-300">Hidden Ranking</b> and gains the <b class="text-violet-300">Hidden Ranking</b> accumulated this time.
      <br />Enhanced Basic ATK does not recover Skill Points.`,
      value: [
        { base: 80, growth: 16, style: 'linear' },
        { base: 30, growth: 6, style: 'linear' },
      ],
      level: basic,
      tag: AbilityTag.BOUNCE,
      sp: 0,
      energy: 0,
      image: 'asset/traces/SkillIcon_1506_Normal.webp',
    },
    skill: {
      trace: 'Skill',
      title: `Shoot Stats Pop Off`,
      content: `Gains <span class="text-desc">5</span> <b class="text-orange-400">Punchline(s)</b> and deals <b class="text-hsr-imaginary">Imaginary DMG</b> equal to {{0}}% of Silver Wolf LV.999's ATK to all enemies.`,
      value: [{ base: 80, growth: 8, style: 'curved' }],
      level: skill,
      tag: AbilityTag.AOE,
      sp: -1,
      image: 'asset/traces/SkillIcon_1506_BP.webp',
    },
    summon_skill: {
      participantId: 999,
      trace: 'Elation Skill',
      title: 'Honkai-Level DMG Demonstration',
      content: `<span class="text-xs opacity-75 text-gray">Elation Skill</span>
      <br /><b>Pro-Gamer Move</b>
      <br />Gains <span class="text-desc">20</span> <b class="text-violet-300">Hidden Ranking</b> point(s).
      <br />
      <br /><span class="text-xs opacity-75 text-gray">Enhanced Elation Skill</span>
      <br /><b>Honkai-Level DMG Demonstration</b>
      <br />Deals {{0}}% <b class="text-hsr-imaginary">Imaginary</b> <b class="elation">Elation DMG</b> to all enemies and resets the <u>fixed chance</u> to trigger <b>Premium Supply Mystery Box</b> to its initial value.`,
      value: [{ base: 100, growth: 10, style: 'curved' }],
      level: elation,
      tag: AbilityTag.AOE,
      energy: 0,
      image: 'asset/traces/SkillIcon_1506_Elation.webp',
    },
    ult: {
      trace: 'Ultimate',
      title: `God Mode: Activate!`,
      content: `Gains <span class="text-desc">80</span> <b class="text-violet-300">Hidden Ranking</b> point(s), enters the <b class="text-red">Invincible Player</b> state, and advances action by <span class="text-desc">100%</span>.
      <br />Deploys a Zone while in the <b class="text-red">Invincible Player</b> state. While possessing <b class="text-blue">Certified Banger</b>, each time an ally target within the Zone consumes <span class="text-desc">1</span> Skill Point, there is a chance to trigger <span class="text-desc">1</span> instance of Silver Wolf LV.999's <b>Premium Supply Mystery Box</b>: Deal <b class="text-hsr-imaginary">Imaginary</b> <b class="elation">Elation DMG</b> equal to {{0}}% to all enemies and randomly trigger <span class="text-desc">1</span> of the following effects:
      <br /><b class="text-true">Big Flipping Sword</b>: Additionally deals <b class="text-true">True DMG</b> to the enemy target with the highest HP equal to <span class="text-desc">20%</span> of the total DMG dealt this time;
      <br /><b class="text-sky-300">Bombastic Egg Bomb</b>: Recovers <span class="text-desc">2</span> Skill Point(s);
      <br /><b class="text-orange-300">Funky-Flavor Beans</b>: Gains <span class="text-desc">3</span> <b class="text-orange-400">Punchline(s)</b>.
      <br />The initial <u>fixed chance</u> to trigger this effect is <span class="text-desc">100%</span>. After successfully triggering, the <u>fixed chance</u> for the subsequent trigger is reduced to <span class="text-desc">20%</span> of the current chance. If the target is defeated before triggering, this effect triggers on the enemy target that just entered instead.`,
      value: [{ base: 17, growth: 1.7, style: 'curved' }],
      level: ult,
      tag: AbilityTag.AOE,
      energy: 0,
      image: 'asset/traces/SkillIcon_1506_Ultra_on.webp',
    },
    talent: {
      trace: `Talent`,
      title: `I'm the Carry`,
      content: `After reaching <span class="text-desc">80</span> <b class="text-violet-300">Hidden Ranking</b> points, the Ultimate can be activated. After reaching the maximum limit, it can overflow by an additional <span class="text-desc">80</span> point(s). When gaining <b class="text-orange-400">Punchline</b>, Silver Wolf LV.999 also gains an equal amount of <b class="text-violet-300">Hidden Ranking</b>.
      <br />While in the <b class="text-red">Invincible Player</b> state, Silver Wolf LV.999 is immune to Crowd Control debuffs, her CRIT DMG increases by {{0}}%, cannot use the Ultimate, and gains Enhanced Basic ATK and Enhanced Elation Skill. After completing Enhanced Basic ATK usage <span class="text-desc">3</span> time(s), she exits the <b class="text-red">Invincible Player</b> state.
      <br />While in possession of <b class="text-blue">Certified Banger</b>, using Basic ATK or Skill against attacked enemy targets deals {{1}}% <b class="text-hsr-imaginary">Imaginary</b> <b class="elation">Elation DMG</b>. Enhanced Basic ATK's ability DMG is converted to Elation DMG at the same multiplier.`,
      value: [
        { base: 15, growth: 1.5, style: 'curved' },
        { base: 20, growth: 2, style: 'curved' },
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
      title: 'Trust Me, This is Tier 0',
      content: `Summons <b class="text-orange-300">Funky-Flavor Beans</b>. Use again to dismiss. Using Technique does not consume Technique Points. When Technique Points reach 0, the summon is dismissed and Technique cannot be used.
      <br /><b class="text-orange-300">Funky-Flavor Beans</b> causes Normal Enemies within a certain range to enter a Terrified state. It will also automatically search for and attack Normal Enemies, consuming <span class="text-desc">1</span> Technique Point to instantly defeat them without entering combat.
      <br />While <b class="text-orange-300">Funky-Flavor Beans</b> is present, after entering combat, <span class="text-desc">1</span> <b>Premium Supply Mystery Box</b> corresponding to <b class="text-orange-300">Funky-Flavor Beans</b> is triggered at the start of each wave.`,
      tag: AbilityTag.SUMMON,
      image: 'asset/traces/SkillIcon_1506_Maze.webp',
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: 'False End Speedrun',
      content: `For every <span class="text-desc">100</span> point(s) of ATK that exceeds <span class="text-desc">2,000</span>, increases this unit's Elation by <span class="text-desc">5%</span>, up to a maximum increase of <span class="text-desc">120%</span>.`,
      image: 'asset/traces/SkillIcon_1506_SkillTree1.webp',
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: 'True End Requirement',
      content: `When <b class="text-aha">Aha Instant</b> is triggered, if the number of <b class="text-orange-400">Punchline</b> taken into account reaches <span class="text-desc">20</span>/<span class="text-desc">40</span>, gains <span class="text-desc">20</span>/<span class="text-desc">40</span> <b class="text-violet-300">Hidden Ranking</b> points.`,
      image: 'asset/traces/SkillIcon_1506_SkillTree2.webp',
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: 'Hidden Stage Completionist',
      content: `At the start of combat, gains <span class="text-desc">20</span> <b class="text-violet-300">Hidden Ranking</b> point(s).`,
      image: 'asset/traces/SkillIcon_1506_SkillTree3.webp',
    },
    c1: {
      trace: 'Eidolon 1',
      title: 'Aether Editing: Eidolon +1',
      content: `<b>Premium Supply Mystery Box</b> additionally provides <span class="text-desc">2</span> <b class="text-orange-400">Punchline(s)</b> and increases the Elation of DMG dealt by <span class="text-desc">200%</span>.`,
      image: 'asset/traces/SkillIcon_1506_Rank1.webp',
    },
    c2: {
      trace: 'Eidolon 2',
      title: 'A Feature, Not a Bug',
      content: `Enemy targets in the Zone will be implanted with <b class="text-desc">Absolute Weakness</b>: Has All-Type Weakness, and <b>All-Type Base RES</b> is reduced to <span class="text-desc">0</span> (If <b>Base RES</b> is already <span class="text-desc">0</span>, then the corresponding Type <b>RES</b> decreases by <span class="text-desc">20%</span>).
      <br />When targets with <b class="text-desc">Absolute Weakness</b> implanted take <b class="elation">Elation DMG</b> from allies, the DMG taken will be recorded by Silver Wolf LV.999 (except overflow DMG). After the Final Hit of Enhanced Basic ATK, additionally deals <b class="text-true">True DMG</b> equal to <span class="text-desc">20%</span> of the recorded value that is distributed evenly among all enemies, then the recorded value is cleared.`,
      image: 'asset/traces/SkillIcon_1506_Rank2.webp',
    },
    c3: {
      trace: 'Eidolon 3',
      title: 'Only 15 Levels? Who Wrote This?',
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic Attack Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Elation Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
      image: 'asset/traces/SkillIcon_1506_BP.webp',
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'I Came, I Saw, I... One-Shot',
      content: `<b class="elation">Elation DMG</b> dealt by <b>Honkai-Level DMG Demonstration</b> additionally takes into account <span class="text-desc">999</span> <b class="text-orange-400">Punchlines</b>.`,
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
      content: `<b class="elation">Elation DMG</b> dealt merrymakes by <span class="text-desc">25%</span>.
      <br />Enhanced Basic ATK does not clear <b class="text-violet-300">Hidden Ranking</b>, reserving <span class="text-desc">30%</span> of the <b class="text-violet-300">Hidden Ranking</b> instead. While in the <b class="text-red">Invincible Player</b> state, when the overflowing <b class="text-violet-300">Hidden Ranking</b> reaches its limit, Silver Wolf LV.999 immediately takes action.`,
      image: 'asset/traces/SkillIcon_1506_Rank6.webp',
    },
  }

  const content: IContent[] = [
    Banger,
    {
      type: 'toggle',
      id: 'invincible_player',
      text: `Invincible Player`,
      ...talents.ult,
      show: true,
      default: true,
      sync: true,
    },
    {
      type: 'number',
      id: 'hidden_ranking',
      text: `Hidden Ranking`,
      ...talents.normal_alt,
      show: true,
      default: 80,
      min: 0,
      max: 160,
    },
    {
      type: 'number',
      id: 'swsp_e2_tally',
      text: `E2 Elation DMG Tally`,
      ...talents.c2,
      show: c >= 2,
      default: 300000,
      min: 0,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'swsp_e2')]

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
      }

      base.BASIC_SCALING = form.invincible_player
        ? [
            {
              name: 'Total Bounce DMG',
              value: [
                {
                  scaling: calcScaling(0.8, 0.16, basic, 'linear'),
                  multiplier: form.banger ? Stats.ELATION : Stats.ATK,
                },
              ],
              multiplier: 1 + form.hidden_ranking * 0.003,
              element: Element.IMAGINARY,
              property: form.banger ? TalentProperty.ELATION : TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
            {
              name: 'Final Hit AoE',
              value: [
                {
                  scaling: calcScaling(0.3, 0.06, basic, 'linear'),
                  multiplier: form.banger ? Stats.ELATION : Stats.ATK,
                },
              ],
              multiplier: (1 + form.hidden_ranking * 0.003) / globalMod.enemy_count,
              element: Element.IMAGINARY,
              property: form.banger ? TalentProperty.ELATION : TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
            ...(form.swsp_e2_tally
              ? [
                  {
                    name: 'E2 True DMG',
                    value: [],
                    flat: form.swsp_e2_tally,
                    multiplier: 0.2 / globalMod.enemy_count,
                    element: Element.NONE,
                    property: TalentProperty.TRUE,
                    type: TalentType.NONE,
                    sum: false,
                    trueRaw: true,
                  },
                ]
              : []),
            ...(form.banger
              ? [
                  {
                    name: 'Talent Elation DMG',
                    value: [{ scaling: calcScaling(0.2, 0.02, talent, 'curved'), multiplier: Stats.ELATION }],
                    element: Element.IMAGINARY,
                    property: TalentProperty.ELATION,
                    type: TalentType.BA,
                    sum: true,
                    punchline: form.banger,
                  },
                ]
              : []),
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
            ...(form.banger
              ? [
                  {
                    name: 'Talent Elation DMG',
                    value: [{ scaling: calcScaling(0.2, 0.02, talent, 'curved'), multiplier: Stats.ELATION }],
                    element: Element.IMAGINARY,
                    property: TalentProperty.ELATION,
                    type: TalentType.BA,
                    sum: true,
                    punchline: form.banger,
                  },
                ]
              : []),
          ]
      base.SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.8, 0.08, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.IMAGINARY,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          sum: true,
        },
        ...(form.banger
          ? [
              {
                name: 'Talent Elation DMG',
                value: [{ scaling: calcScaling(0.2, 0.02, talent, 'curved'), multiplier: Stats.ELATION }],
                element: Element.IMAGINARY,
                property: TalentProperty.ELATION,
                type: TalentType.SKILL,
                sum: true,
                punchline: form.banger,
              },
            ]
          : []),
      ]
      base.ULT_SCALING = [
        {
          name: 'Premium Supply Mystery Box AoE',
          value: [{ scaling: calcScaling(0.17, 0.017, skill, 'curved'), multiplier: Stats.ELATION }],
          element: Element.IMAGINARY,
          property: TalentProperty.ELATION,
          type: TalentType.SKILL,
          break: 5,
          sum: true,
          bonus: c >= 1 ? 2 : 0,
        },
        {
          name: 'Big Flipping Sword True DMG',
          value: [{ scaling: calcScaling(0.17, 0.017, skill, 'curved'), multiplier: Stats.ELATION }],
          multiplier: 0.2,
          element: Element.IMAGINARY,
          property: TalentProperty.TRUE,
          type: TalentType.SKILL,
          break: 1,
          sum: true,
          bonus: c >= 1 ? 2 : 0,
        },
      ]
      base.MEMO_SKILL_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(1, 0.1, elation, 'curved'), multiplier: Stats.ELATION }],
          element: Element.IMAGINARY,
          property: TalentProperty.ELATION,
          type: TalentType.ELATION,
          break: 20,
          sum: true,
          punchlineBonus: c >= 4 ? 999 : 0,
        },
      ]

      if (form.invincible_player && c >= 2) {
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
      if (c >= 6) {
        base.ELATION_MERRYMAKE.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.25,
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
      if (form.invincible_player && c >= 2) {
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
      base.CALLBACK.push(function P99(x) {
        const atk = x.getAtk(true)
        if (atk > 2000)
          x.Elation.push({
            name: `Ascension 2 Passive`,
            source: 'Self',
            value: _.min([((atk - 2000) / 100) * 0.05, 1.2]),
            base: `${_.floor(_.min([atk - 2000, 2400]), 1).toLocaleString()} ÷ 100`,
            multiplier: 0.05,
          })

        return x
      })
      return base
    },
  }
}

export default SilverWolfSP
