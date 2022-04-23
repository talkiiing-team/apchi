import { useEffect, useMemo } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { inRoomStateStore, roomCurrentStore } from '@/store/room.store'
import { inGameStateStore } from '@/store/game.store'
import { userIdStore } from '@/store/auth.store'
import { GameView } from '@/components/GameView'
import { CubeTransparentIcon } from '@heroicons/react/outline'
import { useNavigate } from 'react-router-dom'

export const InGameRoute = () => {
  const [inRoomState, setInRoomState] = useRecoilState(inRoomStateStore)
  const [inGameState, setInGameState] = useRecoilState(inGameStateStore)
  const room = useRecoilValue(roomCurrentStore)
  const userId = useRecoilValue(userIdStore)
  const navigate = useNavigate()

  useEffect(() => {
    if (!inGameState || !inRoomState) {
      navigate('/')
    }
  }, [inGameState, inRoomState])

  const memoizedChild = useMemo(
    () =>
      inGameState && room?.game ? (
        <div className='flex h-full w-full grow flex-col overflow-x-hidden overflow-y-hidden'>
          <GameView gameId={room?.game} roomId={room.id} />
        </div>
      ) : (
        <div className='flex h-full w-full grow flex-col items-center justify-center'>
          <CubeTransparentIcon className='h-12 w-12 animate-bounce stroke-1 text-zinc-500' />
        </div>
      ),
    [],
  )

  return memoizedChild
}
