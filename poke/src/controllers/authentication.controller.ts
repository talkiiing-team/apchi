import { Server, Socket } from 'socket.io'
import { userStore } from '@/store/user.store'
import { authenticationStore } from '@/store/authentication.store'
import { buildPrefix } from '@/utils/buildPrefix'
import { emit } from '@/utils/emit'
import { User, Credentials } from '@apchi/shared'
import socketAuthStore from '@/store/socketAuth.store'
import { Controller } from '@/types'
import { buildLobbyName } from '@/utils/buildLobbyName'

const basePrefix = 'authentication'
const prefix = buildPrefix(basePrefix)

export const registerAuthenticateController: Controller =
  (io: Server) => (sock: Socket, listeners) => {
    listeners.set(
      prefix('auth'),
      ({ userId, password }: { userId: number; password?: string }) => {
        if (!Number.isInteger(userId)) return
        const auth = authenticationStore.get(userId)

        if (!auth)
          return emit(
            prefix('auth.err'),
            sock,
          )({ reason: 'No user found', code: 400 })

        if (auth.password === password) {
          socketAuthStore.insert(sock.id, { userId, socketId: sock.id })
          sock.join(buildLobbyName())
          return emit(prefix('auth.done'), sock)({ userId })
        } else
          return emit(
            prefix('auth.err'),
            sock,
          )({ reason: 'Bad credentials', code: 403 })
      },
    )

    listeners.set(
      prefix('register'),

      ({ userId, password, ...userModel }: Omit<User, 'id'> & Credentials) => {
        if (!Number.isInteger(userId))
          return emit(
            prefix('register.err'),
            sock,
          )({ reason: 'Invalid userId', code: 400 })

        const auth = authenticationStore.get(userId)
        const user = userStore.get(userId)
        if (auth || user) {
          return emit(
            prefix('register.err'),
            sock,
          )({ reason: 'User already exists', code: 400 })
        }
        // Can create user

        const newUser = { ...userModel, userId }

        userStore.insert(userId, newUser)
        authenticationStore.insert(userId, { password, userId })

        socketAuthStore.insert(sock.id, { userId, socketId: sock.id })

        sock.join(buildLobbyName())
        return emit(prefix('register.done'), sock)(newUser)
      },
    )
  }
