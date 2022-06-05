import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SpyGameEvent } from '@apchi/games/src/spy'
import { withApp } from '@/hoc/withApp'
import { Room, User } from '@apchi/shared'
import { useRecoilState, useRecoilValue } from 'recoil'
import { userStore } from '@/games/spy/store/spy.store'

export const Vote = withApp<{ roomId: Room['id'] }>(({ app, roomId }) => {
  const usersMap = useRecoilValue(userStore)

  const voteFor = useCallback((userId: User['userId']) => {
    app.service('game').call('do', roomId, 'vote', userId)
  }, [])

  return (
    <div className='flex h-full w-full flex-col items-center justify-items-stretch space-y-2'>
      <div className='flex w-full flex-col'>
        <span className='w-full text-center text-sm'>
          Готовы проголосовать?
        </span>
      </div>
      <div className='grid w-full grid-cols-2 space-x-3 space-y-3'>
        {Object.values(usersMap).map(user => {
          return (
            <div
              className='cursor-pointer select-none rounded-xl border border-gray-300 bg-gray-50 py-3 px-4 hover:bg-gray-100'
              onClick={() => voteFor(user.userId)}
            >
              {user.name}
            </div>
          )
        })}
      </div>
    </div>
  )
})
