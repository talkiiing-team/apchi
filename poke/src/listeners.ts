import { Server } from 'socket.io'
import { registerUsersController } from './controllers/users.controller'
import { registerRoomsController } from '@/controllers/rooms.controller'
import { registerAuthenticateController } from '@/controllers/authenticate.controller'

export const registerListeners = (io: Server) => {
  io.on('connection', sock => {
    registerUsersController(io, sock)
    registerRoomsController(io, sock)
    registerAuthenticateController(io, sock)
  })
}
