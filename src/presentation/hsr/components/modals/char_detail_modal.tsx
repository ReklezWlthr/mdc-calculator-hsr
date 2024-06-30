import { useParams } from '@src/core/hooks/useParams'
import { findBaseLevel, findMaxLevel, findMaxTalentLevel, formatMinorTrace } from '@src/core/utils/data_format'
import { findCharacter } from '@src/core/utils/finder'
import { DefaultCharacterStore, MaxedCharacterStore } from '@src/data/stores/character_store'
import { AscensionOptions, EidolonOptions, ICharStore } from '@src/domain/constant'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback, useMemo } from 'react'
import { TalentIcon } from '@src/presentation/hsr/components/tables/scaling_wrapper'
import { ITalent } from '@src/domain/conditional'
import ConditionalsObject from '@src/data/lib/stats/conditionals/conditionals'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { TraceBlock } from '@src/presentation/hsr/components/trace_block'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { useStore } from '@src/data/providers/app_store_provider'
import { AbilityBlock } from '@src/presentation/hsr/components/ability_block'

export const CharDetailModal = observer(({ char, cId }: { char: ICharStore; cId: string }) => {
  const { charStore, toastStore, modalStore } = useStore()

  const { params, setParams } = useParams(
    char || {
      ...DefaultCharacterStore,
      cId,
      minor_traces: formatMinorTrace(findCharacter(cId)?.trace, Array(10).fill(false)),
    }
  )
  const maxedTrace = formatMinorTrace(findCharacter(cId)?.trace, Array(10).fill(true))

  const charData = findCharacter(cId)
  const levels = useMemo(
    () =>
      _.map(
        Array(findMaxLevel(params.ascension) - findBaseLevel(params.ascension) + 1 || 1).fill(
          findBaseLevel(params.ascension)
        ),
        (item, index) => ({
          name: _.toString(item + index),
          value: _.toString(item + index),
        })
      ).reverse(),
    [params.ascension]
  )

  const talent = _.find(ConditionalsObject, ['id', cId])?.conditionals(
    params?.cons,
    params?.major_traces,
    params?.talents,
    []
  )

  const maxTalentLevel = findMaxTalentLevel(params?.ascension)
  const talentLevels = _.map(Array(maxTalentLevel), (_, index) => ({
    name: (index + 1).toString(),
    value: (index + 1).toString(),
  })).reverse()
  const basicLevels = _.map(Array(params?.ascension || 1), (_, index) => ({
    name: (index + 1).toString(),
    value: (index + 1).toString(),
  })).reverse()

  const onSave = useCallback(() => {
    let pass = false
    if (_.find(charStore.characters, (item) => item.cId === cId)) {
      pass = charStore.editChar(cId, params)
    } else {
      pass = charStore.addChar(params)
    }
    if (pass) {
      toastStore.openNotification({
        title: 'Data Edited Successfully',
        icon: 'fa-solid fa-circle-check',
        color: 'green',
      })
      modalStore.closeModal()
    } else {
      toastStore.openNotification({
        title: 'Something Went Wrong',
        icon: 'fa-solid fa-exclamation-circle',
        color: 'red',
      })
    }
  }, [params, cId])

  return (
    <div className="w-[550px] p-4 text-white rounded-xl bg-primary-dark space-y-4 font-semibold">
      <p>Edit Account Data: {charData?.name}</p>
      <div className="space-y-1">
        <p className="w-full text-sm font-semibold">Level</p>
        <div className="flex w-full gap-2">
          <SelectInput
            onChange={(value) => setParams({ level: parseInt(value) || 0 })}
            options={levels}
            value={params.level?.toString()}
            style="w-[120px]"
          />
          <SelectInput
            onChange={(value) => {
              const max = findMaxTalentLevel(parseInt(value))
              setParams({
                ascension: parseInt(value) || 0,
                level: findBaseLevel(parseInt(value) || 0),
                major_traces: {
                  a2: parseInt(value) < 2 ? false : params.major_traces?.a2,
                  a4: parseInt(value) < 4 ? false : params.major_traces?.a4,
                  a6: parseInt(value) < 6 ? false : params.major_traces?.a6,
                },
              })
              const t = params.talents
              _.forEach(params.talents, (item, key: 'basic' | 'skill' | 'ult' | 'talent') => {
                const m = key === 'basic' ? parseInt(value) || 1 : max
                if (item >= m) t[key] = m
              })
              setParams({ talents: t })
            }}
            options={AscensionOptions}
            value={params.ascension?.toString()}
            style="w-fit"
          />
          <SelectInput
            onChange={(value) => setParams({ cons: parseInt(value) || 0 })}
            options={EidolonOptions}
            value={params.cons?.toString()}
            style="w-fit"
          />
        </div>
      </div>
      <div className="flex justify-between gap-4 px-3">
        <div className="grid items-center justify-center grid-cols-2 gap-5">
          <p className="-mb-2 text-lg font-bold text-center text-white col-span-full">Traces</p>
          <div className="flex items-center justify-center gap-3">
            <TalentIcon
              talent={talent?.talents?.normal}
              element={charData?.element}
              icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData?.id}_Normal.png`}
              size="w-9 h-9"
              upgraded={talent?.upgrade?.basic}
              showUpgrade
              hideTip
              type={talent?.talents?.basic?.trace}
            />
            <div>
              <p className="text-xs text-primary-lighter">Basic ATK</p>
              <SelectInput
                value={params?.talents?.basic?.toString()}
                onChange={(value) => setParams({ talents: { ...params.talents, basic: parseInt(value) } })}
                options={basicLevels}
                style="w-14"
                disabled={!charData}
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <TalentIcon
              talent={talent?.talents?.skill}
              element={charData?.element}
              icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData?.id}_BP.png`}
              size="w-9 h-9"
              upgraded={talent?.upgrade?.skill}
              level={char?.talents?.skill}
              showUpgrade
              hideTip
              type={talent?.talents?.skill?.trace}
            />
            <div>
              <p className="text-xs text-primary-lighter">Skill</p>
              <SelectInput
                value={params?.talents?.skill?.toString()}
                onChange={(value) => setParams({ talents: { ...params.talents, skill: parseInt(value) } })}
                options={talentLevels}
                style="w-14"
                disabled={!charData}
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <TalentIcon
              talent={talent?.talents?.ult}
              element={charData?.element}
              icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData?.id}_Ultra.png`}
              size="w-9 h-9"
              upgraded={talent?.upgrade?.ult}
              level={char?.talents?.ult}
              showUpgrade
              hideTip
              type={talent?.talents?.ult?.trace}
            />
            <div>
              <p className="text-xs text-primary-lighter">Ultimate</p>
              <SelectInput
                value={params?.talents?.ult?.toString()}
                onChange={(value) => setParams({ talents: { ...params.talents, ult: parseInt(value) } })}
                options={talentLevels}
                style="w-14"
                disabled={!charData}
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <TalentIcon
              talent={talent?.talents?.talent}
              element={charData?.element}
              icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData?.id}_Passive.png`}
              size="w-9 h-9"
              upgraded={talent?.upgrade?.talent}
              level={char?.talents?.talent}
              showUpgrade
              hideTip
              type={talent?.talents?.talent?.trace}
            />
            <div>
              <p className="text-xs text-primary-lighter">Talent</p>
              <SelectInput
                value={params?.talents?.talent?.toString()}
                onChange={(value) => setParams({ talents: { ...params.talents, talent: parseInt(value) } })}
                options={talentLevels}
                style="w-14"
                disabled={!charData}
              />
            </div>
          </div>
          <p className="-mb-2 font-bold text-center text-white col-span-full">Ascension Passives</p>
          <div className="flex justify-around col-span-full">
            <div className="flex flex-col items-center gap-3">
              <TalentIcon
                talent={talent?.talents?.a2}
                element={charData?.element}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData?.id}_SkillTree1.png`}
                size="w-9 h-9"
                type={talent?.talents?.a2?.trace}
                hideTip
              />
              <div className="flex gap-2">
                <p className="text-xs text-primary-lighter">A2</p>
                <CheckboxInput
                  checked={params?.major_traces?.a2}
                  onClick={() => setParams({ major_traces: { ...params.major_traces, a2: !params.major_traces?.a2 } })}
                  disabled={params?.ascension < 2}
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <TalentIcon
                talent={talent?.talents?.a4}
                element={charData?.element}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData?.id}_SkillTree2.png`}
                size="w-9 h-9"
                type={talent?.talents?.a4?.trace}
                hideTip
              />
              <div className="flex gap-2">
                <p className="text-xs text-primary-lighter">A4</p>
                <CheckboxInput
                  checked={params?.major_traces?.a4}
                  onClick={() => setParams({ major_traces: { ...params.major_traces, a4: !params.major_traces?.a4 } })}
                  disabled={params?.ascension < 4}
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <TalentIcon
                talent={talent?.talents?.a6}
                element={charData?.element}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData?.id}_SkillTree3.png`}
                size="w-9 h-9"
                type={talent?.talents?.a6?.trace}
                hideTip
              />
              <div className="flex gap-2">
                <p className="text-xs text-primary-lighter">A6</p>
                <CheckboxInput
                  checked={params?.major_traces?.a6}
                  onClick={() => setParams({ major_traces: { ...params.major_traces, a6: !params.major_traces?.a6 } })}
                  disabled={params?.ascension < 6}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="border rounded-lg col-span-full h-fit border-primary-border">
          <TraceBlock
            id={cId}
            data={params?.minor_traces}
            onClick={(index) => {
              const data = params.minor_traces[index]
              params.minor_traces.splice(index, 1, { ...data, toggled: !data.toggled })
              setParams(params)
            }}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <PrimaryButton
            title="Max All"
            onClick={() =>
              setParams({
                ...MaxedCharacterStore,
                cId,
                minor_traces: maxedTrace,
              })
            }
          />
          <PrimaryButton title="Max Minor Traces" onClick={() => setParams({ minor_traces: maxedTrace })} />
        </div>
        <PrimaryButton title="Save" onClick={onSave} />
      </div>
    </div>
  )
})
