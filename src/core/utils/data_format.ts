import { MainStatValue, SubStatMap } from '@src/domain/artifact'
import { Element, IArtifactEquip, ICharacter, ITeamChar, Stats } from '@src/domain/constant'
import _ from 'lodash'
import { findCharacter } from './finder'
import { TraceScaling } from '@src/domain/scaling'
import { ITalentDisplay } from '@src/domain/conditional'
import { calcScaling } from './calculator'

export const escapeRegex = (string: string) => {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')
}

export const findBaseLevel = (ascension: number) => {
  if (ascension < 0 || ascension > 6) return 0
  if (ascension === 0) return 1
  return (ascension + 1) * 10
}

export const findMaxLevel = (ascension: number) => {
  if (ascension < 0 || ascension > 6) return 0
  if (ascension === 0) return 20
  return findBaseLevel(ascension) + 10
}

export const isLevelInRange = (ascension: number, level: number) => {
  const low = findBaseLevel(ascension)
  const high = findMaxLevel(ascension)
  return level >= low && level <= high
}

export const findMaxTalentLevel = (ascension: number) => {
  if (ascension < 0 || ascension > 6) return 0
  if (ascension <= 3) return ascension + 1
  return (ascension - 1) * 2
}

export const getBaseStat = (base: number, level: number = 1, ascension: number = 0) => {
  const growth = base / 20
  return base * (1 + 0.4 * ascension) + growth * (level - 1)
}

export const getWeaponBase = (base: number, level: number = 0, ascension: number = 0) => {
  if (!base) return 0
  const growth = base * (3 / 20)
  return base * (1 + (ascension >= 1 ? 1.2 : 0) + 1.6 * _.max([ascension - 1, 0])) + growth * (level - 1)
}

export const getWeaponBonus = (base: number, level: number) => {
  // const index = _.floor(level / 5)
  // const scaling = WeaponSecondaryScaling[index]
  // return base * scaling
}

export const getMainStat = (main: Stats, quality: number, level: number) => {
  const entry = _.find(MainStatValue, (item) => item.rarity === quality && _.includes(item.stat, main))
  return entry?.base + entry?.growth * level
}

export const getRolls = (stat: Stats, value: number) => {
  const low = _.find(SubStatMap, (item) => item.stat === stat)?.min
  const roundValue = value / (_.includes([Stats.ATK, Stats.HP, Stats.DEF, Stats.SPD], stat) ? 1 : 100)

  return _.min([6, _.max([roundValue > 0 ? 1 : 0, _.floor(roundValue / low)])])
}

export const correctSubStat = (stat: Stats, value: number) => {
  const data = _.find(SubStatMap, (item) => item.stat === stat)
  const low = data?.min
  const bonus = data?.bonus

  const roundValue = value / (_.includes([Stats.ATK, Stats.HP, Stats.DEF, Stats.SPD], stat) ? 1 : 100)

  const rolls = getRolls(stat, value)
  const accLow = low * rolls
  const bonusRolls = _.round((_.max([roundValue, accLow]) % accLow) / bonus)

  return accLow + bonus * bonusRolls
}

export const getSetCount = (artifacts: IArtifactEquip[]) => {
  const setBonus: Record<string, number> = _.reduce(
    artifacts,
    (acc, curr) => {
      if (!curr) return acc
      acc[curr.setId] ? (acc[curr.setId] += 1) : (acc[curr.setId] = 1)
      return acc
    },
    {}
  )
  return setBonus
}

export const getResonanceCount = (chars: ITeamChar[]) => {
  if (_.size(chars) < 4) return {}
  const charData = _.map(chars, (item) => findCharacter(item.cId))
  const setBonus: Record<string, number> = _.reduce(
    charData,
    (acc, curr) => {
      if (!curr) return acc
      acc[curr.element] ? (acc[curr.element] += 1) : (acc[curr.element] = 1)
      return acc
    },
    {}
  )
  return setBonus
}

export const calcRefinement = (base: number, growth: number, refinement: number) => {
  return base + growth * (refinement - 1)
}

export const formatIdIcon = (id: string, gender: 'PlayerBoy' | 'PlayerGirl') => {
  const isTb = _.head(id) === '8'
  if (isTb) return (parseInt(id) + (gender === 'PlayerBoy' ? 0 : 1)).toString()
  return id
}

export const formatMinorTrace = (stats: Stats[], defaultValue: boolean[]) => {
  return [
    { stat: stats?.[0], value: TraceScaling[stats?.[0]]?.[0], toggled: defaultValue[0] },
    { stat: stats?.[0], value: TraceScaling[stats?.[0]]?.[0], toggled: defaultValue[1] },
    { stat: stats?.[0], value: TraceScaling[stats?.[0]]?.[1], toggled: defaultValue[2] },
    { stat: stats?.[0], value: TraceScaling[stats?.[0]]?.[1], toggled: defaultValue[3] },
    { stat: stats?.[0], value: TraceScaling[stats?.[0]]?.[2], toggled: defaultValue[4] },
    { stat: stats?.[1], value: TraceScaling[stats?.[1]]?.[0], toggled: defaultValue[5] },
    { stat: stats?.[1], value: TraceScaling[stats?.[1]]?.[1], toggled: defaultValue[6] },
    { stat: stats?.[2], value: TraceScaling[stats?.[2]]?.[0], toggled: defaultValue[7] },
    { stat: stats?.[2], value: TraceScaling[stats?.[2]]?.[1], toggled: defaultValue[8] },
    { stat: stats?.[2], value: TraceScaling[stats?.[2]]?.[2], toggled: defaultValue[9] },
  ]
}

export const formatScaleString = (talent: ITalentDisplay, level: number) =>
  _.reduce(
    Array.from(talent?.content?.matchAll(/{{\d+}}\%?/g) || []),
    (acc, curr) => {
      const index = curr?.[0]?.match(/\d+/)?.[0]
      const isPercentage = !!curr?.[0]?.match(/\%$/)
      return _.replace(
        acc,
        curr[0],
        `<span class="text-desc">${_.round(
          calcScaling(
            talent?.value?.[index]?.base,
            talent?.value?.[index]?.growth,
            level,
            talent?.value?.[index]?.style
          ),
          1
        ).toLocaleString()}${isPercentage ? '%' : ''}</span>`
      )
    },
    talent?.content
  )
