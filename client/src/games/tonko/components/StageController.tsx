import { useRecoilState } from 'recoil'

import { gameStateStore, timeStore } from '../store/tonko.store'
import { useCallback, useEffect, useMemo } from 'react'
import { withApp } from '@/hoc/withApp'
import { Stage, TonkoGameEvent } from '@apchi/games'
import { TonkoClientState } from '@apchi/games/src/tonko/client'
import { GameClock } from '../components/GameClock'

const gameStageDict: Record<Stage, string> = {
  off: 'Неактивно',
  starting: 'Начинаем!',
  punching: 'Вводите свои ответы',
  voting: 'Голосуйте!',
  overviewing: 'Вот так вот',
}

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

  const showTimer = useMemo(() => {
    if (!gameState?.stage) return false
    if ([Stage.Off, Stage.Starting].includes(gameState.stage)) return false
    return true
  }, [gameState?.stage])

  return (
    <div className='flex items-center justify-between px-1 text-lg font-bold'>
      <span>
        {gameState?.stage ? gameStageDict[gameState.stage] : 'Ожидание...'}
      </span>
      {showTimer ? <GameClock /> : null}
    </div>
  )
})
