import { User } from '@apchi/shared'

export type Room = {
  id: number
  name: string
  members: User['userId'][]
}

export const primaryKey = 'id'
