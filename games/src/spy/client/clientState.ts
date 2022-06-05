import { Location, Role, Stage } from '../shared'

export type SpyClientState = {
  stage: Stage
  role?: Role
  location?: Location
  locations?: Location[]
}
