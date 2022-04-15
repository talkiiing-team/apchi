import { exposeCrud } from '@/common/exposeCrud'
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
import { DetailedRoom, Room, Section, User } from '@apchi/shared'
import { createRoomHash } from '@/utils/createRoomHash'
import { buildLobbyName } from '@/utils/buildLobbyName'
import { fakeUser } from '@/dataUtils/fakeUser'
import userStore from '@/store/user.store'

const basePrefix = 'rooms'
const prefix = buildPrefix(basePrefix)

const populateRoomIdList = (rooms: Room['id'][]): Room[] => {
  return rooms.map(id => roomStore.get(id)!).filter(room => exists<Room>(room))
}

let newRoomsToBeSent = new Array<Room['id']>()

const addRoomToWaitList = (roomId: Room['id']) => {
  const foundRoomId = newRoomsToBeSent.findIndex(v => roomId)
  if (!~foundRoomId) {
    newRoomsToBeSent.push(roomId)
  }
}

const removeRoomFromWaitList = (roomId: Room['id']) => {
  const foundRoomId = newRoomsToBeSent.findIndex(v => roomId)
  if (~foundRoomId) {
    newRoomsToBeSent.filter(v => v! == roomId)
  }
}

export const registerRoomsController: Controller = (io: Server) => {
  const interval = setInterval(() => {
    if (roomStore.length() > 0) {
      console.log('sending that we has new rooms')
      io.to(buildLobbyName()).emit(
        buildBroadcastEventName(Section.Room)(RoomSection.newPublicRooms),
        roomStore.dumpToArray(10).map(room => populateRoom(room)),
      )
      newRoomsToBeSent = []
    }
  }, 5000)

  return (sock: Socket, listeners) => {
    exposeCrud(roomStore, ['get', 'dump', 'dumpToArray'])(basePrefix)(io)(
      sock,
      listeners,
    )

    sock.on('disconnect', () => clearInterval(interval))

    listeners.set(prefix('create'), (item: Room) => {
      const user = getContextUser(sock)
      if (!exists(user))
        return emit(
          prefix('create.err'),
          sock,
        )({ reason: 'Forbidden', code: 403 })

      const users = Array.from({ length: 7 }, () => fakeUser())
        .map(user => userStore.insert(user.userId, user))
        .filter(user => exists(user)) as User[]

      const result = roomStore.create({
        ...item,
        members: [user.userId, ...users.map(user => user.userId)],
        owner: user.userId,
        isOpen: false,
        code: createRoomHash(user),
      })
      const populated: DetailedRoom = {
        ...result,
        members: [...users, user],
        owner: user,
      }
      emit(prefix('create.done'), sock)(populated)
      sock.join(buildRoomName(result.id))
      sock.leave(buildLobbyName())
      io.in(buildRoomName(result.id)).emit(
        buildBroadcastEventName('room')(RoomSection.userJoined),
        populated,
      )
    })

    listeners.set(prefix('joinRoomById'), (roomId: number) => {
      const userId = getContextUserId(sock)
      if (!exists(userId) || !Number.isInteger(roomId))
        return emit(
          prefix('joinRoomById.err'),
          sock,
        )({ reason: 'Insufficient privileges', code: 403 })
      const room = roomStore.get(roomId)
      if (!exists(room))
        return emit(
          prefix('joinRoomById.err'),
          sock,
        )({ reason: 'not-found', code: 404 })
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
      sock.leave(buildLobbyName())
      sock.join(buildRoomName(result.id))
      io.in(buildRoomName(result.id)).emit(
        buildBroadcastEventName('room')(RoomSection.userJoined),
        returnableResult,
      )
      emit(prefix('joinRoomById.done'), sock)(returnableResult)
    })

    listeners.set(prefix('join'), (roomCode: string) => {
      const safeRoomCode = roomCode.trim().toLowerCase()
      const userId = getContextUserId(sock)
      if (!exists(userId) || !exists(safeRoomCode))
        return emit(
          prefix('join.err'),
          sock,
        )({ reason: 'Insufficient privileges', code: 403 })
      const room = roomStore.find(v => v.code === safeRoomCode)
      if (!exists(room))
        return emit(
          prefix('join.err'),
          sock,
        )({ reason: 'not-found', code: 404 })
      const result = roomStore.reduceUpdate(room.id, room => ({
        ...room,
        members: [...(room.members || []), userId],
      }))!

      const returnableResult: DetailedRoom = {
        ...result,
        members: roomMembersPopulate(result.members)!,
        owner: populateUser(result.owner)!,
      }
      console.log('resultId', result.id)
      sock.leave(buildLobbyName())
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

      if (result?.members && !result.members.length) roomStore.delete(result.id)

      io.in(buildRoomName(result!.id)).emit(
        buildBroadcastEventName(Section.Room)(RoomSection.userLeft),
        { ...result, members: roomMembersPopulate(result!.members) },
      )
      sock.leave(buildRoomName(roomId))
      sock.join(buildLobbyName())
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

    listeners.set(
      prefix('changeVisibility'),
      (roomId: Room['id'], isOpen: boolean) => {
        const user = getContextUser(sock)
        if (!exists(user))
          return emit(
            prefix('changeVisibility.err'),
            sock,
          )({ reason: 'Forbidden', code: 403 })

        const roomIdSubmit = roomStore.findId(
          room => room.id === roomId && room.owner === user.userId,
        )

        if (!exists(roomIdSubmit))
          return emit(
            prefix('changeVisibility.err'),
            sock,
          )({ reason: "You're not an admin", code: 403 })

        const preparedHash = createRoomHash(user)

        const result = roomStore.reduceUpdate(roomIdSubmit, room => ({
          ...room,
          id: roomIdSubmit,
          isOpen: isOpen,
          code: isOpen ? room.code : preparedHash,
        }))

        const populated: DetailedRoom = populateRoom(result!)

        io.in(buildRoomName(roomIdSubmit)).emit(
          buildBroadcastEventName(Section.Room)(RoomSection.roomUpdated),
          { isOpen: isOpen, code: isOpen ? result?.code : preparedHash },
        )
        return emit(prefix('changeVisibility.done'), sock)(populated)
      },
    )

    listeners.set(prefix('list'), () => {
      /*const user = getContextUser(sock)
        if (!exists(user))
          return emit(
            prefix('list.err'),
            sock,
          )({ reason: 'Forbidden', code: 403 })*/

      const result = roomStore
        .selectSome(room => room.isOpen, 10)
        .map(v => populateRoom(v))
      return emit(prefix('list.done'), sock)(result)
    })
  }
}
