import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useStore } from '@src/data/providers/app_store_provider'
import { useParams } from '@src/core/hooks/useParams'
import { BuildBlock } from '../components/build_block'
import { LCBlock } from '../components/lc_block'
import { useCallback, useMemo, useState } from 'react'
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

  const [selected, setSelected] = useState('')
  const selectedBuild = useMemo(() => _.find(buildStore.builds, ['id', selected]), [selected])

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

  return (
    <div className="flex flex-col items-center w-full gap-5 p-5 max-w-[1240px] mx-auto">
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
              _.map(builds, (build) => (
                <BuildBlock
                  key={build.id}
                  build={build}
                  onClick={() => setSelected(build.id)}
                  selected={selected === build.id}
                />
              ))
            ) : (
              <div className="flex items-center justify-center w-full h-full rounded-lg bg-primary-darker text-gray">
                {params.searchWord ? 'Build Not Found' : 'No Saved Build'}
              </div>
            )}
          </div>
        </div>
        {selected ? (
          <div className="grid grid-cols-11 gap-5 mx-auto">
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
                    style="w-10 px-0"
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
                disabled
              />
              {selectedBuild.note && (
                <div className="p-3 mt-3 text-xs rounded-lg text-gray bg-primary-darker">
                  <p className='mb-1 text-sm text-white'>Note:</p>
                  {selectedBuild.note}
                </div>
              )}
            </div>
            <div className="col-span-3 space-y-4">
              <p className="-mb-3 font-bold text-center text-white">Cavern Relics</p>
              <MiniRelicBlock type={1} aId={selectedBuild?.artifacts?.[0]} />
              <MiniRelicBlock type={2} aId={selectedBuild?.artifacts?.[1]} />
              <MiniRelicBlock type={3} aId={selectedBuild?.artifacts?.[2]} />
              <MiniRelicBlock type={4} aId={selectedBuild?.artifacts?.[3]} />
            </div>
            <div className="col-span-3 space-y-4">
              <p className="-mb-3 font-bold text-center text-white">Planar Ornaments</p>
              <MiniRelicBlock type={6} aId={selectedBuild?.artifacts?.[5]} />
              <MiniRelicBlock type={5} aId={selectedBuild?.artifacts?.[4]} />
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
