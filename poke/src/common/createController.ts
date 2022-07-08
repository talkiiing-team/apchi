import { Controller, ControllerRegisterer } from '@/types'
import { Server } from 'socket.io'

export const createController = (controller: {
  register: ControllerRegisterer
  scope: Controller['scope']
  requireAuth?: Controller['requireAuth']
}): Controller => {
  return {
    scope: controller.scope,
    requireAuth: controller.requireAuth,
    register: (io: Server) => controller.register,
  }
}
