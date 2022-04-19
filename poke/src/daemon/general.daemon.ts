import { Room, Game } from '@apchi/shared'
import { Engine, games, gamesMap } from '@apchi/games'

export const getGamesClasses = () => games
export const getGamesList = () => games.map(v => v.meta)
export const getGamesIds = () => games.map(v => v.meta.id)
export const getGamesDict = () =>
  Object.fromEntries(games.map(v => [v.meta.id, v.meta]))

export const GeneralDaemon = new Map<Room['id'], Engine<any>>()

export const setRoomEngine = (roomId: Room['id'], engine: Game['id']) =>
  GeneralDaemon.set(roomId, new gamesMap[engine]())

export const clearRoomEngine = (roomId: Room['id']) =>
  GeneralDaemon.delete(roomId)
