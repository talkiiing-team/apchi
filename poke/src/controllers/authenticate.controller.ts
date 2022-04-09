import { flow, pipe } from 'fp-ts/lib/function'
import { Server, Socket } from 'socket.io'
import { userStore } from '@/store/user.store'
import { authenticationStore } from '@/store/authentication.store'
import { buildPrefix } from '@/utils/buildPrefix'
import { emit } from '@/utils/emit'
import { User } from '@/models/User.model'
import { Credentials } from '@/models/Credentials.model'

const basePrefix = 'authentication'
const prefix = buildPrefix(basePrefix)

export const registerAuthenticateController = (io: Server, sock: Socket) => {
  sock.on(
    prefix('auth'),
    flow((userId: number, password?: string) => {
      if (!Number.isInteger(userId)) return
      const auth = authenticationStore.get(userId)

      if (!auth)
        return emit(
          prefix('auth.err'),
          sock,
        )({ reason: 'No user found', code: 400 })

      if (auth.password === password)
        return emit(prefix('auth.done'), sock)({ userId })
      else
        return emit(
          prefix('auth.err'),
          sock,
        )({ reason: 'Bad credentials', code: 403 })
    }),
  )

  sock.on(
    prefix('register'),
    flow(
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

        return emit(prefix('register.done'), sock)(newUser)
      },
    ),
  )
}
