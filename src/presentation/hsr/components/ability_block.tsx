import { observer } from 'mobx-react-lite'
import { TalentIcon } from './tables/scaling_wrapper'
import { findMaxTalentLevel } from '@src/core/utils/data_format'
import { ITeamChar } from '@src/domain/constant'
import _ from 'lodash'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { ITalent } from '@src/domain/conditional'
import { findCharacter } from '@src/core/utils/finder'

export interface AbilityBlockProps {
  char: ITeamChar
  talents: ITalent
  upgrade: { basic: number; skill: number; ult: number; talent: number }
  onChange: (key: string, value: number) => void
}

export const AbilityBlock = observer(({ char, onChange, upgrade, talents }: AbilityBlockProps) => {
  const charData = findCharacter(char.cId)

  const maxTalentLevel = findMaxTalentLevel(char?.ascension)
  const talentLevels = _.map(Array(maxTalentLevel), (_, index) => ({
    name: (index + 1).toString(),
    value: (index + 1).toString(),
  })).reverse()
  const basicLevels = _.map(Array(char?.ascension || 1), (_, index) => ({
    name: (index + 1).toString(),
    value: (index + 1).toString(),
  })).reverse()

  return (
    <>
      <div className="flex items-center gap-3">
        <TalentIcon
          talent={talents?.normal}
          element={charData?.element}
          icon={`SkillIcon_${charData?.id}_Normal.png`}
          size="w-9 h-9"
          upgraded={upgrade?.basic}
          level={char?.talents?.basic}
          showUpgrade
          type={talents?.basic?.trace}
        />
        <div>
          <p className="text-xs text-primary-lighter">Basic ATK</p>
          <SelectInput
            value={char?.talents?.basic?.toString()}
            onChange={(value) => onChange('basic', parseInt(value))}
            options={basicLevels}
            style="w-14"
            disabled={!charData}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <TalentIcon
          talent={talents?.skill}
          element={charData?.element}
          icon={`SkillIcon_${charData?.id}_BP.png`}
          size="w-9 h-9"
          upgraded={upgrade?.skill}
          level={char?.talents?.skill}
          showUpgrade
          type={talents?.skill?.trace}
        />
        <div>
          <p className="text-xs text-primary-lighter">Skill</p>
          <SelectInput
            value={char?.talents?.skill?.toString()}
            onChange={(value) => onChange('skill', parseInt(value))}
            options={talentLevels}
            style="w-14"
            disabled={!charData}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <TalentIcon
          talent={talents?.ult}
          element={charData?.element}
          icon={`SkillIcon_${charData?.id}_Ultra.png`}
          size="w-9 h-9"
          upgraded={upgrade?.ult}
          level={char?.talents?.ult}
          showUpgrade
          type={talents?.ult?.trace}
        />
        <div>
          <p className="text-xs text-primary-lighter">Ultimate</p>
          <SelectInput
            value={char?.talents?.ult?.toString()}
            onChange={(value) => onChange('ult', parseInt(value))}
            options={talentLevels}
            style="w-14"
            disabled={!charData}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <TalentIcon
          talent={talents?.talent}
          element={charData?.element}
          icon={`SkillIcon_${charData?.id}_Passive.png`}
          size="w-9 h-9"
          upgraded={upgrade?.talent}
          level={char?.talents?.talent}
          showUpgrade
          type={talents?.talent?.trace}
        />
        <div>
          <p className="text-xs text-primary-lighter">Talent</p>
          <SelectInput
            value={char?.talents?.talent?.toString()}
            onChange={(value) => onChange('talent', parseInt(value))}
            options={talentLevels}
            style="w-14"
            disabled={!charData}
          />
        </div>
      </div>
    </>
  )
})
