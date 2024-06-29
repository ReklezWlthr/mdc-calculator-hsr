import { addDebuff, countDebuff, countDot, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject } from '../../baseConstant'
import { Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from '@src/domain/constant'

import { toPercentage } from '@src/core/utils/converter'
import { DebuffTypes, IContent, ITalent } from '@src/domain/conditional'
import { calcScaling } from '@src/core/utils/calculator'

const Jingliu = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
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

  const talents: ITalent = {
    normal: {
      energy: 20,
      trace: 'Basic ATK',
      title: `Lucent Moonglow`,
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Jingliu's ATK to a single enemy.`,
      value: [{ base: 50, growth: 10, style: 'linear' }],
      level: basic,
    },
    skill: {
      energy: 20,
      trace: 'Skill',
      title: `Transcendent Flash`,
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Jingliu's ATK to a single enemy and obtains <span class="text-desc">1</span> stack(s) of <b class="text-hsr-ice">Syzygy</b>.`,
      value: [{ base: 100, growth: 10, style: 'curved' }],
      level: skill,
    },
    skill_alt: {
      energy: 30,
      trace: 'Enhanced Skill',
      title: `Moon On Glacial River`,
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Jingliu's ATK to a single enemy, and deals <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of Jingliu's ATK to adjacent enemies. Consumes <span class="text-desc">1</span> stack(s) of <b class="text-hsr-ice">Syzygy</b>. Using this ability does not consume Skill Points.`,
      value: [
        { base: 125, growth: 12.5, style: 'curved' },
        { base: 62.5, growth: 6.25, style: 'curved' },
      ],
      level: skill,
    },
    ult: {
      energy: 5,
      trace: 'Ultimate',
      title: 'Florephemeral Dreamflux',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Jingliu's ATK to a single enemy, and deals <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of Jingliu's ATK to any adjacent enemies. Gains <span class="text-desc">1</span> stack(s) of <b class="text-hsr-ice">Syzygy</b> after attack ends.`,
      value: [
        { base: 180, growth: 12, style: 'curved' },
        { base: 90, growth: 6, style: 'curved' },
      ],
      level: ult,
    },
    talent: {
      trace: 'Talent',
      title: `Crescent Transmigration`,
      content: `When Jingliu has <span class="text-desc">2</span> stack(s) of <b class="text-hsr-ice">Syzygy</b>, she enters the <b>Spectral Transmigration</b> state with her Action Advanced by 100% and her CRIT Rate increases by {{0}}%. Then, Jingliu's Skill "Transcendent Flash" becomes enhanced and turns into "Moon On Glacial River," and becomes the only ability she can use in battle. When Jingliu uses an attack in the <b>Spectral Transmigration</b> state, she consumes HP from all other allies equal to <span class="text-desc">4%</span> of their respective Max HP (this cannot reduce allies' HP to lower than <span class="text-desc">1</span>). Jingliu's ATK increases by <span class="text-desc">540%</span> of the total HP consumed from all allies in this attack, capped at {{1}}% of her base ATK, lasting until the current attack ends. Jingliu cannot enter the <b>Spectral Transmigration</b> state again until the current <b>Spectral Transmigration</b> state ends. <b class="text-hsr-ice">Syzygy</b> can stack up to <span class="text-desc">3</span> times. When <b class="text-hsr-ice">Syzygy</b> stacks become <span class="text-desc">0</span>, Jingliu will exit the <b>Spectral Transmigration</b> state.`,
      value: [
        { base: 40, growth: 1, style: 'curved' },
        { base: 90, growth: 9, style: 'curved' },
      ],
      level: talent,
    },
    technique: {
      trace: 'Technique',
      title: `Shine of Truth`,
      content: `After using this Technique, creates a dimension around Jingliu that lasts for <span class="text-desc">20</span> seconds, and all enemies in this dimension will become <b class="text-hsr-ice">Frozen</b>. After entering combat with enemies in the dimension, Jingliu immediately regenerates <span class="text-desc">15</span> Energy and obtains <span class="text-desc">1</span> stack(s) of <b class="text-hsr-ice">Syzygy</b>, with a <span class="text-desc">100%</span> <u>base chance</u> of <b class="text-hsr-ice">Freezing</b> enemy targets for <span class="text-desc">1</span> turn(s). While <b class="text-hsr-ice">Frozen</b>, enemy targets cannot take action, and receive Additional <b class="text-hsr-ice">Ice DMG</b> equal to <span class="text-desc">80%</span> of Jingliu's ATK at the start of every turn. Only <span class="text-desc">1</span> dimension created by allies can exist at the same time.`,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Deathrealm`,
      content: `While in the <b>Spectral Transmigration</b> state, increases Effect RES by <span class="text-desc">35%</span>.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Sword Champion`,
      content: `After using Transcendent Flash, the next action will be Advanced Forward by <span class="text-desc">10%</span>.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Frost Wraith`,
      content: `While in the <b>Spectral Transmigration</b> state, increases Ultimate DMG by <span class="text-desc">20%</span>.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Moon Crashes Tianguan Gate`,
      content: `When using her Ultimate or Enhanced Skill, Jingliu's CRIT DMG increases by <span class="text-desc">24%</span> for <span class="text-desc">1</span> turn(s). If only one enemy target is attacked, the target will additionally be dealt <b class="text-hsr-ice">Ice DMG</b> equal to <span class="text-desc">100%</span> of Jingliu's ATK.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `Crescent Shadows Qixing Dipper`,
      content: `After using Ultimate, increases the DMG of the next Enhanced Skill by <span class="text-desc">80%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `Halfmoon Gapes Mercurial Haze`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: `Lunarlance Shines Skyward Dome`,
      content: `During the <b>Spectral Transmigration</b> state, the ATK gained from consuming allies' HP is additionally increased by <span class="text-desc">90%</span> of the total HP consumed from the entire team. The cap for ATK gained this way also increases by <span class="text-desc">30%</span>.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Night Shades Astral Radiance`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: `Eclipse Hollows Corporeal Husk`,
      content: `When Jingliu enters the <b>Spectral Transmigration</b> state, the <b class="text-hsr-ice">Syzygy</b> stack limit increases by <span class="text-desc">1</span>, and Jingliu obtains <span class="text-desc">1</span> stack(s) of <b class="text-hsr-ice">Syzygy</b>. While she is in the <b>Spectral Transmigration</b> state, her CRIT DMG increases by <span class="text-desc">50%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'toggle',
      id: 'spectral_transmigration',
      text: `Spectral Transmigration`,
      ...talents.talent,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'jingliu_c1',
      text: `E1 Enhanced Skill Single Target Hit`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      unique: true,
    },
    {
      type: 'toggle',
      id: 'jingliu_c1_crit',
      text: `E1 CRIT Bonus`,
      ...talents.c1,
      show: c >= 1,
      default: true,
      duration: 1
    },
    {
      type: 'toggle',
      id: 'jingliu_c2',
      text: `E2 Post-Ult Enhanced Skill DMG`,
      ...talents.c2,
      show: c >= 2,
      default: true,
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
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.BA,
          break: 10,
        },
      ]
      base.SKILL_SCALING = form.spectral_transmigration
        ? [
            {
              name: 'Main',
              value: [{ scaling: calcScaling(1.25, 0.125, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
            },
            {
              name: 'Adjacent',
              value: [{ scaling: calcScaling(0.625, 0.0625, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 10,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(1, 0.1, skill, 'curved'), multiplier: Stats.ATK }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.SKILL,
              break: 20,
            },
          ]
      base.ULT_SCALING = [
        {
          name: 'Main',
          value: [{ scaling: calcScaling(1.8, 0.12, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
        },
        {
          name: 'Adjacent',
          value: [{ scaling: calcScaling(0.9, 0.06, ult, 'curved'), multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.NORMAL,
          type: TalentType.ULT,
          break: 20,
        },
      ]
      base.TECHNIQUE_SCALING = [
        {
          name: 'Frozen DMG',
          value: [{ scaling: 0.8, multiplier: Stats.HP }],
          element: Element.ICE,
          property: TalentProperty.FROZEN,
          type: TalentType.NONE,
          chance: { base: 1, fixed: false },
        },
      ]

      if (form.spectral_transmigration) {
        base.SKILL_ALT = true
        base[Stats.CRIT_RATE].push({
          name: 'Talent',
          source: 'Self',
          value: calcScaling(0.4, 0.01, talent, 'curved'),
        })
        if (a.a2)
          base[Stats.E_RES].push({
            name: 'Ascension 2 Passive',
            source: 'Self',
            value: 0.35,
          })
        if (a.a6)
          base.ULT_DMG.push({
            name: 'Ascension 6 Passive',
            source: 'Self',
            value: 0.2,
          })
        if (c >= 6)
          base[Stats.CRIT_DMG].push({
            name: 'Eidolon 6',
            source: 'Self',
            value: 0.5,
          })
      }
      if (form.jingliu_c1_crit) {
        base.ULT_CD.push({
          name: 'Eidolon 1',
          source: 'Self',
          value: 0.24,
        })
        if (form.spectral_transmigration)
          base.SKILL_CD.push({
            name: 'Eidolon 1',
            source: 'Self',
            value: 0.24,
          })
      }
      if (form.jingliu_c1) {
        base.ULT_SCALING.push({
          name: 'E1 Additional DMG',
          value: [{ scaling: 1, multiplier: Stats.ATK }],
          element: Element.ICE,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
        })
        if (form.spectral_transmigration)
          base.SKILL_SCALING.push({
            name: 'E1 Additional DMG',
            value: [{ scaling: 1, multiplier: Stats.ATK }],
            element: Element.ICE,
            property: TalentProperty.ADD,
            type: TalentType.NONE,
          })
      }
      if (form.jingliu_c2 && form.spectral_transmigration)
        base.SKILL_DMG.push({
          name: 'Eidolon 2',
          source: 'Self',
          value: 0.8,
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
      if (form.spectral_transmigration) {
        base.CALLBACK.push((x, d, w, all) => {
          const totalHp = _.sumBy(all, (item) => item.getHP()) * 0.04
          const atk = _.min([
            (5.4 + (c >= 4 ? 0.9 : 0)) * totalHp,
            (calcScaling(0.9, 0.09, talent, 'curved') + (c >= 4 ? 0.3 : 0)) * x.BASE_ATK,
          ])
          x[Stats.ATK].push({
            name: 'Talent',
            source: 'Self',
            value: atk,
          })

          return x
        })
      }
      return base
    },
  }
}

export default Jingliu
