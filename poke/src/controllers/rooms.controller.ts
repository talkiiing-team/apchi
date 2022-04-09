import { exposeCrud } from '@/common/exposeCrud'
import { flow, pipe } from 'fp-ts/lib/function'
import { Server, Socket } from 'socket.io'
import { roomStore } from '@/store/room.store'
import { buildPrefix } from '@/utils/buildPrefix'
import { emit } from '@/utils/emit'

const basePrefix = 'rooms'
const prefix = buildPrefix(basePrefix)

export const registerRoomsController = (io: Server, sock: Socket) => {
  exposeCrud(roomStore, [])(basePrefix)(io, sock)

  sock.on(
    prefix('join'),
    flow((roomId: number, userId: number) => {
      if (!roomId || !Number.isInteger(roomId) || !Number.isInteger(userId))
        return
      const room = roomStore.get(roomId)
      if (!room) return emit(prefix('join.err'), sock)({ reason: 'not-found' })
      const result = roomStore.patch(roomId, {
        ...room,
        members: [...(room.members || []), userId],
      })
      emit(prefix('join.done'), sock)(result)
    }),
  )
}
