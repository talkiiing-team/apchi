import { Section } from '@/ui/Section'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { inGameStateStore, roomCurrentStore } from '@/store/room.store'
import { withApp } from '@/hoc/withApp'
import { DetailedRoom, Game, RoomSection } from '@apchi/shared'
import { availableGamesStore } from '@/store/cache.store'
import { NativeSelect } from '@vkontakte/vkui'
import { useAuth } from '@/hooks/useAuth'
import { useNotify } from '@/hooks/useNotify'

export const GameSelector = withApp(({ app }) => {
  const [gamesList, setGamesList] = useRecoilState(availableGamesStore)
  const [room, setRoom] = useRecoilState(roomCurrentStore)
  const inGameState = useRecoilValue(inGameStateStore)
  const { userId } = useAuth()
  const { push } = useNotify()

  const isCurrentUserNotOwner = useMemo(
    () => room?.owner.userId !== userId,
    [room?.owner],
  )

  useEffect(() => {
    if (inGameState) {
      const offGameSelect = app.on<RoomSection>(
        '@room/gameSelected',
        ({ game }: { game: Game['id'] }) => {
          console.log('new room game', game)
          setRoom(r => (room ? { ...room, game: game } : undefined))
        },
      )
      return () => {
        offGameSelect()
      }
    }
  }, [inGameState])

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
          <div className='w-full flex flex-col space-y-0.5 px-0.5'>
            <h4 className='text-sm text-zinc-400'>Описание:</h4>
            <p className='text-sm text-zinc-700'>{game.description}</p>
          </div>
        )
      }
    }
    return null
  }, [room?.game, gamesList])

  console.log(gamesList)

  return (
    <Section title='Игра'>
      <NativeSelect
        placeholder='Выберите игру'
        disabled={isCurrentUserNotOwner}
        defaultValue={room?.game}
        onChange={onGameSelect}
      >
        {gamesOptions}
      </NativeSelect>
      {gameDescription}
    </Section>
  )
})
