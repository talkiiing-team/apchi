import { YourGameWidget } from '@/components/YourGameWidget'
import { GamesList } from '@/components/GamesList'
import { useRecoilState, useRecoilValue } from 'recoil'
import { inRoomStateStore, roomCurrentStore } from '@/store/room.store'
import { RoomMembers } from '@/components/RoomMembers'
import { useMemo } from 'react'
import { userIdStore } from '@/store/auth.store'
import { GameSelector } from '@/components/GameSelector'

export const Investigate = () => {
  const [inRoomState, setInRoomState] = useRecoilState(inRoomStateStore)
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
      inRoomState && room?.members && room.owner ? (
        <>
          <GameSelector />
          {memoizedMembers}
        </>
      ) : (
        <GamesList />
      ),
    [inRoomState, memoizedMembers],
  )

  return (
    <div className='flex h-full w-full flex-col items-center justify-start space-y-3'>
      <YourGameWidget />
      {content}
    </div>
  )
}
