import { Server, Socket } from 'socket.io'
import { buildPrefix } from '@/utils/buildPrefix'
import { emit } from '@/utils/emit'
import { getContextUser, getContextUserId } from '@/utils/getContext'
import { Controller } from '@/types'
import { exists } from '@/utils/controllerUtils'
import { getGamesList } from '@apchi/games'
import { GeneralDaemon } from '@/daemon/general.daemon'
import { Room } from '@apchi/shared'
import roomStore from '@/store/room.store'

const basePrefix = 'game'
const prefix = buildPrefix(basePrefix)

export const registerGameController: Controller = (io: Server) => {
  return (sock: Socket, listeners) => {
    listeners.set(
      prefix('do'),
      (roomId: Room['id'], action: string, ...args: any[]) => {
        const user = getContextUser(sock)
        if (!exists(user))
          return emit(
            prefix('do.err'),
            sock,
          )({ reason: 'Forbidden', code: 403 })

        if (!roomStore.get(roomId)) {
          return emit(
            prefix('do.err'),
            sock,
          )({ reason: 'No room found', code: 404 })
        }

        try {
          const result = GeneralDaemon.get(roomId)?.applyAction(
            user,
            action,
            ...args,
          )
          return emit(prefix('do.done'), sock)(result)
        } catch (e) {
          return emit(prefix('do.err'), sock)(e)
        }
      },
    )

    listeners.set(prefix('getState'), (roomId: Room['id']) => {
      const user = getContextUser(sock)
      if (!exists(user))
        return emit(
          prefix('getState.err'),
          sock,
        )({ reason: 'Forbidden', code: 403 })

      if (!roomStore.get(roomId)) {
        return emit(
          prefix('getState.err'),
          sock,
        )({ reason: 'No room found', code: 404 })
      }

      const result = GeneralDaemon.get(roomId)?.safeState

      return emit(prefix('getState.done'), sock)(result)
    })
  }
}
