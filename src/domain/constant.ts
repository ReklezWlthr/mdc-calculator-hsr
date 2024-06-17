import { StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'

export enum GenshinPage {
  TEAM = 'team',
  DMG = 'dmg',
  ER = 'er',
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
  half?: (conditionals: StatsObject) => StatsObject
  add?: (conditionals: StatsObject, weapon: PathType, team: ITeamChar[]) => StatsObject
  desc: string[]
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
}

export const PathMap = {
  [PathType.PRESERVATION]: '/knight.webp',
  [PathType.HUNT]: '/rogue.webp',
  [PathType.ERUDITION]: '/mage.webp',
  [PathType.ABUNDANCE]: '/priest.webp',
  [PathType.DESTRUCTION]: '/warrior.webp',
  [PathType.HARMONY]: '/shaman.webp',
  [PathType.NIHILITY]: '/warlock.webp',
}

export const BaseAggro = {
  [PathType.PRESERVATION]: 150,
  [PathType.HUNT]: 75,
  [PathType.ERUDITION]: 75,
  [PathType.ABUNDANCE]: 100,
  [PathType.DESTRUCTION]: 125,
  [PathType.HARMONY]: 100,
  [PathType.NIHILITY]: 100,
}

export enum TalentType {
  BA = 'Basic Attack',
  SKILL = 'Skill',
  ULT = 'Ultimate',
  TECH = 'Technique',
  TALENT = 'Talent',
  NONE = 'None',
}

export enum TalentProperty {
  NORMAL = 'Normal',
  HEAL = 'Heal',
  SHIELD = 'Shield',
  ADD = 'Additional DMG',
  BREAK = 'Break DMG',
  SUPER_BREAK = 'Super Break DMG',
  DOT = 'DoT',
  FUA = 'Follow-Up DMG',
  FROZEN = 'Frozen',
  ENTANGLE = 'Entanglement',
  PURE = 'Pure DMG'
}

export enum Element {
  PHYSICAL = 'Physical',
  FIRE = 'Fire',
  ICE = 'Ice',
  LIGHTNING = 'Lightning',
  WIND = 'Wind',
  QUANTUM = 'Quantum',
  IMAGINARY = 'Imaginary',
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
  [Stats.HEAL]: 'IconHeal.png',
  [Stats.BE]: 'IconBreakUp.png',
  [Stats.E_RES]: 'IconStatusResistance.png',
  [Stats.PHYSICAL_DMG]: 'IconPhysicalAddedRatio.png',
  [Stats.FIRE_DMG]: 'IconFireAddedRatio.png',
  [Stats.ICE_DMG]: 'IconIceAddedRatio.png',
  [Stats.LIGHTNING_DMG]: 'IconThunderAddedRatio.png',
  [Stats.WIND_DMG]: 'IconWindAddedRatio.png',
  [Stats.QUANTUM_DMG]: 'IconQuantumAddedRatio.png',
  [Stats.IMAGINARY_DMG]: 'IconImaginaryAddedRatio.png',
  [Stats.ERR]: 'IconSPRatio.png',
  [Stats.EHR]: 'IconStatusProbability.png',
  [Stats.EHP]: 'IconMaxHP.png',
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
]

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
  // { name: Stats.P_ATK, value: Stats.P_ATK, img: '/icons/stat_p_atk.png' },
  // { name: Stats.P_HP, value: Stats.P_HP, img: '/icons/stat_p_hp.png' },
  // { name: Stats.P_DEF, value: Stats.P_DEF, img: '/icons/stat_p_def.png' },
  // { name: Stats.EM, value: Stats.EM, img: '/icons/stat_em.png' },
  // { name: Stats.ER, value: Stats.ER, img: '/icons/stat_er.png' },
  // { name: Stats.CRIT_RATE, value: Stats.CRIT_RATE, img: '/icons/stat_crit_rate.png' },
  // { name: Stats.CRIT_DMG, value: Stats.CRIT_DMG, img: '/icons/stat_crit_dmg.png' },
  // { name: Stats.PHYSICAL_DMG, value: Stats.PHYSICAL_DMG, img: '/icons/stat_physical.png' },
  // {
  //   name: Stats.ANEMO_DMG,
  //   value: Stats.ANEMO_DMG,
  //   img: 'https://cdn.wanderer.moe/genshin-impact/elements/anemo.png',
  // },
  // {
  //   name: Stats.PYRO_DMG,
  //   value: Stats.PYRO_DMG,
  //   img: 'https://cdn.wanderer.moe/genshin-impact/elements/pyro.png',
  // },
  // {
  //   name: Stats.HYDRO_DMG,
  //   value: Stats.HYDRO_DMG,
  //   img: 'https://cdn.wanderer.moe/genshin-impact/elements/hydro.png',
  // },
  // {
  //   name: Stats.CRYO_DMG,
  //   value: Stats.CRYO_DMG,
  //   img: 'https://cdn.wanderer.moe/genshin-impact/elements/cryo.png',
  // },
  // {
  //   name: Stats.ELECTRO_DMG,
  //   value: Stats.ELECTRO_DMG,
  //   img: 'https://cdn.wanderer.moe/genshin-impact/elements/electro.png',
  // },
  // {
  //   name: Stats.GEO_DMG,
  //   value: Stats.GEO_DMG,
  //   img: 'https://cdn.wanderer.moe/genshin-impact/elements/geo.png',
  // },
  // {
  //   name: Stats.DENDRO_DMG,
  //   value: Stats.DENDRO_DMG,
  //   img: 'https://cdn.wanderer.moe/genshin-impact/elements/dendro.png',
  // },
]

export const SubStatOptions = [
  // { name: Stats.ATK, value: Stats.ATK, img: '/icons/stat_atk.png' },
  // { name: Stats.HP, value: Stats.HP, img: '/icons/stat_hp.png' },
  // { name: Stats.DEF, value: Stats.DEF, img: '/icons/stat_def.png' },
  // { name: Stats.P_ATK, value: Stats.P_ATK, img: '/icons/stat_p_atk.png' },
  // { name: Stats.P_HP, value: Stats.P_HP, img: '/icons/stat_p_hp.png' },
  // { name: Stats.P_DEF, value: Stats.P_DEF, img: '/icons/stat_p_def.png' },
  // { name: Stats.EM, value: Stats.EM, img: '/icons/stat_em.png' },
  // { name: Stats.ER, value: Stats.ER, img: '/icons/stat_er.png' },
  // { name: Stats.CRIT_RATE, value: Stats.CRIT_RATE, img: '/icons/stat_crit_rate.png' },
  // { name: Stats.CRIT_DMG, value: Stats.CRIT_DMG, img: '/icons/stat_crit_dmg.png' },
]

export const PropMap = {
  level: 4001,
  ascension: 1002,
}

export const EnkaStatsMap = {
  // FIGHT_PROP_HP: Stats.HP,
  // FIGHT_PROP_ATTACK: Stats.ATK,
  // FIGHT_PROP_DEFENSE: Stats.DEF,
  // FIGHT_PROP_HP_PERCENT: Stats.P_HP,
  // FIGHT_PROP_ATTACK_PERCENT: Stats.P_ATK,
  // FIGHT_PROP_DEFENSE_PERCENT: Stats.P_DEF,
  // FIGHT_PROP_CRITICAL: Stats.CRIT_RATE,
  // FIGHT_PROP_CRITICAL_HURT: Stats.CRIT_DMG,
  // FIGHT_PROP_CHARGE_EFFICIENCY: Stats.ER,
  // FIGHT_PROP_HEAL_ADD: Stats.HEAL,
  // FIGHT_PROP_ELEMENT_MASTERY: Stats.EM,
  // FIGHT_PROP_PHYSICAL_ADD_HURT: Stats.PHYSICAL_DMG,
  // FIGHT_PROP_FIRE_ADD_HURT: Stats.FIRE_DMG,
  // FIGHT_PROP_ELEC_ADD_HURT: Stats.LIGHTNING_DMG,
  // FIGHT_PROP_WIND_ADD_HURT: Stats.WIND_DMG,
  // FIGHT_PROP_ICE_ADD_HURT: Stats.ICE_DMG,
  // FIGHT_PROP_ROCK_ADD_HURT: Stats.QUANTUM_DMG,
  // FIGHT_PROP_GRASS_ADD_HURT: Stats.IMAGINARY_DMG,
}

export const EnkaArtifactTypeMap = {
  EQUIP_BRACER: 4,
  EQUIP_NECKLACE: 2,
  EQUIP_SHOES: 5,
  EQUIP_RING: 1,
  EQUIP_DRESS: 3,
}

export const CustomConditionalMap = {
  MELT_DMG: 'Melt DMG%',
  VAPE_DMG: 'Vaporize DMG%',
  BURNING_DMG: 'Burning DMG%',
  BLOOM_DMG: 'Melt DMG%',
  HYPERBLOOM_DMG: 'Hyperbloom DMG%',
  BURGEON_DMG: 'Burgeon DMG%',
  SPREAD_DMG: 'Spread DMG%',
  AGGRAVATE_DMG: 'Aggravate DMG%',
  TASER_DMG: 'Electro-Charged DMG%',
  OVERLOAD_DMG: 'Overloaded DMG%',
  SHATTER_DMG: 'Shattered DMG%',
  SWIRL_DMG: 'Swirl DMG%',
  SUPERCONDUCT_DMG: 'Superconduct DMG%',
  PYRO_F_DMG: 'Pyro Flat DMG',
  CRYO_F_DMG: 'Cryo Flat DMG',
  HYDRO_F_DMG: 'Hydro Flat DMG',
  ELECTRO_F_DMG: 'Electro Flat DMG',
  ANEMO_F_DMG: 'Anemo Flat DMG',
  GEO_F_DMG: 'Geo Flat DMG',
  DENDRO_F_DMG: 'Dendro Flat DMG',
  BASIC_F_DMG: 'Normal Attack Flat DMG',
  CHARGE_F_DMG: 'Charged Attack Flat DMG',
  PLUNGE_F_DMG: 'Plunging Attack Flat DMG',
  SKILL_F_DMG: 'Elemental Skill Flat DMG',
  BURST_F_DMG: 'Elemental Burst Flat DMG',
  BASIC_CR: 'Normal Attack CRIT Rate',
  CHARGE_CR: 'Charged Attack CRIT Rate',
  PLUNGE_CR: 'Plunging Attack CRIT Rate',
  SKILL_CR: 'Elemental Skill CRIT Rate',
  BURST_CR: 'Elemental Burst CRIT Rate',
  BASIC_CD: 'Normal Attack CRIT DMG',
  CHARGE_CD: 'Charged Attack CRIT DMG',
  PLUNGE_CD: 'Plunging Attack CRIT DMG',
  SKILL_CD: 'Elemental Skill CRIT DMG',
  BURST_CD: 'Elemental Burst CRIT DMG',
  DEF_REDUCTION: 'DEF Reduction (%)',
  ALL_TYPE_RES_PEN: 'All Type RES Reduction',
  PHYSICAL_RES_PEN: 'Physical RES Reduction',
  PYRO_RES_PEN: 'Pyro RES Reduction',
  HYDRO_RES_PEN: 'Hydro RES Reduction',
  CRYO_RES_PEN: 'Cryo RES Reduction',
  ELECTRO_RES_PEN: 'Electro RES Reduction',
  ANEMO_RES_PEN: 'Anemo RES Reduction',
  GEO_RES_PEN: 'Geo RES Reduction',
  DENDRO_RES_PEN: 'Dendro RES Reduction',
}
