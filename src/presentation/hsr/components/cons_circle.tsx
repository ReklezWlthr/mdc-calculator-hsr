import { getPathImage } from '@src/core/utils/fetcher'
import { findCharacter } from '@src/core/utils/finder'
import { StatsObject } from '@src/data/lib/stats/baseConstant'
import { ITalent, ITalentDisplay } from '@src/domain/conditional'
import { Element, Stats } from '@src/domain/constant'
import { Tooltip } from '@src/presentation/components/tooltip'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import getConfig from 'next/config'
import { SyntheticEvent } from 'react'
import { TalentIcon } from './tables/scaling_wrapper'

const { publicRuntimeConfig } = getConfig()

export const TooltipBody = ({
  talent,
  stats,
  unlocked,
}: {
  talent: ITalentDisplay
  stats?: StatsObject
  unlocked: boolean
}) => {
  const statForScale = {
    [Stats.ATK]: stats?.getAtk(),
    [Stats.DEF]: stats?.getDef(),
    [Stats.HP]: stats?.getHP(),
    // [Stats.EM]: stats?.[Stats.EM],
    // [Stats.ER]: stats?.[Stats.ER],
    [Stats.HEAL]: stats?.[Stats.HEAL],
  }

  return (
    <div className="space-y-3">
      <p dangerouslySetInnerHTML={{ __html: talent?.content }} />
    </div>
  )
}

export const ElementIconColor = {
  [Element.PHYSICAL]: 'bg-hsr-physical ring-hsr-physical',
  [Element.FIRE]: 'bg-hsr-fire ring-hsr-fire',
  [Element.ICE]: 'bg-hsr-ice ring-hsr-ice',
  [Element.LIGHTNING]: 'bg-hsr-lightning ring-hsr-lightning',
  [Element.WIND]: 'bg-hsr-wind ring-hsr-wind',
  [Element.QUANTUM]: 'bg-hsr-quantum ring-hsr-quantum',
  [Element.IMAGINARY]: 'bg-hsr-imaginary ring-hsr-imaginary',
}

export const ConsCircle = observer(
  ({
    talents,
    element,
    id,
    cons,
    stats,
  }: {
    talents: ITalent
    element: Element
    id: string
    cons: number
    stats?: StatsObject
  }) => {
    const char = findCharacter(id)

    const consImage = {
      B: 'Normal',
      S: 'BP',
      U: 'Ultra',
      T: 'Passive',
    }

    return (
      <div className="space-y-5">
        <div className="flex flex-col justify-around w-[252px] h-[252px]">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary-bg">
              <TalentIcon
                talent={talents?.c1}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${id}_Rank1.png`}
                element={element}
                active={cons >= 1}
                tooltipSize="w-[30vw]"
                type={talents?.c1?.trace}
              />
            </div>
          </div>
          <div className="flex justify-between px-3">
            <div className="rounded-full bg-primary-bg">
              <TalentIcon
                talent={talents?.c6}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${id}_Rank6.png`}
                element={element}
                active={cons >= 6}
                tooltipSize="w-[30vw]"
                type={talents?.c6?.trace}
              />
            </div>
            <div className="rounded-full bg-primary-bg">
              <TalentIcon
                talent={talents?.c2}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${id}_Rank2.png`}
                element={element}
                active={cons >= 2}
                tooltipSize="w-[30vw]"
                type={talents?.c2?.trace}
              />
            </div>
          </div>
          <div className="relative flex items-center justify-center h-12 -z-50">
            <p className="w-1/2 px-1 text-lg font-bold text-center">{`${char?.name}'s Eidolons`}</p>
            <div
              className={classNames(
                'absolute -translate-x-1/2 -translate-y-1/2 rounded-full w-[200px] h-[200px] ring top-1/2 left-1/2 bg-opacity-0 ring-opacity-50 pointer-events-none',
                ElementIconColor[element]
              )}
            />
            <img
              src={getPathImage(char?.path)}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 h-[150px] top-1/2 left-1/2 -z-10"
              onError={(e) => (e.currentTarget.style.display = 'none')}
              onLoad={(e) => (e.currentTarget.style.display = 'absolute')}
            />
          </div>
          <div className="flex justify-between px-3">
            <div className="rounded-full bg-primary-bg">
              <TalentIcon
                talent={talents?.c5}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${id}_${
                  consImage[_.head(talents?.c5?.content)]
                }.png`}
                element={element}
                active={cons >= 5}
                tooltipSize="w-[30vw]"
                type={talents?.c5?.trace}
              />
            </div>
            <div className="rounded-full bg-primary-bg">
              <TalentIcon
                talent={talents?.c3}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${id}_${
                  consImage[_.head(talents?.c3?.content)]
                }.png`}
                element={element}
                active={cons >= 3}
                tooltipSize="w-[30vw]"
                type={talents?.c3?.trace}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <div className="rounded-full bg-primary-bg">
              <TalentIcon
                talent={talents?.c4}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${id}_Rank4.png`}
                element={element}
                active={cons >= 4}
                tooltipSize="w-[30vw]"
                type={talents?.c4?.trace}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
)
