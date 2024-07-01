import { Element, IArtifactEquip, IBuild, ITeamChar, IWeapon, IWeaponEquip, PathType } from '@src/domain/constant'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { enableStaticRendering } from 'mobx-react-lite'
import { StatsObjectKeysT } from '../lib/stats/baseConstant'

enableStaticRendering(typeof window === 'undefined')

export interface TSetup {
  char: ITeamChar[]
  name: string
  id: string
}

export type CustomSetterT = (innerIndex: number, key: StatsObjectKeysT, value: any, debuff: boolean) => void
export type CustomRemoverT = (innerIndex: number) => void

export interface SetupStoreType {
  mode: string
  team: TSetup[]
  tab: string
  selected: number[]
  main: TSetup
  mainChar: string
  comparing: TSetup[]
  custom: {
    name: StatsObjectKeysT
    value: number
    debuff: boolean
  }[][][]
  forms: Record<string, any>[][]
  hydrated: boolean
  setValue: <k extends keyof this>(key: k, value: this[k]) => void
  initForm: (i: number, initData: Record<string, any>[]) => void
  setForm: (index: number, value: Record<string, any>[]) => void
  setFormValue: (setupIndex: number, charIndex: number, key: string, value: any, sync: boolean) => void
  setComparing: (value: Partial<ITeamChar>) => void
  setCustomValue: CustomSetterT
  removeCustomValue: CustomRemoverT
  saveTeam: (team: TSetup) => boolean
  editTeam: (tId: string, team: Partial<TSetup>) => boolean
  deleteTeam: (tId: string) => boolean
  findTeam: (tId: string) => TSetup
  hydrateTeams: (data: TSetup[]) => void
  hydrate: (data: SetupStoreType) => void
}

export class SetupStore {
  mode: string
  selected: number[]
  tab: string
  team: TSetup[]
  main: TSetup
  mainChar: string
  comparing: TSetup[]
  custom: {
    name: StatsObjectKeysT
    value: number
    debuff: boolean
  }[][][]
  hydrated: boolean = false
  forms: Record<string, any>[][]

  constructor() {
    this.mode = 'avg'
    this.team = []
    this.tab = 'mod'
    this.selected = [0, 0]
    this.custom = Array(4).fill(Array(4))
    this.main = null
    this.mainChar = null
    this.comparing = Array(3)
    this.forms = Array(4)

    makeAutoObservable(this)
  }

  setValue = <k extends keyof this>(key: k, value: this[k]) => {
    this[key] = value
  }

  initForm = (i: number, initData: Record<string, any>[]) => {
    const mergedData = _.map(initData, (item, index) =>
      _.mapValues(item, (value, key) => {
        const old = this.forms[i]?.[index]?.[key]
        return _.isUndefined(old) ? value : old
      })
    )
    this.forms[i] = _.cloneDeep(mergedData)
  }

  setForm = (index: number, value: Record<string, any>[]) => {
    this.forms[index] = value
    this.forms = _.cloneDeep(this.forms)
  }

  setFormValue = (setupIndex: number, charIndex: number, key: string, value: any, sync: boolean) => {
    this.forms[setupIndex][charIndex][key] = value
    if (sync) {
      console.log(sync, this.forms)
      for (const form of this.forms) {
        for (const char of form) {
          if (_.has(char, key)) char[key] = value
        }
      }
    }
    this.forms = _.cloneDeep(this.forms)
  }

  setComparing = (value: Partial<ITeamChar>) => {
    const [setupIndex, charIndex] = this.selected
    if (setupIndex === 0) {
      this.main.char[charIndex] = { ...this.main.char[charIndex], ...value }
      this.main = _.cloneDeep(this.main)
    } else {
      this.comparing[setupIndex - 1].char[charIndex] = { ...this.comparing[setupIndex - 1].char[charIndex], ...value }
      this.comparing = _.cloneDeep(this.comparing)
    }
  }

  setCustomValue = (innerIndex: number, key: StatsObjectKeysT, value: any, debuff: boolean = false) => {
    const [setupIndex, charIndex] = this.selected
    if (innerIndex < 0) {
      this.custom[setupIndex][charIndex] = [...(this.custom[setupIndex][charIndex] || []), { name: key, value, debuff }]
    } else {
      this.custom[setupIndex][charIndex].splice(innerIndex, 1, { name: key, value, debuff })
    }
    this.custom = _.cloneDeep(this.custom)
  }

  removeCustomValue = (innerIndex: number) => {
    const [setupIndex, charIndex] = this.selected
    this.custom[setupIndex][charIndex].splice(innerIndex, 1)
    this.custom = _.cloneDeep(this.custom)
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
