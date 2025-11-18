import { addDebuff, findCharacter, findContentById } from '@src/core/utils/finder'
import _, { chain } from 'lodash'
import { baseStatsObject, StatsObject, StatsObjectKeys } from '../../baseConstant'
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
import { checkBuffExist } from '../../../../../core/utils/finder'
import { CallbackType } from '@src/domain/stats'
import { ElementColor } from '@src/presentation/hsr/components/tables/scaling_sub_rows'

const Cyrene = (c: number, a: { a2: boolean; a4: boolean; a6: boolean }, t: ITalentLevel, team: ITeamChar[]) => {
  const upgrade = {
    basic: c >= 5 ? 1 : 0,
    skill: c >= 5 ? 2 : 0,
    ult: c >= 3 ? 2 : 0,
    talent: c >= 3 ? 2 : 0,
    memo_skill: c >= 3 ? 1 : 0,
    memo_talent: c >= 5 ? 1 : 0,
  }
  const basic = t.basic + upgrade.basic
  const skill = t.skill + upgrade.skill
  const ult = t.ult + upgrade.ult
  const talent = t.talent + upgrade.talent
  const memo_skill = t.memo_skill + upgrade.memo_skill
  const memo_talent = t.memo_talent + upgrade.memo_talent

  const teamId = _.map(team, (item) => item.cId)
  const index = _.findIndex(team, (item) => item?.cId === '1415')
  const names = _.map(team, (item) => findCharacter(item?.cId)?.name)

  const chrysosBuffs: IContent[] = [
    {
      type: 'toggle',
      id: 'cyrene_tb',
      trace: `Memosprite Skill`,
      text: `Ode to Genesis`,
      title: `Ode to Genesis`,
      content: `<i class="text-amber-600">Effective for the entire battle.</i> When used on Trailblazer (Remembrance), increases Trailblazer (Remembrance)'s ATK by a value equal to <span class="text-desc">${calcScaling(
        8,
        1.6,
        memo_skill,
        'linear'
      )}%</span> of <b>Demiurge</b>'s Max HP, and increases Trailblazer (Remembrance)'s CRIT Rate by a value equal to <span class="text-desc">${calcScaling(
        36,
        7.2,
        memo_skill,
        'linear'
      )}%</span> of <b>Demiurge</b>'s CRIT Rate. This effect also applies to <b>Mem</b>. After Trailblazer (Remembrance) uses Enhanced Basic ATK in this battle, <b>Demiurge</b> immediately gains <span class="text-desc">1</span> extra turn and automatically uses <b>Minuet of Blooms and Plumes</b>. If the target was defeated before this ability is used, it will be used on newly appeared enemy targets instead.`,
      show: _.includes(teamId, '8007'),
      default: false,
      debuffElement: Element.ICE,
    },
    {
      type: 'toggle',
      id: 'cyrene_aglaea',
      trace: `Memosprite Skill`,
      text: `Ode to Romance`,
      title: `Ode to Romance`,
      content: `<i class="text-amber-600">One-time effect.</i> When used on Aglaea, causes Aglaea to gain <b class="text-pink-300">Romantic</b> and immediately stacks <b>Garmentmaker</b>'s Memosprite Talent's SPD Boost effect to its max. After Aglaea or Garmentmaker uses an attack, consumes <b class="text-pink-300">Romantic</b> and regenerates <span class="text-desc">70</span> Energy. Increases DMG dealt by Aglaea and Garmentmaker by <span class="text-desc">${calcScaling(
        36,
        7.2,
        memo_skill,
        'linear'
      )}%</span>, and ignores <span class="text-desc">${calcScaling(
        18,
        3.6,
        memo_skill,
        'linear'
      )}%</span> of the target's DEF, lasting until Aglaea exits the <b class="text-desc">Supreme Stance</b> state.`,
      show: _.includes(teamId, '1402'),
      default: false,
      debuffElement: Element.LIGHTNING,
    },
    {
      type: 'toggle',
      id: 'cyrene_tribbie',
      trace: `Memosprite Skill`,
      text: `Ode to Passage`,
      title: `Ode to Passage`,
      content: `<i class="text-amber-600">Effective for the entire battle.</i> When used on Tribbie, causes DMG dealt by Tribbie to ignore <span class="text-desc">${calcScaling(
        6,
        1.2,
        memo_skill,
        'linear'
      )}%</span> of the enemy's DEF. When Tribbie launches <u>Follow-up ATK</u> and triggers the <b>Additional DMG</b> from Tribbie's Zone, it further deals <span class="text-desc">1</span> instance(s) of <b>Additional DMG</b>.`,
      show: _.includes(teamId, '1403'),
      default: false,
      debuffElement: Element.QUANTUM,
    },
    {
      type: 'toggle',
      id: 'cyrene_mydei',
      trace: `Memosprite Skill`,
      text: `Ode to Strife`,
      title: `Ode to Strife`,
      content: `<i class="text-amber-600">One-time effect.</i> When used on Mydei, removes all Crowd Control debuffs inflicted on him. And if Mydei is in the <b class="text-red">Vendetta</b> state, he automatically uses <span class="text-desc">1</span> instance of <b>Godslayer Be God</b> without consuming <b>Charge</b>. Mydei's CRIT DMG increases by <span class="text-desc">${calcScaling(
        100,
        20,
        memo_skill,
        'linear'
      )}%</span> during this attack. If the target gets defeated before the use, then it will target the newly arriving enemy targets instead. If Mydei is not in the <b class="text-red">Vendetta</b> state, then advances Mydei's action by <span class="text-desc">100%</span>.`,
      show: _.includes(teamId, '1404'),
      default: false,
      debuffElement: Element.IMAGINARY,
    },
    {
      type: 'number',
      id: 'cyrene_cas',
      trace: `Memosprite Skill`,
      text: `Ode to Life and Death`,
      title: `Ode to Life and Death`,
      content: `<i class="text-amber-600">Effective for the entire battle.</i> When used on Castorice, <b class="text-indigo-400">Newbud</b> can overflow up to <span class="text-desc">200%</span>. When summoning <b>Netherwing</b>, consumes all overflowed <b class="text-indigo-400">Newbud</b>, increases the DMG multiplier of the DMG dealt by <span class="text-desc">${calcScaling(
        0.12,
        0.024,
        memo_skill,
        'linear'
      ).toLocaleString('en', {
        maximumFractionDigits: 3,
      })}%</span> for every <span class="text-desc">1%</span> of overflow value consumed when the summoned <b>Netherwing</b> triggers the ability effect of its Talent, <b>Wings Sweep the Ruins</b>. If there are <span class="text-desc">2</span> enemy target(s) on the field or fewer when summoned, the DMG multiplier additionally increases by <span class="text-desc">${calcScaling(
        0.24,
        0.048,
        memo_skill,
        'linear'
      ).toLocaleString('en', {
        maximumFractionDigits: 3,
      })}%</span> when summoning.`,
      show: _.includes(teamId, '1407'),
      default: 0,
      min: 0,
      max: 100,
      debuffElement: Element.QUANTUM,
    },
    {
      type: 'toggle',
      id: 'cyrene_anaxa',
      trace: `Memosprite Skill`,
      text: `Ode to Reason`,
      title: `Ode to Reason`,
      content: `<i class="text-amber-600">One-time effect.</i> When used on Anaxa, recovers <span class="text-desc">1</span> Skill Point(s) for allies and allows Anaxa to take action immediately. Increases the number of Skill DMG instances by <span class="text-desc">3</span> for <span class="text-desc">1</span> turn. The next time Anaxa uses his Basic ATK or Skill, he gains <b class="text-desc">True Knowledge</b>: Increases the ATK of all Erudition Path characters by <span class="text-desc">${calcScaling(
        30,
        6,
        memo_skill,
        'linear'
      )}%</span> and Skill DMG dealt by <span class="text-desc">${calcScaling(
        20,
        4,
        memo_skill,
        'linear'
      )}%</span> until the start of Anaxa's next turn.`,
      show: _.includes(teamId, '1405'),
      default: false,
      debuffElement: Element.WIND,
    },
    {
      type: 'toggle',
      id: 'cyrene_hyacine',
      trace: `Memosprite Skill`,
      text: `Ode to Sky`,
      title: `Ode to Sky`,
      content: `When <b>Demiurge</b> uses Memosprite Skill, causes Hyacine to gain <span class="text-desc">2</span> stacks of <b class="text-hsr-wind">Ode to Sky</b>. When used on Hyacine, regenerates <span class="text-desc">${calcScaling(
        12,
        2.4,
        memo_skill,
        'linear'
      )}</span> Energy for Hyacine. When Hyacine has <b class="text-hsr-wind">Ode to Sky</b> and is providing healing, additionally increases the healing value for <b>Little Ica</b>'s Memosprite Skill by an amount equal to <span class="text-desc">${calcScaling(
        36,
        7.2,
        memo_skill,
        'linear'
      )}%</span> of the healing value this time. After Hyacine uses Skill/Ultimate, consumes <span class="text-desc">1</span> stack of <b class="text-hsr-wind">Ode to Sky</b>.`,
      show: false,
      default: false,
      debuffElement: Element.WIND,
    },
    {
      type: 'element',
      id: 'cyrene_cipher',
      trace: `Memosprite Skill`,
      text: `Ode to Trickery`,
      title: `Ode to Trickery`,
      content: `<i class="text-amber-600">Effective for the entire battle.</i> When used on Cipher, increases the DMG dealt by Cipher by <span class="text-desc">${calcScaling(
        18,
        3.6,
        memo_skill,
        'linear'
      )}%</span>, and decreases the DEF of the <b class="text-hsr-quantum">Patron</b> by <span class="text-desc">${calcScaling(
        10,
        2,
        memo_skill,
        'linear'
      )}%</span> and the DEF of enemy targets other than <b class="text-hsr-quantum">Patron</b> by <span class="text-desc">${calcScaling(
        6,
        1.2,
        memo_skill,
        'linear'
      )}%</span>.`,
      show: _.includes(teamId, '1406'),
      default: 'none',
      options: [
        { name: 'None', value: 'none' },
        { name: 'Patron', value: 'patron' },
        { name: 'Non-Patron', value: 'nonPatron' },
      ],
      debuffElement: Element.QUANTUM,
    },
    {
      type: 'toggle',
      id: 'cyrene_phainon',
      trace: `Memosprite Skill`,
      text: `Ode to Worldbearing`,
      title: `Ode to Worldbearing`,
      content: `<i class="text-amber-600">Effective for the entire battle.</i> After it is used on Phainon, Phainon gains <span class="text-desc">6</span> <b class="text-desc">Coreflames</b> as well as <b class="text-rose-500">Eternal Ignition</b> when Transforming. When Transforming, if <b class="text-desc">Coreflame</b> exceeds <span class="text-desc">12</span>, for each point in excess, Khaslana's CRIT DMG increases by <span class="text-desc">${calcScaling(
        6,
        1.2,
        memo_skill,
        'linear'
      )}%</span>, up to <span class="text-desc">${calcScaling(
        36,
        7.2,
        memo_skill,
        'linear'
      )}%</span>. While <b class="text-rose-500">Eternal Ignition</b> persists, increases Khaslana's CRIT Rate by <span class="text-desc">${calcScaling(
        8,
        1.6,
        memo_skill,
        'linear'
      )}%</span>. After Khaslana's extra turns are depleted, the Transformation does not end, but refreshes all of Khaslana's extra turns and gains <span class="text-desc">4</span> point(s) of <b class="text-red">Scourge</b>. At the start of Khaslana's extra turns, Khaslana consumes an amount of HP equal to <span class="text-desc">15%</span> of his current HP. After using an attack, deals <span class="text-desc">5</span> instances of <b>Additional DMG</b>, with each instance dealing <b class="text-hsr-fire">Fire Additional DMG</b> equal to <span class="text-desc">${calcScaling(
        5,
        1,
        memo_skill,
        'linear'
      )}%</span> of Khaslana's ATK to one random enemy.`,
      show: _.includes(teamId, '1408'),
      default: false,
      debuffElement: Element.PHYSICAL,
    },
    {
      type: 'toggle',
      id: 'cyrene_hysilens',
      trace: `Memosprite Skill`,
      text: `Ode to Ocean`,
      title: `Ode to Ocean`,
      content: `<i class="text-amber-600">One-time effect.</i> When used on Hysilens, Hysilens gains <b class="text-sky-400">Flowing Warmth</b>. After Hysilens uses an attack, consumes <b class="text-sky-400">Flowing Warmth</b> and regenerates <span class="text-desc">60</span> Energy for this unit. In this battle, increases DMG dealt by Hysilens by <span class="text-desc">${calcScaling(
        60,
        12,
        memo_skill,
        'linear'
      )}%</span>. After Hysilens uses Basic ATK/Skill to attack enemies, causes the DoT currently applied on the attacked enemy targets to immediately produce DMG equal to <span class="text-desc">${calcScaling(
        30,
        6,
        memo_skill,
        'linear'
      )}%</span>/<span class="text-desc">${calcScaling(40, 8, memo_skill, 'linear')}%</span> of the original DMG.`,
      show: _.includes(teamId, '1410'),
      default: false,
      debuffElement: Element.PHYSICAL,
    },
    {
      type: 'toggle',
      id: 'cyrene_cerydra',
      trace: `Memosprite Skill`,
      text: `Ode to Law`,
      title: `Ode to Law`,
      content: `<i class="text-amber-600">Effective for the entire battle.</i> After using on Cerydra, increases the CRIT DMG of the character with <b class="text-blue">Military Merit</b> by <span class="text-desc">${calcScaling(
        15,
        3,
        memo_skill,
        'linear'
      )}%</span>. After <b class="text-desc">Coup de Main</b> ends, Cerydra immediately gains <span class="text-desc">1</span> point(s) of <b>Charge</b>.`,
      show: _.includes(teamId, '1412'),
      default: false,
      debuffElement: Element.WIND,
    },
    {
      type: 'toggle',
      id: 'cyrene_evernight',
      trace: `Memosprite Skill`,
      text: `Ode to Time`,
      title: `Ode to Time`,
      content: `<i class="text-amber-600">Effective for the entire battle.</i> After it is used on Evernight, increases DMG dealt when <b>Evey</b> uses the Memosprite Skill <b>Dream, Dissolving, as Dew</b> by <span class="text-desc">${calcScaling(
        9,
        1.8,
        memo_skill,
        'linear'
      )}%</span>. After Evernight uses a Skill/Ultimate, additionally gains <span class="text-desc">1</span> <b class="text-indigo-300">Memoria</b> point(s). The CRIT DMG boost effect provided by the Skill is further increased by an amount equal to <span class="text-desc">${calcScaling(
        6,
        1.2,
        memo_skill,
        'linear'
      )}%</span> of Evernight's CRIT DMG.`,
      show: _.includes(teamId, '1413'),
      default: false,
      debuffElement: Element.ICE,
    },
    {
      type: 'toggle',
      id: 'cyrene_dhpt',
      trace: `Memosprite Skill`,
      text: `Ode to Earth`,
      title: `Ode to Earth`,
      content: `When <b>Demiurge</b> uses Memosprite Skill, grants <b class="text-hsr-physical">Ode to Earth</b> to Dan Heng • Permansor Terrae, and the next <span class="text-desc">3</span> attack(s) of <b class="text-hsr-physical">Souldragon</b> deals <b>Additional DMG</b> of of the <b class="text-desc">Bondmate</b>'s Type, equal to <span class="text-desc">${calcScaling(
        40,
        8,
        memo_skill,
        'linear'
      )}%</span> of the <b class="text-desc">Bondmate</b>'s <b class="text-indigo-300">Shield</b> Effect. When Dan Heng • Permansor Terrae holds <b class="text-hsr-physical">Ode to Earth</b>, the <b class="text-desc">Bondmate</b> deals <span class="text-desc">${calcScaling(
        12,
        2.4,
        memo_skill,
        'linear'
      )}%</span> more DMG. When used on Dan Heng • Permansor Terrae, additionally advances <b class="text-hsr-physical">Souldragon</b>'s action by <span class="text-desc">100%</span>. The <b class="text-hsr-physical">Souldragon</b>'s next action gains the enhance effects of Dan Heng • Permansor Terrae's Ultimate and the <b class="text-indigo-300">Shield</b> Effect provided by <b class="text-hsr-physical">Souldragon</b> is <span class="text-desc">150%</span> of its original <b class="text-indigo-300">Shield</b> value. Does not consume the enhancement <b>Charge</b> of Dan Heng • Permansor Terrae's Ultimate.`,
      show: _.includes(teamId, '1414'),
      default: false,
      debuffElement: Element.PHYSICAL,
    },
  ]

  const talents: ITalent = {
    normal: {
      trace: 'Basic ATK',
      title: 'Lo, Hope Takes Flight!',
      content: `Gains <span class="text-desc">1</span> <b class="text-pink-300">Recollection</b> point(s) and deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Cyrene's Max HP to one designated enemy target.`,
      value: [{ base: 25, growth: 5, style: 'linear' }],
      level: basic,
      tag: AbilityTag.ST,
      sp: 1,
    },
    normal_alt: {
      trace: 'Enhanced Basic ATK',
      title: 'To Love and Tomorrow ♪',
      content: `Gains <span class="text-desc">3</span> <b class="text-pink-300">Recollection</b> points and deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Cyrene's Max HP to one designated enemy, then deals <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of Cyrene's Max HP to all enemies.
      <br /><b>To Love and Tomorrow ♪</b> cannot recover Skill Points.`,
      value: [{ base: 15, growth: 3, style: 'linear' }],
      level: basic,
      tag: AbilityTag.AOE,
    },
    skill: {
      trace: 'Skill',
      title: 'Bloom, Elysium of Beyond',
      content: `Gains <span class="text-desc">3</span> <b class="text-pink-300">Recollection</b> point(s) and deploys a Zone that lasts <span class="text-desc">2</span> turns, with the Zone's duration decreasing by <span class="text-desc">1</span> at the start of Cyrene's turn. While the Zone is active, for each instance of DMG dealt by all ally targets, deals <span class="text-desc">1</span> additional instance of <b class="text-true">True DMG</b> equal to {{0}}% of the original DMG. When Cyrene is downed, the Zone will also be dispelled.`,
      value: [{ base: 12, growth: 1.2, style: 'curved' }],
      level: skill,
      tag: AbilityTag.SUPPORT,
      sp: -1,
    },
    summon_skill: {
      trace: 'Memosprite Skill',
      title: 'Minuet of Blooms and Plumes',
      content: `Deals <b class="text-hsr-ice">Ice DMG</b> to all enemies equal to {{0}}% of <b>Demiurge</b>'s Max HP.`,
      value: [{ base: 30, growth: 6, style: 'linear' }],
      level: memo_skill,
      tag: AbilityTag.AOE,
      image: 'asset/traces/SkillIcon_11415_Servant02.png',
    },
    unique_summon_skill: {
      trace: 'Exclusive Memosprite Skill',
      title: 'This Ode, to All Lives',
      content: `Applies a buff to one designated ally character. When the character is a Chrysos Heir, the target gains a special effect. When the character is not a Chrysos Heir, increases the target's DMG dealt by {{0}}% for <span class="text-desc">2</span> turns. This effect also applies on memosprites.
      <br />
      ${_.join(
        _.map(
          chrysosBuffs,
          (item) => `<br /><b class="text-unique-end">✦</b> <b class="${ElementColor[item.debuffElement]}">${
            item.text
          }</b>
        <br />${item.content}
        <br />`
        ),
        ''
      )}
      <br /><b class="text-unique-end">✦</b> <b class="${ElementColor[Element.ICE]}">Ode to Ego</b>
      <br />For every <span class="text-desc">1</span> different teammate (other than <b>Demiurge</b>) from whom Cyrene has gained <b class="text-pink-300">Recollection</b>, additionally deals <span class="text-desc">1</span> instance of <b class="text-hsr-ice">Ice DMG</b> equal to {{1}}% of <b>Demiurge</b>'s Max HP to one random enemy when <b>Demiurge</b> uses <b>Minuet of Blooms and Plumes</b>. After Cyrene uses Ultimate or when <b>Demiurge</b> is summoned, <b>Demiurge</b> immediately gains <span class="text-desc">1</span> <b class="text-desc">Story</b>. When <b class="text-desc">Story</b> reaches <span class="text-desc">3</span>, <b>Demiurge</b> consumes all <b class="text-desc">Story</b> points to immediately gain <span class="text-desc">1</span> extra turn and automatically use <b>Minuet of Blooms and Plumes</b>.`,
      value: [
        { base: 20, growth: 4, style: 'linear' },
        { base: 30, growth: 6, style: 'linear' },
      ],
      level: memo_skill,
      tag: AbilityTag.SUPPORT,
      image: 'asset/traces/SkillIcon_11415_Servant.png',
    },
    ult: {
      trace: 'Ultimate',
      title: `Verse ◦ Vow ∞`,
      content: `Summons memosprite <b>Demiurge</b>, causes it to immediately gain <span class="text-desc">1</span> extra turn, and activates all teammates' Ultimate. Then, enters the <b>Ripples of Past Reverie</b> state, with Basic ATK enhanced to <b>To Love and Tomorrow ♪</b> and can only use this Basic ATK. Increases Cyrene's and <b>Demiurge</b>'s CRIT Rate by {{0}}%, and deploys the Zone effect from the Skill with no active duration.
      <br />Can only be used once per combat. <b>Demiurge</b>'s initial Max HP equals to <span class="text-desc">100%</span> of Cyrene's Max HP.`,
      value: [{ base: 25, growth: 2.5, style: 'curved' }],
      level: ult,
      tag: AbilityTag.SUMMON,
      image: 'asset/traces/SkillIcon_1415_Ultra.png',
    },
    ult_alt: {
      trace: 'Alternate Ultimate',
      title: `Reunion at First Sight`,
      content: `Causes <b>Demiurge</b> to immediately gain <span class="text-desc">1</span> extra turn.`,
      value: [],
      level: ult,
      tag: AbilityTag.SUMMON,
      image: 'asset/traces/SkillIcon_1415_Ultra02.png',
    },
    talent: {
      trace: 'Talent',
      title: `Hearts Gather as One`,
      content: `When combat begins or after Cyrene takes action, other ally characters under any state and their memosprites gain <b class="text-desc">Future</b>. When ally targets with <b class="text-desc">Future</b> take action, they consume <b class="text-desc">Future</b> to grant Cyrene <span class="text-desc">1</span> <b class="text-pink-300">Recollection</b> point(s). When Cyrene has <span class="text-desc">24</span> <b class="text-pink-300">Recollection</b> points, her Ultimate can be activated, and all debuffs on her are dispelled. When she has <span class="text-desc">12</span> <b class="text-pink-300">Recollection</b> points while in the <b>Ripples of Past Reverie</b> state, its Ultimate can be activated. After reaching the maximum, <b class="text-pink-300">Recollection</b> points can overflow to a maximum of <span class="text-desc">27</span> points. While Cyrene is on the field, increases DMG dealt by all ally targets by {{0}}%.`,
      value: [{ base: 10, growth: 1, style: 'curved' }],
      level: talent,
      tag: AbilityTag.ENHANCE,
    },
    summon_talent: {
      trace: 'Memosprite Talent [1]',
      title: `Waiting, In Every Past`,
      content: `<b>Demiurge</b>'s SPD remains at <span class="text-desc">0</span>, and <b>Demiurge</b> will not appear on the Action Order. While on the field, it is considered as <u>Out-of-Bounds</u>. When changes occur on Cyrene's HP percentage, <b>Demiurge</b>'s HP percentage will also change accordingly. When <b>Demiurge</b> is on the field, Cyrene's and <b>Demiurge</b>'s Max HP increases by {{0}}%. After using abilities, all Continuous Effects' duration on this unit decreases by <span class="text-desc">1</span>.`,
      value: [{ base: 12, growth: 2.4, style: 'linear' }],
      level: memo_talent,
      tag: AbilityTag.ENHANCE,
    },
    summon_talent_2: {
      trace: 'Memosprite Talent [2]',
      title: `"Hello, World ♪"`,
      content: `When <b>Demiurge</b> is summoned, dispels Crowd Control debuffs from all allies.`,
      value: [],
      level: memo_talent,
      tag: AbilityTag.ENHANCE,
    },
    technique: {
      trace: 'Technique',
      title: `Peace at West Wind's End`,
      content: `After using Technique, creates a Special Dimension that lasts for <span class="text-desc">30</span> second(s) around the character. Enemies within this Special Dimension enter the <b>This Moment, Forever</b> state. While in this state, enemies will cease all actions. Ally characters within this Special Dimension have <span class="text-desc">50%</span> increased movement speed. After entering combat within the duration, deploys the Skill's Zone. Only <span class="text-desc">1</span> Dimension Effect created by allies can exist at the same time.`,
      tag: AbilityTag.ST,
    },
    a2: {
      trace: 'Ascension 2 Passive',
      title: `Child of Remembrance`,
      content: `When a teammate's memosprite is summoned, it gains <b class="text-desc">Future</b>. <b class="text-desc">Future</b> held by memosprites cannot be consumed.`,
    },
    a4: {
      trace: 'Ascension 4 Passive',
      title: `Ripples Across Time`,
      content: `When there are <span class="text-desc">1</span>/<span class="text-desc">2</span>/<span class="text-desc">3</span> Chrysos Heir(s) or Remembrance Path character(s) aside from Cyrene in the team, Cyrene gains <span class="text-desc">2</span>/<span class="text-desc">3</span>/<span class="text-desc">6</span> <b class="text-pink-300">Recollection</b> point(s) respectively at the start of combat.`,
    },
    a6: {
      trace: 'Ascension 6 Passive',
      title: `Causality in Trichotomy`,
      content: `When Cyrene's SPD is at <span class="text-desc">180</span> or higher, increases all allies' DMG dealt by <span class="text-desc">20%</span>. Then, for each point of SPD exceeded, increases Cyrene and <b>Demiurge</b>'s <b class="text-hsr-ice">Ice RES PEN</b> by <span class="text-desc">2%</span>, counting up to a maximum of <span class="text-desc">60</span> exceeded SPD points.`,
    },
    c1: {
      trace: 'Eidolon 1',
      title: `Epics, Born on a Blank Slate`,
      content: `When <b>Demiurge</b> triggers the Memosprite Skill <b>Ode to Ego</b> while using <b>Minuet of Blooms and Plumes</b>, gains <span class="text-desc">6</span> <b class="text-pink-300">Recollection</b> point(s) and increases the number of bounces for this attack by <span class="text-desc">12</span>.`,
    },
    c2: {
      trace: 'Eidolon 2',
      title: `A Tomorrow in Thirteen Shades`,
      content: `When entering combat, additionally gains <span class="text-desc">12</span> <b class="text-pink-300">Recollection</b> point(s). For each different ally character that gains the Memosprite Skill buff from <b>Demiurge</b>, the DMG multiplier of the <b class="text-true">True DMG</b> dealt by ally targets via the Skill's Zone increases by <span class="text-desc">6%</span>, up to a max increase of <span class="text-desc">24%</span>.`,
    },
    c3: {
      trace: 'Eidolon 3',
      title: `By Thy Being, As I've Written`,
      content: `Ultimate Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Talent Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Memosprite Skill Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c4: {
      trace: 'Eidolon 4',
      title: 'Please Write On, With a Smile',
      content: `Each time after <b>Demiurge</b> uses <b>Minuet of Blooms and Plumes</b>, the Bounce DMG multiplier of the triggered Memosprite Skill <b>Ode to Ego</b> increases by <span class="text-desc">6%</span> in the current battle and can be stacked up to <span class="text-desc">24</span> times.`,
    },
    c5: {
      trace: 'Eidolon 5',
      title: `Gaze, Steeped in Yesterbloom`,
      content: `Skill Lv. <span class="text-desc">+2</span>, up to a maximum of Lv. <span class="text-desc">15</span>.
      <br />Basic ATK Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.
      <br />Memosprite Talent Lv. <span class="text-desc">+1</span>, up to a maximum of Lv. <span class="text-desc">10</span>.`,
    },
    c6: {
      trace: 'Eidolon 6',
      title: 'Remembrance, Sung in Ripples ♪',
      content: `When Cyrene uses her Ultimate for the first time, all allies' actions advance by <span class="text-desc">100%</span>. Each time when <b>Demiurge</b> triggers triggers the Memosprite Skill <b>Ode to Ego</b> and uses <b>Minuet of Blooms and Plumes</b>, based on the number of times it has been triggered, gains the following effects:
      <br /><span class="text-desc">1</span> time: When <b>Demiurge</b> is on the field, reduces all enemy targets' DEF by <span class="text-desc">20%</span>.
      <br /><span class="text-desc">2</span> times and more: Advances all allies' actions by <span class="text-desc">24%</span>.`,
    },
  }

  const content: IContent[] = [
    {
      type: 'number',
      id: 'recollection',
      trace: `Memosprite Skill`,
      text: `Recollection Count`,
      title: `Recollection Count`,
      content: `<b class="text-unique-end">✦</b> <b class="${ElementColor[Element.ICE]}">Ode to Ego</b>
      <br />For every <span class="text-desc">1</span> different teammate (other than <b>Demiurge</b>) from whom Cyrene has gained <b class="text-pink-300">Recollection</b>, additionally deals <span class="text-desc">1</span> instance of <b class="text-hsr-ice">Ice DMG</b> equal to {{0}}% of <b>Demiurge</b>'s Max HP to one random enemy when <b>Demiurge</b> uses <b>Minuet of Blooms and Plumes</b>.`,
      value: [{ base: 30, growth: 6, style: 'linear' }],
      show: true,
      default: 3,
      min: 0,
      max: 6,
    },
    {
      type: 'toggle',
      id: 'cyrene_eba',
      text: `Enhanced Basic Attack`,
      ...talents.ult,
      show: true,
      default: true,
    },
    ...chrysosBuffs,
    {
      type: 'toggle',
      id: 'cyrene_cas_count',
      trace: `Memosprite Skill`,
      text: `Enemies Count <= 2`,
      title: `Enemies Count <= 2`,
      content: `Under the effect of <b class="text-hsr-quantum">Ode to Life and Death</b>, if there are <span class="text-desc">2</span> enemy target(s) on the field or fewer, the DMG multiplier of <b>Netherwing</b>'s Talent <b>Wings Sweep the Ruins</b> additionally increases.`,
      show: _.includes(teamId, '1407'),
      default: false,
    },
    {
      type: 'number',
      id: 'cyrene_dhpt_shield',
      trace: `Memosprite Skill`,
      text: `Bondmate's Shield Effect`,
      title: `Bondmate's Shield Effect`,
      content: `The next <span class="text-desc">3</span> attack(s) of <b class="text-hsr-physical">Souldragon</b> deals <b>Additional DMG</b> of corresponding Type equal to {{0}}% of <b class="text-desc">Bondmate</b>'s <b class="text-indigo-300">Shield</b> Effect.`,
      value: [{ base: 40, growth: 8, style: 'linear' }],
      level: memo_skill,
      show: _.includes(teamId, '1414'),
      default: 2000,
      min: 0,
    },
    {
      type: 'toggle',
      id: 'true_knowledge',
      trace: `Memosprite Skill`,
      text: `True Knowledge`,
      title: `True Knowledge`,
      content: `Increases the ATK of all Erudition Path characters by {{0}}% and Skill DMG dealt by {{1}}% until the start of Anaxa's next turn.`,
      value: [
        { base: 30, growth: 6, style: 'linear' },
        { base: 20, growth: 4, style: 'linear' },
      ],
      level: memo_skill,
      show: _.includes(teamId, '1405'),
      default: true,
    },
    {
      type: 'number',
      id: 'phainon_excess_coreflame',
      trace: `Memosprite Skill`,
      text: `Ode Excess Coreflame`,
      title: `Ode Excess Coreflame`,
      content: `When Transforming, if <b class="text-desc">Coreflame</b> exceeds <span class="text-desc">12</span>, for each point in excess, Khaslana's CRIT DMG increases by {{0}}%, up to {{1}}%.`,
      value: [
        { base: 6, growth: 1.2, style: 'linear' },
        { base: 36, growth: 7.2, style: 'linear' },
      ],
      level: memo_skill,
      show: _.includes(teamId, '1408'),
      default: 6,
      min: 0,
      max: 6,
    },
    {
      type: 'toggle',
      id: 'cyrene_skill',
      text: `Cyrene Skill Zone`,
      ...talents.skill,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'cyrene_ult_cr',
      text: `Ult CRIT Rate`,
      ...talents.ult,
      show: true,
      default: true,
    },
    {
      type: 'toggle',
      id: 'cyrene_memo_talent',
      text: `Memo. Talent Max HP`,
      ...talents.summon_talent,
      show: true,
      default: true,
    },
    {
      type: 'number',
      id: 'cyrene_e2',
      text: `E2 Unique Buff Count`,
      ...talents.c2,
      show: c >= 2,
      default: 0,
      min: 0,
      max: 4,
    },
    {
      type: 'number',
      id: 'cyrene_e4',
      text: `E4 Memo. Skill Trigger Count`,
      ...talents.c4,
      show: c >= 4,
      default: 0,
      min: 0,
      max: 24,
    },
    {
      type: 'toggle',
      id: 'cyrene_e6',
      text: `E6 DEF Shred`,
      ...talents.c6,
      show: c >= 6,
      default: true,
    },
  ]

  const teammateContent: IContent[] = [
    ...chrysosBuffs,
    findContentById(content, 'cyrene_skill'),
    findContentById(content, 'cyrene_e2'),
    findContentById(content, 'cyrene_e6'),
    findContentById(content, 'cyrene_cas_count'),
    findContentById(content, 'cyrene_dhpt_shield'),
    findContentById(content, 'true_knowledge'),
    findContentById(content, 'phainon_excess_coreflame'),
  ]

  const allyContent: IContent[] = [
    {
      type: 'toggle',
      id: 'cyrene_non_ch',
      text: `Cyrene Non-Heir DMG Bonus`,
      ...talents.unique_summon_skill,
      content: `When the target is not a Chrysos Heir, increases the target's DMG dealt by {{0}}% for <span class="text-desc">2</span> turn(s).`,
      value: [{ base: 20, growth: 4, style: 'linear' }],
      show: true,
      default: false,
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
      broken: boolean
    ) => {
      const base = _.cloneDeep(x)
      base.SUMMON_STATS = _.cloneDeep({
        ...x,
        BASE_ATK: x.BASE_ATK,
        BASE_DEF: x.BASE_DEF,
        BASE_SPD: 0,
        ELEMENT: Element.NONE,
        BASE_HP: x.BASE_HP,
        [Stats.HP]: x[Stats.HP],
        [Stats.P_HP]: x[Stats.P_HP],
        [Stats.P_SPD]: [],
        [Stats.SPD]: [],
        SUMMON_ID: '1415',
        NAME: 'Demiurge',
        MAX_ENERGY: 0,
      })
      base.CYRENE_SKILL_LEVEL = memo_skill

      if (form.cyrene_eba) base.BA_ALT = true

      base.BASIC_SCALING = form.cyrene_eba
        ? [
            {
              name: 'Max Single Target DMG',
              value: [
                { scaling: calcScaling(0.15, 0.03, basic, 'linear'), multiplier: Stats.HP },
                { scaling: calcScaling(0.15, 0.03, basic, 'linear'), multiplier: Stats.HP },
              ],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 5,
              sum: true,
              hitSplit: [0.5, 0.15, 0.35],
            },
            {
              name: 'Single Instance',
              value: [{ scaling: calcScaling(0.15, 0.03, basic, 'linear'), multiplier: Stats.HP }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 5,
            },
          ]
        : [
            {
              name: 'Single Target',
              value: [{ scaling: calcScaling(0.25, 0.05, basic, 'linear'), multiplier: Stats.HP }],
              element: Element.ICE,
              property: TalentProperty.NORMAL,
              type: TalentType.BA,
              break: 10,
              sum: true,
            },
          ]
      base.SKILL_SCALING = []
      base.MEMO_SKILL_SCALING = [
        {
          name: 'Total Single Target DMG',
          value: [
            { scaling: calcScaling(0.3, 0.06, memo_skill, 'linear'), multiplier: Stats.HP },
            {
              scaling:
                (calcScaling(0.3, 0.06, memo_skill, 'linear') + (0.06 * form.cyrene_e4 || 0)) *
                (form.recollection + (c >= 1 ? 12 : 0)),
              multiplier: Stats.HP,
            },
          ],
          element: Element.ICE,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 10,
          sum: true,
        },
        {
          name: 'AoE',
          value: [{ scaling: calcScaling(0.3, 0.06, memo_skill, 'linear'), multiplier: Stats.HP }],
          element: Element.ICE,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
          break: 10,
        },
        {
          name: 'Ode Extra DMG',
          value: [
            {
              scaling: calcScaling(0.3, 0.06, memo_skill, 'linear') + (0.06 * form.cyrene_e4 || 0),
              multiplier: Stats.HP,
            },
          ],
          element: Element.ICE,
          property: TalentProperty.SERVANT,
          type: TalentType.SERVANT,
        },
      ]
      base.ULT_SCALING = []
      base.TECHNIQUE_SCALING = []

      if (form.cyrene_ult_cr) {
        base[Stats.CRIT_RATE].push({
          name: `Ultimate`,
          source: 'Self',
          value: calcScaling(0.25, 0.025, ult, 'curved'),
        })
        base.SUMMON_STATS[Stats.CRIT_RATE].push({
          name: `Ultimate`,
          source: 'Cyrene',
          value: calcScaling(0.25, 0.025, ult, 'curved'),
        })
      }
      if (form.cyrene_memo_talent) {
        base[Stats.P_HP].push({
          name: `Memosprite Talent`,
          source: 'Demiurge',
          value: calcScaling(0.12, 0.024, memo_talent, 'linear'),
        })
        base.SUMMON_STATS[Stats.P_HP].push({
          name: `Memosprite Talent`,
          source: 'Self',
          value: calcScaling(0.12, 0.024, memo_talent, 'linear'),
        })
      }

      base[Stats.ALL_DMG].push({
        name: `Talent`,
        source: 'Self',
        value: calcScaling(0.1, 0.01, ult, 'curved'),
      })
      base.SUMMON_STATS[Stats.ALL_DMG].push({
        name: `Talent`,
        source: 'Cyrene',
        value: calcScaling(0.1, 0.01, ult, 'curved'),
      })

      if (form.cyrene_e6) {
        base.DEF_REDUCTION.push({
          name: `Eidolon 6`,
          source: 'Self',
          value: 0.2,
        })
        base.SUMMON_STATS.DEF_REDUCTION.push({
          name: `Eidolon 6`,
          source: 'Cyrene',
          value: 0.2,
        })
        addDebuff(debuffs, DebuffTypes.DEF_RED)
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
      base[Stats.ALL_DMG].push({
        name: `Talent`,
        source: 'Cyrene',
        value: calcScaling(0.1, 0.01, talent, 'curved'),
      })

      if (aForm.cyrene_non_ch) {
        base[Stats.ALL_DMG].push({
          name: `Memosprite Skill`,
          source: 'Cyrene',
          value: calcScaling(0.2, 0.04, memo_skill, 'linear'),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.ALL_DMG].push({
            name: `Memosprite Skill`,
            source: 'Cyrene',
            value: calcScaling(0.2, 0.04, memo_skill, 'linear'),
          })
        }
      }

      if (form.cyrene_e6) {
        base.DEF_REDUCTION.push({
          name: `Eidolon 6`,
          source: 'Cyrene',
          value: 0.2,
        })
      }

      return base
    },
    postCompute: (
      x: StatsObject,
      form: Record<string, any>,
      all: StatsObject[],
      allForm: Record<string, any>[],
      debuffs: {
        type: DebuffTypes
        count: number
      }[],
      weakness: Element[],
      broken: boolean,
      globalCallback: CallbackType[]
    ) => {
      if (x.SUMMON_STATS) {
        globalCallback.push(function P99(_b, _d, _w, all) {
          if (form.cyrene_skill) {
            const cyrene = all[index]
            _.forEach(all, (t, i) => {
              // Hysilens (Has to be here for DOT to get True DMG)
              if (t.ID === '1410' && form.cyrene_hysilens) {
                t[Stats.ALL_DMG].push({
                  name: `Ode to Ocean`,
                  source: 'Cyrene',
                  value: calcScaling(0.6, 0.12, memo_skill, 'linear'),
                })
                const dots = _.flatMap(all, (item) => item.DOT_SCALING)
                t.BASIC_SCALING.push(
                  ..._.map(dots, (item, i) => ({
                    ...item,
                    chance: undefined,
                    name: `${names?.[item.overrideIndex]}'s ${item.name}`.replace('DMG', 'Detonation'),
                    multiplier: (item.multiplier || 1) * calcScaling(0.3, 0.06, ult, 'curved'),
                    sum: true,
                    detonate: true,
                  }))
                )
                t.SKILL_SCALING.push(
                  ..._.map(dots, (item, i) => ({
                    ...item,
                    chance: undefined,
                    name: `${names?.[item.overrideIndex]}'s ${item.name}`.replace('DMG', 'Detonation'),
                    multiplier: (item.multiplier || 1) * calcScaling(0.4, 0.08, ult, 'curved'),
                    sum: true,
                    detonate: true,
                  }))
                )
              }
              _.forEach(
                [t.BASIC_SCALING, t.SKILL_SCALING, t.ULT_SCALING, t.TALENT_SCALING, t.MEMO_SKILL_SCALING],
                (s) => {
                  // Phainon Fire DMG
                  if (t.ID === '1408' && form.cyrene_phainon && allForm[i].phainon_transform) {
                    s.push({
                      name: `Cyrene Ode Additional DMG`,
                      multiplier: 5,
                      property: TalentProperty.ADD,
                      element: Element.FIRE,
                      type: TalentType.NONE,
                      value: [{ scaling: calcScaling(0.05, 0.01, skill, 'curved'), multiplier: Stats.ATK }],
                      sum: true,
                    })
                  }
                  // Skill True DMG
                  _.forEach(s, (ss) => {
                    if (
                      !_.includes([TalentProperty.HEAL, TalentProperty.SHIELD, TalentProperty.TRUE], ss.property) &&
                      (ss.property !== TalentProperty.DOT || ss.detonate)
                    ) {
                      s.push({
                        ...ss,
                        name: `${ss.name} - Cyrene`,
                        multiplier:
                          (ss.multiplier || 1) *
                          (calcScaling(0.12, 0.012, skill, 'curved') + (0.06 * form.cyrene_e2 || 0)),
                        property: TalentProperty.TRUE,
                        break: ss.break * (calcScaling(0.12, 0.012, skill, 'curved') + (0.06 * form.cyrene_e2 || 0)),
                        chance: null,
                      })
                    }
                  })
                }
              )
              // Trailblazer
              if (t.ID === '8007' && form.cyrene_tb) {
                t.X_ATK.push({
                  name: `Ode to Trailblaze`,
                  source: 'Cyrene',
                  value: calcScaling(0.08, 0.016, memo_skill, 'linear') * cyrene.getHP(),
                  base: cyrene.getHP(),
                  multiplier: calcScaling(0.08, 0.016, memo_skill, 'linear'),
                })
                t[Stats.CRIT_RATE].push({
                  name: `Ode to Trailblaze`,
                  source: 'Cyrene',
                  value: calcScaling(0.36, 0.072, memo_skill, 'linear') * cyrene.getValue(Stats.CRIT_RATE),
                  base: toPercentage(cyrene.getValue(Stats.CRIT_RATE)),
                  multiplier: calcScaling(0.3, 0.06, memo_skill, 'linear'),
                })
                t.SUMMON_STATS.X_ATK.push({
                  name: `Ode to Trailblaze`,
                  source: 'Cyrene',
                  value: calcScaling(0.08, 0.016, memo_skill, 'linear') * cyrene.getHP(),
                  base: cyrene.getHP(),
                  multiplier: calcScaling(0.08, 0.016, memo_skill, 'linear'),
                })
                t.SUMMON_STATS[Stats.CRIT_RATE].push({
                  name: `Ode to Trailblaze`,
                  source: 'Cyrene',
                  value: calcScaling(0.36, 0.072, memo_skill, 'linear') * cyrene.getValue(Stats.CRIT_RATE),
                  base: toPercentage(cyrene.getValue(Stats.CRIT_RATE)),
                  multiplier: calcScaling(0.3, 0.06, memo_skill, 'linear'),
                })
              }
              // Aglaea
              if (t.ID === '1402' && form.cyrene_aglaea && allForm[i].supreme_stance) {
                t[Stats.ALL_DMG].push({
                  name: `Ode to Romance`,
                  source: 'Cyrene',
                  value: calcScaling(0.36, 0.072, memo_skill, 'linear'),
                })
                t.DEF_PEN.push({
                  name: `Ode to Romance`,
                  source: 'Cyrene',
                  value: calcScaling(0.18, 0.036, memo_skill, 'linear'),
                })
                t.SUMMON_STATS[Stats.ALL_DMG].push({
                  name: `Ode to Romance`,
                  source: 'Cyrene',
                  value: calcScaling(0.36, 0.072, memo_skill, 'linear'),
                })
                t.SUMMON_STATS.DEF_PEN.push({
                  name: `Ode to Romance`,
                  source: 'Cyrene',
                  value: calcScaling(0.18, 0.036, memo_skill, 'linear'),
                })
              }
              // Tribbie
              if (t.ID === '1403' && form.cyrene_tribbie) {
                t.DEF_PEN.push({
                  name: `Ode to Passage`,
                  source: 'Cyrene',
                  value: calcScaling(0.06, 0.012, memo_skill, 'linear'),
                })
              }
              // Mydei
              if (t.ID === '1404' && form.cyrene_mydei && allForm[i].vendetta) {
                t.MEMO_SKILL_SCALING = _.map(t.MEMO_SKILL_SCALING, (item) => ({
                  ...item,
                  cd: calcScaling(1, 0.2, memo_skill, 'linear'),
                }))
              }
              // Castorice
              if (t.ID === '1407' && form.cyrene_cas) {
                t.MEMO_TALENT_SCALING = _.map(t.MEMO_TALENT_SCALING, (item) => {
                  if (item.property !== TalentProperty.SERVANT) return item
                  return {
                    ...item,
                    value: _.map(item.value, (v) => ({
                      ...v,
                      scaling:
                        v.scaling +
                        (form.cyrene_cas_count
                          ? calcScaling(0.0036, 0.000072, memo_skill, 'linear')
                          : calcScaling(0.0012, 0.000024, memo_skill, 'linear')) *
                          form.cyrene_cas,
                    })),
                  }
                })
              }
              // Anaxa
              if (t.ID === '1405' && form.cyrene_anaxa) {
                const total = _.find(t.SKILL_SCALING, (item) => item.name === 'Total Single Target DMG')
                total.multiplier = (total.multiplier / 5) * 8
              }
              if (_.includes(teamId, '1405') && t.PATH === PathType.ERUDITION && form.cyrene_anaxa) {
                t.SKILL_DMG.push({
                  name: `True Knowledge`,
                  source: 'Cyrene',
                  value: calcScaling(0.2, 0.04, memo_skill, 'linear'),
                })
                t[Stats.P_ATK].push({
                  name: `True Knowledge`,
                  source: 'Cyrene',
                  value: calcScaling(0.3, 0.06, memo_skill, 'linear'),
                })
              }
              // Hyacine (Not Sure About Wording)
              // Cipher
              if (t.ID === '1406' && form.cyrene_cipher !== 'none') {
                t[Stats.ALL_DMG].push({
                  name: `Ode to Trickery`,
                  source: 'Cyrene',
                  value: calcScaling(0.18, 0.036, memo_skill, 'linear'),
                })
                addDebuff(debuffs, DebuffTypes.DEF_RED)
              }
              if (_.includes(teamId, '1406') && form.cyrene_cipher !== 'none') {
                t.DEF_REDUCTION.push({
                  name: `Ode to Trickery`,
                  source: 'Cyrene',
                  value:
                    form.cyrene_cipher === 'patron'
                      ? calcScaling(0.1, 0.02, memo_skill, 'linear')
                      : calcScaling(0.06, 0.012, memo_skill, 'linear'),
                })
              }
              // Phainon
              if (t.ID === '1408' && form.cyrene_phainon && allForm[i].phainon_transform) {
                t[Stats.CRIT_RATE].push({
                  name: `Eternal Ignition`,
                  source: 'Cyrene',
                  value: calcScaling(0.08, 0.016, memo_skill, 'linear'),
                })
                if (form.phainon_excess_coreflame) {
                  t[Stats.CRIT_DMG].push({
                    name: `Ode to Worldbearing`,
                    source: 'Cyrene',
                    value: calcScaling(0.06, 0.012, memo_skill, 'linear') * form.phainon_excess_coreflame,
                  })
                }
              }
              // Cerydra
              if (t.ID === '1412' && form.cyrene_cerydra) {
                const meritIndex = +allForm[i].military_merit - 1
                all[meritIndex][Stats.CRIT_DMG].push({
                  name: `Ode to Law`,
                  source: meritIndex === index ? 'Self' : 'Cyrene',
                  value: calcScaling(0.15, 0.03, memo_skill, 'linear'),
                })
              }
              // Evernight
              if (_.includes(teamId, '1413') && form.cyrene_evernight && allForm[i].memoria >= 16) {
                t.MEMO_SKILL_SCALING = _.map(t.MEMO_SKILL_SCALING, (item) => ({
                  ...item,
                  bonus: calcScaling(0.09, 0.018, memo_skill, 'linear'),
                }))
              }
              // Terravox
              if (t.ID === '1414' && form.cyrene_dhpt) {
                const bondmateIndex = +allForm[i].bondmate - 1
                all[bondmateIndex][Stats.ALL_DMG].push({
                  name: `Ode to Earth`,
                  source: bondmateIndex === index ? 'Self' : 'Cyrene',
                  value: calcScaling(0.12, 0.024, memo_skill, 'linear'),
                })
                all[_.findIndex(teamId, (item) => item === '1414')]?.ULT_SCALING.push({
                  name: `Ode - Bondmate Additional DMG`,
                  property: TalentProperty.ADD,
                  element: t.ELEMENT,
                  type: TalentType.NONE,
                  value: [
                    {
                      scaling: calcScaling(0.4, 0.08, memo_skill, 'linear'),
                      multiplier: Stats.DEF,
                      override: form.cyrene_dhpt_shield,
                    },
                  ],
                  sum: true,
                })
                t.TALENT_SCALING.push(
                  ..._.map(t.TALENT_SCALING, (item) => ({
                    ...item,
                    name: `Ode - ${item.name}`,
                    multiplier: 1.5,
                  }))
                )
              }
            })
          }
          return all
        })
      }
      const spd = x.getSpd()

      if (a.a6 && spd >= 180) {
        _.forEach(all, (t) => {
          t[Stats.ALL_DMG].push({
            name: `Ascension 6 Passive`,
            source: 'Self',
            value: 0.2,
          })
          if (t.SUMMON_STATS) {
            t.SUMMON_STATS[Stats.ALL_DMG].push({
              name: `Ascension 6 Passive`,
              source: 'Cyrene',
              value: 0.2,
            })
          }
        })
        x.ICE_RES_PEN.push({
          name: `Ascension 6 Passive`,
          source: 'Self',
          value: _.min([spd - 180, 60]) / 50,
          multiplier: 0.02,
          base: _.min([spd - 180, 60]),
        })
        x.SUMMON_STATS.ICE_RES_PEN.push({
          name: `Ascension 6 Passive`,
          source: 'Cyrene',
          value: _.min([spd - 180, 60]) / 50,
          multiplier: 0.02,
          base: _.min([spd - 180, 60]),
        })
      }

      return x
    },
  }
}

export default Cyrene
