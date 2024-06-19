import { Element, IArtifactEquip, ITeamChar, Stats, TalentProperty } from '@src/domain/constant'
import { StatsObject } from '../../baseConstant'
import { getSetCount } from '@src/core/utils/data_format'
import _ from 'lodash'
import { ArtifactForm } from './artifact_form'
import { checkBuffExist, findCharacter } from '@src/core/utils/finder'

export const getRelicConditionals = (artifacts: IArtifactEquip[]) => {
  const setBonus = getSetCount(artifacts)
  const { content, teamContent } = ArtifactForm()
  const set = _.findKey(setBonus, (item) => item >= 4)

  return {
    content: _.filter(content, (item) => _.includes(item.id, set)),
    teamContent: _.filter(teamContent, (item) => _.includes(item.id, set)),
  }
}

export const calculateRelic = (base: StatsObject, form: Record<string, any>, team: ITeamChar[], index: number) => {
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

  return base
}

export const calculateTeamRelic = (base: StatsObject, form: Record<string, any>, owner: StatsObject) => {
  if (form['114'] && !checkBuffExist(base[Stats.P_SPD], 'name', 'Messenger Traversing Hackerspace'))
    base[Stats.P_SPD].push({
      name: `Messenger Traversing Hackerspace`,
      source: owner.NAME,
      value: 0.12,
    })

  return base
}
