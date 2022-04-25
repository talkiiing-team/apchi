import { Engine, EngineUtils } from '../../common/Engine'
import { v4 as uuidv4 } from 'uuid'
import jokes from '../assets/jokes.json'
import { Crud, Game, User, useSleep, useTable } from '@apchi/shared'
import {
  Actions,
  buildTonkoGameEvent,
  Joke,
  JokeRatingGameData,
  JokeSubmissionData,
  Stage,
  TonkoGameEvent,
  UserGameData,
} from '../shared'

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

export type TonkoState = {
  stage: Stage
  round: Round
  maxRounds: number
  userGameStore?: Crud<UserGameData, 'userId'>
  jokeStorage?: Crud<Joke, 'id'>
  jokeRatingStorage?: Crud<JokeRatingGameData, 'subId'>
  jokeSubmissionStorage?: Crud<JokeSubmissionData, 'id'>
}

export class TonkoEngine extends Engine<TonkoState> {
  gameId = 'tonko'
  static meta: Game = {
    id: 'tonko',
    name: 'Tonko',
    description: 'Тебе сетап - нам панчлайн, если смешно - очко!',
  }

  private sleepService = useSleep()

  private useTable = useTable(this.STORAGE)

  private jokes: Joke[] = []

  protected onGameStart() {
    this.state.stage = Stage.Starting
    this.sendToRoom(buildTonkoGameEvent(TonkoGameEvent.StageChange), {
      stage: Stage.Starting,
    })
    this.jokes = shuffle(jokeList.slice(0, this.users.length))
    const jokeSlice = getJokeSets(this.users.length, this.jokes)
    jokeList.forEach(j => {
      this.state.jokeStorage?.insert(j.id, j)
    })
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

  protected async onStateChange(
    key: keyof TonkoState,
    oldValue: any,
    newValue: any,
  ): Promise<void> {
    console.log(
      `[${new Date().toLocaleTimeString()}]: [\u001b[33mTonko\u001b[0m] State updated [${key}] ${oldValue} → ${newValue}`,
    )
    if (key === 'stage') {
      switch (newValue) {
        case Stage.Punching: {
          this.sendToRoom(buildTonkoGameEvent(TonkoGameEvent.StageChange), {
            stage: Stage.Punching,
          })
          this.state.userGameStore!.forEach(user => {
            this.sendToUser(
              user.userId,
              buildTonkoGameEvent(TonkoGameEvent.ReceivePunchesToAnswer),
              { jokes: jokeList.filter(joke => user.jokes?.includes(joke.id)) },
            )
          })
          this.sendToRoom(buildTonkoGameEvent(TonkoGameEvent.TimeLeft), {
            time: 15,
          })
          this.tempTimer = setTimeout(() => {
            this.state.stage = Stage.Voting
          }, 15 * 1000)
          break
        }
        case Stage.Voting: {
          // data prepare

          this.sendToRoom(buildTonkoGameEvent(TonkoGameEvent.StageChange), {
            stage: Stage.Voting,
          })

          const pairsByJokeId = this.state
            .jokeSubmissionStorage!.dumpToArray()
            .reduce((a, v) => {
              if (a[v.joke.id]) {
                return { ...a, [v.joke.id]: [...a[v.joke.id], v] }
              } else {
                return { ...a, [v.joke.id]: [v] }
              }
            }, Object.fromEntries(this.jokes.map(v => [v.id, []])) as Record<Joke['id'], JokeSubmissionData[]>)

          console.log(pairsByJokeId)

          await this.sleepService.startSleep(500)

          for await (const [jokeId, jokes] of Object.entries(pairsByJokeId)) {
            console.log(jokeId, jokes)
            const roundTime = jokes.length ? 15 : 3
            this.sendToRoom(buildTonkoGameEvent(TonkoGameEvent.VoteForPunch), {
              jokeId: jokeId,
              submissions: jokes,
              jokeDraft: this.state.jokeStorage?.get(jokeId)!.jokeDraft,
            })
            this.sendToRoom(buildTonkoGameEvent(TonkoGameEvent.TimeLeft), {
              time: roundTime,
            })
            await this.sleepService.startSleep(roundTime * 1000)
          }

          setTimeout(() => (this.state.stage = Stage.Overviewing), 1000)
          break
        }
        case Stage.Overviewing: {
          const scoreByUser =
            this.state.jokeRatingStorage?.dumpToArray().reduce((a, v) => {
              const userId = this.state.jokeSubmissionStorage?.get(v.subId)
                ?.userId!
              if (userId) {
                return { ...a, [userId]: a[userId] + v.score }
              } else {
                return a
              }
            }, Object.fromEntries(this.users.map(v => [v.userId, 0])) as Record<User['userId'], JokeRatingGameData['score']>) ||
            {}

          const leaderboard = Object.entries(scoreByUser)
            .map(([userId, score]) => {
              return {
                user: this.users.find(u => u.userId === parseInt(userId))!,
                score: score,
              }
            })
            .sort((u1, u2) => u2.score - u1.score)

          this.sendToRoom(buildTonkoGameEvent(TonkoGameEvent.StageChange), {
            stage: Stage.Overviewing,
          })

          await this.sleepService.startSleep(500)

          this.sendToRoom(buildTonkoGameEvent(TonkoGameEvent.Leaderboard), {
            leaderboard: leaderboard,
          })
          break
        }
      }
    }
  }

  protected onGameFinish(): void {}

  private tempTimer!: ReturnType<typeof setTimeout>

  public applyAction(user: User, action: Actions, ...args: any[]): any {
    console.log('got action === ', action)
    if (action === Actions.AnswerJoke) {
      const joke = args[0] as Joke
      const newSubmission = this.state.jokeSubmissionStorage!.create({
        userId: user.userId,
        joke: joke,
      })
      console.log('New submission registered', JSON.stringify(newSubmission))
      // check if all users answered
      if (
        this.state.jokeSubmissionStorage?.length() ===
        this.users.length * 2
      ) {
        clearTimeout(this.tempTimer)
        this.state.stage = Stage.Voting
      }
    }
    if (action === Actions.VoteForJoke) {
      const [userId, submissionId] = args
      if (user.userId === userId) {
        throw { reason: 'No votes for yourself', code: 403 }
      }
      console.log('voted for', submissionId, 'from', userId)
      if (this.state.jokeRatingStorage?.get(submissionId)) {
        this.state.jokeRatingStorage?.reduceUpdate(submissionId, sub => ({
          ...sub,
          score: sub.score + 100,
          upVotes: [...sub.upVotes, userId],
        }))
      } else {
        this.state.jokeRatingStorage?.insert(submissionId, {
          subId: submissionId,
          score: 100,
          upVotes: [userId],
        })
      }
      return { status: 'Successfully voted' }
    }
  }

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
    this.state.jokeRatingStorage = this.useTable('jokeRatingStore', 'subId')
    this.state.jokeSubmissionStorage = this.useTable(
      'jokeSubmissionStorage',
      'id',
    )
  }
}
