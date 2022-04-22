import { Engine, EngineUtils } from '../../common/Engine'
import { v4 as uuidv4 } from 'uuid'
import jokes from '../assets/jokes.json'
import { Crud, Game, User, useTable } from '@apchi/shared'
import { buildTonkoGameEvent, Joke, Stage, TonkoGameEvent } from '../shared'

type Round = number

const shuffle = <T>(arr: Array<T>) => {
  return [...arr].sort(() => Math.random() - Math.random())
}

const getJokeSets = (count: number, jokeArray: Array<Joke>) => {
  return Array.from({ length: count }, (_, i) => {
    return [jokeArray[i].id, jokeArray[(i + 1) % count].id]
  })
}

const jokeList: Joke[] = jokes.list.map(v => ({
  id: uuidv4(),
  jokeDraft: v.setup,
}))

/**
 * Начало
 * Игроку прилетает 2 сетапа, он сабмиттит каждый в отдельном запросе
 *
 *
 */

export type UserGameData = {
  userId: User['userId']
  jokes?: Joke['id'][]
  score: number
}

export type JokeRatingGameData = {
  id: Joke['id']
  upVotes: User['userId'][]
  score: number
}

export type TonkoState = {
  stage: Stage
  round: Round
  maxRounds: number
  userGameStore?: Crud<UserGameData, 'userId'>
  jokeStorage?: Crud<Joke, 'id'>
  jokeRatingStorage?: Crud<JokeRatingGameData, 'id'>
}

export class TonkoEngine extends Engine<TonkoState> {
  static meta: Game = {
    id: 'tonko',
    name: 'Tonko',
    description: 'Тебе сетап - нам панчлайн, если смешно - очко!',
  }

  private useTable = useTable(this.STORAGE)

  protected onGameStart() {
    this.state.stage = Stage.Starting
    const jokeSlice = getJokeSets(
      this.users.length,
      shuffle(jokeList.slice(0, this.users.length)),
    )
    this.users.forEach((user, i) => {
      this.state.userGameStore?.insert(user.userId, {
        userId: user.userId,
        jokes: jokeSlice[i],
        score: 0,
      })
    })
    setTimeout(() => {
      this.state.stage = Stage.Punching
    }, 5000)
  }

  protected onStateChange(
    key: keyof TonkoState,
    oldValue: any,
    newValue: any,
  ): Function | void {
    console.log(
      `[${new Date().toLocaleTimeString()}]: [\u001b[33mTonko\u001b[0m] Updated [${key}] ${oldValue} → ${newValue}`,
    )
    if (key === 'stage') {
      switch (newValue) {
        case Stage.Punching: {
          this.state.userGameStore!.forEach(user =>
            this.sendToUser(
              user.userId,
              buildTonkoGameEvent(TonkoGameEvent.ReceivePunchesToAnswer),
              jokeList.filter(joke => user.jokes?.includes(joke.id)),
            ),
          )
          break
        }
      }
    }
  }

  protected onGameFinish(): void {}

  public applyAction(user: User, action: string, ...args: any[]): any {}

  constructor(utils: EngineUtils) {
    const initialState: TonkoState = {
      stage: Stage.Off,
      round: 0,
      maxRounds: 2,
      userGameStore: undefined,
      jokeRatingStorage: undefined,
      jokeStorage: undefined,
    }
    super(initialState, { users: [] }, utils)
    this.state.userGameStore = this.useTable('userGameStore', 'userId')
    this.state.jokeStorage = this.useTable('jokeStore', 'id')
    this.state.jokeRatingStorage = this.useTable('jokeRatingStore', 'id')
  }
}
