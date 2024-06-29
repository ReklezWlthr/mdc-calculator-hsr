import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { RelicBlock } from './relic_block'
import classNames from 'classnames'
import { useStore } from '@src/data/providers/app_store_provider'
import { useParams } from '@src/core/hooks/useParams'
import { useMemo } from 'react'
import { SelectTextInput } from '@src/presentation/components/inputs/select_text_input'
import { TagSelectInput } from '@src/presentation/components/inputs/tag_select_input'
import { AllRelicSets, RelicSets } from '@src/data/db/artifacts'
import { MainStatOptions, SubStatOptions } from '@src/domain/constant'
import { isSubsetOf } from '@src/core/utils/finder'

export const ArtifactListModal = observer(({ index, type }: { index: number; type: number }) => {
  const { params, setParams } = useParams({
    main: [],
    subs: [],
    set: null,
    type,
  })

  const { artifactStore, modalStore, teamStore } = useStore()

  const filteredArtifacts = useMemo(() => {
    let result = _.filter(artifactStore.artifacts, (artifact) => params.type === artifact.type)
    if (params.set) result = _.filter(result, (artifact) => artifact.setId === params.set)
    if (params.main.length) result = _.filter(result, (artifact) => _.includes(params.main, artifact.main))
    if (params.subs.length)
      result = _.filter(result, (artifact) => isSubsetOf(params.subs, _.map(artifact.subList, 'stat')))
    return result
  }, [params.set, params.subs, params.main])

  return (
    <div className="w-[65vw] p-4 text-white rounded-xl bg-primary-darker space-y-4">
      <div className="flex items-center justify-between w-full">
        <p className="text-lg font-bold">Choose a Relic</p>
        <div className="flex items-center gap-3">
          <SelectTextInput
            value={params.set}
            options={_.map(AllRelicSets, (artifact) => ({
              name: artifact.name,
              value: artifact.id.toString(),
              img: `https://api.hakush.in/hsr/UI/itemfigures/${artifact?.icon}.webp`,
            }))}
            placeholder="Artifact Set"
            onChange={(value) => setParams({ set: value?.value })}
          />
          <TagSelectInput
            values={params.main}
            options={_.map(MainStatOptions, (item) => ({
              ...item,
              img: 'https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/' + item.img,
            }))}
            onChange={(main) => setParams({ main })}
            placeholder="Main Stat"
            style="w-[220px]"
          />
          <TagSelectInput
            values={params.subs}
            options={_.map(SubStatOptions, (item) => ({
              ...item,
              img: 'https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/' + item.img,
            }))}
            onChange={(subs) => setParams({ subs })}
            placeholder="Sub Stats"
            maxSelection={4}
            style="w-[220px]"
          />
        </div>
      </div>
      <div className="grid w-full grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto hideScrollbar rounded-lg">
        {_.map(filteredArtifacts, (artifact) => (
          <div
            key={artifact.id}
            className="hover:scale-[97%] duration-200 cursor-pointer"
            onClick={() => {
              _.forEach(teamStore?.characters, (char, i) => {
                if (i !== index && _.includes(char.equipments?.artifacts, artifact.id))
                  teamStore.setArtifact(i, type, null)
              })
              teamStore.setArtifact(index, type, artifact.id)
              modalStore.closeModal()
            }}
          >
            <RelicBlock piece={artifact?.type} aId={artifact?.id} showWearer canEdit={false} />
          </div>
        ))}
      </div>
    </div>
  )
})
