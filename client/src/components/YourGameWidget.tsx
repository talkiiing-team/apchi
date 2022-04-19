import { Button } from '@/ui/Button'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AtSymbolIcon,
  LockClosedIcon,
  LockOpenIcon,
  PencilIcon,
  PlusIcon,
} from '@heroicons/react/outline'
import { Section } from '@/ui/Section'
import { withApp } from '@/hoc/withApp'
import { DetailedRoom, Room, RoomSection } from '@apchi/shared'
import { useAuth } from '@/hooks/useAuth'
import { useRecoilState } from 'recoil'
import { inGameStateStore, roomCurrentStore } from '@/store/room.store'
import { Input } from '@/ui/Input'
import { UserGroupIcon, ShareIcon } from '@heroicons/react/solid'
import { copyToClipboard } from '@/utils/copyToClipboard'
import { useNotify } from '@/hooks/useNotify'

export const YourGameWidget = withApp(({ app }) => {
  const [inGameState, setInGameState] = useRecoilState(inGameStateStore)
  const [room, setRoom] = useRecoilState(roomCurrentStore)
  const {
    userId,
    user: { name: userName },
  } = useAuth()
  const joinInput = useRef<HTMLInputElement>(null)
  const [joinGameState, setJoinGameState] = useState<string>('')
  const { push } = useNotify()

  useEffect(() => {
    const offUpdate = app.on<RoomSection>(
      '@room/roomUpdated',
      (roomUpdateData: Pick<DetailedRoom, 'name' | 'isOpen' | 'code'>) => {
        console.log('new room state', roomUpdateData)
        setRoom(room => (room ? { ...room, ...roomUpdateData } : undefined))
      },
    )
    const offUserJoin = app.on<RoomSection>(
      '@room/userJoined',
      ({ members }: { members: DetailedRoom['members'] }) => {
        console.log('new room mmbs', members)
        setRoom(room => (room ? { ...room, members } : undefined))
      },
    )
    const offUserLeave = app.on<RoomSection>(
      '@room/userLeft',
      ({ members }: { members: DetailedRoom['members'] }) => {
        console.log('new room mmbs', members)
        setRoom(room => (room ? { ...room, members } : undefined))
      },
    )
    const offRoomClosed = app.on<RoomSection>('@room/roomClosed', () => {
      console.log('room closed, kiss my ass')
      setRoom(undefined)
      setInGameState(false)
    })
    return () => {
      offUpdate()
      offUserJoin()
      offUserLeave()
      offRoomClosed()
    }
  }, [])

  const createGame = useCallback(() => {
    app
      .service<Room>('rooms')
      .create({ name: `Комната ${userName}` } as Room)
      .then(r => setRoom(r as unknown as DetailedRoom))
      .then(() => setInGameState(true))
  }, [userName])

  const joinGame = useCallback(() => {
    if (!joinInput.current?.value.trim().length) {
      setJoinGameState('Введите код игры')
      return
    }
    app
      .service<Room>('rooms')
      .call('join', joinInput.current?.value)
      .then(r => setRoom(r as unknown as DetailedRoom))
      .then(() => setInGameState(true))
      .catch(e => {
        if (e.code === 404) {
          setJoinGameState('Игра не найдена')
        }
      })
  }, [joinInput])

  const leaveRoom = useCallback(() => {
    app
      .service<Room>('rooms')
      .call('leave')
      .then(r => console.log(r))
      .then(() => setInGameState(false))
  }, [])

  const renameRoom = useCallback(() => {
    const newName = window
      .prompt('Введите новое имя (до 30 символов):')
      ?.slice(0, 30)
    if (!newName) return
    app
      .service<Room>('rooms')
      .call('rename', room?.id, newName)
      .then(r => console.log(r))
  }, [room?.id])

  const allowIfOwner = useCallback(
    (callChain: (...args: any) => void) =>
      room?.owner.userId === userId ? callChain : undefined,
    [userId, room?.id],
  )

  const changeOpenState = useCallback(
    (isOpen: boolean) => () => {
      app
        .service<Room>('rooms')
        .call('changeVisibility', room?.id, isOpen)
        .then(r => console.log(r))
    },
    [room?.id],
  )

  useEffect(() => {
    setInGameState(!!room)
  }, []) // no deps

  return inGameState ? (
    <Section
      title='Текущая игра'
      sideTitle={
        <div className='flex items-center space-x-2 px-1'>
          {room?.code ? (
            <div className='flex items-center'>
              <ShareIcon className='w-5 h-5 text-zinc-400 p-1' />
              <span
                className='uppercase text-blue-400 font-mono media-hover:cursor-pointer'
                onClick={e =>
                  e.currentTarget.textContent &&
                  copyToClipboard(e.currentTarget.textContent.toUpperCase())
                }
              >
                {room.code}
              </span>
            </div>
          ) : null}
          <div className='flex items-center '>
            <UserGroupIcon className='text-current w-5 h-5 p-1' />
            <span>{room?.members?.length || 0}</span>
          </div>
        </div>
      }
    >
      <div className='flex justify-between items-center text-2xl text-zinc-700'>
        <span className='max-w-[calc(100%-4rem)] text-ellipsis overflow-hidden whitespace-nowrap px-0.5'>
          {room?.name || 'Unknown'}
        </span>
        <div className='flex items-center justify-end h-8'>
          {room?.owner.userId === userId ? (
            <PencilIcon
              className='text-gray-500 p-1.5 h-full media-hover:cursor-pointer'
              onClick={() => renameRoom()}
            />
          ) : null}
          {room?.isOpen ? (
            <LockOpenIcon
              className='text-gray-500 p-1.5 h-full  media-hover:cursor-pointer'
              onClick={allowIfOwner(changeOpenState(false))}
            />
          ) : (
            <LockClosedIcon
              className='text-gray-500 p-1.5 h-full  media-hover:cursor-pointer'
              onClick={allowIfOwner(changeOpenState(true))}
            />
          )}
        </div>
      </div>
      <Button
        label='Покинуть игру'
        variant='primary'
        className='w-full'
        onClick={() => {
          leaveRoom()
        }}
      />
    </Section>
  ) : (
    <>
      <Section title='Текущая игра'>
        <span className='text-2xl text-zinc-700 px-0.5'>Нет игры</span>
        <Button
          icon={<PlusIcon className='text-white w-5 h-5' />}
          label='Создать игру'
          variant='primary'
          className='w-full'
          onClick={() => {
            createGame()
          }}
        />
      </Section>

      <Section
        title='Присоединиться к игре'
        sideTitle={
          <div className='flex items-center space-x-2'>
            {joinGameState ? (
              <span className='text-red-400'>{joinGameState}</span>
            ) : null}
          </div>
        }
      >
        <Input
          label='Введите номер комнаты'
          ref={joinInput}
          inputClassName='uppercase'
        />
        <Button
          icon={<AtSymbolIcon className='text-white w-5 h-5' />}
          label='Присоединиться'
          variant='primary'
          className='w-full'
          onClick={() => {
            joinGame()
            push({
              title: 'Button tыked',
              text: Math.random().toString(),
            })
          }}
        />
      </Section>
    </>
  )
})
