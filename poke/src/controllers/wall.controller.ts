import { wallStore } from '@/store/wall.store'
import { Controller } from '@/types'
import { createController } from '@/common/createController'
import { WallPost } from '@/models/Wall.model'

export const registerWallController: Controller = createController({
  scope: 'wall',
  requireAuth: false,
  transport: ['ws'],
  register: (addListener, { socket: sock, exposeCrud }) => {
    addListener<WallPost>(
      'createPost',
      (resolve, reject, context) => item => {
        const result = wallStore.create(item)
        resolve(result)
      },
      ['rest'],
    )

    addListener('list', (resolve, reject, context) => (target: number) => {
      resolve(wallStore.findAll(post => post.target === target))
    })

    addListener(
      'get',
      (resolve, reject, context) =>
        ({ target }: { target: number }) => {
          // @ts-ignore
          const newid = wallStore.create({ suck: 'cock' }).id
          console.log(typeof target)
          resolve({ content: wallStore.get(target), newId: newid })
        },
    )

    addListener('test', (resolve, reject, context) => () => {
      resolve(wallStore.dumpToArray(5))
    })
  },
})
