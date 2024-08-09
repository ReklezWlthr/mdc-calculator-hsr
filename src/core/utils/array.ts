import _ from 'lodash'

export class WeightedArray<T> extends Array {
  __ref: { weight: number; value: T }[]

  constructor() {
    super()
    this.__ref = []
    return new Proxy(this, {
      get: function (target, name) {
        if (typeof name === 'symbol' || _.isNaN(Number(name))) return target[name]
        return target.__ref[name]?.value
      },
    })
  }

  push(value: T, weight: number = 0) {
    const length = super.push(value)
    const newRef = _.cloneDeep(this.__ref)
    newRef.push({ value, weight })
    this.__ref = newRef.sort((a, b) => a.weight - b.weight)
    return length
  }

  get minWeight() {
    return _.head(this.__ref)?.weight
  }

  get maxWeight() {
    return _.last(this.__ref)?.weight
  }
}
