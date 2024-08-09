import { useCallback, useMemo } from 'react'
import { CharacterBlock } from '../components/character_block'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { StatBlock } from '../components/stat_block'
import { LCBlock } from '../components/lc_block'
import { RelicBlock } from '../components/relic_block'
import { useStore } from '@src/data/providers/app_store_provider'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { BuildModal } from '@src/presentation/hsr/components/modals/build_modal'
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
import { SaveBuildModal } from '@src/presentation/hsr/components/modals/save_build_modal'
import { SaveTeamModal } from '@src/presentation/hsr/components/modals/save_team_modal'
import { AbilityBlock } from '../components/ability_block'
import { BonusAbilityBlock } from '../components/bonus_ability_block'
import { TeamModal } from '../components/modals/team_modal'

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

  const InvalidModal = useCallback(
    () => (
      <CommonModal
        icon="fa-solid fa-exclamation-circle text-red"
        title="Missing Light Cone"
        desc="A build must include a Light Cone."
        onConfirm={() => modalStore.closeModal()}
        oneButton
      />
    ),
    []
  )

  const onOpenSaveModal = useCallback(() => {
    modalStore.openModal(char.equipments.weapon?.wId ? <SaveBuildModal index={selected} /> : <InvalidModal />)
  }, [selected, char])

  const onOpenTeamModal = useCallback(() => {
    modalStore.openModal(<SaveTeamModal />)
  }, [])

  const onOpenBuildModal = useCallback(() => {
    modalStore.openModal(<BuildModal index={selected} />)
  }, [selected])

  const onOpenSetupModal = useCallback(() => {
    modalStore.openModal(<TeamModal onSelect={(team) => teamStore.setValue('characters', team.char)} hideCurrent />)
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

  return (
    <div className="w-full customScrollbar">
      <div className="flex justify-center w-full gap-5 p-5 max-w-[1200px] mx-auto">
        <div className="w-1/3 space-y-3">
          <div className="flex items-center justify-between pt-1">
            <div className="flex justify-center w-full gap-4">
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
            <PrimaryButton
              onClick={onOpenSetupModal}
              icon="fa-solid fa-user-group text-sm"
              style="!rounded-full w-[42px]"
            />
          </div>
          <CharacterBlock index={selected} />
          <LCBlock index={selected} {...teamStore.characters[selected]?.equipments?.weapon} />
          <StatBlock stat={stats} />
        </div>
        <div className="w-1/5 space-y-5">
          <div className="grid items-center justify-center grid-cols-2 gap-5 py-3">
            <p className="-mb-2 text-lg font-bold text-center text-white col-span-full">Traces</p>
            <AbilityBlock
              char={char}
              talents={talent?.talents}
              upgrade={talent?.upgrade}
              onChange={(key, value) => teamStore.setTalentLevel(selected, key as any, value)}
            />
            <p className="-mb-2 font-bold text-center text-white col-span-full">Ascension Passives</p>
            <BonusAbilityBlock
              char={char}
              talents={talent?.talents}
              onChange={(key) => teamStore.toggleMajorTrace(selected, key)}
            />
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
