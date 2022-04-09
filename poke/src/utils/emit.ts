import { Socket } from 'socket.io'

export const emit =
  (eventName: string, sock: Socket) =>
  (...obj: any) =>
    sock.emit(eventName, ...obj)
