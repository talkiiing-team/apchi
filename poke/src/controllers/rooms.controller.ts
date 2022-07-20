import { roomStore } from '@/store/room.store'
import { buildRoomName } from '@/utils/domain/buildRoomName'
import { Controller } from '@/types'
import { exists } from '@/utils/controllerUtils'
import { buildBroadcastEventName } from '@/utils/domain/buildBroadcastEventName'
import { RoomSection } from '@apchi/shared/src/enums/room.section'
import {
  populateRoom,
  populateUser,
  roomMembersPopulate,
} from '@/utils/domain/roomMembersPopulate'
import { Crud, DetailedRoom, Room, Section, User } from '@apchi/shared'
import { createRoomHash } from '@/utils/domain/createRoomHash'
import { buildLobbyName } from '@/utils/domain/buildLobbyName'
import { Game } from '@apchi/shared/src/models/Game.model'
import {
  GeneralDaemon,
  sendToRoom,
  sendToUser,
  setRoomEngine,
} from '@/daemon/general.daemon'
import { GameStatus, getGamesIds } from '@apchi/games'
import socketAuthStore from '@/store/socketAuth.store'
import { createController } from '@/common/createController'

export const registerRoomsController: Controller = createController({
  scope: 'rooms',
  requireAuth: true,
  register: (addListener, { socket: sock, io, exposeCrud, context }) => {
    addListener('create', (resolve, reject) => (item: Room) => {
      if (!exists(context.user))
        return reject({ reason: 'Forbidden', code: 403 })

      const users = [] as User[]
      const result = roomStore.create({
        ...item,
        members: [context.user.userId, ...users.map(user => user.userId)],
        owner: context.user.userId,
        isOpen: false,
        code: createRoomHash(context.user),
      })
      const populated: DetailedRoom = {
        ...result,
        members: [...users, context.user],
        owner: context.user,
      }
      resolve(populated)
      sock.join(buildRoomName(result.id))
      sock.leave(buildLobbyName())
      io.in(buildRoomName(result.id)).emit(
        buildBroadcastEventName('room')(RoomSection.userJoined),
        populated,
      )
    })

    addListener('joinRoomById', (resolve, reject) => (roomId: number) => {
      if (!exists(context.user) || !Number.isInteger(roomId))
        return reject({ reason: 'Insufficient privileges', code: 403 })

      const room = roomStore.get(roomId)
      if (!exists(room)) return reject({ reason: 'not-found', code: 404 })

      const result = roomStore.reduceUpdate(roomId, room => ({
        ...room,
        members: [...(room.members || []), context.user?.userId || -2],
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
      resolve(returnableResult)
    })

    addListener('join', (resolve, reject) => (roomCode: string) => {
      const safeRoomCode = roomCode.trim().toLowerCase()
      if (!exists(context.user) || !exists(safeRoomCode))
        return reject({ reason: 'Insufficient privileges', code: 403 })

      const room = roomStore.find(v => v.code === safeRoomCode)
      if (!exists(room)) return reject({ reason: 'not-found', code: 404 })

      const result = roomStore.reduceUpdate(room.id, room => ({
        ...room,
        members: [...(room.members || []), context.user?.userId || -2],
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
      resolve(returnableResult)
    })

    addListener('leave', (resolve, reject) => () => {
      if (!exists(context.user))
        return reject({ reason: 'Unauthenticated', code: 403 })
      const room = roomStore.find(room =>
        room.members.includes(context.user?.userId || -2),
      )
      if (!exists(room))
        return reject({ reason: 'Not participated in any room', code: 404 })

      if (room.owner === context.user?.userId) {
        io.in(buildRoomName(room.id)).emit(
          buildBroadcastEventName(Section.Room)(RoomSection.roomClosed),
        )
        sock.leave(buildRoomName(room.id))
        sock.join(buildLobbyName())
        roomStore.delete(room.id)
        return resolve()
      }

      const result = roomStore.reduceUpdate(room.id, room => ({
        ...room,
        members: room.members.filter(v => v !== context.user?.userId),
      }))

      if (result?.members && !result.members.length) roomStore.delete(result.id)

      io.in(buildRoomName(result!.id)).emit(
        buildBroadcastEventName(Section.Room)(RoomSection.userLeft),
        { ...result, members: roomMembersPopulate(result!.members) },
      )
      sock.leave(buildRoomName(room.id))
      sock.join(buildLobbyName())
      return resolve()
    })

    addListener(
      'rename',
      (resolve, reject) => (roomId: Room['id'], newName: string) => {
        if (!exists(context.user))
          return reject({ reason: 'Forbidden', code: 403 })

        const roomIdSubmit = roomStore.findId(
          room => room.id === roomId && room.owner === context.user?.userId,
        )

        if (!exists(roomIdSubmit))
          return reject({ reason: "You're not an admin", code: 403 })

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
        return resolve(populated)
      },
    )

    addListener(
      'changeVisibility',
      (resolve, reject) => (roomId: Room['id'], isOpen: boolean) => {
        if (!exists(context.user))
          return reject({ reason: 'Forbidden', code: 403 })

        const roomIdSubmit = roomStore.findId(
          room => room.id === roomId && room.owner === context.user?.userId,
        )

        if (!exists(roomIdSubmit))
          return reject({ reason: "You're not an admin", code: 403 })

        const preparedHash = createRoomHash(context.user)

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
        return resolve(populated)
      },
    )

    addListener('list', (resolve, reject) => () => {
      const result = roomStore
        .selectSome(room => room.isOpen, 10)
        .map(v => populateRoom(v))
      return resolve(result)
    })

    addListener(
      'selectGame',
      (resolve, reject) => (roomId: Room['id'], gameId: Game['id'] | null) => {
        if (!exists(context.user))
          return reject({ reason: 'Forbidden', code: 403 })

        if (gameId !== null && !getGamesIds().includes(gameId)) {
          return reject({
            reason: "Game doesn't exist in this apchi instance",
            code: 404,
          })
        }

        const roomIdSubmit = roomStore.findId(
          room => room.id === roomId && room.owner === context.user?.userId,
        )
        if (!exists(roomIdSubmit))
          return reject({ reason: "You're not an admin", code: 403 })

        const result = roomStore.reduceUpdate(roomIdSubmit, room => ({
          ...room,
          game: gameId === null ? undefined : gameId,
        }))

        io.in(buildRoomName(roomIdSubmit)).emit(
          buildBroadcastEventName(Section.Room)(RoomSection.gameSelected),
          { game: gameId },
        )
        return resolve(result)
      },
    )

    addListener('gameStatus', (resolve, reject) => (roomId: Room['id']) => {
      if (!exists(context)) return reject({ reason: 'Forbidden', code: 403 })

      const room = roomStore.find(
        room => room.id === roomId && room.owner === context.user?.userId,
      )
      if (!exists(room) || !room.game || room.game?.length === 0)
        return reject({ reason: 'Join room first', code: 400 })

      const engine = GeneralDaemon.get(room.id)
      if (!engine) return reject({ reason: 'Game not started', code: 400 })

      return resolve({
        status: engine.gameStatus,
        game: engine.gameId,
      })
    })

    addListener('startGame', (resolve, reject) => (roomId: Room['id']) => {
      if (!exists(context.user))
        return reject({ reason: 'Forbidden', code: 403 })

      const room = roomStore.find(
        room => room.id === roomId && room.owner === context.user?.userId,
      )
      if (!exists(room))
        return reject({ reason: "You're not an admin", code: 403 })

      if (!room.game || room.game?.length === 0)
        return reject({ reason: 'Select Room first', code: 400 })

      setRoomEngine(room.id, room.game, {
        sendToRoom: sendToRoom(io, room.id),
        sendToUser: sendToUser(io, socketAuthStore),
      })

      const engine = GeneralDaemon.get(room.id)
      if (!engine)
        return reject({
          reason: 'Internal error, game engine not found',
          code: 500,
        })

      engine.setUsers(roomMembersPopulate(room.members))

      io.in(buildRoomName(room.id)).emit(
        buildBroadcastEventName(Section.Room)(RoomSection.gameStart),
        { game: room.game },
      )

      engine.startGame()

      return resolve()
    })
  },
})
