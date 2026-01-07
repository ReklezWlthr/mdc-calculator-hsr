import { IArtifact, Stats, PathType, Element } from '@src/domain/constant'
import _ from 'lodash'
import { StatsObject } from '../lib/stats/baseConstant'
import { DebuffTypes } from '@src/domain/constant'
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
    set: [
      `Passerby's Rejuvenated Wooden Hairstick`,
      `Passerby's Roaming Dragon Bracer`,
      `Passerby's Ragged Embroided Coat`,
      `Passerby's Stygian Hiking Boots`,
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
      `The wearer's SPD increases by <span class="text-desc">6%</span> and DMG dealt by Basic ATK increases by <span class="text-desc">10%</span>.`,
    ],
    set: [
      `Musketeer's Wild Wheat Felt Hat`,
      `Musketeer's Coarse Leather Gloves`,
      `Musketeer's Wind-Hunting Shawl`,
      `Musketeer's Rivets Riding Boots`,
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
    set: [
      `Knight's Forgiving Casque`,
      `Knight's Silent Oath Ring`,
      `Knight's Solemn Breastplate`,
      `Knight's Iron Boots of Order`,
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
    set: [
      `Hunter's Artaius Hood`,
      `Hunter's Lizard Gloves`,
      `Hunter's Ice Dragon Cloak`,
      `Hunter's Soft Elkskin Boots`,
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
    set: [`Champion's Headgear`, `Champion's Heavy Gloves`, `Champion's Chest Guard`, `Champion's Fleetfoot Boots`],
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
      `At the beginning of the turn, if the wearer's HP percentage is equal to or less than <span class="text-desc">50%</span>, restores HP equal to <span class="text-desc">8%</span> of their Max HP and regenerates <span class="text-desc">5</span> Energy.`,
    ],
    set: [`Guard's Cast Iron Helmet`, `Guard's Shining Gauntlets`, `Guard's Uniform of Old`, `Guard's Silver Greaves`],
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
      `Increases DMG by the wearer's Skill by <span class="text-desc">12%</span>. After unleashing Ultimate, increases the wearer's <b class="text-hsr-fire">Fire DMG</b> by <span class="text-desc">12%</span> for the next attack.`,
    ],
    set: [
      `Firesmith's Obsidian Goggles`,
      `Firesmith's Ring of Flame-Mastery`,
      `Firesmith's Fireproof Apron`,
      `Firesmith's Alloy Leg`,
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
    set: [
      `Genius's Ultraremote Sensing Visor`,
      `Genius's Frequency Catcher`,
      `Genius's Metafield Suit`,
      `Genius's Gravity Walker`,
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
    set: [
      `Band's Polarized Sunglasses`,
      `Band's Touring Bracelet`,
      `Band's Leather Jacket With Studs`,
      `Band's Ankle Boots With Rivets`,
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
      `After the wearer uses their Ultimate, their action is <u>Advanced Forward</u> by <span class="text-desc">25%</span>.`,
    ],
    set: [`Eagle's Beaked Helmet`, `Eagle's Soaring Ring`, `Eagle's Winged Suit Harness`, `Eagle's Quilted Puttees`],
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
    set: [
      `Thief's Myriad-Faced Mask`,
      `Thief's Gloves With Prints`,
      `Thief's Steel Grappling Hook`,
      `Thief's Meteor Boots`,
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
    set: [
      `Wastelander's Breathing Mask`,
      `Wastelander's Desert Terminal`,
      `Wastelander's Friar Robe`,
      `Wastelander's Powered Greaves`,
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
    set: [
      `Disciple's Prosthetic Eye`,
      `Disciple's Ingenium Hand`,
      `Disciple's Dewy Feather Garb`,
      `Disciple's Celestial Silk Sandals`,
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
      `When the wearer uses their Ultimate on an ally, increases all Party characters' SPD by <span class="text-desc">12%</span> for <span class="text-desc">1</span> turn(s). This effect cannot be stacked.`,
    ],
    set: [
      `Messenger's Holovisor`,
      `Messenger's Transformative Arm`,
      `Messenger's Secret Satchel`,
      `Messenger's Par-kool Sneakers`,
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
      `Increases the DMG dealt by <u>follow-up attack</u> by <span class="text-desc">20%</span>.`,
      `When the wearer uses a <u>follow-up attack</u>, increases the wearer's ATK by <span class="text-desc">6%</span> for every time the <u>follow-up attack</u> deals DMG. This effect can stack up to <span class="text-desc">8</span> time(s) and lasts for <span class="text-desc">3</span> turn(s). This effect is removed the next time the wearer uses a <u>follow-up attack</u>.`,
    ],
    set: [
      `Grand Duke's Crown of Netherflame`,
      `Grand Duke's Gloves of Fieryfur`,
      `Grand Duke's Robe of Grace`,
      `Grand Duke's Ceremonial Boots`,
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
      `For every DoT the enemy target is afflicted with, the wearer will ignore <span class="text-desc">6%</span> of its DEF when dealing DMG to it. This effect is valid for a max of <span class="text-desc">3</span> DoTs.`,
    ],
    set: [
      `Prisoner's Sealed Muzzle`,
      `Prisoner's Leadstone Shackles`,
      `Prisoner's Repressive Straitjacket`,
      `Prisoner's Restrictive Fetters`,
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
    set: [
      `Pioneer's Heatproof Shell`,
      `Pioneer's Lacuna Compass`,
      `Pioneer's Sealed Lead Apron`,
      `Pioneer's Starfaring Anchor`,
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
      `When the wearer uses their Ultimate on any Party character, increases all Party characters' Break Effect by <span class="text-desc">30%</span> for <span class="text-desc">2</span> turn(s). This effect cannot be stacked.`,
    ],
    set: [
      `Watchmaker's Telescoping Lens`,
      `Watchmaker's Fortuitous Wristwatch`,
      `Watchmaker's Illusory Formal Suit`,
      `Watchmaker's Dream-Concealing Dress Shoes`,
    ],
  },
  {
    id: '119',
    name: 'Iron Cavalry Against the Scourge',
    icon: '71032',
    bonus: [{ stat: Stats.BE, value: 0.16 }],
    bonusAdd: [],
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
    set: [
      `Iron Cavalry's Homing Helm`,
      `Iron Cavalry's Crushing Wristguard`,
      `Iron Cavalry's Silvery Armor`,
      `Iron Cavalry's Skywalk Greaves`,
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
      `Increases the wearer's CRIT Rate by <span class="text-desc">6%</span>. After the wearer uses a <u>follow-up attack</u>, increases DMG dealt by Ultimate by <span class="text-desc">36%</span>, lasting for <span class="text-desc">1</span> turn(s).`,
    ],
    set: [
      `Valorous Mask of Northern Skies`,
      `Valorous Bracelet of Grappling Hooks`,
      `Valorous Plate of Soaring Flight`,
      `Valorous Greaves of Pursuing Hunt`,
    ],
  },
  {
    id: '121',
    name: `Sacerdos' Relived Ordeal`,
    icon: '71038',
    bonus: [{ stat: Stats.P_SPD, value: 0.06 }],
    bonusAdd: [],
    desc: [
      `Increases SPD by <span class="text-desc">6%</span>.`,
      `When using Skill or Ultimate on one ally target, increases the ability target's CRIT DMG by <span class="text-desc">18%</span>, lasting for <span class="text-desc">2</span> turn(s). This effect can stack up to <span class="text-desc">2</span> time(s).`,
    ],
    set: [
      `Sacerdos' Melodic Earrings`,
      `Sacerdos' Welcoming Gloves`,
      `Sacerdos' Ceremonial Garb`,
      `Sacerdos' Arduous Boots`,
    ],
  },
  {
    id: '122',
    name: `Scholar Lost in Erudition`,
    icon: '71039',
    bonus: [{ stat: Stats.CRIT_RATE, value: 0.08 }],
    bonusAdd: [],
    add: (base) => {
      base.ULT_DMG.push({
        name: '4-Piece',
        source: `Scholar Lost in Erudition`,
        value: 0.2,
      })
      base.SKILL_DMG.push({
        name: '4-Piece',
        source: `Scholar Lost in Erudition`,
        value: 0.2,
      })
      return base
    },
    desc: [
      `Increases CRIT Rate by <span class="text-desc">8%</span>.`,
      `Increases DMG dealt by Skill and Ultimate by <span class="text-desc">20%</span>. After using Ultimate, additionally increases the DMG dealt by the next Skill by <span class="text-desc">25%</span>.`,
    ],
    set: [
      `Scholar's Silver-Rimmed Monocle`,
      `Scholar's Auxiliary Knuckle`,
      `Scholar's Tweed Jacket`,
      `Scholar's Felt Snowboots`,
    ],
  },
  {
    id: '123',
    name: `Hero of Triumphant Song`,
    icon: '71040',
    bonus: [{ stat: Stats.P_ATK, value: 0.12 }],
    bonusAdd: [],
    desc: [
      `Increases ATK by <span class="text-desc">12%</span>.`,
      `While the wearer's memosprite is on the field, increases the wearer's SPD by <span class="text-desc">6%</span>. When the wearer's memosprite attacks, increases the wearer and memosprite's CRIT DMG by <span class="text-desc">30%</span> for <span class="text-desc">2</span> turn(s).`,
    ],
    set: [
      `Hero's Wreath of Championship`,
      `Hero's Gilded Bracers`,
      `Hero's Gallant Golden Armor`,
      `Hero's Firechasing Shinguard`,
    ],
  },
  {
    id: '124',
    name: `Poet of Mourning Collapse`,
    icon: '71041',
    bonus: [{ stat: Stats.QUANTUM_DMG, value: 0.1 }],
    bonusAdd: [{ stat: Stats.P_SPD, value: -0.08 }],
    add: (base) => {
      base.CALLBACK.push(function P999(x) {
        if (x.getOFCSpd() < 110) {
          base[Stats.CRIT_RATE].push({
            name: '4-Piece',
            source: `Poet of Mourning Collapse`,
            value: x.getOFCSpd() < 95 ? 0.32 : 0.2,
          })
          if (base.SUMMON_STATS) {
            base.SUMMON_STATS[Stats.CRIT_RATE].push({
              name: '4-Piece',
              source: `Poet of Mourning Collapse`,
              value: x.getOFCSpd() < 95 ? 0.32 : 0.2,
            })
          }
        }
        return x
      })
      return base
    },
    desc: [
      `Increases <b class="text-hsr-quantum">Quantum DMG</b> dealt by <span class="text-desc">10%</span>.`,
      `Decreases the wearer's SPD by <span class="text-desc">8%</span>. Before entering battle, if the wearer's SPD is less than <span class="text-desc">110</span>/<span class="text-desc">95</span>, increases the wearer's CRIT Rate by <span class="text-desc">20%</span>/<span class="text-desc">32%</span>. This effect also applies to the wearer's memosprite.`,
    ],
    set: [`Poet's Dill Wreath`, `Poet's Gilded Bracelet`, `Poet's Star-Studded Skirt`, `Poet's Silver-Studded Shoes`],
  },
  {
    id: '125',
    name: `Warrior Goddess of Sun and Thunder`,
    icon: '71044',
    bonus: [{ stat: Stats.P_SPD, value: 0.06 }],
    bonusAdd: [],
    desc: [
      `Increases SPD by <span class="text-desc">6%</span>.`,
      `When the wearer and their memosprite provide healing to ally targets aside from themselves, the wearer gains <b>Gentle Rain</b>, which can be triggered up to <span class="text-desc">1</span> time per turn, lasting for <span class="text-desc">2</span> turn(s). While the wearer has <b>Gentle Rain</b>, increases their SPD by <span class="text-desc">6%</span> and all allies' CRIT DMG by <span class="text-desc">15%</span>. This effect cannot be stacked.`,
    ],
    set: [
      `Valkyrie's Soaring Winged Helm`,
      `Valkyrie's Riding Gauntlets`,
      `Valkyrie's Dawn Cape`,
      `Valkyrie's Spur of Courage`,
    ],
  },
  {
    id: '126',
    name: `Wavestrider Captain`,
    icon: '71045',
    bonus: [{ stat: Stats.CRIT_DMG, value: 0.16 }],
    bonusAdd: [],
    desc: [
      `Increases CRIT DMG by <span class="text-desc">16%</span>.`,
      `When the wearer becomes the target of another ally target's ability, gains <span class="text-desc">1</span> stack of <b>Help</b>, stacking up to <span class="text-desc">2</span> time(s). If there are <span class="text-desc">2</span> stack(s) of <b>Help</b> when the wearer uses their Ultimate, consumes all <b>Help</b> to increase the wearer's ATK by <span class="text-desc">48%</span>, for <span class="text-desc">1</span> turn(s).`,
    ],
    set: [
      `Captain's Navigator Hat`,
      `Captain's Starcatching Astrolabe`,
      `Captain's Wind Mantle`,
      `Captain's Wave-Riding Boots`,
    ],
  },
  {
    id: '127',
    name: `World-Remaking Deliverer`,
    icon: '71048',
    bonus: [{ stat: Stats.CRIT_RATE, value: 0.08 }],
    bonusAdd: [],
    desc: [
      `Increases CRIT Rate by <span class="text-desc">8%</span>.`,
      `After the wearer uses Basic ATK or Skill, if the wearer's memosprite is on the field, increases Max HP of the wearer and their memosprite by <span class="text-desc">24%</span>, and increases all allies' DMG by <span class="text-desc">15%</span> until the wearer's next Basic ATK or Skill.`,
    ],
    set: [
      `Deliverer's Hood`,
      `Deliverer's Sword Gauntlet`,
      `Deliverer's Robe of Legacy`,
      `Deliverer's Boots of Pioneering`,
    ],
  },
  {
    id: '128',
    name: `Self-Enshrouded Recluse`,
    icon: '71049',
    bonus: [],
    bonusAdd: [{ stat: Stats.CRIT_DMG, value: 0.16 }],
    desc: [
      `Increases Shield Effect by <span class="text-desc">10%</span>.`,
      `Increases Shield Effect provided by the wearer by <span class="text-desc">12%</span>. When an ally target has a Shield provided by the wearer, the ally target's CRIT DMG increases by <span class="text-desc">15%</span>.`,
    ],
    half: (base) => {
      base.SHIELD.push({
        name: '2-Piece',
        source: 'Self-Enshrouded Recluse',
        value: 0.1,
      })
      return base
    },
    add: (base) => {
      base.SHIELD.push({
        name: '4-Piece',
        source: 'Self-Enshrouded Recluse',
        value: 0.12,
      })
      return base
    },
    set: [
      `Recluse's Wide-Brimmed Fedora`,
      `Recluse's Refined Timepiece`,
      `Recluse's Camel-Colored Coat`,
      `Recluse's Soft Suede Boots`,
    ],
  },
  {
    id: '129',
    name: `Diviner of Distant Reach`,
    icon: '71052',
    bonus: [{ stat: Stats.CRIT_DMG, value: 0.16 }],
    bonusAdd: [],
    desc: [
      `Increases CRIT DMG by <span class="text-desc">16%</span>.`,
      `The Elation DMG dealt by the wearer and their memosprites ignores <span class="text-desc">10%</span> of targets' DEF. For every <span class="text-desc">5</span> accumulated Punchline allies gain, the Elation DMG dealt additionally ignores <span class="text-desc">1%</span> of targets' DEF, which stacks up to <span class="text-desc">10</span> time(s).`,
    ],
    set: [
      `Magical Girl's Shining Medal`,
      `Magical Girl's Protective Gloves`,
      `Magical Girl's Everdance Battle Skirt`,
      `Magical Girl's Contract Boots`,
    ],
  },
  {
    id: '130',
    name: `Diviner of Distant Reach`,
    icon: '71053',
    bonus: [{ stat: Stats.P_SPD, value: 0.06 }],
    bonusAdd: [],
    add: (base) => {
      base.CALLBACK.push(function P999(x) {
        if (x.getOFCSpd() >= 120) {
          base[Stats.CRIT_RATE].push({
            name: '4-Piece',
            source: `Diviner of Distant Reach`,
            value: x.getOFCSpd() >= 160 ? 0.18 : 0.1,
          })
        }
        return x
      })
      return base
    },
    desc: [
      `Increases SPD by <span class="text-desc">6%</span>.`,
      `Before entering combat, if the wearer's SPD is greater than or equal to <span class="text-desc">120</span>/<span class="text-desc">160</span>, increases the wearer's CRIT Rate by <span class="text-desc">10%</span>/<span class="text-desc">18%</span>. When the wearer uses Elation Skill for the first time in each battle, enhances all allies' Elation by <span class="text-desc">10%</span>. This effect cannot stack.`,
    ],
    set: [
      `Diviner's Extrapolation Jade Abacus`,
      `Diviner's Ingenium Prosthetic Hand`,
      `Diviner's Astral Robe`,
      `Diviner's Cloud-Soaring Boots`,
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
      if (base.getSpd() >= 120)
        base[Stats.P_ATK] = _.map(base[Stats.P_ATK], (item) =>
          item.source === 'Space Sealing Station'
            ? {
                ...item,
                value: item.value + 0.12,
              }
            : item
        )

      return base
    },
    desc: [
      `Increases the wearer's ATK by <span class="text-desc">12%</span>. When the wearer's SPD reaches <span class="text-desc">120</span> or higher, the wearer's ATK increases by an extra <span class="text-desc">12%</span>.`,
    ],
    set: [`Herta's Space Station`, `Herta's Wandering Trek`],
  },
  {
    id: '302',
    name: 'Fleet of the Ageless',
    icon: '71013',
    bonus: [{ stat: Stats.P_HP, value: 0.12 }],
    bonusAdd: [],
    half: (base, all) => {
      if (base.getSpd() >= 120)
        _.forEach(all, (item) => {
          item[Stats.P_ATK].push({
            name: 'Fleet of the Ageless',
            source: base.NAME === item.NAME ? 'Self' : base.NAME,
            value: 0.08,
          })
        })

      return base
    },
    desc: [
      `Increases the wearer's Max HP by <span class="text-desc">12%</span>. When the wearer's SPD reaches <span class="text-desc">120</span> or higher, all Party targets' ATK increases by <span class="text-desc">8%</span>.`,
    ],
    set: [`The Xianzhou Luofu's Celestial Ark`, `The Xianzhou Luofu's Ambrosial Arbor Vines`],
  },
  {
    id: '303',
    name: 'Pan-Cosmic Commercial Enterprise',
    icon: '71014',
    bonus: [{ stat: Stats.EHR, value: 0.1 }],
    bonusAdd: [],
    half: (base) => {
      base[Stats.P_ATK].push({
        name: '2-Piece',
        source: 'Pan-Cosmic Commercial Enterprise',
        value: _.min([0.25 * base.getValue(Stats.EHR), 0.25]),
      })
      return base
    },
    desc: [
      `Increases the wearer's Effect Hit Rate by <span class="text-desc">10%</span>. Meanwhile, the wearer's ATK increases by an amount that is equal to <span class="text-desc">25%</span> of the current Effect Hit Rate, up to a maximum of <span class="text-desc">25%</span>.`,
    ],
    set: [`The IPC's Mega HQ`, `The IPC's Trade Route`],
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
          x[Stats.P_DEF] = _.map(x[Stats.P_DEF], (item) =>
            item.source === 'Belobog of the Architects'
              ? {
                  ...item,
                  value: item.value + 0.15,
                }
              : item
          )
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's DEF by <span class="text-desc">12%</span>. When the wearer's Effect Hit Rate is <span class="text-desc">50%</span> or higher, the wearer gains an extra <span class="text-desc">15%</span> DEF.`,
    ],
    set: [`Belobog's Fortress of Preservation`, `Belobog's Iron Defense`],
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
    set: [`Planet Screwllum's Mechanical Sun`, `Planet Screwllum's Ring System`],
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
      `Increases the wearer's CRIT Rate by <span class="text-desc">8%</span>. When the wearer's current CRIT Rate reaches <span class="text-desc">50%</span> or higher, the DMG dealt by the wearer's Ultimate and <u>follow-up attack</u> increases by <span class="text-desc">15%</span>.`,
    ],
    set: [`Salsotto's Moving City`, `Salsotto's Terminator Line`],
  },
  {
    id: '307',
    name: 'Talia: Kingdom of Banditry',
    icon: '71018',
    bonus: [{ stat: Stats.BE, value: 0.16 }],
    bonusAdd: [],
    half: (base) => {
      if (base.getSpd() >= 145)
        base[Stats.BE] = _.map(base[Stats.BE], (item) =>
          item.source === 'Talia: Kingdom of Banditry'
            ? {
                ...item,
                value: item.value + 0.2,
              }
            : item
        )
      return base
    },
    desc: [
      `Increases the wearer's Break Effect by <span class="text-desc">16%</span>. When the wearer's SPD reaches <span class="text-desc">145</span> or higher, the wearer's Break Effect increases by an extra <span class="text-desc">20%</span>.`,
    ],
    set: [`Talia's Nailscrap Town`, `Talia's Exposed Electric Wire`],
  },
  {
    id: '308',
    name: 'Sprightly Vonwacq',
    icon: '71019',
    bonus: [{ stat: Stats.ERR, value: 0.05 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's Energy Regeneration Rate by <span class="text-desc">5%</span>. When the wearer's SPD reaches <span class="text-desc">120</span> or higher, the wearer's action is <u>Advanced Forward</u> by <span class="text-desc">40%</span> immediately upon entering battle.`,
    ],
    set: [`Vonwacq's Island of Birth`, `Vonwacq's Islandic Coast`],
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
      `Increases the wearer's CRIT Rate by <span class="text-desc">8%</span>. When the wearer's current CRIT Rate reaches <span class="text-desc">70%</span> or higher, DMG dealt by Basic ATK and Skill increases by <span class="text-desc">20%</span>.`,
    ],
    set: [`Taikiyan Laser Stadium`, `Taikiyan's Arclight Race Track`],
  },
  {
    id: '310',
    name: 'Broken Keel',
    icon: '71023',
    bonus: [{ stat: Stats.E_RES, value: 0.1 }],
    bonusAdd: [],
    half: (base) => {
      base.CALLBACK.push((x: StatsObject, _d, _w, all) => {
        if (x.getValue(Stats.E_RES) >= 0.3)
          _.forEach(all, (item) => {
            item[Stats.CRIT_DMG].push({
              name: 'Broken Keel',
              source: x.NAME === item.NAME ? 'Self' : x.NAME,
              value: 0.1,
            })
          })
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's Effect RES by <span class="text-desc">10%</span>. When the wearer's Effect RES is at <span class="text-desc">30%</span> or higher, all Party targets' CRIT DMG increases by <span class="text-desc">10%</span>.`,
    ],
    set: [`Insumousu's Whalefall Ship`, `Insumousu's Frayed Hawser`],
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
    set: [`Glamoth's Iron Cavalry Regiment`, `Glamoth's Silent Tombstone`],
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
          if (item.ELEMENT === x.ELEMENT && x.NAME !== item.NAME)
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
      `Increases wearer's Energy Regeneration Rate by <span class="text-desc">5%</span>. Increases DMG by <span class="text-desc">10%</span> for all other Party targets that are of the same Type as the wearer.`,
    ],
    set: [`Penacony's Grand Hotel`, `Penacony's Dream-Seeking Tracks`],
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
    set: [`Sigonia's Gaiathra Berth`, `Sigonia's Knot of Cyclicality`],
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
    set: [`Izumo's Magatsu no Morokami`, `Izumo's Blades of Origin and End`],
  },
  {
    id: '315',
    name: 'Duran, Dynasty of Running Wolves',
    icon: '71034',
    bonus: [],
    bonusAdd: [],
    desc: [
      `When an ally character uses a <u>Follow-Up ATK</u>, the wearer receives <span class="text-desc">1</span> stack of <b>Merit</b>, stacking up to <span class="text-desc">5</span> times. Each stack of <b>Merit</b> increases the DMG dealt by the wearer's <u>Follow-Up ATKs</u> by <span class="text-desc">5%</span>. When there are <span class="text-desc">5</span> stacks, additionally increases the wearer's CRIT DMG by <span class="text-desc">25%</span>.`,
    ],
    set: [`Duran's Tent of Golden Sky`, `Duran's Mechabeast Bridle`],
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
    set: [`Forge's Lotus Lantern Wick`, `Forge's Heavenly Flamewheel Silk`],
  },
  {
    id: '317',
    name: 'Lushaka, the Sunken Seas',
    icon: '71036',
    bonus: [{ stat: Stats.ERR, value: 0.05 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's Energy Regeneration Rate by <span class="text-desc">5%</span>. If the wearer is not the first character in the team lineup, then increases the ATK of the first character in the team lineup by <span class="text-desc">12%</span>.`,
    ],
    half: (base, all) => {
      const index = _.findIndex(all, (item) => item.NAME === base.NAME)
      if (index !== 0) {
        all[0][Stats.P_ATK].push({
          name: `Lushaka, the Sunken Seas`,
          source: base.NAME,
          value: 0.12,
        })
      }
      return base
    },
    beta: false,
    set: [`Lushaka's Waterscape`, `Lushaka's Twinlanes`],
  },
  {
    id: '318',
    name: 'The Wondrous BananAmusement Park',
    icon: '71037',
    bonus: [{ stat: Stats.CRIT_DMG, value: 0.16 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's CRIT DMG by <span class="text-desc">16%</span>. When a target summoned by the wearer is on the field, CRIT DMG additionally increases by <span class="text-desc">32%</span>.`,
    ],
    beta: false,
    set: [`BananAmusement Park's BananAxis Plaza`, `BananAmusement Park's Memetic Cables`],
  },
  {
    id: '319',
    name: `Bone Collection's Serene Demesne`,
    icon: '71042',
    bonus: [{ stat: Stats.P_HP, value: 0.12 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's Max HP by <span class="text-desc">12%</span>. When the wearer's Max HP is <span class="text-desc">5,000</span> or higher, increases the wearer's and their memosprite's CRIT DMG by <span class="text-desc">28%</span>.`,
    ],
    half: (base, all) => {
      base.CALLBACK.push(function P999(x) {
        if (x.getHP() > 5000) {
          base[Stats.CRIT_DMG].push({
            name: '2-Piece',
            source: `Bone Collection's Serene Demesne`,
            value: 0.28,
          })
          if (base.SUMMON_STATS) {
            base.SUMMON_STATS[Stats.CRIT_DMG].push({
              name: '2-Piece',
              source: `Bone Collection's Serene Demesne`,
              value: 0.28,
            })
          }
        }
        return x
      })
      return base
    },
    beta: false,
    set: [`Aidonia's Deceased Gravestones`, `Aidonia's Deathward Bone Chains`],
  },
  {
    id: '320',
    name: 'Giant Tree of Rapt Brooding',
    icon: '71043',
    bonus: [{ stat: Stats.P_SPD, value: 0.06 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's SPD by <span class="text-desc">6%</span>. When the wearer's SPD is <span class="text-desc">130/180</span> or higher, the wearer and their memosprite's Outgoing Healing increases by <span class="text-desc">12%/20%</span>.`,
    ],
    half: (base) => {
      base.CALLBACK.push((x) => {
        if (x.getSpd() >= 130) {
          x[Stats.HEAL].push({
            name: '2-Piece',
            source: 'Giant Tree of Rapt Brooding',
            value: x.getSpd() >= 180 ? 0.2 : 0.12,
          })
          if (x.SUMMON_STATS) {
            x.SUMMON_STATS[Stats.HEAL].push({
              name: '2-Piece',
              source: 'Giant Tree of Rapt Brooding',
              value: x.getSpd() >= 180 ? 0.2 : 0.12,
            })
          }
        }
        return x
      })
      return base
    },
    beta: false,
    set: [`Grove of Epiphany's Pondering Colossus`, `Grove of Epiphany's Interwoven Veins`],
  },
  {
    id: '321',
    name: 'Arcadia of Woven Dreams',
    icon: '71046',
    bonus: [],
    bonusAdd: [],
    desc: [
      `When the number of allied targets on the field is not equal to <span class="text-desc">4</span>, for every <span class="text-desc">1</span> additional/missing ally target, increases the DMG dealt by the wearer and their memosprite by <span class="text-desc">9%</span>/<span class="text-desc">12%</span>, stacking up to <span class="text-desc">4</span>/<span class="text-desc">3</span> time(s).`,
    ],
    beta: false,
    set: [`Membrance Maze's Serene Treehouse`, `Membrance Maze's Wishing Whistle`],
  },
  {
    id: '322',
    name: 'Revelry by the Sea',
    icon: '71047',
    bonus: [{ stat: Stats.P_ATK, value: 0.12 }],
    bonusAdd: [],
    half: (base) => {
      base.CALLBACK.push((x) => {
        x.DOT_DMG.push({
          name: '2-Piece',
          source: 'Revelry by the Sea',
          value: x.getAtk() >= 3600 ? 0.24 : x.getAtk() >= 2400 ? 0.12 : 0,
        })
        return x
      })
      return base
    },
    desc: [
      `Increases the wearer's ATK by <span class="text-desc">12%</span>. When the wearer's ATK is higher than or equal to <span class="text-desc">2,400</span>/<span class="text-desc">3,600</span>, increases the DoT DMG dealt by <span class="text-desc">12%</span>/<span class="text-desc">24%</span> respectively.`,
    ],
    beta: false,
    set: [`Warbling Shores' Blazing Beacon`, `Warbling Shores' Cantillation Trail`],
  },
  {
    id: '323',
    name: 'Amphoreus, The Eternal Land',
    icon: '71050',
    bonus: [{ stat: Stats.CRIT_RATE, value: 0.08 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's CRIT Rate by <span class="text-desc">8%</span>. While the wearer's memosprite is on the field, increases all allies' SPD by <span class="text-desc">8%</span>. This effect cannot be stacked.`,
    ],
    beta: false,
    set: [`West Wind's End of Amphoreus`, `Eternal Verses of Amphoreus`],
  },
  {
    id: '324',
    name: 'Tengoku @Live Stream',
    icon: '71051',
    bonus: [{ stat: Stats.CRIT_DMG, value: 0.16 }],
    bonusAdd: [],
    desc: [
      `Increases the wearer's CRIT DMG by <span class="text-desc">16%</span>. If <span class="text-desc">3</span> or more Skill Points are consumed in the same turn, additionally increases the wearer's CRIT DMG by <span class="text-desc">32%</span> for <span class="text-desc">3</span> turns.`,
    ],
    beta: false,
    set: [`Livestream's Myriad Facades`, `Livestream's Continuous Chatter`],
  },
]

export const AllRelicSets = _.concat(RelicSets, PlanarSets)
