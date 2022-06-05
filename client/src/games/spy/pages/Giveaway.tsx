import { withApp } from '@/hoc/withApp'
import { Room, User } from '@apchi/shared'
import { useRecoilState, useRecoilValue } from 'recoil'
import { gameStateStore } from '@/games/spy/store/spy.store'
import { Card } from '@/games/spy/components/Card'

export const Giveaway = withApp<{ roomId: Room['id'] }>(({ app, roomId }) => {
  const gameState = useRecoilValue(gameStateStore)
  return (
    <div className='flex h-full w-full flex-col items-center justify-items-stretch space-y-2'>
      <div className='flex w-full flex-col'>
        <span className='w-full text-center text-sm'>
          Никому не показывайте свою роль
        </span>
      </div>
      <div className='flex w-full flex-col space-y-2'>
        {gameState?.role ? (
          <Card type={gameState.role} location={gameState.location} />
        ) : null}
      </div>
    </div>
  )
})
