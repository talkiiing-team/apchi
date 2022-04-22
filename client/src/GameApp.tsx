import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '@/ui/Navbar'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useCallback, useEffect, useMemo } from 'react'
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
import { withApp } from '@/hoc/withApp'
import { NotifyRoot } from '@/components/NotifyRoot'
import { inGameStateStore } from '@/store/game.store'
import { ChevronLeftIcon } from '@heroicons/react/outline'

const App = withApp(({ app }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, authenticated } = useAuth(true)
  const loginState = useRecoilValue(loginStateStore)
  const [inGameState, setInGameState] = useRecoilState(inGameStateStore)

  const { viewWidth } = useAdaptivity()

  const leaveGame = useCallback(
    () =>
      app
        .service('rooms')
        .call('leave')
        .then(r => {
          setInGameState(false)
        }),
    [],
  )

  useEffect(() => {
    console.log('auth', authenticated)
    const globalUnSubscriber = () => {
      leaveGame().then(r => console.log('left room in cause of session end'))
    }
    window.addEventListener('close', globalUnSubscriber)
    return globalUnSubscriber
  }, [authenticated])

  const leaveGameButton = useMemo(
    () => (
      <div className='flex items-center space-x-1' onClick={leaveGame}>
        <ChevronLeftIcon className='h-6 w-6 text-current' />
        <span>Выйти</span>
      </div>
    ),
    [],
  )

  return (
    <AppRoot>
      <SplitLayout header={<PanelHeader separator={false} />}>
        <SplitCol spaced={viewWidth > ViewWidth.MOBILE}>
          <View activePanel='main' className='h-full'>
            <Panel id='main' className='h-full'>
              <PanelHeader left={leaveGameButton}>
                <Logo className='h-8 translate-y-0.5 text-violet-500' />
              </PanelHeader>
              <Outlet />
            </Panel>
          </View>
        </SplitCol>
      </SplitLayout>
    </AppRoot>
  )
})

export default App
