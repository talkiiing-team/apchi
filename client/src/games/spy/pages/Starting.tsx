import { useCallback, useEffect, useMemo, useState } from 'react'
import { withApp } from '@/hoc/withApp'
import { Room } from '@apchi/shared'
import { Transition } from '@headlessui/react'

export const Starting = withApp<{ roomId: Room['id'] }>(({ app, roomId }) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setTimeout(() => setShow(true), 500)
    setTimeout(() => setShow(false), 2000)
  }, [])

  return (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <Transition
        show={show}
        enter='transition-opacity duration-500'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='transition-opacity duration-150'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
        className='flex h-full w-full flex-col items-center justify-center bg-indigo-600 text-white'
      >
        <span className='text-5xl'>Spy</span>
      </Transition>
    </div>
  )
})
