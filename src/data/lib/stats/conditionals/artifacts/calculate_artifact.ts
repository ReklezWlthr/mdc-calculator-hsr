import { IArtifactEquip, Stats } from '@src/domain/constant'
import { StatsObject } from '../../baseConstant'
import { getSetCount } from '@src/core/utils/data_format'
import _ from 'lodash'
import { ArtifactForm } from './artifact_form'
import { checkBuffExist } from '@src/core/utils/finder'

export const getRelicConditionals = (artifacts: IArtifactEquip[]) => {
  const setBonus = getSetCount(artifacts)
  const { content, teamContent, allyContent } = ArtifactForm()
  const set = _.keys(_.pickBy(setBonus, (item, key) => item >= (_.head(key) === '1' ? 4 : 2)))

  return {
    content: _.filter(content, (item) => _.some(set, (s) => _.includes(item.id, s))),
    teamContent: _.filter(teamContent, (item) => _.some(set, (s) => _.includes(item.id, s))),
    allyContent: _.filter(allyContent, (item) => _.some(set, (s) => _.includes(item.id, s))),
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
      name: `4-Piece`,
      source: 'The Wind-Soaring Valorous',
      value: 0.36,
    })
  if (form['318']) {
    const buff = _.find(base[Stats.CRIT_DMG], (item) => item.source === 'The Wondrous BananAmusement Park')
    if (buff && !base.SUMMON_ID) buff.value += 0.32
  }
  if (form['122'])
    base.SKILL_DMG.push({
      name: `4-Piece`,
      source: 'Scholar Lost in Erudition',
      value: 0.25,
    })
  if (form['123_1'] && !base.SUMMON_ID) {
    base[Stats.P_SPD].push({
      name: `4-Piece`,
      source: `Hero of Triumphant Song`,
      value: 0.06,
    })
  }
  if (form['123_2']) {
    base[Stats.CRIT_DMG].push({
      name: `4-Piece`,
      source: `Hero of Triumphant Song`,
      value: 0.3,
    })
    if (base.SUMMON_STATS) {
      base.SUMMON_STATS[Stats.CRIT_DMG].push({
        name: `4-Piece`,
        source: `Hero of Triumphant Song`,
        value: 0.3,
      })
    }
  }
  if (
    form['125'] &&
    !checkBuffExist(base[Stats.P_SPD], { source: 'Warrior Goddess of Sun and Thunder', name: 'Gentle Rain' })
  ) {
    base[Stats.P_SPD].push({
      name: `Gentle Rain`,
      source: `Warrior Goddess of Sun and Thunder`,
      value: 0.06,
    })
  }
  if (form['126']) {
    base[Stats.P_ATK].push({
      name: `Help`,
      source: `Wavestrider Captain`,
      value: 0.48,
    })
  }
  if (form['321']) {
    let bonus = 0
    if (form['321'] < 4) {
      bonus = 0.12 * (4 - form['321'])
    }
    if (form['321'] > 4) {
      bonus = 0.09 * (form['321'] - 4)
    }
    base[Stats.ALL_DMG].push({
      name: `2-Piece`,
      source: `Arcadia of Woven Dreams`,
      value: bonus,
    })
    if (base.SUMMON_STATS) {
      base.SUMMON_STATS[Stats.ALL_DMG].push({
        name: `2-Piece`,
        source: `Arcadia of Woven Dreams`,
        value: bonus,
      })
    }
  }
  if (form['127']) {
    base[Stats.P_HP].push({
      name: `4-Piece`,
      source: `World-Remaking Deliverer`,
      value: 0.24,
    })
    if (base.SUMMON_STATS) {
      base.SUMMON_STATS[Stats.P_HP].push({
        name: `4-Piece`,
        source: `World-Remaking Deliverer`,
        value: 0.24,
      })
    }
  }

  return base
}

export const calculateTeamRelic = (base: StatsObject, form: Record<string, any>, owner: StatsObject) => {
  if (form['114'] && !checkBuffExist(base[Stats.P_SPD], { name: 'Messenger Traversing Hackerspace' }))
    base[Stats.P_SPD].push({
      name: `Messenger Traversing Hackerspace`,
      source: owner.NAME,
      value: 0.12,
    })
  if (form['118'] && !checkBuffExist(base[Stats.BE], { name: 'Watchmaker, Master of Dream Machinations' }))
    base[Stats.BE].push({
      name: `Watchmaker, Master of Dream Machinations`,
      source: owner.NAME,
      value: 0.3,
    })
  if (form['125'] && !checkBuffExist(base[Stats.CRIT_DMG], { name: 'Gentle Rain' })) {
    base[Stats.CRIT_DMG].push({
      name: `Gentle Rain`,
      source: owner.NAME,
      value: 0.15,
    })
    if (base.SUMMON_STATS) {
      base.SUMMON_STATS[Stats.CRIT_DMG].push({
        name: `Gentle Rain`,
        source: owner.NAME,
        value: 0.15,
      })
    }
  }
  if (form['127']) {
    base[Stats.ALL_DMG].push({
      name: `4-Piece`,
      source: `World-Remaking Deliverer`,
      value: 0.08,
    })
    if (base.SUMMON_STATS) {
      base.SUMMON_STATS[Stats.ALL_DMG].push({
        name: `4-Piece`,
        source: `World-Remaking Deliverer`,
        value: 0.08,
      })
    }
  }

  return base
}

export const calculateAllyRelic = (
  base: StatsObject,
  form: Record<string, any>,
  owner: StatsObject,
  ownerIndex: number
) => {
  if (form[`121_${ownerIndex}`]) {
    base[Stats.CRIT_DMG].push({
      name: `Sacerdos' Relived Ordeal`,
      source: owner.NAME,
      value: 0.18 * form[`121_${ownerIndex}`],
    })
  }

  return base
}
