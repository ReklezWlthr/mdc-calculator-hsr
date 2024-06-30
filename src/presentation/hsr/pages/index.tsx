import { useEffect, useState } from 'react'
import { Sidebar } from '../components/sidebar'
import { TeamSetup } from './team_setup'
import { HsrPage } from '@src/domain/constant'
import { useLocalUpdater } from '@src/core/hooks/useLocalUpdater'
import { observer } from 'mobx-react-lite'
import { ArtifactInventory } from './artifact_inventory'
import { MyBuilds } from './my_builds'
import { ImportExport } from './import'
import { Calculator } from './calc'
import { MyCharacters } from './my_chars'
import { useStore } from '@src/data/providers/app_store_provider'
import { IntroModal } from '@src/presentation/hsr/components/modals/intro_modal'
// import { CyclePage } from './cycle'
import { ComparePage } from './compare'

const InternalPage = ({ page }: { page: HsrPage }) => {
  switch (page) {
    case HsrPage.TEAM:
      return <TeamSetup />
    case HsrPage.INVENTORY:
      return <ArtifactInventory />
    case HsrPage.BUILD:
      return <MyBuilds />
    case HsrPage.IMPORT:
      return <ImportExport />
    case HsrPage.DMG:
      return <Calculator />
    case HsrPage.CHAR:
      return <MyCharacters />
    // case HsrPage.CYCLE:
    //   return <CyclePage />
    case HsrPage.COMPARE:
      return <ComparePage />
    default:
      return
  }
}

export const GenshinHome = observer(() => {
  const [page, setPage] = useState<HsrPage>(HsrPage.TEAM)

  const { modalStore } = useStore()
  useLocalUpdater('hsr')

  return (
    <div className="flex flex-shrink w-full h-full overflow-y-auto">
      <Sidebar onChange={setPage} currentPage={page} />
      <InternalPage page={page} />
    </div>
  )
})
