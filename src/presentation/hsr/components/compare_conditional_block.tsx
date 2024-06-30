import { observer } from 'mobx-react-lite'
import { ConditionalBlock, IContentIndex } from './conditional_block'
import { IContentIndexOwner, WeaponConditionalBlock } from './weapon_conditional_block'
import { CustomConditionalBlock } from './custom_conditional_block'
import _ from 'lodash'
import { IContent, IWeaponContent } from '@src/domain/conditional'
import { useStore } from '@src/data/providers/app_store_provider'

export const CompareConditionalBlock = observer(
  ({
    content,
  }: {
    content: { main: IContentIndex[]; team: IContentIndex[]; weapon: (i: number) => IContentIndex[] }
  }) => {
    const { setupStore } = useStore()
    return (
      <div className="text-white">
        <ConditionalBlock
          title="Self Modifiers"
          contents={_.filter(content.main, 'show')}
          formOverride={setupStore.forms[setupStore.selected[0]]}
          setForm={(...params) => setupStore.setFormValue(setupStore.selected[0], ...params)}
        />
        <ConditionalBlock
          title="Team Modifiers"
          contents={_.filter(content.team, 'show')}
          formOverride={setupStore.forms[setupStore.selected[0]]}
          setForm={(...params) => setupStore.setFormValue(setupStore.selected[0], ...params)}
        />
        <WeaponConditionalBlock
          contents={content.weapon(setupStore.selected[1])}
          formOverride={setupStore.forms[setupStore.selected[0]]}
          setForm={(...params) => setupStore.setFormValue(setupStore.selected[0], ...params)}
        />
        <CustomConditionalBlock
          index={setupStore.selected[1]}
          customOverride={setupStore.custom[setupStore.selected[0]][setupStore.selected[1]]}
          setValue={setupStore.setCustomValue}
          removeValue={setupStore.removeCustomValue}
        />
      </div>
    )
  }
)
