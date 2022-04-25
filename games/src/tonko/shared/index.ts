import { User } from '@apchi/shared'
import { Joke } from './Joke.model'

export * from './Joke.model'

export enum TonkoGameEvent {
  TimeLeft = 'timeLeft',
  ReceivePunchesToAnswer = 'receivePunchesToAnswer', // 2 punches to answer
  VoteForPunch = 'voteForPunch', // 2 punches for the same setup, you'll need to send Vote
  VoteAccepted = 'voteAccepted',
  SeeVotes = 'seeVotes',
  Leaderboard = 'leaderboard',
  StageChange = 'stageChange',
  RoundChange = 'roundChange',
}

export enum Stage {
  Off = 'off',
  Starting = 'starting',
  Punching = 'punching',
  Voting = 'voting',
  Overviewing = 'overviewing',
}

export const buildTonkoGameEvent = (
  eventName: TonkoGameEvent,
): TonkoGameEventType => `@game/${eventName}`

export type TonkoGameEventType = `@game/${TonkoGameEvent}`

export type UserGameData = {
  userId: User['userId']
  jokes?: Joke['id'][]
  score: number
}

export type JokeSubmissionData = {
  id: number
  userId: User['userId']
  joke: Joke
}

export type JokeRatingGameData = {
  subId: JokeSubmissionData['id']
  upVotes: User['userId'][]
  score: number
}

export enum Actions {
  AnswerJoke = 'answerJoke',
  VoteForJoke = 'voteForJoke',
}
