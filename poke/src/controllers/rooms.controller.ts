import { exposeCrud } from '@/common/exposeCrud'
import { flow } from 'fp-ts/lib/function'
import { Server, Socket } from 'socket.io'
import { roomStore } from '@/store/room.store'
import { buildPrefix } from '@/utils/buildPrefix'
import { emit } from '@/utils/emit'
import { getContextUser, getContextUserId } from '@/utils/getContext'
import { buildRoomName } from '@/utils/buildRoomName'
import { Controller } from '@/types'
import { exists } from '@/utils/controllerUtils'
import { buildBroadcastEventName } from '@/utils/buildBroadcastEventName'
import { RoomSection } from '@apchi/shared/src/enums/room.section'
import {
  populateRoom,
  populateUser,
  roomMembersPopulate,
} from '@/common/roomMembersPopulate'
import { DetailedRoom, Room } from '@apchi/shared'
import userStore from '@/store/user.store'
import { Section } from '@/sections'

const basePrefix = 'rooms'
const prefix = buildPrefix(basePrefix)

export const registerRoomsController: Controller = (
  io: Server,
  sock: Socket,
  listeners,
) => {
  exposeCrud(roomStore, ['get', 'dump', 'dumpToArray'])(basePrefix)(
    io,
    sock,
    listeners,
  )

  listeners.set(prefix('create'), (item: Room) => {
    const user = getContextUser(sock)
    if (!exists(user))
      return emit(
        prefix('create.err'),
        sock,
      )({ reason: 'Forbidden', code: 403 })
    const result = roomStore.create({
      ...item,
      members: [user.userId],
      owner: user.userId,
    })
    const populated: DetailedRoom = {
      ...result,
      members: [user],
      owner: user,
    }
    emit(prefix('create.done'), sock)(populated)
    sock.join(buildRoomName(result.id))
    io.in(buildRoomName(result.id)).emit(
      buildBroadcastEventName('room')(RoomSection.userJoined),
      populated,
    )
  })

  listeners.set(prefix('join'), (roomId: number) => {
    const userId = getContextUserId(sock)
    if (!exists(userId) || !Number.isInteger(roomId))
      return emit(
        prefix('leave.err'),
        sock,
      )({ reason: 'Insufficient privileges', code: 403 })
    const room = roomStore.get(roomId)
    if (!exists(room))
      return emit(prefix('join.err'), sock)({ reason: 'not-found', code: 404 })
    const result = roomStore.reduceUpdate(roomId, room => ({
      ...room,
      members: [...(room.members || []), userId],
    }))!

    const returnableResult: DetailedRoom = {
      ...result,
      members: roomMembersPopulate(result.members)!,
      owner: populateUser(result.owner)!,
    }
    console.log('resultId', result.id)
    sock.join(buildRoomName(result.id))
    io.in(buildRoomName(result.id)).emit(
      buildBroadcastEventName('room')(RoomSection.userJoined),
      returnableResult,
    )
    emit(prefix('join.done'), sock)(returnableResult)
  })

  listeners.set(prefix('leave'), () => {
    const userId = getContextUserId(sock)
    if (!exists(userId))
      return emit(
        prefix('leave.err'),
        sock,
      )({ reason: 'Unauthenticated', code: 403 })
    const roomId = roomStore.findId(room => room.members.includes(userId))
    if (!exists(roomId))
      return emit(
        prefix('leave.err'),
        sock,
      )({ reason: 'Not participated in any room', code: 404 })

    const result = roomStore.reduceUpdate(roomId, room => ({
      ...room,
      members: room.members.filter(v => v !== userId),
    }))

    io.in(buildRoomName(result!.id)).emit(
      buildBroadcastEventName(Section.Room)(RoomSection.userLeft),
      { ...result, members: roomMembersPopulate(result!.members) },
    )
    sock.leave(buildRoomName(roomId))
    return emit(prefix('leave.done'), sock)()
  })

  listeners.set(prefix('rename'), (roomId: Room['id'], newName: string) => {
    const user = getContextUser(sock)
    if (!exists(user))
      return emit(
        prefix('rename.err'),
        sock,
      )({ reason: 'Forbidden', code: 403 })

    const roomIdSubmit = roomStore.findId(
      room => room.id === roomId && room.owner === user.userId,
    )

    if (!exists(roomIdSubmit))
      return emit(
        prefix('rename.err'),
        sock,
      )({ reason: "You're not an admin", code: 403 })

    const result = roomStore.reduceUpdate(roomIdSubmit, room => ({
      ...room,
      id: roomIdSubmit,
      name: newName,
    }))

    const populated: DetailedRoom = populateRoom(result!)
    io.in(buildRoomName(roomIdSubmit)).emit(
      buildBroadcastEventName(Section.Room)(RoomSection.roomUpdated),
      { name: populated.name },
    )
    return emit(prefix('rename.done'), sock)(populated)
  })
}
