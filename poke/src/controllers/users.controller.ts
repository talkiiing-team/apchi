import { exposeCrud } from '@/common/exposeCrud'
import { userStore } from '@/store/user.store'
import { Server, Socket } from 'socket.io'

const basePrefix = 'users'

export const registerUsersController = (io: Server, sock: Socket) => {
  exposeCrud(userStore, ['get', 'patch', 'update', 'dump', 'dumpToArray'])(
    basePrefix,
  )(io, sock)
}
