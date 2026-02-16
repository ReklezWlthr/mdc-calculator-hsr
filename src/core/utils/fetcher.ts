import { Element, PathMap, PathType } from '@src/domain/constant'

export const getEmote = (emote: string) => `https://cdn.wanderer.moe/honkai-star-rail/emotes/${emote}.png`

export const getElementImage = (value: string) => `/asset/element/${value}.webp`

export const getPathImage = (value: PathType) => `/asset/path/${value}.webp`
