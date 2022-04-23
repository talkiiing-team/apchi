export * from './Joke.model'

export enum TonkoGameEvent {
  TimeLeft = 'timeLeft',
  ReceivePunchesToAnswer = 'receivePunchesToAnswer', // 2 punches to answer
  VoteForPunch = 'voteForPunch', // 2 punches for the same setup, you'll need to send Vote
  VoteAccepted = 'voteAccepted',
  SeeVotes = 'seeVotes',
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
