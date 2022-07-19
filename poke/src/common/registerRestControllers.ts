import {
  Controller,
  ListenerFunction,
  RestResponse,
  PokeTransports,
  RestListenerMap,
  RestControllerRegistrar,
} from '@/types'
import { Router } from 'express'

export const registerRestControllers: RestControllerRegistrar =
  (router: Router) => async (controllers: Controller[]) => {
    const restListenerMap: RestListenerMap = new Map()

    const createRestResolve = (res: RestResponse) => (result: any) =>
      res.json({ status: 'resolved', result: result })

    const createRestReject = (res: RestResponse) => (result: any) =>
      res.json({ status: 'rejected', result: result })

    const addListener =
      (scope: string, controllerTransport?: PokeTransports[]) =>
      (
        eventName: string,
        handler: ListenerFunction,
        specificTransport?: PokeTransports[],
      ) => {
        const fullEventRouteName = `${scope}/${eventName}`

        const setRestListener = () => {
          restListenerMap.set(
            fullEventRouteName,
            context =>
              (res, ...params: any[]) =>
                handler(
                  createRestResolve(res),
                  createRestReject(res),
                  context,
                )(...params),
          )
        }

        const setFallbackRestListener = () => {
          restListenerMap.set(
            fullEventRouteName,
            context => res =>
              res.json({
                status: 'Unreachable',
                solution: 'ROLL_TO_WS',
                handler: fullEventRouteName,
              }),
          )
        }

        /**
         * Defaults to only WS API if some specific options wasn't passed
         * Then listener is more important, then controller
         */

        if (specificTransport) {
          if (specificTransport.includes('rest')) {
            setRestListener()
          } else {
            setFallbackRestListener()
          }
        } else {
          if (controllerTransport?.includes('rest')) {
            setRestListener()
          } else {
            setFallbackRestListener()
          }
        }
      }

    await controllers.forEach(controller => {
      let socket = null
      controller.register(addListener(controller.scope, controller.transport), {
        // @ts-ignore
        socket,
      })
    })

    console.log('Rest Listeners', restListenerMap)

    /**
     * START Rest Registration Section
     */

    restListenerMap.forEach((listenerFn, eventName) => {
      router.post(`/${eventName}`, (req, res) => {
        return listenerFn({
          user: { userId: 0, name: 'test' },
          event: eventName,
        })(res, req.body)
      })
    })

    /**
     * END Rest Registration Section
     */
  }
