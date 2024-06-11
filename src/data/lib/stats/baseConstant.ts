import { DebuffTypes, IScaling } from '@src/domain/conditional'
import { Element, Stats, TalentProperty, PathType, TalentType } from '@src/domain/constant'
import _ from 'lodash'

export const baseStatsObject = {
  // Base Stats
  BASE_ATK: 0,
  BASE_HP: 0,
  BASE_DEF: 0,
  BASE_SPD: 0,

  // Basic Stats
  [Stats.ATK]: 0,
  [Stats.HP]: 0,
  [Stats.DEF]: 0,
  [Stats.P_ATK]: 0,
  [Stats.P_HP]: 0,
  [Stats.P_DEF]: 0,
  [Stats.CRIT_RATE]: 0.05,
  [Stats.CRIT_DMG]: 0.5,
  [Stats.BE]: 0,
  [Stats.ERR]: 1,
  [Stats.HEAL]: 0,
  [Stats.SPD]: 0,
  [Stats.P_SPD]: 0,
  [Stats.EHR]: 0,
  [Stats.E_RES]: 0,

  X_HP: 0, // For Fu Xuan and Lynx
  X_CRIT_DMG: 0, // For Sparkle and Bronya, will not be used recursively

  // DMG Bonuses
  [Stats.PHYSICAL_DMG]: 0,
  [Stats.FIRE_DMG]: 0,
  [Stats.ICE_DMG]: 0,
  [Stats.LIGHTNING_DMG]: 0,
  [Stats.QUANTUM_DMG]: 0,
  [Stats.IMAGINARY_DMG]: 0,
  [Stats.WIND_DMG]: 0,
  [Stats.ALL_DMG]: 0,

  // Hidden Stats
  DEF_PEN: 0,
  SHIELD: 0,
  BREAK_EFF: 0,

  //DEBUFFS
  ATK_REDUCTION: 0,
  DEF_REDUCTION: 0,
  SPD_REDUCTION: 0,
  E_RES_RED: 0,
  VULNERABILITY: 0,
  WEAKEN: 0,

  FIRE_VUL: 0,
  BREAK_VUL: 0,
  DOT_VUL: 0,
  ULT_VUL: 0,
  ULT_RES_PEN: 0,

  // RES PEN
  ALL_TYPE_RES_PEN: 0,
  PHYSICAL_RES_PEN: 0,
  FIRE_RES_PEN: 0,
  ICE_RES_PEN: 0,
  LIGHTNING_RES_PEN: 0,
  WIND_RES_PEN: 0,
  QUANTUM_RES_PEN: 0,
  IMAGINARY_RES_PEN: 0,

  // RES
  ALL_TYPE_RES: 0,

  // Talent Boosts
  BASIC_DMG: 0,
  SKILL_DMG: 0,
  ULT_DMG: 0,
  TALENT_DMG: 0,
  TECHNIQUE_DMG: 0,
  DOT_DMG: 0,
  FUA_DMG: 0,

  BASIC_F_DMG: 0,
  SKILL_F_DMG: 0,
  ULT_F_DMG: 0,

  BASIC_CR: 0,
  SKILL_CR: 0,
  ULT_CR: 0,
  DOT_CR: 0,
  FUA_CR: 0,

  BASIC_CD: 0,
  SKILL_CD: 0,
  ULT_CD: 0,
  DOT_CD: 0,
  FUA_CD: 0,

  BASIC_DEF_PEN: 0,
  SKILL_DEF_PEN: 0,
  ULT_DEF_PEN: 0,
  DOT_DEF_PEN: 0,
  FUA_DEF_PEN: 0,
  BREAK_DEF_PEN: 0,
  SUPER_BREAK_DEF_PEN: 0,

  BREAK_DMG: 0,
  SUPER_BREAK_DMG: 0,

  // Mitigation
  DMG_REDUCTION: [],
  AGGRO: 0,
  BASE_AGGRO: 0,

  MAX_ENERGY: 0,

  // Multipliers
  BASIC_SCALING: [] as IScaling[],
  SKILL_SCALING: [] as IScaling[],
  ULT_SCALING: [] as IScaling[],
  TALENT_SCALING: [] as IScaling[],
  TECHNIQUE_SCALING: [] as IScaling[],

  DOT_SCALING: [] as IScaling[],

  getAtk: function () {
    return this.BASE_ATK * (1 + this[Stats.P_ATK]) + this[Stats.ATK]
  },
  getHP: function () {
    return this.BASE_HP * (1 + this[Stats.P_HP]) + this[Stats.HP]
  },
  getDef: function () {
    return this.BASE_DEF * (1 + this[Stats.P_DEF]) + this[Stats.DEF]
  },
  getSpd: function () {
    return this.BASE_SPD * (1 + this[Stats.P_SPD]) + this[Stats.SPD]
  },

  CALLBACK: [] as ((
    base: any,
    debuffs: { type: DebuffTypes; count: number }[],
    weakness: Element[],
    all: any[]
  ) => any)[],

  BA_ALT: false,
  SKILL_ALT: false,
  ULT_ALT: false,
  TALENT_ALT: false,
}

export const TalentTypeMap = {
  [TalentType.BA]: 'BASIC',
  [TalentType.SKILL]: 'SKILL',
  [TalentType.ULT]: 'ULT',
  [TalentType.TALENT]: 'TALENT',
  [TalentType.TECH]: 'TECHNIQUE',
}

export const TalentPropertyMap = {
  [TalentProperty.BREAK]: 'BREAK',
  [TalentProperty.DOT]: 'DOT',
  [TalentProperty.SUPER_BREAK]: 'SUPER_BREAK',
  [TalentProperty.FUA]: 'FUA',
}

export type StatsObject = typeof baseStatsObject
export type StatsObjectKeysT = keyof typeof baseStatsObject

export const StatsObjectKeys = _.mapValues(baseStatsObject, (_, key) => key)
