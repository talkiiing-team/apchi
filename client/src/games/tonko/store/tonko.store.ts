import { TonkoClientState } from '@apchi/games/src/tonko/client/clientState'
import { atom } from 'recoil'

export const gameStateStore = atom<TonkoClientState | undefined>({
  key: 'gameStateStore',
  default: undefined,
})
