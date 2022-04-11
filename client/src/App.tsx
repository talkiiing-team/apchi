import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '@/ui/Navbar'
import { useRecoilValue } from 'recoil'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ReactComponent as Logo } from '@/assets/logo.svg'
import {
  AppRoot,
  Panel,
  PanelHeader,
  SplitCol,
  SplitLayout,
  useAdaptivity,
  View,
  ViewWidth,
} from '@vkontakte/vkui'
import { loginStateStore } from '@/store/auth.store'
import { LoginState } from '@/types'

const App = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, authenticated } = useAuth(true)
  const loginState = useRecoilValue(loginStateStore)

  const { viewWidth } = useAdaptivity()

  useEffect(() => {
    console.log('auth', authenticated)
  }, [authenticated])

  useEffect(() => {
    if (!authenticated) {
      if (location.pathname.split('/')[1] !== 'auth') {
        navigate('/auth')
      }
    } else {
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

  return (
    <AppRoot>
      <SplitLayout header={<PanelHeader separator={false} />}>
        <SplitCol spaced={viewWidth > ViewWidth.MOBILE}>
          <View activePanel='main' className='h-full'>
            <Panel id='main' className='h-full'>
              <PanelHeader>
                <Logo className='text-violet-500 h-8 translate-y-0.5' />
              </PanelHeader>
              <div className='w-full h-full flex flex-col overflow-x-hidden flex-grow'>
                <div className='w-full mx-auto flex flex-col space-y-2 p-3 max-w-lg'>
                  <Outlet />
                </div>
                <Navbar />
              </div>
            </Panel>
          </View>
        </SplitCol>
      </SplitLayout>
    </AppRoot>
  )
}

export default App
