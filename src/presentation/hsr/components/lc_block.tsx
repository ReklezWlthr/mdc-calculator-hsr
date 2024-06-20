import { findBaseLevel, findMaxLevel, getWeaponBase, getWeaponBonus } from '@src/core/utils/data_format'
import { useStore } from '@src/data/providers/app_store_provider'
import { AscensionOptions, SuperimposeOptions, StatIcons, Stats, PathType } from '@src/domain/constant'
import { PillInput } from '@src/presentation/components/inputs/pill_input'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback, useMemo } from 'react'
import { LCModal } from './lc_modal'
import { RarityGauge } from '@src/presentation/components/rarity_gauge'
import { findCharacter, findLightCone } from '@src/core/utils/finder'
import { toPercentage } from '@src/core/utils/converter'
import { Tooltip, TooltipPositionT } from '@src/presentation/components/tooltip'
import getConfig from 'next/config'
import classNames from 'classnames'

export const LCTooltip = ({
  wId,
  refinement,
  children,
  position,
}: {
  wId: string
  refinement: number
  children: React.ReactElement
  position?: TooltipPositionT
}) => {
  const data = findLightCone(wId)
  const properties = data?.desc?.properties
  const formattedString = _.reduce(
    Array.from(data?.desc?.detail?.matchAll(/{{\d+}}\%?/g) || []),
    (acc, curr) => {
      const index = curr?.[0]?.match(/\d+/)?.[0]
      const isPercentage = !!curr?.[0]?.match(/\%$/)
      return _.replace(
        acc,
        curr[0],
        `<span class="text-desc">${properties?.[index]?.base + properties?.[index]?.growth * (refinement - 1)}${
          isPercentage ? '%' : ''
        }</span>`
      )
    },
    data?.desc?.detail
  )

  return (
    <Tooltip
      title={data?.desc?.name}
      body={
        <div
          className="font-normal"
          dangerouslySetInnerHTML={{
            __html: formattedString,
          }}
        />
      }
      position={position}
      style="w-[450px]"
    >
      {children}
    </Tooltip>
  )
}

interface LCBlockProps {
  index?: number
  wId: string
  level: number
  ascension: number
  refinement: number
}

export const LCBlock = observer(({ index = -1, wId, level = 1, ascension = 0, refinement = 1 }: LCBlockProps) => {
  const { modalStore, teamStore } = useStore()

  const weaponData = findLightCone(wId)
  const weaponType = findCharacter(teamStore.characters[index]?.cId)?.path
  const rarity = weaponData?.rarity

  const weaponBaseAtk = getWeaponBase(weaponData?.baseAtk, level, ascension)
  const weaponBaseHp = getWeaponBase(weaponData?.baseHp, level, ascension)
  const weaponBaseDef = getWeaponBase(weaponData?.baseDef, level, ascension)

  const canEdit = index >= 0

  const levels = useMemo(
    () =>
      _.map(
        Array(findMaxLevel(ascension) - findBaseLevel(ascension) + 1 || 1).fill(findBaseLevel(ascension)),
        (item, index) => ({
          name: _.toString(item + index),
          value: _.toString(item + index),
        })
      ).reverse(),
    [ascension]
  )

  const onOpenModal = useCallback(() => {
    char && modalStore.openModal(<LCModal index={index} />)
  }, [modalStore, index])

  const invalid = weaponType !== weaponData?.type
  const char = teamStore.characters[index]?.cId

  return (
    <div className="w-full font-bold text-white rounded-lg bg-primary-dark h-[280px]">
      <div className="flex justify-center px-5 py-2 rounded-t-lg bg-primary-lighter">Light Cone</div>
      <div className="grid h-full grid-cols-2 gap-3 p-3">
        <div
          className={classNames('flex flex-col justify-between gap-1 h-fit shrink-0', { 'cursor-pointer': char })}
          onClick={onOpenModal}
        >
          {weaponData ? (
            <img
              src={`https://api.hakush.in/hsr/UI/lightconemaxfigures/${weaponData?.id}.webp`}
              className={classNames(
                'object-contain h-[200px] py-2 border rounded-lg bg-primary-darker duration-200',
                invalid ? 'border-error hover:border-red' : 'border-primary-border hover:border-primary-light'
              )}
            />
          ) : (
            <div
              className={classNames('h-[200px] border rounded-lg border-primary-border shrink-0', {
                'bg-primary-darker hover:border-primary-light': char,
                'bg-primary-bg': !char,
              })}
            />
          )}
          {!!rarity &&
            (invalid ? (
              <p className="text-xs text-center text-red">PATH MISMATCHED</p>
            ) : (
              <RarityGauge rarity={rarity} textSize="text-sm" />
            ))}
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between w-full h-6">
              <p className="text-sm font-semibold">Name</p>
              {weaponData && (
                <div className="flex items-center gap-x-1.5">
                  <p className="text-xs font-normal text-gray">Passive</p>
                  <LCTooltip wId={wId} refinement={refinement}>
                    <i className="text-base fa-regular fa-question-circle" />
                  </LCTooltip>
                </div>
              )}
            </div>
            <PillInput
              onClick={onOpenModal}
              onClear={() => teamStore.setWeapon(index, { wId: null, refinement: 1 })}
              value={weaponData?.name}
              disabled={!canEdit || !teamStore.characters[index]?.cId}
              placeholder="Click to Select Light Cone"
            />
            <p className="pt-1 text-sm font-semibold">Level</p>
            <div className="flex items-center w-full gap-2">
              <SelectInput
                onChange={(value) => teamStore.setWeapon(index, { level: parseInt(value) || 0 })}
                options={levels}
                value={level?.toString()}
                disabled={!canEdit || !weaponData}
              />
              <SelectInput
                onChange={(value) =>
                  teamStore.setWeapon(index, {
                    ascension: parseInt(value) || 0,
                    level: findBaseLevel(parseInt(value) || 0),
                  })
                }
                options={AscensionOptions}
                value={ascension?.toString()}
                style="w-fit"
                disabled={!canEdit || !weaponData}
              />
              <SelectInput
                onChange={(value) =>
                  teamStore.setWeapon(index, {
                    refinement: parseInt(value) || 1,
                  })
                }
                options={SuperimposeOptions}
                value={refinement?.toString()}
                style="w-fit"
                disabled={!canEdit || !weaponData}
              />
            </div>
          </div>
          <div className="px-1 pt-1 space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 shrink-0">
                <img
                  className="w-3.5"
                  src={`https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/${StatIcons[Stats.HP]}`}
                />
                <p>Base HP</p>
              </div>
              <hr className="w-full border border-primary-border" />
              <p className="font-normal text-gray">{_.floor(weaponBaseHp).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 shrink-0">
                <img
                  className="w-3.5"
                  src={`https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/${StatIcons[Stats.ATK]}`}
                />
                <p>Base ATK</p>
              </div>
              <hr className="w-full border border-primary-border" />
              <p className="font-normal text-gray">{_.floor(weaponBaseAtk).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 shrink-0">
                <img
                  className="w-3.5"
                  src={`https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/${StatIcons[Stats.DEF]}`}
                />
                <p>Base DEF</p>
              </div>
              <hr className="w-full border border-primary-border" />
              <p className="font-normal text-gray">{_.floor(weaponBaseDef).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
