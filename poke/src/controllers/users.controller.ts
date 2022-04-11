import { exposeCrud } from '@/common/exposeCrud'
import { userStore } from '@/store/user.store'
import { Server, Socket } from 'socket.io'
import { Controller } from '@/types'

const basePrefix = 'users'

export const registerUsersController: Controller = (
  io: Server,
  sock: Socket,
  listeners,
) => {
  exposeCrud(userStore, ['get', 'patch', 'update', 'dump', 'dumpToArray'])(
    basePrefix,
  )(io, sock, listeners)
}
