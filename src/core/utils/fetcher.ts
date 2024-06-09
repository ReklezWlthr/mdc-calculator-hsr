import { Element, PathMap, PathType } from '@src/domain/constant'

export const getEmote = (emote: string) => `https://cdn.wanderer.moe/genshin-impact/emotes/${emote}.png`

export const getElementImage = (value: string) =>
  `https://api.hakush.in/hsr/UI/element/${value === Element.LIGHTNING ? 'thunder' : value?.toLowerCase()}.webp`

export const getPathImage = (value: PathType) => `https://api.hakush.in/hsr/UI/pathicon${PathMap[value]}`
