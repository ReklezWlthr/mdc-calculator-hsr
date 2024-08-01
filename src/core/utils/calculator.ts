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
import { findCharacter, findLightCone } from '../utils/finder'
import { AllRelicSets, RelicSets } from '@src/data/db/artifacts'
import { baseStatsObject, StatsObject } from '@src/data/lib/stats/baseConstant'
import LightConeBonus from '@src/data/lib/stats/conditionals/lightcones/lc_bonus'
import { TalentScalingStyle } from '@src/domain/conditional'

export const calculateOutOfCombat = (
  conditionals: StatsObject,
  selected: number,
  team: ITeamChar[],
  artifacts: IArtifactEquip[]
) => {
  if (!_.size(team) || !team?.[selected]) return conditionals
  const base = calculateBase(conditionals, team[selected], team[selected]?.equipments?.weapon)
  const final = addArtifactStats(base, artifacts)

  return final
}

export const calculateFinal = (conditionals: StatsObject) => {
  const cb = conditionals.CALLBACK
  let x = conditionals
  _.forEach(cb, (item) => {
    x = item(x, [], [], [], false)
  })
  return x
}

export const calculateBase = (conditionals: StatsObject, char: ITeamChar, weapon: IWeaponEquip) => {
  const character = findCharacter(char?.cId)
  const weaponData = findLightCone(weapon?.wId)

  conditionals.NAME = character?.name?.replaceAll(/\(\w+\)/g, '')?.trim()
  conditionals.ELEMENT = character?.element
  conditionals.PATH = character?.path

  conditionals.BASE_ATK_C = getBaseStat(character?.stat?.baseAtk, char?.level, char?.ascension) || 0
  conditionals.BASE_HP_C = getBaseStat(character?.stat?.baseHp, char?.level, char?.ascension) || 0
  conditionals.BASE_DEF_C = getBaseStat(character?.stat?.baseDef, char?.level, char?.ascension) || 0
  conditionals.BASE_ATK_L = getWeaponBase(weaponData?.baseAtk, weapon?.level, weapon?.ascension) || 0
  conditionals.BASE_HP_L = getWeaponBase(weaponData?.baseHp, weapon?.level, weapon?.ascension) || 0
  conditionals.BASE_DEF_L = getWeaponBase(weaponData?.baseDef, weapon?.level, weapon?.ascension) || 0
  const weaponBonus =
    character?.path === weaponData?.type ? _.find(LightConeBonus, (item) => item.id === weapon?.wId) : undefined

  // Get Base
  conditionals.BASE_ATK = conditionals.BASE_ATK_C + conditionals.BASE_ATK_L
  conditionals.BASE_HP = conditionals.BASE_HP_C + conditionals.BASE_HP_L
  conditionals.BASE_DEF = conditionals.BASE_DEF_C + conditionals.BASE_DEF_L
  conditionals.BASE_SPD = character?.stat?.baseSpd || 0
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

  conditionals = weaponBonus?.scaling(conditionals, weapon?.refinement) || conditionals

  return conditionals
}

export const addArtifactStats = (conditionals: StatsObject, artifacts: IArtifactEquip[]) => {
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
      name: `Main Stat`,
      source: 'Relic',
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
      name: `Sub Stat`,
      source: 'Relic',
      value: item,
    })
  })
  _.forEach(setBonus, (value, key) => {
    if (value >= 2) {
      const bonuses = _.find(AllRelicSets, ['id', key])?.bonus
      _.forEach(bonuses, (item) => {
        conditionals[item.stat].push({
          name: '2-Piece',
          source: _.find(AllRelicSets, ['id', key])?.name,
          value: item.value,
        })
      })
    }
    if (value >= 4) {
      const bonuses = _.find(AllRelicSets, ['id', key])?.bonusAdd
      _.forEach(bonuses, (item) => {
        conditionals[item.stat].push({
          name: '4-Piece',
          source: _.find(AllRelicSets, ['id', key])?.name,
          value: item.value,
        })
      })
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
    return _.round(
      _.reduce(
        Array(level - 1 || 0),
        (acc, _, index) => acc + (index > 4 && index <= 8 ? growth * 1.25 : growth),
        base
      ),
      4
    )
  if (type === 'heal')
    return _.round(
      _.reduce(Array(level - 1 || 0), (acc, _, index) => acc + (index <= 3 ? growth : growth * 0.8), base),
      4
    )
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
        acc + (index <= 1 ? growth : index === 2 ? growth * 1.4 : index <= 8 ? growth * 1.1 : growth * 0.6),
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
