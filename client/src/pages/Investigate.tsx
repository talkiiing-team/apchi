import { YourGameWidget } from '@/components/YourGameWidget'
import { GamesList } from '@/components/GamesList'

export const Investigate = () => {
  return (
    <div className='w-full h-full flex flex-col items-center justify-start space-y-4'>
      <YourGameWidget />
      <GamesList />
    </div>
  )
}
