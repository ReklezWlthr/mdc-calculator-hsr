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
import { GlobalConditionalBlock } from '../conditionals/global_block'

interface CompareConditionalBlockProps {
  team: ITeamChar[]
  stats: StatsObject[]
  content: {
    main: IContentIndex[]
    team: IContentIndex[]
    weapon: (i: number) => IContentIndex[]
    artifact: (i: number) => IContentIndex[]
    customMain: (selected: number) => IContentIndex[]
    customTeam: (selected: number) => IContentIndex[]
  }
}

export const CompareConditionalBlock = observer(({ team, stats, content }: CompareConditionalBlockProps) => {
  const { setupStore } = useStore()
  const [setupIndex, charIndex] = setupStore.selected

  return (
    <div className="w-full space-y-3 text-white">
      <GlobalConditionalBlock
        formOverride={setupStore.globalMod[setupIndex]}
        teamOverride={team}
        setForm={(key, value) => {
          const result = _.cloneDeep(setupStore.globalMod)
          result.splice(setupIndex, 1, value)
          setupStore.setValue(key as any, result)
        }}
      />
      <ConditionalBlock
        title="Self Modifiers"
        contents={_.filter(content.customMain(charIndex), 'show')}
        formOverride={setupStore.forms[setupIndex]}
        statsOverride={stats}
        teamOverride={team}
        setForm={(...params) => setupStore.setFormValue(setupIndex, ...params)}
        selected={charIndex}
        compare
      />
      <ConditionalBlock
        title="Team Modifiers"
        contents={_.filter(content.customTeam(charIndex), 'show')}
        formOverride={setupStore.forms[setupIndex]}
        statsOverride={stats}
        teamOverride={team}
        setForm={(...params) => setupStore.setFormValue(setupIndex, ...params)}
        selected={charIndex}
        compare
      />
      <WeaponConditionalBlock
        contents={content.weapon(charIndex)}
        formOverride={setupStore.forms[setupIndex]}
        setForm={(...params) => setupStore.setFormValue(setupIndex, ...params)}
        teamOverride={team}
        selected={charIndex}
        compare
      />
      <ConditionalBlock
        title="Relic Modifiers"
        contents={content.artifact(charIndex)}
        formOverride={setupStore.forms[setupIndex]}
        statsOverride={stats}
        teamOverride={team}
        setForm={(...params) => setupStore.setFormValue(setupIndex, ...params)}
        selected={charIndex}
        compare
      />
      <CustomConditionalBlock
        index={setupStore.selected[1]}
        customOverride={setupStore.custom[setupIndex][charIndex]}
        customDebuffOverride={setupStore.customDebuff[setupIndex]}
        setValue={setupStore.setCustomValue}
        removeValue={setupStore.removeCustomValue}
      />
    </div>
  )
})
