import { Outlet, useNavigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { loginStateStore } from '@/store/auth.store'
import { LoginState } from '@/types'
import { withApp } from '@/hoc/withApp'
import bridge from '@vkontakte/vk-bridge'

const Wrapper = withApp(({ app }) => {
  const { authenticated } = useAuth(true)
  const loginState = useRecoilValue(loginStateStore)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('auth', authenticated)
    const globalUnSubscriber = () => {
      app
        .service('rooms')
        .call('leave')
        .then(r => console.log('left room in cause of session end'))
    }
    window.addEventListener('close', globalUnSubscriber)
    return globalUnSubscriber
  }, [authenticated])

  useEffect(() => {
    if (!authenticated) {
      if (location.pathname.split('/')[1] !== 'auth') {
        navigate('/auth')
      }
    }
  }, [location.pathname, authenticated])

  useEffect(() => {
    if (loginState === LoginState.NeedRegister) {
      navigate('/auth/register')
    } else if (loginState === LoginState.NeedLogin) {
      navigate('/auth')
    } else if (loginState === LoginState.Authenticated) {
      navigate('/')
    }
  }, [loginState])

  return <Outlet />
})

export default Wrapper
