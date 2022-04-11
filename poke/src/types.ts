import type { Server } from 'socket.io'
import { Socket } from 'socket.io'

export type EventName = string

export type ListenerFunction = (...args: any) => void

export type ListenerMap = Map<EventName, ListenerFunction>

/**
 * Listeners field - listeners to register
 */
export type Controller = (
  io: Server,
  socket: Socket,
  listeners: ListenerMap,
) => void
