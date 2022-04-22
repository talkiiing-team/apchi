import { Joke, Stage } from '../shared'

export type TonkoClientState = {
  stage: Stage
  round: number
  maxRounds: number
  jokes?: Joke[]
}
