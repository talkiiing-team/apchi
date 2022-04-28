import { Role, Stage } from '../shared'

export type MafiaClientState = {
  stage: Stage
  round: number
  role?: Role
}
