import { atom } from 'recoil'

export const cacheStore = atom<Record<string, any>>({
  key: 'cache-profile',
  default: {},
})
