import { User } from '@/types'
import { gravatarImage } from '@/utils/gravatarImage'
import { ImageWrapper } from '@/components/ImageWrapper'
import { memo } from 'react'

export const UserRow = memo<{
  user: User
  sideData?: JSX.Element | string | number
}>(({ user, sideData }) => {
  return (
    <div className='grid grid-cols-[2.5rem,1fr,2.5rem] items-center justify-items-center p-0.5'>
      <div className='rounded-full h-10 w-10 ring-1 ring-violet-500'>
        <ImageWrapper
          src={user.avatar || gravatarImage(user.name)}
          className='w-full h-full rounded-full '
        />
      </div>
      <span className='justify-self-start px-4 overflow-x-hidden text-ellipsis w-full whitespace-nowrap'>
        {user.name}
      </span>
      {sideData ? sideData : null}
    </div>
  )
})
