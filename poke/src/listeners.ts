import { createControllerRegistrar } from '@/common/createControllerRegistrators'
import { registerWallController } from '@/controllers/wall.controller'
import { registerAuthenticateController } from '@/controllers/authentication.controller'
import { logEvent } from '@/utils/logEvent'

logEvent('Creating registration handles...')

export const { registerAllEventControllers, registerAllRestControllers } =
  createControllerRegistrar([
    registerAuthenticateController,
    registerWallController,
  ])
