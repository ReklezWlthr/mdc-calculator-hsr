import { useStore } from '@src/data/providers/app_store_provider'
import { findCharacter } from '../utils/finder'
import { useEffect, useMemo } from 'react'
import { getTeamOutOfCombat } from '../utils/calculator'
import ConditionalsObject from '@src/data/lib/stats/conditionals/conditionals'
import _ from 'lodash'
import {
  calculateArtifact,
  calculateTeamArtifact,
  getArtifactConditionals,
} from '@src/data/lib/stats/conditionals/artifacts/calculate_artifact'
import {
  WeaponAllyConditionals,
  WeaponConditionals,
  WeaponTeamConditionals,
} from '@src/data/lib/stats/conditionals/weapons/weapon_conditionals'
import { Element, Stats } from '@src/domain/constant'
import { getSetCount } from '../utils/data_format'
import { ResonanceConditionals } from '@src/data/lib/stats/conditionals/resonance'
import { isFlat } from '@src/presentation/hsr/components/custom_modal'
import { StatsObject } from '@src/data/lib/stats/baseConstant'
import { DebuffTypes } from '@src/domain/conditional'

export const useCalculator = () => {
  const { teamStore, artifactStore, calculatorStore } = useStore()
  const { selected, computedStats } = calculatorStore

  const char = teamStore.characters[selected]
  const charData = findCharacter(char.cId)

  const mainComputed = computedStats?.[selected]

  const baseStats = useMemo(
    () => getTeamOutOfCombat(teamStore.characters, artifactStore.artifacts),
    [teamStore.characters, artifactStore.artifacts]
  )

  // Conditional objects include talent descriptions, conditional contents and a calculator
  const conditionals = useMemo(
    () =>
      _.map(teamStore.characters, (item) =>
        _.find(ConditionalsObject, ['id', item.cId])?.conditionals(
          item.cons,
          item.major_traces,
          {
            ...item.talents,
            basic: item.talents.basic + (_.includes(_.map(teamStore.characters, 'cId'), '10000033') ? 1 : 0),
          },
          teamStore.characters
        )
      ),
    [teamStore.characters]
  )
  const main = conditionals[selected]

  const artifactConditionals = useMemo(
    () =>
      _.map(teamStore.characters, (item) => {
        const artifacts = _.map(item.equipments.artifacts, (a) => _.find(artifactStore.artifacts, (b) => b.id === a))
        return getArtifactConditionals(artifacts)
      }),
    [teamStore.characters, artifactStore.artifacts]
  )
  const weaponConditionals = _.map(teamStore.characters, (item, index) =>
    _.map(
      _.filter(WeaponConditionals, (weapon) => _.includes(weapon.id, item?.equipments?.weapon?.wId)),
      (cond) => ({ ...cond, title: '', content: '', index })
    )
  )
  const weaponTeamConditionals = _.map(teamStore.characters, (item, index) =>
    _.map(
      _.filter(WeaponTeamConditionals, (weapon) => _.includes(weapon.id, item?.equipments?.weapon?.wId)),
      (cond) => ({ ...cond, title: '', content: '', index })
    )
  )
  const weaponAllyConditionals = _.map(teamStore.characters, (item, index) =>
    _.map(
      _.filter(WeaponAllyConditionals, (weapon) => _.includes(weapon.id, item?.equipments?.weapon?.wId)),
      (cond) => ({ ...cond, id: `${cond.id}_${index}`, title: '', content: '', index: selected, owner: index })
    )
  )
  const weaponAllySelectable = (i: number) => _.flatten(_.filter(weaponAllyConditionals, (_, i2) => i !== i2))
  const weaponEligible = (i: number) => [...weaponConditionals[i], ..._.flatten(weaponTeamConditionals)]
  const weaponSelectable = (i: number) => [...weaponEligible(i), ...weaponAllySelectable(i)]

  const allyContents = (i: number, inverse?: boolean) =>
    _.flatten(
      _.filter(
        _.map(conditionals, (item) => _.map(item?.allyContent, (content) => ({ ...content }))),
        (_, index) => (inverse ? index === i : index !== i)
      )
    )

  useEffect(() => {
    calculatorStore.initForm(
      _.map(conditionals, (item, index) =>
        _.reduce(
          _.concat(
            item?.content,
            item?.teammateContent,
            allyContents(index),
            artifactConditionals[index]?.content,
            artifactConditionals[index]?.teamContent,
            ...weaponSelectable(index)
          ),
          (acc, curr) => {
            if (curr?.show) acc[curr.id] = curr.default
            return acc
          },
          {}
        )
      )
    )
  }, [teamStore.characters])

  // =================
  //
  // Main Calculator
  //
  // =================

  // Calculate normal stats first, then ones from allies, then ones from artifacts
  // Those above does not rely on character's own stat (except EoSF) so they are placed first
  // Some weapon buffs scale off character's stat so we have to calculate ones above first
  // Reactions are placed last because they only provide damage buff, not stat buffs, and heavily relies on stats
  useEffect(() => {
    const debuffs = _.map(DebuffTypes, (v) => ({ type: v, count: 0 }))
    const preCompute = _.map(
      conditionals,
      (base, index) => base?.preCompute(baseStats[index], calculatorStore.form[index], debuffs, []) || baseStats[index]
    ) // Compute all self conditionals, return stats of each char
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
                ...calculatorStore.form[i],
                path: findCharacter(teamStore.characters[index]?.cId)?.path,
                element: findCharacter(teamStore.characters[index]?.cId)?.element,
              },
              calculatorStore.form[index],
              debuffs,
              []
            ) || x
      })
      return x
    })
    const postCustom = _.map(preComputeShared, (base, index) => {
      let x = base
      _.forEach(calculatorStore.custom[index], (v) => {
        x[v.name as any] += v.value / (isFlat(v.name) ? 1 : 100)
      })
      return x
    })
    const emblem = [false, false, false, false]
    // Always loop; artifact buffs are either self or team-wide so everything is in each character's own form
    const postArtifact = _.map(postCustom, (base, index) => {
      let x = base
      const artifactData = _.map(teamStore.characters[index].equipments.artifacts, (item) =>
        _.find(artifactStore.artifacts, ['id', item])
      )
      const setBonus = getSetCount(artifactData)
      if (setBonus['2276480763'] >= 4) emblem[index] = true
      _.forEach(calculatorStore.form, (form, i) => {
        x = i === index ? calculateArtifact(x, form, teamStore.characters, index) : calculateTeamArtifact(x, form)
      })
      return x
    })
    const postWeapon = _.map(postArtifact, (base, index) => {
      let x = base
      // Apply self self buff then loop for team-wide buff that is in each character's own form
      _.forEach(calculatorStore.form, (form, i) => {
        _.forEach(
          _.filter(i === index ? weaponConditionals[i] : weaponTeamConditionals[i], (c) =>
            _.includes(_.keys(form), c.id)
          ),
          (c) => {
            x = c.scaling(x, form, teamStore.characters[i]?.equipments?.weapon?.refinement, {
              team: teamStore.characters,
              element: findCharacter(teamStore.characters[i]?.cId)?.element,
              own: postArtifact[i],
              totalEnergy: _.sumBy(postArtifact, (pa) => pa.MAX_ENERGY),
              index: i,
            })
          }
        )
      })
      // Targeted buffs are in each team member form aside from the giver so no need to loop
      _.forEach(
        _.filter(weaponAllySelectable(index), (c) => _.includes(_.keys(calculatorStore.form[index]), c.id)),
        (c) => {
          x = c.scaling(x, calculatorStore.form[index], teamStore.characters[c.owner]?.equipments?.weapon?.refinement, {
            team: teamStore.characters,
            element: findCharacter(teamStore.characters[c.owner]?.cId)?.element,
            own: postArtifact[c.owner],
            totalEnergy: _.sumBy(postArtifact, (pa) => pa.MAX_ENERGY),
            index,
            owner: c.owner,
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
          calculatorStore.form[index],
          postWeapon,
          calculatorStore.form,
          debuffs,
          []
        ) || postWeapon[index]
    )
    // Cleanup callbacks for buffs that should be applied last
    const final = _.map(postCompute, (base, index) => {
      let x = base
      _.forEach(base.CALLBACK, (cb) => {
        x = cb(x, debuffs, [], postCompute)
      })
      return x
    })
    calculatorStore.setValue('computedStats', final)
  }, [baseStats, calculatorStore.form, calculatorStore.custom, teamStore.characters])

  // =================
  //
  // Mapped Contents
  //
  // =================

  // Mapped conditional contents that the selected character can toggle (Self + all team buffs from allies)
  // Soon might have to implement single target buff
  const mapped = _.flatMap(
    _.map(conditionals, (item, index) =>
      index === selected
        ? _.concat(item?.content, artifactConditionals[index]?.content)
        : _.concat(item?.teammateContent, artifactConditionals[index]?.teamContent)
    ),
    (item, index) => _.map(item, (inner) => ({ ...inner, index }))
  )
  const allyMapped = _.map(allyContents(selected), (item) => ({ ...item, index: selected }))
  // Index is embedded into each conditional for the block to call back to
  // Because each of the form with represent ALL the buffs that each character has (including team buffs); not the value that we can change in their page
  // This helps separate buffs trigger of each character and prevent buff stacking
  // Update: This is with the exception of single target buffs that will be put in allies' form instead of the giver so that the buff will not activate all at once
  const mainContent = _.filter(mapped, ['index', selected])
  const teamContent = [..._.filter(mapped, (item, index) => selected !== item.index), ...allyMapped]

  // Content of transformative reaction dmg
  const nilou = _.some(calculatorStore.form, (item) => item?.bountiful_core)

  return {
    main,
    mainComputed,
    contents: { main: mainContent, team: teamContent, weapon: weaponSelectable },
  }
}
