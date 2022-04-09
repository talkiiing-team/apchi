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
