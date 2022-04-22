import { Button } from '@/ui/Button'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { inRoomStateStore, roomCurrentStore } from '@/store/room.store'
import { Input } from '@/ui/Input'
import { UserGroupIcon, ShareIcon } from '@heroicons/react/solid'
import { copyToClipboard } from '@/utils/copyToClipboard'
import { useNotify } from '@/hooks/useNotify'

export const YourGameWidget = withApp(({ app }) => {
  const [inRoomState, setInRoomState] = useRecoilState(inRoomStateStore)
  const [room, setRoom] = useRecoilState(roomCurrentStore)
  const {
    userId,
    user: { name: userName },
  } = useAuth()
  const joinInput = useRef<HTMLInputElement>(null)
  const [joinGameState, setJoinGameState] = useState<string>('')
  const { push } = useNotify()

  const isOwner = useMemo(
    () => room?.owner.userId === userId,
    [userId, room?.owner.userId],
  )

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
      setInRoomState(false)
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
      .then(() => setInRoomState(true))
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
      .then(() => setInRoomState(true))
      .catch(e => {
        if (e.code === 404) {
          setJoinGameState('Игра не найдена')
        }
      })
  }, [joinInput])

  const leaveRoom = useCallback(() => {
    if (isOwner) {
      const confirm = window.confirm(
        'Вы действительно хотите удалить это говно?',
      )
      if (!confirm) return
    }
    app
      .service<Room>('rooms')
      .call('leave')
      .then(r => console.log(r))
      .then(() => setInRoomState(false))
  }, [isOwner])

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
    setInRoomState(!!room)
  }, []) // no deps

  return inRoomState ? (
    <Section
      title='Текущая игра'
      side={
        <div className='flex items-center space-x-2 px-1'>
          {room?.code ? (
            <div className='flex items-center'>
              <ShareIcon className='h-5 w-5 p-1 text-zinc-400' />
              <span
                className='media-hover:cursor-pointer font-mono uppercase text-blue-400'
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
            <UserGroupIcon className='h-5 w-5 p-1 text-current' />
            <span>{room?.members?.length || 0}</span>
          </div>
        </div>
      }
    >
      <div className='flex items-center justify-between text-2xl text-zinc-700'>
        <span className='max-w-[calc(100%-4rem)] overflow-hidden text-ellipsis whitespace-nowrap px-0.5'>
          {room?.name || 'Unknown'}
        </span>
        <div className='flex h-8 items-center justify-end'>
          {room?.owner.userId === userId ? (
            <PencilIcon
              className='media-hover:cursor-pointer h-full p-1.5 text-gray-500'
              onClick={() => renameRoom()}
            />
          ) : null}
          {room?.isOpen ? (
            <LockOpenIcon
              className='media-hover:cursor-pointer h-full p-1.5  text-gray-500'
              onClick={allowIfOwner(changeOpenState(false))}
            />
          ) : (
            <LockClosedIcon
              className='media-hover:cursor-pointer h-full p-1.5  text-gray-500'
              onClick={allowIfOwner(changeOpenState(true))}
            />
          )}
        </div>
      </div>
      <Button
        label={isOwner ? 'Удалить комнату' : 'Покинуть комнату'}
        variant={isOwner ? 'error' : 'primary'}
        outline={true}
        className='w-full'
        onClick={() => {
          leaveRoom()
        }}
      />
    </Section>
  ) : (
    <>
      <Section title='Текущая игра'>
        <span className='px-0.5 text-2xl text-zinc-700'>Нет игры</span>
        <Button
          icon={<PlusIcon className='h-5 w-5 text-white' />}
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
        side={
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
          icon={<AtSymbolIcon className='h-5 w-5 text-white' />}
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
