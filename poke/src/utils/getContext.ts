import { Socket } from 'socket.io'
import socketAuthStore from '@/store/socketAuth.store'
import userStore from '@/store/user.store'

export const getContextUserId = (sock: Socket) =>
  socketAuthStore.get(sock.id)?.userId

export const getContextUser = (sock: Socket) =>
  userStore.get(getContextUserId(sock))
