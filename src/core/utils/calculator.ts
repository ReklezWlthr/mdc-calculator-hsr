import {
  calcAdditive,
  calcAmplifying,
  correctSubStat,
  getBaseStat,
  getMainStat,
  getResonanceCount,
  getSetCount,
  getWeaponBase,
  getWeaponBonus,
} from '../utils/data_format'
import _ from 'lodash'
import { Element, IArtifactEquip, ITeamChar, IWeaponEquip, Stats, WeaponType } from '@src/domain/constant'
import { AscensionGrowth, BaseReactionDmg } from '@src/domain/scaling'
import { findCharacter, findWeapon } from '../utils/finder'
import { ArtifactSets } from '@src/data/db/artifacts'
import { baseStatsObject, StatsObject } from '@src/data/lib/stats/baseConstant'
import WeaponBonus from '@src/data/lib/stats/conditionals/weapons/weapon_bonus'

export const calculateOutOfCombat = (
  conditionals: StatsObject,
  selected: number,
  team: ITeamChar[],
  artifacts: IArtifactEquip[],
  applyResonance: boolean = true
) => {
  if (!_.size(team)) return conditionals
  const base = calculateBase(conditionals, team[selected], team[selected]?.equipments?.weapon)
  const withArtifacts = addArtifactStats(
    base,
    artifacts,
    findWeapon(team[selected]?.equipments?.weapon?.wId)?.type,
    team
  )
  const final = applyResonance ? addResonance(withArtifacts, team) : withArtifacts

  return final
}

export const calculateFinal = (conditionals: StatsObject) => {
  const cb = conditionals.CALLBACK
  let x = conditionals
  _.forEach(cb, (item) => {
    x = item(x)
  })
  return x
}

export const calculateBase = (conditionals: StatsObject, char: ITeamChar, weapon: IWeaponEquip) => {
  const character = findCharacter(char?.cId)
  const weaponData = findWeapon(weapon?.wId)

  const charBaseAtk = getBaseStat(
    character?.stat?.baseAtk,
    char?.level,
    character?.stat?.ascAtk,
    char?.ascension,
    character?.rarity
  )
  const weaponBaseAtk = getWeaponBase(weaponData?.tier, weapon?.level, weapon?.ascension, weaponData?.rarity)
  const weaponSecondary = getWeaponBonus(weaponData?.baseStat, weapon?.level)
  const weaponBonus = _.find(WeaponBonus, (item) => item.id === weapon?.wId)

  // Get Base
  conditionals.BASE_ATK = charBaseAtk + weaponBaseAtk
  conditionals.BASE_HP = getBaseStat(
    character?.stat?.baseHp,
    char?.level,
    character?.stat?.ascHp,
    char?.ascension,
    character?.rarity
  )
  conditionals.BASE_DEF = getBaseStat(
    character?.stat?.baseDef,
    char?.level,
    character?.stat?.ascDef,
    char?.ascension,
    character?.rarity
  )

  // Get Ascension
  conditionals[weaponData?.ascStat] += weaponSecondary
  conditionals[character?.stat?.ascStat] +=
    _.max([0, char?.ascension - 2]) * AscensionGrowth[character?.stat?.ascStat]?.[character?.rarity - 4]

  conditionals = weaponBonus?.scaling(conditionals, weapon?.refinement) || conditionals

  // Kokomi Passive
  if (character?.id === '10000054') {
    conditionals[Stats.CRIT_RATE] -= 1
    conditionals[Stats.HEAL] += 0.25
  }

  // Anemo MC C2
  if (_.includes(['10000005-504', '10000005-704'], character?.id) && char?.ascension >= 2) {
    conditionals[Stats.ER] += 0.16
  }

  // Xingqiu A4
  if (character?.id === '10000025' && char?.ascension >= 4) {
    conditionals[Stats.HYDRO_DMG] += 0.2
  }

  return conditionals
}

export const addArtifactStats = (
  conditionals: StatsObject,
  artifacts: IArtifactEquip[],
  weapon: WeaponType,
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
      const bonuses = _.find(ArtifactSets, ['id', key])?.bonus
      const half = _.find(ArtifactSets, ['id', key])?.half
      _.forEach(bonuses, (item) => {
        conditionals[item.stat] += item.value
      })
      if (half) conditionals = half(conditionals)
    }
    if (value >= 4) {
      const add = _.find(ArtifactSets, ['id', key])?.add
      if (add) conditionals = add(conditionals, weapon, team)
    }
  })

  return conditionals
}

export const addResonance = (conditionals: StatsObject, team: ITeamChar[]) => {
  const resonance = getResonanceCount(team)

  if (resonance[Element.PYRO] >= 2) conditionals[Stats.P_ATK] += 0.25
  if (resonance[Element.HYDRO] >= 2) conditionals[Stats.P_HP] += 0.25
  if (resonance[Element.DENDRO] >= 2) conditionals[Stats.EM] += 50
  if (resonance[Element.GEO] >= 2) conditionals[Stats.SHIELD] += 0.15

  return conditionals
}

export const getTeamOutOfCombat = (chars: ITeamChar[], artifacts: IArtifactEquip[]) => {
  const applyRes = _.size(_.filter(chars, (item) => !!item.cId)) >= 4
  return [
    calculateOutOfCombat(
      _.cloneDeep(baseStatsObject),
      0,
      chars,
      _.filter(artifacts, (item) => _.includes(chars?.[0]?.equipments?.artifacts, item.id)),
      applyRes
    ),
    calculateOutOfCombat(
      _.cloneDeep(baseStatsObject),
      1,
      chars,
      _.filter(artifacts, (item) => _.includes(chars?.[1]?.equipments?.artifacts, item.id)),
      applyRes
    ),
    calculateOutOfCombat(
      _.cloneDeep(baseStatsObject),
      2,
      chars,
      _.filter(artifacts, (item) => _.includes(chars?.[2]?.equipments?.artifacts, item.id)),
      applyRes
    ),
    calculateOutOfCombat(
      _.cloneDeep(baseStatsObject),
      3,
      chars,
      _.filter(artifacts, (item) => _.includes(chars?.[3]?.equipments?.artifacts, item.id)),
      applyRes
    ),
  ]
}

export const calculateReaction = (conditionals: StatsObject, form: Record<string, any>, level: number) => {
  const base = BaseReactionDmg[level - 1]

  if (form.melt_forward)
    conditionals.PYRO_MULT += 2 * (1 + conditionals?.MELT_DMG + calcAmplifying(conditionals?.[Stats.EM] || 0))
  if (form.melt_reverse)
    conditionals.CRYO_MULT += 1.5 * (1 + conditionals?.MELT_DMG + calcAmplifying(conditionals?.[Stats.EM] || 0))
  if (form.vape_forward)
    conditionals.HYDRO_MULT += 2 * (1 + conditionals?.VAPE_DMG + calcAmplifying(conditionals?.[Stats.EM] || 0))
  if (form.vape_reverse)
    conditionals.PYRO_MULT += 1.5 * (1 + conditionals?.VAPE_DMG + calcAmplifying(conditionals?.[Stats.EM] || 0))
  if (form.spread)
    conditionals.DENDRO_F_DMG +=
      1.25 * base * (1 + conditionals?.SPREAD_DMG + calcAdditive(conditionals?.[Stats.EM] || 0))
  if (form.aggravate)
    conditionals.ELECTRO_F_DMG +=
      1.15 * base * (1 + conditionals?.SPREAD_DMG + calcAdditive(conditionals?.[Stats.EM] || 0))

  return conditionals
}
