import { atom, DefaultValue, selector, selectorFamily } from 'recoil'
import { LoginState, User, UserWithRequiredId } from '@/types'
import { UserInfo } from '@vkontakte/vk-bridge'

export const userStore = atom<Partial<UserInfo>>({
  key: 'userStateStore',
  default: {},
})

export const accessTokenStore = atom<string>({
  key: 'access-token',
  default: '',
})

export const loginStateStore = atom<LoginState>({
  key: 'loginStateStore',
  default: LoginState.NeedLogin,
})

export const tokenStateStore = atom<boolean>({
  key: 'tokenStateStore',
  default: false,
})

export const isAuthenticated = selector({
  key: 'isAuthenticatedStore',
  get: ({ get }) => {
    return get(loginStateStore) === LoginState.Authenticated
  },
})
