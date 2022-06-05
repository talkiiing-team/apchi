import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SpyGameEvent } from '@apchi/games/src/spy'
import { withApp } from '@/hoc/withApp'
import { Room, User } from '@apchi/shared'
import { useRecoilState, useRecoilValue } from 'recoil'
import { gameStateStore, userStore } from '@/games/spy/store/spy.store'

export const GuessLocation = withApp<{ roomId: Room['id'] }>(
  ({ app, roomId }) => {
    const state = useRecoilValue(gameStateStore)

    const voteForLocation = useCallback((locationId: string) => {
      app.service('game').call('do', roomId, 'guessLocation', locationId)
    }, [])

    return (
      <div className='flex h-full w-full flex-col items-center justify-items-stretch space-y-2'>
        <div className='flex w-full flex-col'>
          <span className='w-full text-center text-sm'>
            У вас всего одна попытка угадать локацию
          </span>
        </div>
        <div className='grid w-full grid-cols-2 gap-3'>
          {state?.locations
            ? state.locations.map(loc => {
                return (
                  <div
                    className='cursor-pointer select-none rounded-xl border border-gray-300 bg-gray-50 py-3 px-4 hover:bg-gray-100'
                    onClick={() => voteForLocation(loc.id)}
                  >
                    {loc.name}
                  </div>
                )
              })
            : null}
        </div>
      </div>
    )
  },
)
