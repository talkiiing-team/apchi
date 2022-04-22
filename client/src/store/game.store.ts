import { atom } from 'recoil'

export const inGameStateStore = atom<boolean>({
  key: 'inGameStateStore',
  default: false,
})
