import { Outlet } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  accessTokenStore,
  loginStateStore,
  tokenStateStore,
} from '@/store/auth.store'
import { withApp } from '@/hoc/withApp'
import { paramsStore } from '@/store/params.store'
import { extractInitParams } from '@/utils/extractInitParams'
import { authenticateVKParams } from '@/utils/authenticateVKParams'
import { LoginState } from '@/types'
import bridge, { VKBridgeSubscribeHandler } from '@vkontakte/vk-bridge'
import { profileStore } from '@/store/profile.store'
import { userGarbageStore } from '@/store/cache.store'

const Wrapper = withApp(({ app }) => {
  const {
    authenticated,
    setUser,
    user: { id: userId },
  } = useAuth(true)
  const [loginState, setLoginState] = useRecoilState(loginStateStore)
  const [tokenState, setTokenState] = useRecoilState(tokenStateStore)
  const [garbageState, setGarbageState] = useRecoilState(userGarbageStore)
  const [accessToken, setAccessToken] = useRecoilState(accessTokenStore)
  const [profileState, setProfileState] = useRecoilState(profileStore)

  const [params, setParams] = useRecoilState(paramsStore)

  useEffect(() => {
    const listener: VKBridgeSubscribeHandler = ({ detail: event }) => {
      if (event.type === 'VKWebAppAccessTokenReceived') {
        setAccessToken(event.data.access_token)
        setTokenState(true)
      } else if (event.type === 'VKWebAppCallAPIMethodResult') {
        if (event.data.request_id === 'getProfile') {
          setProfileState(event.data.response[0])
          console.log('profile state aws updated', event.data.response[0])
        }
        if (event.data.request_id === 'getGarbage') {
          console.log('garbage comes')
          setGarbageState(list =>
            event.data.response.reduce((a, v) => {
              if (a[v.id]) return a
              return { ...a, [v.id]: v }
            }, list),
          )
          console.log('newUserInfos', event.data.response)
        }
      } else if (event.type === 'VKWebAppAddToProfileResult') {
        setParams(params => ({ ...params, vk_has_profile_button: 'true' }))
      }
    }
    bridge.subscribe(listener)
    bridge.send('VKWebAppGetAuthToken', {
      app_id: parseInt(import.meta.env.VITE_APP_ID),
      scope: 'friends',
    })
    return () => {
      bridge.unsubscribe(listener)
    }
  }, [])

  useEffect(() => {
    const initParams = extractInitParams(location.search)
    console.log(initParams)
    setParams(initParams)
  }, [])

  useEffect(() => {
    console.log(params)
    if (Object.keys(params).length && !params.vk_profile_id) {
      setParams(params => ({ ...params, vk_profile_id: params.vk_user_id }))
    }
  }, [params])

  useEffect(() => {
    if (!authenticated && authenticateVKParams(location.search)) {
      console.log('validated!')
      setLoginState(LoginState.Authenticated)
    }
  }, [authenticated, params])

  useEffect(() => {
    bridge.send('VKWebAppGetUserInfo').then(res => setUser(res))
  }, [authenticated])

  useEffect(() => {
    if (tokenState && params.vk_profile_id) {
      bridge.send('VKWebAppCallAPIMethod', {
        method: 'users.get',
        request_id: 'getProfile',
        params: {
          user_ids: params.vk_profile_id,
          v: '5.101',
          access_token: accessToken,
          fields: 'photo_100',
        },
      })
    }
  }, [tokenState, params, accessToken])

  return tokenState ? <Outlet /> : null
})

export default Wrapper
