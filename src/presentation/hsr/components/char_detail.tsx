import { formatIdIcon, formatScaleString } from '@src/core/utils/data_format'
import { findCharacter } from '@src/core/utils/finder'
import { useStore } from '@src/data/providers/app_store_provider'
import { observer } from 'mobx-react-lite'
import { getElementImage, getPathImage } from '../../../core/utils/fetcher'
import { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import { RarityGauge } from '@src/presentation/components/rarity_gauge'
import _ from 'lodash'
import ConditionalsObject from '@src/data/lib/stats/conditionals/conditionals'
import { TalentIcon } from './tables/scaling_wrapper'
import { TalentType } from '@src/domain/constant'
import { useParams } from '@src/core/hooks/useParams'

export const CharDetail = observer(() => {
  const { charStore, settingStore, teamStore } = useStore()
  const selected = charStore.selected
  const data = findCharacter(selected)
  const charUpgrade = _.find(charStore.characters, ['cId', selected])
  const cond = _.find(ConditionalsObject, ['id', charStore.selected])?.conditionals(
    charUpgrade?.cons || 0,
    charUpgrade?.major_traces || { a2: false, a4: false, a6: false },
    charUpgrade?.talents || { basic: 1, skill: 1, ult: 1, talent: 1 },
    teamStore.characters
  )
  const talent = cond.talents

  const [loading, setLoading] = useState(true)

  const { params, setParams } = useParams({
    [TalentType.BA]: 6,
    [TalentType.SKILL]: 10,
    [TalentType.ULT]: 10,
    [TalentType.TALENT]: 10,
  })

  useEffect(() => {
    setLoading(true)
    const elms = document.getElementsByClassName('cons')
    _.forEach(elms, (elm: HTMLImageElement) => (elm.style.display = 'none'))
  }, [charStore.selected])

  const onCalcSlider = useCallback(() => {
    const range = document.getElementsByClassName('slider')
    if (range) {
      _.forEach(range, (elm: HTMLInputElement) => {
        const bg = getComputedStyle(elm).getPropertyValue('--tw-gradient-to')
        const slider = getComputedStyle(elm).getPropertyValue('--tw-gradient-from')
        const max = Number(elm.max)
        const value = (Number(elm.value) / max) * 100
        elm.setAttribute('style', `background:linear-gradient(to right,${slider},${slider} ${value}%,${bg} ${value}%)`)
      })
    }
  }, [])

  useEffect(() => {
    onCalcSlider()
  }, [params, talent])

  const skillIcon = {
    [TalentType.BA]: 'Normal',
    'Enhanced Basic ATK': 'Normal02',
    'Enhanced Basic ATK [1]': 'Normal02',
    'Enhanced Basic ATK [2]': 'Normal03',
    'Enhanced Basic ATK [3]': 'Normal04',
    [TalentType.SKILL]: 'BP',
    'Enhanced Skill': 'BP02',
    [TalentType.ULT]: 'Ultra',
    'Enhanced Ultimate': 'Ultra02',
    [TalentType.TALENT]: 'Passive',
    [TalentType.TECH]: 'Maze',
    'Ascension 2 Passive': 'SkillTree1',
    'Ascension 4 Passive': 'SkillTree2',
    'Ascension 6 Passive': 'SkillTree3',
  }

  const consImage = {
    B: 'Normal',
    S: 'BP',
    U: 'Ultra',
    T: 'Passive',
  }

  const id = formatIdIcon(selected, settingStore.settings?.travelerGender)

  return (
    <div className="w-full h-full p-2 pr-5 text-white customScrollbar">
      <div className="relative w-2/3 aspect-square">
        <div
          className={classNames(
            'items-center justify-center w-full h-full aspect-square shrink-0',
            loading ? 'flex' : 'hidden'
          )}
        >
          <i className="text-6xl animate-spin fa-solid fa-circle-notch text-gray" />
        </div>
        <img
          src={`https://api.hakush.in/hsr/UI/avatardrawcard/${id}.webp`}
          className={loading ? 'hidden' : 'block'}
          onLoad={() => setLoading(false)}
        />
        <div className="absolute left-0 flex flex-col space-y-1 bottom-10">
          <div className="flex gap-4">
            <img
              src={getElementImage(data.element)}
              className="w-10 h-10 p-1 bg-opacity-75 rounded-full shrink-0 bg-primary-bg"
            />
            <img
              src={getPathImage(data.path)}
              className="w-10 h-10 p-1 bg-opacity-75 rounded-full shrink-0 bg-primary-bg"
            />
          </div>
          <p className="px-3 py-2 text-3xl font-semibold break-words bg-opacity-75 rounded-lg text-end bg-primary-bg">
            {data.name}
          </p>
          <div className="ml-3 w-fit">
            <RarityGauge rarity={data.rarity} textSize="text-xl" />
          </div>
        </div>
      </div>
      <p className="flex justify-center gap-2 mb-1 text-2xl font-bold">
        <span className="text-desc">✦</span> Abilities <span className="text-desc">✦</span>
      </p>
      <div className="grid gap-6">
        {_.map(
          [
            talent.normal,
            talent.normal_alt || null,
            talent.normal_alt1 || null,
            talent.normal_alt2 || null,
            talent.normal_alt3 || null,
            talent.skill,
            talent.skill_alt || null,
            talent.ult,
            talent.ult_alt || null,
            talent.talent,
            talent.technique,
          ],
          (item) => {
            const baseType = item?.trace
              ?.replaceAll('Enhanced', '')
              .replaceAll(/\[\d\]$/g, '')
              .trim()
            return (
              item && (
                <div className="flex gap-x-3" key={item.trace}>
                  <TalentIcon
                    element={data.element}
                    talent={item}
                    icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${selected}_${
                      skillIcon[item.trace === 'Enhanced Skill' && selected === '1109' ? TalentType.SKILL : item.trace]
                    }.png`}
                    size="w-10 h-10 mt-1"
                    hideTip
                  />
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-normal text-primary-lighter">{item.trace}</p>
                        <p className="font-semibold">{item.title}</p>
                        {!!item.energy && (
                          <p className="text-xs font-normal opacity-80 text-gray">
                            Energy Regen: <span className="text-desc">{item.energy}</span>
                          </p>
                        )}
                      </div>
                      {item.trace !== TalentType.TECH && (
                        <div className="flex items-center justify-end w-1/3 gap-2 pr-4">
                          <p className="text-xs">
                            Level: <span className="text-desc">{params[baseType]}</span>
                          </p>
                          <input
                            type="range"
                            className="slider h-[8px] bg-gradient-to-r from-primary-lighter to-gray shrink-0"
                            step={1}
                            min="1"
                            max={_.includes(item.trace, TalentType.BA) ? 7 : 12}
                            value={params[baseType]}
                            onChange={(e) => {
                              const value = Number(e.target.value)
                              setParams({ [baseType]: value })
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <p
                      className="pt-1.5 text-sm font-normal text-gray"
                      dangerouslySetInnerHTML={{ __html: formatScaleString(item, params[baseType]) }}
                    />
                  </div>
                </div>
              )
            )
          }
        )}
        <p className="flex justify-center gap-2 mb-1 text-2xl font-bold">
          <span className="text-desc">✦</span> Bonus Abilities <span className="text-desc">✦</span>
        </p>
        <div className="grid grid-cols-3 gap-5">
          {_.map([talent.a2, talent.a4, talent.a6], (item) => (
            <div className="flex gap-x-3" key={item.trace}>
              <TalentIcon
                element={data.element}
                talent={item}
                icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${selected}_${
                  skillIcon[item.trace]
                }.png`}
                size="w-10 h-10"
                hideTip
              />
              <div>
                <p className="text-sm font-normal text-primary-lighter">{item.trace}</p>
                <p className="font-semibold">{item.title}</p>
                <p
                  className="pt-1.5 text-sm font-normal text-gray"
                  dangerouslySetInnerHTML={{ __html: formatScaleString(item, 1) }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="flex justify-center gap-2 mb-1 text-2xl font-bold">
          <span className="text-desc">✦</span> Eidolons <span className="text-desc">✦</span>
        </p>
        <div className="space-y-5">
          {_.map([talent.c1, talent.c2, talent.c3, talent.c4, talent.c5, talent.c6], (item, i) => (
            <div className="flex gap-x-3" key={item.trace}>
              <div className="w-28 h-28 shrink-0">
                <img
                  src={`https://api.hakush.in/hsr/UI/rank/_dependencies/textures/${id}/${id}_Rank_${i + 1}.webp`}
                  className="object-contain w-full cons"
                  onLoad={(e) => (e.currentTarget.style.display = 'block')}
                />
              </div>
              <div>
                <div className="flex gap-3">
                  <TalentIcon
                    element={data.element}
                    talent={item}
                    icon={`https://enka.network/ui/hsr/SpriteOutput/SkillIcons/SkillIcon_${selected}_${
                      i === 2 || i === 4 ? consImage[_.head(item?.content)] : `Rank${i + 1}`
                    }.png`}
                    size="w-10 h-10"
                    hideTip
                  />
                  <div>
                    <p className="text-sm font-normal text-primary-lighter">{item.trace}</p>
                    <p className="font-semibold">{item.title}</p>
                  </div>
                </div>
                <p
                  className="pt-1.5 text-sm font-normal text-gray"
                  dangerouslySetInnerHTML={{ __html: formatScaleString(item, 1) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
