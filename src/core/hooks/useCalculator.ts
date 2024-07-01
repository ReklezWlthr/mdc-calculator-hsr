import { useStore } from '@src/data/providers/app_store_provider'
import { addDebuff, checkIsDoT, findCharacter, findLightCone } from '../utils/finder'
import { useEffect, useMemo, useState } from 'react'
import { getTeamOutOfCombat } from '../utils/calculator'
import ConditionalsObject from '@src/data/lib/stats/conditionals/conditionals'
import _ from 'lodash'
import {
  calculateRelic,
  calculateTeamRelic,
  getRelicConditionals,
} from '@src/data/lib/stats/conditionals/artifacts/calculate_artifact'
import {
  LCAllyConditionals,
  LCConditionals,
  LCTeamConditionals,
} from '@src/data/lib/stats/conditionals/lightcones/lc_conditionals'
import {
  BreakDebuffType,
  Element,
  ITalentLevel,
  ITeamChar,
  Stats,
  TalentProperty,
  TalentType,
} from '@src/domain/constant'
import { isFlat } from '@src/presentation/hsr/components/modals/custom_modal'
import { StatsObject, StatsObjectKeysT } from '@src/data/lib/stats/baseConstant'
import { DebuffTypes, IContent } from '@src/domain/conditional'
import { getSetCount } from '../utils/data_format'
import { AllRelicSets } from '@src/data/db/artifacts'
import { ElementColor } from '@src/presentation/hsr/components/tables/super_break_sub_rows'

interface CalculatorOptions {
  enabled?: boolean
  teamOverride?: ITeamChar[]
  formOverride?: Record<string, any>[]
  customOverride?: {
    name: StatsObjectKeysT
    value: number
    debuff: boolean
  }[][]
  doNotSaveStats?: boolean
  indexOverride?: number
  talentOverride?: ITeamChar
  initFormFunction?: (f: Record<string, any>[]) => void
}

export const useCalculator = ({
  enabled = true,
  teamOverride,
  formOverride,
  customOverride,
  indexOverride,
  talentOverride,
  doNotSaveStats,
  initFormFunction,
}: CalculatorOptions) => {
  const { teamStore, artifactStore, calculatorStore, settingStore } = useStore()

  const selected = indexOverride || calculatorStore?.selected
  const [finalStats, setFinalStats] = useState<StatsObject[]>(null)

  const forms = formOverride || calculatorStore.form
  const team = teamOverride || teamStore.characters
  const custom = customOverride || calculatorStore.custom

  const mainComputed = finalStats?.[selected]

  const baseStats = useMemo(() => getTeamOutOfCombat(team, artifactStore.artifacts), [team, artifactStore.artifacts])

  // Conditional objects include talent descriptions, conditional contents and a calculator
  const conditionals = useMemo(
    () =>
      _.map(team, (item) => {
        if (!item) return null
        const data = talentOverride?.cId === item?.cId ? talentOverride : item
        return _.find(ConditionalsObject, ['id', item.cId])?.conditionals(
          data.cons,
          data.major_traces,
          data.talents,
          team
        )
      }),
    [team]
  )
  const main = conditionals[selected]

  const artifactConditionals = useMemo(
    () =>
      _.map(team, (item) => {
        const artifacts = _.map(item?.equipments?.artifacts, (a) => _.find(artifactStore.artifacts, (b) => b.id === a))
        return getRelicConditionals(artifacts)
      }),
    [team, artifactStore.artifacts]
  )
  const checkValid = (item: ITeamChar) =>
    findLightCone(item?.equipments?.weapon?.wId)?.type === findCharacter(item.cId)?.path
  const weaponConditionals = _.map(team, (item, index) =>
    _.map(
      _.filter(LCConditionals, (weapon) => _.includes(weapon.id, item?.equipments?.weapon?.wId) && checkValid(item)),
      (cond) => ({ ...cond, title: '', content: '', index })
    )
  )
  const weaponTeamConditionals = _.map(team, (item, index) =>
    _.map(
      _.filter(
        LCTeamConditionals,
        (weapon) => _.includes(weapon.id, item?.equipments?.weapon?.wId) && checkValid(item)
      ),
      (cond) => ({ ...cond, title: '', content: '', index })
    )
  )
  const weaponAllyConditionals = _.map(team, (item, index) =>
    _.map(
      _.filter(
        LCAllyConditionals,
        (weapon) => _.includes(weapon.id, item?.equipments?.weapon?.wId) && checkValid(item)
      ),
      (cond) => ({ ...cond, id: `${cond.id}_${index}`, title: '', content: '', index: selected, owner: index })
    )
  )
  const weaponAllySelectable = (i: number) => _.flatten(_.filter(weaponAllyConditionals, (_, i2) => i !== i2))
  const weaponEligible = (i: number) => [...weaponConditionals[i], ..._.flatten(weaponTeamConditionals)]
  const weaponSelectable = (i: number) => [...weaponEligible(i), ...weaponAllySelectable(i)]

  const allyContents = (i: number, inverse?: boolean) =>
    _.flatten(
      _.filter(
        _.map(conditionals, (item, index) => _.map(item?.allyContent, (content) => ({ ...content, owner: index }))),
        (_, index) => (inverse ? index === i : index !== i)
      )
    )
  const breakContents: IContent[] = _.map(baseStats, (item) => {
    const color = ElementColor[item.ELEMENT]
    const type = BreakDebuffType[item.ELEMENT]
    return checkIsDoT(item.ELEMENT)
      ? {
          type: 'toggle',
          id: `break_${item.NAME}`,
          title: `${item.NAME}'s Break ${type}`,
          text: `${item.NAME}'s Break ${type}`,
          trace: 'Weakness Break',
          content: `Using <b class="${color}">${item.ELEMENT}</b> attacks to trigger Weakness Break will deal <b class="${color}">${item.ELEMENT} DMG</b> and apply the <b class="${color}">${type}</b> Effect, dealing <b class="${color}">${item.ELEMENT} DoT</b>.`,
          show: true,
          default: false,
          debuff: true,
          chance: { base: 1.5, fixed: false },
          duration: 2,
        }
      : null
  })

  useEffect(() => {
    if (enabled) {
      const f = _.map(conditionals, (item, index) =>
        _.reduce(
          _.concat(
            item?.content,
            item?.teammateContent,
            allyContents(index),
            artifactConditionals[index]?.content,
            artifactConditionals[index]?.teamContent,
            ...weaponSelectable(index),
            breakContents[index]
          ),
          (acc, curr: IContent & { owner?: number }) => {
            if (curr?.show) {
              let value = curr.default
              if (settingStore.settings.formMode === 'max') {
                if (curr.type === 'toggle' && !_.isNumber(curr.owner)) value = true
                if (curr.type === 'number') value = curr.max
                if (curr.type === 'element') value = curr.max || curr.default
              }
              if (settingStore.settings.formMode === 'min') {
                if (curr.type === 'toggle') value = false
                if (curr.type === 'number') value = curr.min
                if (curr.type === 'element') value = curr.min || curr.default
              }
              acc[curr.id] = value
            }
            return acc
          },
          {}
        )
      )
      if (initFormFunction) initFormFunction(f)
      else calculatorStore.initForm(f)
    }
  }, [team, conditionals, settingStore.settings.formMode, enabled])

  // =================
  //
  // Main Calculator
  //
  // =================

  // Calculate normal stats first, then ones from allies, then ones from relics
  // Those above does not rely on character's own stat so they are placed first
  // Some Light Cone buffs scale off character's stat so we have to calculate ones above first
  // Reactions are placed last because they only provide damage buff, not stat buffs, and heavily relies on stats
  useEffect(() => {
    if (!_.some(forms)) return
    if (enabled) {
      const weakness = _.cloneDeep(calculatorStore.weakness)
      const debuffs = _.map(DebuffTypes, (v) => ({ type: v, count: 0 }))
      const preCompute = _.map(conditionals, (base, index) => {
        let x =
          base?.preCompute(baseStats[index], forms[index], debuffs, weakness, calculatorStore.broken) ||
          baseStats[index]
        if (forms[index][`break_${x.NAME}`]) {
          x.DOT_SCALING.push({
            name: `Break ${BreakDebuffType[x.ELEMENT]} DMG`,
            value: [],
            element: x.ELEMENT,
            property: TalentProperty.BREAK_DOT,
            type: TalentType.NONE,
            overrideIndex: index,
            dotType: BreakDebuffType[x.ELEMENT],
          })
          addDebuff(debuffs, BreakDebuffType[x.ELEMENT])
        }
        return x
      }) // Compute all self conditionals, return stats of each char
      const preComputeShared = _.map(preCompute, (base, index) => {
        // Compute all shared conditionals, call function for every char except the owner
        let x = base
        _.forEach(conditionals, (item, i) => {
          // Loop characters, exclude index of the current parent iteration
          if (i !== index)
            x =
              item?.preComputeShared(
                preCompute[i],
                x,
                {
                  ...forms[i],
                  path: findCharacter(team[index]?.cId)?.path,
                  element: findCharacter(team[index]?.cId)?.element,
                },
                forms[index],
                debuffs,
                weakness,
                calculatorStore.broken
              ) || x
        })
        return x
      })
      const postCustom = _.map(preComputeShared, (base, index) => {
        let x = base
        _.forEach(custom[index], (v) => {
          x[v.name as any].push({
            name: 'Custom',
            source: 'Manual',
            value: v.value / (isFlat(v.name) ? 1 : 100),
          })
        })
        return x
      })
      // Always loop; artifact buffs are either self or team-wide so everything is in each character's own form
      const postArtifact = _.map(postCustom, (base, index) => {
        let x = base
        _.forEach(forms, (form, i) => {
          x = i === index ? calculateRelic(x, form) : calculateTeamRelic(x, form, postCustom[i])
        })
        return x
      })
      const postWeapon = _.map(postArtifact, (base, index) => {
        let x = base
        // Apply self self buff then loop for team-wide buff that is in each character's own form
        _.forEach(forms, (form, i) => {
          _.forEach(
            _.filter(
              i === index ? [...weaponConditionals[i], ...weaponTeamConditionals[i]] : weaponTeamConditionals[i],
              (c) => _.includes(_.keys(form), c.id)
            ),
            (c) => {
              x = c.scaling(x, form, team[i]?.equipments?.weapon?.refinement, {
                team: team,
                element: findCharacter(team[i]?.cId)?.element,
                own: postArtifact[i],
                owner: i,
                totalEnergy: _.sumBy(postArtifact, (pa) => pa.MAX_ENERGY),
                index: i,
                debuffs,
              })
            }
          )
        })
        // Targeted buffs are in each team member form aside from the giver so no need to loop
        _.forEach(
          _.filter(weaponAllySelectable(index), (c) => _.includes(_.keys(forms[index]), c.id)),
          (c) => {
            x = c.scaling(x, forms[index], team[c.owner]?.equipments?.weapon?.refinement, {
              team: team,
              element: findCharacter(team[c.owner]?.cId)?.element,
              own: postArtifact[c.owner],
              totalEnergy: _.sumBy(postArtifact, (pa) => pa.MAX_ENERGY),
              index,
              owner: c.owner,
              debuffs,
            })
          }
        )
        return x
      })
      const postCompute = _.map(
        conditionals,
        (base, index) =>
          base?.postCompute(
            postWeapon[index],
            forms[index],
            postWeapon,
            forms,
            debuffs,
            weakness,
            calculatorStore.broken
          ) || postWeapon[index]
      )
      const postArtifactCallback = _.map(postCompute, (base, index) => {
        let x = base
        const set = getSetCount(
          _.map(team[index]?.equipments?.artifacts, (item) => _.find(artifactStore.artifacts, (a) => a.id === item))
        )
        _.forEach(set, (value, key) => {
          if (value >= 2) {
            const half = _.find(AllRelicSets, ['id', key])?.half
            if (half) x = half(x)
          }
          if (value >= 4) {
            const add = _.find(AllRelicSets, ['id', key])?.add
            if (add) x = add(x)
          }
        })
        return x
      })
      // Cleanup callbacks for buffs that should be applied last
      const final = _.map(postArtifactCallback, (base, index) => {
        let x = base
        _.forEach(base.CALLBACK, (cb) => {
          x = cb(x, debuffs, weakness, postCompute, true)
        })
        return x
      })
      if (!doNotSaveStats) {
        calculatorStore.setValue('computedStats', final)
        calculatorStore.setValue('debuffs', debuffs)
      }
      setFinalStats(final)
    }
  }, [baseStats, forms, custom, team, calculatorStore.weakness, calculatorStore.broken, calculatorStore.toughness])

  // =================
  //
  // Mapped Contents
  //
  // =================

  // Mapped conditional contents that the selected character can toggle (Self + all team buffs from allies)
  // Soon might have to implement single target buff
  const customMapped = (selected: number) =>
    _.flatMap(
      _.map(conditionals, (item, index) =>
        index === selected
          ? _.concat(item?.content, artifactConditionals[index]?.content, breakContents[index])
          : _.concat(item?.teammateContent, artifactConditionals[index]?.teamContent, breakContents[index])
      ),
      (item, index) => _.map(item, (inner) => ({ ...inner, index }))
    )
  const mapped = customMapped(selected)
  const allyMapped = _.map(allyContents(selected), (item, index) => ({ ...item, index: selected }))
  // Index is embedded into each conditional for the block to call back to
  // Because each of the form with represent ALL the buffs that each character has (including team buffs); not the value that we can change in their page
  // This helps separate buffs trigger of each character and prevent buff stacking
  // Update: This is with the exception of single target buffs that will be put in allies' form instead of the giver so that the buff will not activate all at once
  const mainContent = _.filter(mapped, ['index', selected])
  const teamContent = [..._.filter(mapped, (item) => selected !== item.index), ...allyMapped]

  return {
    main,
    mainComputed,
    finalStats,
    contents: {
      main: mainContent,
      team: teamContent,
      weapon: weaponSelectable,
      customMain: (selected: number) => _.filter(customMapped(selected), ['index', selected]),
      customTeam: (selected: number) => [
        ..._.filter(customMapped(selected), (item) => selected !== item.index),
        ..._.map(allyContents(selected), (item) => ({ ...item, index: selected })),
      ],
    },
  }
}
