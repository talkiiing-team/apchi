import { Socket } from 'socket.io'
import { User } from '@/models/User.model'
import { getContextUser } from '@/utils/getContext'

export type AuthorizeInfo =
  | {
      success: false
    }
  | {
      success: true
      user: User
    }

export const authorizeUser = (socket: Socket): AuthorizeInfo => {
  const user = getContextUser(socket)
  return user ? { user, success: true } : { success: false }
}

export const tryUserAuthorization = (socket: Socket): User | undefined => {
  return getContextUser(socket)
}
