import { atom, selector } from 'recoil'
import { WallPost } from '@/types'

export const cacheStore = atom<Record<string, any>>({
  key: 'cache-profile',
  default: {},
})

export const wallStore = atom<WallPost[]>({
  key: 'wallStore',
  default: [],
})

export const wallCountSelector = selector<number>({
  key: 'wallStoreCount',
  get: ({ get }) => {
    return get(wallStore).length
  },
})

export const userGarbageStore = atom<
  Record<
    number,
    { id: number; first_name: string; last_name: string; photo_100: string }
  >
>({
  key: 'userGarbageStore',
  default: {},
})
