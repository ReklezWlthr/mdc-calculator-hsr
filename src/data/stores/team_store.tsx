import { Element, IArtifactEquip, IBuild, ITeamChar, IWeapon, IWeaponEquip, PathType } from '@src/domain/constant'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { enableStaticRendering } from 'mobx-react-lite'
import { DefaultBuild } from './build_store'
import { swapElement } from '@src/core/utils/data_format'

enableStaticRendering(typeof window === 'undefined')

export const DefaultWeapon = {
  level: 1,
  ascension: 0,
  refinement: 1,
  wId: null,
}

export const DefaultCharacter = {
  level: 1,
  ascension: 0,
  cons: 0,
  cId: null,
  equipments: {
    weapon: DefaultWeapon,
    artifacts: Array(6),
  },
  talents: {
    basic: 1,
    skill: 1,
    ult: 1,
    talent: 1,
  },
  minor_traces: Array(10),
  major_traces: {
    a2: false,
    a4: false,
    a6: false,
  },
}

export interface TeamStoreType {
  characters: ITeamChar[]
  selected: number
  hydrated: boolean
  setValue: <k extends keyof this>(key: k, value: this[k]) => void
  setMember: (index: number, character: ITeamChar) => void
  setTalentLevel: (index: number, type: 'basic' | 'skill' | 'ult' | 'talent', level: number) => void
  setMemberInfo: (index: number, info: Partial<ITeamChar>) => void
  toggleMajorTrace: (index: number, traceKey: string) => void
  toggleMinorTrace: (index: number, traceIndex: number) => void
  setWeapon: (index: number, info: Partial<IWeaponEquip>) => void
  setArtifact: (index: number, type: number, aId: string) => void
  unequipAll: (index: number) => void
  hydrateCharacters: (data: ITeamChar[]) => void
  hydrate: (data: TeamStoreType) => void
}

export class Team {
  characters: ITeamChar[]
  selected: number
  hydrated: boolean = false

  constructor() {
    this.characters = Array(4).fill(DefaultCharacter)
    this.selected = 0

    makeAutoObservable(this)
  }

  setValue = <k extends keyof this>(key: k, value: this[k]) => {
    this[key] = value
  }

  setMember = (index: number, character: ITeamChar) => {
    if (index < 0 || index > 4) return
    this.characters[index] = character
  }

  setMemberInfo = (index: number, info: Partial<ITeamChar>) => {
    if (index < 0 || index > 4) return
    const dupeIndex = _.findIndex(this.characters, ['cId', info?.cId])
    const oldData = _.cloneDeep(this.characters[index]) || null
    if (info?.equipments?.artifacts)
      _.forEach(info.equipments.artifacts, (aId) =>
        _.forEach(this.characters, (character, cI) => {
          const i = _.findIndex(character.equipments.artifacts, (item) => item === aId)
          if (i >= 0 && cI !== index) character.equipments.artifacts[i] = null
        })
      )
    this.characters[index] = { ...this.characters[index], ...info }
    if (dupeIndex >= 0 && dupeIndex !== index) this.characters[dupeIndex] = oldData
    this.characters = [...this.characters]
  }

  equipBuild = (index: number, build: IBuild) => {
    if (!build) return
    this.characters[index].equipments = { weapon: build.weapon, artifacts: build.artifacts }
    this.characters[index] = { ...this.characters[index] }
  }

  setTalentLevel = (index: number, type: 'basic' | 'skill' | 'ult' | 'talent', level: number) => {
    if (!type) return
    this.characters[index].talents = { ...this.characters[index].talents, [type]: level }
    this.characters[index] = { ...this.characters[index] }
  }

  toggleMajorTrace = (index: number, traceKey: string) => {
    const v = this.characters[index].major_traces[traceKey]
    this.characters[index].major_traces[traceKey] = !v
    this.characters[index] = { ...this.characters[index] }
  }

  toggleMinorTrace = (index: number, traceIndex: number) => {
    const v = this.characters[index].minor_traces[traceIndex].toggled
    this.characters[index].minor_traces[traceIndex].toggled = !v
    this.characters[index] = { ...this.characters[index] }
  }

  unequipAll = (index: number) => {
    if (index < 0 || index > 4) return
    this.characters[index].equipments = DefaultBuild
    this.characters[index] = { ...this.characters[index] }
  }

  setWeapon = (index: number, info: Partial<IWeaponEquip>) => {
    if (index < 0 || index > 4) return
    this.characters[index].equipments.weapon = { ...this.characters[index].equipments.weapon, ...info }
    this.characters[index] = { ...this.characters[index] }
  }

  setArtifact = (index: number, type: number, aId: string | null) => {
    if (index < 0) return
    _.forEach(this.characters, (character, i) => {
      if (i === index) {
        character.equipments.artifacts[type - 1] = aId
      } else {
        const i = _.findIndex(character.equipments.artifacts, (item) => item === aId)
        if (i >= 0) character.equipments.artifacts[i] = null
      }
    })
    this.characters[index] = { ...this.characters[index] }
  }

  hydrateCharacters = (data: ITeamChar[]) => {
    this.characters = data || Array(4).fill(DefaultCharacter)
  }

  hydrate = (data: TeamStoreType) => {
    if (!data) return

    this.characters = data.characters || Array(4)
  }
}
