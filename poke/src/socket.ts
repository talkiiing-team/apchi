import { Server } from 'socket.io'
import type { Server as HTTPServer } from 'http'
import { registerListeners } from './listeners'

const createSocketIO = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['polling', 'websocket'],
  })

  registerListeners(io)
}

export { createSocketIO }
