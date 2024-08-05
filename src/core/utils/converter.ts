import { EnkaArtifactTypeMap, EnkaStatsMap, IArtifactEquip, ITeamChar, PropMap, Stats } from '@src/domain/constant'
import _ from 'lodash'
import { formatMinorTrace } from './data_format'
import { findCharacter } from './finder'

export const toPercentage = (value: number, precision: number = 1, round?: boolean) => {
  return _[round ? 'round' : 'floor'](value * 100, precision).toLocaleString() + '%'
}

export const toLocalStructure = (rawData: Record<string, any>) => {
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

    return {
      level: item.level,
      ascension: item.promotion,
      cons: item.rank,
      cId: item.avatarId.toString(),
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
        quality: 5,
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
