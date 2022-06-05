import { useRecoilState, useRecoilValue } from 'recoil'
import { inGameStateStore } from '@/store/game.store'
import { gameStateStore, userStore as spyUserStore } from '../store/spy.store'
import { useCallback, useEffect, useMemo } from 'react'
import { withApp } from '@/hoc/withApp'
import { Stage, SpyGameEvent, Role, Location } from '@apchi/games/src/spy'
import { StageController } from '../components/StageController'
import { Room, User } from '@apchi/shared'
import { Starting } from './Starting'
import { Giveaway } from '@/games/spy/pages/Giveaway'
import { Vote } from '@/games/spy/pages/Vote'
import { Results } from '@/games/spy/pages/Results'
import { userStore } from '@/store/auth.store'
import { GuessLocation } from '@/games/spy/pages/GuessLocation'
import { Setup } from '@/games/spy/pages/Setup'

const Awaiting = () => <div>Секунду, загрузка продолжается...</div>

export const SpyMain = withApp<{ roomId: Room['id'] }>(({ app, roomId }) => {
  const [gameState, setGameState] = useRecoilState(gameStateStore)
  const [inGameState, setInGameState] = useRecoilState(inGameStateStore)
  const [usersMap, setUsersMap] = useRecoilState(spyUserStore)
  const user = useRecoilValue(userStore)

  const leaveGame = useCallback(() => {
    app
      .service('rooms')
      .call('leave')
      .then(r => {
        setInGameState(false)
        setGameState(undefined)
      })
  }, [])

  useEffect(() => {
    const offReceiveCard = app.on<SpyGameEvent>(
      '@game/receiveCard',
      ({
        role,
        location,
        locations,
      }: {
        role: Role
        location?: Location
        locations?: Location[]
      }) => {
        console.log('new data', role, location, locations)
        setGameState(state => ({
          ...state!,
          role: role,
          location: location,
          locations: locations,
        }))
      },
    )
    const offUsersPresentation = app.on<SpyGameEvent>(
      '@game/usersPresentation',
      ({ users }: { users: User[] }) => {
        console.log('new user present', users)
        setUsersMap(users.reduce((a, v) => ({ ...a, [v.userId]: v }), {}))
      },
    )
    return () => {
      offReceiveCard()
      offUsersPresentation()
      leaveGame()
    }
  }, [])

  useEffect(() => {
    console.log('if not ', gameState, 'we will get data')
    if (!gameState) {
      console.log('getting state')
      app
        .service('game')
        .call('getState', roomId)
        .then(r => {
          console.log(r)
          setGameState(state => (state ? { ...state, ...r } : r))
        })
    }
  }, [])

  const logState = useCallback(() => {
    console.log(gameState)
  }, [gameState])

  const ActualComponent = useMemo(() => {
    if (!gameState?.stage) {
      return Awaiting
    }
    if (gameState.stage === Stage.Starting) {
      return Starting
    }
    if (gameState.stage === Stage.GameSetup) {
      return Setup
    }
    if (gameState.stage === Stage.Giveaway) {
      return Giveaway
    }
    if (gameState.stage === Stage.Vote) {
      if (gameState.role === Role.Normal) {
        return Vote
      } else {
        return GuessLocation
      }
    }
    if (gameState.stage === Stage.Results) {
      return Results
    }
    return () => null
  }, [gameState?.stage])

  return (
    <div className='flex grow basis-0 flex-col space-y-3 px-2 py-3'>
      <StageController />
      <div className='grow'>
        <ActualComponent roomId={roomId} />
      </div>
      <div
        className='w-full bg-violet-100 py-2 text-center text-xs text-blue-400'
        onClick={logState}
      >
        Log State
      </div>
    </div>
  )
})
