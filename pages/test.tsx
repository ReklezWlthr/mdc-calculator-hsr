import { PlanarSets, RelicSets } from '@src/data/db/artifacts'
import { Characters } from '@src/data/db/characters'
import { LightCones } from '@src/data/db/lightcone'
import { GenshinHome } from '@src/presentation/hsr/pages/index'
import _ from 'lodash'

const HomePage = () => {
  return (
    <div>
      {_.map(RelicSets, (item) => (
        <img src={`https://fribbels.github.io/hsr-optimizer/assets/icon/relic/${item.id}_${3}.webp`} />
      ))}
    </div>
  )
}

export default HomePage
