import { IArtifact, Stats } from './constant'

export const SubStatMap = {
  0: { stat: Stats.ATK, min: 16.935, bonus: 2.1168754 },
  1: { stat: Stats.HP, min: 33.87, bonus: 4.233751 },
  2: { stat: Stats.DEF, min: 16.935, bonus: 2.1168754 },
  3: { stat: Stats.P_ATK, min: 0.03456, bonus: 0.00432 },
  4: { stat: Stats.P_HP, min: 0.03456, bonus: 0.00432 },
  5: { stat: Stats.P_DEF, min: 0.0432, bonus: 0.0054 },
  6: { stat: Stats.CRIT_RATE, min: 0.02592, bonus: 0.00324 },
  7: { stat: Stats.CRIT_DMG, min: 0.05184, bonus: 0.00648 },
  8: { stat: Stats.SPD, min: 2, bonus: 0.3 },
  9: { stat: Stats.BE, min: 0.05184, bonus: 0.00648 },
  10: { stat: Stats.EHR, min: 0.03456, bonus: 0.00432 },
  11: { stat: Stats.E_RES, min: 0.03456, bonus: 0.00432 },
}

export const SubStatQuality = {
  1: 0.7,
  2: 0.8,
  3: 0.9,
  4: 1,
}

export const MainStat = {
  1: [Stats.HP],
  2: [Stats.ATK],
  3: [Stats.P_HP, Stats.P_ATK, Stats.P_DEF, Stats.CRIT_RATE, Stats.CRIT_DMG, Stats.HEAL, Stats.EHR],
  4: [Stats.P_HP, Stats.P_ATK, Stats.P_DEF, Stats.SPD],
  6: [Stats.P_HP, Stats.P_ATK, Stats.P_DEF, Stats.BE, Stats.ERR],
  5: [
    Stats.P_HP,
    Stats.P_ATK,
    Stats.P_DEF,
    Stats.PHYSICAL_DMG,
    Stats.FIRE_DMG,
    Stats.ICE_DMG,
    Stats.LIGHTNING_DMG,
    Stats.WIND_DMG,
    Stats.QUANTUM_DMG,
    Stats.IMAGINARY_DMG,
  ],
}

export const MainStatValue = [
  {
    stat: [Stats.SPD],
    rarity: 5,
    base: 4.032,
    growth: 1.4,
  },
  {
    stat: [Stats.HP],
    rarity: 5,
    base: 112.896,
    growth: 39.5136,
  },
  {
    stat: [Stats.ATK],
    rarity: 5,
    base: 56.448,
    growth: 19.7568,
  },
  {
    stat: [Stats.P_HP, Stats.P_ATK],
    rarity: 5,
    base: 0.06912,
    growth: 0.024192,
  },
  {
    stat: [Stats.P_DEF],
    rarity: 5,
    base: 0.0864,
    growth: 0.03924,
  },
  {
    stat: [Stats.BE],
    rarity: 5,
    base: 0.10368,
    growth: 0.036277,
  },
  {
    stat: [Stats.EHR],
    rarity: 5,
    base: 0.06912,
    growth: 0.024192,
  },
  {
    stat: [Stats.ERR],
    rarity: 5,
    base: 0.031104,
    growth: 0.010886,
  },
  {
    stat: [Stats.CRIT_RATE],
    rarity: 5,
    base: 0.05184,
    growth: 0.018144,
  },
  {
    stat: [Stats.CRIT_DMG],
    rarity: 5,
    base: 0.10368,
    growth: 0.036288,
  },
  {
    stat: [Stats.HEAL],
    rarity: 5,
    base: 0.055296,
    growth: 0.019354,
  },
  {
    stat: [
      Stats.PHYSICAL_DMG,
      Stats.FIRE_DMG,
      Stats.ICE_DMG,
      Stats.LIGHTNING_DMG,
      Stats.WIND_DMG,
      Stats.QUANTUM_DMG,
      Stats.IMAGINARY_DMG,
    ],
    rarity: 5,
    base: 0.062208,
    growth: 0.021773,
  },
  // 4
  {
    stat: [Stats.SPD],
    rarity: 4,
    base: 3.2256,
    growth: 1.1,
  },
  {
    stat: [Stats.HP],
    rarity: 4,
    base: 90.3168,
    growth: 31.61088,
  },
  {
    stat: [Stats.ATK],
    rarity: 4,
    base: 45.1584,
    growth: 15.80544,
  },
  {
    stat: [Stats.P_HP, Stats.P_ATK],
    rarity: 4,
    base: 0.055296,
    growth: 0.019354,
  },
  {
    stat: [Stats.P_DEF],
    rarity: 4,
    base: 0.06912,
    growth: 0.024192,
  },
  {
    stat: [Stats.BE],
    rarity: 4,
    base: 0.082944,
    growth: 0.02903,
  },
  {
    stat: [Stats.EHR],
    rarity: 4,
    base: 0.055296,
    growth: 0.019354,
  },
  {
    stat: [Stats.ERR],
    rarity: 4,
    base: 0.024883,
    growth: 0.008709,
  },
  {
    stat: [Stats.CRIT_RATE],
    rarity: 4,
    base: 0.041472,
    growth: 0.014515,
  },
  {
    stat: [Stats.CRIT_DMG],
    rarity: 4,
    base: 0.082944,
    growth: 0.02903,
  },
  {
    stat: [Stats.HEAL],
    rarity: 4,
    base: 0.044237,
    growth: 0.015483,
  },
  {
    stat: [
      Stats.PHYSICAL_DMG,
      Stats.FIRE_DMG,
      Stats.ICE_DMG,
      Stats.LIGHTNING_DMG,
      Stats.WIND_DMG,
      Stats.QUANTUM_DMG,
      Stats.IMAGINARY_DMG,
    ],
    rarity: 4,
    base: 0.049766,
    growth: 0.017418,
  },
  // 3
  {
    stat: [Stats.SPD],
    rarity: 3,
    base: 2.4192,
    growth: 1,
  },
  {
    stat: [Stats.HP],
    rarity: 3,
    base: 67.7376,
    growth: 23.70816,
  },
  {
    stat: [Stats.ATK],
    rarity: 3,
    base: 33.8688,
    growth: 11.85408,
  },
  {
    stat: [Stats.P_HP, Stats.P_ATK],
    rarity: 3,
    base: 0.041472,
    growth: 0.014515,
  },
  {
    stat: [Stats.P_DEF],
    rarity: 3,
    base: 0.05184,
    growth: 0.018144,
  },
  {
    stat: [Stats.BE],
    rarity: 3,
    base: 0.062208,
    growth: 0.021773,
  },
  {
    stat: [Stats.EHR],
    rarity: 3,
    base: 0.041472,
    growth: 0.014515,
  },
  {
    stat: [Stats.ERR],
    rarity: 3,
    base: 0.018662,
    growth: 0.006532,
  },
  {
    stat: [Stats.CRIT_RATE],
    rarity: 3,
    base: 0.031104,
    growth: 0.010886,
  },
  {
    stat: [Stats.CRIT_DMG],
    rarity: 3,
    base: 0.062208,
    growth: 0.021773,
  },
  {
    stat: [Stats.HEAL],
    rarity: 3,
    base: 0.033178,
    growth: 0.011612,
  },
  {
    stat: [
      Stats.PHYSICAL_DMG,
      Stats.FIRE_DMG,
      Stats.ICE_DMG,
      Stats.LIGHTNING_DMG,
      Stats.WIND_DMG,
      Stats.QUANTUM_DMG,
      Stats.IMAGINARY_DMG,
    ],
    rarity: 3,
    base: 0.037325,
    growth: 0.013064,
  },
  // 2
  {
    stat: [Stats.SPD],
    rarity: 2,
    base: 1.6128,
    growth: 1,
  },
  {
    stat: [Stats.HP],
    rarity: 2,
    base: 45.1584,
    growth: 15.80544,
  },
  {
    stat: [Stats.ATK],
    rarity: 2,
    base: 22.5792,
    growth: 7.90272,
  },
  {
    stat: [Stats.P_HP, Stats.P_ATK],
    rarity: 2,
    base: 0.027648,
    growth: 0.009677,
  },
  {
    stat: [Stats.P_DEF],
    rarity: 2,
    base: 0.03456,
    growth: 0.012096,
  },
  {
    stat: [Stats.BE],
    rarity: 2,
    base: 0.041472,
    growth: 0.014515,
  },
  {
    stat: [Stats.EHR],
    rarity: 2,
    base: 0.027648,
    growth: 0.009677,
  },
  {
    stat: [Stats.ERR],
    rarity: 2,
    base: 0.012442,
    growth: 0.004355,
  },
  {
    stat: [Stats.CRIT_RATE],
    rarity: 2,
    base: 0.020736,
    growth: 0.007258,
  },
  {
    stat: [Stats.CRIT_DMG],
    rarity: 2,
    base: 0.041472,
    growth: 0.014515,
  },
  {
    stat: [Stats.HEAL],
    rarity: 2,
    base: 0.022118,
    growth: 0.007741,
  },
  {
    stat: [
      Stats.PHYSICAL_DMG,
      Stats.FIRE_DMG,
      Stats.ICE_DMG,
      Stats.LIGHTNING_DMG,
      Stats.WIND_DMG,
      Stats.QUANTUM_DMG,
      Stats.IMAGINARY_DMG,
    ],
    rarity: 2,
    base: 0.024883,
    growth: 0.008709,
  },
]

export const SubStat = [
  Stats.HP,
  Stats.P_HP,
  Stats.ATK,
  Stats.P_ATK,
  Stats.DEF,
  Stats.P_DEF,
  Stats.SPD,
  Stats.CRIT_RATE,
  Stats.CRIT_DMG,
  Stats.BE,
  Stats.EHR,
  Stats.E_RES,
]
