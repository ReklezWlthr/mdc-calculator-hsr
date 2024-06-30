import { useStore } from '@src/data/providers/app_store_provider'
import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import { useMemo } from 'react'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { getEmote } from '@src/core/utils/fetcher'
import { findLightCone } from '@src/core/utils/finder'
import { getSetCount } from '@src/core/utils/data_format'
import { AllRelicSets } from '@src/data/db/artifacts'

export const BuildModal = observer(({ index }: { index: number }) => {
  const { buildStore, teamStore, modalStore, artifactStore } = useStore()

  const char = teamStore.characters[index]

  const filteredBuilds = useMemo(
    () =>
      _.orderBy(
        _.filter(buildStore.builds, (build) => build.cId === char?.cId),
        'isDefault',
        'desc'
      ),
    [buildStore.builds, char]
  )

  return (
    <div className="w-[33vw] p-4 text-white rounded-xl bg-primary-dark space-y-3 font-semibold">
      <p className="text-lg font-bold">Saved Builds</p>
      {filteredBuilds.length ? (
        _.map(filteredBuilds, (build) => {
          const equip = artifactStore.mapData(build.artifacts)
          const lc = findLightCone(build.weapon?.wId)
          const set = getSetCount(equip)
          return (
            <div className="flex justify-between w-full px-2 text-white" key={build.id}>
              <div className="w-full">
                <div className="flex items-center gap-2">
                  {build.isDefault && <i className="text-xs fa-solid fa-star text-yellow" title="Default Build" />}
                  <p className="w-full truncate">{build.name}</p>
                </div>
                {lc ? (
                  <p className="text-xs font-normal text-gray">
                    {lc?.name} S{build.weapon?.refinement} Lv.{build.weapon?.level}
                  </p>
                ) : (
                  <p className="text-xs font-normal text-gray">No Light Cone</p>
                )}
                {_.map(
                  set,
                  (value, key) =>
                    value >= 2 && (
                      <p className="text-xs font-normal text-gray" key={key}>
                        {_.find(AllRelicSets, (item) => item.id === key)?.name} • {_.floor(value / 2) * 2} Piece
                      </p>
                    )
                )}
              </div>
              <div className="flex gap-x-2">
                <PrimaryButton
                  title="Equip"
                  onClick={() => {
                    _.forEach(build.artifacts, (artifact, i) => teamStore.setArtifact(index, i + 1, artifact))
                    teamStore.setWeapon(index, build.weapon)
                    modalStore.closeModal()
                  }}
                />
              </div>
            </div>
          )
        })
      ) : (
        <div className="flex flex-col items-center justify-center w-full text-gray">
          <img src={getEmote('pom-pom-gallery--pom-pom-10')} className="w-32 h-32" />
          <p>No Saved Build</p>
        </div>
      )}
    </div>
  )
})
