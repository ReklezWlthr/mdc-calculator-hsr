import { useStore } from '@src/data/providers/app_store_provider'
import { CommonModal } from '@src/presentation/components/common_modal'
import { CheckboxInput } from '@src/presentation/components/inputs/checkbox'
import { SelectInput } from '@src/presentation/components/inputs/select_input'
import { TextInput } from '@src/presentation/components/inputs/text_input'
import { ToggleSwitch } from '@src/presentation/components/inputs/toggle'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { Tooltip } from '@src/presentation/components/tooltip'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

export const SettingModal = observer(() => {
  const { settingStore } = useStore()

  return (
    <div className="w-[25vw] bg-primary-dark rounded-lg p-3 space-y-2">
      <p className="text-lg font-bold text-white">Settings</p>
      <div className="flex items-center justify-between p-3 rounded-lg bg-primary-darker gap-x-2">
        <p className="text-sm text-gray">Choose Your Trailblazer</p>
        <div className="flex items-center gap-2 text-xs text-desc">
          <p>Caelus</p>
          <ToggleSwitch
            enabled={settingStore.settings.travelerGender === 'PlayerGirl'}
            onClick={(v) => settingStore.setSettingValue({ travelerGender: v ? 'PlayerGirl' : 'PlayerBoy' })}
          />
          <p>Stelle</p>
        </div>
      </div>
      <div className="p-3 space-y-3 rounded-lg bg-primary-darker">
        <p className="text-white">Default Data</p>
        <div className="flex items-center justify-between gap-x-2">
          <p className="text-sm text-gray">Default Enemy Level</p>
          <TextInput
            value={settingStore.settings?.defaultEnemyLevel?.toString()}
            onChange={(v) => settingStore.setSettingValue({ defaultEnemyLevel: parseInt(v) })}
            style="!w-1/4"
          />
        </div>
        <div className="flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray">Show Enemy SU Variant</p>
            <Tooltip
              title="Show Enemy SU Variant"
              body={
                <div>
                  Some Elite and Boss enemies will show up in <b>Simulated/Divergent Universe</b> in either{' '}
                  <b>Complete</b> or <b>Bug</b> variant. These variants are hidden by default but you can disable it
                  here.
                  <p className="text-xs italic text-red">
                    ✦ Do note that enemy's Max HP may differ across different contents. Feel free to modify it if the
                    value provided is not the one you are looking for.
                  </p>
                </div>
              }
              style="w-[400px]"
            >
              <i className="fa-regular fa-question-circle" />
            </Tooltip>
          </div>
          <ToggleSwitch
            enabled={settingStore.settings.variant}
            onClick={(v) => settingStore.setSettingValue({ variant: v })}
          />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center justify-between gap-x-2">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray">Modifiers Initial Values</p>
              <Tooltip
                title="Modifiers Initial Values"
                body={
                  <div>
                    <p>
                      Determines the initial value of your character's modifiers in <b>Damage Calculator</b> and{' '}
                      <b>Compare</b> page.
                    </p>
                    <p>
                      <b>Default</b> will use the base value from the system as I see appropriate while <b>Maximum</b>/
                      <b>Minimum</b> will respectively use the highest/lowest value possible for each modifier.
                    </p>
                    <p className="text-xs italic text-red">
                      ✦ Maximum value does not always translate to higher damage as some modifiers scale inversely.
                    </p>
                    <p className="text-xs italic text-desc">
                      ✦ This setting has no effect on single-target modifiers. They are toggled off by default.
                    </p>
                    <p className="text-xs italic text-desc">
                      ✦ Only take effect after a change to setup data or a page refresh.
                    </p>
                  </div>
                }
                style="w-[400px]"
              >
                <i className="fa-regular fa-question-circle" />
              </Tooltip>
            </div>
            <SelectInput
              value={settingStore.settings.formMode}
              options={[
                { name: 'Default', value: 'default' },
                { name: 'Maximum', value: 'max' },
                { name: 'Minimum', value: 'min' },
              ]}
              onChange={(v) => settingStore.setSettingValue({ formMode: v as any })}
              style="w-[100px]"
            />
          </div>
        </div>
      </div>
      <div className="p-3 space-y-1 rounded-lg bg-primary-darker">
        <p className="text-white">Account Data</p>
        <div className="flex gap-x-2">
          <p className="text-sm text-gray">Automatically save my account data to the browser's local storage</p>
          <CheckboxInput
            checked={settingStore.settings.storeData}
            onClick={(v) => settingStore.setSettingValue({ storeData: v })}
          />
        </div>
        <p className="text-xs italic text-desc">✦ The saved data will only be available in this browser.</p>
        <p className="text-xs italic text-red">
          ✦ Turning this setting off will potentially remove all your data on the site.
        </p>
      </div>
      <div className="p-3 space-y-3 rounded-lg bg-primary-darker">
        <div className="flex justify-between">
          <p className="text-white">Cache Data</p>
          <PrimaryButton title="Clear Cache" onClick={() => localStorage.removeItem('enka_cache')} />
        </div>
        <p className="text-xs italic text-desc">
          ✦ It is recommended you clear this every once in a while. Right now, the cache is only used for UID account
          fetch.
        </p>
      </div>
    </div>
  )
})
