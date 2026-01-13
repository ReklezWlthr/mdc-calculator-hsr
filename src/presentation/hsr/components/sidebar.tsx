import { useStore } from '@src/data/providers/app_store_provider'
import { HsrPage } from '@src/domain/constant'
import classNames from 'classnames'
import { useCallback } from 'react'
import { SettingModal } from '@src/presentation/hsr/components/modals/setting_modal'
import { HelpModal } from '@src/presentation/hsr/components/modals/help_modal'
import { IntroModal } from '@src/presentation/hsr/components/modals/intro_modal'
import Link from 'next/link'

export const Sidebar = ({ currentPage, onChange }: { currentPage: HsrPage; onChange: (page: HsrPage) => void }) => {
  const { modalStore, settingStore } = useStore()

  const Pill = ({ name, page, icon }: { name: string; page: HsrPage; icon: string }) => {
    return (
      <div
        className={classNames(
          'flex items-center gap-2 px-3 py-2 text-sm font-normal duration-200 rounded-lg cursor-pointer text-gray',
          page === currentPage ? 'bg-primary' : 'hover:bg-primary-dark'
        )}
        onClick={() => onChange(page)}
      >
        <i className={classNames(icon, 'w-5 flex items-center justify-center text-white')} />
        <p>{name}</p>
      </div>
    )
  }

  const onOpenSettingModal = useCallback(() => modalStore.openModal(<SettingModal />), [])
  const onOpenHelpModal = useCallback(() => modalStore.openModal(<HelpModal />), [])
  const onOpenIntroModal = useCallback(() => modalStore.openModal(<IntroModal />), [])

  return (
    <div className="flex flex-col justify-between w-1/6 p-2 bg-primary-darker shrink-0">
      <div className="space-y-2">
        <Link href="/" className="flex flex-col items-end py-2 mx-3 text-white gap-x-2">
          <p className="flex items-center w-full text-2xl">
            MD<span className="text-base text-desc">✦</span>C Calculator
          </p>
          <p className="text-xs font-normal text-gray">Honkai: Star Rail</p>
        </Link>
        <div className="border-t border-primary-light" />
        <p className="p-2 font-bold text-white">Calculator</p>
        <Pill name="Team Setup" page={HsrPage.TEAM} icon="fa-solid fa-user" />
        <Pill name="Damage Calculator" page={HsrPage.DMG} icon="fa-solid fa-chart-simple" />
        {/* <Pill name="Turn Cycle" page={HsrPage.CYCLE} /> */}
        <Pill name="Compare" page={HsrPage.COMPARE} icon="fa-solid fa-arrow-right-arrow-left" />
        <Pill name="Import / Export" page={HsrPage.IMPORT} icon="fa-solid fa-file-import" />
        <p className="p-2 font-bold text-white">Account</p>
        <Pill name="My Characters" page={HsrPage.CHAR} icon="fa-solid fa-user-group" />
        <Pill name="My Builds" page={HsrPage.BUILD} icon="fa-solid fa-screwdriver-wrench" />
        <Pill name="Relic Inventory" page={HsrPage.INVENTORY} icon="fa-solid fa-briefcase" />
      </div>
      <div className="flex items-end justify-between px-3">
        <div className="w-full space-y-3 text-sm">
          {!settingStore.settings.liveOnly && (
            <div className="w-full px-2 py-1 text-xs text-white bg-green-700 rounded-md ring-1 ring-offset-2 ring-offset-primary-dark ring-green-400">
              <p className="flex items-center gap-1 font-bold">
                <i className="fa-info-circle fa-solid" />
                v4.0v2 Update
              </p>
              <p>Yao Guang & Sparxie: Now Available!</p>
            </div>
          )}
          <div className="flex items-center gap-3 cursor-pointer text-gray" onClick={onOpenIntroModal}>
            <i className="text-xl fa-solid fa-circle-info" />
            <p>About</p>
          </div>
          <div className="flex items-center gap-3 cursor-pointer text-gray" onClick={onOpenHelpModal}>
            <i className="text-xl fa-solid fa-question-circle" />
            <p>Guides</p>
          </div>
          <div className="flex items-center gap-3 cursor-pointer text-gray" onClick={onOpenSettingModal}>
            <i className="text-xl fa-solid fa-cog" />
            <p>Settings</p>
          </div>
        </div>
      </div>
    </div>
  )
}
