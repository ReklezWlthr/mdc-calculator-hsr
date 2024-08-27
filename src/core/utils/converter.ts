import {
  EnkaStatsMap,
  IArtifactEquip,
  IBuild,
  ICharStore,
  ITeamChar,
  PathType,
  PropMap,
  ScannerArtifactTypeMap,
  ScannerStatsMap,
  Stats,
} from '@src/domain/constant'
import _ from 'lodash'
import { formatMinorTrace } from './data_format'
import { findCharacter } from './finder'

export const toPercentage = (value: number, precision: number = 1, round?: boolean) => {
  return (
    (round
      ? _.round(value * 100, precision)
      : _.floor(_.round(value * 100, precision + 1), precision)
    ).toLocaleString() + '%'
  )
}

export const fromEnka = (rawData: Record<string, any>) => {
  if (!rawData) return null
  const displayChars = rawData.detailInfo?.avatarDetailList
  const charData: ITeamChar[] = _.map<any, ITeamChar>(displayChars, (item) => {
    const weapon = item.equipment
    const weaponId = weapon?.tid?.toString()
    const talents = item.skillTreeList
    const artifacts = _.map(item.relicList, (a) => (a ? crypto.randomUUID() : null))
    const findTalent = (ext: string) => _.find(talents, (t) => t.pointId === +`${item.avatarId}${ext}`)?.level

    const traceException = {
      '1301': [
        findTalent('201') || false,
        findTalent('203') || false,
        findTalent('205') || false,
        findTalent('207') || false,
        findTalent('209') || false,
        findTalent('202') || false,
        findTalent('206') || false,
        findTalent('204') || false,
        findTalent('208') || false,
        findTalent('210') || false,
      ],
    }

    const rawId = item.avatarId.toString()
    const cId = (+item.avatarId.toString() - (+_.last(rawId) % 2 === 0 && _.head(rawId) === '8' ? 1 : 0)).toString()

    return {
      level: item.level,
      ascension: item.promotion,
      cons: item.rank,
      cId,
      equipments: {
        weapon: {
          wId: weaponId,
          refinement: parseInt(weapon?.rank) || 1,
          ascension: parseInt(weapon?.promotion) || 0,
          level: parseInt(weapon?.level) || 1,
        },
        artifacts,
      },
      talents: {
        basic: findTalent('001') || 1,
        skill: findTalent('002') || 1,
        ult: findTalent('003') || 1,
        talent: findTalent('004') || 1,
      },
      major_traces: {
        a2: findTalent('101') || false,
        a4: findTalent('102') || false,
        a6: findTalent('103') || false,
      },
      minor_traces: formatMinorTrace(
        findCharacter(item.avatarId.toString())?.trace,
        traceException[item.avatarId.toString()] || [
          // Main 5
          findTalent('201') || false,
          findTalent('203') || false,
          findTalent('205') || false,
          findTalent('207') || false,
          findTalent('210') || false,
          // Main 2
          findTalent('204') || false,
          findTalent('208') || false,
          // Main 3
          findTalent('202') || false,
          findTalent('206') || false,
          findTalent('209') || false,
        ]
      ),
    }
  })
  const artifactData: IArtifactEquip[] = _.flatMap<any, IArtifactEquip>(displayChars, (item, i: number) =>
    _.map<any, IArtifactEquip>(item.relicList, (artifact, aI) => {
      const subs = _.cloneDeep(artifact._flat.props)
      const main = subs.shift()
      return {
        id: charData[i]?.equipments?.artifacts?.[aI],
        setId: artifact._flat.setID.toString(),
        level: artifact.level,
        type: artifact.type,
        main: EnkaStatsMap[main.type],
        quality: +_.head(artifact.tid.toString()) - 1,
        subList: _.map(subs, (sub) => ({
          stat: EnkaStatsMap[sub.type],
          value:
            sub.value * (_.includes([Stats.ATK, Stats.HP, Stats.SPD, Stats.DEF], EnkaStatsMap[sub.type]) ? 1 : 100),
        })),
      }
    })
  )
  return { charData, artifactData }
}

export const fromScanner = (rawData: Record<string, any>) => {
  if (!rawData) return null
  const tb = rawData.metadata.trailblazer
  const displayChars = rawData.characters
  const lcs = rawData.light_cones
  const relics = _.map(rawData.relics, (r) => ({ ...r, id: crypto.randomUUID() }))
  const charData: ICharStore[] = _.map<any, ICharStore>(displayChars, (item) => {
    const cId = (+item.id - (tb === 'Stelle' && _.head(item.id) === '8' ? 1 : 0)).toString()

    const traceException = {
      '1301': [
        item.traces.stat_1 || false,
        item.traces.stat_3 || false,
        item.traces.stat_5 || false,
        item.traces.stat_7 || false,
        item.traces.stat_9 || false,
        item.traces.stat_4 || false,
        item.traces.stat_8 || false,
        item.traces.stat_2 || false,
        item.traces.stat_6 || false,
        item.traces.stat_10 || false,
      ],
    }

    return {
      level: item.level,
      ascension: item.ascension,
      cons: item.eidolon,
      cId,
      talents: item.skills,
      major_traces: {
        a2: item.traces.ability_1 || false,
        a4: item.traces.ability_2 || false,
        a6: item.traces.ability_3 || false,
      },
      minor_traces: formatMinorTrace(
        findCharacter(cId)?.trace,
        traceException[cId] || [
          item.traces.stat_1 || false,
          item.traces.stat_3 || false,
          item.traces.stat_5 || false,
          item.traces.stat_7 || false,
          item.traces.stat_10 || false,
          item.traces.stat_4 || false,
          item.traces.stat_8 || false,
          item.traces.stat_2 || false,
          item.traces.stat_6 || false,
          item.traces.stat_9 || false,
        ]
      ),
    }
  })
  const artifactData: IArtifactEquip[] = _.map<any, IArtifactEquip>(relics, (r) => {
    return {
      id: r.id,
      setId: r.set_id,
      level: r.level,
      type: ScannerArtifactTypeMap[r.slot],
      main: ScannerStatsMap[r.mainstat],
      quality: r.rarity,
      subList: _.map(r.substats, (sub) => ({
        stat: ScannerStatsMap[sub.key],
        value: sub.value,
      })),
    }
  })
  const buildData: IBuild[] = _.map<any, IBuild>(displayChars, (item) => {
    const cId = (+item.id - (tb === 'Stelle' && _.head(item.id) === '8' ? 1 : 0)).toString()
    const lc = _.find(lcs, (l) => l.location === item.id)
    const equipped = _.filter(relics, (r) => r.location === item.id).sort(
      (a, b) => ScannerArtifactTypeMap[a.slot] - ScannerArtifactTypeMap[b.slot]
    )
    return lc
      ? {
          id: crypto.randomUUID(),
          cId,
          name: findCharacter(cId)?.name + "'s Build",
          isDefault: true,
          artifacts: _.map(equipped, 'id'),
          weapon: {
            wId: lc.id,
            ascension: lc.ascension,
            refinement: lc.superimposition,
            level: lc.level,
          },
        }
      : null
  })

  return { charData, artifactData, buildData }
}

export const romanize = (num: number) => {
  if (isNaN(num)) return NaN
  var digits = String(+num).split(''),
    key = [
      '',
      'C',
      'CC',
      'CCC',
      'CD',
      'D',
      'DC',
      'DCC',
      'DCCC',
      'CM',
      '',
      'X',
      'XX',
      'XXX',
      'XL',
      'L',
      'LX',
      'LXX',
      'LXXX',
      'XC',
      '',
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
    ],
    roman = '',
    i = 3
  while (i--) roman = (key[+digits.pop() + i * 10] || '') + roman
  return Array(+digits.join('') + 1).join('M') + roman
}
