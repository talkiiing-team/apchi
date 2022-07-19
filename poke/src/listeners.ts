import { registerWallController } from '@/controllers/wall.controller'
import { createControllerRegistrar } from '@/common/createControllerRegistrators'

export const { registerAllEventControllers, registerAllRestControllers } =
  createControllerRegistrar([registerWallController])
