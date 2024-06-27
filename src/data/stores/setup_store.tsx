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
  main: TSetup
  mainChar: string
  comparing: TSetup[]
  forms: Record<string, any>[][]
  hydrated: boolean
  setValue: <k extends keyof this>(key: k, value: this[k]) => void
  setForm: (index: number, value: Record<string, any>[]) => void
  saveTeam: (team: TSetup) => boolean
  editTeam: (tId: string, team: Partial<TSetup>) => boolean
  deleteTeam: (tId: string) => boolean
  findTeam: (tId: string) => TSetup
  hydrateTeams: (data: TSetup[]) => void
  hydrate: (data: SetupStoreType) => void
}

export class SetupStore {
  team: TSetup[]
  main: TSetup
  mainChar: string
  comparing: TSetup[]
  hydrated: boolean = false
  forms: Record<string, any>[][]

  constructor() {
    this.team = []
    this.main = null
    this.mainChar = null
    this.comparing = Array(3)
    this.forms = Array(4)

    makeAutoObservable(this)
  }

  setValue = <k extends keyof this>(key: k, value: this[k]) => {
    this[key] = value
  }

  setForm = (index: number, value: Record<string, any>[]) => {
    this.forms[index] = value
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
