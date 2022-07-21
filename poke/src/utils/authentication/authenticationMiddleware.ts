import jwt from 'jsonwebtoken'
import { JWT_KEY } from '@/config/secrets'
import userStore from '@/store/user.store'
import { exists } from '@/utils/exists'
import express from 'express'
import { authenticatePayload } from '@/utils/authentication/authenticatePayload'

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
        else if (payload && typeof payload !== 'string') {
          res.locals.user = authenticatePayload(payload)
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
          if (!err && payload && typeof payload !== 'string') {
            res(authenticatePayload(payload))
          }
          return res(undefined)
        },
      )
    } else {
      return res(undefined)
    }
  })
