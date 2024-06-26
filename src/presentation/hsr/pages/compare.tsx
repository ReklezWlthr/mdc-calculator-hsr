import { useStore } from '@src/data/providers/app_store_provider'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { CharacterSelect } from '../components/character_select'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { TeamModal, TeamModalProps } from '@src/presentation/hsr/components/modals/team_modal'
import { CommonModal } from '@src/presentation/components/common_modal'
import { findCharacter } from '@src/core/utils/finder'
import classNames from 'classnames'
import { CompareBlock } from '@src/presentation/hsr/components/compare/compare_block'
import { Tooltip } from '@src/presentation/components/tooltip'
import { BulletPoint } from '@src/presentation/components/collapsible'
import { swapElement } from '@src/core/utils/data_format'

export const ComparePage = observer(() => {
  const { modalStore, setupStore } = useStore()

  const charData = findCharacter(setupStore.mainChar)

  const onOpenSaveModal = useCallback((props: TeamModalProps) => {
    modalStore.openModal(<TeamModal {...props} />)
  }, [])

  const onOpenConfirmModal = useCallback((onConfirm: () => void) => {
    modalStore.openModal(
      <CommonModal
        icon="fa-solid fa-exclamation-circle text-hsr-imaginary"
        title="Comparing Session Exists"
        desc={`Do you want to change the main comparison target?\nConfirming to this will remove any Sub setups you are comparing to.`}
        onConfirm={() => {
          onConfirm()
          setupStore.setValue('comparing', Array(3))
        }}
      />
    )
  }, [])

  const onOpenSwapModal = useCallback((onConfirm: () => void) => {
    modalStore.openModal(
      <CommonModal
        icon="fa-solid fa-question-circle text-hsr-imaginary"
        title="Set As Main"
        desc={`By confirming, this setup will be swapped with the current Main setup, along with any changes made to it. Do you wish to proceed?`}
        onConfirm={onConfirm}
      />
    )
  }, [])

  const onOpenRemoveModal = useCallback((onConfirm: () => void) => {
    modalStore.openModal(
      <CommonModal
        icon="fa-solid fa-question-circle text-hsr-imaginary"
        title="Remove Setup"
        desc={`Do you want to remove this setup? Any changes made will not be saved.`}
        onConfirm={onConfirm}
      />
    )
  }, [])

  return (
    <div className="w-full customScrollbar">
      <div className="grid w-full grid-cols-3 gap-5 p-5 text-white max-w-[1240px] mx-auto items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <p className="flex items-center gap-2 font-bold">
              <i className="text-desc fa-solid fa-star" />
              Main Setup
              <Tooltip
                title="Quick Tips to Setup Comparison"
                body={
                  <div className="font-normal">
                    <p>
                      - You can only compare <span className="text-desc">one</span> character at a time. Selecting a new
                      character to focus on will remove all Sub setups without affecting the Main setup. It is
                      recommended to switch your Main setup to the desired one before switching character.
                    </p>
                    <p>- Sub setups eligible for comparison must contain the selected character.</p>
                    <p>
                      - Any changes made to setups within this page will <span className="text-red">not</span> be
                      reflected on other pages. All changes made will also be lost when closing/refreshing the site.
                    </p>
                    <p>
                      - Difference percentages shown in the tooltip are relative to the value of Main setup. Think of
                      the Main value as <span className="text-desc">100%</span>. Any damage components not present in
                      the Main setup will be marked as <b className="text-desc">NEW</b>.
                    </p>
                    <p>- All setups share the same enemy target setup.</p>
                    <p>
                      - Although the calculator allows multiple ability levels to be compared together, it is
                      recommended to use the same ability level across all setups for the best result, unless you really
                      want to compare them.
                    </p>
                  </div>
                }
                style="w-[450px]"
              >
                <i className="fa-regular fa-question-circle" />
              </Tooltip>
            </p>
            {setupStore.main && !setupStore.mainChar && (
              <p className="text-xs text-red">Click the icon to compare the character.</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-primary-dark h-[64px] w-[244px]">
              {setupStore.main?.char ? (
                _.map(Array(4), (_item, index) => {
                  const main = setupStore.main?.char
                  return (
                    <CharacterSelect
                      key={`char_select_${index}`}
                      onClick={
                        main[index]
                          ? () => {
                              const handler = () => {
                                setupStore.setValue('mainChar', main[index].cId)
                                setupStore.setValue('selected', [0, index])
                              }
                              if (
                                _.some(setupStore.comparing, 'name') &&
                                main[index].cId !== setupStore.mainChar &&
                                setupStore.mainChar
                              )
                                onOpenConfirmModal(handler)
                              else {
                                handler()
                              }
                            }
                          : null
                      }
                      isSelected={main[index]?.cId === setupStore.mainChar}
                      id={main[index]?.cId}
                    />
                  )
                })
              ) : (
                <p className="flex items-center justify-center w-full h-full text-gray">No Main Setup</p>
              )}
            </div>
            <PrimaryButton
              icon={setupStore.main?.char ? 'fa-solid fa-repeat' : 'fa-solid fa-plus'}
              onClick={() =>
                onOpenSaveModal({
                  onSelect: (team) => {
                    const handler = () => {
                      setupStore.setValue('main', team)
                      setupStore.setValue('mainChar', team.char[0].cId)
                      setupStore.setValue('selected', [0, 0])
                    }
                    if (setupStore.mainChar) onOpenConfirmModal(handler)
                    else {
                      handler()
                    }
                  },
                })
              }
            />
            {setupStore.mainChar && (
              <div className="w-full text-xs font-bold text-center">
                <p>Comparing</p>
                <span className="w-full text-desc line-clamp-2">{charData?.name}</span>
                <p>To</p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            {setupStore.mainChar &&
              _.map(setupStore.comparing, (item, tI) => (
                <div className="space-y-1" key={tI}>
                  <div className="flex items-center justify-between">
                    <p className="font-bold">Sub Setup {tI + 1}</p>
                    {!!item && (
                      <div className="flex items-center gap-2 mr-2">
                        <i
                          title="Swap with Main"
                          className="flex items-center justify-center w-6 h-6 text-xs rounded-sm cursor-pointer fa-solid fa-star bg-primary text-desc"
                          onClick={() =>
                            onOpenSwapModal(() => {
                              const main = setupStore.main
                              const toBeSwapped = setupStore.comparing[tI]
                              setupStore.comparing.splice(tI, 1, main)
                              setupStore.setValue('main', toBeSwapped)
                              setupStore.setValue('comparing', setupStore.comparing)
                              setupStore.setValue('forms', swapElement(setupStore.forms, 0, tI + 1))
                              setupStore.setValue('custom', swapElement(setupStore.custom, 0, tI + 1))
                              setupStore.setValue('selected', [0, setupStore.selected[1]])
                            })
                          }
                        />
                        <i
                          title="Remove Setup"
                          className="flex items-center justify-center w-6 h-6 text-xs rounded-sm cursor-pointer fa-solid fa-trash bg-primary text-red"
                          onClick={() =>
                            onOpenRemoveModal(() => {
                              setupStore.comparing.splice(tI, 1, null)
                              setupStore.setValue('comparing', setupStore.comparing)
                              setupStore.setValue('selected', [0, 0])
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                  <div
                    className={classNames(
                      'flex gap-3 px-2 py-2 duration-200 rounded-lg bg-primary-dark h-[64px] w-[244px]',
                      {
                        'cursor-pointer hover:ring-2 hover:ring-primary-light hover:ring-inset': setupStore.mainChar,
                      }
                    )}
                    key={tI}
                    onClick={() => {
                      if (setupStore.mainChar)
                        onOpenSaveModal({
                          onSelect: (team) => {
                            setupStore.comparing.splice(tI, 1, team)
                            setupStore.setValue('comparing', setupStore.comparing)
                          },
                          filterId: setupStore.mainChar,
                        })
                    }}
                  >
                    {setupStore.comparing?.[tI]?.char ? (
                      _.map(Array(4), (_item, index) => {
                        const team = setupStore.comparing?.[tI]?.char
                        return (
                          <CharacterSelect
                            key={`char_select_${index}`}
                            isSelected={team[index].cId === setupStore.mainChar}
                            id={team[index].cId}
                          />
                        )
                      })
                    ) : (
                      <p className="flex items-center justify-center w-full h-full text-gray">Add Setup</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {charData && <CompareBlock />}
    </div>
  )
})
