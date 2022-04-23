import { useRecoilState } from 'recoil'

import { gameStateStore } from '../store/tonko.store'
import { useCallback, useEffect } from 'react'
import { withApp } from '@/hoc/withApp'
import { TonkoGameEvent } from '@apchi/games'
import { TonkoClientState } from '@apchi/games/src/tonko/client'

export const StageController = withApp(({ app }) => {
  const [gameState, setGameState] = useRecoilState(gameStateStore)

  useEffect(() => {
    const offStageChange = app.on<TonkoGameEvent>(
      '@game/stageChange',
      ({ stage }: { stage: TonkoClientState['stage'] }) => {
        console.log('new stage', stage)
        setGameState(state => ({ ...state!, stage: stage }))
      },
    )
    return () => {
      offStageChange()
    }
  }, [])

  return (
    <div className='px-1 text-lg font-bold'>
      {gameState?.stage || 'Stage not defined'}
    </div>
  )
})
