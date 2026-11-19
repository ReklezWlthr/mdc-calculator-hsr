import { ElementIcons, NANOKA, PathMap, PathType } from '@src/domain/constant'

export const getEmote = (emote: string) => `https://cdn.wanderer.moe/honkai-star-rail/emotes/${emote}.png`

export const getElementImage = (value: string) => `${NANOKA}/element/${ElementIcons[value]}`

export const getPathImage = (value: PathType) => `${NANOKA}/pathicon/${PathMap[value]}`
