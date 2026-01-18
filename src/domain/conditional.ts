import { StatsObject } from '@src/data/lib/stats/baseConstant'
import { DebuffTypes, Element, ITalentLevel, ITeamChar, PathType, Stats, TalentProperty, TalentType } from './constant'
import _ from 'lodash'
import { findCharacter } from '@src/core/utils/finder'

export type TalentScalingStyle = 'linear' | 'curved' | 'flat' | 'heal' | 'pure' | 'arcana' | 'dot' | 'hycilens'

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
  def_pen?: number
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
  ehrBonus?: number
  detonate?: boolean
  elation?: number // Used to compare higher (Yao Guang)
  punchline?: number // Used for overriding Banger
  weaknessBypass?: number
}

export interface ISuperBreakScaling {
  name: string
  element: Element
  break?: number
  min?: number
  max?: number
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
    },
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
  sp?: number
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

export const GlobalContents: (team: ITeamChar[]) => IContent[] = (team) =>
  _.filter(
    [
      {
        type: 'toggle',
        id: 'broken',
        text: `Weakness Broken`,
        trace: 'Mechanic - Weakness Break',
        content: `Once the enemy's Toughness bar depleted, the enemy will suffer a Weakness Break and enters a Weakness Broken state. This affects some character's ability and enables some game mechanics (e.g. Super Break).
        <br />
        <br />Normally, Super Break's activation is tied to this toggle, unless <b class="text-hsr-fire">The Dahlia</b>'s zone is active to bypass this.`,
        title: 'Weakness Broken',
        show: true,
        default: true,
        unique: true,
      },
      {
        type: 'number',
        id: 'punchline',
        text: `Punchline`,
        trace: 'Mechanic - Elation',
        content: `<b class="text-orange-400">Punchline</b> is shared by the whole team. When dealing <b class="elation">Elation DMG</b>, the more <b class="text-orange-400">Punchline</b> points taken into account, the higher the <b class="elation">Elation DMG</b>.
        <br />After each <b class="text-aha">Aha Instant</b>, all <b class="text-orange-400">Punchline</b> point(s) will be cleared and given to each character as <b class="text-blue">Certified Banger</b>.
        <br />
        <br />This value is only used to calculate the effect of each character's Elation Skill within each single <b class="text-aha">Aha Instant</b>.`,
        title: 'Punchline',
        show: _.some(team, (item) => findCharacter(item.cId)?.path === PathType.ELATION),
        default: 20,
        min: 0,
        unique: true,
      },
    ] as IContent[],
    (item) => item.show,
  )

export const Banger: IContent = {
  type: 'number',
  id: 'banger',
  text: `Total Certified Banger`,
  trace: 'Elation',
  content: `Characters participating in the <b class="text-aha">Aha Instant</b> obtain the <b class="text-blue">Certified Banger</b> state, and <b class="text-orange-400">Punchline</b> from the current <b class="text-aha">Aha Instant</b> are taken into account for this state, lasting for <span class="text-desc">2</span> turns. Ability effects and <b class="elation">Elation DMG</b> produced by the <b class="text-blue">Certified Banger</b> state are calculated based on the <b class="text-orange-400">Punchline</b> points taken into account.
      <br /><b class="text-orange-400">Punchlines</b> taken into account for multiple <b class="text-blue">Certified Banger</b> states are combined for calculation.
      <br />The duration of each <b class="text-blue">Certified Banger</b> state is calculated independently.`,
  title: 'Certified Banger',
  show: true,
  default: 20,
  min: 0,
}
