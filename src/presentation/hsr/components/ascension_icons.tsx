import { StatsObject } from '@src/data/lib/stats/baseConstant'
import { Tooltip } from '../../components/tooltip'
import { ElementIconColor, TooltipBody } from './cons_circle'
import { ITalent } from '@src/domain/conditional'
import classNames from 'classnames'
import { Element } from '@src/domain/constant'
import { TalentIcon } from './tables/scaling_wrapper'
import { ElementColor } from './tables/scaling_sub_rows'
import { useStore } from '@src/data/providers/app_store_provider'
import _ from 'lodash'

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
  const { teamStore } = useStore()

  const nihilux = _.find(teamStore.characters, (cc) => cc.cId === '1511')

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
      {!!props.talents?.innate && nihilux && (
        <>
          <div className={classNames('opacity-30', ElementColor[props.element])}>✦</div>
          <TalentIcon
            element={Element.NONE}
            icon={`SkillIcon_${props.id}_Innate.png`}
            talent={props.talents?.innate}
            type={props.talents?.innate?.trace}
            level={props.talents?.innate?.level}
          />
        </>
      )}
    </div>
  )
}
