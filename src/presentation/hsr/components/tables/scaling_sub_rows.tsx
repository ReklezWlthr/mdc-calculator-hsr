import { IScaling } from '@src/domain/conditional'
import { Element, StatIcons, Stats, TalentProperty, PathType, TalentType } from '@src/domain/constant'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Tooltip } from '@src/presentation/components/tooltip'
import { toPercentage } from '@src/core/utils/converter'
import { StatsObject, StatsObjectKeys, TalentPropertyMap } from '@src/data/lib/stats/baseConstant'
import { TalentTypeMap } from '../../../../data/lib/stats/baseConstant'
import { useStore } from '@src/data/providers/app_store_provider'
import { findCharacter } from '@src/core/utils/finder'
import { BreakBaseLevel, BreakElementMult } from '@src/domain/scaling'

interface ScalingSubRowsProps {
  scaling: IScaling
}

const propertyColor = {
  [TalentProperty.HEAL]: 'text-heal',
  [TalentProperty.SHIELD]: 'text-indigo-300',
}

export const BaseElementColor = {
  [Element.PHYSICAL]: 'text-hsr-physical',
  [Element.FIRE]: 'text-hsr-fire',
  [Element.ICE]: 'text-hsr-ice',
  [Element.LIGHTNING]: 'text-hsr-lightning',
  [Element.WIND]: 'text-hsr-wind',
  [Element.QUANTUM]: 'text-hsr-quantum',
  [Element.IMAGINARY]: 'text-hsr-imaginary',
}

export const ElementColor = {
  ...BaseElementColor,
  ...propertyColor,
}

export const ScalingSubRows = observer(({ scaling }: ScalingSubRowsProps) => {
  const { calculatorStore, teamStore } = useStore()
  const index = scaling.overrideIndex ?? calculatorStore.selected
  const stats = calculatorStore.computedStats[index]
  const names = _.map(teamStore.characters, (item) => findCharacter(item.cId)?.name)

  const element = scaling.element

  const talentDmg = stats.getValue(`${TalentPropertyMap[scaling.property]}_DMG`) || 0
  const typeDmg = stats.getValue(`${TalentTypeMap[scaling.type]}_DMG`) || 0
  const talentFlat = stats.getValue(`${TalentPropertyMap[scaling.property]}_F_DMG`) || 0
  const talentCr = stats.getValue(`${TalentTypeMap[scaling.type]}_CR`) || 0
  const propertyCr = stats.getValue(`${TalentPropertyMap[scaling.property]}_CR`) || 0
  const talentCd = stats.getValue(`${TalentTypeMap[scaling.type]}_CD`) || 0
  const propertyCd = stats.getValue(`${TalentPropertyMap[scaling.property]}_CD`) || 0
  const elementCd = stats.getValue(`${element.toUpperCase()}_CD`) || 0
  const elementFlat = stats.getValue(`${element.toUpperCase()}_F_DMG`) || 0
  const elementMult = stats.getValue(`${element.toUpperCase()}_MULT`) || 1
  const defPen =
    (stats.getValue(StatsObjectKeys.DEF_PEN) || 0) +
    (stats.getValue(`${TalentTypeMap[scaling.type]}_DEF_PEN`) || 0) +
    (stats.getValue(`${TalentPropertyMap[scaling.property]}_DEF_PEN`) || 0)

  const defMult =
    calculatorStore.getDefMult(
      teamStore.characters[index]?.level,
      defPen,
      stats.getValue(StatsObjectKeys.DEF_REDUCTION)
    ) || 1
  const vulMult =
    1 +
    stats.getValue(StatsObjectKeys.VULNERABILITY) +
    (stats.getValue(`${TalentPropertyMap[scaling.property]}_VUL`) || 0) +
    (stats.getValue(`${TalentTypeMap[scaling.type]}_VUL`) || 0) +
    (stats.getValue(`${scaling.element.toUpperCase()}_VUL`) || 0) +
    (scaling.vul || 0)
  const resMult = _.max([
    _.min([
      calculatorStore.getResMult(
        element as Element,
        (stats.getValue(`${element.toUpperCase()}_RES_PEN`) || 0) +
          (stats.getValue(StatsObjectKeys.ALL_TYPE_RES_PEN) || 0) +
          (scaling.res_pen || 0) // Counted as Elemental RES PEN
      ),
      2,
    ]),
    0.1,
  ])
  const brokenMult = calculatorStore.broken ? 1 : 0.9
  const isDamage = !_.includes([TalentProperty.SHIELD, TalentProperty.HEAL], scaling.property)
  const enemyMod = isDamage ? defMult * resMult * vulMult * brokenMult : 1

  const statForScale = {
    [Stats.ATK]: stats.getAtk(),
    [Stats.DEF]: stats.getDef(),
    [Stats.HP]: stats.getHP(),
    [Stats.EHP]: 100000,
  }

  const bonusDMG =
    (scaling.bonus || 0) +
    (TalentProperty.SHIELD === scaling.property
      ? 0
      : TalentProperty.HEAL === scaling.property
      ? stats.getValue(Stats.HEAL) + stats.getValue(`${TalentTypeMap[scaling.type]}_HEAL`)
      : stats.getValue(Stats.ALL_DMG) + stats.getValue(`${element} DMG%`) + talentDmg + typeDmg) // Vulnerability effectively stacks with DMG Bonuses
  const raw =
    _.sumBy(
      scaling.value,
      (item) =>
        item.scaling *
        ((item.override || statForScale[item.multiplier]) +
          (item.multiplier === Stats.HP ? stats.getValue(StatsObjectKeys.X_HP) : 0))
    ) +
    (scaling.flat || 0) +
    elementFlat +
    talentFlat
  const breakElementMult = BreakElementMult[scaling.element]
  const breakLevel = BreakBaseLevel[teamStore.characters[index]?.level - 1]
  const toughnessMult = 0.5 * (_.min([420, scaling.toughCap || 420]) / 120)
  const breakRaw = breakElementMult * breakLevel * toughnessMult
  const cap = scaling.cap
    ? scaling.cap?.scaling *
      (statForScale[scaling.cap?.multiplier] +
        (scaling.cap?.multiplier === Stats.HP ? stats.getValue(StatsObjectKeys.X_HP) : 0))
    : 0
  const capped = scaling.cap ? cap < raw : false
  const dmg =
    (capped ? cap : scaling.property === TalentProperty.BREAK ? breakRaw : raw) *
    (1 + (scaling.property === TalentProperty.BREAK ? stats.getValue(Stats.BE) : bonusDMG)) *
    (scaling.multiplier || 1) *
    elementMult *
    enemyMod

  const totalCr = _.max([_.min([stats.getValue(Stats.CRIT_RATE) + (scaling.cr || 0) + talentCr + propertyCr, 1]), 0])
  const totalCd =
    stats.getValue(Stats.CRIT_DMG) +
    stats.getValue(StatsObjectKeys.X_CRIT_DMG) +
    (scaling.cd || 0) +
    talentCd +
    elementCd +
    propertyCd
  const totalFlat = (scaling.flat || 0) + elementFlat + talentFlat

  // String Construct
  const scalingArray = _.map(
    capped ? [scaling.cap] : scaling.value,
    (item) =>
      `<span class="inline-flex items-center h-4">(<b class="inline-flex items-center h-4"><img class="h-3 mx-1" src="https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/${
        StatIcons[item.multiplier]
      }" />${_.round(
        (item.override || statForScale[item.multiplier]) +
          (item.multiplier === Stats.HP ? stats.getValue(StatsObjectKeys.X_HP) : 0)
      ).toLocaleString()}</b>${
        item.multiplier === Stats.EHP ? `<i class="text-[10px] ml-1">Enemy HP</i>` : ''
      }<span class="mx-1"> \u{00d7} </span><b>${toPercentage(item.scaling, 2)}</b>)</span>`
  )
  const baseScaling = _.join(scalingArray, ' + ')
  const baseBreakScaling = `(<b class="${
    ElementColor[scaling.element]
  }">${breakElementMult}</b> <i class="text-[10px]">ELEMENT</i> \u{00d7} <b>${_.round(
    breakLevel
  ).toLocaleString()}</b> <i class="text-[10px]">BASE</i> \u{00d7} <b>${toughnessMult}</b> <i class="text-[10px]">TOUGHNESS</i>)`
  const shouldWrap = (!!totalFlat || scaling.value.length > 1) && !!_.size(scaling.value)
  const baseWithFlat = totalFlat
    ? baseScaling
      ? _.join([baseScaling, _.round(totalFlat).toLocaleString()], ' + ')
      : _.round(totalFlat).toLocaleString()
    : baseScaling

  const formulaString = `<b class="${propertyColor[scaling.property] || 'text-red'}">${_.round(
    dmg
  ).toLocaleString()}</b> = ${
    scaling.property === TalentProperty.BREAK ? baseBreakScaling : shouldWrap ? `(${baseWithFlat})` : baseWithFlat
  }${
    (scaling.property === TalentProperty.BREAK ? stats.getValue(Stats.BE) > 0 : bonusDMG > 0)
      ? ` \u{00d7} (1 + <b class="${ElementColor[scaling.element]}">${toPercentage(
          scaling.property === TalentProperty.BREAK ? stats.getValue(Stats.BE) : bonusDMG
        )}</b>)`
      : ''
  }${scaling.multiplier > 0 ? ` \u{00d7} <b class="text-indigo-300">${toPercentage(scaling.multiplier, 2)}</b>` : ''}${
    elementMult > 1 ? ` \u{00d7} <b class="text-amber-400">${toPercentage(elementMult, 2)}</b>` : ''
  }${
    isDamage
      ? ` \u{00d7} <b class="text-orange-300">${toPercentage(
          defMult,
          2
        )}</b> <i class="text-[10px]">DEF</i> \u{00d7} <b class="text-teal-200">${toPercentage(
          resMult,
          2
        )}</b> <i class="text-[10px]">RES</i> \u{00d7} <b class="text-rose-300">${toPercentage(
          vulMult,
          2
        )}</b> <i class="text-[10px]">VUL</i> \u{00d7} <b class="text-violet-300">${toPercentage(
          brokenMult
        )}</b> <i class="text-[10px]">BROKEN</i>`
      : ''
  }`

  const critString = `<b class="${propertyColor[scaling.property] || 'text-red'}">${_.round(
    dmg * (1 + totalCd)
  ).toLocaleString()}</b> = <b>${_.round(
    dmg
  ).toLocaleString()}</b> \u{00d7} <span class="inline-flex items-center h-4">(1 + <b class="inline-flex items-center h-4"><img class="h-3 mx-1" src="https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/IconCriticalDamage.png" />${toPercentage(
    totalCd
  )}</b>)</span>`

  const avgString = `<b class="${propertyColor[scaling.property] || 'text-red'}">${_.round(
    dmg * (1 + totalCd * totalCr)
  ).toLocaleString()}</b> = <b>${_.round(
    dmg
  ).toLocaleString()}</b> \u{00d7} <span class="inline-flex items-center h-4">(1 + <b class="inline-flex items-center h-4"><img class="h-3 mx-1" src="https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/IconCriticalDamage.png" />${toPercentage(
    totalCd
  )}</b><span class="ml-1"> \u{00d7} </span><b class="inline-flex items-center h-4"><img class="h-3 mx-1" src="https://enka.network/ui/hsr/SpriteOutput/UI/Avatar/Icon/IconCriticalChance.png" />${toPercentage(
    totalCr
  )}</b>)</span>`

  const prob = scaling.chance?.fixed
    ? scaling.chance?.base
    : (scaling.chance?.base || 0) * (1 + stats.getValue(Stats.EHR)) * (1 - 0.3)
  const noCrit = _.includes(
    [
      TalentProperty.HEAL,
      TalentProperty.SHIELD,
      TalentProperty.DOT,
      TalentProperty.BREAK,
      TalentProperty.SUPER_BREAK,
      TalentProperty.FROZEN,
    ],
    scaling.property
  )
  const toughness = scaling.break * (1 + stats.getValue(StatsObjectKeys.BREAK_EFF))

  return (
    <div className="grid items-center grid-cols-9 gap-2 pr-2">
      <p className="col-span-2 text-center">{scaling.property}</p>
      <p className={classNames('col-span-1 text-center', ElementColor[element])}>{element}</p>
      <Tooltip
        title={
          <div className="flex items-center justify-between">
            <p>{scaling.name}</p>
            {!!toughness && (
              <p className="text-xs font-normal">
                Toughness Damage: <span className="text-desc">{_.round(toughness, 1).toLocaleString()}</span>
              </p>
            )}
          </div>
        }
        body={
          <div className="space-y-1">
            <p dangerouslySetInnerHTML={{ __html: formulaString }} />
            {!!scaling.bonus && (
              <p className="text-xs">
                Component Bonus: <span className="text-desc">{toPercentage(scaling.bonus)}</span>
              </p>
            )}
            {!!stats.getValue(`${element} DMG%`) && (
              <p className="text-xs">
                {element} DMG Bonus:{' '}
                <span className="text-desc">{toPercentage(stats.getValue(`${element} DMG%`))}</span>
              </p>
            )}
            {!!talentDmg && (
              <p className="text-xs">
                {scaling.property} Bonus: <span className="text-desc">{toPercentage(talentDmg)}</span>
              </p>
            )}
            {!!typeDmg && (
              <p className="text-xs">
                {scaling.type} Bonus: <span className="text-desc">{toPercentage(typeDmg)}</span>
              </p>
            )}
          </div>
        }
        style="w-[400px]"
      >
        <p className="col-span-1 text-center text-gray">{_.round(dmg)}</p>
      </Tooltip>
      {noCrit ? (
        <p className="col-span-1 text-center text-gray">-</p>
      ) : (
        <Tooltip
          title={'CRIT: ' + scaling.name}
          body={
            <div className="space-y-1">
              <p dangerouslySetInnerHTML={{ __html: critString }} />
              {!!scaling.cd && (
                <p className="text-xs">
                  Component CRIT DMG: <span className="text-desc">{toPercentage(scaling.cd)}</span>
                </p>
              )}
              {!!elementCd && (
                <p className="text-xs">
                  {element} CRIT DMG: <span className="text-desc">{toPercentage(elementCd)}</span>
                </p>
              )}
              {!!talentCd && (
                <p className="text-xs">
                  {scaling.type} CRIT DMG: <span className="text-desc">{toPercentage(talentCd)}</span>
                </p>
              )}
              {!!propertyCd && (
                <p className="text-xs">
                  {scaling.property} CRIT DMG: <span className="text-desc">{toPercentage(propertyCd)}</span>
                </p>
              )}
            </div>
          }
          style="w-[400px]"
        >
          <p className="col-span-1 text-center text-gray">{_.round(dmg * (1 + totalCd))}</p>
        </Tooltip>
      )}
      {noCrit ? (
        <p className={classNames('col-span-1 font-bold text-center', propertyColor[scaling.property] || 'text-red')}>
          {_.round(dmg)}
        </p>
      ) : (
        <Tooltip
          title={'Average: ' + scaling.name}
          body={
            <div className="space-y-1">
              <p dangerouslySetInnerHTML={{ __html: avgString }} />
              {!!scaling.cr && (
                <p className="text-xs">
                  Component CRIT Rate: <span className="text-desc">{toPercentage(scaling.cr)}</span>
                </p>
              )}
              {!!talentCr && (
                <p className="text-xs">
                  {scaling.type} CRIT Rate: <span className="text-desc">{toPercentage(talentCr)}</span>
                </p>
              )}
              {!!propertyCr && (
                <p className="text-xs">
                  {scaling.property} CRIT Rate: <span className="text-desc">{toPercentage(propertyCr)}</span>
                </p>
              )}
            </div>
          }
          style="w-[400px]"
        >
          <p className={classNames('col-span-1 font-bold text-center', propertyColor[scaling.property] || 'text-red')}>
            {_.round(dmg * (1 + totalCd * totalCr))}
          </p>
        </Tooltip>
      )}
      <p
        className={classNames(
          'text-xs text-center truncate',
          prob ? (prob <= 0.6 ? 'text-red' : prob <= 0.8 ? 'text-desc' : 'text-heal') : 'text-gray'
        )}
      >
        {scaling.chance ? toPercentage(prob, 1) : '-'}
      </p>
      <p className="col-span-2 text-xs truncate" title={scaling.name}>
        {scaling.name}
      </p>
    </div>
  )
})
