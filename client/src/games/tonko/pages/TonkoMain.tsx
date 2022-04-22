import { useRecoilState } from 'recoil'
import { inGameStateStore } from '@/store/game.store'
import { gameStateStore } from '../store/tonko.store'
import { useCallback } from 'react'
import { withApp } from '@/hoc/withApp'

export const TonkoMain = withApp(({ app }) => {
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

  return (
    <div className='flex grow flex-col space-y-2 px-2 py-3'>
      <h2 className='px-1 text-lg font-bold' onClick={leaveGame}>
        Welcome to the GameZone
      </h2>
      <div className='grow bg-teal-600'>dfh</div>
    </div>
  )
})
