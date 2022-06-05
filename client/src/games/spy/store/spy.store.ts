import { SpyClientState } from '@apchi/games/src/spy/client/clientState'
import { atom } from 'recoil'
import { User } from '@apchi/shared'

export const gameStateStore = atom<SpyClientState | undefined>({
  key: 'gameStateStore_spy',
  default: undefined,
})

export const timeStore = atom<{ timeStamp: number; left: number } | undefined>({
  key: 'timeStore_spy',
  default: undefined,
})

export const userStore = atom<Record<User['userId'], User>>({
  key: 'userStore_spy',
  default: {},
})
