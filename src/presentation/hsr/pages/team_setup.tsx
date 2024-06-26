import { useCallback } from 'react'
import { CharacterBlock } from '../components/character_block'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { StatBlock } from '../components/stat_block'
import { LCBlock } from '../components/lc_block'
import { RelicBlock } from '../components/relic_block'
import { useStore } from '@src/data/providers/app_store_provider'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { BuildModal } from '../components/build_modal'
import { findCharacter } from '@src/core/utils/finder'
import { findMaxTalentLevel, getSetCount } from '@src/core/utils/data_format'
import { PlanarSets, RelicSets } from '@src/data/db/artifacts'
import { Tooltip } from '@src/presentation/components/tooltip'
import { CommonModal } from '@src/presentation/components/common_modal'
import { CharacterSelect } from '../components/character_select'
import { TalentIcon } from '../components/tables/scaling_wrapper'
import ConditionalsObject from '@src/data/lib/stats/conditionals/conditionals'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { calculateFinal, calculateOutOfCombat } from '@src/core/utils/calculator'
import { baseStatsObject } from '@src/data/lib/stats/baseConstant'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { TraceBlock } from '../components/trace_block'
import { SaveBuildModal } from '../components/save_build_modal'
import { SaveTeamModal } from '../components/save_team_modal'

export const SetToolTip = observer(({ item, set, type }: { item: number; set: string; type: 'relic' | 'planar' }) => {
  const setDetail = _.find(type === 'relic' ? RelicSets : PlanarSets, ['id', set])
  const count = _.floor(item / 2) * 2
  return (
    setDetail &&
    item >= 2 && (
      <Tooltip
        title={setDetail?.name}
        body={
          <div className="space-y-1">
            <p
              className={count < 2 && 'opacity-40'}
              dangerouslySetInnerHTML={{ __html: `<b>2 Piece:</b> ${setDetail?.desc[0]}` }}
            />
            {type === 'relic' && (
              <p
                className={count < 4 && 'opacity-40'}
                dangerouslySetInnerHTML={{ __html: `<b>4 Piece:</b> ${setDetail?.desc[1]}` }}
              />
            )}
          </div>
        }
        style="w-[400px]"
        key={set}
      >
        <div className="flex items-center justify-between w-full gap-3 text-xs text-white cursor-default">
          <p className="w-full line-clamp-2">{setDetail?.name}</p>
          <p className="px-2 py-0.5 rounded-lg bg-primary-lighter bg-opacity-40">{count}</p>
        </div>
      </Tooltip>
    )
  )
})

export const TeamSetup = observer(() => {
  const { teamStore, modalStore, artifactStore, settingStore } = useStore()
  const selected = teamStore.selected

  const artifactData = _.filter(artifactStore.artifacts, (item) =>
    _.includes(teamStore.characters[selected]?.equipments?.artifacts, item.id)
  )

  const char = teamStore.characters[selected]
  const charData = findCharacter(char.cId)
  const raw = calculateOutOfCombat(_.cloneDeep(baseStatsObject), selected, teamStore.characters, artifactData)
  const stats = calculateFinal(raw)

  const onOpenSaveModal = useCallback(() => {
    modalStore.openModal(<SaveBuildModal index={selected} />)
  }, [selected])

  const onOpenTeamModal = useCallback(() => {
    modalStore.openModal(<SaveTeamModal />)
  }, [])

  const onOpenBuildModal = useCallback(() => {
    modalStore.openModal(<BuildModal index={selected} />)
  }, [selected])

  const onOpenConfirmModal = useCallback(() => {
    modalStore.openModal(
      <CommonModal
        icon="fa-solid fa-question-circle text-yellow"
        title="Unequip All"
        desc="This will unequip everything from this character, including weapons and artifacts. Do you wish to proceed?"
        onConfirm={() => teamStore.unequipAll(selected)}
      />
    )
  }, [selected])

  const set = getSetCount(artifactData)

  const talent = _.find(ConditionalsObject, ['id', char.cId])?.conditionals(
    char?.cons,
    char?.major_traces,
    char?.talents,
    teamStore.characters
  )

  const maxTalentLevel = findMaxTalentLevel(char?.ascension)
  const talentLevels = _.map(Array(maxTalentLevel), (_, index) => ({
    name: (index + 1).toString(),
    value: (index + 1).toString(),
  })).reverse()
  const basicLevels = _.map(Array(char?.ascension || 1), (_, index) => ({
    name: (index + 1).toString(),
    value: (index + 1).toString(),
  })).reverse()

  return (
    <div className="w-full customScrollbar">
      <div className="flex justify-center w-full gap-5 p-5 max-w-[1240px] mx-auto">
        <div className="w-1/3 space-y-3">
          <div className="flex justify-center w-full gap-4 pt-1">
            {_.map(teamStore?.characters, (item, index) => {
              return (
                <CharacterSelect
                  key={`char_select_${index}`}
                  onClick={() => teamStore.setValue('selected', index)}
                  isSelected={index === selected}
                  id={item.cId}
                />
              )
            })}
          </div>
          <CharacterBlock index={selected} />
          <LCBlock index={selected} {...teamStore.characters[selected]?.equipments?.weapon} />
          <StatBlock index={selected} stat={stats} />
        </div>
        <div className="w-1/5 space-y-5">
          <div className="grid items-center justify-center grid-cols-2 gap-5 py-3">
            <p className="-mb-2 text-lg font-bold text-center text-white col-span-full">Traces</p>
            <div className="flex items-center gap-3">
              <TalentIcon
                talent={talent?.talents?.normal}
                element={charData?.element}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData?.id}_Normal.png`}
                size="w-9 h-9"
                upgraded={talent?.upgrade?.basic}
                level={char?.talents?.basic}
                showUpgrade
                type={talent?.talents?.basic?.trace}
              />
              <div>
                <p className="text-xs text-primary-lighter">Basic ATK</p>
                <SelectInput
                  value={char?.talents?.basic?.toString()}
                  onChange={(value) => teamStore.setTalentLevel(selected, 'basic', parseInt(value))}
                  options={basicLevels}
                  style="w-14"
                  disabled={!charData}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TalentIcon
                talent={talent?.talents?.skill}
                element={charData?.element}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData?.id}_BP.png`}
                size="w-9 h-9"
                upgraded={talent?.upgrade?.skill}
                level={char?.talents?.skill}
                showUpgrade
                type={talent?.talents?.skill?.trace}
              />
              <div>
                <p className="text-xs text-primary-lighter">Skill</p>
                <SelectInput
                  value={char?.talents?.skill?.toString()}
                  onChange={(value) => teamStore.setTalentLevel(selected, 'skill', parseInt(value))}
                  options={talentLevels}
                  style="w-14"
                  disabled={!charData}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TalentIcon
                talent={talent?.talents?.ult}
                element={charData?.element}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData?.id}_Ultra.png`}
                size="w-9 h-9"
                upgraded={talent?.upgrade?.ult}
                level={char?.talents?.ult}
                showUpgrade
                type={talent?.talents?.ult?.trace}
              />
              <div>
                <p className="text-xs text-primary-lighter">Ultimate</p>
                <SelectInput
                  value={char?.talents?.ult?.toString()}
                  onChange={(value) => teamStore.setTalentLevel(selected, 'ult', parseInt(value))}
                  options={talentLevels}
                  style="w-14"
                  disabled={!charData}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TalentIcon
                talent={talent?.talents?.talent}
                element={charData?.element}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${charData?.id}_Passive.png`}
                size="w-9 h-9"
                upgraded={talent?.upgrade?.talent}
                level={char?.talents?.talent}
                showUpgrade
                type={talent?.talents?.talent?.trace}
              />
              <div>
                <p className="text-xs text-primary-lighter">Talent</p>
                <SelectInput
                  value={char?.talents?.talent?.toString()}
                  onChange={(value) => teamStore.setTalentLevel(selected, 'talent', parseInt(value))}
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
                />
                <div className="flex gap-2">
                  <p className="text-xs text-primary-lighter">A2</p>
                  <CheckboxInput
                    checked={char?.major_traces?.a2}
                    onClick={() => teamStore.toggleMajorTrace(selected, 'a2')}
                    disabled={char?.ascension < 2}
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
                />
                <div className="flex gap-2">
                  <p className="text-xs text-primary-lighter">A4</p>
                  <CheckboxInput
                    checked={char?.major_traces?.a4}
                    onClick={() => teamStore.toggleMajorTrace(selected, 'a4')}
                    disabled={char?.ascension < 4}
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
                />
                <div className="flex gap-2">
                  <p className="text-xs text-primary-lighter">A6</p>
                  <CheckboxInput
                    checked={char?.major_traces?.a6}
                    onClick={() => teamStore.toggleMajorTrace(selected, 'a6')}
                    disabled={char?.ascension < 6}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-full">
              <TraceBlock
                id={char?.cId}
                data={char?.minor_traces}
                onClick={(i) => teamStore.toggleMinorTrace(selected, i)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full px-3 py-2 space-y-1 rounded-lg bg-primary-dark">
              {_.some(set, (item, key) => item >= 2 && _.head(key) === '1') ? (
                _.map(set, (item, key) => <SetToolTip item={item} set={key} type="relic" key={key} />)
              ) : (
                <p className="text-xs text-white">No Relic Set Bonus</p>
              )}
            </div>
            <div className="w-full px-3 py-2 space-y-1 rounded-lg bg-primary-dark">
              {_.some(set, (item, key) => item >= 2 && _.head(key) === '3') ? (
                _.map(set, (item, key) => <SetToolTip item={item} set={key} type="planar" key={key} />)
              ) : (
                <p className="text-xs text-white">No Planar Ornament Bonus</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <PrimaryButton title="Equip Build" onClick={onOpenBuildModal} />
            <PrimaryButton title="Unequip All" onClick={onOpenConfirmModal} />
            <PrimaryButton title="Save Build" onClick={onOpenSaveModal} />
            <PrimaryButton title="Save Team" onClick={onOpenTeamModal} />
          </div>
        </div>
        <div className="w-1/5 space-y-5">
          <RelicBlock index={selected} piece={1} aId={teamStore.characters[selected]?.equipments?.artifacts?.[0]} />
          <RelicBlock index={selected} piece={3} aId={teamStore.characters[selected]?.equipments?.artifacts?.[2]} />
          <RelicBlock index={selected} piece={5} aId={teamStore.characters[selected]?.equipments?.artifacts?.[4]} />
        </div>
        <div className="w-1/5 space-y-5">
          <RelicBlock index={selected} piece={2} aId={teamStore.characters[selected]?.equipments?.artifacts?.[1]} />
          <RelicBlock index={selected} piece={4} aId={teamStore.characters[selected]?.equipments?.artifacts?.[3]} />
          <RelicBlock index={selected} piece={6} aId={teamStore.characters[selected]?.equipments?.artifacts?.[5]} />
        </div>
      </div>
    </div>
  )
})
