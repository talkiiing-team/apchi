import { useNotify } from '@/hooks/useNotify'
import { Transition } from '@headlessui/react'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'

export const NotifyRoot = () => {
  const { getNext, markAsRead, currentNotification } = useNotify(true)

  const [isShowing, setIsShowing] = useState<boolean>(false)

  useLayoutEffect(() => {
    if (currentNotification) {
      setIsShowing(true)
      return () => {
        setIsShowing(false)
      }
    }
  }, [currentNotification])

  return (
    <Transition
      show={!!currentNotification}
      className='absolute bottom-[5rem] w-full p-3 bg-white shadow-2xl'
      enter='transition-transform transition-opacity duration-500'
      enterFrom='opacity-0 translate-x-1/2'
      enterTo='opacity-100'
      leave='transition-transform transition-opacity duration-500'
      leaveFrom='opacity-100'
      leaveTo='opacity-0 translate-x-1/2'
    >
      {currentNotification ? (
        <span onClick={() => getNext()}>
          {currentNotification.title} {currentNotification.text}
        </span>
      ) : null}
    </Transition>
  )
}
