import { toPercentage } from '@src/core/utils/converter'
import { getMainStat } from '@src/core/utils/data_format'
import { findArtifactSet } from '@src/core/utils/finder'
import { PlanarSets, RelicSets } from '@src/data/db/artifacts'
import { useStore } from '@src/data/providers/app_store_provider'
import { MainStat, SubStat } from '@src/domain/artifact'
import { RelicPieceIcon, Stats } from '@src/domain/constant'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { SelectTextInput } from '@src/presentation/components/inputs/select_text_input'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { RarityGauge } from '@src/presentation/components/rarity_gauge'
import classNames from 'classnames'
import _ from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export const ArtifactModal = ({ type, index, aId }: { type: number; index?: number; aId?: string }) => {
  const { teamStore, artifactStore, modalStore, toastStore, settingStore } = useStore()
  const [error, setError] = useState('')

  const { watch, control, setValue, handleSubmit, reset, formState } = useForm({
    defaultValues: {
      setId: null,
      quality: 5,
      level: 15,
      main: _.head(MainStat[type]) as Stats,
      type,
      subList: Array(4).fill({ stat: null, value: null }),
    },
  })
  const values = watch()
  const mainStat = getMainStat(values.main, values.quality, values.level)
  const maxLevel = 15 - (5 - values.quality) * 3

  const setData = useMemo(() => findArtifactSet(values.setId), [values.setId])

  const subList = useFieldArray({ control, name: 'subList' })

  useEffect(() => {
    if (aId) {
      const { setId, subList, ...rest } = _.find(artifactStore.artifacts, ['id', aId])

      if (setId) {
        reset({
          ...rest,
          setId,
          subList: [...subList, ...Array(4 - subList.length).fill({ stat: null, value: null })],
        })
      }
    }
  }, [aId])

  const TypeButton = ({ buttonType }: { buttonType: number }) => {
    return (
      <div
        className={classNames('w-10 h-10 p-2 duration-200 rounded-full cursor-pointer hover:bg-primary-lighter', {
          'bg-primary-lighter': values.type === buttonType,
        })}
        onClick={() => {
          if ((values.type < 5 && buttonType >= 5) || (values.type >= 5 && buttonType < 5)) setValue('setId', '')
          setValue('type', buttonType)
          setValue('main', _.head(MainStat[buttonType]))
        }}
      >
        <img src={`https://api.hakush.in/hsr/UI/relicfigures/IconRelic${RelicPieceIcon[buttonType]}.webp`} />
      </div>
    )
  }

  const onSubmit = handleSubmit(({ subList, ...rest }) => {
    const id = aId || crypto.randomUUID()

    const trimmedSub = _.map(
      _.filter(subList, (item) => item.stat && item.value),
      (item) => ({ ...item, value: parseFloat(item.value) })
    )
    const unique = _.uniqBy(trimmedSub, 'stat')
    if (unique.length !== trimmedSub.length) return setError('Duplicated Sub Stats')
    if (_.find(trimmedSub, ['stat', rest.main])) return setError('Main Stat cannot appear in Sub Stats.')
    const data = { id, ...rest, subList: trimmedSub }

    const oldType = _.find(artifactStore.artifacts, ['id', aId])?.type
    const pass = aId ? artifactStore.editArtifact(aId, data) : artifactStore.addArtifact(data)
    toastStore.openNotification({
      title: aId ? 'Artifact Edited Successfully' : 'Artifact Created Successfully',
      icon: 'fa-solid fa-circle-check',
      color: 'green',
    })
    if (pass && index >= 0) {
      teamStore.setArtifact(index, rest.type, id)
      if (rest.type !== oldType && oldType) teamStore.setArtifact(index, oldType, null)
    }
    modalStore.closeModal()
  })

  return (
    <div className="w-[300px] p-4 space-y-4 font-semibold text-white rounded-xl bg-primary-dark">
      <div className="flex justify-center gap-2">
        <TypeButton buttonType={1} />
        <TypeButton buttonType={2} />
        <TypeButton buttonType={3} />
        <TypeButton buttonType={4} />
        <TypeButton buttonType={5} />
        <TypeButton buttonType={6} />
      </div>
      <div className="flex items-center gap-2">
        <div className="border rounded-full w-9 h-9 bg-primary-darker border-primary-light shrink-0">
          {setData?.icon && (
            <img src={`https://api.hakush.in/hsr/UI/itemfigures/${setData?.icon}.webp`} className="scale-105" />
          )}
        </div>
        <Controller
          name="setId"
          control={control}
          rules={{ required: { value: true, message: 'Relic set is required.' } }}
          render={({ field }) => (
            <SelectTextInput
              value={field.value}
              options={_.map(
                _.filter(values.type >= 5 ? PlanarSets : RelicSets, (a) => !(a.beta && settingStore.settings.liveOnly)),
                (artifact) => ({
                  name: artifact.name,
                  value: artifact.id.toString(),
                  img: `https://api.hakush.in/hsr/UI/itemfigures/${artifact.icon}.webp`,
                })
              )}
              placeholder="Relic Set"
              onChange={(value) => field.onChange(value?.value)}
            />
          )}
        />
      </div>
      <div className="flex items-center justify-center gap-3">
        <p className="text-sm">Level</p>
        <Controller
          name="level"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <SelectInput
              value={field.value.toString()}
              options={_.map(Array(maxLevel + 1), (_, index) => ({
                name: '+' + index,
                value: index.toString(),
              })).reverse()}
              style="w-16"
              onChange={(value) => field.onChange(_.parseInt(value))}
            />
          )}
        />
        <p className="text-sm">Grade</p>
        <Controller
          name="quality"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <SelectInput
              value={field.value.toString()}
              options={_.map(Array(4).fill(2), (item, index) => ({
                name: <RarityGauge rarity={item + index} />,
                value: (item + index).toString(),
              }))}
              style="w-[70px]"
              onChange={(value) => {
                const quality = _.parseInt(value)
                field.onChange(quality)
                if (values.level > 15 - (5 - quality) * 3) setValue('level', 15 - (5 - quality) * 3)
              }}
            />
          )}
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs">Main Stat</p>
        <div className="flex items-center justify-center gap-3">
          <Controller
            name="main"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <SelectInput
                value={field.value}
                options={_.map(MainStat[values.type], (item) => ({
                  name: item,
                  value: item,
                }))}
                style="w-3/4"
                onChange={field.onChange}
                disabled={_.includes([1, 2], values.type)}
              />
            )}
          />
          <div className="w-1/4 px-3 py-1 text-sm border rounded-lg text-gray border-primary-light bg-primary-darker">
            {_.includes([Stats.HP, Stats.ATK, Stats.SPD], values?.main)
              ? _.floor(mainStat).toLocaleString()
              : toPercentage(mainStat)}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs">Sub Stats</p>
        <div className="space-y-2">
          {_.map(subList.fields, (field, index) => (
            <div className="flex items-center justify-center gap-3" key={index}>
              <SelectTextInput
                value={subList.fields[index]?.stat}
                options={_.map(SubStat, (item) => ({
                  name: item,
                  value: item,
                }))}
                style="w-3/4"
                onChange={(value) => subList.update(index, { ...subList.fields[index], stat: value?.name })}
                placeholder={`Sub Stat ${index + 1}`}
              />
              <TextInput
                type="number"
                value={subList.fields[index]?.value?.toString()}
                onChange={(value) => subList.update(index, { ...subList.fields[index], value })}
                disabled={!subList.fields[index]?.stat}
                style="!w-1/4"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-normal text-center text-red">
          {formState.errors?.setId?.message?.toString() || error}
        </p>
        <PrimaryButton title="Confirm" onClick={onSubmit} />
      </div>
    </div>
  )
}
