import { Server } from 'socket.io'
import { registerControllers } from '@/common/registerControllers'
import { registerWallController } from '@/controllers/wall.controller'

export const registerListeners = (io: Server) => {
  io.on('connection', sock => {
    registerControllers(io)(sock)([registerWallController])
  })
}
