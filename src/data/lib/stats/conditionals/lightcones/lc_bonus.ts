import { Element, Stats, TalentProperty, TalentType } from '@src/domain/constant'
import { StatsObject } from '../../baseConstant'
import _ from 'lodash'
import { calcRefinement } from '@src/core/utils/data_format'
import { checkBuffExist, countDebuff, countDot } from '@src/core/utils/finder'
import { DebuffTypes } from '@src/domain/conditional'

const LightConeBonus: { id: string; scaling: (base: StatsObject, refinement: number) => StatsObject }[] = [
  {
    id: '20003',
    scaling: (base, r) => {
      base[Stats.P_DEF].push({
        name: 'Passive',
        source: 'Amber',
        value: calcRefinement(0.16, 0.04, r),
      })
      return base
    },
  },
  {
    id: '20002',
    scaling: (base, r) => {
      base.BASIC_DMG.push({
        name: 'Passive',
        source: 'Collapsing Sky',
        value: calcRefinement(0.2, 0.05, r),
      })
      base.SKILL_DMG.push({
        name: 'Passive',
        source: 'Collapsing Sky',
        value: calcRefinement(0.2, 0.05, r),
      })
      return base
    },
  },
  {
    id: '20001',
    scaling: (base, r) => {
      base.SKILL_HEAL.push({
        name: 'Passive',
        source: 'Cornucopia',
        value: calcRefinement(0.12, 0.03, r),
      })
      base.ULT_HEAL.push({
        name: 'Passive',
        source: 'Cornucopia',
        value: calcRefinement(0.12, 0.03, r),
      })
      return base
    },
  },
  {
    id: '20018',
    scaling: (base, r) => {
      base.BASIC_SCALING.push({
        name: 'Hidden Shadow DMG',
        value: [{ scaling: calcRefinement(0.6, 0.15, r), multiplier: Stats.ATK }],
        element: base.ELEMENT,
        property: TalentProperty.ADD,
        type: TalentType.NONE,
      })
      return base
    },
  },
  {
    id: '20011',
    scaling: (base, r) => {
      base.CALLBACK.push((x, d) => {
        const count = countDebuff(d)
        if (count)
          base[Stats.ALL_DMG].push({
            name: 'Passive',
            source: 'Loop',
            value: calcRefinement(0.24, 0.06, r),
          })
        return x
      })
      return base
    },
  },
  {
    id: '21012',
    scaling: (base, r) => {
      base[Stats.ALL_DMG].push({
        name: 'Passive',
        source: 'A Secret Vow',
        value: calcRefinement(0.2, 0.05, r),
      })
      return base
    },
  },
  {
    id: '21045',
    scaling: (base, r) => {
      base[Stats.BE].push({
        name: 'Passive',
        source: 'After the Charmony Fall',
        value: calcRefinement(0.28, 0.07, r),
      })
      return base
    },
  },
  {
    id: '22000',
    scaling: (base, r) => {
      base[Stats.EHR].push({
        name: 'Passive',
        source: 'Before the Tutorial Mission Starts',
        value: calcRefinement(0.2, 0.05, r),
      })
      return base
    },
  },
  {
    id: '21044',
    scaling: (base, r) => {
      base[Stats.CRIT_RATE].push({
        name: 'Passive',
        source: 'Boundless Choreo',
        value: calcRefinement(0.08, 0.02, r),
      })
      base.CALLBACK.push((x, d) => {
        if (countDebuff(d, DebuffTypes.DEF_RED) || countDebuff(d, DebuffTypes.SPD_RED))
          x[Stats.CRIT_DMG].push({
            name: 'Passive',
            source: 'Boundless Choreo',
            value: calcRefinement(0.08, 0.02, r),
          })
        return x
      })
      return base
    },
  },
  {
    id: '21043',
    scaling: (base, r) => {
      base[Stats.P_DEF].push({
        name: 'Passive',
        source: 'Concert for Two',
        value: calcRefinement(0.16, 0.04, r),
      })
      return base
    },
  },
  {
    id: '21002',
    scaling: (base, r) => {
      base[Stats.P_DEF].push({
        name: 'Passive',
        source: 'Day One of My New Life',
        value: calcRefinement(0.16, 0.02, r),
      })
      if (!checkBuffExist(base.ALL_TYPE_RES, { source: 'Day One of My New Life' }))
        base.ALL_TYPE_RES.push({
          name: 'Passive',
          source: 'Day One of My New Life',
          value: calcRefinement(0.08, 0.01, r),
        })
      return base
    },
  },
  {
    id: '21039',
    scaling: (base, r) => {
      base[Stats.E_RES].push({
        name: 'Passive',
        source: `Destiny's Threads Forewoven`,
        value: calcRefinement(0.12, 0.02, r),
      })
      base.CALLBACK.push((x) => {
        x[Stats.ALL_DMG].push({
          name: 'Passive',
          source: `Destiny's Threads Forewoven`,
          value: _.min([x.getDef() * calcRefinement(0.008, 0.001, r), calcRefinement(0.32, 0.04, r)]),
        })
        return x
      })
      return base
    },
  },
  {
    id: '21008',
    scaling: (base, r) => {
      base[Stats.EHR].push({
        name: 'Passive',
        source: 'Eyes of the Prey',
        value: calcRefinement(0.2, 0.05, r),
      })
      base.DOT_DMG.push({
        name: 'Passive',
        source: 'Eyes of the Prey',
        value: calcRefinement(0.24, 0.06, r),
      })
      return base
    },
  },
  {
    id: '21022',
    scaling: (base, r) => {
      base[Stats.BE].push({
        name: 'Passive',
        source: 'Fermata',
        value: calcRefinement(0.16, 0.04, r),
      })
      base.CALLBACK.push((x, d) => {
        if (countDot(d, DebuffTypes.SHOCKED) + countDot(d, DebuffTypes.WIND_SHEAR))
          x[Stats.ALL_DMG].push({
            name: 'Passive',
            source: 'Fermata',
            value: calcRefinement(0.16, 0.04, r),
          })
        return x
      })
      return base
    },
  },
  {
    id: '21037',
    scaling: (base, r) => {
      base[Stats.P_ATK].push({
        name: 'Passive',
        source: 'Final Victor',
        value: calcRefinement(0.12, 0.02, r),
      })
      return base
    },
  },
  {
    id: '22002',
    scaling: (base, r) => {
      base[Stats.P_ATK].push({
        name: 'Passive',
        source: `For Tomorrow's Journey`,
        value: calcRefinement(0.16, 0.04, r),
      })
      return base
    },
  },
  {
    id: '21020',
    scaling: (base, r) => {
      base[Stats.P_ATK].push({
        name: 'Passive',
        source: `Geniuses' Repose`,
        value: calcRefinement(0.16, 0.04, r),
      })
      return base
    },
  },
  {
    id: '21001',
    scaling: (base, r) => {
      base.CALLBACK.push((x, d) => {
        const count = countDebuff(d)
        if (count)
          x[Stats.ALL_DMG].push({
            name: 'Passive',
            source: 'Good Night and Sleep Well',
            value: _.min([count, 3]) * calcRefinement(0.12, 0.03, r),
          })
        return x
      })
      return base
    },
  },
  {
    id: '22001',
    scaling: (base, r) => {
      base[Stats.P_HP].push({
        name: 'Passive',
        source: 'Hey, Over Here',
        value: calcRefinement(0.08, 0.01, r),
      })
      return base
    },
  },
  {
    id: '21042',
    scaling: (base, r) => {
      base[Stats.BE].push({
        name: 'Passive',
        source: 'Indelible Promise',
        value: calcRefinement(0.28, 0.07, r),
      })
      return base
    },
  },
  {
    id: '21041',
    scaling: (base, r) => {
      base.CALLBACK.push((x) => {
        if (x.getValue(Stats.EHR) >= 0.8)
          x[Stats.P_ATK].push({
            name: 'Passive',
            source: `It's Showtime`,
            value: calcRefinement(0.2, 0.04, r),
          })
        return x
      })
      return base
    },
  },
  {
    id: '21009',
    scaling: (base, r) => {
      base.DMG_REDUCTION.push({
        name: 'Passive',
        source: `Landau's Choice`,
        value: calcRefinement(0.16, 0.02, r),
      })
      base.AGGRO.push({
        name: 'Passive',
        source: `Landau's Choice`,
        value: 2,
      })
      return base
    },
  },
  {
    id: '21013',
    scaling: (base, r) => {
      base.ULT_DMG.push({
        name: 'Passive',
        source: 'Make the World Clamor',
        value: calcRefinement(0.32, 0.08, r),
      })
      return base
    },
  },
  {
    id: '21004',
    scaling: (base, r) => {
      base[Stats.BE].push({
        name: 'Passive',
        source: 'Memories of the Past',
        value: calcRefinement(0.28, 0.07, r),
      })
      return base
    },
  },
  {
    id: '21033',
    scaling: (base, r) => {
      base[Stats.P_ATK].push({
        name: 'Passive',
        source: 'Nowhere to Run',
        value: calcRefinement(0.24, 0.06, r),
      })
      base.CALLBACK.push((x) => {
        x.SKILL_SCALING.push({
          name: 'On-Kill Healing',
          value: [{ scaling: calcRefinement(0.12, 0.03, r), multiplier: Stats.ATK }],
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        })
        return x
      })
      return base
    },
  },
  {
    id: '21003',
    scaling: (base, r) => {
      base[Stats.P_ATK].push({
        name: 'Passive',
        source: 'Only Silence Remains',
        value: calcRefinement(0.16, 0.04, r),
      })
      return base
    },
  },
  {
    id: '21014',
    scaling: (base, r) => {
      base[Stats.E_RES].push({
        name: 'Passive',
        source: 'Perfect Timing',
        value: calcRefinement(0.16, 0.04, r),
      })
      base.CALLBACK.push((x) => {
        x[Stats.HEAL].push({
          name: 'Passive',
          source: 'Perfect Timing',
          value: _.min([x.getValue(Stats.E_RES) * calcRefinement(0.33, 0.03, r), calcRefinement(0.15, 0.03, r)]),
        })
        return x
      })
      return base
    },
  },
  {
    id: '21011',
    scaling: (base, r) => {
      base.CALLBACK.push((x, _d, _w, all) => {
        _.forEach(all, (b) => {
          if (b.ELEMENT === base.ELEMENT)
            b[Stats.ALL_DMG].push({
              name: 'Passive',
              source: 'Planetary Rendezvous',
              value: calcRefinement(0.12, 0.03, r),
            })
        })
        return x
      })
      return base
    },
  },
  {
    id: '21000',
    scaling: (base, r) => {
      base[Stats.ERR].push({
        name: 'Passive',
        source: 'Post-Op Conversation',
        value: calcRefinement(0.08, 0.02, r),
      })
      base.ULT_HEAL.push({
        name: 'Passive',
        source: 'Post-Op Conversation',
        value: calcRefinement(0.12, 0.03, r),
      })
      return base
    },
  },
  {
    id: '21031',
    scaling: (base, r) => {
      base[Stats.CRIT_RATE].push({
        name: 'Passive',
        source: 'Return to Darkness',
        value: calcRefinement(0.12, 0.03, r),
      })
      return base
    },
  },
  {
    id: '21007',
    scaling: (base, r) => {
      base[Stats.HEAL].push({
        name: 'Passive',
        source: 'Shared Feeling',
        value: calcRefinement(0.1, 0.025, r),
      })
      return base
    },
  },
  {
    id: '21040',
    scaling: (base, r) => {
      base[Stats.P_ATK].push({
        name: 'Passive',
        source: 'The Day The Cosmos Fell',
        value: calcRefinement(0.16, 0.02, r),
      })
      return base
    },
  },
  {
    id: '21027',
    scaling: (base, r) => {
      base[Stats.ALL_DMG].push({
        name: 'Passive',
        source: 'The Seriousness of Breakfast',
        value: calcRefinement(0.12, 0.03, r),
      })
      return base
    },
  },
  {
    id: '21030',
    scaling: (base, r) => {
      base[Stats.P_DEF].push({
        name: 'Passive',
        source: 'This Is Me!',
        value: calcRefinement(0.16, 0.04, r),
      })
      base.CALLBACK.push((x) => {
        x.ULT_SCALING = _.map(x.ULT_SCALING, (item) =>
          item.property === TalentProperty.NORMAL
            ? {
                ...item,
                value: [
                  ...item.value,
                  {
                    scaling: calcRefinement(0.6, 0.15, r),
                    multiplier: Stats.DEF,
                  },
                ],
              }
            : item
        )
        return x
      })
      return base
    },
  },
  {
    id: '21034',
    scaling: (base, r) => {
      base[Stats.ALL_DMG].push({
        name: 'Passive',
        source: 'Today Is Another Peaceful Day',
        value: _.min([base.MAX_ENERGY, 160]) * calcRefinement(0.002, 0.0005, r),
      })
      return base
    },
  },
  {
    id: '21016',
    scaling: (base, r) => {
      base[Stats.P_DEF].push({
        name: 'Passive',
        source: 'Trend of the Universal Market',
        value: calcRefinement(0.16, 0.04, r),
      })
      return base
    },
  },
  {
    id: '21019',
    scaling: (base, r) => {
      base[Stats.P_ATK].push({
        name: 'Passive',
        source: 'Under the Blue Sky',
        value: calcRefinement(0.16, 0.04, r),
      })
      return base
    },
  },
  {
    id: '21028',
    scaling: (base, r) => {
      base[Stats.P_HP].push({
        name: 'Passive',
        source: 'Warmth Shortens Cold Nights',
        value: calcRefinement(0.16, 0.04, r),
      })
      base.CALLBACK.push((x, _d, _w, a) => {
        const scaling = _.filter(
          _.map(a, (item) =>
            item.NAME
              ? {
                  name: `Warmth - ${item.NAME}`,
                  value: [{ scaling: calcRefinement(0.02, 0.005, r), multiplier: Stats.HP, override: item.getHP() }],
                  element: TalentProperty.HEAL,
                  property: TalentProperty.HEAL,
                  type: TalentType.NONE,
                }
              : undefined
          )
        )
        x.BASIC_SCALING.push(...scaling)
        x.SKILL_SCALING.push(...scaling)
        return x
      }, 999)
      return base
    },
  },
  {
    id: '21029',
    scaling: (base, r) => {
      base.CALLBACK.push((x, _d, _w, _a) => {
        const scaling = {
          name: 'Random Attacked Target',
          value: [{ scaling: calcRefinement(0.48, 0.12, r), multiplier: Stats.ATK }],
          element: x.ELEMENT,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
        }
        x.BASIC_SCALING.push(scaling)
        x.SKILL_SCALING.push(scaling)
        return x
      })
      return base
    },
  },
  {
    id: '21035',
    scaling: (base, r) => {
      base[Stats.BE].push({
        name: 'Passive',
        source: 'What Is Real?',
        value: calcRefinement(0.24, 0.06, r),
      })
      base.CALLBACK.push((x) => {
        x.BASIC_SCALING.push({
          name: 'Self Healing',
          value: [{ scaling: calcRefinement(0.02, 0.005, r), multiplier: Stats.HP }],
          flat: 800,
          element: TalentProperty.HEAL,
          property: TalentProperty.HEAL,
          type: TalentType.NONE,
        })
        return x
      })
      return base
    },
  },
  {
    id: '21026',
    scaling: (base, r) => {
      base[Stats.P_ATK].push({
        name: 'Passive',
        source: 'Woof! Walk Time!',
        value: calcRefinement(0.1, 0.025, r),
      })
      base.CALLBACK.push((x, d) => {
        if (countDot(d, DebuffTypes.BLEED) + countDot(d, DebuffTypes.BURN))
          x[Stats.ALL_DMG].push({
            name: 'Passive',
            source: 'Woof! Walk Time!',
            value: calcRefinement(0.16, 0.04, r),
          })
        return x
      })
      return base
    },
  },
  {
    id: '23024',
    scaling: (base, r) => {
      base[Stats.CRIT_DMG].push({
        name: 'Passive',
        source: 'Along the Passing Shore',
        value: calcRefinement(0.36, 0.06, r),
      })
      return base
    },
  },
  {
    id: '23018',
    scaling: (base, r) => {
      base[Stats.CRIT_DMG].push({
        name: 'Passive',
        source: 'An Instant Before A Gaze',
        value: calcRefinement(0.36, 0.06, r),
      })
      base.ULT_DMG.push({
        name: 'Passive',
        source: 'An Instant Before A Gaze',
        value: calcRefinement(0.0036, 0.0006, r) * _.min([180, base.MAX_ENERGY]),
      })
      return base
    },
  },
  {
    id: '23020',
    scaling: (base, r) => {
      base.CALLBACK.push((x, d) => {
        const count = countDebuff(d)
        x[Stats.CRIT_DMG].push({
          name: 'Passive',
          source: 'Baptism of Pure Thought',
          value: calcRefinement(0.2, 0.03, r) + _.min([count, 3]) * calcRefinement(0.08, 0.01, r),
        })
        return x
      })
      return base
    },
  },
  {
    id: '23010',
    scaling: (base, r) => {
      base[Stats.CRIT_DMG].push({
        name: 'Passive',
        source: 'Before Dawn',
        value: calcRefinement(0.36, 0.06, r),
      })
      base.SKILL_DMG.push({
        name: 'Passive',
        source: 'Before Dawn',
        value: calcRefinement(0.18, 0.03, r),
      })
      base.ULT_DMG.push({
        name: 'Passive',
        source: 'Before Dawn',
        value: calcRefinement(0.18, 0.03, r),
      })
      return base
    },
  },
  {
    id: '23015',
    scaling: (base, r) => {
      base[Stats.CRIT_RATE].push({
        name: 'Passive',
        source: 'Brighter Than the Sun',
        value: calcRefinement(0.18, 0.03, r),
      })
      return base
    },
  },
  {
    id: '23003',
    scaling: (base, r) => {
      base[Stats.ERR].push({
        name: 'Passive',
        source: `But the Battle Isn't Over`,
        value: calcRefinement(0.1, 0.02, r),
      })
      return base
    },
  },
  {
    id: '24001',
    scaling: (base, r) => {
      base[Stats.CRIT_RATE].push({
        name: 'Passive',
        source: 'Cruising in the Stellar Sea',
        value: calcRefinement(0.08, 0.02, r),
      })
      return base
    },
  },
  {
    id: '23021',
    scaling: (base, r) => {
      base[Stats.CRIT_DMG].push({
        name: 'Passive',
        source: 'Earthly Escapade',
        value: calcRefinement(0.36, 0.07, r),
      })
      return base
    },
  },
  {
    id: '23008',
    scaling: (base, r) => {
      base[Stats.P_ATK].push({
        name: 'Passive',
        source: 'Echoes of the Coffin',
        value: calcRefinement(0.24, 0.04, r),
      })
      return base
    },
  },
  {
    id: '24004',
    scaling: (base, r) => {
      base[Stats.P_ATK].push({
        name: 'Passive',
        source: 'Eternal Calculus',
        value: calcRefinement(0.08, 0.01, r),
      })
      return base
    },
  },
  {
    id: '23014',
    scaling: (base, r) => {
      base[Stats.CRIT_DMG].push({
        name: 'Passive',
        source: 'I Shall Be My Own Sword',
        value: calcRefinement(0.2, 0.03, r),
      })
      return base
    },
  },
  {
    id: '23004',
    scaling: (base, r) => {
      base.CALLBACK.push((x, d) => {
        const count = countDebuff(d)
        if (count)
          x[Stats.ALL_DMG].push({
            name: 'Passive',
            source: 'In the Name of the World',
            value: calcRefinement(0.24, 0.04, r),
          })
        return x
      })
      return base
    },
  },
  {
    id: '23001',
    scaling: (base, r) => {
      base[Stats.CRIT_RATE].push({
        name: 'Passive',
        source: 'In the Night',
        value: calcRefinement(0.18, 0.03, r),
      })
      base.CALLBACK.push((x) => {
        const stack = _.min([_.max([x.getSpd() - 100, 0]) / 10, 6])
        if (stack) {
          x.BASIC_DMG.push({
            name: 'Passive',
            source: 'In the Night',
            value: calcRefinement(0.06, 0.01, r) * stack,
          })
          x.SKILL_DMG.push({
            name: 'Passive',
            source: 'In the Night',
            value: calcRefinement(0.06, 0.01, r) * stack,
          })
          x.ULT_CD.push({
            name: 'Passive',
            source: 'In the Night',
            value: calcRefinement(0.12, 0.02, r) * stack,
          })
        }
        return x
      })
      return base
    },
  },
  {
    id: '23007',
    scaling: (base, r) => {
      base[Stats.EHR].push({
        name: 'Passive',
        source: 'Incessant Rain',
        value: calcRefinement(0.24, 0.04, r),
      })
      base.CALLBACK.push((x, d) => {
        const count = countDebuff(d)
        if (count >= 3)
          x[Stats.CRIT_RATE].push({
            name: 'Passive',
            source: 'Incessant Rain',
            value: calcRefinement(0.12, 0.02, r),
          })
      })
      return base
    },
  },
  {
    id: '23023',
    scaling: (base, r) => {
      base[Stats.P_DEF].push({
        name: 'Passive',
        source: 'Inherently Unjust Destiny',
        value: calcRefinement(0.4, 0.06, r),
      })
      return base
    },
  },
  {
    id: '23005',
    scaling: (base, r) => {
      base[Stats.P_DEF].push({
        name: 'Passive',
        source: 'Moment of Victory',
        value: calcRefinement(0.24, 0.04, r),
      })
      base[Stats.EHR].push({
        name: 'Passive',
        source: 'Moment of Victory',
        value: calcRefinement(0.24, 0.04, r),
      })
      base.AGGRO.push({
        name: 'Passive',
        source: 'Moment of Victory',
        value: 2,
      })
      return base
    },
  },
  {
    id: '23017',
    scaling: (base, r) => {
      base[Stats.ERR].push({
        name: 'Passive',
        source: 'Night of Fright',
        value: calcRefinement(0.12, 0.02, r),
      })
      // base.CALLBACK.push((x, _d, _w, all) => {
      //   _.forEach(all, item => {
      //     item.ULT_SCALING.push({
      //       name: 'Self Healing',
      //     value: [{ scaling: calcRefinement(0.1, 0.01, r), multiplier: Stats.HP }],
      //     element: TalentProperty.HEAL,
      //     property: TalentProperty.HEAL,
      //     type: TalentType.NONE,
      //     overrideIndex:
      //     })
      //   })
      //   return x
      // })
      return base
    },
  },
  {
    id: '23019',
    scaling: (base, r) => {
      base[Stats.BE].push({
        name: 'Passive',
        source: 'Past Self in Mirror',
        value: calcRefinement(0.6, 0.1, r),
      })
      return base
    },
  },
  {
    id: '23006',
    scaling: (base, r) => {
      base[Stats.ALL_DMG].push({
        name: 'Passive',
        source: 'Patience Is All You Need',
        value: calcRefinement(0.24, 0.04, r),
      })
      return base
    },
  },
  {
    id: '23022',
    scaling: (base, r) => {
      base[Stats.EHR].push({
        name: 'Passive',
        source: 'Reforged Remembrance',
        value: calcRefinement(0.4, 0.05, r),
      })
      base.CALLBACK.push((x, d) => {
        const windshear = countDot(d, DebuffTypes.WIND_SHEAR) >= 1
        const burn = countDot(d, DebuffTypes.BURN) >= 1
        const bleed = countDot(d, DebuffTypes.BLEED) >= 1
        const shock = countDot(d, DebuffTypes.SHOCKED) >= 1
        const total = _.sum([windshear, burn, bleed, shock])

        if (total) {
          x[Stats.P_ATK].push({
            name: 'Passive',
            source: 'Reforged Remembrance',
            value: calcRefinement(0.05, 0.01, r) * total,
          })
          x.DOT_DEF_PEN.push({
            name: 'Passive',
            source: 'Reforged Remembrance',
            value: calcRefinement(0.072, 0.007, r) * total,
          })
        }
        return x
      })
      return base
    },
  },
  {
    id: '23027',
    scaling: (base, r) => {
      base[Stats.BE].push({
        name: 'Passive',
        source: 'Sailing Towards A Second Life',
        value: calcRefinement(0.6, 0.1, r),
      })
      base.BREAK_DEF_PEN.push({
        name: 'Passive',
        source: 'Sailing Towards A Second Life',
        value: calcRefinement(0.2, 0.03, r),
      })
      base.CALLBACK.push((x, _d, _w, _a, battle) => {
        if (battle && x.getValue(Stats.BE) >= 1.5)
          x[Stats.P_SPD].push({
            name: 'Passive',
            source: 'Sailing Towards A Second Life',
            value: calcRefinement(0.12, 0.02, r),
          })
        return x
      })
      return base
    },
  },
  {
    id: '23011',
    scaling: (base, r) => {
      base[Stats.P_HP].push({
        name: 'Passive',
        source: 'She Already Shut Her Eyes',
        value: calcRefinement(0.24, 0.04, r),
      })
      base[Stats.ERR].push({
        name: 'Passive',
        source: 'She Already Shut Her Eyes',
        value: calcRefinement(0.12, 0.02, r),
      })
      return base
    },
  },
  {
    id: '23012',
    scaling: (base, r) => {
      base[Stats.CRIT_DMG].push({
        name: 'Passive',
        source: 'Sleep Like the Dead',
        value: calcRefinement(0.3, 0.05, r),
      })
      return base
    },
  },
  {
    id: '24003',
    scaling: (base, r) => {
      base[Stats.BE].push({
        name: 'Passive',
        source: 'Solitary Healing',
        value: calcRefinement(0.2, 0.05, r),
      })
      return base
    },
  },
  {
    id: '23002',
    scaling: (base, r) => {
      base[Stats.P_ATK].push({
        name: 'Passive',
        source: 'Something Irreplaceable',
        value: calcRefinement(0.24, 0.04, r),
      })
      base.SKILL_SCALING.push({
        name: 'Kinship Healing',
        value: [{ scaling: calcRefinement(0.08, 0.01, r), multiplier: Stats.ATK }],
        element: TalentProperty.HEAL,
        property: TalentProperty.HEAL,
        type: TalentType.NONE,
      })
      return base
    },
  },
  {
    id: '24002',
    scaling: (base, r) => {
      base[Stats.E_RES].push({
        name: 'Passive',
        source: 'Texture of Memories',
        value: calcRefinement(0.08, 0.02, r),
      })
      base.SKILL_SCALING.push({
        name: 'On-Attacked Shield',
        value: [{ scaling: calcRefinement(0.16, 0.04, r), multiplier: Stats.HP }],
        element: TalentProperty.SHIELD,
        property: TalentProperty.SHIELD,
        type: TalentType.NONE,
      })
      return base
    },
  },
  {
    id: '23009',
    scaling: (base, r) => {
      base[Stats.P_HP].push({
        name: 'Passive',
        source: 'The Unreachable Side',
        value: calcRefinement(0.18, 0.03, r),
      })
      base[Stats.CRIT_RATE].push({
        name: 'Passive',
        source: 'The Unreachable Side',
        value: calcRefinement(0.18, 0.03, r),
      })
      return base
    },
  },
  {
    id: '23025',
    scaling: (base, r) => {
      base[Stats.BE].push({
        name: 'Passive',
        source: 'Whereabouts Should Dreams Rest',
        value: calcRefinement(0.6, 0.1, r),
      })
      return base
    },
  },
  {
    id: '23016',
    scaling: (base, r) => {
      base[Stats.CRIT_RATE].push({
        name: 'Passive',
        source: 'Worrisome, Blissful',
        value: calcRefinement(0.18, 0.03, r),
      })
      base.FUA_DMG.push({
        name: 'Passive',
        source: 'Worrisome, Blissful',
        value: calcRefinement(0.3, 0.05, r),
      })
      return base
    },
  },
  {
    id: '23028',
    scaling: (base, r) => {
      base[Stats.P_HP].push({
        name: 'Passive',
        source: 'Yet Hope Is Priceless',
        value: calcRefinement(0.16, 0.03, r),
      })
      base.CALLBACK.push((x) => {
        const exceed = _.min([_.max([0, x.getValue(Stats.CRIT_DMG) - 1.2]) / 0.2, 4])
        if (exceed)
          x.FUA_DMG.push({
            name: 'Passive',
            source: 'Yet Hope Is Priceless',
            value: calcRefinement(0.12, 0.02, r) * exceed,
          })
        return x
      })
      return base
    },
  },
  {
    id: '23013',
    scaling: (base, r) => {
      base[Stats.P_HP].push({
        name: 'Passive',
        source: 'Time Waits for No One',
        value: calcRefinement(0.18, 0.03, r),
      })
      base[Stats.HEAL].push({
        name: 'Passive',
        source: 'Time Waits for No One',
        value: calcRefinement(0.12, 0.02, r),
      })
      return base
    },
  },
  {
    id: '21046',
    scaling: (base, r) => {
      base[Stats.P_ATK].push({
        name: 'Passive',
        source: 'Poised to Bloom',
        value: calcRefinement(0.16, 0.04, r),
      })
      base.CALLBACK.push((x, _d, _w, all) => {
        const path = _.map(all, (item) => item.PATH)
        _.forEach(path, (item, i) => {
          if (
            _.size(_.filter(path, (p) => p === item)) >= 2 &&
            !checkBuffExist(all[i][Stats.CRIT_DMG], { source: 'Poised to Bloom' })
          )
            all[i][Stats.CRIT_DMG].push({
              name: 'Passive',
              source: 'Poised to Bloom',
              value: calcRefinement(0.16, 0.04, r),
            })
        })
        return x
      })
      return base
    },
  },
  {
    id: '23029',
    scaling: (base, r) => {
      base[Stats.EHR].push({
        name: 'Passive',
        source: 'Those Many Springs',
        value: calcRefinement(0.6, 0.1, r),
      })
      return base
    },
  },
  {
    id: '23030',
    scaling: (base, r) => {
      base[Stats.CRIT_DMG].push({
        name: 'Passive',
        source: 'Dance at Sunset',
        value: calcRefinement(0.36, 0.06, r),
      })
      base.AGGRO.push({
        name: 'Passive',
        source: 'Dance at Sunset',
        value: 5,
      })
      return base
    },
  },
  {
    id: '23031',
    scaling: (base, r) => {
      base[Stats.CRIT_RATE].push({
        name: 'Passive',
        source: 'I Venture Forth to Hunt',
        value: calcRefinement(0.15, 0.025, r),
      })
      return base
    },
  },
  {
    id: '23032',
    scaling: (base, r) => {
      base[Stats.BE].push({
        name: 'Passive',
        source: 'Scene Alone Stays True',
        value: calcRefinement(0.6, 0.1, r),
      })
      return base
    },
  },
  {
    id: '21047',
    scaling: (base, r) => {
      base[Stats.BE].push({
        name: 'Passive',
        source: 'Shadowed by Night',
        value: calcRefinement(0.28, 0.07, r),
      })
      return base
    },
  },
]

export default LightConeBonus
