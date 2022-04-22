import { Server, Socket } from 'socket.io'
import { buildPrefix } from '@/utils/buildPrefix'
import { emit } from '@/utils/emit'
import { getContextUser, getContextUserId } from '@/utils/getContext'
import { Controller } from '@/types'
import { exists } from '@/utils/controllerUtils'
import { getGamesList } from '@apchi/games'

const basePrefix = 'games'
const prefix = buildPrefix(basePrefix)

export const registerGamesController: Controller = (io: Server) => {
  return (sock: Socket, listeners) => {
    listeners.set(prefix('list'), () => {
      const user = getContextUser(sock)
      if (!exists(user))
        return emit(
          prefix('list.err'),
          sock,
        )({ reason: 'Forbidden', code: 403 })

      return emit(prefix('list.done'), sock)(getGamesList())
    })
  }
}
