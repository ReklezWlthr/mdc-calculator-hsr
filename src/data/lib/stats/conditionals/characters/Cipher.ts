import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { AbilityTag, Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Cipher = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 3 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 5 ? 2 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent

  const index = _.findIndex(team, (item) => item?.cId === '1406')

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: 'Oops, a Missed Catch',
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Cipher's ATK to one designated enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
    },
    skill: {
      energy: 30,
      trace: 'Skill',
      title: 'Hey, Jackpot for the Taking',
      content: `There is a <span class="text-desc">120%</span> <u>base chance</u> to inflict Weaken on one designated enemy and adjacent targets, decreasing their DMG dealt by {{0}}%, as well as increases Cipher's ATK by {{1}}%, lasting for <span class="text-desc">2</span> turn(s). At the same time, deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{2}}% of Cipher's ATK to one designated enemy and <b class="text-hsr-quantum">Quantum DMG</b> equal to {{3}}% of Cipher's ATK to its adjacent targets.`,
      value: [
        { base: 5, growth: 0.5, style: 'curved' },
        { base: 15, growth: 1.5, style: 'curved' },
        { base: 100, growth: 10, style: 'curved' },
        { base: 50, growth: 5, style: 'curved' },
      ],
      level: skill,
      tag: AbilityTag.BLAST,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: `Yours Truly, Kitty Phantom Thief!!`,
      content: `Deals <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Cipher's ATK to one designated enemy. Then, deals <b class="text-true">True DMG</b> equal to <span class="text-desc">25%</span> of the currently recorded Talent value to one designated enemy, <b class="text-hsr-quantum">Quantum DMG</b> equal to {{1}}% of Cipher's ATK to one designated enemy and its adjacent targets, and <b class="text-true">True DMG</b> equal to <span class="text-desc">75%</span> of the current Talent's recorded value. This <b class="text-true">True DMG</b> is distributed to all Skill targets.`,
      value: [
        { base: 72, growth: 4.8, style: 'curved' },
        { base: 24, growth: 1.6, style: 'curved' },
      ],
      level: ult,
      tag: AbilityTag.BLAST,
    },
    talent: {
      energy: 5,
      trace: 'Talent',
      title: `The Hospitable Dolosian`,
      content: `When there are no enemy targets with <b class="text-hsr-quantum">Patron</b> on the battlefield, Cipher immediately causes one enemy target with the highest Max HP on the battlefield to become the <b class="text-hsr-quantum">Patron</b>. When using Skill and Ultimate, the primary target becomes the <b class="text-hsr-quantum">Patron</b>. The <b class="text-hsr-quantum">Patron</b> state only takes effect on the latest target.
      <br />After the <b class="text-hsr-quantum">Patron</b> is attacked by other ally targets, Cipher immediately launches <u>Follow-up ATK</u> against the <b class="text-hsr-quantum">Patron</b>, dealing <b class="text-hsr-quantum">Quantum DMG</b> equal to {{0}}% of Cipher's ATK. This <u>Follow-up ATK</u> can only trigger <span class="text-desc">1</span> time, and the trigger count is reset after Cipher uses her Ultimate.
      <br />Cipher will record <span class="text-desc">12%</span> of the non-<b class="text-true">True DMG</b> ally targets dealt to the <b class="text-hsr-quantum">Patron</b>, but the Overflow DMG will not be recorded. The recorded value is cleared after using Ultimate.`,
      value: [{ base: 125, growth: 12.5, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ST,
    },
    technique: {
      trace: 'Technique',
      title: 'Puss in Boots',
      content: `Obtains <b>Zagreus's Blessing</b>, lasting for <span class="text-desc">15</span> second(s). While <b>Zagreus's Blessing</b> is active, Cipher will not be detected by enemies, and her movement speed increases by <span class="text-desc">50%</span>. When enemy targets approach Cipher, she can obtain a small amount of materials.
      <br />After actively using Technique, deals <b class="text-hsr-quantum">Quantum DMG</b> equal to <span class="text-desc">150%</span> of Cipher's ATK to all enemies. The Talent's recorded value from this DMG increases by <span class="text-desc">200%</span>.`,
      tag: AbilityTag.ENHANCE,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Empyrean Strides`,
      content: `When Cipher's SPD is greater or equal to <span class="text-desc">140</span>/<span class="text-desc">170</span>, increases CRIT Rate by <span class="text-desc">25%</span>/<span class="text-desc">50%</span>, and recorded value by <span class="text-desc">50%</span>/<span class="text-desc">100%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `300 Rogues`,
      content: `Cipher will record <span class="text-desc">8%</span> of the non-<b class="text-true">True DMG</b> ally targets dealt to the enemy targets aside from the <b class="text-hsr-quantum">Patron</b>. Overflow DMG is not recorded.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Sleight of Sky`,
      content: `When Cipher is on the battlefield, all enemy targets' DEF decreases by <span class="text-desc">30%</span>. At the start of each wave, Cipher <u>advances her action</u> by <span class="text-desc">100%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Read the Room, Seek the Glee`,
      content: `Increases the trigger count for her <u>Follow-up ATK</u> activated with her Talent to <span class="text-desc">2</span> time(s). When Cipher hits an enemy target, there is a <span class="text-desc">120%</span> base chance of causing them to receive <span class="text-desc">25%</span> more DMG, lasting for <span class="text-desc">2</span> turn(s).`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `In the Fray, Nab On a Spree`,
      content: `Cipher's recorded DMG is <span class="text-desc">150%</span> of the original recorded value. When using <u>Follow-up ATK</u> from Talent, increases Cipher's CRIT DMG by <span class="text-desc">80%</span>, lasting for <span class="text-desc">2</span> turn(s).`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `From Thin Air, Hard to Foresee`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'The Jig Is Up, Quick to Flee',
      content: `After <b class="text-hsr-quantum">Patron</b> is attacked by an ally target, Cipher deals <b class="text-hsr-quantum">Quantum Additional DMG</b> equal to <span class="text-desc">50%</span> of Cipher's ATK to it.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Safe in Numbers, Light as a Bee`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `The Thief's Game, Unsung and Free`,
      content: `Increases DMG dealt by <u>Follow-up ATKs</u> caused by Cipher's Talent by <span class="text-desc">350%</span>. After resetting the record upon using her Ultimate, returns <span class="text-desc">20%</span> of the reset record.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'recorded_dmg',
      text: `Patron`,
      ...talents.talent,
      show: true,
      default: 100000,
      min: 0,
      debuff: true,
    },
    {
      type: 'number',
      id: 'ult_hit',
      text: `Ult True DMG Split`,
      ...talents.ult,
      show: true,
      default: 3,
      min: 1,
      max: 3,
      unique: true,
    },
    {
      type: 'toggle',
      id: 'cipher_skill_weaken',
      text: `Skill Weaken`,
      ...talents.skill,
      show: true,
      default: true,
      debuff: true,
      chance: { base: 1.2, fixed: false },
      duration: 1,
    },
    {
      type: 'toggle',
      id: 'cipher_skill_atk',
      text: `Skill ATK Bonus`,
      ...talents.skill,
      show: true,
      default: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'cipher_c1',
      text: `E1 Vulnerability`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      debuff: true,
      duration: 2,
    },
    {
      type: 'toggle',
      id: 'cipher_c2',
      text: `E2 CRIT DMG Bonus`,
      ...talents.c2,
      show: c >= 2,
      default: true,
      duration: 2,
    },
  ]

  const teammateContent: IContent[] = [findContentById(content, 'exposed'), findContentById(content, 'pela_tech')]

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
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
          sum: true,
          hitSplit: [0.5, 0.5],
        },
      ]
      base.SKILL_SCALING = [
        {
          name: 'Main Target',
          value: [{ scaling: calcScaling(1, 0.1, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 20,
          sum: true,
          chance: { base: 1.2, fixed: false },
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.5, 0.05, skill, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.SKILL,
          break: 10,
          chance: { base: 1.2, fixed: false },
        },
      ]
      base.ULT_SCALING = [
        {
          name: 'Main Target',
          value: [
            { scaling: calcScaling(0.72, 0.028, ult, 'curved'), multiplier: Stats.ATK },
            { scaling: calcScaling(0.24, 0.016, ult, 'curved'), multiplier: Stats.ATK },
          ],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 30,
          sum: true,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.24, 0.016, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
          sum: false,
        },
      ]
      base.TALENT_SCALING = [
        {
          name: 'Single Target',
          value: [{ scaling: calcScaling(1.25, 0.125, talent, 'curved'), multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.FUA,
          type: TalentType.TALENT,
          break: 20,
          sum: true,
          bonus: c >= 6 ? 3.5 : 0,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'AoE',
          value: [{ scaling: 1.5, multiplier: Stats.ATK }],
          element: Element.QUANTUM,
          property: TalentProperty.NORMAL,
          type: TalentType.TECH,
          sum: true,
        },
      ]

      if (form.recorded_dmg) {
        base.ULT_SCALING.push({
          name: 'Main Targe - True DMG',
          value: [],
          flat: form.recorded_dmg,
          multiplier: 0.25 + 0.75 / form.ult_hit,
          element: Element.NONE,
          property: TalentProperty.TRUE,
          type: TalentType.NONE,
          sum: true,
          trueRaw: true,
        })
        if (form.ult_hit > 1) {
          base.ULT_SCALING.push({
            name: 'Adjacent - True DMG',
            value: [],
            flat: form.recorded_dmg,
            multiplier: 0.75 / form.ult_hit,
            element: Element.NONE,
            property: TalentProperty.TRUE,
            type: TalentType.NONE,
            sum: false,
            trueRaw: true,
          })
        }
      }
      if (form.cipher_skill_weaken) {
        base.WEAKEN.push({
          name: 'Skill',
          source: 'Self',
          value: calcScaling(0.05, 0.005, skill, 'curved'),
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.cipher_skill_atk) {
        base[Stats.P_ATK].push({
          name: 'Skill',
          source: 'Self',
          value: calcScaling(0.15, 0.015, skill, 'curved'),
        })
      }
      if (a.a6) {
        base.DEF_REDUCTION.push({
          name: 'Ascension 6 Passive',
          source: 'Self',
          value: 0.3,
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      if (form.cipher_c1) {
        base.VULNERABILITY.push({
          name: 'Eidolon 1',
          source: 'Self',
          value: 0.25,
        })
        addDebuff(debuffs, DebuffTypes.OTHER)
      }
      if (form.cipher_c2) {
        base[Stats.CRIT_DMG].push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.8,
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
      if (form.cipher_skill_weaken) {
        base.WEAKEN.push({
          name: 'Skill',
          source: 'Cipher',
          value: calcScaling(0.05, 0.005, skill, 'curved'),
        })
      }
      if (a.a6) {
        base.DEF_REDUCTION.push({
          name: 'Ascension 6 Passive',
          source: 'Cipher',
          value: 0.3,
        })
      }
      if (form.cipher_c1) {
        base.VULNERABILITY.push({
          name: 'Eidolon 1',
          source: 'Cipher',
          value: 0.25,
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
      const spd = base.getSpd()

      if (spd >= 140 && a.a2) {
        base[Stats.CRIT_RATE].push({
          name: 'Ascension 2 Passive',
          source: 'Cipher',
          value: spd >= 170 ? 0.5 : 0.25,
        })
      }

      if (form.recorded_dmg && c >= 4) {
        _.forEach(team, (f, i) => {
          if (f) {
            f.CALLBACK.push((x) => {
              _.forEach(
                [x.BASIC_SCALING, x.SKILL_SCALING, x.ULT_SCALING, x.TALENT_SCALING, x.MEMO_SKILL_SCALING],
                (s) => {
                  if (
                    _.some(s, (item) =>
                      _.includes([TalentProperty.NORMAL, TalentProperty.FUA, TalentProperty.SERVANT], item.property)
                    )
                  )
                    s.push({
                      name: `Cipher E4's Additional DMG`,
                      value: [{ scaling: 0.5, multiplier: Stats.ATK }],
                      element: Element.QUANTUM,
                      property: TalentProperty.ADD,
                      type: TalentType.NONE,
                      overrideIndex: index,
                      sum: true,
                    })
                }
              )
              return x
            })
          }
        })
      }

      return base
    },
  }
}

export default Cipher
