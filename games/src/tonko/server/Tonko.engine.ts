import { Engine } from '../../common/Engine'

import jokes from '../assets/jokes.json'
import { Game } from '@apchi/shared'

type Round = number

const shuffle = (arr: Array<unknown>) => {
  return [...arr].sort(() => Math.random() - Math.random())
}

const shuffleOn = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    return [i, (i + 1) % count]
  })
}

export enum Stage {
  Off = 'off',
  Starting = 'starting',
  Punching = 'punching',
  Voting = 'voting',
  Overviewing = 'overviewing',
}

export type TonkoState = {
  stage: Stage
  round: Round
  maxRounds: number
}

export class TonkoEngine extends Engine<TonkoState> {
  static meta: Game = {
    id: 'tonko',
    name: 'Tonko',
    description: 'Тебе сетап - нам панчлайн, если смешно - очко!',
  }

  protected onGameStart() {
    this.state.stage = Stage.Starting
  }

  protected onStateChange(): Function | void {
    console.log('smth updated')
  }

  protected onGameFinish(): void {}

  constructor() {
    super({ stage: Stage.Off, round: 0, maxRounds: 2 }, { users: [] })
  }
}

const game = new TonkoEngine()
