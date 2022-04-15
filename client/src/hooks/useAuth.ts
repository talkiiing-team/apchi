import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  isAuthenticated,
  loginStateStore,
  userIdStore,
  userStore,
} from '@/store/auth.store'
import { useCallback, useEffect, useMemo } from 'react'
import { app } from '@/services'
import {
  ErrorResponse,
  LoginState,
  Credentials,
  User,
  UserWithRequiredId,
} from '@/types'

export let globalIsLoggedIn = false

const TOKEN_CHECK_INTERVAL = 60000

export const useAuth = (isSingletonMaster: boolean = false) => {
  const isLoggedIn = useRecoilValue(isAuthenticated)
  const setLoginState = useSetRecoilState(loginStateStore)
  const [user, setUser] = useRecoilState(userStore)
  const userId = useRecoilValue(userIdStore)

  const setUserId = useCallback(
    (newId: User['userId']) => setUser(user => ({ ...user, userId: newId })),
    [],
  )

  useEffect(() => {
    if (isSingletonMaster) {
      globalIsLoggedIn = isLoggedIn
    }
  }, [isLoggedIn])

  /*useEffect(() => {
    if (isSingletonMaster) {
      const user = JSON.parse(localStorage.getItem('user') || 'false')
      if (user) {
        setAuthCredentials({ accessToken: token, user: user })
      }
    }
  }, [])*/

  /*useInterval(() => {
    if (isSingletonMaster) {
      verifyToken();
    }
  }, TOKEN_CHECK_INTERVAL);*/

  const register = useCallback(
    (data: Omit<User & Credentials, 'userId'>) =>
      app.register({ ...data, userId }).then(r => {
        localStorage.setItem('user', JSON.stringify(r))
        setUser(r as UserWithRequiredId)
        setLoginState(LoginState.Authenticated)
        return r
      }),
    [],
  )

  const login = useCallback(
    (data: Omit<Credentials, 'userId'>) =>
      app
        .authenticate({ ...data, userId })
        .then(r => {
          localStorage.setItem('user', JSON.stringify(r))
          setUser(r as UserWithRequiredId)
          setLoginState(LoginState.Authenticated)
          return r
        })
        .catch((e: ErrorResponse) => {
          setLoginState(
            e.code === 400 ? LoginState.NeedRegister : LoginState.NeedLogin,
          )
          // Show login page (potentially with `e.message`)
          console.error('Authentication error', e)
          throw e
        }),
    [],
  )

  const logout = useCallback(() => {
    setLoginState(LoginState.NeedLogin)
    localStorage.removeItem('user')
    return true
  }, [])

  return {
    register,
    login,
    logout,
    user,
    setUser,
    userId,
    setUserId,
    authenticated: isLoggedIn,
  }
}
