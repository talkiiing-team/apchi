import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { JokeRatingGameData, TonkoGameEvent } from '@apchi/games/src/tonko'
import { withApp } from '@/hoc/withApp'
import { Room, User } from '@apchi/shared'
export type LeaderboardRecord = {
  user: User
  score: JokeRatingGameData['score']
}

export const Overviewing = withApp<{ roomId: Room['id'] }>(
  ({ app, roomId }) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>([])

    useEffect(() => {
      const offLeaderboard = app.on<TonkoGameEvent>(
        '@game/leaderboard',
        ({ leaderboard }: { leaderboard: LeaderboardRecord[] }) => {
          console.log('leaderboard', leaderboard)
          setLeaderboard(leaderboard)
        },
      )
      return () => {
        offLeaderboard()
      }
    }, [])

    return (
      <div className='flex h-full w-full flex-col items-center justify-items-stretch space-y-2'>
        <div className='flex w-full flex-col'>
          <span className='w-full text-center text-sm'>Leaderboard</span>
        </div>
        <div className='flex w-full flex-col space-y-2'>
          {leaderboard.map(v => (
            <div key={v.user.name}>
              {v.score} {v.user.name}
            </div>
          ))}
        </div>
      </div>
    )
  },
)
