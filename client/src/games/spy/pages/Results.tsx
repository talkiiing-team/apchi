import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Role, SpyGameEvent } from '@apchi/games/src/spy'
import { withApp } from '@/hoc/withApp'
import { Room, User } from '@apchi/shared'

export const Results = withApp<{ roomId: Room['id'] }>(({ app, roomId }) => {
  const [spyes, setSpyes] = useState<(User & { role: Role })[]>([])
  const [win, setWin] = useState<Role | undefined>()

  useEffect(() => {
    const offLeaderboard = app.on<SpyGameEvent>(
      '@game/results',
      ({ spyList, won }: { spyList: (User & { role: Role })[]; won: Role }) => {
        console.log('leaderboard', spyList)
        setSpyes(spyList)
        setWin(won)
      },
    )
    return () => {
      offLeaderboard()
    }
  }, [])

  return (
    <div className='flex h-full w-full flex-col items-center justify-items-stretch space-y-2'>
      <div className='flex w-full flex-col'>
        <span className='w-full text-center text-sm'>
          Победа {win === Role.Spy ? 'Шпионов' : 'Актеров'}
        </span>
      </div>
      <div className='flex w-full flex-col items-center space-y-2'>
        {spyes.length ? (
          <>
            {spyes.map(spy => (
              <div>Шпион - {spy.name}</div>
            ))}
          </>
        ) : null}
      </div>
    </div>
  )
})
