import { User } from '@apchi/shared'
import { Role } from './Role.enum'
import { Card } from './Card.model'
export * from './Role.enum'
export * from './Card.model'

export enum MafiaGameEvent {
  TimeLeft = 'timeLeft',
  ReceiveCard = 'receiveCard',
  ChooseNarrator = 'chooseNarrator',
  NarratorUpdated = 'narratorUpdated',
  MakeActionByRole = 'makeActionByRole',
  StageChange = 'stageChange',
  RoundChange = 'roundChange',
  VoteAccepted = 'voteAccepted',
  Leaderboard = 'leaderboard',
}

export enum Stage {
  Off = 'off',
  Launch = 'launch',
  GameSetup = 'gameSetup',
  Starting = 'starting',
  Giveaway = 'giveaway',
  Day = 'day',
  Night = 'night',
  Results = 'results',
}

export const buildGameEvent = (eventName: MafiaGameEvent): TonkoGameEventType =>
  `@game/${eventName}`

export type TonkoGameEventType = `@game/${MafiaGameEvent}`

export type UserGameData = {
  userId: User['userId']
  role?: Role
  card?: Card
  score: number
}

export type CourtData = {
  courtId: number
  votes: User['userId'][]
  suspect: User['userId']
  initiator: User['userId']
}

export enum Actions {
  TakeNarration = 'takeNarration',
  SubmitCardSet = 'submitCardSet',
  StartGame = 'startGame',
  Kill = 'kill',
}

export type Shot = {
  victim: User['userId']
  killer: User['userId']
}

export const isBlack = (role: Role) => [Role.Mafia, Role.Don].includes(role)

export const isRed = (role: Role) =>
  [Role.Maniac, Role.Citizen, Role.Doctor, Role.Police, Role.Slut].includes(
    role,
  )
