import { StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { DebuffTypes } from './conditional'

export enum HsrPage {
  TEAM = 'team',
  DMG = 'dmg',
  COMPARE = 'compare',
  IMPORT = 'import',
  BUILD = 'build',
  INVENTORY = 'inventory',
  CHAR = 'char',
}

export interface ICharacterStats {
  baseAtk: number
  baseHp: number
  baseDef: number
  ascAtk: number
  ascHp: number
  ascDef: number
  ascStat: string
}

export interface ICharacter {
  id: string
  name: string
  weapon: PathType
  element: Element
  rarity: number
  stat: ICharacterStats
}

export interface ITalentLevel {
  basic: number
  skill: number
  ult: number
  talent: number
}

export interface ICharStoreBase {
  level: number
  ascension: number
  cons: number
  cId: string
  talents: ITalentLevel
  minor_traces: { stat: Stats; value: number; toggled: boolean }[]
  major_traces: {
    a2: boolean
    a4: boolean
    a6: boolean
  }
}

export interface ICharStore extends ICharStoreBase {
  // id: string
}

export interface ITeamChar extends ICharStoreBase {
  equipments: { weapon: IWeaponEquip; artifacts: string[] }
}

export interface IBuild {
  id: string
  name: string
  note?: string
  cId: string
  isDefault: boolean
  weapon: IWeaponEquip
  artifacts: string[]
}

export interface IArtifact {
  id: string
  name: string
  icon: string
  bonus: { stat: Stats; value: number }[]
  bonusAdd: { stat: Stats; value: number }[]
  half?: (conditionals: StatsObject, all: StatsObject[]) => StatsObject
  add?: (conditionals: StatsObject) => StatsObject
  desc: string[]
  set?: string[]
  beta?: boolean
}

export interface IArtifactEquip {
  id: string
  setId: string
  level: number
  type: number
  main: Stats
  quality: number
  subList: { stat: Stats; value: number }[]
}

export interface IWeapon {
  name: string
  rarity: number
  tier: number
  ascStat: string
  baseStat: number
  icon: string
  type: string
}

export interface IWeaponEquip {
  level: number
  ascension: number
  refinement: number
  wId: string
}

export enum PathType {
  PRESERVATION = 'Preservation',
  HUNT = 'The Hunt',
  ERUDITION = 'Erudition',
  ABUNDANCE = 'Abundance',
  DESTRUCTION = 'Destruction',
  HARMONY = 'Harmony',
  NIHILITY = 'Nihility',
  REMEMBRANCE = 'Remembrance',
}

export const PathMap = {
  [PathType.PRESERVATION]: '/knight.webp',
  [PathType.HUNT]: '/rogue.webp',
  [PathType.ERUDITION]: '/mage.webp',
  [PathType.ABUNDANCE]: '/priest.webp',
  [PathType.DESTRUCTION]: '/warrior.webp',
  [PathType.HARMONY]: '/shaman.webp',
  [PathType.NIHILITY]: '/warlock.webp',
  [PathType.REMEMBRANCE]: '/memory.webp',
}

export const BaseAggro = {
  [PathType.PRESERVATION]: 6,
  [PathType.HUNT]: 3,
  [PathType.ERUDITION]: 3,
  [PathType.ABUNDANCE]: 4,
  [PathType.DESTRUCTION]: 5,
  [PathType.HARMONY]: 4,
  [PathType.NIHILITY]: 4,
}

export enum TalentType {
  BA = 'Basic ATK',
  SKILL = 'Skill',
  ULT = 'Ultimate',
  TECH = 'Technique',
  TALENT = 'Talent',
  SERVANT = 'Memosprite',
  NONE = 'None',
}

export enum TalentProperty {
  NORMAL = 'Normal DMG',
  HEAL = 'Heal',
  SHIELD = 'Shield',
  ADD = 'Additional DMG',
  BREAK = 'Break DMG',
  SUPER_BREAK = 'Super Break DMG',
  SERVANT = 'Memosprite DMG',
  DOT = 'DoT',
  BREAK_DOT = 'Break DoT',
  FUA = 'Follow-Up DMG',
  FROZEN = 'Frozen',
  ENTANGLE = 'Entanglement',
  PURE = 'Pure DMG',
  TRUE = 'True DMG',
}

export enum Element {
  PHYSICAL = 'Physical',
  FIRE = 'Fire',
  ICE = 'Ice',
  LIGHTNING = 'Lightning',
  WIND = 'Wind',
  QUANTUM = 'Quantum',
  IMAGINARY = 'Imaginary',
  NONE = 'None',
}

export enum Stats {
  HP = 'HP',
  ATK = 'ATK',
  DEF = 'DEF',
  P_HP = 'HP%',
  P_ATK = 'ATK%',
  P_DEF = 'DEF%',
  SPD = 'SPD',
  P_SPD = 'SPD%',
  CRIT_RATE = 'CRIT Rate',
  CRIT_DMG = 'CRIT DMG',
  ERR = 'Energy Regen Rate',
  BE = 'Break Effect',
  EHR = 'Effect Hit Rate',
  E_RES = 'Effect RES',
  PHYSICAL_DMG = 'Physical DMG%',
  FIRE_DMG = 'Fire DMG%',
  ICE_DMG = 'Ice DMG%',
  LIGHTNING_DMG = 'Lightning DMG%',
  WIND_DMG = 'Wind DMG%',
  QUANTUM_DMG = 'Quantum DMG%',
  IMAGINARY_DMG = 'Imaginary DMG%',
  HEAL = 'Outgoing Healing',
  ALL_DMG = 'DMG%',
  // Enemy
  EHP = 'Enemy HP',
}

export const StatIcons = {
  [Stats.P_HP]: 'IconMaxHP.png',
  [Stats.P_ATK]: 'IconAttack.png',
  [Stats.P_DEF]: 'IconDefence.png',
  [Stats.SPD]: 'IconSpeed.png',
  [Stats.P_SPD]: 'IconSpeed.png',
  [Stats.ATK]: 'IconAttack.png',
  [Stats.HP]: 'IconMaxHP.png',
  [Stats.DEF]: 'IconDefence.png',
  [Stats.CRIT_RATE]: 'IconCriticalChance.png',
  [Stats.CRIT_DMG]: 'IconCriticalDamage.png',
  [Stats.HEAL]: 'IconHealRatio.png',
  [Stats.BE]: 'IconBreakUp.png',
  [Stats.E_RES]: 'IconStatusResistance.png',
  [Stats.PHYSICAL_DMG]: 'IconPhysicalAddedRatio.png',
  [Stats.FIRE_DMG]: 'IconFireAddedRatio.png',
  [Stats.ICE_DMG]: 'IconIceAddedRatio.png',
  [Stats.LIGHTNING_DMG]: 'IconThunderAddedRatio.png',
  [Stats.WIND_DMG]: 'IconWindAddedRatio.png',
  [Stats.QUANTUM_DMG]: 'IconQuantumAddedRatio.png',
  [Stats.IMAGINARY_DMG]: 'IconImaginaryAddedRatio.png',
  [Stats.ERR]: 'IconEnergyRecovery.png',
  [Stats.EHR]: 'IconStatusProbability.png',
  [Stats.EHP]: 'IconMaxHP.png',
}

export const DebuffIcon = {
  [DebuffTypes.FROZEN]: 'IconDotFrozen_B.png',
  [DebuffTypes.IMPRISON]: 'IconDotCage_B.png',
  [DebuffTypes.ENTANGLE]: 'IconDotTangle_B.png',
  [DebuffTypes.BURN]: 'IconDotBurn_B.png',
  [DebuffTypes.WIND_SHEAR]: 'IconDotPoison_B.png',
  [DebuffTypes.SHOCKED]: 'IconDotElectric_B.png',
  [DebuffTypes.BLEED]: 'IconDotBleed_B.png',
  [DebuffTypes.CONTROL]: 'Icon1307Dot_B.png',
}

export const RelicPiece = Object.freeze({
  1: 'Head',
  2: 'Hands',
  3: 'Body',
  4: 'Foot',
  5: 'Planar Sphere',
  6: 'Link Rope',
})

export const RelicPieceIcon = Object.freeze({
  1: 'Head',
  2: 'Hands',
  3: 'Body',
  4: 'Foot',
  5: 'Neck',
  6: 'Goods',
})

export const AscensionOptions = [
  { name: 'A0', value: '0' },
  { name: 'A1', value: '1' },
  { name: 'A2', value: '2' },
  { name: 'A3', value: '3' },
  { name: 'A4', value: '4' },
  { name: 'A5', value: '5' },
  { name: 'A6', value: '6' },
].reverse()

export const EidolonOptions = [
  { name: 'E0', value: '0' },
  { name: 'E1', value: '1' },
  { name: 'E2', value: '2' },
  { name: 'E3', value: '3' },
  { name: 'E4', value: '4' },
  { name: 'E5', value: '5' },
  { name: 'E6', value: '6' },
]

export const SuperimposeOptions = [
  { name: 'S1', value: '1' },
  { name: 'S2', value: '2' },
  { name: 'S3', value: '3' },
  { name: 'S4', value: '4' },
  { name: 'S5', value: '5' },
]

export const MainStatOptions = [
  { name: Stats.P_HP, value: Stats.P_HP, img: StatIcons[Stats.P_HP] },
  { name: Stats.P_ATK, value: Stats.P_ATK, img: StatIcons[Stats.P_ATK] },
  { name: Stats.P_DEF, value: Stats.P_DEF, img: StatIcons[Stats.P_DEF] },
  { name: Stats.SPD, value: Stats.SPD, img: StatIcons[Stats.SPD] },
  { name: Stats.CRIT_RATE, value: Stats.CRIT_RATE, img: StatIcons[Stats.CRIT_RATE] },
  { name: Stats.CRIT_DMG, value: Stats.CRIT_DMG, img: StatIcons[Stats.CRIT_DMG] },
  { name: Stats.BE, value: Stats.BE, img: StatIcons[Stats.BE] },
  { name: Stats.HEAL, value: Stats.HEAL, img: StatIcons[Stats.HEAL] },
  { name: Stats.ERR, value: Stats.ERR, img: StatIcons[Stats.ERR] },
  { name: Stats.EHR, value: Stats.EHR, img: StatIcons[Stats.EHR] },
  { name: Stats.PHYSICAL_DMG, value: Stats.PHYSICAL_DMG, img: StatIcons[Stats.PHYSICAL_DMG] },
  { name: Stats.FIRE_DMG, value: Stats.FIRE_DMG, img: StatIcons[Stats.FIRE_DMG] },
  { name: Stats.ICE_DMG, value: Stats.ICE_DMG, img: StatIcons[Stats.ICE_DMG] },
  { name: Stats.LIGHTNING_DMG, value: Stats.LIGHTNING_DMG, img: StatIcons[Stats.LIGHTNING_DMG] },
  { name: Stats.WIND_DMG, value: Stats.WIND_DMG, img: StatIcons[Stats.WIND_DMG] },
  { name: Stats.QUANTUM_DMG, value: Stats.QUANTUM_DMG, img: StatIcons[Stats.QUANTUM_DMG] },
  { name: Stats.IMAGINARY_DMG, value: Stats.IMAGINARY_DMG, img: StatIcons[Stats.IMAGINARY_DMG] },
]

export const SubStatOptions = [
  { name: Stats.HP, value: Stats.HP, img: StatIcons[Stats.HP] },
  { name: Stats.P_HP, value: Stats.P_HP, img: StatIcons[Stats.P_HP] },
  { name: Stats.ATK, value: Stats.ATK, img: StatIcons[Stats.ATK] },
  { name: Stats.P_ATK, value: Stats.P_ATK, img: StatIcons[Stats.P_ATK] },
  { name: Stats.DEF, value: Stats.DEF, img: StatIcons[Stats.DEF] },
  { name: Stats.P_DEF, value: Stats.P_DEF, img: StatIcons[Stats.P_DEF] },
  { name: Stats.SPD, value: Stats.SPD, img: StatIcons[Stats.SPD] },
  { name: Stats.CRIT_RATE, value: Stats.CRIT_RATE, img: StatIcons[Stats.CRIT_RATE] },
  { name: Stats.CRIT_DMG, value: Stats.CRIT_DMG, img: StatIcons[Stats.CRIT_DMG] },
  { name: Stats.BE, value: Stats.BE, img: StatIcons[Stats.BE] },
  { name: Stats.EHR, value: Stats.EHR, img: StatIcons[Stats.EHR] },
  { name: Stats.E_RES, value: Stats.E_RES, img: StatIcons[Stats.E_RES] },
]

export const PropMap = {
  level: 4001,
  ascension: 1002,
}

export const EnkaStatsMap = {
  HPDelta: Stats.HP,
  AttackDelta: Stats.ATK,
  DefenceDelta: Stats.DEF,
  HPAddedRatio: Stats.P_HP,
  AttackAddedRatio: Stats.P_ATK,
  DefenceAddedRatio: Stats.P_DEF,
  CriticalChance: Stats.CRIT_RATE,
  CriticalChanceBase: Stats.CRIT_RATE,
  CriticalDamage: Stats.CRIT_DMG,
  CriticalDamageBase: Stats.CRIT_DMG,
  SPRatioBase: Stats.ERR,
  HealRatioBase: Stats.HEAL,
  StatusProbability: Stats.EHR,
  StatusProbabilityBase: Stats.EHR,
  SpeedDelta: Stats.SPD,
  StatusResistance: Stats.E_RES,
  BreakDamageAddedRatio: Stats.BE,
  BreakDamageAddedRatioBase: Stats.BE,
  PhysicalAddedRatio: Stats.PHYSICAL_DMG,
  FireAddedRatio: Stats.FIRE_DMG,
  ThunderAddedRatio: Stats.LIGHTNING_DMG,
  WindAddedRatio: Stats.WIND_DMG,
  IceAddedRatio: Stats.ICE_DMG,
  QuantumAddedRatio: Stats.QUANTUM_DMG,
  ImaginaryAddedRatio: Stats.IMAGINARY_DMG,
}

export const ScannerStatsMap = {
  HP: Stats.HP,
  ATK: Stats.ATK,
  DEF: Stats.DEF,
  HP_: Stats.P_HP,
  ATK_: Stats.P_ATK,
  DEF_: Stats.P_DEF,
  'CRIT Rate': Stats.CRIT_RATE,
  'CRIT Rate_': Stats.CRIT_RATE,
  'CRIT DMG': Stats.CRIT_DMG,
  'CRIT DMG_': Stats.CRIT_DMG,
  'Energy Regeneration Rate': Stats.ERR,
  'Outgoing Healing Boost': Stats.HEAL,
  'Effect Hit Rate': Stats.EHR,
  'Effect Hit Rate_': Stats.EHR,
  SPD: Stats.SPD,
  'Effect RES_': Stats.E_RES,
  'Break Effect': Stats.BE,
  'Break Effect_': Stats.BE,
  'Physical DMG Boost': Stats.PHYSICAL_DMG,
  'Fire DMG Boost': Stats.FIRE_DMG,
  'Lightning DMG Boost': Stats.LIGHTNING_DMG,
  'Wind DMG Boost': Stats.WIND_DMG,
  'Ice DMG Boost': Stats.ICE_DMG,
  'Quantum DMG Boost': Stats.QUANTUM_DMG,
  'Imaginary DMG Boost': Stats.IMAGINARY_DMG,
}

export const ScannerArtifactTypeMap = {
  Hands: 2,
  Head: 1,
  Body: 3,
  Feet: 4,
  'Link Rope': 6,
  'Planar Sphere': 5,
}

export const CustomConditionalMap = {
  ALL_TYPE_RES_PEN: 'All-Type RES PEN',
  ALL_TYPE_DEF_PEN: 'All-Type DEF PEN',
  BREAK_EFF: 'Weakness Break Efficiency',
  SHIELD: 'Shield Bonus',
  DMG_REDUCTION: 'DMG Reduction',
  AGGRO: 'Percentage Aggro Bonus',

  PHYSICAL_RES_PEN: 'Physical RES PEN',
  FIRE_RES_PEN: 'Fire RES PEN',
  ICE_RES_PEN: 'Icd RES PEN',
  WIND_RES_PEN: 'Wind RES PEN',
  LIGHTNING_RES_PEN: 'Lightning RES PEN',
  QUANTUM_RES_PEN: 'Quantum RES PEN',
  IMAGINARY_RES_PEN: 'Imaginary RES PEN',

  BASIC_CR: 'Basic Attack CRIT Rate',
  SKILL_CR: 'Skill CRIT Rate',
  ULT_CR: 'Ultimate CRIT Rate',
  TALENT_CR: 'Talent CRIT Rate',
  BASIC_CD: 'Basic Attack CRIT DMG',
  SKILL_CD: 'Skill CRIT DMG',
  ULT_CD: 'Ultimate CRIT DMG',
  TALENT_CD: 'Talent CRIT DMG',
  BASIC_DMG: 'Basic Attack DMG%',
  SKILL_DMG: 'Skill DMG%',
  ULT_DMG: 'Ultimate DMG%',
  TALENT_DMG: 'Talent DMG%',
  BASIC_DEF_PEN: 'Basic Attack DEF PEN',
  SKILL_DEF_PEN: 'Skill DEF PEN',
  ULT_DEF_PEN: 'Ultimate DEF PEN',
  TALENT_DEF_PEN: 'Talent DEF PEN',

  FUA_DMG: 'Follow-Up DMG%',
  DOT_DMG: 'DoT DMG%',
  BREAK_DMG: 'Break DMG%',
  SUPER_BREAK_DMG: 'Super Break DMG%',
  FUA_DEF_PEN: 'Follow-Up DEF PEN',
  DOT_DEF_PEN: 'DoT DEF PEN',
  BREAK_DEF_PEN: 'Break DEF PEN',
  SUPER_BREAK_DEF_PEN: 'Super Break DEF PEN',
  FUA_CR: 'Follow-Up CRIT Rate',
  FUA_CD: 'Follow-Up CRIT DMG',
}

export const BreakDebuffType = {
  [Element.PHYSICAL]: DebuffTypes.BLEED,
  [Element.FIRE]: DebuffTypes.BURN,
  [Element.ICE]: DebuffTypes.FROZEN,
  [Element.LIGHTNING]: DebuffTypes.SHOCKED,
  [Element.WIND]: DebuffTypes.WIND_SHEAR,
  [Element.QUANTUM]: DebuffTypes.ENTANGLE,
  [Element.IMAGINARY]: DebuffTypes.IMPRISON,
}

export const BreakPoints = [
  { value: Infinity, desc: 'Base SPD' },
  { value: 90, desc: '5 actions in the first 4 cycles' },
  { value: 87.5, desc: '4 actions in the first 3 cycles' },
  { value: 250 / 3, desc: '3 actions in the first 2 cycles' },
  { value: 75, desc: '2 actions in the first cycle' },
  { value: 70, desc: '5 actions in the first 3 cycles' },
  { value: 450 / 7, desc: '7 actions in the first 4 cycles' },
  { value: 62.5, desc: '4 actions in the first 2 cycles' },
  { value: 350 / 6, desc: '6 actions in the first 3 cycles' },
  { value: 56.25, desc: '8 actions in the first 4 cycles' },
  { value: 50, desc: '3 actions in the first cycle' },
]

export enum AbilityTag {
  ST = 'Single Target',
  BLAST = 'Blast',
  AOE = 'AoE',
  BOUNCE = 'Bounce',
  ENHANCE = 'Enhance',
  SUPPORT = 'Support',
  DEFENSE = 'Defense',
  IMPAIR = 'Impair',
  RESTORE = 'Restore',
}
