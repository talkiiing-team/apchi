import { Socket } from 'socket.io'
import { User } from '@apchi/shared'

export type SocketAuth = {
  socketId: Socket['id']
  userId: User['userId']
}

export const primaryKey = 'socketId'
