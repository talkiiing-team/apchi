import { atom } from 'recoil'
import { Game } from '@apchi/shared'

export const cacheStore = atom<Record<string, any>>({
  key: 'cache-profile',
  default: {},
})

export const availableGamesStore = atom<Game[]>({
  key: 'gamesSelectStore',
  default: [],
})
