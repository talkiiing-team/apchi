import { userStore } from '@/store/user.store'
import { authenticationStore } from '@/store/authentication.store'
import { Controller } from '@/types'
import { createController } from '@/common/createController'
import { exists } from '@/utils/exists'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {
  JWT_KEY,
  JWT_LIFETIME_SEC,
  REFRESH_TOKEN_LENGTH,
} from '@/config/secrets'
import {
  AuthCredentials,
  AuthStrategy,
  RegisterCredentials,
  RegisterStrategy,
} from '@/common/types/Strategy.model'
import { createRandomUserName } from '@/utils/helpers/createRandomUserName'
import { nanoid } from 'nanoid'

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
            const newRefreshToken = nanoid(REFRESH_TOKEN_LENGTH)
            authenticationStore.reduceUpdate(auth.userId, data => ({
              ...data,
              refreshToken: newRefreshToken,
            }))
            return resolve({
              userId: auth.userId,
              login: auth.login,
              token: jwt.sign({ userId: auth.userId }, JWT_KEY, {
                expiresIn: JWT_LIFETIME_SEC,
              }),
              refreshToken: newRefreshToken,
            })
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

        const newRefreshToken = nanoid(REFRESH_TOKEN_LENGTH)
        authenticationStore.reduceUpdate(auth.userId, data => ({
          ...data,
          refreshToken: newRefreshToken,
        }))
        return resolve({
          userId: auth.userId,
          login: auth.login,
          token: jwt.sign({ userId: auth.userId }, JWT_KEY, {
            expiresIn: JWT_LIFETIME_SEC,
          }),
          refreshToken: newRefreshToken,
        })
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
              })
            }
            const authIdentity = authenticationStore.create({
              login: payload.login,
              password: hash,
              refreshToken: nanoid(REFRESH_TOKEN_LENGTH),
            })
            const user = userStore.insert(authIdentity.userId, {
              name: createRandomUserName(),
              userId: authIdentity.userId,
            })

            const newRefreshToken = nanoid(REFRESH_TOKEN_LENGTH)
            authenticationStore.reduceUpdate(authIdentity.userId, data => ({
              ...data,
              refreshToken: newRefreshToken,
            }))
            return resolve({
              userId: user!.userId,
              login: authIdentity.login,
              token: jwt.sign({ userId: user!.userId }, JWT_KEY, {
                expiresIn: JWT_LIFETIME_SEC,
              }),
              refreshToken: newRefreshToken,
            })
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
