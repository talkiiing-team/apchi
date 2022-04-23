import { Section } from '@/ui/Section'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { inRoomStateStore, roomCurrentStore } from '@/store/room.store'
import { withApp } from '@/hoc/withApp'
import { DetailedRoom, Game, RoomSection } from '@apchi/shared'
import { availableGamesStore } from '@/store/cache.store'
import { NativeSelect } from '@vkontakte/vkui'
import { useAuth } from '@/hooks/useAuth'
import { useNotify } from '@/hooks/useNotify'
import { Button } from '@/ui/Button'
import { GameStatus, getGamesMap } from '@apchi/games'
import { set } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { inGameStateStore } from '@/store/game.store'

export const GameSelector = withApp(({ app }) => {
  const [gamesList, setGamesList] = useRecoilState(availableGamesStore)
  const [room, setRoom] = useRecoilState(roomCurrentStore)
  const inRoomState = useRecoilValue(inRoomStateStore)
  const [inGameState, setInGameState] = useRecoilState(inGameStateStore)
  const { userId } = useAuth()
  const { push } = useNotify()
  const selectRef = useRef<HTMLSelectElement>(null)
  const navigate = useNavigate()

  const isOwner = useMemo(() => room?.owner.userId === userId, [room?.owner])

  useEffect(() => {
    if (inRoomState) {
      const offGameSelect = app.on<RoomSection>(
        '@room/gameSelected',
        ({ game }: { game: Game['id'] }) => {
          console.log('new room game', game)
          setRoom(r => (room ? { ...room, game: game } : undefined))
        },
      )
      const offGameStart = app.on<RoomSection>(
        '@room/gameStart',
        ({ game }: { game: Game['id'] }) => {
          console.log('game started', game)
          setRoom(r => (room ? { ...room, game: game } : undefined))
          setInGameState(true)
          navigate('game')
        },
      )
      return () => {
        offGameSelect()
        offGameStart()
      }
    }
  }, [inRoomState])

  useEffect(() => {
    if (selectRef.current) selectRef.current.value = room?.game || ''
  }, [room?.game, selectRef.current])

  const startGame = useCallback(() => {
    console.log('starting')
    app
      .service('rooms')
      .call('startGame', room?.id)
      .then(r =>
        push({
          title: 'Game started',
          text: `Game started!!!!!!!!11`,
        }),
      )
  }, [])

  const onGameSelect = useCallback(
    e => {
      app
        .service('rooms')
        .call('selectGame', room?.id, e.target.value || undefined)
        .then(r =>
          push({
            title: 'Room selected',
            text: `You select ${e.target.value}`,
          }),
        )
    },
    [room?.id],
  )

  useEffect(() => {
    app
      .service('games')
      .call('list')
      .then(r => {
        setGamesList(r)
      })
  }, [])

  useEffect(() => {
    if (room?.game) {
      app
        .service('rooms')
        .call('gameStatus', room.id)
        .then(({ status, game }: { status: GameStatus; game: Game['id'] }) => {
          if (room.game !== game) {
            setRoom(r => (room ? { ...room, game: game } : undefined))
          }
          if (status === GameStatus.InProgress) {
            setInGameState(true)
            navigate('game')
          }
        })
    }
  }, []) // no deps

  const gamesOptions = useMemo(
    () =>
      gamesList.map(v => (
        <option key={v.id} value={v.id}>
          {v.name}
        </option>
      )),
    [gamesList],
  )

  const gameDescription = useMemo(() => {
    if (room?.game) {
      const game = gamesList.find(v => v.id === room.game)
      if (game && game.description) {
        return (
          <div className='flex w-full flex-col space-y-0.5 px-0.5'>
            <h4 className='text-sm text-zinc-400'>Внутри Вас ждёт</h4>
            <p className='text-sm text-zinc-700'>{game.description}</p>
          </div>
        )
      }
    }
    return null
  }, [room?.game, gamesList])

  const startGameButton = useMemo(() => {
    const isGameSelected = !!room?.game
    return isOwner ? (
      <Button
        label={isGameSelected ? 'Начать игру' : 'Выберите игру'}
        variant='primary'
        className='w-full'
        disabled={!isGameSelected}
        onClick={() => {
          startGame()
        }}
      />
    ) : null
  }, [room, isOwner])

  return (
    <Section title='Игра'>
      {isOwner ? (
        <NativeSelect
          placeholder='Выберите игру'
          disabled={!isOwner}
          onChange={onGameSelect}
          getRef={selectRef}
        >
          {gamesOptions}
        </NativeSelect>
      ) : (
        <h2 className='px-0.5'>
          {(room?.game && getGamesMap()[room.game].name) || 'Не выбрано'}
        </h2>
      )}
      {gameDescription}
      {startGameButton}
    </Section>
  )
})
