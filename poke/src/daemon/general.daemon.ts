import { Room, Game, Crud, User } from '@apchi/shared'
import { Engine, EngineUtils, gamesMap } from '@apchi/games'
import { Server } from 'socket.io'
import { buildRoomName } from '@/utils/buildRoomName'
import { SocketAuth } from '@/models/SocketAuth.model'

export const sendToRoom =
  (io: Server, room: Room['id']) =>
  (event: string, ...args: any[]) =>
    io.to(buildRoomName(room)).emit(event, ...args)

export const sendToUser =
  (io: Server, authStore: Crud<SocketAuth, 'socketId'>) =>
  (userId: User['userId'], event: string, ...args: any[]) => {
    const socket = authStore.find(v => v.userId === userId)?.socketId
    if (!socket) return
    io.to(socket).emit(event, ...args)
  }

export const GeneralDaemon = new Map<Room['id'], Engine<any>>()

export const setRoomEngine = (
  roomId: Room['id'],
  engine: Game['id'],
  engineUtils: EngineUtils,
) => GeneralDaemon.set(roomId, new gamesMap[engine](engineUtils))

export const clearRoomEngine = (roomId: Room['id']) =>
  GeneralDaemon.delete(roomId)
