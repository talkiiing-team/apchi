import {
  Controller,
  ControllerContext,
  ListenerFunction,
  EventListenerMap,
  RestResponse,
  PokeTransports,
  RestListenerMap,
  EventControllerRegistrar,
} from '@/types'
import { Server, Socket } from 'socket.io'
import { emit } from '@/transporter/emit'
import { exists } from '@/utils/exists'
import { handlerRestrictUnauthorized } from '@/common/universal/handlerRestrictUnauthorized'

export const registerEventControllers: EventControllerRegistrar =
  (io: Server, socket: Socket, user) => async (controllers: Controller[]) => {
    const eventListenerMap: EventListenerMap = new Map()

    const createSocketResolve =
      (fullEventName: string, hash: string) => (result: any) =>
        emit(`${fullEventName}.resolved`, socket, hash)(result)

    const createSocketReject =
      (fullEventName: string, hash: string) => (result: any) =>
        emit(`${fullEventName}.rejected`, socket, hash)(result)

    const addListener =
      (
        scope: string,
        authRequired?: boolean,
        controllerTransport?: PokeTransports[],
      ) =>
      (
        eventName: string,
        handler: ListenerFunction,
        specificTransport?: PokeTransports[],
      ) => {
        const fullEventRouteName = `${scope}/${eventName}`

        const setEventListener = () => {
          eventListenerMap.set(
            fullEventRouteName,
            (context: ControllerContext) =>
              (hash: string, ...params: any[]) => {
                if (!authRequired || exists(context.user))
                  return handler(
                    createSocketResolve(fullEventRouteName, hash),
                    createSocketReject(fullEventRouteName, hash),
                    context,
                  )(...params)
                return handlerRestrictUnauthorized(
                  createSocketReject(fullEventRouteName, hash),
                )
              },
          )
        }

        const setFallbackEventListener = () => {
          eventListenerMap.set(
            fullEventRouteName,
            (context: ControllerContext) => (hash: string) => {
              createSocketReject(
                fullEventRouteName,
                hash,
              )({
                status: 'Unreachable',
                solution: 'ROLL_TO_REST',
                handler: fullEventRouteName,
              })
            },
          )
        }

        /**
         * Defaults to only WS API if some specific options wasn't passed
         * Then listener is more important, then controller
         */
        if (specificTransport?.includes('ws')) {
          setEventListener()
        } else {
          if (!controllerTransport || !controllerTransport.length) {
            setEventListener()
          } else {
            if (controllerTransport.includes('ws')) {
              setEventListener()
            } else {
              setFallbackEventListener()
            }
          }
        }
      }

    await controllers.forEach(controller => {
      controller.register(
        addListener(
          controller.scope,
          controller.requireAuth,
          controller.transport,
        ),
      )
    })

    console.log('Event Listeners', eventListenerMap)

    /**
     * START Socket Registration Section
     */

    const context: Partial<Omit<ControllerContext, 'event'>> = {
      transport: 'ws',
    }

    eventListenerMap.forEach((listenerFn, eventName) => {
      socket.on(
        eventName,
        // @ts-ignore
        listenerFn({ ...context, user: user, event: eventName }),
      )
    })

    socket.onAny((...args) => console.log(socket.id, socket.rooms, args))

    socket.on('disconnect', () => {
      eventListenerMap.forEach((listenerFn, eventName) =>
        socket.off(eventName, listenerFn),
      )
    })

    /**
     * END Socket Registration Section
     */
  }
