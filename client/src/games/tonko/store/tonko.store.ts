import { TonkoClientState } from '@apchi/games/src/tonko/client/clientState'
import { atom } from 'recoil'

export const gameStateStore = atom<TonkoClientState | undefined>({
  key: 'gameStateStore_tonko',
  default: undefined,
})

export const timeStore = atom<{ timeStamp: number; left: number } | undefined>({
  key: 'timeStore_tonko',
  default: undefined,
})
