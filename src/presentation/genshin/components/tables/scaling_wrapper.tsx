import { Element } from '@src/domain/constant'
import { Tooltip } from '@src/presentation/components/tooltip'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

interface ScalingWrapperProps {
  children: React.ReactNode[]
  icon: string
  talent: { title: string; content: string; upgrade?: string[] }
  element: Element
  level?: number
  upgraded: boolean
  childeBuff?: boolean
}

export const TalentIcon = observer(
  ({
    talent,
    icon,
    element,
    size,
    tooltipSize,
    crowned,
    level,
    upgraded,
  }: {
    icon: string
    element: Element
    talent: { title: string; content: string; upgrade?: string[] }
    size?: string
    tooltipSize?: string
    crowned?: boolean
    level?: number
    upgraded?: boolean
  }) => {
    const iconColor = {
      [Element.PYRO]: 'bg-genshin-pyro ring-genshin-pyro',
      [Element.HYDRO]: 'bg-genshin-hydro ring-genshin-hydro',
      [Element.CRYO]: 'bg-genshin-cryo ring-genshin-cryo',
      [Element.ELECTRO]: 'bg-genshin-electro ring-genshin-electro',
      [Element.GEO]: 'bg-genshin-geo ring-genshin-geo',
      [Element.ANEMO]: 'bg-genshin-anemo ring-genshin-anemo',
      [Element.DENDRO]: 'bg-genshin-dendro ring-genshin-dendro',
    }

    return (
      <Tooltip
        title={talent?.title}
        body={<p dangerouslySetInnerHTML={{ __html: talent?.content }} />}
        style={tooltipSize || 'w-[35vw]'}
      >
        <div className="relative group">
          {crowned && (
            <i className="absolute text-xl -left-1 -top-3 fa-solid fa-crown text-yellow -rotate-[30deg] pointer-events-none" />
          )}
          <img
            src={icon}
            className={classNames(
              'p-1 rounded-full bg-opacity-60 ring-2 ring-offset-2 group-hover:ring-offset-4 duration-200 ring-offset-primary-darker',
              iconColor[element],
              size || 'w-12 h-12'
            )}
          />
          {level && (
            <div
              className={classNames(
                'absolute flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full -bottom-1 -right-3 text-white',
                upgraded ? 'bg-cyan-600' : 'bg-primary-light'
              )}
            >
              {level + (upgraded ? 3 : 0)}
            </div>
          )}
          {!level && upgraded && (
            <div className="absolute flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full -bottom-1 -right-3 bg-cyan-600 text-white">
              +3
            </div>
          )}
        </div>
      </Tooltip>
    )
  }
)

export const ScalingWrapper = observer(
  ({ children, icon, talent, element, level, upgraded, childeBuff }: ScalingWrapperProps) => {
    return (
      <div className="flex w-full">
        <div className="flex flex-col items-center justify-center w-1/5 px-2 py-5">
          <TalentIcon talent={talent} icon={icon} element={element} crowned={level === 10} />
          <p className="w-full mt-2 font-bold text-center">{talent?.title}</p>
          {level && (
            <p className="text-xs text-gray">
              Level <span className={upgraded ? 'text-blue font-bold' : 'text-gray'}>{level + (upgraded ? 3 : 0)}</span>
              {childeBuff && <span className="text-desc"> (+1)</span>}
            </p>
          )}
        </div>
        <div className="w-4/5 space-y-0.5">{children}</div>
      </div>
    )
  }
)
