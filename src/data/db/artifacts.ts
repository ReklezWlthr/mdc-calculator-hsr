import { IArtifact, Stats, PathType, Element } from '@src/domain/constant'
import _ from 'lodash'
import { StatsObject } from '../lib/stats/baseConstant'
import { DebuffTypes } from '@src/domain/conditional'

export const RelicSets: IArtifact[] = [
  {
    id: '101',
    name: 'Passerby of Wandering Cloud',
    icon: '71000',
    bonus: [{ stat: Stats.HEAL, value: 0.1 }],
    bonusAdd: [],
    desc: [`Increases Outgoing Healing by 10%.`, `At the start of the battle, immediately regenerates 1 Skill Point.`],
  },
  {
    id: '102',
    name: 'Musketeer of Wild Wheat',
    icon: '71001',
    bonus: [{ stat: Stats.P_ATK, value: 0.12 }],
    bonusAdd: [],
    add: (base) => {
      base[Stats.P_ATK].push({
        name: '4-Piece Bonus',
        source: 'Musketeer of Wild Wheat',
        value: 0.06,
      })
      base.BASIC_DMG.push({
        name: '4-Piece Bonus',
        source: 'Musketeer of Wild Wheat',
        value: 0.1,
      })
      return base
    },
    desc: [`ATK increases by 12%.`, `The wearer's SPD increases by 6% and Basic ATK DMG increases by 10%.`],
  },
  {
    id: '103',
    name: 'Knight of Purity Palace',
    icon: '71002',
    bonus: [{ stat: Stats.P_DEF, value: 0.15 }],
    bonusAdd: [],
    add: (base) => {
      base.SHIELD.push({
        name: '2-Piece Bonus',
        source: 'Knight of Purity Palace',
        value: 0.2,
      })
      return base
    },
    desc: [
      `Increases DEF by 15%.`,
      `Increases the max DMG that can be absorbed by the Shield created by the wearer by 20%.`,
    ],
  },
  {
    id: '104',
    name: 'Hunter of Glacial Forest',
    icon: '71003',
    bonus: [{ stat: Stats.ICE_DMG, value: 0.1 }],
    bonusAdd: [],
    desc: [
      `Increases <b class="text-hsr-ice">Ice DMG</b> by 10%.`,
      `After the wearer uses their Ultimate, their CRIT DMG increases by 25% for 2 turn(s).`,
    ],
  },
  {
    id: '105',
    name: 'Champion of Streetwise Boxing',
    icon: '71004',
    bonus: [{ stat: Stats.PHYSICAL_DMG, value: 0.1 }],
    bonusAdd: [],
    desc: [
      `Increases <b class="text-hsr-physical">Physical DMG</b> by 10%.`,
      `After the wearer attacks or is hit, their ATK increases by 5% for the rest of the battle. This effect can stack up to 5 time(s).`,
    ],
  },
  {
    id: '106',
    name: 'Guard of Wuthering Snow',
    icon: '71005',
    bonus: [],
    bonusAdd: [],
    half: (base) => {
      base.DMG_REDUCTION.push({
        name: '4-Piece Bonus',
        source: 'Guard of Wuthering Snow',
        value: 0.08,
      })
      return base
    },
    desc: [
      `Reduces DMG taken by 8%.`,
      `At the beginning of the turn, if the wearer's HP is equal to or less than 50%, restores HP equal to 8% of their Max HP and regenerates 5 Energy.`,
    ],
  },
  {
    id: '107',
    name: 'Firesmith of Lava-Forging',
    icon: '71006',
    bonus: [{ stat: Stats.FIRE_DMG, value: 0.1 }],
    bonusAdd: [],
    add: (base) => {
      base.SKILL_DMG.push({
        name: '4-Piece Bonus',
        source: 'Firesmith of Lava-Forging',
        value: 0.12,
      })
      return base
    },
    desc: [
      `Increases <b class="text-hsr-fire">Fire DMG</b> by 10%.`,
      `Increases the wearer's Skill DMG by 12%. After unleashing Ultimate, increases the wearer's <b class="text-hsr-fire">Fire DMG</b> by 12% for the next attack.`,
    ],
  },
  {
    id: '108',
    name: 'Genius of Brilliant Stars',
    icon: '71007',
    bonus: [{ stat: Stats.QUANTUM_DMG, value: 0.1 }],
    bonusAdd: [],
    add: (base) => {
      base.CALLBACK.push((x, b, w) => {
        x.DEF_PEN.push({
          name: '4-Piece Bonus',
          source: 'Genius of Brilliant Stars',
          value: _.includes(w, Element.QUANTUM) ? 0.2 : 0.1,
        })
        return x
      })
      return base
    },
    desc: [
      `Increases <b class="text-hsr-quantum">Quantum DMG</b> by 10%.`,
      `When the wearer deals DMG to the target enemy, ignores 10% DEF. If the target enemy has Quantum Weakness, the wearer additionally ignores 10% DEF.`,
    ],
  },
  {
    id: '109',
    name: 'Band of Sizzling Thunder',
    icon: '71008',
    bonus: [{ stat: Stats.LIGHTNING_DMG, value: 0.1 }],
    bonusAdd: [],
    desc: [
      `Increases <b class="text-hsr-lightning">Lightning DMG</b> by 10%.`,
      `When the wearer uses their Skill, increases the wearer's ATK by 20% for 1 turn(s).`,
    ],
  },
  {
    id: '110',
    name: 'Eagle of Twilight Line',
    icon: '71009',
    bonus: [{ stat: Stats.WIND_DMG, value: 0.1 }],
    bonusAdd: [],
    desc: [
      `Increases <b class="text-hsr-wind">Wind DMG</b> by 10%.`,
      `After the wearer uses their Ultimate, their action is Advanced Forward by 25%.`,
    ],
  },
  {
    id: '111',
    name: 'Thief of Shooting Meteor',
    icon: '71010',
    bonus: [{ stat: Stats.BE, value: 0.16 }],
    bonusAdd: [{ stat: Stats.BE, value: 0.16 }],
    desc: [
      `Increases Break Effect by 16%.`,
      `Increases the wearer's Break Effect by 16%. After the wearer inflicts Weakness Break on an enemy, regenerates 3 Energy.`,
    ],
  },
  {
    id: '112',
    name: 'Wastelander of Banditry Desert',
    icon: '71011',
    bonus: [{ stat: Stats.IMAGINARY_DMG, value: 0.1 }],
    bonusAdd: [],
    add: (base) => {
      base.CALLBACK.push((x, d) => {
        if (_.sum(_.values(d)))
          x[Stats.CRIT_RATE].push({
            name: '4-Piece Bonus',
            source: 'Wastelander of Banditry Desert',
            value: 0.1,
          })
        if (d[DebuffTypes.IMPRISON])
          x[Stats.CRIT_DMG].push({
            name: '4-Piece Bonus',
            source: 'Wastelander of Banditry Desert',
            value: 0.2,
          })
        return x
      })
      return base
    },
    desc: [
      `Increases <b class="text-hsr-imaginary">Imaginary DMG</b> by 10%.`,
      `When attacking debuffed enemies, the wearer's CRIT Rate increases by 10%, and their CRIT DMG increases by 20% against Imprisoned enemies.`,
    ],
  },
  {
    id: '113',
    name: 'Longevous Disciple',
    icon: '71020',
    bonus: [{ stat: Stats.P_HP, value: 0.12 }],
    bonusAdd: [],
    desc: [
      `Increases Max HP by 12%.`,
      `When the wearer is hit or has their HP consumed by an ally or themselves, their CRIT Rate increases by 8% for 2 turn(s) and up to 2 stacks.`,
    ],
  },
  {
    id: '114',
    name: 'Messenger Traversing Hackerspace',
    icon: '71021',
    bonus: [{ stat: Stats.P_SPD, value: 0.06 }],
    bonusAdd: [],
    desc: [
      `Increases SPD by 6%.`,
      `When the wearer uses their Ultimate on an ally, SPD for all allies increases by 12% for 1 turn(s). This effect cannot be stacked.`,
    ],
  },
  {
    id: '115',
    name: 'The Ashblazing Grand Duke',
    icon: '71024',
    bonus: [],
    bonusAdd: [],
    half: (base) => {
      base.FUA_DMG.push({
        name: '2-Piece Bonus',
        source: 'The Ashblazing Grand Duke',
        value: 0.2,
      })
      return base
    },
    desc: [
      `Increases the DMG dealt by follow-up attacks by 20%.`,
      `When the wearer uses follow-up attacks, increases the wearer's ATK by 6% for every time the follow-up attack deals DMG. This effect can stack up to 8 time(s) and lasts for 3 turn(s). This effect is removed the next time the wearer uses a follow-up attack.`,
    ],
  },
  {
    id: '116',
    name: 'Prisoner in Deep Confinement',
    icon: '71025',
    bonus: [{ stat: Stats.P_ATK, value: 0.12 }],
    bonusAdd: [],
    add: (base) => {
      base.CALLBACK.push((x, d) => {
        const count = _.sumBy(
          _.filter(d, (item) =>
            _.includes([DebuffTypes.BURN, DebuffTypes.SHOCKED, DebuffTypes.WIND_SHEAR, DebuffTypes.BLEED], item.type)
          ),
          (item) => item.count
        )
        if (count)
          base.DEF_PEN.push({
            name: '4-Piece Bonus',
            source: 'Prisoner in Deep Confinement',
            value: 0.06 * _.min([count, 3]),
          })
        return x
      })
      return base
    },
    desc: [
      `ATK increases by 12%.`,
      `For every DoT the target enemy is afflicted with, the wearer will ignore 6% of its DEF when dealing DMG to it. This effect is valid for a max of 3 DoTs.`,
    ],
  },
  {
    id: '117',
    name: 'Pioneer Diver of Dead Waters',
    icon: '71028',
    bonus: [],
    bonusAdd: [{ stat: Stats.CRIT_RATE, value: 0.04 }],
    add: (base) => {
      base.CALLBACK.push((x, d) => {
        if (_.sum(_.values(d)) >= 3)
          x[Stats.CRIT_DMG].push({
            name: '4-Piece Bonus',
            source: 'Pioneer Diver of Dead Waters',
            value: 0.12,
          })
        else if (_.sum(_.values(d)) >= 2)
          x[Stats.CRIT_DMG].push({
            name: '4-Piece Bonus',
            source: 'Pioneer Diver of Dead Waters',
            value: 0.12,
          })
        return x
      })
      return base
    },
    desc: [
      `Increases DMG dealt to enemies with debuffs by 12%.`,
      `Increases CRIT Rate by 4%. The wearer deals 8%/12% increased CRIT DMG to enemies with at least 2/3 debuffs. After the wearer inflicts a debuff on enemy targets, the aforementioned effects increase by 100%, lasting for 1 turn(s).`,
    ],
  },
  {
    id: '118',
    name: 'Watchmaker, Master of Dream Machinations',
    icon: '71029',
    bonus: [{ stat: Stats.BE, value: 0.16 }],
    bonusAdd: [],
    desc: [
      `Increases Break Effect by 16%.`,
      `When the wearer uses their Ultimate on an ally, all allies' Break Effect increases by 30% for 2 turn(s). This effect cannot be stacked.`,
    ],
  },
  {
    id: '119',
    name: 'Iron Cavalry Against the Scourge',
    icon: '71032',
    bonus: [],
    bonusAdd: [{ stat: Stats.BE, value: 0.16 }],
    add: (base) => {
      base.CALLBACK.push((x: StatsObject) => {
        if (x.getValue(Stats.BE) >= 2.5)
          x.SUPER_BREAK_DEF_PEN.push({
            name: '4-Piece Bonus',
            source: 'Iron Cavalry Against the Scourge',
            value: 0.15,
          })
        if (x.getValue(Stats.BE) >= 1.5)
          x.BREAK_DEF_PEN.push({
            name: '4-Piece Bonus',
            source: 'Iron Cavalry Against the Scourge',
            value: 0.1,
          })
        return x
      })
      return base
    },
    desc: [
      `Increases Break Effect by 16%.`,
      `If the wearer's Break Effect is 150% or higher, ignores 10% of the enemy target's DEF when dealing Break DMG to them. When the wearer's Break Effect is 250% or higher, the Super Break DMG they deal to enemy targets additionally ignores 15% of the targets' DEF.`,
    ],
  },
  {
    id: '120',
    name: 'The Wind-Soaring Valorous',
    icon: '71033',
    bonus: [{ stat: Stats.P_ATK, value: 0.12 }],
    bonusAdd: [{ stat: Stats.CRIT_RATE, value: 0.06 }],
    desc: [
      `ATK increases by 12%.`,
      `Increases the wearer's CRIT Rate by 6%. When the wearer uses a follow-up attack, increase the DMG dealt by their Ultimate by 36%, lasting for 1 turn(s).`,
    ],
  },
]

export const PlanarSets: IArtifact[] = [
  {
    id: '301',
    name: 'Space Sealing Station',
    icon: '71012',
    bonus: [{ stat: Stats.P_ATK, value: 0.12 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's ATK by 12%. When the wearer's SPD reaches 120 or higher, the wearer's ATK increases by an extra 12%.`,
    ],
  },
  {
    id: '302',
    name: 'Fleet of the Ageless',
    icon: '71013',
    bonus: [{ stat: Stats.P_HP, value: 0.12 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's Max HP by 12%. When the wearer's SPD reaches 120 or higher, all allies' ATK increases by 8%.`,
    ],
  },
  {
    id: '303',
    name: 'Pan-Cosmic Commercial Enterprise',
    icon: '71014',
    bonus: [{ stat: Stats.EHR, value: 0.1 }],
    bonusAdd: [],
    half: (base) => {
      base.CALLBACK.push((x) => {
        x[Stats.ATK].push({
          name: '2-Piece Bonus',
          source: 'Pan-Cosmic Commercial Enterprise',
          value: _.min([0.25 * x.getValue(Stats.EHR), 0.25]),
        })
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's Effect Hit Rate by 10%. Meanwhile, the wearer's ATK increases by an amount that is equal to 25% of the current Effect Hit Rate, up to a maximum of 25%.`,
    ],
  },
  {
    id: '304',
    name: 'Belobog of the Architects',
    icon: '71015',
    bonus: [{ stat: Stats.P_DEF, value: 0.15 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's DEF by 15%. When the wearer's Effect Hit Rate is 50% or higher, the wearer gains an extra 15% DEF.`,
    ],
  },
  {
    id: '305',
    name: 'Celestial Differentiator',
    icon: '71016',
    bonus: [{ stat: Stats.CRIT_DMG, value: 0.16 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's CRIT DMG by 16%. When the wearer's current CRIT DMG reaches 120% or higher, after entering battle, the wearer's CRIT Rate increases by 60% until the end of their first attack.`,
    ],
  },
  {
    id: '306',
    name: 'Inert Salsotto',
    icon: '71017',
    bonus: [{ stat: Stats.CRIT_RATE, value: 0.08 }],
    bonusAdd: [],
    half: (base) => {
      base.CALLBACK.push((x) => {
        if (x.getValue(Stats.CRIT_RATE) >= 0.5) {
          x.FUA_DMG.push({
            name: '2-Piece Bonus',
            source: 'Inert Salsotto',
            value: 0.15,
          })
          x.ULT_DMG.push({
            name: '2-Piece Bonus',
            source: 'Inert Salsotto',
            value: 0.15,
          })
        }
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's CRIT Rate by 8%. When the wearer's current CRIT Rate reaches 50% or higher, the wearer's Ultimate and follow-up attack DMG increases by 15%.`,
    ],
  },
  {
    id: '307',
    name: 'Talia: Kingdom of Banditry',
    icon: '71018',
    bonus: [{ stat: Stats.BE, value: 0.16 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's Break Effect by 16%. When the wearer's SPD reaches 145 or higher, the wearer's Break Effect increases by an extra 20%.`,
    ],
  },
  {
    id: '308',
    name: 'Sprightly Vonwacq',
    icon: '71019',
    bonus: [{ stat: Stats.ERR, value: 0.05 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's Energy Regeneration Rate by 5%. When the wearer's SPD reaches 120 or higher, the wearer's action is Advanced Forward by 40% immediately upon entering battle.`,
    ],
  },
  {
    id: '309',
    name: 'Rutilant Arena',
    icon: '71022',
    bonus: [{ stat: Stats.CRIT_RATE, value: 0.08 }],
    bonusAdd: [],
    half: (base) => {
      base.CALLBACK.push((x) => {
        if (x.getValue(Stats.CRIT_RATE) >= 0.7) {
          x.BASIC_DMG.push({
            name: '2-Piece Bonus',
            source: 'Rutilant Arena',
            value: 0.2,
          })
          x.SKILL_DMG.push({
            name: '2-Piece Bonus',
            source: 'Rutilant Arena',
            value: 0.2,
          })
        }
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's CRIT Rate by 8%. When the wearer's current CRIT Rate reaches 70% or higher, the wearer's Basic ATK and Skill DMG increase by 20%.`,
    ],
  },
  {
    id: '310',
    name: 'Broken Keel',
    icon: '71023',
    bonus: [{ stat: Stats.E_RES, value: 0.1 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's Effect RES by 10%. When the wearer's Effect RES is at 30% or higher, all allies' CRIT DMG increases by 10%.`,
    ],
  },
  {
    id: '311',
    name: 'Firmament Frontline: Glamoth',
    icon: '71026',
    bonus: [{ stat: Stats.P_ATK, value: 0.12 }],
    bonusAdd: [],
    half: (base) => {
      base.CALLBACK.push((x) => {
        if (x.getSpd() >= 1.35)
          x[Stats.ALL_DMG].push({
            name: '2-Piece Bonus',
            source: 'Firmament Frontline: Glamoth',
            value: 0.12,
          })
        if (x.getSpd() >= 1.6)
          x[Stats.ALL_DMG].push({
            name: '2-Piece Bonus',
            source: 'Firmament Frontline: Glamoth',
            value: 0.06,
          })
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's ATK by 12%. When the wearer's SPD is equal to or higher than 135/160, the wearer deals 12%/18% more DMG.`,
    ],
  },
  {
    id: '312',
    name: 'Penacony, Land of the Dreams',
    icon: '71027',
    bonus: [{ stat: Stats.ERR, value: 0.05 }],
    bonusAdd: [],
    desc: [
      `Increases wearer's Energy Regeneration Rate by 5%. Increases DMG by 10% for all other allies that are of the same Type as the wearer.`,
    ],
  },
  {
    id: '313',
    name: 'Sigonia, the Unclaimed Desolation',
    icon: '71030',
    bonus: [{ stat: Stats.CRIT_RATE, value: 0.04 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's CRIT Rate by 4%. When an enemy target gets defeated, the wearer's CRIT DMG increases by 4%, stacking up to 10 time(s).`,
    ],
  },
  {
    id: '314',
    name: 'Izumo Gensei and Takama Divine Realm',
    icon: '71031',
    bonus: [{ stat: Stats.P_ATK, value: 0.12 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's ATK by 12%. When entering battle, if at least one other ally follows the same Path as the wearer, then the wearer's CRIT Rate increases by 12%.`,
    ],
  },
  {
    id: '315',
    name: 'Duran, Dynasty of Running Wolves',
    icon: '71034',
    bonus: [],
    bonusAdd: [],
    desc: [
      `When allies use follow-up attacks, the wearer receives 1 stack of Merit, stacking up to 5 times. Every stack of Merit increases the DMG dealt by the wearer's follow-up attacks by 5%. When there are 5 stacks, additionally increases the wearer's CRIT DMG by 25%.`,
    ],
  },
  {
    id: '316',
    name: 'Forge of the Kalpagni Lantern',
    icon: '71035',
    bonus: [{ stat: Stats.P_SPD, value: 0.06 }],
    bonusAdd: [],
    desc: [
      `Increase the wearer's SPD by 6%. When the wearer hits enemy targets with Fire Weakness, the wearer's Break Effect increases by 40%, lasting for 1 turn(s).`,
    ],
  },
]

export const AllRelicSets = _.concat(RelicSets, PlanarSets)
