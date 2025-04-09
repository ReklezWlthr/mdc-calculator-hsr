import { calcRefinement } from '@src/core/utils/data_format'
import { addDebuff, checkBuffExist, checkInclusiveKey, findCharacter, findContentById } from '@src/core/utils/finder'
import { DebuffTypes, IWeaponContent } from '@src/domain/conditional'
import { Element, Stats, TalentProperty, TalentType } from '@src/domain/constant'
import _ from 'lodash'
import { StatsObject, StatsObjectKeys, TalentTypeMap } from '../../baseConstant'

export const LCConditionals: IWeaponContent[] = [
  {
    type: 'toggle',
    text: `Mirage Fizzle`,
    show: true,
    default: true,
    duration: 1,
    id: '23024',
    debuff: true,
    scaling: (base, form, r) => {
      if (form['23024']) {
        base[Stats.ALL_DMG].push({
          name: 'Mirage Fizzle',
          source: 'Along the Passing Shore',
          value: calcRefinement(0.24, 0.04, r),
        })
        base.ULT_DMG.push({
          name: 'Mirage Fizzle',
          source: 'Along the Passing Shore',
          value: calcRefinement(0.24, 0.04, r),
        })
        base.CALLBACK.push((x, d, _w, a) => {
          _.forEach(a, (t) => {
            t.ADD_DEBUFF.push({
              name: 'Mirage Fizzle',
              source: t.NAME === x.NAME ? 'Self' : x.NAME,
            })
          })
          addDebuff(d, DebuffTypes.OTHER)
          return x
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Disputation`,
    show: true,
    default: true,
    duration: 2,
    id: '23020',
    scaling: (base, form, r) => {
      if (form['23020']) {
        base[Stats.ALL_DMG].push({
          name: 'Disputation',
          source: 'Baptism of Pure Thought',
          value: calcRefinement(0.36, 0.06, r),
        })
        base.FUA_DEF_PEN.push({
          name: 'Disputation',
          source: 'Baptism of Pure Thought',
          value: calcRefinement(0.24, 0.04, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Somnus Corpus`,
    show: true,
    default: true,
    id: '23010',
    scaling: (base, form, r) => {
      if (form['23010']) {
        base.FUA_DMG.push({
          name: 'Somnus Corpus',
          source: 'Before Dawn',
          value: calcRefinement(0.48, 0.08, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Dragon's Call Stacks`,
    show: true,
    default: 1,
    min: 0,
    max: 2,
    duration: 2,
    id: '23015',
    scaling: (base, form, r) => {
      if (form['23015']) {
        base[Stats.P_ATK].push({
          name: `Dragon's Call`,
          source: 'Brighter Than the Sun',
          value: calcRefinement(0.18, 0.03, r) * form['23015'],
        })
        base[Stats.ERR].push({
          name: `Dragon's Call`,
          source: 'Brighter Than the Sun',
          value: calcRefinement(0.06, 0.01, r) * form['23015'],
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Target HP <= 50%`,
    show: true,
    default: true,
    id: '24001',
    scaling: (base, form, r) => {
      if (form['24001']) {
        base[Stats.CRIT_RATE] = _.map(base[Stats.CRIT_RATE], (item) =>
          item.source === 'Cruising in the Stellar Sea'
            ? {
                ...item,
                value: item.value * 2,
              }
            : item
        )
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `On-Kill ATK Bonus`,
    show: true,
    default: true,
    duration: 2,
    id: '24001_2',
    scaling: (base, form, r) => {
      if (form['24001_2']) {
        base[Stats.P_ATK].push({
          name: `Passive`,
          source: 'Cruising in the Stellar Sea',
          value: calcRefinement(0.2, 0.05, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Number of Targets Hit`,
    show: true,
    default: 5,
    min: 0,
    max: 5,
    id: '24004',
    scaling: (base, form, r) => {
      if (form['24004']) {
        base[Stats.P_ATK].push({
          name: `Passive`,
          source: 'Eternal Calculus',
          value: calcRefinement(0.04, 0.01, r) * form['24004'],
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Targets Hit >= 3`,
    show: true,
    default: true,
    duration: 1,
    id: '24004_1',
    scaling: (base, form, r) => {
      if (form['24004_1']) {
        base[Stats.P_SPD].push({
          name: `Passive`,
          source: 'Eternal Calculus',
          value: calcRefinement(0.08, 0.02, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Cantillation Stacks`,
    show: true,
    default: 0,
    min: 0,
    max: 5,
    id: '23026',
    scaling: (base, form, r) => {
      if (form['23026']) {
        base[Stats.ERR].push({
          name: `Cantillation`,
          source: 'Flowing Nightglow',
          value: calcRefinement(0.03, 0.005, r) * form['23026'],
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Cadenza`,
    show: true,
    default: false,
    duration: 1,
    id: '23026_1',
    scaling: (base, form, r) => {
      if (form['23026_1']) {
        base[Stats.P_ATK].push({
          name: `Cadenza`,
          source: 'Flowing Nightglow',
          value: calcRefinement(0.48, 0.12, r),
        })
        base[Stats.ALL_DMG].push({
          name: `Cadenza`,
          source: 'Flowing Nightglow',
          value: calcRefinement(0.24, 0.04, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Eclipse Stacks`,
    show: true,
    default: 0,
    min: 0,
    max: 3,
    id: '23014',
    scaling: (base, form, r) => {
      if (form['23014']) {
        base[Stats.ALL_DMG].push({
          name: `Eclipse`,
          source: 'I Shall Be My Own Sword',
          value: calcRefinement(0.14, 0.025, r) * form['23014'],
        })
        if (form['23014'] >= 3)
          base.DEF_PEN.push({
            name: `Eclipse (3+)`,
            source: 'I Shall Be My Own Sword',
            value: calcRefinement(0.12, 0.02, r),
          })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Skill ATK/EHR Bonus`,
    show: true,
    default: false,
    id: '23004',
    scaling: (base, form, r) => {
      if (form['23004']) {
        base[Stats.EHR].push({
          name: `Passive`,
          source: 'In the Name of the World',
          value: calcRefinement(0.18, 0.03, r),
        })
        base[Stats.P_ATK].push({
          name: `Passive`,
          source: 'In the Name of the World',
          value: calcRefinement(0.24, 0.04, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Shielded CRIT DMG Bonus`,
    show: true,
    default: false,
    duration: 2,
    id: '23023',
    scaling: (base, form, r) => {
      if (form['23023']) {
        base[Stats.CRIT_DMG].push({
          name: `Passive`,
          source: 'Inherently Unjust Destiny',
          value: calcRefinement(0.4, 0.06, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Attacked DEF Bonus`,
    show: true,
    default: false,
    id: '23005',
    scaling: (base, form, r) => {
      if (form['23005']) {
        base[Stats.P_DEF].push({
          name: `Passive`,
          source: 'Moment of Victory',
          value: calcRefinement(0.24, 0.04, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Enemy Count ATK Bonus`,
    show: true,
    default: 1,
    min: 1,
    max: 5,
    id: '23000',
    scaling: (base, form, r) => {
      if (form['23000']) {
        base[Stats.P_ATK].push({
          name: `Passive`,
          source: 'Night on the Milky Way',
          value: calcRefinement(0.09, 0.015, r) * form['23000'],
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `On-Break DMG Bonus`,
    show: true,
    default: true,
    duration: 1,
    id: '23000_1',
    scaling: (base, form, r) => {
      if (form['23000_1']) {
        base[Stats.ALL_DMG].push({
          name: `Passive`,
          source: 'Night on the Milky Way',
          value: calcRefinement(0.3, 0.05, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `ATK Bonus Stacks`,
    show: true,
    default: 0,
    min: 0,
    max: 4,
    id: '24000',
    scaling: (base, form, r) => {
      if (form['24000']) {
        base[Stats.P_ATK].push({
          name: `Passive`,
          source: 'On the Fall of an Aeon',
          value: calcRefinement(0.08, 0.02, r) * form['24000'],
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `On-Break DMG Bonus`,
    show: true,
    default: true,
    duration: 2,
    id: '24000_1',
    scaling: (base, form, r) => {
      if (form['24000_1']) {
        base[Stats.ALL_DMG].push({
          name: `Passive`,
          source: 'On the Fall of an Aeon',
          value: calcRefinement(0.12, 0.03, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `SPD Bonus Stacks`,
    show: true,
    default: 0,
    min: 0,
    max: 3,
    id: '23006',
    scaling: (base, form, r) => {
      if (form['23006']) {
        base[Stats.P_SPD].push({
          name: `Passive`,
          source: 'Patience Is All You Need',
          value: calcRefinement(0.048, 0.008, r) * form['23006'],
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Missed CRIT Rate Bonus`,
    show: true,
    default: true,
    duration: 1,
    id: '23012',
    scaling: (base, form, r) => {
      if (form['23012']) {
        base[Stats.CRIT_RATE].push({
          name: `Passive`,
          source: 'Sleep Like the Dead',
          value: calcRefinement(0.36, 0.06, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Post-Ult DoT Bonus`,
    show: true,
    default: true,
    duration: 1,
    id: '24003',
    scaling: (base, form, r) => {
      if (form['24003']) {
        base.DOT_DMG.push({
          name: `Passive`,
          source: 'Solitary Healing',
          value: calcRefinement(0.24, 0.06, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Kinship DMG Bonus`,
    show: true,
    default: true,
    id: '23002',
    scaling: (base, form, r) => {
      if (form['23002']) {
        base[Stats.ALL_DMG].push({
          name: `Passive`,
          source: 'Something Irreplaceable',
          value: calcRefinement(0.24, 0.08, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Shielded DMG Reduction`,
    show: true,
    default: true,
    id: '24002',
    scaling: (base, form, r) => {
      if (form['24002']) {
        base.DMG_REDUCTION.push({
          name: `Passive`,
          source: 'Texture of Memories',
          value: calcRefinement(0.12, 0.03, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `HP Loss DMG Bonus`,
    show: true,
    default: true,
    id: '23009',
    scaling: (base, form, r) => {
      if (form['23009']) {
        base[Stats.ALL_DMG].push({
          name: `Passive`,
          source: 'The Unreachable Side',
          value: calcRefinement(0.24, 0.04, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Ult & FuA DEF PEN`,
    show: true,
    default: true,
    duration: 2,
    id: '23028',
    scaling: (base, form, r) => {
      if (form['23028']) {
        base.ULT_DEF_PEN.push({
          name: `Passive`,
          source: 'Yet Hope Is Priceless',
          value: calcRefinement(0.16, 0.03, r),
        })
        base.FUA_DEF_PEN.push({
          name: `Passive`,
          source: 'Yet Hope Is Priceless',
          value: calcRefinement(0.16, 0.03, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Current HP <= Target`,
    show: true,
    default: true,
    duration: 2,
    id: '21012',
    scaling: (base, form, r) => {
      if (form['21012']) {
        base[Stats.ALL_DMG] = _.map(base[Stats.ALL_DMG], (item) =>
          item.source === 'A Secret Vow' ? { ...item, value: item.value * 2 } : item
        )
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Post-Ult SPD Bonus`,
    show: true,
    default: true,
    duration: 2,
    id: '21045',
    scaling: (base, form, r) => {
      if (form['21045']) {
        base[Stats.P_SPD].push({
          name: `Passive`,
          source: 'After the Charmony Fall',
          value: calcRefinement(0.08, 0.02, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Shielded Ally Count`,
    show: true,
    default: 4,
    min: 0,
    max: 4,
    id: '21043',
    scaling: (base, form, r) => {
      if (form['21043']) {
        base[Stats.ALL_DMG].push({
          name: 'Passive',
          source: 'Concert for Two',
          value: form['21043'] * calcRefinement(0.04, 0.01, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Good Fortune Stacks`,
    show: true,
    default: 4,
    min: 0,
    max: 4,
    id: '21037',
    scaling: (base, form, r) => {
      if (form['21037']) {
        base[Stats.CRIT_DMG].push({
          name: 'Good Fortune',
          source: 'Final Victor',
          value: form['21037'] * calcRefinement(0.08, 0.01, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `HP Lost >= 25%`,
    show: true,
    default: true,
    duration: 2,
    id: '21038',
    scaling: (base, form, r) => {
      if (form['21038']) {
        base[Stats.ALL_DMG].push({
          name: 'Passive',
          source: 'Flames Afar',
          value: calcRefinement(0.25, 0.0625, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Post-Ult DMG Bonus`,
    show: true,
    default: true,
    duration: 1,
    id: '22002',
    scaling: (base, form, r) => {
      if (form['22002']) {
        base[Stats.ALL_DMG].push({
          name: 'Passive',
          source: `For Tomorrow's Journey`,
          value: calcRefinement(0.18, 0.03, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `On-Kill CRIT DMG`,
    show: true,
    default: true,
    duration: 1,
    id: '21020',
    scaling: (base, form, r) => {
      if (form['21020']) {
        base[Stats.CRIT_DMG].push({
          name: 'Passive',
          source: `Geniuses' Repose`,
          value: calcRefinement(0.24, 0.06, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Skill Healing Bonus`,
    show: true,
    default: true,
    duration: 2,
    id: '22001',
    scaling: (base, form, r) => {
      if (form['22001']) {
        base[Stats.HEAL].push({
          name: 'Passive',
          source: `Hey, Over Here`,
          value: calcRefinement(0.16, 0.03, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Post-Ult CRIT Rate`,
    show: true,
    default: true,
    duration: 2,
    id: '21042',
    scaling: (base, form, r) => {
      if (form['21042']) {
        base[Stats.CRIT_RATE].push({
          name: 'Passive',
          source: `Indelible Promise`,
          value: calcRefinement(0.15, 0.0375, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Trick Stacks`,
    show: true,
    default: 0,
    min: 0,
    max: 3,
    id: '21041',
    scaling: (base, form, r) => {
      if (form['21041']) {
        base[Stats.ALL_DMG].push({
          name: 'Trick',
          source: `It's Showtime`,
          value: calcRefinement(0.06, 0.01, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Enemies Count <= 2`,
    show: true,
    default: true,
    id: '21003',
    scaling: (base, form, r) => {
      if (form['21003']) {
        base[Stats.CRIT_RATE].push({
          name: 'Passive',
          source: `Only Silence Remains`,
          value: calcRefinement(0.12, 0.03, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Un-Hit Bonuses`,
    show: true,
    default: true,
    id: '21024',
    scaling: (base, form, r) => {
      if (form['21024']) {
        base[Stats.P_SPD].push({
          name: 'Passive',
          source: `River Flows in Spring`,
          value: calcRefinement(0.08, 0.01, r),
        })
        base[Stats.ALL_DMG].push({
          name: 'Passive',
          source: `River Flows in Spring`,
          value: calcRefinement(0.12, 0.03, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Full Energy Bonus`,
    show: true,
    default: true,
    id: '21017',
    scaling: (base, form, r) => {
      base.BASIC_DMG.push({
        name: 'Passive',
        source: `Subscribe for More!`,
        value: calcRefinement(0.24, 0.06, r) * (form['21017'] ? 2 : 1),
      })
      base.SKILL_DMG.push({
        name: 'Passive',
        source: `Subscribe for More!`,
        value: calcRefinement(0.24, 0.06, r) * (form['21017'] ? 2 : 1),
      })
      return base
    },
  },
  {
    type: 'number',
    text: `Swordplay Stacks`,
    show: true,
    default: 5,
    min: 0,
    max: 5,
    id: '21010',
    scaling: (base, form, r) => {
      if (form['21010']) {
        base[Stats.ALL_DMG].push({
          name: 'Passive',
          source: `Swordplay`,
          value: calcRefinement(0.08, 0.02, r) * form['21010'],
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Target HP < 50%`,
    show: true,
    default: true,
    id: '21006',
    scaling: (base, form, r) => {
      base.FUA_DMG.push({
        name: 'Passive',
        source: `The Birth of the Self`,
        value: calcRefinement(0.24, 0.06, r) * (form['21006'] ? 2 : 1),
      })
      return base
    },
  },
  {
    type: 'toggle',
    text: `2+ Enemies Hit Weak to Wearer`,
    show: true,
    default: true,
    duration: 2,
    id: '21040',
    scaling: (base, form, r) => {
      if (form['21040']) {
        base[Stats.CRIT_DMG].push({
          name: 'Passive',
          source: `The Day The Cosmos Fell`,
          value: calcRefinement(0.2, 0.05, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Mischievous Stacks`,
    show: true,
    default: 0,
    min: 0,
    max: 3,
    id: '21005',
    scaling: (base, form, r) => {
      if (form['21005']) {
        base[Stats.P_ATK].push({
          name: 'Mischievous',
          source: `The Moles Welcome You`,
          value: calcRefinement(0.12, 0.03, r) * form['21005'],
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Enemy Kill Count`,
    show: true,
    default: 0,
    min: 0,
    max: 3,
    id: '21027',
    scaling: (base, form, r) => {
      if (form['21027']) {
        base[Stats.P_ATK].push({
          name: 'Passive',
          source: `The Seriousness of Breakfast`,
          value: calcRefinement(0.04, 0.02, r) * form['21027'],
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `On-Kill CRIT Rate`,
    show: true,
    default: true,
    duration: 3,
    id: '21019',
    scaling: (base, form, r) => {
      if (form['21019']) {
        base[Stats.CRIT_RATE].push({
          name: 'Passive',
          source: `Under the Blue Sky`,
          value: calcRefinement(0.12, 0.03, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Battle-Start DMG Reduction`,
    show: true,
    default: true,
    duration: 5,
    id: '21023',
    scaling: (base, form, r) => {
      if (form['21023']) {
        base.DMG_REDUCTION.push({
          name: 'Passive',
          source: `We Are Wildfire`,
          value: calcRefinement(0.08, 0.02, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `On-Kill SPD Bonus`,
    show: true,
    default: true,
    duration: 2,
    id: '20014',
    scaling: (base, form, r) => {
      if (form['20014']) {
        base[Stats.P_SPD].push({
          name: 'Passive',
          source: `Adversarial`,
          value: calcRefinement(0.1, 0.02, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Current HP < 50%`,
    show: true,
    default: true,
    duration: 2,
    id: '20003',
    scaling: (base, form, r) => {
      if (form['20003']) {
        base[Stats.P_DEF] = _.map(base[Stats.P_DEF], (item) =>
          item.source === 'Amber' ? { ...item, value: item.value * 2 } : item
        )
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Battle-Start CRIT Rate`,
    show: true,
    default: true,
    duration: 2,
    id: '20000',
    scaling: (base, form, r) => {
      if (form['20000']) {
        base[Stats.CRIT_RATE].push({
          name: 'Passive',
          source: 'Arrows',
          value: calcRefinement(0.12, 0.03, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `On-Kill ATK Bonus`,
    show: true,
    default: true,
    duration: 2,
    id: '20007',
    scaling: (base, form, r) => {
      if (form['20007']) {
        base[Stats.P_ATK].push({
          name: 'Passive',
          source: 'Darting Arrow',
          value: calcRefinement(0.24, 0.06, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Current HP < 80%`,
    show: true,
    default: true,
    id: '20016',
    scaling: (base, form, r) => {
      if (form['20016']) {
        base[Stats.CRIT_RATE].push({
          name: 'Passive',
          source: 'Mutual Demise',
          value: calcRefinement(0.12, 0.03, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Post-Ult ATK Bonus`,
    show: true,
    default: true,
    duration: 2,
    id: '20020',
    scaling: (base, form, r) => {
      if (form['20020']) {
        base[Stats.P_ATK].push({
          name: 'Passive',
          source: 'Sagacity',
          value: calcRefinement(0.24, 0.06, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Target HP > 50%`,
    show: true,
    default: true,
    id: '20009',
    scaling: (base, form, r) => {
      if (form['20009']) {
        base[Stats.P_ATK].push({
          name: 'Passive',
          source: 'Shattered Home',
          value: calcRefinement(0.2, 0.05, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Battle-Start EHR Bonus`,
    show: true,
    default: true,
    duration: 3,
    id: '20004',
    scaling: (base, form, r) => {
      if (form['20004']) {
        base[Stats.EHR].push({
          name: 'Passive',
          source: 'Void',
          value: calcRefinement(0.2, 0.05, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Firedance Stacks`,
    show: true,
    default: 0,
    min: 0,
    max: 2,
    duration: 3,
    id: '23030',
    scaling: (base, form, r) => {
      if (form['23030']) {
        base.FUA_DMG.push({
          name: 'Firedance',
          source: 'Dance at Sunset',
          value: calcRefinement(0.36, 0.06, r) * form['23030'],
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Luminflux Stacks`,
    show: true,
    default: 0,
    min: 0,
    max: 2,
    id: '23031',
    scaling: (base, form, r) => {
      if (form['23031']) {
        base.ULT_DEF_PEN.push({
          name: 'Luminflux',
          source: 'I Venture Forth to Hunt',
          value: calcRefinement(0.27, 0.03, r) * form['23031'],
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Break SPD Bonus`,
    show: true,
    default: true,
    duration: 2,
    id: '21047',
    scaling: (base, form, r) => {
      if (form['21047']) {
        base[Stats.P_SPD].push({
          name: 'Passive',
          source: 'Shadowed by Night',
          value: calcRefinement(0.08, 0.01, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `CRIT DMG Stacks`,
    show: true,
    default: true,
    duration: 2,
    id: '22003',
    scaling: (base, form, r) => {
      if (form['22003']) {
        base[Stats.CRIT_DMG].push({
          name: 'Passive',
          source: 'Ninja Record: Sound Hunt',
          value: calcRefinement(0.18, 0.04, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Brocade Stacks`,
    show: true,
    default: 0,
    min: 0,
    max: 6,
    id: '23036',
    scaling: (base, form, r) => {
      if (form['23036']) {
        base[Stats.CRIT_DMG].push({
          name: 'Brocade',
          source: 'Time Woven Into Gold',
          value: calcRefinement(0.09, 0.015, r) * form['23036'],
        })
      }
      if (form['23036'] >= 6) {
        base.BASIC_DMG.push({
          name: 'Passive',
          source: 'Time Woven Into Gold',
          value: calcRefinement(0.09, 0.015, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Skill & Ult DMG Bonus`,
    show: true,
    default: true,
    duration: 3,
    id: '23037',
    scaling: (base, form, r) => {
      if (form['23037']) {
        base.SKILL_DMG.push({
          name: 'Passive',
          source: 'Into the Unreachable Veil',
          value: calcRefinement(0.48, 0.12, r),
        })
        base.ULT_DMG.push({
          name: 'Passive',
          source: 'Into the Unreachable Veil',
          value: calcRefinement(0.48, 0.12, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `On-Ult Basic ATK DMG Bonus`,
    show: true,
    default: true,
    duration: 3,
    id: '21051',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['21051']) {
        base.BASIC_DMG.push({
          name: 'Passive',
          source: `Geniuses' Greetings`,
          value: calcRefinement(0.2, 0.05, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.BASIC_DMG.push({
            name: 'Passive',
            source: `Geniuses' Greetings`,
            value: calcRefinement(0.2, 0.05, r),
          })
        }
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Memosprite On-Field Bonus`,
    show: true,
    default: true,
    duration: 3,
    id: '21052',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['21052']) {
        base[Stats.ALL_DMG].push({
          name: 'Passive',
          source: 'Sweat Now, Cry Less',
          value: calcRefinement(0.24, 0.03, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.ALL_DMG].push({
            name: 'Passive',
            source: 'Sweat Now, Cry Less',
            value: calcRefinement(0.24, 0.03, r),
          })
        }
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Commemoration`,
    show: true,
    default: 1,
    min: 0,
    max: 4,
    id: '20022',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['20022']) {
        base[Stats.ALL_DMG].push({
          name: 'Commemoration',
          source: 'Reminiscence',
          value: calcRefinement(0.08, 0.01, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.ALL_DMG].push({
            name: 'Commemoration',
            source: 'Reminiscence',
            value: calcRefinement(0.08, 0.01, r),
          })
        }
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `HP-Consumed DMG Bonus`,
    show: true,
    default: true,
    id: '23039',
    scaling: (base, form, r) => {
      if (form['23039']) {
        base.CALLBACK.push(function P99(x) {
          const value = calcRefinement(0.3, 0.05, r) * (x.getHP() / calcRefinement(0.06, 0.005, r) > 500 ? 2 : 1)
          x.SKILL_DMG.push({
            name: 'Passive',
            source: 'Flame of Blood, Blaze My Path',
            value,
          })
          x.ULT_DMG.push({
            name: 'Passive',
            source: 'Flame of Blood, Blaze My Path',
            value,
          })

          return x
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Death Flower`,
    show: true,
    default: true,
    id: '23040',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['23040']) {
        base.DEF_PEN.push({
          name: 'Death Flower',
          source: 'Make Farewells More Beautiful',
          value: calcRefinement(0.3, 0.05, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.DEF_PEN.push({
            name: 'Death Flower',
            source: 'Make Farewells More Beautiful',
            value: calcRefinement(0.3, 0.05, r),
          })
        }
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Weakness Implant DMG Bonus`,
    show: true,
    default: false,
    id: '23041_1',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['23041_1']) {
        base[Stats.ALL_DMG].push({
          name: `Passive`,
          source: 'Life Should Be Cast to Flames',
          value: calcRefinement(0.6, 0.1, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Total HP Consumed`,
    show: true,
    default: 200,
    min: 0,
    id: '23042_1',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['23042_1']) {
        base.MEMO_SKILL_SCALING.push({
          name: 'May Rainbows Remain in the Sky - DMG',
          value: [],
          flat: form['23042_1'],
          multiplier: 2.5,
          element: base.ELEMENT,
          property: TalentProperty.ADD,
          type: TalentType.NONE,
          sum: true,
        })
      }
      return base
    },
  },
]

export const LCAllyConditionals: IWeaponContent[] = [
  {
    type: 'toggle',
    text: `But the Battle Isn't Over`,
    show: true,
    default: true,
    duration: 1,
    id: '23003',
    scaling: (base, form, r, { own, owner }) => {
      if (form[`23003_${owner}`]) {
        base[Stats.ALL_DMG].push({
          name: `But the Battle Isn't Over`,
          source: own?.NAME,
          value: calcRefinement(0.3, 0.05, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Night of Fright Stacks`,
    show: true,
    default: 0,
    min: 0,
    max: 5,
    duration: 2,
    id: '23017',
    scaling: (base, form, r, { own, owner }) => {
      if (form[`23017_${owner}`]) {
        base[Stats.P_ATK].push({
          name: `Night of Fright`,
          source: own?.NAME,
          value: calcRefinement(0.024, 0.004, r) * form[`23017_${owner}`],
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Recorded Outgoing Healing`,
    show: true,
    default: 0,
    min: 0,
    id: '23013',
    scaling: (base, form, r, { own, owner }) => {
      if (form[`23013_${owner}`]) {
        base.BASIC_SCALING.push({
          name: 'Recorded Healing DMG',
          value: [{ scaling: calcRefinement(0.36, 0.06, r), multiplier: Stats.HEAL, override: form[`23013_${owner}`] }],
          element: own.ELEMENT,
          property: TalentProperty.PURE,
          type: TalentType.NONE,
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Past and Future`,
    show: true,
    default: true,
    duration: 1,
    id: '21025',
    scaling: (base, form, r, { own, owner }) => {
      if (form[`21025_${owner}`]) {
        base[Stats.ALL_DMG].push({
          name: `Past and Future`,
          source: own?.NAME,
          value: calcRefinement(0.16, 0.04, r),
        })
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Hymn Stacks`,
    show: true,
    default: 0,
    min: 0,
    max: 3,
    duration: 2,
    id: '23034',
    scaling: (base, form, r, { own, owner }) => {
      if (form[`23034_${owner}`]) {
        base[Stats.ALL_DMG].push({
          name: `Hymn`,
          source: own?.NAME,
          value: calcRefinement(0.15, 0.0225, r) * form[`23034_${owner}`],
        })
      }
      return base
    },
  },
]

export const LCTeamConditionals: IWeaponContent[] = [
  {
    type: 'toggle',
    text: `Mask`,
    show: true,
    default: true,
    duration: 3,
    id: '23021',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['23021']) {
        base[Stats.CRIT_RATE].push({
          name: `Mask`,
          source: 'Earthly Escapade',
          value: calcRefinement(0.1, 0.01, r),
        })
        base[Stats.CRIT_DMG].push({
          name: `Mask`,
          source: 'Earthly Escapade',
          value: calcRefinement(0.28, 0.07, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.CRIT_RATE].push({
            name: `Mask`,
            source: 'Earthly Escapade',
            value: calcRefinement(0.1, 0.01, r),
          })
          base.SUMMON_STATS[Stats.CRIT_DMG].push({
            name: `Mask`,
            source: 'Earthly Escapade',
            value: calcRefinement(0.28, 0.07, r),
          })
        }
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Ultimate SPD Bonus`,
    show: true,
    default: true,
    duration: 1,
    id: '23008',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['23008']) {
        base[Stats.SPD].push({
          name: `Passive`,
          source: 'Echoes of the Coffin',
          value: calcRefinement(12, 2, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.SPD].push({
            name: `Passive`,
            source: 'Echoes of the Coffin',
            value: calcRefinement(12, 2, r),
          })
        }
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Aether Code`,
    show: true,
    default: true,
    debuff: true,
    chance: { base: 1, fixed: false },
    duration: 1,
    id: '23007',
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own }) => {
      if (form['23007']) {
        base.VULNERABILITY.push({
          name: `Aether Code`,
          source: 'Incessant Rain',
          value: calcRefinement(0.12, 0.02, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.VULNERABILITY.push({
            name: `Aether Code`,
            source: 'Incessant Rain',
            value: calcRefinement(0.12, 0.02, r),
          })
        }
        if (base.NAME === own?.NAME) addDebuff(debuffs, DebuffTypes.OTHER)
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Post-FuA Vulnerability`,
    show: true,
    default: true,
    debuff: true,
    chance: { base: calcRefinement(1, 0.15, 1), fixed: false },
    duration: 2,
    id: '23023_1',
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own }) => {
      if (form['23023_1']) {
        base.VULNERABILITY.push({
          name: `Passive`,
          source: 'Inherently Unjust Destiny',
          value: calcRefinement(0.1, 0.015, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.VULNERABILITY.push({
            name: `Passive`,
            source: 'Inherently Unjust Destiny',
            value: calcRefinement(0.1, 0.015, r),
          })
        }
        if (base.NAME === own?.NAME) addDebuff(debuffs, DebuffTypes.OTHER)
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Post-Ult DMG Bonus`,
    show: true,
    default: true,
    duration: 3,
    id: '23019',
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own }) => {
      if (form['23019'] && !checkBuffExist(base[Stats.ALL_DMG], { source: 'Past Self in Mirror' })) {
        base[Stats.ALL_DMG].push({
          name: `Passive`,
          source: 'Past Self in Mirror',
          value: calcRefinement(0.24, 0.04, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.ALL_DMG].push({
            name: `Passive`,
            source: 'Past Self in Mirror',
            value: calcRefinement(0.24, 0.04, r),
          })
        }
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Erode`,
    show: true,
    default: true,
    debuff: true,
    chance: { base: 1, fixed: false },
    duration: 1,
    id: '23006_1',
    debuffElement: Element.LIGHTNING,
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own, owner }) => {
      if (form['23006_1']) {
        if (base.NAME === own?.NAME) {
          const shock = {
            name: 'Erode DMG',
            value: [{ scaling: calcRefinement(0.6, 0.1, r), multiplier: Stats.ATK }],
            element: Element.LIGHTNING,
            property: TalentProperty.DOT,
            type: TalentType.NONE,
            chance: { base: 1, fixed: false },
            debuffElement: Element.LIGHTNING,
          }
          _.forEach(
            [base.BASIC_SCALING, base.SKILL_SCALING, base.ULT_SCALING, base.TALENT_SCALING, base.TECHNIQUE_SCALING],
            (s) => {
              if (_.some(s, (item) => _.includes([TalentProperty.NORMAL, TalentProperty.FUA], item.property)))
                s.push(shock)
            }
          )
          base.DOT_SCALING.push({
            ...shock,
            overrideIndex: owner,
            dotType: DebuffTypes.SHOCKED,
          })
          addDebuff(debuffs, DebuffTypes.SHOCKED)
        }
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Wearer HP Loss`,
    show: true,
    default: true,
    duration: 2,
    id: '23011',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['23011']) {
        base[Stats.ALL_DMG].push({
          name: `Passive`,
          source: 'She Already Shut Her Eyes',
          value: calcRefinement(0.09, 0.015, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.ALL_DMG].push({
            name: `Passive`,
            source: 'She Already Shut Her Eyes',
            value: calcRefinement(0.09, 0.015, r),
          })
        }
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Routed`,
    show: true,
    default: true,
    debuff: true,
    duration: 2,
    id: '23025',
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own }) => {
      if (form['23025']) {
        base.BREAK_VUL.push({
          name: `Routed`,
          source: 'Whereabouts Should Dreams Rest',
          value: calcRefinement(0.24, 0.04, r),
        })
        base.SPD_REDUCTION.push({
          name: `Routed`,
          source: 'Whereabouts Should Dreams Rest',
          value: 0.2,
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.BREAK_VUL.push({
            name: `Routed`,
            source: 'Whereabouts Should Dreams Rest',
            value: calcRefinement(0.24, 0.04, r),
          })
          base.SUMMON_STATS.SPD_REDUCTION.push({
            name: `Routed`,
            source: 'Whereabouts Should Dreams Rest',
            value: 0.2,
          })
        }
        if (base.NAME === own?.NAME) addDebuff(debuffs, DebuffTypes.SPD_RED)
      }
      return base
    },
  },
  {
    type: 'number',
    text: `Tame Stacks`,
    show: true,
    default: 0,
    min: 0,
    max: 2,
    debuff: true,
    id: '23016',
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own }) => {
      if (form['23016']) {
        base.X_CRIT_DMG.push({
          name: `Tame`,
          source: 'Worrisome, Blissful',
          value: calcRefinement(0.12, 0.02, r) * form['23016'],
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.X_CRIT_DMG.push({
            name: `Tame`,
            source: 'Worrisome, Blissful',
            value: calcRefinement(0.12, 0.02, r) * form['23016'],
          })
        }
        base.ADD_DEBUFF.push({
          name: 'Tame',
          source: base.NAME === own?.NAME ? 'Self' : own?.NAME,
        })
        if (base.NAME === own?.NAME) addDebuff(debuffs, DebuffTypes.OTHER)
      }
      return base
    },
  },
  {
    type: 'element',
    text: `Carve the Moon, Weave the Clouds`,
    show: true,
    default: Stats.P_ATK,
    options: [
      { name: Stats.P_ATK, value: Stats.P_ATK },
      { name: Stats.CRIT_DMG, value: Stats.CRIT_DMG },
      { name: Stats.ERR, value: Stats.ERR },
    ],
    id: '21032',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['21032'] === Stats.P_ATK) {
        base[Stats.P_ATK].push({
          name: `Passive`,
          source: 'Carve the Moon, Weave the Clouds',
          value: calcRefinement(0.1, 0.025, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.P_ATK].push({
            name: `Passive`,
            source: 'Carve the Moon, Weave the Clouds',
            value: calcRefinement(0.1, 0.025, r),
          })
        }
      }
      if (form['21032'] === Stats.CRIT_DMG) {
        base[Stats.CRIT_DMG].push({
          name: `Passive`,
          source: 'Carve the Moon, Weave the Clouds',
          value: calcRefinement(0.12, 0.03, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.CRIT_DMG].push({
            name: `Passive`,
            source: 'Carve the Moon, Weave the Clouds',
            value: calcRefinement(0.12, 0.03, r),
          })
        }
      }
      if (form['21032'] === Stats.ERR) {
        base[Stats.ERR].push({
          name: `Passive`,
          source: 'Carve the Moon, Weave the Clouds',
          value: calcRefinement(0.06, 0.015, r),
        })
      }
      return base
    },
  },
  {
    type: 'element',
    text: `Childishness Type`,
    show: true,
    default: TalentType.BA,
    options: [
      { name: 'Basic ATK', value: TalentType.BA },
      { name: 'Skill', value: TalentType.SKILL },
      { name: 'Ultimate', value: TalentType.ULT },
    ],
    id: '21036',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['21036']) {
        const exist = _.find(
          base[`${TalentTypeMap[form['21036']]}_DMG`],
          (item) => item.source === 'Dreamville Adventure'
        )
        const value = calcRefinement(0.12, 0.02, r)
        if (!exist)
          base[`${TalentTypeMap[form['21036']]}_DMG`].push({
            name: `Passive`,
            source: 'Dreamville Adventure',
            value,
          })
        if (exist && exist.value < value) exist.value = value
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Ensnare`,
    show: true,
    default: true,
    debuff: true,
    chance: { base: calcRefinement(0.6, 0.1, 1), fixed: false },
    id: '21015',
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own }) => {
      if (form['21015']) {
        base.DEF_REDUCTION.push({
          name: `Ensnare`,
          source: 'Resolution Shines As Pearls of Sweat',
          value: calcRefinement(0.12, 0.01, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.DEF_REDUCTION.push({
            name: `Ensnare`,
            source: 'Resolution Shines As Pearls of Sweat',
            value: calcRefinement(0.12, 0.01, r),
          })
        }
        if (base.NAME === own?.NAME) addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Trends Burn`,
    show: true,
    default: true,
    debuff: true,
    chance: { base: calcRefinement(1, 0.05, 1), fixed: false },
    duration: 2,
    id: '21016',
    debuffElement: Element.FIRE,
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own, owner }) => {
      if (form['21016']) {
        if (base.NAME === own?.NAME) {
          const burn = {
            name: 'Trend Burn DMG',
            value: [{ scaling: calcRefinement(0.4, 0.05, r), multiplier: Stats.DEF }],
            element: Element.FIRE,
            property: TalentProperty.DOT,
            type: TalentType.NONE,
            chance: { base: calcRefinement(1, 0.05, r), fixed: false },
            debuffElement: Element.FIRE,
          }
          base.SKILL_SCALING.push(burn)
          base.DOT_SCALING.push({
            ...burn,
            overrideIndex: owner,
            dotType: DebuffTypes.BURN,
          })
          addDebuff(debuffs, DebuffTypes.BURN)
        }
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Battle-Start ATK Bonus`,
    show: true,
    default: true,
    duration: 2,
    id: '20005',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['20005'] && !checkBuffExist(base[Stats.P_ATK], { source: 'Chorus' })) {
        base[Stats.P_ATK].push({
          name: `Passive`,
          source: 'Chorus',
          value: calcRefinement(0.08, 0.02, r),
        })
      }
      if (base.SUMMON_STATS) {
        base.SUMMON_STATS[Stats.P_ATK].push({
          name: `Passive`,
          source: 'Chorus',
          value: calcRefinement(0.08, 0.02, r),
        })
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Battle-Start SPD Bonus`,
    show: true,
    default: true,
    duration: 1,
    id: '20019',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['20019']) {
        base[Stats.SPD].push({
          name: 'Passive',
          source: 'Mediation',
          value: calcRefinement(12, 2, r),
        })
      }
      if (base.SUMMON_STATS) {
        base.SUMMON_STATS[Stats.SPD].push({
          name: 'Passive',
          source: 'Mediation',
          value: calcRefinement(12, 2, r),
        })
      }
      return base
    },
  },
  {
    type: 'element',
    text: `Those Many Springs`,
    show: true,
    default: '1',
    max: '2',
    min: '0',
    options: [
      { name: 'None', value: '0' },
      { name: 'Unarmored', value: '1' },
      { name: 'Cornered', value: '2' },
    ],
    debuff: true,
    chance: { base: 0.6, fixed: false },
    duration: 2,
    id: '23029',
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own }) => {
      const tier = Number(form['23029'])
      if (tier) {
        base.VULNERABILITY.push({
          name: tier === 1 ? `Unarmored` : `Cornered`,
          source: 'Those Many Springs',
          value: tier === 1 ? calcRefinement(0.1, 0.02, r) : calcRefinement(0.14, 0.02, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.VULNERABILITY.push({
            name: tier === 1 ? `Unarmored` : `Cornered`,
            source: 'Those Many Springs',
            value: tier === 1 ? calcRefinement(0.1, 0.02, r) : calcRefinement(0.14, 0.02, r),
          })
        }
        if (base.NAME === own?.NAME) addDebuff(debuffs, DebuffTypes.OTHER)
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Woefree`,
    show: true,
    default: false,
    debuff: true,
    duration: 2,
    id: '23032',
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own }) => {
      if (form['23032']) {
        base.CALLBACK.push((x, d, _w) => {
          x.VULNERABILITY.push({
            name: 'Woefree',
            source: 'Scene Alone Stays True',
            value: calcRefinement(0.1, 0.02, r) + (x.getValue(Stats.BE) >= 1.5 ? calcRefinement(0.08, 0.02, r) : 0),
          })
          if (base.SUMMON_STATS) {
            base.SUMMON_STATS.VULNERABILITY.push({
              name: 'Woefree',
              source: 'Scene Alone Stays True',
              value: calcRefinement(0.1, 0.02, r) + (x.getValue(Stats.BE) >= 1.5 ? calcRefinement(0.08, 0.02, r) : 0),
            })
          }
          return x
        })
        if (base.NAME === own?.NAME) addDebuff(debuffs, DebuffTypes.OTHER)
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Charring`,
    show: true,
    default: false,
    debuff: true,
    duration: 2,
    id: '23035',
    chance: { base: 1, fixed: false },
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own }) => {
      if (form['23035']) {
        base.VULNERABILITY.push({
          name: 'Charring',
          source: 'Long Road Leads Home',
          value: calcRefinement(0.18, 0.03, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.VULNERABILITY.push({
            name: 'Charring',
            source: 'Long Road Leads Home',
            value: calcRefinement(0.18, 0.03, r),
          })
        }
        if (base.NAME === own?.NAME) addDebuff(debuffs, DebuffTypes.OTHER)
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Team DMG Bonus`,
    show: true,
    default: true,
    duration: 3,
    id: '21050',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['21050']) {
        base[Stats.ALL_DMG].push({
          name: 'Passive',
          source: 'Victory In a Blink',
          value: calcRefinement(0.08, 0.02, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.ALL_DMG].push({
            name: 'Passive',
            source: 'Victory In a Blink',
            value: calcRefinement(0.08, 0.02, r),
          })
        }
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Presage`,
    show: true,
    default: true,
    duration: 2,
    id: '23038',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['23038']) {
        base[Stats.CRIT_DMG].push({
          name: 'Presage',
          source: 'If Time Were a Flower',
          value: calcRefinement(0.48, 0.12, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.CRIT_DMG].push({
            name: 'Presage',
            source: 'If Time Were a Flower',
            value: calcRefinement(0.48, 0.12, r),
          })
        }
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `On-Skill Team DMG Bonus`,
    show: true,
    default: true,
    id: '24005',
    excludeSummon: true,
    scaling: (base, form, r) => {
      if (form['24005']) {
        base[Stats.ALL_DMG].push({
          name: 'Passive',
          source: `Memory's Curtain Never Falls`,
          value: calcRefinement(0.08, 0.02, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS[Stats.ALL_DMG].push({
            name: 'Passive',
            source: `Memory's Curtain Never Falls`,
            value: calcRefinement(0.08, 0.02, r),
          })
        }
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Ability DEF Shred`,
    show: true,
    default: true,
    duration: 2,
    debuff: true,
    id: '23041',
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own }) => {
      if (form['23041'] && !checkBuffExist(base.DEF_REDUCTION, { source: 'Life Should Be Cast to Flames' })) {
        base.DEF_REDUCTION.push({
          name: `Passive`,
          source: 'Life Should Be Cast to Flames',
          value: calcRefinement(0.12, 0.03, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.DEF_REDUCTION.push({
            name: `Passive`,
            source: 'Life Should Be Cast to Flames',
            value: calcRefinement(0.12, 0.03, r),
          })
        }
        if (base.NAME === own?.NAME) addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Memosprite Skill Vulnerability`,
    show: true,
    default: false,
    debuff: true,
    duration: 2,
    id: '23042_2',
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own }) => {
      if (form['23042_2']) {
        base.VULNERABILITY.push({
          name: `Passive`,
          source: 'May Rainbows Remain in the Sky',
          value: calcRefinement(0.18, 0.045, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.VULNERABILITY.push({
            name: `Passive`,
            source: 'May Rainbows Remain in the Sky',
            value: calcRefinement(0.18, 0.045, r),
          })
        }
        if (base.NAME === own?.NAME) addDebuff(debuffs, DebuffTypes.OTHER)
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Bamboozle`,
    show: true,
    default: true,
    debuff: true,
    duration: 2,
    chance: { base: 1.2, fixed: false },
    id: '23043_1',
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own }) => {
      if (form['23043_1']) {
        base.DEF_REDUCTION.push({
          name: `Bamboozle`,
          source: 'Lies, Aflutter in the Wind',
          value: calcRefinement(0.16, 0.02, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.DEF_REDUCTION.push({
            name: `Bamboozle`,
            source: 'Lies, Aflutter in the Wind',
            value: calcRefinement(0.16, 0.02, r),
          })
        }
        if (base.NAME === own?.NAME) addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      return base
    },
  },
  {
    type: 'toggle',
    text: `Theft`,
    show: true,
    default: true,
    debuff: true,
    duration: 2,
    chance: { base: 1.2, fixed: false },
    id: '23043_2',
    excludeSummon: true,
    scaling: (base, form, r, { debuffs, own }) => {
      if (form['23043_2']) {
        base.DEF_REDUCTION.push({
          name: `Theft`,
          source: 'Lies, Aflutter in the Wind',
          value: calcRefinement(0.08, 0.01, r),
        })
        if (base.SUMMON_STATS) {
          base.SUMMON_STATS.DEF_REDUCTION.push({
            name: `Theft`,
            source: 'Lies, Aflutter in the Wind',
            value: calcRefinement(0.08, 0.01, r),
          })
        }
        if (base.NAME === own?.NAME) addDebuff(debuffs, DebuffTypes.DEF_RED)
      }
      return base
    },
  },
]
