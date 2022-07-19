import { userStore } from '@/store/user.store'
import { authenticationStore } from '@/store/authentication.store'
import { User, Credentials } from '@apchi/shared'
import socketAuthStore from '@/store/socketAuth.store'
import { Controller, PokeAction } from '@/types'
import { buildLobbyName } from '@/utils/buildLobbyName'
import { createController } from '@/common/createController'

export const registerAuthenticateController: Controller = createController({
  scope: 'authentication',
  transport: ['ws', 'rest'],
  requireAuth: false,
  register: (addListener, { socket, exposeCrud }) => {
    addListener(
      'auth',
      (resolve, reject, context) =>
        ({ userId, password }: { userId: number; password?: string }) => {
          if (!Number.isInteger(userId)) return
          const auth = authenticationStore.get(userId)

          if (!auth) return reject({ reason: 'No user found', code: 400 })

          if (auth.password === password) {
            socketAuthStore.insert(socket.id, { userId, socketId: socket.id })
            context.user = userStore.get(userId)
            socket.join(buildLobbyName())
            return resolve({ userId })
          } else return reject({ reason: 'Bad credentials', code: 403 })
        },
    )

    addListener(
      'register',
      (resolve, reject, context) =>
        ({
          userId,
          password,
          ...userModel
        }: Omit<User, 'id'> & Credentials) => {
          if (!Number.isInteger(userId))
            return reject({ reason: 'Invalid userId', code: 400 })

          const auth = authenticationStore.get(userId)
          const foundUser = userStore.get(userId)
          if (auth || foundUser) {
            return reject({ reason: 'User already exists', code: 400 })
          }
          // Can create user

          const newUser = { ...userModel, userId }

          userStore.insert(userId, newUser)
          authenticationStore.insert(userId, { password, userId })

          socketAuthStore.insert(socket.id, { userId, socketId: socket.id })
          context.user = newUser

          socket.join(buildLobbyName())
          return resolve(newUser)
        },
    )
  },
})
