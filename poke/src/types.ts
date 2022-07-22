import { Server } from 'socket.io'
import { Socket } from 'socket.io'
import { Response, Router } from 'express'
import { User } from '@/models/User.model'
import { CrudMethodName } from '@/base/types'

export type EventName = string

export type ListenerFunction<Props = any> = (
  resolve: (...result: any[]) => void,
  reject: (...reason: any[]) => void,
  context: ControllerContext,
) => (...payload: Props[]) => void

export type EventDrivenListenerFunction = (
  context: ControllerContext,
) => (
  hash: string,
  ...payload: any[]
) => ReturnType<ReturnType<ListenerFunction>>

export type RestResponse = Response<any, Record<string, any>>

export type RestDrivenListenerFunction = (
  context: ControllerContext,
) => (
  res: RestResponse,
  ...payload: any[]
) => ReturnType<ReturnType<ListenerFunction>>

export type EventListenerMap = Map<EventName, EventDrivenListenerFunction>

export type RestListenerMap = Map<EventName, RestDrivenListenerFunction>

export type EventControllerRegistrar = (
  io: Server,
  socket: Socket,
  user?: User,
) => (controllers: Controller[]) => Promise<void>

export type RestControllerRegistrar = (
  router: Router,
) => (controllers: Controller[]) => Promise<void>

export type AddListenerFunction = <Props = any>(
  eventName: string,
  handler: ListenerFunction<Props>,
  specificTransport?: PokeTransports[],
) => void

export type ControllerContext<T extends Record<string, any> = {}> = {
  user: User | undefined
  event: string
  authRequired?: boolean
  transport: PokeTransports
} & T

export type ControllerRegisterer = (
  addListener: AddListenerFunction,
  helpers?: any,
) => InvalidationFunction | void

export type PokeTransports = 'ws' | 'rest'

export type Controller = {
  scope: string
  transport?: PokeTransports[]
  requireAuth?: boolean
  register: ControllerRegisterer
}

export type InvalidationFunction = () => void
