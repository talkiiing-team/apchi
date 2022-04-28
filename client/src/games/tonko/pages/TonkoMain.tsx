import { useRecoilState } from 'recoil'
import { inGameStateStore } from '@/store/game.store'
import { gameStateStore } from '../store/tonko.store'
import { useCallback, useEffect, useMemo } from 'react'
import { withApp } from '@/hoc/withApp'
import { Stage, TonkoGameEvent } from '@apchi/games/src/tonko'
import { StageController } from '@/games/tonko/components/StageController'
import { TonkoClientState } from '@apchi/games/src/tonko/client'
import { Punching } from '@/games/tonko/pages/Punching'
import { Room } from '@apchi/shared'
import { Starting } from '@/games/tonko/pages/Starting'
import { Voting } from '@/games/tonko/pages/Voting'
import { Overviewing } from '@/games/tonko/pages/Overviewing'

const Awaiting = () => <div>Секунду, загрузка продолжается...</div>

export const TonkoMain = withApp<{ roomId: Room['id'] }>(({ app, roomId }) => {
  const [gameState, setGameState] = useRecoilState(gameStateStore)
  const [inGameState, setInGameState] = useRecoilState(inGameStateStore)

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
    const offGameSelect = app.on<TonkoGameEvent>(
      '@game/receivePunchesToAnswer',
      ({ jokes }: { jokes: TonkoClientState['jokes'] }) => {
        console.log('new jokes', jokes)
        setGameState(state => ({ ...state!, jokes: jokes }))
      },
    )
    return () => {
      offGameSelect()
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
    if (gameState.stage === Stage.Punching) {
      return Punching
    }
    if (gameState.stage === Stage.Voting) {
      return Voting
    }
    if (gameState.stage === Stage.Overviewing) {
      return Overviewing
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
