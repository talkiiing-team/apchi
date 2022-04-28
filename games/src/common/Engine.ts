import { CrudStorage, Game, User } from '@apchi/shared'

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

export type EngineUtils = {
  sendToRoom: (event: string, ...args: any[]) => boolean
  sendToUser: (userId: User['userId'], event: string, ...args: any[]) => void
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
      const oldValue = target[key]
      target[key] = value
      callbacks.forEach(callback => callback(key, oldValue, value))
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

  private status: GameStatus = GameStatus.Idle

  get gameStatus(): GameStatus {
    return this.status
  }

  protected STORAGE: CrudStorage = {}

  /**
   * State that can be safely sent to the client
   */
  get safeState(): Omit<State, UnsafeFields> {
    return Object.fromEntries(
      Object.entries(this.state).filter(
        ([key]) =>
          !(UnsafeKeys as unknown as string[]).includes(key) &&
          !key.includes('Stor'), // Store | Storage,
      ),
    ) as Omit<State, UnsafeFields>
  }

  private registerStateChangeCallback(callback: CallableFunction) {
    this.callbacks.push(callback)
  }

  /**
   * @return invalidation function
   */
  protected abstract onStateChange(
    changedField: string,
    oldValue: any,
    newValue: any,
  ): CallableFunction | Promise<any> | void

  setUsers(users: User[]) {
    this.users = users
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

  abstract gameId: Game['id']

  abstract applyAction(user: User, action: string, ...args: any[]): any

  protected abstract onGameStart(): void

  protected abstract onGameFinish(): void

  protected sendToRoom: EngineUtils['sendToRoom']
  protected sendToUser: EngineUtils['sendToUser']

  protected constructor(
    initialState: State,
    initialProperties: { users: Users },
    engineUtils: EngineUtils,
  ) {
    this.users = initialProperties.users
    this.state = new Proxy(initialState, createProxyValidator(this.callbacks))
    this.registerStateChangeCallback(this.onStateChange.bind(this))
    this.sendToRoom = engineUtils.sendToRoom
    this.sendToUser = engineUtils.sendToUser
  }
}
