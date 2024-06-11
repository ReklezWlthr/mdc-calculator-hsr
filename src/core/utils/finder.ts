import { AllRelicSets, RelicSets } from '@src/data/db/artifacts'
import { Characters as GIChar } from '@src/data/db/characters'
import { Weapons } from '@src/data/db/weapons'
import { DebuffTypes } from '@src/domain/conditional'
import _ from 'lodash'

export const findWeapon = (wId: string) => _.find(Weapons, (item) => item.id === wId)

export const findCharacter = (cId: string) => _.find(GIChar, (item) => item.id === cId)

export const findArtifactSet = (id: string) => _.find(AllRelicSets, (item) => item.id === id)

export const findContentById = (content: any[], id: string) => _.find(content, ['id', id])

export const isSubsetOf = (a: any[], b: any[]) => _.every(a, (item) => _.includes(b, item))

export const addDebuff = (debuffs: { type: DebuffTypes; count: number }[], type: DebuffTypes, count: number = 1) =>
  (_.find(debuffs, (item) => item.type === type).count += count)
