import { Socket } from 'socket.io'

export const emit =
  (eventName: string, sock: Socket, hash: string) =>
  (...obj: any) =>
    sock.emit(eventName, hash, ...obj)
