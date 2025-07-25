import { observer } from 'mobx-react-lite'
import { TalentIcon } from './tables/scaling_wrapper'
import { findMaxTalentLevel } from '@src/core/utils/data_format'
import { ITeamChar, PathType } from '@src/domain/constant'
import _ from 'lodash'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { ITalent } from '@src/domain/conditional'
import { findCharacter } from '@src/core/utils/finder'

export interface AbilityBlockProps {
  char: ITeamChar
  talents: ITalent
  upgrade: { basic: number; skill: number; ult: number; talent: number; memo_skill?: number; memo_talent?: number }
  onChange: (key: string, value: number) => void
  disabled?: boolean
}

export const AbilityBlock = observer(({ char, onChange, upgrade, talents, disabled }: AbilityBlockProps) => {
  const charData = findCharacter(char.cId)

  const maxTalentLevel = findMaxTalentLevel(char?.ascension) || 1
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
          type={talents?.normal?.trace}
        />
        <div>
          <p className="text-xs text-primary-lighter">Basic ATK</p>
          <SelectInput
            value={char?.talents?.basic?.toString()}
            onChange={(value) => onChange('basic', parseInt(value))}
            options={basicLevels}
            style="w-14"
            disabled={!charData || disabled}
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
            disabled={!charData || disabled}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <TalentIcon
          talent={talents?.ult}
          element={charData?.element}
          icon={`SkillIcon_${charData?.id}_Ultra_on.png`}
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
            disabled={!charData || disabled}
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
            disabled={!charData || disabled}
          />
        </div>
      </div>
      {charData?.path === PathType.REMEMBRANCE && (
        <>
          <div className="flex items-center gap-3">
            <TalentIcon
              talent={talents?.summon_skill}
              element={charData?.element}
              icon={`SkillIcon_1${charData?.id}_Servant01.png`}
              size="w-9 h-9"
              upgraded={upgrade?.memo_skill}
              level={char?.talents?.memo_skill}
              showUpgrade
              type={talents?.talent?.trace}
            />
            <div>
              <p className="text-xs text-primary-lighter">M.Skill</p>
              <SelectInput
                value={char?.talents?.memo_skill?.toString()}
                onChange={(value) => onChange('memo_skill', parseInt(value))}
                options={basicLevels}
                style="w-14"
                disabled={!charData || disabled}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TalentIcon
              talent={talents?.summon_talent}
              element={charData?.element}
              icon={`SkillIcon_1${charData?.id}_ServantPassive.png`}
              size="w-9 h-9"
              upgraded={upgrade?.memo_talent}
              level={char?.talents?.memo_talent}
              showUpgrade
              type={talents?.talent?.trace}
            />
            <div>
              <p className="text-xs text-primary-lighter">M.Talent</p>
              <SelectInput
                value={char?.talents?.memo_talent?.toString()}
                onChange={(value) => onChange('memo_talent', parseInt(value))}
                options={basicLevels}
                style="w-14"
                disabled={!charData || disabled}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
})
