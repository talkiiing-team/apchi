import { User } from './User.model'
import { Game } from './Game.model'

export type Room = {
  id: number
  name: string
  members: User['userId'][]
  owner: User['userId']
  isOpen: boolean
  code?: string
  game?: Game['id']
}

export type DetailedRoom = Omit<Room, 'members' | 'owner'> & {
  members: User[]
  owner: User
}

export const roomPrimaryKey = 'id'
