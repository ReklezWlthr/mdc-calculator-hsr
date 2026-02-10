import {
  findBaseLevel,
  findMaxLevel,
  formatIdIcon,
  formatMinorTrace,
  formatScaleString,
  getBaseStat,
} from '@src/core/utils/data_format'
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
import { PathType, StatIcons, Stats, TalentType } from '@src/domain/constant'
import { useParams } from '@src/core/hooks/useParams'
import { PrimaryButton } from '@src/presentation/components/primary.button'
import { toPercentage } from '@src/core/utils/data_format'
import { CharDetailModal } from '@src/presentation/hsr/components/modals/char_detail_modal'
import OldConditionalsObject, { buffedList } from '@src/data/lib/stats/conditionals/conditionals_base'
import { Tooltip } from '@src/presentation/components/tooltip'
import { ToggleSwitch } from '@src/presentation/components/inputs/toggle'

export const CharDetail = observer(() => {
  const { params, setParams } = useParams({
    asc: 7,
    [TalentType.BA]: 6,
    [TalentType.SKILL]: 10,
    [TalentType.ULT]: 10,
    [TalentType.TALENT]: 10,
    'Memosprite Skill': 6,
    'Memosprite Talent': 6,
    [TalentType.ELATION]: 10,
  })

  const { charStore, settingStore, teamStore, modalStore } = useStore()
  const [buffed, setBuffed] = useState(false)
  const selected = charStore.selected
  const data = findCharacter(selected)
  const charUpgrade = _.find(charStore.characters, ['cId', selected])
  const cond = _.find(buffed || !_.includes(buffedList, data?.id) ? ConditionalsObject : OldConditionalsObject, [
    'id',
    charStore.selected,
  ])?.conditionals(
    charUpgrade?.cons || 0,
    charUpgrade?.major_traces || { a2: false, a4: false, a6: false },
    charUpgrade?.talents || {
      basic: params[TalentType.BA] || 1,
      skill: params[TalentType.SKILL] || 1,
      ult: params[TalentType.ULT] || 1,
      talent: params[TalentType.TALENT] || 1,
      memo_skill: params['Memosprite Skill'] || 1,
      memo_talent: params['Memosprite Talent'] || 1,
      elation: params[TalentType.ELATION] || 1,
    },
    teamStore.characters,
  )
  const talent = cond.talents

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setBuffed(true)
    const elms = document.getElementsByClassName('cons')
    _.forEach(elms, (elm: HTMLImageElement) => (elm.style.display = 'none'))
    document.getElementById('detail_container').scrollTo(0, 0)
  }, [charStore.selected])

  const onCalcSlider = useCallback(() => {
    const range = document.getElementsByClassName('slider')
    if (range) {
      _.forEach(range, (elm: HTMLInputElement) => {
        const bg = getComputedStyle(elm).getPropertyValue('--tw-gradient-to')
        const slider = getComputedStyle(elm).getPropertyValue('--tw-gradient-from')
        const min = Number(elm.min)
        const max = Number(elm.max) - min
        const value = ((Number(elm.value) - min) / max) * 100
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
    'Enhanced Skill [1]': 'BP02',
    'Enhanced Skill [2]': 'BP02',
    [TalentType.ULT]: 'Ultra_on',
    'Enhanced Ultimate': 'Ultra02_on',
    [TalentType.TALENT]: 'Passive',
    [TalentType.TECH]: 'Maze',
    'Ascension 2 Passive': 'SkillTree1',
    'Ascension 4 Passive': 'SkillTree2',
    'Ascension 6 Passive': 'SkillTree3',
    'Memosprite Skill': 'Servant01',
    'Memosprite Skill [1]': 'Servant01',
    'Memosprite Skill [2]': 'Servant02',
    'Enhanced Memo. Skill': 'Servant02',
    'Memosprite Talent': 'ServantPassive',
    'Memosprite Talent [1]': 'ServantPassive',
    'Memosprite Talent [2]': 'ServantPassive',
    'Memosprite Talent [3]': 'ServantPassive',
    'Exclusive Talent': 'Passive',
  }

  const consImage = {
    B: 'Normal',
    S: 'BP',
    U: 'Ultra',
    T: 'Passive',
  }

  const id = formatIdIcon(selected, settingStore.settings?.travelerGender)
  const baseLevel = params.asc === 7 ? 80 : findBaseLevel(params.asc)
  const asc = _.min([params.asc, 6])

  const totalTrace = _.groupBy(charUpgrade?.minor_traces, 'stat')

  const onOpenEditModal = useCallback(
    () => modalStore.openModal(<CharDetailModal char={charUpgrade} cId={selected} />),
    [charUpgrade, charStore.selected],
  )

  return (
    <div className="w-full h-full p-2 pr-5 text-white customScrollbar" id="detail_container">
      <div className="flex">
        <div className="relative w-2/3 aspect-square">
          <div
            className={classNames(
              'items-center justify-center w-full h-full aspect-square shrink-0',
              loading ? 'flex' : 'hidden',
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
            <div className="flex gap-1">
              <img
                src={getElementImage(data.element)}
                className="w-10 h-10 p-1 bg-opacity-75 rounded-full shrink-0 bg-primary-bg"
              />
              <img
                src={getPathImage(data.path)}
                className="w-10 h-10 p-1 bg-opacity-75 rounded-full shrink-0 bg-primary-bg"
              />
            </div>
            <p className="px-3 py-2 text-3xl font-semibold break-words bg-opacity-75 rounded-lg bg-primary-bg">
              {data.name}
              {/* <br />
              <span className="block text-base font-normal -pt-3 text-gray">
                <ruby dangerouslySetInnerHTML={{ __html: data.jp }} />
              </span> */}
            </p>
            <div className="ml-3 w-fit">
              <RarityGauge rarity={data.rarity} textSize="text-xl" />
            </div>
          </div>
        </div>
        <div className="w-1/3 px-3 space-y-3">
          <div>
            <p className="font-bold">Base Stats</p>
            <input
              type="range"
              className="w-full h-2 slider bg-gradient-to-r from-primary-lighter to-gray shrink-0"
              step={1}
              min="0"
              max="7"
              value={params.asc}
              onChange={(e) => {
                const value = Number(e.target.value)
                setParams({ asc: value })
              }}
            />
            <div className="flex justify-between pl-2 text-xs text-gray">
              {_.map(Array(7), (_item, index) => (
                <p key={index}>{findBaseLevel(index)}</p>
              ))}
              <p>80</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 px-5 py-3 text-xs rounded-lg bg-primary-dark">
            <p>Base HP</p>
            <p className="text-center">{_.round(getBaseStat(data?.stat?.baseHp, baseLevel, asc)).toLocaleString()}</p>
            <p>Base ATK</p>
            <p className="text-center">{_.round(getBaseStat(data?.stat?.baseAtk, baseLevel, asc)).toLocaleString()}</p>
            <p>Base DEF</p>
            <p className="text-center">{_.round(getBaseStat(data?.stat?.baseDef, baseLevel, asc)).toLocaleString()}</p>
            <p>Base SPD</p>
            <p className="text-center">{data?.stat?.baseSpd}</p>
            <p>Max Energy</p>
            <p className="text-center">{data?.stat?.energy}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">Account Data</p>
              <p className="text-[10px] font-normal text-gray">Will be used as Default Data</p>
            </div>
            <PrimaryButton title="Edit" onClick={onOpenEditModal} />
          </div>
          <div className="px-5 py-3 rounded-lg bg-primary-darker">
            {charUpgrade ? (
              <div className="text-xs">
                <div className="flex justify-around">
                  <p>
                    Level{' '}
                    <span className="text-desc">
                      {charUpgrade.level}/{findMaxLevel(charUpgrade.ascension)}
                    </span>
                  </p>
                  <p>
                    Eidolon <span className="text-desc">{charUpgrade.cons || 0}</span>
                  </p>
                </div>
                <p className="py-1.5 font-bold text-center">Abilities</p>
                <div className="grid grid-cols-5 gap-4">
                  <div className="col-span-3 space-y-1">
                    <div className="flex justify-between">
                      <p>Basic ATK</p>
                      <p className={cond.upgrade?.basic ? 'text-blue' : 'text-desc'}>
                        {charUpgrade.talents?.basic + cond.upgrade?.basic}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p>Skill</p>
                      <p className={cond.upgrade?.skill ? 'text-blue' : 'text-desc'}>
                        {charUpgrade.talents?.skill + cond.upgrade?.skill}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p>Ultimate</p>
                      <p className={cond.upgrade?.ult ? 'text-blue' : 'text-desc'}>
                        {charUpgrade.talents?.ult + cond.upgrade?.ult}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p>Talent</p>
                      <p className={cond.upgrade?.talent ? 'text-blue' : 'text-desc'}>
                        {charUpgrade.talents?.talent + cond.upgrade?.talent}
                      </p>
                    </div>
                    {data?.path === PathType.REMEMBRANCE && (
                      <>
                        <div className="flex justify-between">
                          <p>Memo. Skill</p>
                          <p className={(cond.upgrade as any)?.memo_skill ? 'text-blue' : 'text-desc'}>
                            {charUpgrade.talents?.memo_skill + (cond.upgrade as any)?.memo_skill}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p>Memo. Talent</p>
                          <p className={(cond.upgrade as any)?.memo_talent ? 'text-blue' : 'text-desc'}>
                            {charUpgrade.talents?.memo_talent + (cond.upgrade as any)?.memo_talent}
                          </p>
                        </div>
                      </>
                    )}
                    {data?.path === PathType.ELATION && (
                      <div className="flex justify-between">
                        <p>Elation Skill</p>
                        <p className={(cond.upgrade as any)?.elation ? 'text-blue' : 'text-desc'}>
                          {charUpgrade.talents?.elation + (cond.upgrade as any)?.elation}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 space-y-1">
                    {_.map(charUpgrade.major_traces, (item, index) => (
                      <div className="flex items-center justify-around" key={index}>
                        <p>{index.toUpperCase()}</p>
                        <i
                          className={classNames(
                            'font-bold fa-solid',
                            item ? 'text-heal fa-check' : 'text-red fa-times',
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <p className="py-1.5 font-bold text-center">Minor Traces</p>
                <div className="space-y-1">
                  {_.map(totalTrace, (item, key) => {
                    const total = _.sumBy(
                      _.filter(item, (v) => v.toggled),
                      'value',
                    )
                    return (
                      <div className="grid grid-cols-5" key={key}>
                        <div className="flex items-center col-span-4 gap-1.5">
                          <img className="w-3" src={`/icons/${StatIcons[key]}`} />
                          <p className="line-clamp-1">{key}</p>
                        </div>
                        <p className="text-end text-gray">{key === Stats.SPD ? total : toPercentage(total)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray">Not Owned</p>
            )}
          </div>
          {_.includes(buffedList, data?.id) && (
            <div className="flex items-center justify-between px-3 py-2 text-white border-2 rounded-lg col-span-full bg-primary-dark border-primary-light">
              <div className="flex items-center gap-1">
                <p className="text-sm font-bold">Enhanced State</p>
                <Tooltip
                  title="Enhanced State"
                  body={
                    <p>
                      Some characters are enhanced: their abilities, Traces, and Eidolon effects may change. You can
                      switch between states here.
                    </p>
                  }
                  style="w-[450px]"
                  position="bottom"
                >
                  <i className="fa-regular fa-question-circle" />
                </Tooltip>
              </div>
              <ToggleSwitch enabled={buffed} onClick={(v) => setBuffed(v)} />
            </div>
          )}
        </div>
      </div>
      <p className="flex justify-center gap-2 mb-1 text-2xl font-bold">
        <span className="text-desc">✦</span> Abilities <span className="text-desc">✦</span>
      </p>
      <div className="grid gap-6">
        {_.map(_.omit(talent, 'a2', 'a4', 'a6', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6'), (item) => {
          const baseType = item?.trace
            ?.replaceAll('Enhanced', '')
            ?.replaceAll('Alternate', '')
            ?.replaceAll('Exclusive', '')
            ?.replaceAll('Memo.', 'Memosprite')
            .replaceAll(/\[\d\]$/g, '')
            .trim()
          return (
            item && (
              <div className="flex gap-x-3" key={item.trace}>
                <TalentIcon
                  element={data.element}
                  talent={item}
                  icon={`SkillIcon_${_.includes(item.trace, 'Memo') ? '1' : ''}${selected}_${
                    skillIcon[item.trace]
                  }.png`}
                  size="w-10 h-10 mt-1"
                  hideTip
                />
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      {_.startsWith(item.trace, 'Exclusive') ? (
                        <p className="px-2 text-sm font-normal text-white rounded-md bg-gradient-to-r from-unique-start to-unique-end w-fit">
                          {item.trace}
                        </p>
                      ) : (
                        <p className="text-sm font-normal text-primary-lighter">{item.trace}</p>
                      )}
                      <p className="font-semibold">{item.title}</p>
                      <div className="flex items-center gap-1 text-xs">
                        {!!item.tag && <p className="text-desc opacity-80">[{item.tag}]</p>}
                        {!!item.energy && (
                          <p className="font-normal text-rose-300 opacity-80">[{item.energy} Energy]</p>
                        )}
                        {!!item.sp && (
                          <div className="flex items-center font-normal opacity-100 text-gray">
                            <img className="size-5" src="asset/PointBPFull.png" />
                            {Intl.NumberFormat('en-US', {
                              signDisplay: 'exceptZero',
                            }).format(item.sp)}
                          </div>
                        )}
                      </div>
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
                          max={_.includes(item.trace, TalentType.BA) || _.includes(item.trace, 'Memo') ? 7 : 12}
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
        })}
        <p className="flex justify-center gap-2 mb-1 text-2xl font-bold">
          <span className="text-desc">✦</span> Bonus Abilities <span className="text-desc">✦</span>
        </p>
        <div className="flex flex-col gap-5">
          {_.map([talent.a2, talent.a4, talent.a6], (item) => (
            <div className="flex gap-x-3" key={item.trace}>
              <TalentIcon
                element={data.element}
                talent={item}
                icon={`SkillIcon_${selected}_${skillIcon[item.trace]}.png`}
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
                    icon={
                      item?.image ||
                      `SkillIcon_${selected}_${
                        i === 2 || i === 4 ? consImage[_.head(item?.content)] : `Rank${i + 1}`
                      }.png`
                    }
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
