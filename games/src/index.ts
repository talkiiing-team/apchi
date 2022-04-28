export * from './common/Engine'

import { TonkoEngine as Tonko } from './tonko/server/Tonko.engine'

export const games = [Tonko] as const

export const getGamesClasses = () => games
export const getGamesList = () => games.map(v => v.meta)
export const getGamesIds = () => games.map(v => v.meta.id)
export const getGamesMap = () =>
  Object.fromEntries(games.map(v => [v.meta.id, v.meta]))

export const gamesMap = Object.fromEntries(
  games.map(engine => [engine.meta.id, engine]),
)
