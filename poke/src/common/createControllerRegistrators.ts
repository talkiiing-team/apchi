import { Controller } from '@/types'
import { Server } from 'socket.io'
import { registerEventControllers } from '@/common/registerEventControllers'
import { Router } from 'express'
import { registerRestControllers } from '@/common/registerRestControllers'
import { authenticationSocketMiddleware } from '@/utils/authenticationMiddleware'
import { User } from '@/models/User.model'

export const createControllerRegistrar = (
  controllers: Controller[],
): {
  registerAllEventControllers: (io: Server) => void
  registerAllRestControllers: (router: Router) => void
} => {
  const registerAllEventControllers = (io: Server) => {
    // auto registration socket routes for each client
    io.on('connection', socket => {
      authenticationSocketMiddleware(
        socket.client.request.headers.authorization,
      ).then(user =>
        registerEventControllers(
          io,
          socket,
          user as User | undefined,
        )(controllers),
      )
    })
  }

  const registerAllRestControllers = (router: Router) => {
    registerRestControllers(router)(controllers)
  }

  return { registerAllEventControllers, registerAllRestControllers }
}
