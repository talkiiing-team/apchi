import { Controller, ListenerMap } from '@/types'
import { Server, Socket } from 'socket.io'

export const registerControllers =
  (io: Server, socket: Socket) => async (controllers: Controller[]) => {
    const listenerMap: ListenerMap = new Map()
    await controllers.forEach(controller => controller(io, socket, listenerMap))
    console.log('listeners', listenerMap)
    listenerMap.forEach((listenerFn, eventName) => {
      socket.on(eventName, listenerFn)
    })

    socket.onAny((...args) => console.log(socket.rooms, args))

    socket.on('disconnect', () => {
      listenerMap.forEach((listenerFn, eventName) =>
        socket.off(eventName, listenerFn),
      )
    })
  }
