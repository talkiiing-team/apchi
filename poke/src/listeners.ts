import { Server } from 'socket.io'
import { registerUsersController } from './controllers/users.controller'
import { registerRoomsController } from '@/controllers/rooms.controller'
import { registerAuthenticateController } from '@/controllers/authentication.controller'
import { registerControllers } from '@/common/registerController'
import { registerGamesController } from '@/controllers/games.controller'

export const registerListeners = (io: Server) => {
  io.on('connection', sock => {
    registerControllers(io)(sock)([
      registerUsersController,
      registerRoomsController,
      registerAuthenticateController,
      registerGamesController,
    ])
  })
}
