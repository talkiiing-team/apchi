import { createServer } from 'http'
import { Server } from 'socket.io'
import { registerListeners } from './listeners'

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['polling', 'websocket'],
})

registerListeners(io)

export { httpServer }
