import { IArtifact, Stats, PathType, Element } from '@src/domain/constant'
import _ from 'lodash'
import { StatsObject } from '../lib/stats/baseConstant'
import { DebuffTypes } from '@src/domain/conditional'
import { countDebuff } from '@src/core/utils/finder'

export const RelicSets: IArtifact[] = [
  {
    id: '101',
    name: 'Passerby of Wandering Cloud',
    icon: '71000',
    bonus: [{ stat: Stats.HEAL, value: 0.1 }],
    bonusAdd: [],
    desc: [
      `Increases Outgoing Healing by <span class="text-desc">10%</span>.`,
      `At the start of the battle, immediately regenerates <span class="text-desc">1</span> Skill Point.`,
    ],
  },
  {
    id: '102',
    name: 'Musketeer of Wild Wheat',
    icon: '71001',
    bonus: [{ stat: Stats.P_ATK, value: 0.12 }],
    bonusAdd: [],
    add: (base) => {
      base[Stats.P_ATK].push({
        name: '4-Piece',
        source: 'Musketeer of Wild Wheat',
        value: 0.06,
      })
      base.BASIC_DMG.push({
        name: '4-Piece',
        source: 'Musketeer of Wild Wheat',
        value: 0.1,
      })
      return base
    },
    desc: [
      `ATK increases by <span class="text-desc">12%</span>.`,
      `The wearer's SPD increases by <span class="text-desc">6%</span> and Basic ATK DMG increases by <span class="text-desc">10%</span>.`,
    ],
  },
  {
    id: '103',
    name: 'Knight of Purity Palace',
    icon: '71002',
    bonus: [{ stat: Stats.P_DEF, value: 0.15 }],
    bonusAdd: [],
    add: (base) => {
      base.SHIELD.push({
        name: '2-Piece',
        source: 'Knight of Purity Palace',
        value: 0.2,
      })
      return base
    },
    desc: [
      `Increases DEF by <span class="text-desc">15%</span>.`,
      `Increases the max DMG that can be absorbed by the <b class="text-indigo-300">Shield</b> created by the wearer by <span class="text-desc">20%</span>.`,
    ],
  },
  {
    id: '104',
    name: 'Hunter of Glacial Forest',
    icon: '71003',
    bonus: [{ stat: Stats.ICE_DMG, value: 0.1 }],
    bonusAdd: [],
    desc: [
      `Increases <b class="text-hsr-ice">Ice DMG</b> by <span class="text-desc">10%</span>.`,
      `After the wearer uses their Ultimate, their CRIT DMG increases by <span class="text-desc">25%</span> for <span class="text-desc">2</span> turn(s).`,
    ],
  },
  {
    id: '105',
    name: 'Champion of Streetwise Boxing',
    icon: '71004',
    bonus: [{ stat: Stats.PHYSICAL_DMG, value: 0.1 }],
    bonusAdd: [],
    desc: [
      `Increases <b class="text-hsr-physical">Physical DMG</b> by <span class="text-desc">10%</span>.`,
      `After the wearer attacks or is hit, their ATK increases by <span class="text-desc">5%</span> for the rest of the battle. This effect can stack up to <span class="text-desc">5</span> time(s).`,
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
        name: '4-Piece',
        source: 'Guard of Wuthering Snow',
        value: 0.08,
      })
      return base
    },
    desc: [
      `Reduces DMG taken by <span class="text-desc">8%</span>.`,
      `At the beginning of the turn, if the wearer's HP is equal to or less than <span class="text-desc">50%</span>, restores HP equal to <span class="text-desc">8%</span> of their Max HP and regenerates <span class="text-desc">5</span> Energy.`,
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
        name: '4-Piece',
        source: 'Firesmith of Lava-Forging',
        value: 0.12,
      })
      return base
    },
    desc: [
      `Increases <b class="text-hsr-fire">Fire DMG</b> by <span class="text-desc">10%</span>.`,
      `Increases the wearer's Skill DMG by <span class="text-desc">12%</span>. After unleashing Ultimate, increases the wearer's <b class="text-hsr-fire">Fire DMG</b> by <span class="text-desc">12%</span> for the next attack.`,
    ],
  },
  {
    id: '108',
    name: 'Genius of Brilliant Stars',
    icon: '71007',
    bonus: [{ stat: Stats.QUANTUM_DMG, value: 0.1 }],
    bonusAdd: [],
    add: (base) => {
      base.CALLBACK.push((x, _d, w) => {
        x.DEF_PEN.push({
          name: '4-Piece',
          source: 'Genius of Brilliant Stars',
          value: _.includes(w, Element.QUANTUM) ? 0.2 : 0.1,
        })
        return x
      })
      return base
    },
    desc: [
      `Increases <b class="text-hsr-quantum">Quantum DMG</b> by <span class="text-desc">10%</span>.`,
      `When the wearer deals DMG to the target enemy, ignores <span class="text-desc">10%</span> DEF. If the target enemy has <b class="text-hsr-quantum">Quantum</b> Weakness, the wearer additionally ignores <span class="text-desc">10%</span> DEF.`,
    ],
  },
  {
    id: '109',
    name: 'Band of Sizzling Thunder',
    icon: '71008',
    bonus: [{ stat: Stats.LIGHTNING_DMG, value: 0.1 }],
    bonusAdd: [],
    desc: [
      `Increases <b class="text-hsr-lightning">Lightning DMG</b> by <span class="text-desc">10%</span>.`,
      `When the wearer uses their Skill, increases the wearer's ATK by <span class="text-desc">20%</span> for <span class="text-desc">1</span> turn(s).`,
    ],
  },
  {
    id: '110',
    name: 'Eagle of Twilight Line',
    icon: '71009',
    bonus: [{ stat: Stats.WIND_DMG, value: 0.1 }],
    bonusAdd: [],
    desc: [
      `Increases <b class="text-hsr-wind">Wind DMG</b> by <span class="text-desc">10%</span>.`,
      `After the wearer uses their Ultimate, their action is Advanced Forward by <span class="text-desc">25%</span>.`,
    ],
  },
  {
    id: '111',
    name: 'Thief of Shooting Meteor',
    icon: '71010',
    bonus: [{ stat: Stats.BE, value: 0.16 }],
    bonusAdd: [{ stat: Stats.BE, value: 0.16 }],
    desc: [
      `Increases Break Effect by <span class="text-desc">16%</span>.`,
      `Increases the wearer's Break Effect by <span class="text-desc">16%</span>. After the wearer inflicts Weakness Break on an enemy, regenerates <span class="text-desc">3</span> Energy.`,
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
        if (countDebuff(d))
          x[Stats.CRIT_RATE].push({
            name: '4-Piece',
            source: 'Wastelander of Banditry Desert',
            value: 0.1,
          })
        if (countDebuff(d, DebuffTypes.IMPRISON))
          x[Stats.CRIT_DMG].push({
            name: '4-Piece',
            source: 'Wastelander of Banditry Desert',
            value: 0.2,
          })
        return x
      })
      return base
    },
    desc: [
      `Increases <b class="text-hsr-imaginary">Imaginary DMG</b> by <span class="text-desc">10%</span>.`,
      `When attacking debuffed enemies, the wearer's CRIT Rate increases by <span class="text-desc">10%</span>, and their CRIT DMG increases by <span class="text-desc">20%</span> against <b class="text-hsr-imaginary">Imprisoned</b> enemies.`,
    ],
  },
  {
    id: '113',
    name: 'Longevous Disciple',
    icon: '71020',
    bonus: [{ stat: Stats.P_HP, value: 0.12 }],
    bonusAdd: [],
    desc: [
      `Increases Max HP by <span class="text-desc">12%</span>.`,
      `When the wearer is hit or has their HP consumed by an ally or themselves, their CRIT Rate increases by <span class="text-desc">8%</span> for <span class="text-desc">2</span> turn(s) and up to <span class="text-desc">2</span> stacks.`,
    ],
  },
  {
    id: '114',
    name: 'Messenger Traversing Hackerspace',
    icon: '71021',
    bonus: [{ stat: Stats.P_SPD, value: 0.06 }],
    bonusAdd: [],
    desc: [
      `Increases SPD by <span class="text-desc">6%</span>.`,
      `When the wearer uses their Ultimate on an ally, SPD for all allies increases by <span class="text-desc">12%</span> for <span class="text-desc">1</span> turn(s). This effect cannot be stacked.`,
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
        name: '2-Piece',
        source: 'The Ashblazing Grand Duke',
        value: 0.2,
      })
      return base
    },
    desc: [
      `Increases the DMG dealt by follow-up attacks by <span class="text-desc">20%</span>.`,
      `When the wearer uses follow-up attacks, increases the wearer's ATK by <span class="text-desc">6%</span> for every time the follow-up attack deals DMG. This effect can stack up to <span class="text-desc">8</span> time(s) and lasts for <span class="text-desc">3</span> turn(s). This effect is removed the next time the wearer uses a follow-up attack.`,
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
            _.includes(
              [DebuffTypes.BURN, DebuffTypes.SHOCKED, DebuffTypes.WIND_SHEAR, DebuffTypes.BLEED, DebuffTypes.DOT],
              item.type
            )
          ),
          (item) => item.count
        )
        if (count)
          x.DEF_PEN.push({
            name: '4-Piece',
            source: 'Prisoner in Deep Confinement',
            value: 0.06 * _.min([count, 3]),
          })
        return x
      })
      return base
    },
    desc: [
      `ATK increases by <span class="text-desc">12%</span>.`,
      `For every DoT the target enemy is afflicted with, the wearer will ignore <span class="text-desc">6%</span> of its DEF when dealing DMG to it. This effect is valid for a max of <span class="text-desc">3</span> DoTs.`,
    ],
  },
  {
    id: '117',
    name: 'Pioneer Diver of Dead Waters',
    icon: '71028',
    bonus: [],
    bonusAdd: [{ stat: Stats.CRIT_RATE, value: 0.04 }],
    half: (base) => {
      base.CALLBACK.push((x, d) => {
        if (countDebuff(d))
          x[Stats.ALL_DMG].push({
            name: '2-Piece',
            source: 'Pioneer Diver of Dead Waters',
            value: 0.16,
          })
        return x
      })
      return base
    },
    add: (base) => {
      base.CALLBACK.push((x, d) => {
        if (countDebuff(d) >= 3)
          x[Stats.CRIT_DMG].push({
            name: '4-Piece',
            source: 'Pioneer Diver of Dead Waters',
            value: 0.12,
          })
        else if (_.sum(_.values(d)) >= 2)
          x[Stats.CRIT_DMG].push({
            name: '4-Piece',
            source: 'Pioneer Diver of Dead Waters',
            value: 0.12,
          })
        return x
      })
      return base
    },
    desc: [
      `Increases DMG dealt to enemies with debuffs by <span class="text-desc">12%</span>.`,
      `Increases CRIT Rate by <span class="text-desc">4%</span>. The wearer deals <span class="text-desc">8%</span>/<span class="text-desc">12%</span> increased CRIT DMG to enemies with at least <span class="text-desc">2</span>/<span class="text-desc">3</span> debuffs. After the wearer inflicts a debuff on enemy targets, the aforementioned effects increase by <span class="text-desc">100%</span>, lasting for <span class="text-desc">1</span> turn(s).`,
    ],
  },
  {
    id: '118',
    name: 'Watchmaker, Master of Dream Machinations',
    icon: '71029',
    bonus: [{ stat: Stats.BE, value: 0.16 }],
    bonusAdd: [],
    desc: [
      `Increases Break Effect by <span class="text-desc">16%</span>.`,
      `When the wearer uses their Ultimate on an ally, all allies' Break Effect increases by <span class="text-desc">30%</span> for <span class="text-desc">2</span> turn(s). This effect cannot be stacked.`,
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
            name: '4-Piece',
            source: 'Iron Cavalry Against the Scourge',
            value: 0.15,
          })
        if (x.getValue(Stats.BE) >= 1.5)
          x.BREAK_DEF_PEN.push({
            name: '4-Piece',
            source: 'Iron Cavalry Against the Scourge',
            value: 0.1,
          })
        return x
      })
      return base
    },
    desc: [
      `Increases Break Effect by <span class="text-desc">16%</span>.`,
      `If the wearer's Break Effect is <span class="text-desc">150%</span> or higher, ignores <span class="text-desc">10%</span> of the enemy target's DEF when dealing Break DMG to them. When the wearer's Break Effect is <span class="text-desc">250%</span> or higher, the Super Break DMG they deal to enemy targets additionally ignores <span class="text-desc">15%</span> of the targets' DEF.`,
    ],
  },
  {
    id: '120',
    name: 'The Wind-Soaring Valorous',
    icon: '71033',
    bonus: [{ stat: Stats.P_ATK, value: 0.12 }],
    bonusAdd: [{ stat: Stats.CRIT_RATE, value: 0.06 }],
    desc: [
      `ATK increases by <span class="text-desc">12%</span>.`,
      `Increases the wearer's CRIT Rate by <span class="text-desc">6%</span>. When the wearer uses a follow-up attack, increase the DMG dealt by their Ultimate by <span class="text-desc">36%</span>, lasting for <span class="text-desc">1</span> turn(s).`,
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
    half: (base) => {
      base.CALLBACK.push((x: StatsObject) => {
        if (x.getSpd() >= 120)
          x[Stats.P_ATK].push({
            name: '2-Piece',
            source: 'Space Sealing Station',
            value: 0.12,
          })
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's ATK by <span class="text-desc">12%</span>. When the wearer's SPD reaches <span class="text-desc">120</span> or higher, the wearer's ATK increases by an extra <span class="text-desc">12%</span>.`,
    ],
  },
  {
    id: '302',
    name: 'Fleet of the Ageless',
    icon: '71013',
    bonus: [{ stat: Stats.P_HP, value: 0.12 }],
    bonusAdd: [],
    half: (base) => {
      base.CALLBACK.push((x: StatsObject, _d, _w, all) => {
        if (x.getSpd() >= 120)
          _.forEach(all, (item) => {
            item[Stats.P_ATK].push({
              name: 'Fleet of the Ageless',
              source: x.NAME === item.NAME ? 'Self' : x.NAME,
              value: 0.8,
            })
          })

        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's Max HP by <span class="text-desc">12%</span>. When the wearer's SPD reaches <span class="text-desc">120</span> or higher, all allies' ATK increases by <span class="text-desc">8%</span>.`,
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
        x[Stats.P_ATK].push({
          name: '2-Piece',
          source: 'Pan-Cosmic Commercial Enterprise',
          value: _.min([0.25 * x.getValue(Stats.EHR), 0.25]),
        })
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's Effect Hit Rate by <span class="text-desc">10%</span>. Meanwhile, the wearer's ATK increases by an amount that is equal to <span class="text-desc">25%</span> of the current Effect Hit Rate, up to a maximum of <span class="text-desc">25%</span>.`,
    ],
  },
  {
    id: '304',
    name: 'Belobog of the Architects',
    icon: '71015',
    bonus: [{ stat: Stats.P_DEF, value: 0.15 }],
    bonusAdd: [],
    half: (base) => {
      base.CALLBACK.push((x: StatsObject) => {
        if (x.getValue(Stats.EHR) >= 0.5)
          x[Stats.P_DEF].push({
            name: '2-Piece',
            source: 'Belobog of the Architects',
            value: 0.15,
          })
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's DEF by <span class="text-desc">12%</span>. When the wearer's Effect Hit Rate is <span class="text-desc">50%</span> or higher, the wearer gains an extra <span class="text-desc">15%</span> DEF.`,
    ],
  },
  {
    id: '305',
    name: 'Celestial Differentiator',
    icon: '71016',
    bonus: [{ stat: Stats.CRIT_DMG, value: 0.16 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's CRIT DMG by <span class="text-desc">16%</span>. When the wearer's current CRIT DMG reaches <span class="text-desc">120%</span> or higher, after entering battle, the wearer's CRIT Rate increases by <span class="text-desc">60%</span> until the end of their first attack.`,
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
            name: '2-Piece',
            source: 'Inert Salsotto',
            value: 0.15,
          })
          x.ULT_DMG.push({
            name: '2-Piece',
            source: 'Inert Salsotto',
            value: 0.15,
          })
        }
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's CRIT Rate by <span class="text-desc">8%</span>. When the wearer's current CRIT Rate reaches <span class="text-desc">50%</span> or higher, the wearer's Ultimate and follow-up attack DMG increases by <span class="text-desc">15%</span>.`,
    ],
  },
  {
    id: '307',
    name: 'Talia: Kingdom of Banditry',
    icon: '71018',
    bonus: [{ stat: Stats.BE, value: 0.16 }],
    bonusAdd: [],
    half: (base) => {
      base.CALLBACK.push((x: StatsObject) => {
        if (x.getSpd() >= 145)
          x[Stats.BE].push({
            name: '2-Piece',
            source: 'Talia: Kingdom of Banditry',
            value: 0.2,
          })
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's Break Effect by <span class="text-desc">16%</span>. When the wearer's SPD reaches <span class="text-desc">145</span> or higher, the wearer's Break Effect increases by an extra <span class="text-desc">20%</span>.`,
    ],
  },
  {
    id: '308',
    name: 'Sprightly Vonwacq',
    icon: '71019',
    bonus: [{ stat: Stats.ERR, value: 0.05 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's Energy Regeneration Rate by <span class="text-desc">5%</span>. When the wearer's SPD reaches <span class="text-desc">120</span> or higher, the wearer's action is Advanced Forward by <span class="text-desc">40%</span> immediately upon entering battle.`,
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
            name: '2-Piece',
            source: 'Rutilant Arena',
            value: 0.2,
          })
          x.SKILL_DMG.push({
            name: '2-Piece',
            source: 'Rutilant Arena',
            value: 0.2,
          })
        }
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's CRIT Rate by <span class="text-desc">8%</span>. When the wearer's current CRIT Rate reaches <span class="text-desc">70%</span> or higher, the wearer's Basic ATK and Skill DMG increase by <span class="text-desc">20%</span>.`,
    ],
  },
  {
    id: '310',
    name: 'Broken Keel',
    icon: '71023',
    bonus: [{ stat: Stats.E_RES, value: 0.1 }],
    bonusAdd: [],
    half: (base) => {
      base.CALLBACK.push((x: StatsObject, _d, _w, all) => {
        if (x.getValue(Stats.E_RES) >= 145)
          _.forEach(all, (item) => {
            item[Stats.CRIT_DMG].push({
              name: 'Talia: Kingdom of Banditry',
              source: x.NAME === item.NAME ? 'Self' : x.NAME,
              value: 0.2,
            })
          })
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's Effect RES by <span class="text-desc">10%</span>. When the wearer's Effect RES is at <span class="text-desc">30%</span> or higher, all allies' CRIT DMG increases by <span class="text-desc">10%</span>.`,
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
        if (x.getSpd() >= 135)
          x[Stats.ALL_DMG].push({
            name: '2-Piece',
            source: 'Firmament Frontline: Glamoth',
            value: x.getSpd() >= 160 ? 0.18 : 0.12,
          })
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's ATK by <span class="text-desc">12%</span>. When the wearer's SPD is equal to or higher than <span class="text-desc">135</span>/<span class="text-desc">160</span>, the wearer deals <span class="text-desc">12%</span>/<span class="text-desc">18%</span> more DMG.`,
    ],
  },
  {
    id: '312',
    name: 'Penacony, Land of the Dreams',
    icon: '71027',
    bonus: [{ stat: Stats.ERR, value: 0.05 }],
    bonusAdd: [],
    half: (base) => {
      base.CALLBACK.push((x: StatsObject, _d, _w, all) => {
        _.forEach(all, (item) => {
          if (item.PATH === x.PATH && x.NAME !== item.NAME)
            item[Stats.ALL_DMG].push({
              name: `Penacony, Land of the Dreams [${x.ELEMENT}]`,
              source: x.NAME,
              value: 0.1,
            })
        })
        return x
      })
      return base
    },
    desc: [
      `Increases wearer's Energy Regeneration Rate by <span class="text-desc">5%</span>. Increases DMG by <span class="text-desc">10%</span> for all other allies that are of the same Type as the wearer.`,
    ],
  },
  {
    id: '313',
    name: 'Sigonia, the Unclaimed Desolation',
    icon: '71030',
    bonus: [{ stat: Stats.CRIT_RATE, value: 0.04 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's CRIT Rate by <span class="text-desc">4%</span>. When an enemy target gets defeated, the wearer's CRIT DMG increases by <span class="text-desc">4%</span>, stacking up to <span class="text-desc">10</span> time(s).`,
    ],
  },
  {
    id: '314',
    name: 'Izumo Gensei and Takama Divine Realm',
    icon: '71031',
    bonus: [{ stat: Stats.P_ATK, value: 0.12 }],
    bonusAdd: [],
    half: (base) => {
      base.CALLBACK.push((x: StatsObject, _d, _w, all) => {
        const pathDupe = _.size(_.filter(all, (item) => item.PATH === x.PATH && item.NAME !== x.NAME)) >= 1
        if (pathDupe)
          x[Stats.CRIT_RATE].push({
            name: `2-Piece`,
            source: 'Izumo Gensei and Takama Divine Realm',
            value: 0.12,
          })
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's ATK by <span class="text-desc">12%</span>. When entering battle, if at least one other ally follows the same Path as the wearer, then the wearer's CRIT Rate increases by <span class="text-desc">12%</span>.`,
    ],
  },
  {
    id: '315',
    name: 'Duran, Dynasty of Running Wolves',
    icon: '71034',
    bonus: [],
    bonusAdd: [],
    desc: [
      `When allies use follow-up attacks, the wearer receives <span class="text-desc">1</span> stack of <b>Merit</b>, stacking up to <span class="text-desc">5</span> times. Every stack of <b>Merit</b> increases the DMG dealt by the wearer's follow-up attacks by <span class="text-desc">5%</span>. When there are <span class="text-desc">5</span> stacks, additionally increases the wearer's CRIT DMG by <span class="text-desc">25%</span>.`,
    ],
  },
  {
    id: '316',
    name: 'Forge of the Kalpagni Lantern',
    icon: '71035',
    bonus: [{ stat: Stats.P_SPD, value: 0.06 }],
    bonusAdd: [],
    desc: [
      `Increase the wearer's SPD by <span class="text-desc">6%</span>. When the wearer hits enemy targets with <b class="text-hsr-fire">Fire</b> Weakness, the wearer's Break Effect increases by <span class="text-desc">40%</span>, lasting for <span class="text-desc">1</span> turn(s).`,
    ],
  },
]

export const AllRelicSets = _.concat(RelicSets, PlanarSets)
