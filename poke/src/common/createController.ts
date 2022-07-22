import { Controller, ControllerRegisterer } from '@/types'
import { Server } from 'socket.io'

export const createController = (controller: {
  scope: Controller['scope']
  transport?: Controller['transport']
  requireAuth?: Controller['requireAuth']
  register: ControllerRegisterer
}): Controller => {
  return {
    scope: controller.scope,
    transport: controller.transport,
    requireAuth: controller.requireAuth,
    register: controller.register,
  }
}
