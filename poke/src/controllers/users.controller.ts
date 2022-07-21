import { exposeCrud } from '@/common/exposeCrud'
import { userStore } from '@/store/user.store'
import { Server, Socket } from 'socket.io'
import { Controller } from '@/types'
import { createController } from '@/common/createController'

export const registerUsersController: Controller = createController({
  scope: 'users',
  requireAuth: true,
  transport: ['ws', 'rest'],
  register: addListener => {
    exposeCrud(userStore, ['get', 'patch', 'update', 'dump', 'dumpToArray'])(
      addListener,
    )
  },
})
