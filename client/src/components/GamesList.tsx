import { Section } from '@/ui/Section'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { inRoomStateStore, roomCurrentStore } from '@/store/room.store'
import { withApp } from '@/hoc/withApp'
import { DetailedRoom, RoomSection } from '@apchi/shared'
import { RoomRow } from '@/components/RoomRow'

export const GamesList = withApp(({ app }) => {
  const [inRoomState, setInRoomState] = useRecoilState(inRoomStateStore)
  //const [room, setRoom] = useRecoilState(roomCurrentStore)
  const [roomList, setRoomList] = useState<DetailedRoom[]>([])

  useEffect(() => {
    if (inRoomState) {
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
  }, [inRoomState])

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
      title='Открытые комнаты'
      side={<span className='px-1'>{roomList.length}</span>}
    >
      {roomList.map(v => (
        <RoomRow room={v} key={v.id} />
      ))}
    </Section>
  )
})
