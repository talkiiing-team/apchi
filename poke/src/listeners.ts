import { createControllerRegistrar } from '@/common/createControllerRegistrators'
import { registerWallController } from '@/controllers/wall.controller'
import { registerAuthenticateController } from '@/controllers/authentication.controller'

export const { registerAllEventControllers, registerAllRestControllers } =
  createControllerRegistrar([
    registerAuthenticateController,
    registerWallController,
  ])
