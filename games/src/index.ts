export { Engine } from './common/Engine'
import { TonkoEngine as Tonko } from './tonko/server/Tonko.engine'

export const games = [Tonko] as const

export const gamesMap = Object.fromEntries(
  games.map(engine => [engine.meta.id, engine]),
)
