import { Element, IArtifact, Stats } from '@src/domain/constant'
import { StatsObject } from '../../baseConstant'
import _ from 'lodash'
import { IContent } from '@src/domain/conditional'
import { findContentById } from '@src/core/utils/finder'

export const ArtifactForm = () => {
  const content: IContent[] = [
    {
      type: 'toggle',
      text: `Hunter of Glacial Forest`,
      title: `Hunter of Glacial Forest`,
      content: `After the wearer uses their Ultimate, their CRIT DMG increases by <span class="text-desc">25%</span> for <span class="text-desc">2</span> turn(s).`,
      show: true,
      default: true,
      duration: 2,
      id: '104',
    },
    {
      type: 'number',
      text: `Champion of Streetwise Boxing`,
      title: `Champion of Streetwise Boxing`,
      content: `After the wearer attacks or is hit, their ATK increases by <span class="text-desc">5%</span> for the rest of the battle. This effect can stack up to <span class="text-desc">5</span> time(s).`,
      show: true,
      default: 0,
      min: 0,
      max: 5,
      duration: 2,
      id: '105',
    },
    {
      type: 'toggle',
      text: `Firesmith of Lava-Forging`,
      title: `Firesmith of Lava-Forging`,
      content: `Increases the wearer's Skill DMG by <span class="text-desc">12%</span>. After unleashing Ultimate, increases the wearer's <b class="text-hsr-fire">Fire DMG</b> by <span class="text-desc">12%</span> for the next attack.`,
      show: true,
      default: true,
      id: '107',
    },
    {
      type: 'toggle',
      text: `Band of Sizzling Thunder`,
      title: `Band of Sizzling Thunder`,
      content: `When the wearer uses their Skill, increases the wearer's ATK by <span class="text-desc">20%</span> for <span class="text-desc">1</span> turn(s).`,
      show: true,
      default: true,
      duration: 1,
      id: '109',
    },
    {
      type: 'number',
      text: `Longevous Disciple`,
      title: `Longevous Disciple`,
      content: `When the wearer is hit or has their HP consumed by an ally or themselves, their CRIT Rate increases by <span class="text-desc">8%</span> for <span class="text-desc">2</span> turn(s) and up to <span class="text-desc">2</span> stacks.`,
      show: true,
      default: 0,
      min: 0,
      max: 2,
      duration: 2,
      id: '113',
    },
    {
      type: 'toggle',
      text: `Messenger Traversing Hackerspace`,
      title: `Messenger Traversing Hackerspace`,
      content: `When the wearer uses their Ultimate on an ally, increases all Party characters' SPD by <span class="text-desc">12%</span> for <span class="text-desc">1</span> turn(s). This effect cannot be stacked.`,
      show: true,
      default: true,
      duration: 1,
      id: '114',
    },
    {
      type: 'number',
      text: `Grand Duke Stacks`,
      title: `Grand Duke Stacks`,
      content: `When the wearer uses <u>follow-up attacks</u>, increases the wearer's ATK by <span class="text-desc">6%</span> for every time the <u>follow-up attack</u> deals DMG. This effect can stack up to <span class="text-desc">8</span> time(s) and lasts for <span class="text-desc">3</span> turn(s). This effect is removed the next time the wearer uses a <u>follow-up attack</u>.`,
      show: true,
      duration: 3,
      default: 0,
      min: 0,
      max: 8,
      id: '115',
    },
    {
      type: 'toggle',
      text: `Pioneer Diver of Dead Waters`,
      title: `Pioneer Diver of Dead Waters`,
      content: `Increases CRIT Rate by <span class="text-desc">4%</span>. The wearer deals <span class="text-desc">8%</span>/<span class="text-desc">12%</span> increased CRIT DMG to enemies with at least <span class="text-desc">2</span>/<span class="text-desc">3</span> debuffs. After the wearer inflicts a debuff on enemy targets, the aforementioned effects increase by <span class="text-desc">100%</span>, lasting for <span class="text-desc">1</span> turn(s).`,
      show: true,
      default: true,
      duration: 1,
      id: '117',
    },
    {
      type: 'toggle',
      text: `Watchmaker, Master of Dream Machinations`,
      title: `Watchmaker, Master of Dream Machinations`,
      content: `When the wearer uses their Ultimate on any Party character, increases all Party characters' Break Effect by <span class="text-desc">30%</span> for <span class="text-desc">2</span> turn(s). This effect cannot be stacked.`,
      show: true,
      default: true,
      duration: 2,
      id: '118',
    },
    {
      type: 'toggle',
      text: `Celestial Differentiator`,
      title: `Celestial Differentiator`,
      content: `Increases the wearer's CRIT DMG by <span class="text-desc">16%</span>. When the wearer's current CRIT DMG reaches <span class="text-desc">120%</span> or higher, after entering battle, the wearer's CRIT Rate increases by <span class="text-desc">60%</span> until the end of their first attack.`,
      show: true,
      default: true,
      id: '305',
    },
    {
      type: 'number',
      text: `Sigonia Stacks`,
      title: `Sigonia Stacks`,
      content: `Increases the wearer's CRIT Rate by <span class="text-desc">4%</span>. When an enemy target gets defeated, the wearer's CRIT DMG increases by <span class="text-desc">4%</span>, stacking up to <span class="text-desc">10</span> time(s).`,
      show: true,
      default: 0,
      min: 0,
      max: 10,
      id: '313',
    },
    {
      type: 'number',
      text: `Merit Stacks`,
      title: `Merit Stacks`,
      content: `When a Party target use <u>follow-up attacks</u>, the wearer receives <span class="text-desc">1</span> stack of <b>Merit</b>, stacking up to <span class="text-desc">5</span> times. Every stack of <b>Merit</b> increases the DMG dealt by the wearer's <u>follow-up attacks</u> by <span class="text-desc">5%</span>. When there are <span class="text-desc">5</span> stacks, additionally increases the wearer's CRIT DMG by <span class="text-desc">25%</span>.`,
      show: true,
      default: 0,
      min: 0,
      max: 5,
      id: '315',
    },
    {
      type: 'toggle',
      text: `Forge of the Kalpagni Lantern`,
      title: `Forge of the Kalpagni Lantern`,
      content: `Increase the wearer's SPD by <span class="text-desc">6%</span>. When the wearer hits enemy targets with <b class="text-hsr-fire">Fire</b> Weakness, the wearer's Break Effect increases by <span class="text-desc">40%</span>, lasting for <span class="text-desc">1</span> turn(s).`,
      show: true,
      default: true,
      id: '316',
    },
    {
      type: 'toggle',
      text: `The Wind-Soaring Valorous`,
      title: `The Wind-Soaring Valorous`,
      content: `Increases the wearer's CRIT Rate by <span class="text-desc">6%</span>. When the wearer uses a <u>follow-up attack</u>, increase the DMG dealt by their Ultimate by <span class="text-desc">36%</span>, lasting for <span class="text-desc">1</span> turn(s).`,
      show: true,
      default: true,
      duration: 1,
      id: '120',
    },
    {
      type: 'toggle',
      text: `Summons On-Field`,
      title: `Summons On-Field`,
      content: `Increases the wearer's CRIT DMG by <span class="text-desc">16%</span>. When a target summoned by the wearer is on the field, CRIT DMG additionally increases by <span class="text-desc">28%</span>.`,
      show: true,
      default: true,
      id: '318',
      excludeSummon: true,
    },
    {
      type: 'toggle',
      text: `Scholar Lost in Erudition`,
      title: `Scholar Lost in Erudition`,
      content: `Increases DMG dealt by Ultimate and Skill by <span class="text-desc">20%</span>. After using Ultimate, additionally increases the DMG dealt by the next Skill by <span class="text-desc">25%</span>.`,
      show: true,
      default: true,
      id: '122',
    },
    {
      type: 'toggle',
      text: `Memosprite On-Field`,
      title: `Memosprite On-Field`,
      content: `While the wearer's memosprite is on the field, increases the wearer's SPD by <span class="text-desc">6%</span>.`,
      show: true,
      default: true,
      id: '123_1',
      excludeSummon: true,
    },
    {
      type: 'toggle',
      text: `Memosprite Attack CRIT DMG Bonus`,
      title: `Memosprite Attack CRIT DMG Bonus`,
      content: `When the wearer's memosprite attacks, increases the wearer and memosprite's CRIT DMG by <span class="text-desc">30%</span> for <span class="text-desc">2</span> turn(s).`,
      show: true,
      default: true,
      id: '123_2',
      excludeSummon: true,
    },
    {
      type: 'toggle',
      text: `Gentle Rain`,
      title: `Gentle Rain`,
      content: `When the wearer and their memosprite provide healing to ally targets aside from themselves, the wearer gains <b>Gentle Rain</b>, which can be triggered up to <span class="text-desc">1</span> time per turn, lasting for <span class="text-desc">2</span> turn(s). While the wearer has <b>Gentle Rain</b>, increases their SPD by <span class="text-desc">6%</span> and all allies' CRIT DMG by <span class="text-desc">15%</span>. This effect cannot be stacked.`,
      show: true,
      default: true,
      id: '125',
      excludeSummon: true,
    },
    {
      type: 'toggle',
      text: `Help`,
      title: `Help`,
      content: `When the wearer becomes the target of another ally target's ability, gains <span class="text-desc">1</span> stack of <b>Help</b>, stacking up to <span class="text-desc">2</span> time(s). If there are <span class="text-desc">2</span> stack(s) of <b>Help</b> when the wearer uses their Ultimate, consumes all <b>Help</b> to increase the wearer's ATK by <span class="text-desc">48%</span>, for <span class="text-desc">1</span> turn(s).`,
      show: true,
      default: true,
      id: '126',
      excludeSummon: true,
    },
    {
      type: 'number',
      text: `On-Field Ally Count`,
      title: `On-Field Ally Count`,
      content: `When the number of ally targets on the field is not <span class="text-desc">4</span>, for every <span class="text-desc">1</span> extra/missing ally target, increases the wearer's and their memosprite's DMG by <span class="text-desc">9%</span>/<span class="text-desc">12%</span>, stacking up to <span class="text-desc">4</span>/<span class="text-desc">3</span> time(s).`,
      show: true,
      default: 4,
      min: 1,
      max: 8,
      id: '321',
      excludeSummon: true,
    },
  ]

  // Team-Wide
  const teamContent: IContent[] = [
    findContentById(content, '114'),
    findContentById(content, '118'),
    findContentById(content, '125'),
  ]

  // Single-Target
  const allyContent: IContent[] = [
    {
      type: 'number',
      text: `Sacerdos' Relived Ordeal`,
      title: `Sacerdos' Relived Ordeal`,
      content: `When using Skill or Ultimate on one ally target, increases the target's CRIT DMG by <span class="text-desc">18%</span>, lasting for <span class="text-desc">2</span> turn(s). This effect can stack up to <span class="text-desc">2</span> time(s).`,
      show: true,
      default: 0,
      min: 0,
      max: 2,
      id: '121',
    },
  ]

  return { content, teamContent, allyContent }
}
