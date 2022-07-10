import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { isAuthenticated, loginStateStore, userStore } from '@/store/auth.store'
import { useCallback, useEffect, useMemo } from 'react'
import { ErrorResponse, LoginState, Credentials, User } from '@/types'

export let globalIsLoggedIn = false

const TOKEN_CHECK_INTERVAL = 60000

export const useAuth = (isSingletonMaster: boolean = false) => {
  const isLoggedIn = useRecoilValue(isAuthenticated)
  const setLoginState = useSetRecoilState(loginStateStore)
  const [user, setUser] = useRecoilState(userStore)

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

  const logout = useCallback(() => {
    setLoginState(LoginState.NeedLogin)
    localStorage.removeItem('user')
    return true
  }, [])

  return {
    logout,
    user,
    setUser,
    authenticated: isLoggedIn,
  }
}
