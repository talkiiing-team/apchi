import { User } from '@apchi/shared'

export enum GameStatus {
  Idle = 'Idle',
  InProgress = 'InProgress',
  Finished = 'Finished',
}

/**
 * nickname - score values
 */
export type Leaderboard = Record<string, number>

export type ExtendedState<State> = State & {
  leaderboard: Leaderboard
}

export const UnsafeKeys = ['innerData'] as const

export type UnsafeFields = typeof UnsafeKeys[number]

export type Users = User[]

const isObject = (maybeObject: unknown): maybeObject is NonNullable<object> =>
  typeof maybeObject === 'object' && maybeObject !== null

const createProxyValidator = (callbacks: CallableFunction[]) => {
  const validator = {
    get(target: any, key: any): any {
      const inner = target[key]
      if (isObject(inner)) {
        return new Proxy(inner, validator)
      }
      return inner
    },
    set(target: any, key: any, value: any) {
      target[key] = value
      callbacks.forEach(callback => callback(key, value))
      return true
    },
  }
  return validator
}

/**
 * A thing that runs on a server
 */
export abstract class Engine<State extends object> {
  state: State

  users: Users = []

  private callbacks: CallableFunction[] = []

  status: GameStatus = GameStatus.Idle

  /**
   * State that can be safely sent to the client
   */
  get safeState(): Omit<State, UnsafeFields> {
    return Object.fromEntries(
      Object.entries(this.state).filter(
        ([key]) => !(UnsafeKeys as unknown as string[]).includes(key),
      ),
    ) as Omit<State, UnsafeFields>
  }

  private registerStateChangeCallback(callback: CallableFunction) {
    this.callbacks.push(callback)
  }

  /**
   * @return invalidation function
   */
  protected abstract onStateChange(): CallableFunction | void

  addUsers(users: User[]) {
    this.users = [...this.users, ...users]
  }

  removeUser(userId: User['userId']) {
    const index = this.users.findIndex(u => u.userId === userId)
    if (!~index) return
    this.users.splice(index, 1)
  }

  startGame(): void {
    this.status = GameStatus.InProgress
    this.onGameStart()
  }

  finishGame(): void {
    this.status = GameStatus.Finished
    this.onGameFinish()
  }

  protected abstract onGameStart(): void
  protected abstract onGameFinish(): void

  constructor(initialState: State, initialProperties: { users: Users }) {
    this.users = initialProperties.users
    this.state = new Proxy(initialState, createProxyValidator(this.callbacks))
    this.registerStateChangeCallback(this.onStateChange.bind(this))
  }
}

//
// GlobalDaemon.register() //...
// new Instance(TonkoEngine) //... =>
// instance.installGame(TonkoEngine)
