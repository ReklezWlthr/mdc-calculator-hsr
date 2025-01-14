import { StatsArray } from '@src/data/lib/stats/baseConstant'
import { Element, PathType, Stats } from './constant'
import { IScaling, DebuffTypes } from './conditional'

export interface RawBaseStatType {
  BASE_ATK_C: number
  BASE_HP_C: number
  BASE_DEF_C: number

  BASE_ATK_L: number
  BASE_HP_L: number
  BASE_DEF_L: number

  BASE_ATK: number
  BASE_HP: number
  BASE_DEF: number
  BASE_SPD: number

  NAME: string
  PATH: PathType
  ELEMENT: Element | null

  // Basic Stats
  [Stats.ATK]: StatsArray[]
  [Stats.HP]: StatsArray[]
  [Stats.DEF]: StatsArray[]
  [Stats.P_ATK]: StatsArray[]
  [Stats.P_HP]: StatsArray[]
  [Stats.P_DEF]: StatsArray[]
  [Stats.CRIT_RATE]: StatsArray[]
  [Stats.CRIT_DMG]: StatsArray[]
  [Stats.BE]: StatsArray[]
  [Stats.ERR]: StatsArray[]
  [Stats.HEAL]: StatsArray[]
  [Stats.SPD]: StatsArray[]
  [Stats.P_SPD]: StatsArray[]
  [Stats.EHR]: StatsArray[]
  [Stats.E_RES]: StatsArray[]

  X_HP: StatsArray[] // Fu Xuan and Lynx
  X_CRIT_DMG: StatsArray[] // Sparkle, Bronya, Sunday and Aventurine
  X_ATK: StatsArray[] // Robin, Aglaea

  // DMG Bonuses
  [Stats.PHYSICAL_DMG]: StatsArray[]
  [Stats.FIRE_DMG]: StatsArray[]
  [Stats.ICE_DMG]: StatsArray[]
  [Stats.LIGHTNING_DMG]: StatsArray[]
  [Stats.QUANTUM_DMG]: StatsArray[]
  [Stats.IMAGINARY_DMG]: StatsArray[]
  [Stats.WIND_DMG]: StatsArray[]
  [Stats.ALL_DMG]: StatsArray[]

  SKILL_HEAL: StatsArray[]
  ULT_HEAL: StatsArray[]

  // Hidden Stats
  DEF_PEN: StatsArray[]
  SHIELD: StatsArray[]
  BREAK_EFF: StatsArray[]
  I_HEAL: StatsArray[]

  SUMMON_DEF_PEN: StatsArray[]

  //DEBUFFS
  ATK_REDUCTION: StatsArray[]
  DEF_REDUCTION: StatsArray[]
  SPD_REDUCTION: StatsArray[]
  E_RES_RED: StatsArray[]
  EHR_RED: StatsArray[]
  VULNERABILITY: StatsArray[]
  WEAKEN: StatsArray[]

  FIRE_VUL: StatsArray[]
  BREAK_VUL: StatsArray[]
  DOT_VUL: StatsArray[]
  FUA_VUL: StatsArray[]
  ULT_VUL: StatsArray[]
  ULT_RES_PEN: StatsArray[]

  // RES PEN
  ALL_TYPE_RES_PEN: StatsArray[]
  PHYSICAL_RES_PEN: StatsArray[]
  FIRE_RES_PEN: StatsArray[]
  ICE_RES_PEN: StatsArray[]
  LIGHTNING_RES_PEN: StatsArray[]
  WIND_RES_PEN: StatsArray[]
  QUANTUM_RES_PEN: StatsArray[]
  IMAGINARY_RES_PEN: StatsArray[]

  ALL_TYPE_RES_RED: StatsArray[]
  PHYSICAL_RES_RED: StatsArray[]
  FIRE_RES_RED: StatsArray[]
  ICE_RES_RED: StatsArray[]
  LIGHTNING_RES_RED: StatsArray[]
  WIND_RES_RED: StatsArray[]
  QUANTUM_RES_RED: StatsArray[]
  IMAGINARY_RES_RED: StatsArray[]

  // RES
  ALL_TYPE_RES: StatsArray[]

  // Talent Boosts
  BASIC_DMG: StatsArray[]
  SKILL_DMG: StatsArray[]
  ULT_DMG: StatsArray[]
  TALENT_DMG: StatsArray[]
  TECHNIQUE_DMG: StatsArray[]
  DOT_DMG: StatsArray[]
  FUA_DMG: StatsArray[]
  ADD_DMG: StatsArray[]
  SUMMON_DMG: StatsArray[]

  BASIC_F_DMG: StatsArray[]
  SKILL_F_DMG: StatsArray[]
  ULT_F_DMG: StatsArray[]

  BASIC_CR: StatsArray[]
  SKILL_CR: StatsArray[]
  ULT_CR: StatsArray[]
  DOT_CR: StatsArray[]
  FUA_CR: StatsArray[]

  BASIC_CD: StatsArray[]
  SKILL_CD: StatsArray[]
  ULT_CD: StatsArray[]
  DOT_CD: StatsArray[]
  FUA_CD: StatsArray[]
  ADD_CD: StatsArray[]

  BASIC_DEF_PEN: StatsArray[]
  SKILL_DEF_PEN: StatsArray[]
  ULT_DEF_PEN: StatsArray[]
  DOT_DEF_PEN: StatsArray[]
  FUA_DEF_PEN: StatsArray[]
  BREAK_DEF_PEN: StatsArray[]
  SUPER_BREAK_DEF_PEN: StatsArray[]

  BREAK_DMG: StatsArray[]
  SUPER_BREAK_DMG: StatsArray[]

  SUPER_BREAK_MULT: StatsArray[]
  BREAK_MULT: StatsArray[]
  BASIC_SUPER_BREAK: StatsArray[]

  // Mitigation
  DMG_REDUCTION: StatsArray[]
  AGGRO: StatsArray[]
  BASE_AGGRO: StatsArray[]

  MAX_ENERGY: number
  SUMMON: false

  // Multipliers
  BASIC_SCALING: IScaling[]
  SKILL_SCALING: IScaling[]
  MEMO_SKILL_SCALING: IScaling[]
  ULT_SCALING: IScaling[]
  TALENT_SCALING: IScaling[]
  TECHNIQUE_SCALING: IScaling[]

  ADD_DEBUFF: Omit<StatsArray, 'value'>[]

  DOT_SCALING: IScaling[]
  WIND_SHEAR_STACK: number

  getAtk: (exclude?: boolean) => number
  getHP: (exclude?: boolean) => number
  getDef: () => number
  getSpd: () => number
  getValue: (key: string, exclude?: StatsArray[]) => number
  getDmgRed: () => number

  CALLBACK: ((
    base: BaseStatsType,
    debuffs: { type: DebuffTypes; count: number }[],
    weakness: Element[],
    all: BaseStatsType[],
    battle: boolean
  ) => any)[]

  BA_ALT: boolean
  SKILL_ALT: boolean
  ULT_ALT: boolean
  TALENT_ALT: boolean

  GODSLAYER: boolean // Only used by Mydei

  SUPER_BREAK: boolean

  COUNTDOWN: number
  EXTRA_C_TURN: number

  SUMMON_ID: string
}

export interface BaseStatsType extends RawBaseStatType {
  SUMMON_STATS?: RawBaseStatType
}
