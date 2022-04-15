import { atom } from 'recoil'
import { DetailedRoom } from '@apchi/shared'

export const roomCurrentStore = atom<DetailedRoom | undefined>({
  key: 'roomCurrentStore',
  default: undefined,
})

export const inGameStateStore = atom<boolean>({
  key: 'inGameStateStore',
  default: false,
})
