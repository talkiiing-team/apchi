export * from './Joke.model'

export enum TonkoGameEvent {
  TimeLeft = 'timeLeft',
  ReceivePunchesToAnswer = 'receivePunchesToAnswer', // 2 punches to answer
  VoteForPunch = 'voteForPunch', // 2 punches for the same setup, you'll need to send Vote
  VoteAccepted = 'voteAccepted',
  SeeVotes = 'seeVotes',
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
): TonkoGameEventType => `@tonkoGame/${eventName}`

export type TonkoGameEventType = `@tonkoGame/${TonkoGameEvent}`
