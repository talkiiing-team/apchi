import { atom } from 'recoil'

export const paramsStore = atom<
  Record<
    | 'vk_user_id'
    | 'vk_profile_id'
    | 'vk_has_profile_button'
    | 'vk_profile_button_forbidden'
    | string,
    string
  >
>({
  key: 'params-store',
  default: {},
})
