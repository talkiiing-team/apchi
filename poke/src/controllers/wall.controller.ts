import { wallStore } from '@/store/wall.store'
import { Controller } from '@/types'
import { createController } from '@/common/createController'
import { WallPost } from '@/models/Wall.model'

export const registerWallController: Controller = createController({
  scope: 'wall',
  requireAuth: false,
  register: (addListener, { socket: sock, io, exposeCrud, context }) => {
    addListener('createPost', (resolve, reject) => (item: WallPost) => {
      const result = wallStore.create(item)
      resolve(result)
    })

    addListener('list', (resolve, reject) => (target: number) => {
      resolve(wallStore.findAll(post => post.target === target))
    })

    addListener('get', (resolve, reject) => (target: number) => {
      resolve(wallStore.get(target))
    })
  },
})
