import { User } from '@apchi/shared'

export * from '@apchi/shared'

export enum LoginState {
  NeedLogin,
  NeedRegister,
  Authenticated,
}

export type ErrorResponse = {
  error: boolean
  reason: string
  code: number
} & Record<string, string | number | Object>

export enum NotificationImportance {
  Default,
  Important,
}

export type Notification = {
  id: string
  importance: NotificationImportance
  title: string
  text: string
}

export type UserWithRequiredId = Partial<User> & Pick<User, 'userId'>
