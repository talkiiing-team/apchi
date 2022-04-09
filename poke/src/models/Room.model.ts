import { User } from '@/models/User.model'

export type Room = {
  id: number
  name: string
  members: User['id'][]
}

export const primaryKey = 'id'
