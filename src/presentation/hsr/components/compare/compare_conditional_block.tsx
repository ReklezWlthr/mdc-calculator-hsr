import { observer } from 'mobx-react-lite'
import { ConditionalBlock, IContentIndex } from '@src/presentation/hsr/components/conditionals/conditional_block'
import {
  IContentIndexOwner,
  WeaponConditionalBlock,
} from '@src/presentation/hsr/components/conditionals/weapon_conditional_block'
import { CustomConditionalBlock } from '@src/presentation/hsr/components/conditionals/custom_conditional_block'
import _ from 'lodash'
import { IContent, IWeaponContent } from '@src/domain/conditional'
import { useStore } from '@src/data/providers/app_store_provider'
import { StatsObject } from '@src/data/lib/stats/baseConstant'
import { ITeamChar } from '@src/domain/constant'

export const CompareConditionalBlock = observer(
  ({
    team,
    stats,
    content,
  }: {
    team: ITeamChar[]
    stats: StatsObject[]
    content: { main: IContentIndex[]; team: IContentIndex[]; weapon: (i: number) => IContentIndex[] }
  }) => {
    const { setupStore } = useStore()
    const [setupIndex, charIndex] = setupStore.selected

    return (
      <div className="text-white">
        <ConditionalBlock
          title="Self Modifiers"
          contents={_.filter(content.main, 'show')}
          formOverride={setupStore.forms[setupIndex]}
          statsOverride={stats}
          teamOverride={team}
          setForm={(...params) => setupStore.setFormValue(setupIndex, ...params)}
        />
        <ConditionalBlock
          title="Team Modifiers"
          contents={_.filter(content.team, 'show')}
          formOverride={setupStore.forms[setupIndex]}
          statsOverride={stats}
          teamOverride={team}
          setForm={(...params) => setupStore.setFormValue(setupIndex, ...params)}
        />
        <WeaponConditionalBlock
          contents={content.weapon(setupStore.selected[1])}
          formOverride={setupStore.forms[setupIndex]}
          setForm={(...params) => setupStore.setFormValue(setupIndex, ...params)}
        />
        <CustomConditionalBlock
          index={setupStore.selected[1]}
          customOverride={setupStore.custom[setupIndex][charIndex]}
          setValue={setupStore.setCustomValue}
          removeValue={setupStore.removeCustomValue}
        />
      </div>
    )
  }
)
