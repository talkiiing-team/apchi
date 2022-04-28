import { Requirements } from './Requirements.model'

export type Game = {
  id: string // ex. tonko-game
  name: string // ex. Tonko
  description?: string // ex. Word game for people
  requirements?: Partial<Requirements>
}

export const gamePrimaryKey = 'id'
