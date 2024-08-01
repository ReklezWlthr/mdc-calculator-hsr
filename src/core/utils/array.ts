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
    this.__ref = _.orderBy([...this.__ref, { value, weight }], 'weight', 'asc')
    return length
  }

  get minWeight() {
    return _.head(this.__ref)?.weight
  }

  get maxWeight() {
    return _.last(this.__ref)?.weight
  }
}
