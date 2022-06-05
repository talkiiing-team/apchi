import { User } from '@apchi/shared'
import { Role } from './Role.enum'
export * from './Role.enum'
export * from './Location.model'

export enum SpyGameEvent {
  TimeLeft = 'timeLeft',
  ReceiveCard = 'receiveCard',
  StageChange = 'stageChange',
  VoteAccepted = 'voteAccepted',
  VoteDeclined = 'voteDeclined',
  Results = 'results',
  UsersPresentation = 'usersPresentation',
}

export enum Stage {
  Off = 'off',
  Launch = 'launch',
  GameSetup = 'gameSetup',
  Starting = 'starting',
  Giveaway = 'giveaway',
  Vote = 'vote',
  Results = 'results',
}

export type SpyGameEventType = `@game/${SpyGameEvent}`

export const buildGameEvent = (eventName: SpyGameEvent): SpyGameEventType =>
  `@game/${eventName}`

export type UserGameData = {
  userId: User['userId']
  role?: Role
}

export enum Actions {
  Vote = 'vote',
  GuessLocation = 'guessLocation',
  StartGame = 'startGame',
}

export const isSpy = (role: Role) => role === Role.Spy

export const isNormal = (role: Role) => role === Role.Normal
