import { StatsObject } from '@src/data/lib/stats/baseConstant'
import { Element, ITalentLevel, ITeamChar, Stats, TalentProperty, TalentType } from './constant'

export type TalentScalingStyle = 'linear' | 'curved' | 'flat' | 'heal' | 'pure' | 'arcana' | 'dot' | 'hycilens'

export enum DebuffTypes {
  WIND_SHEAR = 'Wind Shear',
  BURN = 'Burn',
  FROZEN = 'Frozen',
  SHOCKED = 'Shock',
  BLEED = 'Bleed',
  ENTANGLE = 'Entangled',
  IMPRISON = 'Imprisoned',
  ATK_RED = 'ATK Reduced',
  DEF_RED = 'DEF Reduced',
  SPD_RED = 'SPD Reduced',
  OTHER = 'Others',
  DOT = 'DoT',
  CONTROL = 'Control',
}

export interface IScaling {
  name: string
  scale?: Stats
  value: { scaling: number; multiplier: Stats; override?: number }[]
  element: Element | TalentProperty
  property: TalentProperty
  type: TalentType
  multiplier?: number
  flat?: number
  bonus?: number //Bonus dmg for each component
  cr?: number //Bonus crit rate for each component
  overrideCr?: number
  cd?: number //Bonus crit dmg for each component
  overrideCd?: number
  res_pen?: number
  break?: number
  energy?: number
  chance?: { base: number; fixed: boolean }
  overrideIndex?: number
  dotType?: DebuffTypes
  cap?: { scaling: number; multiplier: Stats; override?: number } //Bleed Cap
  toughCap?: number
  vul?: number
  debuffElement?: Element // Only used for chance
  sum?: boolean
  hitSplit?: number[]
  bonusSplit?: number[] // Used by DHIL
  cdSplit?: number[] // Used by DHIL
  summon?: boolean
  useOwnerStats?: boolean // Used Owner's Stats (Netherwing)
  trueRaw?: boolean // Ignore enemy's multipliers
  atkBonus?: number
  detonate?: boolean
}

export interface IContent {
  type?: 'toggle' | 'number' | 'element' | 'multiple'
  trace?: string
  id: string
  text: string
  title: string
  content: string
  show: boolean
  default?: any
  max?: number | string
  min?: number | string
  debuff?: boolean
  unique?: boolean
  options?: { name: string; value: string }[]
  chance?: { base: number; fixed: boolean }
  duration?: number
  expireTurnStart?: boolean // Apply to Aura-type buffs that reduce count on turn start
  value?: { base: number; growth: number; style: TalentScalingStyle }[]
  level?: number
  sync?: boolean // Determine if this modifier should be synced when comparing builds
  debuffElement?: Element // Only used for chance
  showServant?: boolean
  excludeSummon?: boolean
}

export interface IWeaponContent {
  type?: 'toggle' | 'number' | 'element'
  id: string
  default?: any
  max?: number | string
  min?: number | string
  debuff?: boolean
  chance?: { base: number; fixed: boolean }
  duration?: number
  text: string
  show: boolean
  options?: { name: string; value: string }[]
  debuffElement?: Element // Only used for chance
  excludeSummon?: boolean
  scaling: (
    base: StatsObject, // Stats of the character
    form: Record<string, any>,
    r: number,
    extra: {
      team: ITeamChar[]
      element: Element
      own: StatsObject
      totalEnergy: number
      index: number
      owner?: number
      debuffs: { type: DebuffTypes; count: number }[]
    }
    //"element" is the element of the wearer
    // "own" is the stat of the wearer
  ) => StatsObject
}

export interface ITalentDisplay {
  energy?: number
  trace: string
  title: string
  content: string
  upgrade?: string[]
  value?: { base: number; growth: number; style: TalentScalingStyle }[]
  level?: number
  image?: string
  tag?: string
}

export interface ITalent {
  [key: string]: ITalentDisplay
}

export interface IConditional {
  upgrade: {
    normal: boolean
    skill: boolean
    burst: boolean
  }
  talents: ITalent
  content: IContent[]
  teammateContent: IContent[]
  preCompute: (form: Record<string, any>) => StatsObject
  preComputeShared: (own: StatsObject, base: StatsObject, form: Record<string, any>) => StatsObject
  postCompute: (base: StatsObject, form: Record<string, any>) => StatsObject
}

export type ConditionalFunction = (c: number, a: number, t: ITalentLevel, team?: ITeamChar[]) => IConditional
