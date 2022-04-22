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
import { Crud, DetailedRoom, Room, Section, User } from '@apchi/shared'
import { createRoomHash } from '@/utils/createRoomHash'
import { buildLobbyName } from '@/utils/buildLobbyName'
import { fakeUser } from '@/dataUtils/fakeUser'
import userStore from '@/store/user.store'
import { Game } from '@apchi/shared/src/models/Game.model'
import {
  GeneralDaemon,
  sendToRoom,
  sendToUser,
  setRoomEngine,
} from '@/daemon/general.daemon'
import { getGamesIds } from '@apchi/games'
import { SocketAuth } from '@/models/SocketAuth.model'
import authenticationStore from '@/store/authentication.store'
import socketAuthStore from '@/store/socketAuth.store'
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
    newRoomsToBeSent = newRoomsToBeSent.filter(v => v! == roomId)
  }
}

export const registerRoomsController: Controller = (io: Server) => {
  /*const interval = setInterval(() => {
    if (roomStore.length() > 0) {
      console.log('sending all new rooms')
      io.to(buildLobbyName()).emit(
        buildBroadcastEventName(Section.Room)(RoomSection.newPublicRooms),
        roomStore
          .selectSome(room => room.isOpen, 10)
          .map(room => populateRoom(room)),
      )
      newRoomsToBeSent = []
    }
  }, 1000)*/

  //io.on('disconnect', () => clearInterval(interval))

  return (sock: Socket, listeners) => {
    exposeCrud(roomStore, ['get', 'dump', 'dumpToArray'])(basePrefix)(io)(
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
      const room = roomStore.find(room => room.members.includes(userId))
      if (!exists(room))
        return emit(
          prefix('leave.err'),
          sock,
        )({ reason: 'Not participated in any room', code: 404 })

      if (room.owner === userId) {
        io.in(buildRoomName(room.id)).emit(
          buildBroadcastEventName(Section.Room)(RoomSection.roomClosed),
        )
        sock.leave(buildRoomName(room.id))
        sock.join(buildLobbyName())
        roomStore.delete(room.id)
        return emit(prefix('leave.done'), sock)()
      }

      const result = roomStore.reduceUpdate(room.id, room => ({
        ...room,
        members: room.members.filter(v => v !== userId),
      }))

      if (result?.members && !result.members.length) roomStore.delete(result.id)

      io.in(buildRoomName(result!.id)).emit(
        buildBroadcastEventName(Section.Room)(RoomSection.userLeft),
        { ...result, members: roomMembersPopulate(result!.members) },
      )
      sock.leave(buildRoomName(room.id))
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

        if (isOpen) {
          addRoomToWaitList(roomIdSubmit)
        } else {
          removeRoomFromWaitList(roomIdSubmit)
        }

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

    listeners.set(
      prefix('selectGame'),
      (roomId: Room['id'], gameId: Game['id'] | null) => {
        const user = getContextUser(sock)
        if (!exists(user))
          return emit(
            prefix('selectGame.err'),
            sock,
          )({ reason: 'Forbidden', code: 403 })

        if (gameId !== null && !getGamesIds().includes(gameId)) {
          return emit(
            prefix('selectGame.err'),
            sock,
          )({ reason: "Game doesn't exist in this apchi instance", code: 404 })
        }

        const roomIdSubmit = roomStore.findId(
          room => room.id === roomId && room.owner === user.userId,
        )
        if (!exists(roomIdSubmit))
          return emit(
            prefix('selectGame.err'),
            sock,
          )({ reason: "You're not an admin", code: 403 })

        const result = roomStore.reduceUpdate(roomIdSubmit, room => ({
          ...room,
          game: gameId === null ? undefined : gameId,
        }))

        io.in(buildRoomName(roomIdSubmit)).emit(
          buildBroadcastEventName(Section.Room)(RoomSection.gameSelected),
          { game: gameId },
        )
        return emit(prefix('selectGame.done'), sock)(result)
      },
    )

    listeners.set(prefix('startGame'), (roomId: Room['id']) => {
      const user = getContextUser(sock)
      if (!exists(user))
        return emit(
          prefix('startGame.err'),
          sock,
        )({ reason: 'Forbidden', code: 403 })

      const room = roomStore.find(
        room => room.id === roomId && room.owner === user.userId,
      )
      if (!exists(room))
        return emit(
          prefix('startGame.err'),
          sock,
        )({ reason: "You're not an admin", code: 403 })

      if (!room.game || room.game?.length === 0)
        return emit(
          prefix('startGame.err'),
          sock,
        )({ reason: 'Select Room first', code: 400 })

      setRoomEngine(room.id, room.game, {
        sendToRoom: sendToRoom(io, room.id),
        sendToUser: sendToUser(io, socketAuthStore),
      })

      const engine = GeneralDaemon.get(room.id)
      if (!engine)
        return emit(
          prefix('startGame.err'),
          sock,
        )({ reason: 'Internal error, game engine not found', code: 500 })

      engine.setUsers(roomMembersPopulate(room.members))

      io.in(buildRoomName(room.id)).emit(
        buildBroadcastEventName(Section.Room)(RoomSection.gameStart),
        { game: room.game },
      )

      engine.startGame()

      return emit(prefix('startGame.done'), sock)()
    })
  }
}
