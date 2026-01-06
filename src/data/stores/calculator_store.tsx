import { DefaultGlobalMod, Element, GlobalModifiers, ICharStore, ITeamChar, TalentType } from '@src/domain/constant'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { StatsObject, StatsObjectKeysT } from '../lib/stats/baseConstant'
import { DebuffTypes } from '@src/domain/constant'
import { enableStaticRendering } from 'mobx-react-lite'
import { defaultTotal, TotalT } from './setup_store'

enableStaticRendering(typeof window === 'undefined')

export interface CalculatorStoreType {
  tab: string
  team: ITeamChar[]
  total: TotalT[]
  form: Record<string, any>[]
  computedStats: StatsObject[]
  selected: number
  res: Record<Element, number>
  broken: boolean
  weakness: Element[]
  debuffs: { type: DebuffTypes; count: number }[]
  enemy: string
  hp: number
  scaling: string
  toughness: number
  effRes: number
  level: number | string
  custom: { name: StatsObjectKeysT; value: number; debuff: boolean; toggled: boolean; memo: boolean }[][]
  customDebuff: { name: StatsObjectKeysT; value: number; debuff: boolean; toggled: boolean }[]
  globalMod: GlobalModifiers
  setValue: <k extends keyof this>(key: k, value: this[k]) => void
  initForm: (initData: Record<string, any>[]) => void
  setFormValue: (index: number, key: string, value: any, memo: boolean) => void
  setCustomValue: (
    innerIndex: number,
    key: StatsObjectKeysT,
    value: any,
    toggled: boolean,
    debuff?: boolean,
    memo?: boolean
  ) => void
  removeCustomValue: (index: number, innerIndex: number) => void
  setTotal: (key: TalentType, index: number, name: string, value: number) => void
  getTotal: (key: TalentType, index: number) => number
  setRes: (element: Element, value: number) => void
  getEffRes: (reduction?: number) => number
  getDefMult: (level: number, defPen: number, defRed: number) => number
  getResMult: (element: Element, resPen: number) => number
  hydrate: (data: CalculatorStoreType) => void
}

export class CalculatorStore {
  tab: string
  team: ITeamChar[]
  total: TotalT[]
  form: Record<string, any>[]
  computedStats: StatsObject[]
  res: Record<Element, number>
  broken: boolean
  weakness: Element[]
  hp: number
  scaling: string
  effRes: number
  toughness: number
  debuffs: { type: DebuffTypes; count: number }[]
  enemy: string
  level: number | string
  selected: number
  custom: { name: StatsObjectKeysT; value: number; debuff: boolean; toggled: boolean; memo: boolean }[][]
  customDebuff: { name: StatsObjectKeysT; value: number; debuff: boolean; toggled: boolean }[]
  globalMod: GlobalModifiers

  constructor() {
    this.tab = 'mod'
    this.total = Array(3).fill(defaultTotal)
    this.team = Array(4)
    this.form = Array(4)
    this.computedStats = Array(4)
    this.selected = 0
    this.level = 1
    this.broken = false
    this.weakness = []
    this.enemy = ''
    this.scaling = '1'
    this.res = {
      [Element.PHYSICAL]: 0,
      [Element.FIRE]: 0,
      [Element.ICE]: 0,
      [Element.LIGHTNING]: 0,
      [Element.WIND]: 0,
      [Element.QUANTUM]: 0,
      [Element.IMAGINARY]: 0,
      [Element.NONE]: 0,
    }
    this.custom = Array(4).fill([])
    this.debuffs = []
    this.customDebuff = []
    this.hp = 1
    this.toughness = 30
    this.effRes = 0
    this.globalMod = DefaultGlobalMod

    makeAutoObservable(this)
  }

  setValue = <k extends keyof this>(key: k, value: this[k]) => {
    this[key] = value
  }

  initForm = (initData: Record<string, any>[], exclude: string[]) => {
    const mergedData = _.map(initData, (item, index) =>
      _.mapValues(item, (value, key) => {
        const old = this.form[index]?.[key]
        return _.isUndefined(old) ? value : old
      })
    )
    const mergedMemo = _.map(initData, (item, index) =>
      _.mapValues(item, (value, key) => {
        if (_.includes(exclude, key)) return null
        const old = this.form[index]?.memo?.[key]
        return _.isUndefined(old) ? value : old
      })
    )
    this.form = _.map(mergedData, (item, i) => ({ ...item, memo: _.omitBy(mergedMemo[i], (m) => _.isNull(m)) }))
  }

  setFormValue = (index: number, key: string, value: any, memo: boolean) => {
    if (memo) {
      this.form[index].memo[key] = value
    } else {
      this.form[index][key] = value
    }
    this.form = _.cloneDeep(this.form)
  }

  setCustomValue = (
    innerIndex: number,
    key: StatsObjectKeysT,
    value: any,
    toggled: boolean,
    debuff: boolean = false,
    memo: boolean = false
  ) => {
    if (debuff) {
      if (innerIndex < 0) {
        this.customDebuff = [...(this.customDebuff || []), { name: key, value, debuff, toggled }]
      } else {
        this.customDebuff.splice(innerIndex, 1, { name: key, value, debuff, toggled })
      }
      this.customDebuff = _.cloneDeep(this.customDebuff)
    } else {
      const index = this.selected
      if (innerIndex < 0) {
        this.custom[index] = [...(this.custom[index] || []), { name: key, value, debuff, toggled, memo }]
      } else {
        this.custom[index].splice(innerIndex, 1, { name: key, value, debuff, toggled, memo })
      }
      this.custom = _.cloneDeep(this.custom)
    }
  }

  removeCustomValue = (index: number, innerIndex: number, debuff: boolean = false) => {
    if (debuff) {
      this.customDebuff.splice(innerIndex, 1)
      this.customDebuff = _.cloneDeep(this.customDebuff)
    } else {
      this.custom[index].splice(innerIndex, 1)
      this.custom = _.cloneDeep(this.custom)
    }
  }

  setTotal = (key: TalentType, index: number, name: string, value: number) => {
    _.assign(this.total[index][key], { [name]: value })
  }

  getTotal = (key: TalentType, index: number) => {
    return _.sum(_.map(this.total[index][key]))
  }

  setRes = (element: Element, value: number) => {
    this.res[element] = value
  }

  getDefMult = (level: number, defPen: number = 0, defRed: number = 0) => {
    const base = _.includes(this.enemy, 'Trot') ? 300 : 200
    const growth = _.includes(this.enemy, 'Trot') ? 15 : 10
    const def = (base + growth * (+this.level || 1)) * _.max([1 - defPen - defRed, 0])

    return 1 - def / (def + 200 + 10 * level)
  }

  getResMult = (element: Element, resPen: number) => {
    if (this.res[element] === Infinity) return 0
    const res = this.res[element] / 100 - resPen
    return 1 - res
  }

  getEffRes = (reduction?: number) => {
    return this.effRes + (+this.level >= 51 ? _.min([0.1, 0.004 * (+this.level - 50)]) : 0) - reduction
  }

  hydrate = (data: CalculatorStoreType) => {
    if (!data) return

    this.form = data.form || []
  }
}
