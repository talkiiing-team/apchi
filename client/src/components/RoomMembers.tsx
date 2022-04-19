import { DetailedRoom, User } from '@/types'
import { Section } from '@/ui/Section'
import { UserRow } from '@/components/UserRow'
import { memo, useMemo } from 'react'
import { StarIcon } from '@heroicons/react/outline'

export const RoomMembers = memo<
  Partial<Pick<DetailedRoom, 'members' | 'owner'>> & {
    currentUserId?: User['userId']
  }
>(({ members, owner, currentUserId }) => {
  console.log('render RoomMembers')
  const content = useMemo(
    () =>
      members && owner && currentUserId
        ? [...members]
            .sort(u1 => {
              if (u1.userId === owner.userId) return -1
              if (u1.userId === currentUserId) return -2
              return 1
            })
            .map(v => (
              <UserRow
                user={v}
                key={v.userId}
                sideData={
                  v.userId === owner.userId ? (
                    <StarIcon className='w-5 h-5 text-amber-500 stroke-1' />
                  ) : v.userId === currentUserId ? (
                    <span className='text-sm text-zinc-400'>Вы</span>
                  ) : undefined
                }
              />
            ))
        : null,
    [members, owner, currentUserId],
  )

  return (
    <Section
      title='Участники'
      sideTitle={<span className='px-1'>{members?.length || null}</span>}
    >
      {content}
    </Section>
  )
})
