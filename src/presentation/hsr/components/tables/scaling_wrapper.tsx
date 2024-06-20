import { calcScaling } from '@src/core/utils/calculator'
import { ITalentDisplay, TalentScalingStyle } from '@src/domain/conditional'
import { Element } from '@src/domain/constant'
import { Tooltip } from '@src/presentation/components/tooltip'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

interface ScalingWrapperProps {
  children: React.ReactNode[]
  icon: string
  talent: ITalentDisplay
  element: Element
  level?: number
  upgraded: number
}

interface TalentIconProps {
  icon: string
  element: Element
  talent: ITalentDisplay
  size?: string
  tooltipSize?: string
  level?: number
  showLevel?: boolean
  showUpgrade?: boolean
  upgraded?: number
  active?: boolean
  type?: string
  energy?: number
}

export const TalentIcon = observer(
  ({
    talent,
    icon,
    element,
    size,
    tooltipSize,
    level,
    showLevel,
    upgraded,
    showUpgrade,
    type,
    active = true,
    energy,
  }: TalentIconProps) => {
    const iconColor = {
      [Element.FIRE]: 'bg-hsr-fire ring-hsr-fire',
      [Element.ICE]: 'bg-hsr-ice ring-hsr-ice',
      [Element.LIGHTNING]: 'bg-hsr-lightning ring-hsr-lightning',
      [Element.PHYSICAL]: 'bg-hsr-physical ring-hsr-physical',
      [Element.WIND]: 'bg-hsr-wind ring-hsr-wind',
      [Element.QUANTUM]: 'bg-hsr-quantum ring-hsr-quantum',
      [Element.IMAGINARY]: 'bg-hsr-imaginary ring-hsr-imaginary',
    }

    const formattedString = _.reduce(
      Array.from(talent?.content?.matchAll(/{{\d+}}\%?/g) || []),
      (acc, curr) => {
        const index = curr?.[0]?.match(/\d+/)?.[0]
        const isPercentage = !!curr?.[0]?.match(/\%$/)
        return _.replace(
          acc,
          curr[0],
          `<span class="text-desc">${_.round(
            calcScaling(
              talent?.value?.[index]?.base,
              talent?.value?.[index]?.growth,
              level + upgraded,
              talent?.value?.[index]?.style
            ),
            1
          ).toLocaleString()}${isPercentage ? '%' : ''}</span>`
        )
      },
      talent?.content
    )

    return (
      <Tooltip
        title={
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-normal opacity-75 text-gray">{type}</p>
              <p>{talent?.title}</p>
            </div>
            <div className="flex flex-col items-end">
              {!!level && (
                <p className="text-xs font-normal text-gray">
                  Level:{' '}
                  <span className="text-desc">
                    {level} {!!upgraded && <span className="text-blue">(+{upgraded})</span>}
                  </span>
                </p>
              )}
              {!!energy && (
                <p className="text-xs font-normal text-gray">
                  Energy: <span className="text-desc"></span>
                </p>
              )}
            </div>
          </div>
        }
        body={<p dangerouslySetInnerHTML={{ __html: formattedString }} />}
        style={tooltipSize || 'w-[35vw]'}
      >
        <div className="relative group">
          <div
            className={classNames(
              'p-1 rounded-full bg-opacity-50 ring-2 ring-offset-2 group-hover:ring-offset-4 duration-200 ring-offset-primary-darker flex justify-center items-center',
              active ? iconColor[element] : 'bg-primary-light ring-primary-lighter opacity-50',
              size || 'w-12 h-12'
            )}
          >
            <img
              src={icon}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling.className = 'block text-3xl font-bold opacity-80'
              }}
              onLoad={(e) => {
                e.currentTarget.style.display = 'block'
                e.currentTarget.nextElementSibling.className = 'hidden'
              }}
            />
            <div className="hidden">?</div>
          </div>

          {!!level && showLevel && (
            <div
              className={classNames(
                'absolute flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full -bottom-1 -right-3 text-white',
                upgraded ? 'bg-cyan-600' : 'bg-primary-light'
              )}
            >
              {level + (upgraded || 0)}
            </div>
          )}
          {!showLevel && showUpgrade && !!upgraded && (
            <div className="absolute flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full -bottom-1 -right-3 bg-cyan-600 text-white">
              +{upgraded}
            </div>
          )}
        </div>
      </Tooltip>
    )
  }
)

export const ScalingWrapper = observer(({ children, icon, talent, element, level, upgraded }: ScalingWrapperProps) => {
  return (
    <div className="flex w-full">
      <div className="flex flex-col items-center justify-center w-1/5 px-2 py-5 min-h-[132px]">
        <TalentIcon talent={talent} icon={icon} element={element} level={level} upgraded={upgraded} />
        <p className="w-full mt-2 font-bold text-center min-h-5">{talent?.title}</p>
        {level && (
          <p className="text-xs text-gray">
            Level <span className={upgraded ? 'text-blue font-bold' : 'text-gray'}>{level + upgraded}</span>
          </p>
        )}
      </div>
      <div className="w-4/5 space-y-0.5">{children}</div>
    </div>
  )
})
