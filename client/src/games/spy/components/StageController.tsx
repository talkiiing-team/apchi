import { useRecoilState } from 'recoil'

import { gameStateStore, timeStore } from '../store/spy.store'
import { useCallback, useEffect, useMemo } from 'react'
import { withApp } from '@/hoc/withApp'
import { SpyClientState } from '@apchi/games/src/spy/client'
import { GameClock } from '../components/GameClock'
import { Stage, SpyGameEvent } from '@apchi/games/src/spy'

const gameStageDict: Record<Stage, string> = {
  [Stage.Off]: 'Неактивно',
  [Stage.Launch]: 'Запуск...',
  [Stage.Starting]: 'Игра в шпиона!',
  [Stage.GameSetup]: 'Настройки',
  [Stage.Giveaway]: 'Знакомство с ролью',
  [Stage.Vote]: 'Голосуйте!',
  [Stage.Results]: 'Результаты',
}

export const StageController = withApp(({ app }) => {
  const [gameState, setGameState] = useRecoilState(gameStateStore)

  useEffect(() => {
    const offStageChange = app.on<SpyGameEvent>(
      '@game/stageChange',
      ({ stage }: { stage: SpyClientState['stage'] }) => {
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
