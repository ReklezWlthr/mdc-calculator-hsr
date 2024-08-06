import {
  Element,
  IArtifactEquip,
  IBuild,
  ITeamChar,
  IWeapon,
  IWeaponEquip,
  PathType,
  TalentType,
} from '@src/domain/constant'
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

export interface TSetupPlus extends TSetup {
  total: TotalT
}

export const defaultTotal = {
  [TalentType.BA]: {},
  [TalentType.SKILL]: {},
  [TalentType.ULT]: {},
  [TalentType.TALENT]: {},
  [TalentType.TECH]: {},
}

export type CustomSetterT = (innerIndex: number, key: StatsObjectKeysT, value: any, debuff: boolean) => void
export type CustomRemoverT = (innerIndex: number) => void

export type TotalT = {
  [TalentType.BA]: Record<string, number>
  [TalentType.SKILL]: Record<string, number>
  [TalentType.ULT]: Record<string, number>
  [TalentType.TALENT]: Record<string, number>
  [TalentType.TECH]: Record<string, number>
}

export interface SetupStoreType {
  mode: string
  team: TSetup[]
  tab: string
  selected: number[]
  main: TSetupPlus
  mainChar: string
  comparing: TSetupPlus[]
  custom: {
    name: StatsObjectKeysT
    value: number
    debuff: boolean
  }[][][]
  forms: Record<string, any>[][]
  hydrated: boolean
  res: Record<Element, number>
  level: number | string
  enemy: string
  hp: number
  toughness: number
  effRes: number
  broken: boolean
  weakness: Element[]
  setValue: <k extends keyof this>(key: k, value: this[k]) => void
  initForm: (i: number, initData: Record<string, any>[]) => void
  setForm: (index: number, value: Record<string, any>[]) => void
  setFormValue: (setupIndex: number, charIndex: number, key: string, value: any, sync: boolean) => void
  setComparing: (value: Partial<ITeamChar>) => void
  setTotal: (key: TalentType, index: number, name: string, value: number) => void
  getTotal: (key: TalentType, index: number) => number
  setRes: (element: Element, value: number) => void
  getEffRes: (reduction?: number) => number
  getDefMult: (level: number, defPen: number, defRed: number) => number
  getResMult: (element: Element, resPen: number) => number
  clearTotal: () => void
  clearComparing: () => void
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
  main: TSetupPlus
  mainChar: string
  comparing: TSetupPlus[]
  custom: {
    name: StatsObjectKeysT
    value: number
    debuff: boolean
  }[][][]
  hydrated: boolean = false
  forms: Record<string, any>[][]
  res: Record<Element, number>
  level: number | string
  enemy: string
  hp: number
  toughness: number
  effRes: number
  broken: boolean
  weakness: Element[]

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
    this.res = {
      [Element.PHYSICAL]: 0,
      [Element.FIRE]: 0,
      [Element.ICE]: 0,
      [Element.LIGHTNING]: 0,
      [Element.WIND]: 0,
      [Element.QUANTUM]: 0,
      [Element.IMAGINARY]: 0,
    }
    this.level = 1
    this.enemy = ''
    this.hp = 1
    this.toughness = 30
    this.effRes = 0
    this.broken = false
    this.weakness = []

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

  setFormValue = (setupIndex: number, index: number, key: string, value: any, sync: boolean) => {
    this.forms[setupIndex][index][key] = value
    if (sync) {
      console.log(sync, _.cloneDeep(this.forms))
      for (const form of this.forms) {
        if (!form) continue
        for (const char of form) {
          if (_.has(char, key)) char[key] = value
        }
      }
    }
    this.forms = _.cloneDeep(this.forms)
  }

  setTotal = (key: TalentType, index: number, name: string, value: number) => {
    if (index === 0) {
      _.assign(this.main.total[key], { [name]: value })
    } else {
      this.comparing[index - 1] && _.assign(this.comparing[index - 1].total[key], { [name]: value })
    }
  }

  clearTotal = () => {
    if (this.main) this.main.total = defaultTotal
    if (this.comparing[0]) this.comparing[0].total = defaultTotal
    if (this.comparing[1]) this.comparing[1].total = defaultTotal
    if (this.comparing[2]) this.comparing[2].total = defaultTotal
  }

  getTotal = (key: TalentType, index: number) => {
    if (index === 0) {
      return _.sum(_.map(this.main.total[key]))
    } else {
      return _.sum(_.map(this.comparing[index - 1]?.total[key]))
    }
  }

  setRes = (element: Element, value: number) => {
    this.res[element] = value
  }

  getDefMult = (level: number, defPen: number = 0, defRed: number = 0) => {
    const base = _.includes(this.enemy, 'Trot') ? 300 : 200
    const growth = _.includes(this.enemy, 'Trot') ? 15 : 10
    const def = (base + growth * (+this.level || 1)) * (1 - defPen - defRed)

    return _.min([1 - def / (def + 200 + 10 * level), 1])
  }

  getResMult = (element: Element, resPen: number) => {
    if (this.res[element] === Infinity) return 0
    const res = this.res[element] / 100 - resPen
    return 1 - res
  }

  getEffRes = (reduction?: number) => {
    return this.effRes + (+this.level >= 51 ? _.min([0.1, 0.004 * (+this.level - 50)]) : 0) - reduction
  }

  setComparing = (value: Partial<ITeamChar>) => {
    const [setupIndex, charIndex] = this.selected
    if (setupIndex === 0) {
      const dupeIndex = _.findIndex(this.main.char, ['cId', value?.cId])
      const oldData = _.cloneDeep(this.main.char[charIndex]) || null
      if (value?.equipments?.artifacts)
        _.forEach(value.equipments.artifacts, (aId) =>
          _.forEach(this.main.char, (character, cI) => {
            const i = _.findIndex(character.equipments.artifacts, (item) => item === aId)
            if (i >= 0 && cI !== charIndex) character.equipments.artifacts[i] = null
          })
        )
      this.main.char[charIndex] = { ...this.main.char[charIndex], ...value }
      if (dupeIndex >= 0 && dupeIndex !== charIndex) this.main.char[dupeIndex] = oldData
      this.main = _.cloneDeep(this.main)
    } else {
      const arr = this.comparing[setupIndex - 1]
      const dupeIndex = _.findIndex(arr.char, ['cId', value?.cId])
      const oldData = _.cloneDeep(arr.char[charIndex]) || null
      if (value?.equipments?.artifacts)
        _.forEach(value.equipments.artifacts, (aId) =>
          _.forEach(arr.char, (character, cI) => {
            const i = _.findIndex(character.equipments.artifacts, (item) => item === aId)
            if (i >= 0 && cI !== charIndex) character.equipments.artifacts[i] = null
          })
        )
      arr.char[charIndex] = { ...arr.char[charIndex], ...value }
      if (dupeIndex >= 0 && dupeIndex !== charIndex) this.comparing[setupIndex - 1].char[dupeIndex] = oldData
      this.comparing = _.cloneDeep(this.comparing)
    }
  }

  clearComparing = () => {
    const [setupIndex, charIndex] = this.selected
    if (setupIndex === 0) {
      this.main.char[charIndex] = null
      this.main = _.cloneDeep(this.main)
    } else {
      this.comparing[setupIndex - 1].char[charIndex] = null
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
