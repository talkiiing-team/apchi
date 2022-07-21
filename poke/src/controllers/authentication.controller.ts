import { userStore } from '@/store/user.store'
import { authenticationStore } from '@/store/authentication.store'
import { Controller } from '@/types'
import { createController } from '@/common/createController'
import { exists } from '@/utils/exists'
import bcrypt from 'bcrypt'
import { REFRESH_TOKEN_LENGTH } from '@/config/secrets'
import {
  AuthCredentials,
  AuthStrategy,
  RegisterCredentials,
  RegisterStrategy,
} from '@/common/types/Strategy.model'
import { createRandomUserName } from '@/utils/helpers/createRandomUserName'
import { nanoid } from 'nanoid'
import { issueNewToken } from '@/utils/authentication/issueNewToken'

export const registerAuthenticateController: Controller = createController({
  scope: 'authentication',
  transport: ['rest'],
  requireAuth: false,
  register: (addListener, { socket, exposeCrud }) => {
    addListener('auth', (resolve, reject) => (payload: AuthCredentials) => {
      if (payload.strategy === AuthStrategy.Local) {
        if (!exists(payload.login) || !exists(payload.password))
          return reject({ reason: 'BAD_CREDENTIALS' })

        const auth = authenticationStore.find(
          authInfo => authInfo.login === payload.login,
        )
        if (!exists(auth)) return reject({ reason: 'USER_NOT_FOUND' })

        bcrypt.compare(payload.password, auth.password, (err, result) => {
          if (result) {
            return resolve(issueNewToken(auth))
          } else {
            return reject({ reason: 'BAD_CREDENTIALS' })
          }
        })
      } else if (payload.strategy === AuthStrategy.RefreshToken) {
        if (!exists(payload.refreshToken))
          return reject({ reason: 'EMPTY_REFRESH_TOKEN' })

        const auth = authenticationStore.find(
          authInfo => authInfo.refreshToken === payload.refreshToken,
        )
        if (!exists(auth)) return reject({ reason: 'INVALID_REFRESH_TOKEN' })

        return resolve(issueNewToken(auth))
      } else {
        return reject({
          reason: 'UNSUPPORTED_STRATEGY',
        })
      }
    })

    addListener(
      'register',
      (resolve, reject) => (payload: RegisterCredentials) => {
        if (payload.strategy === RegisterStrategy.Local) {
          if (!exists(payload.login) || !exists(payload.password))
            return reject({ reason: 'BAD_CREDENTIALS' })
          const auth = authenticationStore.find(
            authInfo => authInfo.login === payload.login,
          )
          if (exists(auth)) return reject({ reason: 'USER_ALREADY_EXISTS' })

          bcrypt.hash(payload.password, 10, (err, hash) => {
            if (err) {
              return reject({
                reason: 'CANT_SOLVE_PASSWORD',
                err: JSON.stringify(err),
                message: 'Please, contact maintainer',
              })
            }
            const auth = authenticationStore.create({
              login: payload.login,
              password: hash,
              refreshToken: nanoid(REFRESH_TOKEN_LENGTH),
            })
            const user = userStore.insert(auth.userId, {
              name: createRandomUserName(),
              userId: auth.userId,
            })

            return resolve(issueNewToken(auth))
          })
        } else {
          return reject({
            reason: 'UNSUPPORTED_STRATEGY',
          })
        }
      },
    )
  },
})
