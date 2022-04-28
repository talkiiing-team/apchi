import { withApp } from '@/hoc/withApp'
import { memo, useMemo, Suspense, lazy } from 'react'
import { Game, Room } from '@apchi/shared'
import { CubeTransparentIcon } from '@heroicons/react/outline'

const BaseNoGameFallback = () => {
  return (
    <div className='flex h-full w-full grow flex-col items-center justify-center space-y-2'>
      <CubeTransparentIcon className='h-12 w-12 stroke-1 text-zinc-500' />
      <span className='font-fancy text-sm text-zinc-700'>
        Не удалось загрузить игру
      </span>
    </div>
  )
}

export const GameView = memo(
  withApp<{ gameId: Game['id']; roomId: Room['id'] }>(
    ({ app, gameId, roomId }) => {
      const GameComponent = useMemo(() => {
        return lazy(
          () =>
            new Promise(res => {
              import(`../games/${gameId}/index.ts`)
                .catch(e => {
                  console.error(e)
                  return {
                    default: BaseNoGameFallback,
                  }
                })
                .then(r => setTimeout(() => res(r), 200))
            }),
        )
      }, []) // no deps

      console.log('GameView ')

      return (
        <Suspense
          fallback={
            <div className='flex h-full w-full grow flex-col items-center justify-center'>
              <CubeTransparentIcon className='h-12 w-12 animate-spin stroke-1 text-zinc-500' />
            </div>
          }
        >
          <GameComponent roomId={roomId} />
        </Suspense>
      )
    },
  ),
)
