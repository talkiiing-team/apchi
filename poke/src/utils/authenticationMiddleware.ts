import jwt from 'jsonwebtoken'
import { JWT_KEY } from '@/config/secrets'
import userStore from '@/store/user.store'
import { exists } from '@/utils/exists'
import express from 'express'

export const authenticationExpressMiddleware: express.RequestHandler = (
  req,
  res,
  next,
) => {
  if (req.headers.authorization) {
    jwt.verify(
      req.headers.authorization.split(' ')[1],
      JWT_KEY,
      (err, payload) => {
        if (err) next()
        else if (payload) {
          const predictableUser = userStore.get(
            (payload as jwt.JwtPayload).userId,
          )
          if (exists(predictableUser)) {
            res.locals.user = predictableUser
          }
          next()
        }
      },
    )
  } else {
    next()
  }
}

export const authenticationSocketMiddleware = (authHeader?: string) =>
  new Promise(res => {
    if (authHeader) {
      jwt.verify(
        authHeader.split(' ')[1],
        JWT_KEY as jwt.Secret,
        (err, payload) => {
          if (err) return res(undefined)
          else if (payload) {
            const predictableUser = userStore.get(
              (payload as jwt.JwtPayload).userId,
            )
            if (exists(predictableUser)) {
              return res(predictableUser)
            }
            return res(undefined)
          }
        },
      )
    }
    return res(undefined)
  })
