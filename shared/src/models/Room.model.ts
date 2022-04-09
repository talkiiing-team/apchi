import { User } from './User.model'

export type Room = {
  id: number
  name: string
  members: User['userId'][]
}

export const primaryKey = 'id'
