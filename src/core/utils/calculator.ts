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
import { RelicSets } from '@src/data/db/artifacts'
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
  for (const trace of char.minor_traces) {
    if (trace?.toggled) conditionals[trace?.stat] += trace?.value
  }

  // Get Ascension
  // conditionals[weaponData?.ascStat] += weaponSecondary
  // conditionals[character?.stat?.ascStat] +=
  //   _.max([0, char?.ascension - 2]) * AscensionGrowth[character?.stat?.ascStat]?.[character?.rarity - 4]

  conditionals = weaponBonus?.scaling(conditionals, weapon?.refinement) || conditionals

  return conditionals
}

export const addArtifactStats = (
  conditionals: StatsObject,
  artifacts: IArtifactEquip[],
  weapon: PathType,
  team: ITeamChar[]
) => {
  const setBonus = getSetCount(artifacts)
  _.forEach(artifacts, (item) => {
    conditionals[item.main] += getMainStat(item.main, item.quality, item.level)
    _.forEach(item.subList, (sub) => {
      conditionals[sub.stat] += correctSubStat(sub.stat, sub.value)
    })
  })
  _.forEach(setBonus, (value, key) => {
    if (value >= 2) {
      const bonuses = _.find(RelicSets, ['id', key])?.bonus
      const half = _.find(RelicSets, ['id', key])?.half
      _.forEach(bonuses, (item) => {
        conditionals[item.stat] += item.value
      })
      if (half) conditionals = half(conditionals)
    }
    if (value >= 4) {
      const add = _.find(RelicSets, ['id', key])?.add
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
}
