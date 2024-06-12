import {
  correctSubStat,
  getBaseStat,
  getMainStat,
  getResonanceCount,
  getSetCount,
  getWeaponBase,
  getWeaponBonus,
} from '../utils/data_format'
import _ from 'lodash'
import { Element, IArtifactEquip, ITeamChar, IWeaponEquip, Stats, PathType } from '@src/domain/constant'
import { findCharacter, findWeapon } from '../utils/finder'
import { AllRelicSets, RelicSets } from '@src/data/db/artifacts'
import { baseStatsObject, StatsObject } from '@src/data/lib/stats/baseConstant'
import WeaponBonus from '@src/data/lib/stats/conditionals/weapons/weapon_bonus'
import { TalentScalingStyle } from '@src/domain/conditional'

export const calculateOutOfCombat = (
  conditionals: StatsObject,
  selected: number,
  team: ITeamChar[],
  artifacts: IArtifactEquip[]
) => {
  if (!_.size(team)) return conditionals
  const base = calculateBase(conditionals, team[selected], team[selected]?.equipments?.weapon)
  const final = addArtifactStats(base, artifacts, findWeapon(team[selected]?.equipments?.weapon?.wId)?.type, team)

  return final
}

export const calculateFinal = (conditionals: StatsObject) => {
  const cb = conditionals.CALLBACK
  let x = conditionals
  _.forEach(cb, (item) => {
    x = item(x, [], [], [])
  })
  return x
}

export const calculateBase = (conditionals: StatsObject, char: ITeamChar, weapon: IWeaponEquip) => {
  const character = findCharacter(char?.cId)
  const weaponData = findWeapon(weapon?.wId)

  const charBaseAtk = getBaseStat(character?.stat?.baseAtk, char?.level, char?.ascension)
  // const weaponBaseAtk = getWeaponBase(weaponData?.tier, weapon?.level, weapon?.ascension, weaponData?.rarity)
  // const weaponSecondary = getWeaponBonus(weaponData?.baseStat, weapon?.level)
  const weaponBonus = _.find(WeaponBonus, (item) => item.id === weapon?.wId)

  // Get Base
  conditionals.BASE_ATK = charBaseAtk
  conditionals.BASE_HP = getBaseStat(character?.stat?.baseHp, char?.level, char?.ascension)
  conditionals.BASE_DEF = getBaseStat(character?.stat?.baseDef, char?.level, char?.ascension)
  conditionals.BASE_SPD = character?.stat?.baseSpd
  conditionals.MAX_ENERGY = character?.stat?.energy

  // Get Traces
  const traces = _.every(char.minor_traces)
    ? _.reduce(
        char.minor_traces,
        (acc, curr) => {
          if (!acc[curr?.stat]) acc[curr?.stat] = 0
          acc[curr?.stat] += curr?.toggled ? curr?.value : 0
          return acc
        },
        {} as Record<Stats, number>
      )
    : {}
  for (const trace in traces) {
    conditionals[trace].push({
      value: traces[trace],
      source: 'Self',
      name: 'Minor Traces',
    })
  }

  // Get Ascension
  // conditionals[weaponData?.ascStat] += weaponSecondary
  // conditionals[character?.stat?.ascStat] +=
  //   _.max([0, char?.ascension - 2]) * AscensionGrowth[character?.stat?.ascStat]?.[character?.rarity - 4]

  conditionals = weaponBonus?.scaling(conditionals, weapon?.refinement) || conditionals

  // Gallagher
  if (character?.id === '1301' && char?.cons >= 6)
    conditionals[Stats.BE].push({
      name: 'Eidolon 6',
      source: 'Self',
      value: 0.2,
    })

  // Black Swan
  if (character?.id === '1307' && char?.major_traces?.a6)
    conditionals.CALLBACK.push((base) => {
      base[Stats.ALL_DMG].push({
        name: 'Ascension 6 Passive',
        source: 'Self',
        value: _.min([base[Stats.EHR] * 0.6, 0.72]),
      })
      return base
    })

  return conditionals
}

export const addArtifactStats = (
  conditionals: StatsObject,
  artifacts: IArtifactEquip[],
  weapon: PathType,
  team: ITeamChar[]
) => {
  const setBonus = getSetCount(artifacts)
  const main = _.reduce(
    artifacts,
    (acc, curr) => {
      if (!acc[curr?.main]) acc[curr?.main] = 0
      acc[curr?.main] += getMainStat(curr.main, curr.quality, curr.level)
      return acc
    },
    {} as Record<Stats, number>
  )
  _.forEach(main, (item, key) => {
    conditionals[key].push({
      name: `Relic Main Stat`,
      source: 'Self',
      value: item,
    })
  })
  const sub = _.reduce(
    _.flatMap(artifacts, (item) => item.subList),
    (acc, curr) => {
      if (!acc[curr?.stat]) acc[curr?.stat] = 0
      acc[curr?.stat] += correctSubStat(curr.stat, curr.value)
      return acc
    },
    {} as Record<Stats, number>
  )
  _.forEach(sub, (item, key) => {
    conditionals[key].push({
      name: `Relic Sub Stat`,
      source: 'Self',
      value: item,
    })
  })
  _.forEach(setBonus, (value, key) => {
    if (value >= 2) {
      const bonuses = _.find(AllRelicSets, ['id', key])?.bonus
      const half = _.find(AllRelicSets, ['id', key])?.half
      _.forEach(bonuses, (item) => {
        conditionals[item.stat].push({
          name: _.find(AllRelicSets, ['id', key])?.name,
          source: 'Self',
          value: item.value,
        })
      })
      if (half) conditionals = half(conditionals)
    }
    if (value >= 4) {
      const add = _.find(AllRelicSets, ['id', key])?.add
      if (add) conditionals = add(conditionals, weapon, team)
    }
  })

  return conditionals
}

export const getTeamOutOfCombat = (chars: ITeamChar[], artifacts: IArtifactEquip[]) => {
  return [
    calculateOutOfCombat(
      _.cloneDeep(baseStatsObject),
      0,
      chars,
      _.filter(artifacts, (item) => _.includes(chars?.[0]?.equipments?.artifacts, item.id))
    ),
    calculateOutOfCombat(
      _.cloneDeep(baseStatsObject),
      1,
      chars,
      _.filter(artifacts, (item) => _.includes(chars?.[1]?.equipments?.artifacts, item.id))
    ),
    calculateOutOfCombat(
      _.cloneDeep(baseStatsObject),
      2,
      chars,
      _.filter(artifacts, (item) => _.includes(chars?.[2]?.equipments?.artifacts, item.id))
    ),
    calculateOutOfCombat(
      _.cloneDeep(baseStatsObject),
      3,
      chars,
      _.filter(artifacts, (item) => _.includes(chars?.[3]?.equipments?.artifacts, item.id))
    ),
  ]
}

export const calcScaling = (base: number, growth: number, level: number, type: TalentScalingStyle) => {
  if (level === 1) return base
  if (type === 'linear') return base + growth * (level - 1)
  if (type === 'curved')
    return _.reduce(
      Array(level - 1 || 0),
      (acc, _, index) => acc + (index > 4 && index <= 8 ? growth * 1.25 : growth),
      base
    )
  if (type === 'heal')
    return _.reduce(Array(level - 1 || 0), (acc, _, index) => acc + (index <= 3 ? growth : growth * 0.8), base)
  if (type === 'flat')
    return _.reduce(
      Array(level - 1 || 0),
      (acc, _, index) =>
        acc +
        (index === 0
          ? growth
          : index <= 2
          ? growth * 0.75
          : index <= 4
          ? growth * 0.75 * (2 / 3)
          : growth * 0.75 * 0.75 * (2 / 3)),
      base
    )
  if (type === 'dot')
    return _.reduce(
      Array(level - 1 || 0),
      (acc, _, index) =>
        acc +
        (index <= 3
          ? growth
          : index === 4
          ? growth * 1.5
          : index === 5
          ? growth * 2
          : index === 6
          ? growth * 2.5
          : index <= 8
          ? growth * 3
          : growth * 1.3),
      base
    )
  if (type === 'pure')
    return _.reduce(
      Array(level - 1 || 0),
      (acc, _, index) =>
        acc + (index <= 1 ? growth : index === 2 ? growth * 1.4 : index <= 10 ? growth * 1.1 : growth * 0.6),
      base
    )
  if (type === 'arcana')
    return _.reduce(
      Array(level - 1 || 0),
      (acc, _, index) =>
        acc + (index <= 4 ? growth * 1.32 : index <= 6 ? growth * 1.2 : index <= 8 ? growth * 1.5 : growth),
      base
    )
}
