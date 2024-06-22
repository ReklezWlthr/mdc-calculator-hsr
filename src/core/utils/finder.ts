import { AllRelicSets, RelicSets } from '@src/data/db/artifacts'
import { Characters as GIChar } from '@src/data/db/characters'
import { LightCones } from '@src/data/db/lightcone'
import { StatsArray } from '@src/data/lib/stats/baseConstant'
import { DebuffTypes } from '@src/domain/conditional'
import _ from 'lodash'

export const findLightCone = (wId: string) => _.find(LightCones, (item) => item.id === wId)

export const findCharacter = (cId: string) => _.find(GIChar, (item) => item.id === cId)

export const findArtifactSet = (id: string) => _.find(AllRelicSets, (item) => item.id === id)

export const findContentById = (content: any[], id: string) => _.find(content, ['id', id])

export const isSubsetOf = (a: any[], b: any[]) => _.every(a, (item) => _.includes(b, item))

export const addDebuff = (debuffs: { type: DebuffTypes; count: number }[], type: DebuffTypes, count: number = 1) =>
  (_.find(debuffs, (item) => item.type === type).count += count)

export const countDot = (debuffs: { type: DebuffTypes; count: number }[], type: DebuffTypes) =>
  _.sumBy(
    _.filter(debuffs, (d) => _.includes([DebuffTypes.DOT, type], d.type)),
    (item) => item.count
  )

export const countDebuff = (debuffs: { type: DebuffTypes; count: number }[], type?: DebuffTypes) =>
  _.sumBy(type ? _.filter(debuffs, (d) => d.type === type) : debuffs, (item) => item.count)

export const checkBuffExist = (array: StatsArray[], predicate: Partial<StatsArray>) =>
  _.size(_.filter(array, (item) => _.every(predicate, (value, key) => item[key] === value))) >= 1
