export * from './common/Engine'

import { SpyEngine as Spy } from './spy/server/Spy.engine'

export const games = [Spy] as const

export const getGamesClasses = () => games
export const getGamesList = () => games.map(v => v.meta)
export const getGamesIds = () => games.map(v => v.meta.id)
export const getGamesMap = () =>
  Object.fromEntries(games.map(v => [v.meta.id, v.meta]))

export const gamesMap = Object.fromEntries(
  games.map(engine => [engine.meta.id, engine]),
)
