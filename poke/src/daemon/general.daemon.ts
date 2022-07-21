import { Game, Room } from '@apchi/shared'
import { Engine, EngineUtils, gamesMap } from '@apchi/games'

export const GeneralDaemon = new Map<Room['id'], Engine<any>>()

export const setRoomEngine = (
  roomId: Room['id'],
  engine: Game['id'],
  engineUtils: EngineUtils,
) => GeneralDaemon.set(roomId, new gamesMap[engine](engineUtils))

export const clearRoomEngine = (roomId: Room['id']) =>
  GeneralDaemon.delete(roomId)
