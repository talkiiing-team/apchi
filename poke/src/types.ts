import { Server } from 'socket.io'
import { Socket } from 'socket.io'
import { User } from '@/models/User.model'

export type EventName = string

export type RequestHash = string

export type ListenerFunction = (
  resolve: (...result: any[]) => void,
  reject: (...reason: any[]) => void,
) => (...args: any[]) => void

export type EventDrivenListenerFunction = (
  hash: string,
  ...args: any[]
) => ReturnType<ReturnType<ListenerFunction>>

export type ListenerMap = Map<EventName, EventDrivenListenerFunction>

export type AddListenerFunction = (
  eventName: string,
  handler: ListenerFunction,
) => void

export type ExposeCrudFunction = []

export type ControllerContext<T extends Record<string, any> = {}> = {
  user?: User
} & T

export type ControllerRegisterer = (
  addListener: AddListenerFunction,
  {
    socket,
    io,
    exposeCrud,
    context,
  }: {
    socket: Socket
    io: Server
    exposeCrud?: ExposeCrudFunction
    context: ControllerContext
  },
) => InvalidationFunction | void

export type Controller = {
  scope: string
  requireAuth?: boolean
  register: (io: Server) => ControllerRegisterer
}

export type InvalidationFunction = () => void
