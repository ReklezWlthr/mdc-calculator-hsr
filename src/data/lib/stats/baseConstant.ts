import { DebuffTypes, IScaling } from '@src/domain/conditional'
import { Element, Stats, TalentProperty, PathType, TalentType } from '@src/domain/constant'
import _ from 'lodash'

export interface StatsArray {
  name: string
  source: string
  value: number
  base?: string | number
  multiplier?: number
  flat?: number | string
}

export const baseStatsObject = {
  // Base Stats
  BASE_ATK_C: 0,
  BASE_HP_C: 0,
  BASE_DEF_C: 0,

  BASE_ATK_L: 0,
  BASE_HP_L: 0,
  BASE_DEF_L: 0,

  BASE_ATK: 0,
  BASE_HP: 0,
  BASE_DEF: 0,
  BASE_SPD: 0,

  NAME: '',
  PATH: null as PathType,
  ELEMENT: null as Element,

  // Basic Stats
  [Stats.ATK]: [] as StatsArray[],
  [Stats.HP]: [] as StatsArray[],
  [Stats.DEF]: [] as StatsArray[],
  [Stats.P_ATK]: [] as StatsArray[],
  [Stats.P_HP]: [] as StatsArray[],
  [Stats.P_DEF]: [] as StatsArray[],
  [Stats.CRIT_RATE]: [{ name: 'Base Value', source: 'Self', value: 0.05 }] as StatsArray[],
  [Stats.CRIT_DMG]: [{ name: 'Base Value', source: 'Self', value: 0.5 }] as StatsArray[],
  [Stats.BE]: [] as StatsArray[],
  [Stats.ERR]: [{ name: 'Base Value', source: 'Self', value: 1 }] as StatsArray[],
  [Stats.HEAL]: [] as StatsArray[],
  [Stats.SPD]: [] as StatsArray[],
  [Stats.P_SPD]: [] as StatsArray[],
  [Stats.EHR]: [] as StatsArray[],
  [Stats.E_RES]: [] as StatsArray[],

  X_HP: [] as StatsArray[], // For Fu Xuan and Lynx
  X_CRIT_DMG: [] as StatsArray[], // For Sparkle and Bronya, will not be used recursively
  X_ATK: [] as StatsArray[], // For Robin

  // DMG Bonuses
  [Stats.PHYSICAL_DMG]: [] as StatsArray[],
  [Stats.FIRE_DMG]: [] as StatsArray[],
  [Stats.ICE_DMG]: [] as StatsArray[],
  [Stats.LIGHTNING_DMG]: [] as StatsArray[],
  [Stats.QUANTUM_DMG]: [] as StatsArray[],
  [Stats.IMAGINARY_DMG]: [] as StatsArray[],
  [Stats.WIND_DMG]: [] as StatsArray[],
  [Stats.ALL_DMG]: [] as StatsArray[],

  SKILL_HEAL: [] as StatsArray[],
  ULT_HEAL: [] as StatsArray[],

  // Hidden Stats
  DEF_PEN: [] as StatsArray[],
  SHIELD: [] as StatsArray[],
  BREAK_EFF: [] as StatsArray[],
  I_HEAL: [] as StatsArray[],
  
  SUMMON_DEF_PEN: [] as StatsArray[],
  
  //DEBUFFS
  ATK_REDUCTION: [] as StatsArray[],
  DEF_REDUCTION: [] as StatsArray[],
  SPD_REDUCTION: [] as StatsArray[],
  E_RES_RED: [] as StatsArray[],
  EHR_RED: [] as StatsArray[],
  VULNERABILITY: [] as StatsArray[],
  WEAKEN: [] as StatsArray[],

  FIRE_VUL: [] as StatsArray[],
  BREAK_VUL: [] as StatsArray[],
  DOT_VUL: [] as StatsArray[],
  FUA_VUL: [] as StatsArray[],
  ULT_VUL: [] as StatsArray[],
  ULT_RES_PEN: [] as StatsArray[],

  // RES PEN
  ALL_TYPE_RES_PEN: [] as StatsArray[],
  PHYSICAL_RES_PEN: [] as StatsArray[],
  FIRE_RES_PEN: [] as StatsArray[],
  ICE_RES_PEN: [] as StatsArray[],
  LIGHTNING_RES_PEN: [] as StatsArray[],
  WIND_RES_PEN: [] as StatsArray[],
  QUANTUM_RES_PEN: [] as StatsArray[],
  IMAGINARY_RES_PEN: [] as StatsArray[],

  ALL_TYPE_RES_RED: [] as StatsArray[],
  PHYSICAL_RES_RED: [] as StatsArray[],
  FIRE_RES_RED: [] as StatsArray[],
  ICE_RES_RED: [] as StatsArray[],
  LIGHTNING_RES_RED: [] as StatsArray[],
  WIND_RES_RED: [] as StatsArray[],
  QUANTUM_RES_RED: [] as StatsArray[],
  IMAGINARY_RES_RED: [] as StatsArray[],

  // RES
  ALL_TYPE_RES: [] as StatsArray[],

  // Talent Boosts
  BASIC_DMG: [] as StatsArray[],
  SKILL_DMG: [] as StatsArray[],
  ULT_DMG: [] as StatsArray[],
  TALENT_DMG: [] as StatsArray[],
  TECHNIQUE_DMG: [] as StatsArray[],
  DOT_DMG: [] as StatsArray[],
  FUA_DMG: [] as StatsArray[],
  ADD_DMG: [] as StatsArray[],
  SERVANT_DMG: [] as StatsArray[],

  BASIC_F_DMG: [] as StatsArray[],
  SKILL_F_DMG: [] as StatsArray[],
  ULT_F_DMG: [] as StatsArray[],

  BASIC_CR: [] as StatsArray[],
  SKILL_CR: [] as StatsArray[],
  ULT_CR: [] as StatsArray[],
  DOT_CR: [] as StatsArray[],
  FUA_CR: [] as StatsArray[],

  BASIC_CD: [] as StatsArray[],
  SKILL_CD: [] as StatsArray[],
  ULT_CD: [] as StatsArray[],
  DOT_CD: [] as StatsArray[],
  FUA_CD: [] as StatsArray[],
  ADD_CD: [] as StatsArray[],

  BASIC_DEF_PEN: [] as StatsArray[],
  SKILL_DEF_PEN: [] as StatsArray[],
  ULT_DEF_PEN: [] as StatsArray[],
  DOT_DEF_PEN: [] as StatsArray[],
  FUA_DEF_PEN: [] as StatsArray[],
  BREAK_DEF_PEN: [] as StatsArray[],
  SUPER_BREAK_DEF_PEN: [] as StatsArray[],

  BREAK_DMG: [] as StatsArray[],
  SUPER_BREAK_DMG: [] as StatsArray[],

  SUPER_BREAK_MULT: [] as StatsArray[],
  BASIC_SUPER_BREAK: [] as StatsArray[],

  // Mitigation
  DMG_REDUCTION: [] as StatsArray[],
  AGGRO: [] as StatsArray[],
  BASE_AGGRO: [] as StatsArray[],

  MAX_ENERGY: 0,
  SUMMON: false,

  // Multipliers
  BASIC_SCALING: [] as IScaling[],
  SKILL_SCALING: [] as IScaling[],
  ULT_SCALING: [] as IScaling[],
  TALENT_SCALING: [] as IScaling[],
  TECHNIQUE_SCALING: [] as IScaling[],

  ADD_DEBUFF: [] as Omit<StatsArray, 'value'>[],

  DOT_SCALING: [] as IScaling[],
  WIND_SHEAR_STACK: 0,

  getAtk: function (exclude?: boolean) {
    return (
      this.BASE_ATK * (1 + _.sumBy(this[Stats.P_ATK], 'value')) +
      _.sumBy(this[Stats.ATK], 'value') +
      (exclude ? 0 : this.getValue('X_ATK'))
    )
  },
  getHP: function (exclude?: boolean) {
    return (
      this.BASE_HP * (1 + _.sumBy(this[Stats.P_HP], 'value')) +
      _.sumBy(this[Stats.HP], 'value') +
      (exclude ? 0 : this.getValue('X_HP'))
    )
  },
  getDef: function () {
    return this.BASE_DEF * (1 + _.sumBy(this[Stats.P_DEF], 'value')) + _.sumBy(this[Stats.DEF], 'value')
  },
  getSpd: function () {
    return this.BASE_SPD * (1 + _.sumBy(this[Stats.P_SPD], 'value')) + _.sumBy(this[Stats.SPD], 'value')
  },
  getValue: function (key: string, exclude?: StatsArray[]) {
    return _.sumBy(
      _.size(exclude)
        ? _.filter(this[key], (item) => _.every(exclude, (e) => !(e.source === item.source && e.name === item.name)))
        : this[key],
      'value'
    )
  },
  getDmgRed: function () {
    return _.min([1 - _.reduce(this.DMG_REDUCTION, (acc, curr) => acc * (1 - curr.value), 1), 0.99])
  },

  CALLBACK: [] as ((
    base: any,
    debuffs: { type: DebuffTypes; count: number }[],
    weakness: Element[],
    all: any[],
    battle: boolean
  ) => any)[],

  BA_ALT: false,
  SKILL_ALT: false,
  ULT_ALT: false,
  TALENT_ALT: false,

  SUPER_BREAK: false,

  COUNTDOWN: 0,
  EXTRA_C_TURN: 0,
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
  [TalentProperty.BREAK_DOT]: 'DOT',
  [TalentProperty.SUPER_BREAK]: 'SUPER_BREAK',
  [TalentProperty.FUA]: 'FUA',
}

export type StatsObject = typeof baseStatsObject
export type StatsObjectKeysT = keyof typeof baseStatsObject

export const StatsObjectKeys = _.mapValues(baseStatsObject, (_, key) => key)
