import { atom, DefaultValue, selector, selectorFamily } from 'recoil'
import { LoginState, User } from '@/types'

export const userStore = atom<Partial<User> & Pick<User, 'userId'>>({
  key: 'userStateStore',
  default: { userId: 0 },
})

export const userIdStore = selector<number>({
  key: 'userIdStore',
  get: ({ get }) => {
    return get(userStore).userId
  },
  set: ({ set }, newValue) => {
    set(userStore, store => ({
      ...store,
      userId: newValue instanceof DefaultValue ? 0 : newValue,
    }))
  },
})

export const loginStateStore = atom<LoginState>({
  key: 'loginStateStore',
  default: LoginState.NeedLogin,
})

export const isAuthenticated = selector({
  key: 'isAuthenticatedStore',
  get: ({ get }) => {
    return get(loginStateStore) === LoginState.Authenticated
  },
})

export const isNeedRegister = selector({
  key: 'isNeedRegisterStore',
  get: ({ get }) => {
    return get(loginStateStore) === LoginState.NeedRegister
  },
})
