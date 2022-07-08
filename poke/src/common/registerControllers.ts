import {
  Controller,
  ControllerContext,
  ListenerFunction,
  ListenerMap,
} from '@/types'
import { Server, Socket } from 'socket.io'
import { authorizeUser, tryUserAuthorization } from '@/common/authorizeUser'
import { emit } from '@/utils/emit'
import { User } from '@/models/User.model'

export const registerControllers =
  (io: Server) => (socket: Socket) => async (controllers: Controller[]) => {
    const listenerMap: ListenerMap = new Map()

    const createResolve =
      (fullEventName: string, hash: string) => (result: any) =>
        emit(`${fullEventName}.resolved`, socket, hash)(result)

    const createReject =
      (fullEventName: string, hash: string) => (result: any) =>
        emit(`${fullEventName}.rejected`, socket, hash)(result)

    const addListener =
      (scope: string) => (eventName: string, handler: ListenerFunction) => {
        const fullEventName = `${scope}/${eventName}`
        listenerMap.set(fullEventName, (hash: string, ...params: any[]) =>
          handler(
            createResolve(fullEventName, hash),
            createReject(fullEventName, hash),
          )(...params),
        )
      }

    const context: ControllerContext = {
      user: tryUserAuthorization(socket),
    }

    await controllers.forEach(controller => {
      controller.register(io)(addListener(controller.scope), {
        socket,
        io,
        context,
      })
    })

    console.log('Listeners', listenerMap)

    listenerMap.forEach((listenerFn, eventName) => {
      socket.on(eventName, listenerFn)
    })

    socket.onAny((...args) => console.log(socket.id, socket.rooms, args))

    socket.on('disconnect', () => {
      listenerMap.forEach((listenerFn, eventName) =>
        socket.off(eventName, listenerFn),
      )
    })
  }
