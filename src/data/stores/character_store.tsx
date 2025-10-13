import { ICharStore } from '@src/domain/constant'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { enableStaticRendering } from 'mobx-react-lite'
import { Characters } from '../db/characters'
import { formatMinorTrace } from '../../core/utils/data_format'
import { findCharacter } from '@src/core/utils/finder'

enableStaticRendering(typeof window === 'undefined')

export const DefaultCharacterStore: ICharStore = {
  level: 1,
  ascension: 0,
  cons: 0,
  cId: null,
  talents: {
    basic: 1,
    skill: 1,
    ult: 1,
    talent: 1,
    memo_skill: 1,
    memo_talent: 1,
  },
  minor_traces: Array(10),
  major_traces: {
    a2: false,
    a4: false,
    a6: false,
  },
}

export const MaxedCharacterStore: ICharStore = {
  level: 80,
  ascension: 6,
  cons: 0,
  cId: null,
  talents: {
    basic: 6,
    skill: 10,
    ult: 10,
    talent: 10,
    memo_skill: 6,
    memo_talent: 6,
  },
  minor_traces: Array(10),
  major_traces: {
    a2: true,
    a4: true,
    a6: true,
  },
}

export const DefaultAccount = _.map(['8001', '1001', '1002'], (item) => ({
  ...DefaultCharacterStore,
  cId: item,
  minor_traces: formatMinorTrace(findCharacter(item)?.trace, Array(10).fill(false)),
}))

export interface CharacterStoreType {
  characters: ICharStore[]
  selected: string
  loading: boolean
  hydrated: boolean
  setValue: <k extends keyof this>(key: k, value: this[k]) => void
  addChar: (char: ICharStore) => boolean
  editChar: (id: string, char: ICharStore) => boolean
  deleteChar: (id: string) => boolean
  hydrateCharacters: (data: ICharStore[]) => void
  hydrate: (data: CharacterStoreType) => void
}

export class CharacterStore {
  characters: ICharStore[]
  selected: string
  loading: boolean
  hydrated: boolean = false

  constructor() {
    this.characters = DefaultAccount
    this.selected = _.head(_.orderBy(Characters, ['name'])).id
    this.loading = true

    makeAutoObservable(this)
  }

  setValue = <k extends keyof this>(key: k, value: this[k]) => {
    this[key] = value
  }

  addChar = (char: ICharStore) => {
    if (!char) return false
    this.characters = [char, ...this.characters]
    return true
  }

  editChar = (id: string, char: ICharStore) => {
    if (!char || !id) return false
    const index = _.findIndex(this.characters, ['cId', id])
    this.characters[index] = char
    this.characters = [...this.characters]
    return true
  }

  deleteChar = (id: string) => {
    if (!id) return false
    const index = _.findIndex(this.characters, ['cId', id])
    this.characters.splice(index, 1)
    this.characters = [...this.characters]
    return true
  }

  hydrateCharacters = (data: ICharStore[]) => {
    this.characters = data || DefaultAccount
  }

  hydrate = (data: CharacterStoreType) => {
    if (!data) return

    this.characters = data.characters || DefaultAccount
  }
}
