import { getPathImage } from '@src/core/utils/fetcher'
import { findCharacter } from '@src/core/utils/finder'
import { StatsObject } from '@src/data/lib/stats/baseConstant'
import { ReverseConsList } from '@src/data/lib/stats/conditionals/conditionals'
import { ITalent, ITalentDisplay } from '@src/domain/conditional'
import { Element, Stats } from '@src/domain/constant'
import { Tooltip } from '@src/presentation/components/tooltip'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import getConfig from 'next/config'

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

    return (
      <div className="space-y-5">
        <div className="flex flex-col justify-around w-[252px] h-[252px]">
          <div className="flex justify-center">
            <Tooltip
              title={talents?.c1?.title}
              body={<TooltipBody talent={talents?.c1} stats={stats} unlocked={cons >= 1} />}
              style="w-[30vw]"
            >
              <div className="rounded-full bg-primary-bg">
                <img
                  src={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${id}_Rank1.png`}
                  className={classNames(
                    'w-12 h-12 p-1 rounded-full bg-opacity-60 ring-2 ring-offset-2 hover:ring-offset-4 duration-200 ring-offset-primary-darker',
                    cons >= 1 ? ElementIconColor[element] : 'bg-primary-light ring-primary-lighter opacity-50'
                  )}
                />
              </div>
            </Tooltip>
          </div>
          <div className="flex justify-between px-3">
            <Tooltip
              title={talents?.c6?.title}
              body={<TooltipBody talent={talents?.c6} stats={stats} unlocked={cons >= 6} />}
              style="w-[30vw]"
            >
              <div className="rounded-full bg-primary-bg">
                <img
                  src={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${id}_Rank6.png`}
                  className={classNames(
                    'w-12 h-12 p-1 rounded-full bg-opacity-60 ring-2 ring-offset-2 hover:ring-offset-4 duration-200 ring-offset-primary-darker',
                    cons >= 6 ? ElementIconColor[element] : 'bg-primary-light ring-primary-lighter opacity-50'
                  )}
                />
              </div>
            </Tooltip>
            <Tooltip
              title={talents?.c2?.title}
              body={<TooltipBody talent={talents?.c2} stats={stats} unlocked={cons >= 2} />}
              style="w-[30vw]"
            >
              <div className="rounded-full bg-primary-bg">
                <img
                  src={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${id}_Rank2.png`}
                  className={classNames(
                    'w-12 h-12 p-1 rounded-full bg-opacity-60 ring-2 ring-offset-2 hover:ring-offset-4 duration-200 ring-offset-primary-darker',
                    cons >= 2 ? ElementIconColor[element] : 'bg-primary-light ring-primary-lighter opacity-50'
                  )}
                />
              </div>
            </Tooltip>
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
            <Tooltip
              title={talents?.c5?.title}
              body={<TooltipBody talent={talents?.c5} stats={stats} unlocked={cons >= 5} />}
              style="w-[25vw]"
            >
              <div className="rounded-full bg-primary-bg">
                <img
                  src={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${id}_Ultra.png`}
                  className={classNames(
                    'shrink-0 w-12 h-12 p-1 rounded-full bg-opacity-60 ring-2 ring-offset-2 hover:ring-offset-4 duration-200 ring-offset-primary-darker',
                    cons >= 5 ? ElementIconColor[element] : 'bg-primary-light ring-primary-lighter opacity-50'
                  )}
                />
              </div>
            </Tooltip>
            <Tooltip
              title={talents?.c3?.title}
              body={<TooltipBody talent={talents?.c3} stats={stats} unlocked={cons >= 3} />}
              style="w-[25vw]"
            >
              <div className="rounded-full bg-primary-bg">
                <img
                  src={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${id}_BP.png`}
                  className={classNames(
                    'w-12 h-12 p-1 rounded-full bg-opacity-60 ring-2 ring-offset-2 hover:ring-offset-4 duration-200 ring-offset-primary-darker',
                    cons >= 3 ? ElementIconColor[element] : 'bg-primary-light ring-primary-lighter opacity-50'
                  )}
                />
              </div>
            </Tooltip>
          </div>
          <div className="flex justify-center">
            <Tooltip
              title={talents?.c4?.title}
              body={<TooltipBody talent={talents?.c4} stats={stats} unlocked={cons >= 4} />}
              style="w-[30vw]"
            >
              <div className="rounded-full bg-primary-bg">
                <img
                  src={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${id}_Rank4.png`}
                  className={classNames(
                    'w-12 h-12 p-1 rounded-full bg-opacity-60 ring-2 ring-offset-2 hover:ring-offset-4 duration-200 ring-offset-primary-darker',
                    cons >= 4 ? ElementIconColor[element] : 'bg-primary-light ring-primary-lighter opacity-50'
                  )}
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }
)
