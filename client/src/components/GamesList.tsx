import { Section } from '@/ui/Section'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { inGameStateStore, roomCurrentStore } from '@/store/room.store'
import { withApp } from '@/hoc/withApp'
import { DetailedRoom, RoomSection } from '@apchi/shared'
import { RoomRow } from '@/components/RoomRow'

export const GamesList = withApp(({ app }) => {
  const [inGameState, setInGameState] = useRecoilState(inGameStateStore)
  //const [room, setRoom] = useRecoilState(roomCurrentStore)
  const [roomList, setRoomList] = useState<DetailedRoom[]>([])

  useEffect(() => {
    if (inGameState) {
      const offRoomsListeners = app.on<RoomSection>(
        '@room/newPublicRooms',
        (rooms: DetailedRoom[]) => {
          console.log('new rooms', rooms)
        },
      )
      return () => {
        offRoomsListeners()
      }
    }
  }, [inGameState])

  useEffect(() => {
    app
      .service('rooms')
      .call('list')
      .then(r => {
        setRoomList(r)
      })
  }, [])

  return (
    <Section
      title='Список открытых игр'
      sideTitle={<span className='px-1'>{roomList.length}</span>}
    >
      {roomList.map(v => (
        <RoomRow room={v} key={v.id} />
      ))}
    </Section>
  )
})
