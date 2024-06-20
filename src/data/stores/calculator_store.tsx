import { Element, ICharStore } from '@src/domain/constant'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { enableStaticRendering } from 'mobx-react-lite'
import { StatsObject, StatsObjectKeysT } from '../lib/stats/baseConstant'

enableStaticRendering(typeof window === 'undefined')

export interface CalculatorStoreType {
  form: Record<string, any>[]
  computedStats: StatsObject[]
  selected: number
  res: Record<Element, number>
  broken: boolean
  weakness: Element[]
  level: number
  custom: { name: StatsObjectKeysT; value: number; debuff: boolean }[][]
  setValue: <k extends keyof this>(key: k, value: this[k]) => void
  initForm: (initData: Record<string, any>[]) => void
  setFormValue: (index: number, key: string, value: any) => void
  setCustomValue: (index: number, key: StatsObjectKeysT, value: any) => void
  removeCustomValue: (index: number, innerIndex: number) => void
  setRes: (element: Element, value: number) => void
  hydrate: (data: CalculatorStoreType) => void
}

export class CalculatorStore {
  form: Record<string, any>[]
  computedStats: StatsObject[]
  res: Record<Element, number>
  broken: boolean
  weakness: Element[]
  level: number
  selected: number
  custom: { name: StatsObjectKeysT; value: number; debuff: boolean }[][]

  constructor() {
    this.form = Array(4)
    this.computedStats = Array(4)
    this.selected = 0
    this.level = 1
    this.broken = false
    this.weakness = []
    this.res = {
      [Element.PHYSICAL]: 0,
      [Element.FIRE]: 0,
      [Element.ICE]: 0,
      [Element.LIGHTNING]: 0,
      [Element.WIND]: 0,
      [Element.QUANTUM]: 0,
      [Element.IMAGINARY]: 0,
    }
    this.custom = Array(4)

    makeAutoObservable(this)
  }

  setValue = <k extends keyof this>(key: k, value: this[k]) => {
    this[key] = value
  }

  initForm = (initData: Record<string, any>[]) => {
    const mergedData = _.map(initData, (item, index) =>
      _.mapValues(item, (value, key) => {
        const old = this.form[index]?.[key]
        return _.isUndefined(old) ? value : old
      })
    )
    this.form = _.cloneDeep(mergedData)
  }

  setFormValue = (index: number, key: string, value: any) => {
    this.form[index][key] = value
    this.form = _.cloneDeep(this.form)
  }

  setCustomValue = (index: number, innerIndex: number, key: StatsObjectKeysT, value: any, debuff: boolean = false) => {
    if (innerIndex < 0) {
      this.custom[index] = [...(this.custom[index] || []), { name: key, value, debuff }]
    } else {
      this.custom[index].splice(innerIndex, 1, { name: key, value, debuff })
    }
    this.custom = _.cloneDeep(this.custom)
  }

  removeCustomValue = (index: number, innerIndex: number) => {
    this.custom[index].splice(innerIndex, 1)
    this.custom = _.cloneDeep(this.custom)
  }

  setRes = (element: Element, value: number) => {
    this.res[element] = value
  }

  getDefMult = (level: number, defPen: number = 0, defRed: number = 0) => {
    return _.min([(level + 20) / ((this.level + 20) * (1 - defPen - defRed) + level + 20), 1])
  }

  getResMult = (element: Element, resPen: number) => {
    if (this.res[element] === Infinity) return 0
    const res = this.res[element] / 100 - resPen
    return 1 - res
  }

  hydrate = (data: CalculatorStoreType) => {
    if (!data) return

    this.form = data.form || []
  }
}
