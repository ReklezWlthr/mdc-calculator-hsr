import { StatsObject } from '@src/data/lib/stats/baseConstant'
import { Tooltip } from '../../components/tooltip'
import { ElementIconColor, TooltipBody } from './cons_circle'
import { ITalent } from '@src/domain/conditional'
import classNames from 'classnames'
import { Element } from '@src/domain/constant'
import { TalentIcon } from './tables/scaling_wrapper'
import { ElementColor } from './tables/scaling_sub_rows'

interface AscensionProps {
  talents: ITalent
  stats?: StatsObject
  ascension: {
    a2: boolean
    a4: boolean
    a6: boolean
  }
  element: Element
  id: string
}

export const AscensionIcons = (props: AscensionProps) => {
  return (
    <div className="flex flex-col items-center justify-around gap-1">
      <TalentIcon
        element={props.element}
        icon={`SkillIcon_${props.id}_SkillTree1.png`}
        talent={props.talents?.a2}
        active={props.ascension?.a2}
        type={props.talents?.a2?.trace}
      />
      <div className={classNames('opacity-30', ElementColor[props.element])}>✦</div>
      <TalentIcon
        element={props.element}
        icon={`SkillIcon_${props.id}_SkillTree2.png`}
        talent={props.talents?.a4}
        active={props.ascension?.a4}
        type={props.talents?.a4?.trace}
      />
      <div className={classNames('opacity-30', ElementColor[props.element])}>✦</div>
      <TalentIcon
        element={props.element}
        icon={`SkillIcon_${props.id}_SkillTree3.png`}
        talent={props.talents?.a6}
        active={props.ascension?.a6}
        type={props.talents?.a6?.trace}
      />
    </div>
  )
}
