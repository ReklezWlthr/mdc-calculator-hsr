import { useStore } from '@src/data/providers/app_store_provider'
import { observer } from 'mobx-react-lite'
import _ from 'lodash'
import { useMemo } from 'react'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { getEmote } from '@src/core/utils/fetcher'
import { findArtifactSet, findLightCone } from '@src/core/utils/finder'
import { findMaxLevel, getSetCount, padArray } from '@src/core/utils/data_format'
import { IBuild } from '@src/domain/constant'
import { romanize } from '../../../../core/utils/converter'

export const BuildModalBlock = ({ build, button }: { build: IBuild; button: React.ReactNode }) => {
  const { artifactStore } = useStore()
  const equip = artifactStore.mapData(build.artifacts)
  const lc = findLightCone(build.weapon?.wId)
  const set = getSetCount(equip)

  return (
    <div className="flex items-center justify-between w-full pr-4 overflow-hidden rounded-lg bg-primary-darker">
      <div className="flex items-center h-[72px] gap-2">
        {lc && (
          <div className="relative w-24 h-full overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 z-10 w-full h-full from-12% to-60% bg-gradient-to-l from-primary-darker to-transparent" />
            <img
              src={`/asset/lightcone/full/${lc.id}.webp`}
              className="object-cover h-16 scale-[300%] mt-9 ml-4"
            />
            <div className="absolute z-10 p-1 text-xs text-white rounded-md bottom-1 left-1 bg-primary-dark">
              Lv. {build.weapon?.level}/
              <span className="text-desc opacity-80">{findMaxLevel(build.weapon?.ascension)}</span>
            </div>
            <div className="absolute z-10 w-6 h-6 p-1 text-xs text-center rounded-full text-gray top-1 right-1 bg-primary-dark">
              S{build.weapon?.refinement}
            </div>
          </div>
        )}
        <div className="flex flex-col h-full gap-1 py-1.5">
          <div className="flex items-center gap-2 h">
            {build.isDefault && <i className="text-xs fa-solid fa-star text-yellow" title="Default Build" />}
            <p className="w-[150px] truncate">{build.name}</p>
          </div>
          <div className="flex gap-2">
            {_.flatMap(
              set,
              (value, key) =>
                value >= 2 &&
                _.map(Array(_.floor(value / 2)), (_item) => (
                  <img
                    src={`/asset/relic/set/${findArtifactSet(key)?.id}.webp`}
                    className="w-8 h-8"
                  />
                ))
            )}
          </div>
        </div>
      </div>
      {button}
    </div>
  )
}

export const BuildModal = observer(({ index }: { index: number }) => {
  const { buildStore, teamStore, modalStore } = useStore()

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
    <div className="w-[400px] p-4 text-white rounded-xl bg-primary-dark space-y-3 font-semibold">
      <div>
        <p className="text-lg font-bold">Saved Builds</p>
        <p className="text-xs font-normal text-gray">Click on each build for more detail</p>
      </div>
      {filteredBuilds.length ? (
        _.map(filteredBuilds, (build) => (
          <BuildModalBlock
            build={build}
            button={
              <PrimaryButton
                title="Equip"
                onClick={() => {
                  _.forEach(build.artifacts, (artifact, i) => teamStore.setArtifact(index, i + 1, artifact))
                  teamStore.setWeapon(index, build.weapon)
                  modalStore.closeModal()
                }}
              />
            }
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center w-full text-gray">
          <img src={getEmote('pom-pom-gallery--pom-pom-10')} className="w-32 h-32" />
          <p>No Saved Build</p>
        </div>
      )}
    </div>
  )
})
