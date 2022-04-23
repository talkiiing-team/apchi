import { useRecoilState } from 'recoil'
import { inGameStateStore } from '@/store/game.store'
import { gameStateStore } from '../store/tonko.store'
import { useCallback, useEffect, useMemo } from 'react'
import { withApp } from '@/hoc/withApp'
import { Stage, TonkoGameEvent } from '@apchi/games'
import { StageController } from '@/games/tonko/components/StageController'
import { TonkoClientState } from '@apchi/games/src/tonko/client'
import { Punching } from '@/games/tonko/pages/Punching'
import { Room } from '@apchi/shared'

const Awaiting = () => <div>Waiting for data</div>

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
    if (!gameState) {
      console.log('getting state')
      app
        .service('game')
        .call('getState', roomId)
        .then(r => {
          console.log(r)
        })
    }
  }, [])

  const ActualComponent = useMemo(() => {
    if (!gameState?.stage) {
      return Awaiting
    }
    if (gameState.stage === Stage.Punching) {
      return Punching
    }
    return () => null
  }, [gameState?.stage])

  return (
    <div className='flex grow flex-col space-y-2 px-2 py-3'>
      <StageController />
      <div className='grow bg-zinc-50'>
        <ActualComponent roomId={roomId} />
      </div>
      <div className='bg-zinc-50'>{JSON.stringify(gameState)}</div>
    </div>
  )
})
