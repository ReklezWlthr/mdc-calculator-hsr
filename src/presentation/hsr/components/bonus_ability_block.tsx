import { observer } from 'mobx-react-lite'
import { TalentIcon } from './tables/scaling_wrapper'
import { findCharacter } from '@src/core/utils/finder'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { ITeamChar } from '@src/domain/constant'
import { ITalent } from '@src/domain/conditional'

export interface BonusAbilityBlockProps {
  char: ITeamChar
  talents: ITalent
  onChange: (key: string) => void
}

export const BonusAbilityBlock = observer(({ char, onChange, talents }: BonusAbilityBlockProps) => {
  const charData = findCharacter(char.cId)

  return (
    <div className="flex justify-around col-span-full">
      <div className="flex flex-col items-center gap-3">
        <TalentIcon
          talent={talents?.a2}
          element={charData?.element}
          icon={`SkillIcon_${charData?.id}_SkillTree1.png`}
          size="w-9 h-9"
          type={talents?.a2?.trace}
        />
        <div className="flex gap-2">
          <p className="text-xs text-primary-lighter">A2</p>
          <CheckboxInput
            checked={char?.major_traces?.a2}
            onClick={() => onChange('a2')}
            disabled={char?.ascension < 2}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <TalentIcon
          talent={talents?.a4}
          element={charData?.element}
          icon={`SkillIcon_${charData?.id}_SkillTree2.png`}
          size="w-9 h-9"
          type={talents?.a4?.trace}
        />
        <div className="flex gap-2">
          <p className="text-xs text-primary-lighter">A4</p>
          <CheckboxInput
            checked={char?.major_traces?.a4}
            onClick={() => onChange('a4')}
            disabled={char?.ascension < 4}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <TalentIcon
          talent={talents?.a6}
          element={charData?.element}
          icon={`SkillIcon_${charData?.id}_SkillTree3.png`}
          size="w-9 h-9"
          type={talents?.a6?.trace}
        />
        <div className="flex gap-2">
          <p className="text-xs text-primary-lighter">A6</p>
          <CheckboxInput
            checked={char?.major_traces?.a6}
            onClick={() => onChange('a6')}
            disabled={char?.ascension < 6}
          />
        </div>
      </div>
    </div>
  )
})
