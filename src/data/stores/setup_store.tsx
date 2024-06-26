import { Element, IArtifactEquip, IBuild, ITeamChar, IWeapon, IWeaponEquip, PathType } from '@src/domain/constant'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { enableStaticRendering } from 'mobx-react-lite'

enableStaticRendering(typeof window === 'undefined')

export interface TSetup {
  char: ITeamChar[]
  name: string
  id: string
}

export interface SetupStoreType {
  team: TSetup[]
  main: string
  mainChar: string
  comparing: string[]
  hydrated: boolean
  setValue: <k extends keyof this>(key: k, value: this[k]) => void
  saveTeam: (team: TSetup) => boolean
  editTeam: (tId: string, team: Partial<TSetup>) => boolean
  deleteTeam: (tId: string) => boolean
  findTeam: (tId: string) => TSetup
  hydrateTeams: (data: TSetup[]) => void
  hydrate: (data: SetupStoreType) => void
}

export class SetupStore {
  team: TSetup[]
  main: string
  mainChar: string
  comparing: string[]
  hydrated: boolean = false

  constructor() {
    this.team = []
    this.main = ''
    this.mainChar = ''
    this.comparing = Array(3)

    makeAutoObservable(this)
  }

  setValue = <k extends keyof this>(key: k, value: this[k]) => {
    this[key] = value
  }

  saveTeam = (team: TSetup) => {
    if (!team) return false
    this.team = [...this.team, team]
    return true
  }

  editTeam = (tId: string, team: Partial<TSetup>) => {
    if (!team || !tId) return false
    const index = _.findIndex(this.team, ['id', tId])
    this.team[index] = { ...this.team[index], ...team }
    return true
  }

  deleteTeam = (tId: string) => {
    if (!tId) return false
    const index = _.findIndex(this.team, ['id', tId])
    this.team.splice(index, 1)
    this.team = [...this.team]
    return true
  }

  findTeam = (tId: string) => {
    return _.find(this.team, (item) => item.id === tId)
  }

  hydrateTeams = (data: TSetup[]) => {
    this.team = data || []
  }

  hydrate = (data: SetupStoreType) => {
    if (!data) return

    this.team = data.team || []
  }
}
