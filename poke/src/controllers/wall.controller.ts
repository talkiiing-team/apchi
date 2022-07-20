import { wallStore } from '@/store/wall.store'
import { Controller } from '@/types'
import { createController } from '@/common/createController'
import { WallPost } from '@/models/Wall.model'

export const registerWallController: Controller = createController({
  scope: 'wall',
  requireAuth: false,
  transport: ['rest'],
  register: (addListener, { socket: sock, exposeCrud }) => {
    addListener<WallPost>(
      'createPost',
      (resolve, reject, context) => item => {
        const result = wallStore.create(item)
        resolve(result)
      },
      ['rest'],
    )

    addListener(
      'get',
      (resolve, reject, context) =>
        ({ target }: { target: number }) => {
          // @ts-ignore
          const newid = wallStore.create({ suck: 'cock' }).id
          resolve({ content: wallStore.get(target), newId: newid, context })
        },
    )

    addListener('list', (resolve, reject, context) => () => {
      resolve(wallStore.dumpToArray(5))
    })
  },
})
