import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useStore } from '@src/data/providers/app_store_provider'
import { useParams } from '@src/core/hooks/useParams'
import { BuildBlock } from '../components/build_block'
import { LCBlock } from '../components/lc_block'
import { useMemo, useState } from 'react'
import { RelicBlock } from '../components/relic_block'
import { MiniRelicBlock } from '../components/mini_relic_block'
import { findCharacter } from '@src/core/utils/finder'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { getSetCount } from '@src/core/utils/data_format'
import { SetToolTip } from './team_setup'
import { DefaultCharacter } from '@src/data/stores/team_store'

export const MyBuilds = observer(() => {
  const { buildStore, artifactStore } = useStore()
  const { params, setParams } = useParams({
    searchWord: '',
  })

  const builds = params.searchWord
    ? _.filter(
        buildStore.builds,
        (item) =>
          _.includes(findCharacter(item.cId)?.name, params.searchWord) || _.includes(item.name, params.searchWord)
      )
    : buildStore.builds

  const [selected, setSelected] = useState('')
  const selectedBuild = useMemo(() => _.find(buildStore.builds, ['id', selected]), [selected])

  const artifactData = _.filter(artifactStore.artifacts, (item) => _.includes(selectedBuild?.artifacts, item.id))
  const set = getSetCount(artifactData)

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
          <div className="flex flex-col w-full gap-2 pr-1 overflow-y-auto rounded-lg customScrollbar">
            {_.size(builds) ? (
              _.map(builds, (build) => (
                <BuildBlock
                  key={build.id}
                  build={build}
                  onClick={() => setSelected(build.id)}
                  onDelete={() => setSelected('')}
                  selected={build.id === selected}
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
              <p className="text-sm text-primary-lighter">{findCharacter(selectedBuild.cId)?.name}</p>
              <p className="mb-3 text-2xl font-bold text-white">{selectedBuild.name}</p>
              <LCBlock
                {...selectedBuild.weapon}
                index={0}
                teamOverride={[{ ...DefaultCharacter, cId: selectedBuild.cId }]}
                disabled
              />
            </div>
            <div className="col-span-3 space-y-4">
              <MiniRelicBlock type={1} aId={selectedBuild?.artifacts?.[0]} />
              <MiniRelicBlock type={2} aId={selectedBuild?.artifacts?.[1]} />
              <MiniRelicBlock type={3} aId={selectedBuild?.artifacts?.[2]} />
              <MiniRelicBlock type={4} aId={selectedBuild?.artifacts?.[3]} />
            </div>
            <div className="col-span-3 space-y-4">
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
