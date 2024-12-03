import { DebuffTypes, IScaling } from '@src/domain/conditional'
import { Element, Stats, TalentProperty, PathType, TalentType } from '@src/domain/constant'
import { BaseStatsType } from '@src/domain/stats'
import _ from 'lodash'

export interface StatsArray {
  name: string
  source: string
  value: number
  base?: string | number
  multiplier?: number
  flat?: number | string
  excludeSummon?: boolean
}

export const baseStatsObject: BaseStatsType = {
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
  PATH: null,
  ELEMENT: null,

  SUMMON_STATS: null,

  // Basic Stats
  [Stats.ATK]: [],
  [Stats.HP]: [],
  [Stats.DEF]: [],
  [Stats.P_ATK]: [],
  [Stats.P_HP]: [],
  [Stats.P_DEF]: [],
  [Stats.CRIT_RATE]: [{ name: 'Base Value', source: 'Self', value: 0.05 }],
  [Stats.CRIT_DMG]: [{ name: 'Base Value', source: 'Self', value: 0.5 }],
  [Stats.BE]: [],
  [Stats.ERR]: [{ name: 'Base Value', source: 'Self', value: 1 }],
  [Stats.HEAL]: [],
  [Stats.SPD]: [],
  [Stats.P_SPD]: [],
  [Stats.EHR]: [],
  [Stats.E_RES]: [],

  X_HP: [], // Fu Xuan and Lynx
  X_CRIT_DMG: [], // Sparkle, Bronya, Sunday and Aventurine
  X_ATK: [], // Robin, Aglaea

  // DMG Bonuses
  [Stats.PHYSICAL_DMG]: [],
  [Stats.FIRE_DMG]: [],
  [Stats.ICE_DMG]: [],
  [Stats.LIGHTNING_DMG]: [],
  [Stats.QUANTUM_DMG]: [],
  [Stats.IMAGINARY_DMG]: [],
  [Stats.WIND_DMG]: [],
  [Stats.ALL_DMG]: [],

  SKILL_HEAL: [],
  ULT_HEAL: [],

  // Hidden Stats
  DEF_PEN: [],
  SHIELD: [],
  BREAK_EFF: [],
  I_HEAL: [],

  SUMMON_DEF_PEN: [],

  //DEBUFFS
  ATK_REDUCTION: [],
  DEF_REDUCTION: [],
  SPD_REDUCTION: [],
  E_RES_RED: [],
  EHR_RED: [],
  VULNERABILITY: [],
  WEAKEN: [],

  FIRE_VUL: [],
  BREAK_VUL: [],
  DOT_VUL: [],
  FUA_VUL: [],
  ULT_VUL: [],
  ULT_RES_PEN: [],

  // RES PEN
  ALL_TYPE_RES_PEN: [],
  PHYSICAL_RES_PEN: [],
  FIRE_RES_PEN: [],
  ICE_RES_PEN: [],
  LIGHTNING_RES_PEN: [],
  WIND_RES_PEN: [],
  QUANTUM_RES_PEN: [],
  IMAGINARY_RES_PEN: [],

  ALL_TYPE_RES_RED: [],
  PHYSICAL_RES_RED: [],
  FIRE_RES_RED: [],
  ICE_RES_RED: [],
  LIGHTNING_RES_RED: [],
  WIND_RES_RED: [],
  QUANTUM_RES_RED: [],
  IMAGINARY_RES_RED: [],

  // RES
  ALL_TYPE_RES: [],

  // Talent Boosts
  BASIC_DMG: [],
  SKILL_DMG: [],
  ULT_DMG: [],
  TALENT_DMG: [],
  TECHNIQUE_DMG: [],
  DOT_DMG: [],
  FUA_DMG: [],
  ADD_DMG: [],
  SUMMON_DMG: [],

  BASIC_F_DMG: [],
  SKILL_F_DMG: [],
  ULT_F_DMG: [],

  BASIC_CR: [],
  SKILL_CR: [],
  ULT_CR: [],
  DOT_CR: [],
  FUA_CR: [],

  BASIC_CD: [],
  SKILL_CD: [],
  ULT_CD: [],
  DOT_CD: [],
  FUA_CD: [],
  ADD_CD: [],

  BASIC_DEF_PEN: [],
  SKILL_DEF_PEN: [],
  ULT_DEF_PEN: [],
  DOT_DEF_PEN: [],
  FUA_DEF_PEN: [],
  BREAK_DEF_PEN: [],
  SUPER_BREAK_DEF_PEN: [],

  BREAK_DMG: [],
  SUPER_BREAK_DMG: [],

  SUPER_BREAK_MULT: [],
  BREAK_MULT: [],
  BASIC_SUPER_BREAK: [],

  // Mitigation
  DMG_REDUCTION: [],
  AGGRO: [],
  BASE_AGGRO: [],

  MAX_ENERGY: 0,
  SUMMON: false,

  // Multipliers
  BASIC_SCALING: [],
  SKILL_SCALING: [],
  MEMO_SKILL_SCALING: [],
  ULT_SCALING: [],
  TALENT_SCALING: [],
  TECHNIQUE_SCALING: [],

  ADD_DEBUFF: [],

  DOT_SCALING: [],
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

  CALLBACK: [],

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
  [TalentType.SERVANT]: 'SUMMON',
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
