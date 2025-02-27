import { Element, PathType, Stats } from '@src/domain/constant'

export const summonList = ['1112', '1204', '1222']

export const Characters = [
  {
    id: '1001',
    name: 'March 7th (Preservation)',
    stat: {
      baseAtk: 69.6,
      baseHp: 144,
      baseDef: 78,
      baseSpd: 101,
      energy: 120,
    },
    trace: [Stats.ICE_DMG, Stats.E_RES, Stats.P_DEF],
    rarity: 4,
    path: PathType.PRESERVATION,
    element: Element.ICE,
    beta: false,
  },
  {
    id: '1002',
    name: 'Dan Heng',
    stat: {
      baseAtk: 74.4,
      baseHp: 120,
      baseDef: 54,
      baseSpd: 110,
      energy: 100,
    },
    trace: [Stats.WIND_DMG, Stats.P_DEF, Stats.P_ATK],
    rarity: 4,
    path: PathType.HUNT,
    element: Element.WIND,
    beta: false,
  },
  {
    id: '1003',
    name: 'Himeko',
    stat: {
      baseAtk: 102.96,
      baseHp: 142.56,
      baseDef: 59.4,
      baseSpd: 96,
      energy: 120,
    },
    trace: [Stats.FIRE_DMG, Stats.E_RES, Stats.P_ATK],
    rarity: 5,
    path: PathType.ERUDITION,
    element: Element.FIRE,
    beta: false,
  },
  {
    id: '1004',
    name: 'Welt',
    stat: {
      baseAtk: 84.48,
      baseHp: 153.12,
      baseDef: 69.3,
      baseSpd: 102,
      energy: 120,
    },
    trace: [Stats.P_ATK, Stats.E_RES, Stats.IMAGINARY_DMG],
    rarity: 5,
    path: PathType.NIHILITY,
    element: Element.IMAGINARY,
    beta: false,
  },
  {
    id: '1005',
    name: 'Kafka',
    stat: {
      baseAtk: 92.4,
      baseHp: 147.84,
      baseDef: 66,
      baseSpd: 100,
      energy: 120,
    },
    trace: [Stats.P_ATK, Stats.P_HP, Stats.EHR],
    rarity: 5,
    path: PathType.NIHILITY,
    element: Element.LIGHTNING,
    beta: false,
  },
  {
    id: '1006',
    name: 'Silver Wolf',
    stat: {
      baseAtk: 87.12,
      baseHp: 142.56,
      baseDef: 62.7,
      baseSpd: 107,
      energy: 110,
    },
    trace: [Stats.P_ATK, Stats.QUANTUM_DMG, Stats.EHR],
    rarity: 5,
    path: PathType.NIHILITY,
    element: Element.QUANTUM,
    beta: false,
  },
  {
    id: '1008',
    name: 'Arlan',
    stat: {
      baseAtk: 81.6,
      baseHp: 163.2,
      baseDef: 45,
      baseSpd: 102,
      energy: 110,
    },
    trace: [Stats.P_ATK, Stats.P_HP, Stats.E_RES],
    rarity: 4,
    path: PathType.DESTRUCTION,
    element: Element.LIGHTNING,
    beta: false,
  },
  {
    id: '1009',
    name: 'Asta',
    stat: {
      baseAtk: 69.6,
      baseHp: 139.2,
      baseDef: 63,
      baseSpd: 102,
      energy: 110,
    },
    trace: [Stats.FIRE_DMG, Stats.CRIT_RATE, Stats.P_DEF],
    rarity: 4,
    path: PathType.HARMONY,
    element: Element.FIRE,
    beta: false,
  },
  {
    id: '1013',
    name: 'Herta',
    stat: {
      baseAtk: 79.3,
      baseHp: 129.6,
      baseDef: 54,
      baseSpd: 100,
      energy: 110,
    },
    trace: [Stats.ICE_DMG, Stats.CRIT_RATE, Stats.P_DEF],
    rarity: 4,
    path: PathType.ERUDITION,
    element: Element.ICE,
    beta: false,
  },
  {
    id: '1101',
    name: 'Bronya',
    stat: {
      baseAtk: 79.2,
      baseHp: 168.96,
      baseDef: 72.6,
      baseSpd: 99,
      energy: 120,
    },
    trace: [Stats.WIND_DMG, Stats.E_RES, Stats.CRIT_DMG],
    rarity: 5,
    path: PathType.HARMONY,
    element: Element.WIND,
    beta: false,
  },
  {
    id: '1102',
    name: 'Seele',
    stat: {
      baseAtk: 87.12,
      baseHp: 126.72,
      baseDef: 49.5,
      baseSpd: 115,
      energy: 120,
    },
    trace: [Stats.P_ATK, Stats.P_DEF, Stats.CRIT_DMG],
    rarity: 5,
    path: PathType.HUNT,
    element: Element.QUANTUM,
    beta: false,
  },
  {
    id: '1103',
    name: 'Serval',
    stat: {
      baseAtk: 88.8,
      baseHp: 124.8,
      baseDef: 51,
      baseSpd: 104,
      energy: 100,
    },
    trace: [Stats.CRIT_RATE, Stats.E_RES, Stats.EHR],
    rarity: 4,
    path: PathType.ERUDITION,
    element: Element.LIGHTNING,
    beta: false,
  },
  {
    id: '1104',
    name: 'Gepard',
    stat: {
      baseAtk: 73.92,
      baseHp: 190.08,
      baseDef: 89.1,
      baseSpd: 92,
      energy: 100,
    },
    trace: [Stats.ICE_DMG, Stats.P_DEF, Stats.E_RES],
    rarity: 5,
    path: PathType.PRESERVATION,
    element: Element.ICE,
    beta: false,
  },
  {
    id: '1105',
    name: 'Natasha',
    stat: {
      baseAtk: 81,
      baseHp: 172,
      baseDef: 54,
      baseSpd: 98,
      energy: 90,
    },
    trace: [Stats.P_HP, Stats.P_DEF, Stats.E_RES],
    rarity: 4,
    path: PathType.ABUNDANCE,
    element: Element.PHYSICAL,
    beta: false,
  },
  {
    id: '1106',
    name: 'Pela',
    stat: {
      baseAtk: 74.4,
      baseHp: 134.4,
      baseDef: 63,
      baseSpd: 105,
      energy: 110,
    },
    trace: [Stats.ICE_DMG, Stats.EHR, Stats.P_ATK],
    rarity: 4,
    path: PathType.NIHILITY,
    element: Element.ICE,
    beta: false,
  },
  {
    id: '1107',
    name: 'Clara',
    stat: {
      baseAtk: 100.32,
      baseHp: 168.96,
      baseDef: 66,
      baseSpd: 90,
      energy: 110,
    },
    trace: [Stats.P_ATK, Stats.P_HP, Stats.PHYSICAL_DMG],
    rarity: 5,
    path: PathType.DESTRUCTION,
    element: Element.PHYSICAL,
    beta: false,
  },
  {
    id: '1108',
    name: 'Sampo',
    stat: {
      baseAtk: 84,
      baseHp: 139.2,
      baseDef: 139.2,
      baseSpd: 102,
      energy: 120,
    },
    trace: [Stats.P_ATK, Stats.E_RES, Stats.EHR],
    rarity: 4,
    path: PathType.NIHILITY,
    element: Element.WIND,
    beta: false,
  },
  {
    id: '1109',
    name: 'Hook',
    stat: {
      baseAtk: 84,
      baseHp: 182.4,
      baseDef: 48,
      baseSpd: 94,
      energy: 120,
    },
    trace: [Stats.P_ATK, Stats.CRIT_DMG, Stats.P_HP],
    rarity: 4,
    path: PathType.DESTRUCTION,
    element: Element.FIRE,
    beta: false,
  },
  {
    id: '1110',
    name: 'Lynx',
    stat: {
      baseAtk: 67.2,
      baseHp: 144,
      baseDef: 75,
      baseSpd: 100,
      energy: 100,
    },
    trace: [Stats.P_HP, Stats.E_RES, Stats.P_DEF],
    rarity: 4,
    path: PathType.ABUNDANCE,
    element: Element.QUANTUM,
    beta: false,
  },
  {
    id: '1111',
    name: 'Luka',
    stat: {
      baseAtk: 79.2,
      baseHp: 124.8,
      baseDef: 66,
      baseSpd: 103,
      energy: 130,
    },
    trace: [Stats.P_ATK, Stats.P_DEF, Stats.EHR],
    rarity: 4,
    path: PathType.NIHILITY,
    element: Element.PHYSICAL,
    beta: false,
  },
  {
    id: '1112',
    name: 'Topaz and Numby',
    stat: {
      baseAtk: 84.48,
      baseHp: 126.72,
      baseDef: 56.1,
      baseSpd: 110,
      energy: 130,
    },
    trace: [Stats.FIRE_DMG, Stats.P_HP, Stats.CRIT_RATE],
    rarity: 5,
    path: PathType.HUNT,
    element: Element.FIRE,
    beta: false,
  },
  {
    id: '1201',
    name: 'Qingque',
    stat: {
      baseAtk: 88.8,
      baseHp: 139.2,
      baseDef: 60,
      baseSpd: 98,
      energy: 140,
    },
    trace: [Stats.P_ATK, Stats.P_DEF, Stats.QUANTUM_DMG],
    rarity: 4,
    path: PathType.ERUDITION,
    element: Element.QUANTUM,
    beta: false,
  },
  {
    id: '1202',
    name: 'Tingyun',
    stat: {
      baseAtk: 72,
      baseHp: 115.2,
      baseDef: 54,
      baseSpd: 112,
      energy: 130,
    },
    trace: [Stats.P_ATK, Stats.LIGHTNING_DMG, Stats.P_DEF],
    rarity: 4,
    path: PathType.HARMONY,
    element: Element.LIGHTNING,
    beta: false,
  },
  {
    id: '1203',
    name: 'Luocha',
    stat: {
      baseAtk: 102.96,
      baseHp: 174.24,
      baseDef: 49.5,
      baseSpd: 101,
      energy: 100,
    },
    trace: [Stats.P_ATK, Stats.P_DEF, Stats.P_HP],
    rarity: 5,
    path: PathType.ABUNDANCE,
    element: Element.IMAGINARY,
    beta: false,
  },
  {
    id: '1204',
    name: 'Jing Yuan',
    stat: {
      baseAtk: 95.04,
      baseHp: 158.4,
      baseDef: 66,
      baseSpd: 99,
      energy: 130,
    },
    trace: [Stats.P_ATK, Stats.P_DEF, Stats.CRIT_RATE],
    rarity: 5,
    path: PathType.ERUDITION,
    element: Element.LIGHTNING,
    beta: false,
  },
  {
    id: '1205',
    name: 'Blade',
    stat: {
      baseAtk: 73.92,
      baseHp: 184.8,
      baseDef: 66,
      baseSpd: 97,
      energy: 130,
    },
    trace: [Stats.P_HP, Stats.E_RES, Stats.CRIT_RATE],
    rarity: 5,
    path: PathType.DESTRUCTION,
    element: Element.WIND,
    beta: false,
  },
  {
    id: '1206',
    name: 'Sushang',
    stat: {
      baseAtk: 76.8,
      baseHp: 124.8,
      baseDef: 57,
      baseSpd: 107,
      energy: 120,
    },
    trace: [Stats.P_ATK, Stats.P_DEF, Stats.P_HP],
    rarity: 4,
    path: PathType.HUNT,
    element: Element.PHYSICAL,
    beta: false,
  },
  {
    id: '1207',
    name: 'Yukong',
    stat: {
      baseAtk: 81.6,
      baseHp: 124.8,
      baseDef: 51,
      baseSpd: 107,
      energy: 130,
    },
    trace: [Stats.IMAGINARY_DMG, Stats.P_ATK, Stats.P_HP],
    rarity: 4,
    path: PathType.HARMONY,
    element: Element.IMAGINARY,
    beta: false,
  },
  {
    id: '1208',
    name: 'Fu Xuan',
    stat: {
      baseAtk: 63.36,
      baseHp: 200.64,
      baseDef: 82.5,
      baseSpd: 100,
      energy: 135,
    },
    trace: [Stats.CRIT_RATE, Stats.E_RES, Stats.P_HP],
    rarity: 5,
    path: PathType.PRESERVATION,
    element: Element.QUANTUM,
    beta: false,
  },
  {
    id: '1209',
    name: 'Yanqing',
    stat: {
      baseAtk: 92.4,
      baseHp: 121.44,
      baseDef: 56.1,
      baseSpd: 109,
      energy: 140,
    },
    trace: [Stats.P_ATK, Stats.P_HP, Stats.ICE_DMG],
    rarity: 5,
    path: PathType.HUNT,
    element: Element.ICE,
    beta: false,
  },
  {
    id: '1210',
    name: 'Guinaifen',
    stat: {
      baseAtk: 79.2,
      baseHp: 120,
      baseDef: 60,
      baseSpd: 106,
      energy: 120,
    },
    trace: [Stats.FIRE_DMG, Stats.EHR, Stats.BE],
    rarity: 4,
    path: PathType.NIHILITY,
    element: Element.FIRE,
    beta: false,
  },
  {
    id: '1211',
    name: 'Bailu',
    stat: {
      baseAtk: 76.56,
      baseHp: 179.52,
      baseDef: 66,
      baseSpd: 98,
      energy: 100,
    },
    trace: [Stats.P_HP, Stats.E_RES, Stats.P_DEF],
    rarity: 5,
    path: PathType.ABUNDANCE,
    element: Element.LIGHTNING,
    beta: false,
  },
  {
    id: '1212',
    name: 'Jingliu',
    stat: {
      baseAtk: 92.4,
      baseHp: 195.36,
      baseDef: 66,
      baseSpd: 96,
      energy: 140,
    },
    trace: [Stats.CRIT_DMG, Stats.P_HP, Stats.SPD],
    rarity: 5,
    path: PathType.DESTRUCTION,
    element: Element.ICE,
    beta: false,
  },
  {
    id: '1213',
    name: 'Dan Heng • Imbibitor Lunae',
    stat: {
      baseAtk: 95.04,
      baseHp: 168.96,
      baseDef: 49.5,
      baseSpd: 102,
      energy: 140,
    },
    trace: [Stats.IMAGINARY_DMG, Stats.P_HP, Stats.CRIT_RATE],
    rarity: 5,
    path: PathType.DESTRUCTION,
    element: Element.IMAGINARY,
    beta: false,
  },
  {
    id: '1214',
    name: 'Xueyi',
    stat: {
      baseAtk: 81.6,
      baseHp: 144,
      baseDef: 54,
      baseSpd: 103,
      energy: 120,
    },
    trace: [Stats.BE, Stats.QUANTUM_DMG, Stats.P_HP],
    rarity: 4,
    path: PathType.DESTRUCTION,
    element: Element.QUANTUM,
    beta: false,
  },
  {
    id: '1215',
    name: 'Hanya',
    stat: {
      baseAtk: 76.8,
      baseHp: 124.8,
      baseDef: 48,
      baseSpd: 110,
      energy: 140,
    },
    trace: [Stats.P_ATK, Stats.P_HP, Stats.SPD],
    rarity: 4,
    path: PathType.HARMONY,
    element: Element.PHYSICAL,
    beta: false,
  },
  {
    id: '1217',
    name: 'Huohuo',
    stat: {
      baseAtk: 81.84,
      baseHp: 184.8,
      baseDef: 69.3,
      baseSpd: 98,
      energy: 140,
    },
    trace: [Stats.P_HP, Stats.SPD, Stats.E_RES],
    rarity: 5,
    path: PathType.ABUNDANCE,
    element: Element.WIND,
    beta: false,
  },
  {
    id: '1218',
    name: 'Jiaoqiu',
    stat: {
      baseAtk: 81.84,
      baseHp: 184.8,
      baseDef: 69.3,
      baseSpd: 98,
      energy: 100,
    },
    trace: [Stats.EHR, Stats.SPD, Stats.FIRE_DMG],
    rarity: 5,
    path: PathType.NIHILITY,
    element: Element.FIRE,
    beta: false,
  },
  {
    id: '1220',
    name: 'Feixiao',
    stat: {
      baseAtk: 81.84,
      baseHp: 143,
      baseDef: 52.8,
      baseSpd: 112,
      energy: 0,
    },
    trace: [Stats.P_ATK, Stats.P_DEF, Stats.CRIT_RATE],
    rarity: 5,
    path: PathType.HUNT,
    element: Element.WIND,
    beta: false,
  },
  {
    id: '1221',
    name: 'Yunli',
    stat: {
      baseAtk: 92.4,
      baseHp: 184.8,
      baseDef: 62.7,
      baseSpd: 94,
      energy: 240,
    },
    trace: [Stats.P_ATK, Stats.CRIT_RATE, Stats.P_HP],
    rarity: 5,
    path: PathType.DESTRUCTION,
    element: Element.PHYSICAL,
    beta: false,
  },
  {
    id: '1222',
    name: 'Lingsha',
    stat: {
      baseAtk: 92.4,
      baseHp: 184.8,
      baseDef: 59.4,
      baseSpd: 98,
      energy: 110,
    },
    trace: [Stats.BE, Stats.P_ATK, Stats.P_HP],
    rarity: 5,
    path: PathType.ABUNDANCE,
    element: Element.FIRE,
    beta: false,
  },
  {
    id: '1223',
    name: 'Moze',
    stat: {
      baseAtk: 81.6,
      baseHp: 110.4,
      baseDef: 48,
      baseSpd: 111,
      energy: 120,
    },
    trace: [Stats.CRIT_DMG, Stats.P_HP, Stats.P_ATK],
    rarity: 4,
    path: PathType.HUNT,
    element: Element.LIGHTNING,
    beta: false,
  },
  {
    id: '1224',
    name: 'March 7th (The Hunt)',
    stat: {
      baseAtk: 76.8,
      baseHp: 124.8,
      baseDef: 57,
      baseSpd: 107,
      energy: 110,
    },
    trace: [Stats.P_ATK, Stats.P_DEF, Stats.CRIT_DMG],
    rarity: 4,
    path: PathType.HUNT,
    element: Element.IMAGINARY,
    beta: false,
  },
  {
    id: '1225',
    name: 'Fugue',
    stat: {
      baseAtk: 79.20000000018626,
      baseHp: 153.12000000011176,
      baseDef: 75.90000000083819,
      baseSpd: 102,
      energy: 130,
    },
    trace: [Stats.SPD, Stats.P_HP, Stats.BE],
    rarity: 5,
    path: PathType.NIHILITY,
    element: Element.FIRE,
    beta: false,
  },
  {
    id: '1301',
    name: 'Gallagher',
    stat: {
      baseAtk: 72,
      baseHp: 177.6,
      baseDef: 60,
      baseSpd: 98,
      energy: 110,
    },
    trace: [Stats.E_RES, Stats.BE, Stats.P_HP],
    rarity: 4,
    path: PathType.ABUNDANCE,
    element: Element.FIRE,
    beta: false,
  },
  {
    id: '1302',
    name: 'Argenti',
    stat: {
      baseAtk: 100.32,
      baseHp: 142.56,
      baseDef: 49.5,
      baseSpd: 103,
      energy: 180,
    },
    trace: [Stats.P_ATK, Stats.P_HP, Stats.PHYSICAL_DMG],
    rarity: 5,
    path: PathType.ERUDITION,
    element: Element.PHYSICAL,
    beta: false,
  },
  {
    id: '1303',
    name: 'Ruan Mei',
    stat: {
      baseAtk: 89.76,
      baseHp: 147.84,
      baseDef: 66,
      baseSpd: 104,
      energy: 130,
    },
    trace: [Stats.BE, Stats.SPD, Stats.P_DEF],
    rarity: 5,
    path: PathType.HARMONY,
    element: Element.ICE,
    beta: false,
  },
  {
    id: '1304',
    name: 'Aventurine',
    stat: {
      baseAtk: 60.72,
      baseHp: 163.68,
      baseDef: 89.1,
      baseSpd: 106,
      energy: 110,
    },
    trace: [Stats.P_DEF, Stats.E_RES, Stats.IMAGINARY_DMG],
    rarity: 5,
    path: PathType.PRESERVATION,
    element: Element.IMAGINARY,
    beta: false,
  },
  {
    id: '1305',
    name: 'Dr. Ratio',
    stat: {
      baseAtk: 105.6,
      baseHp: 142.56,
      baseDef: 62.7,
      baseSpd: 103,
      energy: 140,
    },
    trace: [Stats.P_ATK, Stats.P_DEF, Stats.CRIT_RATE],
    rarity: 5,
    path: PathType.HUNT,
    element: Element.IMAGINARY,
    beta: false,
  },
  {
    id: '1306',
    name: 'Sparkle',
    stat: {
      baseAtk: 71.28,
      baseHp: 190.08,
      baseDef: 66,
      baseSpd: 101,
      energy: 110,
    },
    trace: [Stats.P_HP, Stats.E_RES, Stats.CRIT_DMG],
    rarity: 5,
    path: PathType.HARMONY,
    element: Element.QUANTUM,
    beta: false,
  },
  {
    id: '1307',
    name: 'Black Swan',
    stat: {
      baseAtk: 89.76,
      baseHp: 147.84,
      baseDef: 66,
      baseSpd: 102,
      energy: 120,
    },
    trace: [Stats.P_ATK, Stats.EHR, Stats.WIND_DMG],
    rarity: 5,
    path: PathType.NIHILITY,
    element: Element.WIND,
    beta: false,
  },
  {
    id: '1308',
    name: 'Acheron',
    stat: {
      baseAtk: 95.04,
      baseHp: 153.12,
      baseDef: 59.4,
      baseSpd: 101,
      energy: 0,
    },
    trace: [Stats.P_ATK, Stats.LIGHTNING_DMG, Stats.CRIT_DMG],
    rarity: 5,
    path: PathType.NIHILITY,
    element: Element.LIGHTNING,
    beta: false,
  },
  {
    id: '1309',
    name: 'Robin',
    stat: {
      baseAtk: 87.12,
      baseHp: 174.24,
      baseDef: 66,
      baseSpd: 102,
      energy: 160,
    },
    trace: [Stats.P_ATK, Stats.SPD, Stats.P_HP],
    rarity: 5,
    path: PathType.HARMONY,
    element: Element.PHYSICAL,
    beta: false,
  },
  {
    id: '1310',
    name: 'Firefly',
    stat: {
      baseAtk: 71.28,
      baseHp: 111,
      baseDef: 105.6,
      baseSpd: 104,
      energy: 240,
    },
    trace: [Stats.BE, Stats.SPD, Stats.E_RES],
    rarity: 5,
    path: PathType.DESTRUCTION,
    element: Element.FIRE,
    beta: false,
  },
  {
    id: '1312',
    name: 'Misha',
    stat: {
      baseAtk: 64.8,
      baseHp: 158.4,
      baseDef: 69,
      baseSpd: 96,
      energy: 100,
    },
    trace: [Stats.ICE_DMG, Stats.CRIT_RATE, Stats.P_DEF],
    rarity: 4,
    path: PathType.DESTRUCTION,
    element: Element.ICE,
    beta: false,
  },
  {
    id: '1313',
    name: 'Sunday',
    stat: {
      baseAtk: 87.12000000011176,
      baseHp: 168.96000000089407,
      baseDef: 72.6000000005588,
      baseSpd: 96,
      energy: 130,
    },
    trace: [Stats.CRIT_DMG, Stats.P_DEF, Stats.E_RES],
    rarity: 5,
    path: PathType.HARMONY,
    element: Element.IMAGINARY,
    beta: false,
  },
  {
    id: '1314',
    name: 'Jade',
    stat: {
      baseAtk: 89.76,
      baseHp: 147.84,
      baseDef: 69.3,
      baseSpd: 103,
      energy: 140,
    },
    trace: [Stats.QUANTUM_DMG, Stats.E_RES, Stats.P_ATK],
    rarity: 5,
    path: PathType.ERUDITION,
    element: Element.QUANTUM,
    beta: false,
  },
  {
    id: '1315',
    name: 'Boothill',
    stat: {
      baseAtk: 84.48,
      baseHp: 163.68,
      baseDef: 59.4,
      baseSpd: 107,
      energy: 120,
    },
    trace: [Stats.BE, Stats.P_HP, Stats.P_ATK],
    rarity: 5,
    path: PathType.HUNT,
    element: Element.PHYSICAL,
    beta: false,
  },
  {
    id: '1317',
    name: 'Rappa',
    stat: {
      baseAtk: 97.68,
      baseHp: 147.84,
      baseDef: 62.7,
      baseSpd: 96,
      energy: 140,
    },
    trace: [Stats.P_ATK, Stats.BE, Stats.SPD],
    rarity: 5,
    path: PathType.ERUDITION,
    element: Element.IMAGINARY,
    beta: false,
  },
  {
    id: '1401',
    name: 'The Herta',
    stat: {
      baseAtk: 92.4,
      baseHp: 158.4,
      baseDef: 66,
      baseSpd: 99,
      energy: 220,
    },
    trace: [Stats.ICE_DMG, Stats.SPD, Stats.P_ATK],
    rarity: 5,
    path: PathType.ERUDITION,
    element: Element.ICE,
    beta: false,
  },
  {
    id: '1402',
    name: 'Aglaea',
    stat: {
      baseAtk: 95.04,
      baseHp: 168.96,
      baseDef: 66,
      baseSpd: 102,
      energy: 350,
    },
    trace: [Stats.LIGHTNING_DMG, Stats.P_DEF, Stats.CRIT_RATE],
    rarity: 5,
    path: PathType.REMEMBRANCE,
    element: Element.LIGHTNING,
    beta: false,
  },
  {
    id: '1403',
    name: 'Tribbie',
    stat: {
      baseAtk: 71.28,
      baseHp: 142.56,
      baseDef: 99,
      baseSpd: 96,
      energy: 120,
    },
    trace: [Stats.CRIT_DMG, Stats.P_HP, Stats.CRIT_RATE],
    rarity: 5,
    path: PathType.HARMONY,
    element: Element.QUANTUM,
    beta: false,
  },
  {
    id: '1404',
    name: 'Mydei',
    stat: {
      baseAtk: 58.08,
      baseHp: 211.2,
      baseDef: 26.4,
      baseSpd: 95,
      energy: 160,
    },
    trace: [Stats.CRIT_DMG, Stats.SPD, Stats.P_HP],
    rarity: 5,
    path: PathType.DESTRUCTION,
    element: Element.IMAGINARY,
    beta: true,
  },
  {
    id: '1405',
    name: 'Anaxa',
    stat: {
      baseAtk: 110.88,
      baseHp: 132,
      baseDef: 75.9,
      baseSpd: 94,
      energy: 140,
    },
    trace: [Stats.WIND_DMG, Stats.CRIT_RATE, Stats.P_DEF],
    rarity: 5,
    path: PathType.ERUDITION,
    element: Element.WIND,
    beta: true,
  },
  {
    id: '1407',
    name: 'Castorice',
    stat: {
      baseAtk: 71.28,
      baseHp: 221.76,
      baseDef: 66,
      baseSpd: 95,
      energy: 0,
    },
    trace: [Stats.CRIT_RATE, Stats.CRIT_DMG, Stats.QUANTUM_DMG],
    rarity: 5,
    path: PathType.REMEMBRANCE,
    element: Element.QUANTUM,
    beta: true,
  },
  // Odd = Male, Even = Female
  {
    id: '8001',
    name: 'Trailblazer (Destruction)',
    stat: {
      baseAtk: 81.84,
      baseHp: 168.96,
      baseDef: 82.5,
      baseSpd: 100,
      energy: 120,
    },
    trace: [Stats.P_ATK, Stats.P_DEF, Stats.P_HP],
    rarity: 5,
    path: PathType.DESTRUCTION,
    element: Element.PHYSICAL,
    beta: false,
  },
  {
    id: '8003',
    name: 'Trailblazer (Preservation)',
    stat: {
      baseAtk: 84.48,
      baseHp: 163.68,
      baseDef: 62.7,
      baseSpd: 95,
      energy: 120,
    },
    trace: [Stats.P_DEF, Stats.P_HP, Stats.P_ATK],
    rarity: 5,
    path: PathType.PRESERVATION,
    element: Element.FIRE,
    beta: false,
  },
  {
    id: '8005',
    name: 'Trailblazer (Harmony)',
    stat: {
      baseAtk: 60.72,
      baseHp: 147.84,
      baseDef: 92.4,
      baseSpd: 105,
      energy: 140,
    },
    trace: [Stats.BE, Stats.E_RES, Stats.IMAGINARY_DMG],
    rarity: 5,
    path: PathType.HARMONY,
    element: Element.IMAGINARY,
    beta: false,
  },
  {
    id: '8007',
    name: 'Trailblazer (Remembrance)',
    stat: {
      baseAtk: 73.92,
      baseHp: 142.56,
      baseDef: 85.8,
      baseSpd: 103,
      energy: 160,
    },
    trace: [Stats.CRIT_DMG, Stats.P_HP, Stats.P_ATK],
    rarity: 5,
    path: PathType.REMEMBRANCE,
    element: Element.ICE,
    beta: false,
  },
]
