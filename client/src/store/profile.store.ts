import { atom } from 'recoil'

export const profileStore = atom<
  Partial<
    Record<string, any> & {
      first_name: string
      last_name: string
      id: number
      photo_100: string
    }
  >
>({
  key: 'profileDataStore',
  default: {},
})
