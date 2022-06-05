import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SpyGameEvent } from '@apchi/games/src/spy'
import { withApp } from '@/hoc/withApp'
import { Room, User } from '@apchi/shared'
import { useRecoilState, useRecoilValue } from 'recoil'
import { userStore } from '@/games/spy/store/spy.store'
import { Input } from '@vkontakte/vkui'
import { Button } from '@/ui/Button'

export const Setup = withApp<{ roomId: Room['id'] }>(({ app, roomId }) => {
  const addLocation = useCallback((userId: User['userId']) => {
    app.service('game').call('do', roomId, 'addCustomMap', userId)
  }, [])

  return (
    <div className='flex h-full w-full flex-col items-center justify-items-stretch space-y-2'>
      <div className='flex w-full flex-col'>
        <span className='w-full text-center text-sm'>
          Добавьте свои локации
        </span>
      </div>
      <div className='grid w-full grid-cols-2 gap-3'>
        <Input />
        <Button />
      </div>
    </div>
  )
})
