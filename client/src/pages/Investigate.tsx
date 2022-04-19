import { YourGameWidget } from '@/components/YourGameWidget'
import { GamesList } from '@/components/GamesList'
import { useRecoilState, useRecoilValue } from 'recoil'
import { inGameStateStore, roomCurrentStore } from '@/store/room.store'
import { RoomMembers } from '@/components/RoomMembers'
import { useMemo } from 'react'
import { userIdStore } from '@/store/auth.store'
import { GameSelector } from '@/components/GameSelector'

export const Investigate = () => {
  const [inGameState, setInGameState] = useRecoilState(inGameStateStore)
  const room = useRecoilValue(roomCurrentStore)
  const userId = useRecoilValue(userIdStore)

  const memoizedMembers = useMemo(
    () => (
      <RoomMembers
        members={room?.members}
        owner={room?.owner}
        currentUserId={userId}
      />
    ),
    [userId, room?.members, room?.owner],
  )

  const content = useMemo(
    () =>
      inGameState && room?.members && room.owner ? (
        <>
          <GameSelector />
          {memoizedMembers}
        </>
      ) : (
        <GamesList />
      ),
    [inGameState, memoizedMembers],
  )

  return (
    <div className='w-full h-full flex flex-col items-center justify-start space-y-3'>
      <YourGameWidget />
      {content}
    </div>
  )
}
