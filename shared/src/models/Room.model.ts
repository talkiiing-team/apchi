import { User } from './User.model'

export type Room = {
  id: number
  name: string
  members: User['userId'][]
  owner: User['userId']
  isOpen: boolean
  code?: string
}

export type DetailedRoom = Omit<Room, 'members' | 'owner'> & {
  members: User[]
  owner: User
}

export const primaryKey = 'id'
