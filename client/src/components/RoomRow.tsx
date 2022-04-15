import { DetailedRoom } from '@/types'
import { UserGroupIcon } from '@heroicons/react/solid'

export const RoomRow = ({ room }: { room: DetailedRoom }) => {
  return (
    <div className='grid grid-cols-[1fr,2.5rem] items-center justify-items-center py-2 ring-0 active:ring-1 transition-shadow ring-violet-400'>
      <span className='justify-self-start'>{room.name}</span>
      <div className='flex items-center space-x-1 justify-self-end text-zinc-500 text-sm px-0.5 '>
        <UserGroupIcon className='text-current w-3 h-3' />
        <span>{room?.members?.length || 0}</span>
      </div>
    </div>
  )
}
