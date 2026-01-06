import { AllRelicSets, RelicSets } from '@src/data/db/artifacts'
import { Characters } from '@src/data/db/characters'
import { Enemies } from '@src/data/db/enemies'
import { LightCones } from '@src/data/db/lightcone'
import { baseStatsObject, StatsArray } from '@src/data/lib/stats/baseConstant'
import { DebuffTypes } from '@src/domain/constant'
import { Element } from '@src/domain/constant'
import _ from 'lodash'

export const findLightCone = (wId: string) => _.find(LightCones, (item) => item.id === wId)

export const findCharacter = (cId: string) => _.find(Characters, (item) => item.id === cId)

export const findArtifactSet = (id: string) => _.find(AllRelicSets, (item) => item.id === id)

export const findEnemy = (name: string) => _.find(Enemies, (item) => item.name === name)

export const findContentById = (content: any[], id: string) => _.find(content, ['id', id])

export const isSubsetOf = (a: any[], b: any[]) => _.every(a, (item) => _.includes(b, item))

export const addDebuff = (debuffs: { type: DebuffTypes; count: number }[], type: DebuffTypes, count: number = 1) =>
  (_.find(debuffs, (item) => item.type === type).count += count)

export const countDot = (debuffs: { type: DebuffTypes; count: number }[], type?: DebuffTypes) =>
  _.sumBy(
    _.filter(debuffs, (d) =>
      _.includes(
        type
          ? [DebuffTypes.DOT, type]
          : _.map([DebuffTypes.DOT, DebuffTypes.BURN, DebuffTypes.BLEED, DebuffTypes.WIND_SHEAR, DebuffTypes.SHOCKED]),
        d.type
      )
    ),
    (item) => item.count
  )

export const countDebuff = (debuffs: { type: DebuffTypes; count: number }[], type?: DebuffTypes) =>
  _.sumBy(type ? _.filter(debuffs, (d) => d.type === type) : debuffs, (item) => item.count)

export const checkBuffExist = (array: StatsArray[], predicate: Partial<StatsArray>) =>
  _.size(_.filter(array, (item) => _.every(predicate, (value, key) => item[key] === value))) >= 1

export const checkIsDoT = (element: Element) =>
  _.includes([Element.FIRE, Element.PHYSICAL, Element.LIGHTNING, Element.WIND], element)

export const findValidName = (names: string[], name: string, count: number = 0) => {
  if (_.some(names, (n) => (count > 0 ? n === `${name} (${count})` : n === name))) {
    return findValidName(names, name, count + 1)
  } else {
    return count > 0 ? `${name} (${count})` : name
  }
}

export const compareWeight = (a: string, b: string) => {
  const aWeight = a ? Number(a.replaceAll('P', '').replaceAll('N', '-')) : 0
  const bWeight = b ? Number(b.replaceAll('P', '').replaceAll('N', '-')) : 0

  return aWeight - bWeight
}

export const checkInclusiveKey = (form: Record<string, any>, id: string) =>
  _.some(form, (value, key) => !!value && _.startsWith(key, id))

export const countOwnDebuffs = (own: typeof baseStatsObject, index: number) => {
  if (!own) return 0

  const base = _.size(
    _.filter(
      _.concat(
        own.EHR_RED,
        own.EHR_RED,
        own.ATK_REDUCTION,
        own.DEF_REDUCTION,
        own.DEF_REDUCTION,
        own.SPD_REDUCTION,
        own.ICE_RES_RED,
        own.FIRE_RES_RED,
        own.WIND_RES_RED,
        own.PHYSICAL_RES_RED,
        own.QUANTUM_RES_RED,
        own.IMAGINARY_RES_RED,
        own.WEAKEN,
        own.VULNERABILITY,
        own.DOT_VUL,
        own.FIRE_VUL,
        own.BREAK_VUL,
        own.FUA_VUL,
        own.ULT_VUL,
        own.ADD_DEBUFF
      ),
      (item) => item.source === 'Self'
    )
  )
  const dot = _.size(_.filter(own.DOT_SCALING, (item) => item.overrideIndex === index))

  return base + dot
}
