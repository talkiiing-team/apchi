import { Button } from '@/ui/Button'
import { useCallback, useState } from 'react'
import { PencilIcon, PlusIcon } from '@heroicons/react/outline'
import { Section } from '@/ui/Section'
import { withApp } from '@/hoc/withApp'
import { DetailedRoom, Room } from '@apchi/shared'
import { useAuth } from '@/hooks/useAuth'
import { useRecoilState } from 'recoil'
import { roomCurrentStore } from '@/store/room.store'

export const YourGameWidget = withApp(({ app }) => {
  const [inGameState, setInGameState] = useState(true)
  const [room, setRoom] = useRecoilState(roomCurrentStore)
  const { userId } = useAuth()

  const createGame = useCallback(() => {
    app
      .service<Room>('rooms')
      .create({ name: 'Игровая комната' } as Room)
      .then(r => setRoom(r as unknown as DetailedRoom))
  }, [])

  const leaveRoom = useCallback(() => {
    app
      .service<Room>('rooms')
      .call('leave')
      .then(r => console.log(r))
  }, [])

  const renameRoom = useCallback(() => {
    const newName = window.prompt('Введите новое имя:')
    app
      .service<Room>('rooms')
      .call('rename', room?.id, newName)
      .then(r => console.log(r))
  }, [room?.id])

  return inGameState ? (
    <Section>
      <div className='flex justify-between text-sm text-zinc-500'>
        <span>Текущая игра</span>
        <span>{room?.members?.length || 0} игроков</span>
      </div>
      <div className='flex justify-between items-center text-2xl text-zinc-800'>
        <span>{room?.name || 'Unknown'}</span>
        {room?.owner.userId === userId ? (
          <PencilIcon
            className='text-gray-500 w-5 h-5'
            onClick={() => renameRoom()}
          />
        ) : null}
      </div>
      <Button
        label='Покинуть игру'
        variant='primary'
        className='mt-3 w-full'
        onClick={() => {
          leaveRoom()
          setInGameState(false)
        }}
      />
    </Section>
  ) : (
    <Section>
      <span className='text-sm text-zinc-500'>Текущая игра</span>
      <span className='text-2xl text-zinc-800'>Нет игры</span>
      <Button
        icon={<PlusIcon className='text-white w-5 h-5' />}
        label='Создать игру'
        variant='primary'
        className='w-full mt-3'
        onClick={() => {
          createGame()
          setInGameState(true)
        }}
      />
    </Section>
  )
})
