import { IArtifactEquip, Stats } from '@src/domain/constant'
import { StatsObject } from '../../baseConstant'
import { getSetCount } from '@src/core/utils/data_format'
import _ from 'lodash'
import { ArtifactForm } from './artifact_form'
import { checkBuffExist } from '@src/core/utils/finder'

export const getRelicConditionals = (artifacts: IArtifactEquip[]) => {
  const setBonus = getSetCount(artifacts)
  const { content, teamContent } = ArtifactForm()
  const set = _.keys(_.pickBy(setBonus, (item, key) => item >= (_.head(key) === '1' ? 4 : 2)))

  return {
    content: _.filter(content, (item) => _.some(set, (s) => _.includes(item.id, s))),
    teamContent: _.filter(teamContent, (item) => _.some(set, (s) => _.includes(item.id, s))),
  }
}

export const calculateRelic = (base: StatsObject, form: Record<string, any>) => {
  if (form['104'])
    base[Stats.CRIT_DMG].push({
      name: `4-Piece`,
      source: 'Hunter of Glacial Forest',
      value: 0.12,
    })
  if (form['105'])
    base[Stats.P_ATK].push({
      name: `4-Piece`,
      source: 'Champion of Streetwise Boxing',
      value: 0.05 * form['105'],
    })
  if (form['107'])
    base[Stats.FIRE_DMG].push({
      name: `4-Piece`,
      source: 'Firesmith of Lava-Forging',
      value: 0.12,
    })
  if (form['109'])
    base[Stats.P_ATK].push({
      name: `4-Piece`,
      source: 'Band of Sizzling Thunder',
      value: 0.2,
    })
  if (form['113'])
    base[Stats.CRIT_RATE].push({
      name: `4-Piece`,
      source: 'Longevous Disciple',
      value: 0.08 * form['113'],
    })
  if (form['114'] && !checkBuffExist(base[Stats.P_SPD], 'source', 'Messenger Traversing Hackerspace'))
    base[Stats.P_SPD].push({
      name: `4-Piece`,
      source: 'Messenger Traversing Hackerspace',
      value: 0.12,
    })
  if (form['115'])
    base[Stats.P_ATK].push({
      name: `4-Piece`,
      source: 'The Ashblazing Grand Duke',
      value: 0.06 * form['115'],
    })
  if (form['117'])
    base.CALLBACK.push((x) => {
      x[Stats.CRIT_RATE] = _.map(x[Stats.CRIT_RATE], (item) =>
        item.source === 'Pioneer Diver of Dead Waters' ? { ...item, value: item.value * 2 } : item
      )
      x[Stats.CRIT_DMG] = _.map(x[Stats.CRIT_DMG], (item) =>
        item.source === 'Pioneer Diver of Dead Waters' ? { ...item, value: item.value * 2 } : item
      )
      return x
    })
  if (form['118'] && !checkBuffExist(base[Stats.BE], 'source', 'Watchmaker, Master of Dream Machinations'))
    base[Stats.BE].push({
      name: `4-Piece`,
      source: 'Watchmaker, Master of Dream Machinations',
      value: 0.3,
    })
  if (form['305'])
    base[Stats.P_ATK].push({
      name: `2-Piece`,
      source: 'Celestial Differentiator',
      value: 0.06,
    })
  if (form['313'])
    base[Stats.CRIT_DMG].push({
      name: `2-Piece`,
      source: 'Sigonia, the Unclaimed Desolation',
      value: 0.04 * form['313'],
    })
  if (form['315'])
    base.FUA_DMG.push({
      name: `Merit`,
      source: 'Duran, Dynasty of Running Wolves',
      value: 0.05 * form['315'],
    })
  if (form['315'] >= 5)
    base[Stats.CRIT_DMG].push({
      name: `Merit`,
      source: 'Duran, Dynasty of Running Wolves',
      value: 0.25,
    })
  if (form['316'])
    base[Stats.BE].push({
      name: `2-Piece`,
      source: 'Forge of the Kalpagni Lantern',
      value: 0.4,
    })
  if (form['120'])
    base.ULT_DMG.push({
      name: `Merit`,
      source: 'The Wind-Soaring Valorous',
      value: 0.36,
    })

  return base
}

export const calculateTeamRelic = (base: StatsObject, form: Record<string, any>, owner: StatsObject) => {
  if (form['114'] && !checkBuffExist(base[Stats.P_SPD], 'name', 'Messenger Traversing Hackerspace'))
    base[Stats.P_SPD].push({
      name: `Messenger Traversing Hackerspace`,
      source: owner.NAME,
      value: 0.12,
    })
  if (form['118'] && !checkBuffExist(base[Stats.BE], 'name', 'Watchmaker, Master of Dream Machinations'))
    base[Stats.BE].push({
      name: `Watchmaker, Master of Dream Machinations`,
      source: owner.NAME,
      value: 0.3,
    })

  return base
}
