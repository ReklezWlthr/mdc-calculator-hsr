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
import { StatsObject, StatsObjectKeys } from '@src/data/lib/stats/baseConstant'
import { BaseAggro, BaseSummonAggro, ITeamChar } from '@src/domain/constant'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { SummonStatBlock } from '../summon_stat_block'
import { useCallback } from 'react'
import { StatsModal } from '../modals/stats_modal'
import { findCharacter } from '@src/core/utils/finder'

interface CompareSummonConditionalBlockProps {
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

export const CompareSummonConditionalBlock = observer(
  ({ team, stats, content }: CompareSummonConditionalBlockProps) => {
    const { setupStore, modalStore } = useStore()
    const [setupIndex, charIndex] = setupStore.selected

    const onOpenStatsModal = useCallback(
      () =>
        modalStore.openModal(
          <StatsModal
            compare
            teamIndex={setupIndex}
            stats={stats[charIndex].SUMMON_STATS}
            path={findCharacter(team[charIndex].cId)?.path}
            sumAggro={_.sumBy(
              stats,
              (item) =>
                (BaseAggro[item.PATH] *
                  (1 + (item.getValue(StatsObjectKeys.BASE_AGGRO) || 0)) *
                  (1 + (item.getValue(StatsObjectKeys.AGGRO) || 0)) || 0) +
                (BaseSummonAggro[item.SUMMON_STATS?.SUMMON_ID] *
                  (1 + (item.SUMMON_STATS?.getValue(StatsObjectKeys.BASE_AGGRO) || 0)) *
                  (1 + (item.SUMMON_STATS?.getValue(StatsObjectKeys.AGGRO) || 0)) || 0)
            )}
            memo
          />
        ),
      [stats, team, charIndex]
    )

    return (
      <div className="w-full space-y-3 text-white">
        <div className="flex items-center justify-between w-full">
          <p className="px-4 text-lg font-bold">
            <span className="text-desc">✦</span> Memosprite Stats <span className="text-desc">✦</span>
          </p>
          <PrimaryButton title="Stats Breakdown" onClick={onOpenStatsModal} />
        </div>
        <SummonStatBlock summonerHP={stats[charIndex].getHP()} stat={stats[charIndex].SUMMON_STATS} />
        <ConditionalBlock
          title="Team Modifiers"
          contents={_.filter(content.customTeam(charIndex), 'show')}
          formOverride={setupStore.forms[setupIndex]}
          statsOverride={stats}
          teamOverride={team}
          setForm={(...params) => setupStore.setFormValue(setupIndex, ...params)}
          selected={charIndex}
          compare
          memo
        />
        <WeaponConditionalBlock
          contents={content.weapon(charIndex)}
          formOverride={setupStore.forms[setupIndex]}
          setForm={(...params) => setupStore.setFormValue(setupIndex, ...params)}
          teamOverride={team}
          selected={charIndex}
          compare
          memo
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
          memo
        />
        <CustomConditionalBlock
          index={setupStore.selected[1]}
          customOverride={setupStore.custom[setupIndex][charIndex]}
          customDebuffOverride={setupStore.customDebuff[setupIndex]}
          setValue={setupStore.setCustomValue}
          removeValue={setupStore.removeCustomValue}
          memo
        />
      </div>
    )
  }
)
