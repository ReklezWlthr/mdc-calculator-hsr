import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useStore } from '@src/data/providers/app_store_provider'
import { useParams } from '@src/core/hooks/useParams'
import { BuildBlock } from '../components/build_block'
import { LCBlock } from '../components/lc_block'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RelicBlock } from '../components/relic_block'
import { MiniRelicBlock } from '../components/mini_relic_block'
import { findCharacter } from '@src/core/utils/finder'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { getSetCount } from '@src/core/utils/data_format'
import { SetToolTip } from './team_setup'
import { DefaultCharacter } from '@src/data/stores/team_store'
import { CommonModal } from '@src/presentation/components/common_modal'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import classNames from 'classnames'
import { GhostButton } from '@src/presentation/components/ghost.button'
import { RelicSetterT } from '../components/modals/artifact_list_modal'

export const MyBuilds = observer(() => {
  const { buildStore, artifactStore, modalStore, toastStore } = useStore()
  const { params, setParams } = useParams({
    searchWord: '',
  })

  const builds = params.searchWord
    ? _.filter(
        buildStore.builds,
        (item) =>
          _.includes(findCharacter(item.cId)?.name?.toLowerCase(), params.searchWord.toLowerCase()) ||
          _.includes(item.name.toLowerCase(), params.searchWord.toLowerCase())
      )
    : buildStore.builds
  const groupedBuild = _.groupBy(builds, 'cId')

  const [selected, setSelected] = useState('')
  const selectedBuild = _.find(buildStore.builds, ['id', selected])

  const [note, setNote] = useState(selectedBuild?.note || '')
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    setNote(selectedBuild?.note || '')
    setEditing(false)
  }, [selectedBuild])

  const artifactData = _.filter(artifactStore.artifacts, (item) => _.includes(selectedBuild?.artifacts, item.id))
  const set = getSetCount(artifactData)

  const onOpenDefaultModal = useCallback(() => {
    modalStore.openModal(
      <CommonModal
        icon="fa-solid fa-star text-desc"
        title="Set Build as Default"
        desc="Are you sure you want to set this build as default? Default build will be automatically equipped when selecting a character."
        onConfirm={() => {
          buildStore.setDefault(selected)
          toastStore.openNotification({
            title: 'Set Default Successfully',
            icon: 'fa-solid fa-circle-check',
            color: 'green',
          })
        }}
      />
    )
  }, [selected])

  const onOpenNoteModal = useCallback(() => {
    modalStore.openModal(
      <CommonModal
        icon="fa-solid fa-question-circle text-desc"
        title="Save Change"
        desc="Are you sure you want to save the change?"
        onConfirm={() => {
          buildStore.editBuild(selected, { note })
          setEditing(false)
          toastStore.openNotification({
            title: 'Note Edited Successfully',
            icon: 'fa-solid fa-circle-check',
            color: 'green',
          })
        }}
      />
    )
  }, [selected, note])

  const onOpenConfirmModal = useCallback(() => {
    modalStore.openModal(
      <CommonModal
        icon="fa-solid fa-exclamation-circle text-red"
        title="Delete Build"
        desc="Are you sure you want to delete this build? Deleting build will NOT delete designated artifacts."
        onConfirm={() => {
          buildStore.deleteBuild(selected)
          setSelected('')
          toastStore.openNotification({
            title: 'Build Deleted Successfully',
            icon: 'fa-solid fa-circle-check',
            color: 'green',
          })
        }}
      />
    )
  }, [selected])

  const setRelic: RelicSetterT = (_i, type, value) => {
    const clone = _.cloneDeep(selectedBuild.artifacts)
    clone.splice(type - 1, 1, value)
    buildStore.editBuild(selected, { artifacts: clone })
  }

  return (
    <div className="flex flex-col items-center w-full gap-5 p-5 max-w-[1200px] mx-auto">
      <div className="flex w-full h-full gap-x-5">
        <div className="flex flex-col w-1/3 h-full gap-2 shrink-0">
          <div className="flex items-center gap-6">
            <p className="text-2xl font-bold text-white shrink-0">My Builds</p>
            <TextInput
              value={params.searchWord}
              onChange={(v) => setParams({ searchWord: v })}
              placeholder={`Search for Build's Name or Owner`}
            />
          </div>
          <div className="flex flex-col w-full h-full gap-2 pr-1 overflow-y-auto rounded-lg customScrollbar">
            {_.size(builds) ? (
              _.map(groupedBuild, (build, owner) => (
                <BuildBlock
                  key={_.join(_.map(build, 'id'), '_')}
                  owner={owner}
                  build={build}
                  onClick={setSelected}
                  selected={selected}
                />
              )).sort((a, b) => findCharacter(a.props.owner)?.name?.localeCompare(findCharacter(b.props.owner)?.name))
            ) : (
              <div className="flex items-center justify-center w-full h-full rounded-lg bg-primary-darker text-gray">
                {params.searchWord ? 'Build Not Found' : 'No Saved Build'}
              </div>
            )}
          </div>
        </div>
        {selected ? (
          <div className="grid w-full grid-cols-11 gap-5">
            <div className="col-span-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-lighter">{findCharacter(selectedBuild.cId)?.name}</p>
                  <p className="mb-3 text-2xl font-bold text-white">{selectedBuild.name}</p>
                </div>
                <div className="flex items-center gap-x-2 shrink-0">
                  <PrimaryButton
                    icon={classNames('fa-solid fa-star text-desc', { 'opacity-30': selectedBuild.isDefault })}
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenDefaultModal()
                    }}
                    disabled={selectedBuild.isDefault}
                    style="w-10"
                  />
                  <PrimaryButton
                    icon="fa-solid fa-trash"
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenConfirmModal()
                    }}
                    style="w-10"
                  />
                </div>
              </div>
              <LCBlock
                {...selectedBuild.weapon}
                index={0}
                teamOverride={[{ ...DefaultCharacter, cId: selectedBuild.cId }]}
                setWeapon={(_i, value) =>
                  buildStore.editBuild(selected, { weapon: { ...selectedBuild.weapon, ...value } })
                }
                noClear
              />
              <div className="p-3 mt-3 space-y-1.5 text-xs rounded-lg text-gray bg-primary-darker">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white">Note:</p>
                  {editing ? (
                    <div className="flex gap-1">
                      <i
                        className="flex items-center justify-center w-5 h-5 text-xs rounded-sm cursor-pointer fa-solid fa-times text-red bg-primary"
                        onClick={() => {
                          setNote(selectedBuild?.note || '')
                          setEditing(false)
                        }}
                      />
                      <i
                        className="flex items-center justify-center w-5 h-5 text-xs rounded-sm cursor-pointer fa-solid fa-check text-heal bg-primary"
                        onClick={onOpenNoteModal}
                      />
                    </div>
                  ) : (
                    <i
                      className="flex items-center justify-center w-5 h-5 text-xs rounded-sm cursor-pointer fa-solid fa-pen bg-primary"
                      onClick={() => setEditing(true)}
                    />
                  )}
                </div>
                {editing ? (
                  <TextInput value={note} onChange={setNote} small placeholder="Enter Build Note" />
                ) : (
                  <p className="px-1">{selectedBuild?.note || 'None'}</p>
                )}
              </div>
            </div>
            <div className="col-span-6 space-y-2">
              <p className="font-bold text-center text-white">Cavern Relics</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <MiniRelicBlock type={1} aId={selectedBuild?.artifacts?.[0]} setRelic={setRelic} />
                  <MiniRelicBlock type={3} aId={selectedBuild?.artifacts?.[2]} setRelic={setRelic} />
                </div>
                <div className="space-y-4">
                  <MiniRelicBlock type={2} aId={selectedBuild?.artifacts?.[1]} setRelic={setRelic} />
                  <MiniRelicBlock type={4} aId={selectedBuild?.artifacts?.[3]} setRelic={setRelic} />
                </div>
              </div>
              <p className="font-bold text-center text-white">Planar Ornaments</p>
              <div className="grid grid-cols-2 gap-4">
                <MiniRelicBlock type={5} aId={selectedBuild?.artifacts?.[4]} setRelic={setRelic} />
                <MiniRelicBlock type={6} aId={selectedBuild?.artifacts?.[5]} setRelic={setRelic} />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-3">
                <div className="w-full px-3 py-2 space-y-1 rounded-lg h-fit bg-primary-dark">
                  {_.some(set, (item, key) => item >= 2 && _.head(key) === '1') ? (
                    _.map(set, (item, key) => <SetToolTip item={item} set={key} type="relic" key={key} />)
                  ) : (
                    <p className="text-xs text-white">No Relic Set Bonus</p>
                  )}
                </div>
                <div className="w-full px-3 py-2 space-y-1 rounded-lg h-fit bg-primary-dark">
                  {_.some(set, (item, key) => item >= 2 && _.head(key) === '3') ? (
                    _.map(set, (item, key) => <SetToolTip item={item} set={key} type="planar" key={key} />)
                  ) : (
                    <p className="text-xs text-white">No Planar Ornament Bonus</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-2xl font-bold rounded-lg bg-primary-darker text-gray">
            Selected a Build to Preview
          </div>
        )}
      </div>
    </div>
  )
})
