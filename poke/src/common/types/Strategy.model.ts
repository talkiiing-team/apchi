export enum AuthStrategy {
  Local = 'local',
  External = 'external',
  RefreshToken = 'refreshToken',
  VK = 'vk',
  // Google = 'google'
}

export enum RegisterStrategy {
  Local = 'local',
  External = 'external',
  VK = 'vk',
}

export type AuthCredentials<S extends AuthStrategy = AuthStrategy> =
  S extends AuthStrategy.Local
    ? {
        strategy: S
        login: string
        password: string
      }
    : S extends AuthStrategy.External
    ? {
        strategy: S
        userId: number
        signature: string
      }
    : S extends AuthStrategy.RefreshToken
    ? {
        strategy: S
        refreshToken: string
      }
    : S extends AuthStrategy.VK
    ? {
        strategy: S
        userId: number
        signature: string
      }
    : never

export type RegisterCredentials<S extends RegisterStrategy = RegisterStrategy> =
  S extends RegisterStrategy.Local
    ? {
        strategy: S
        login: string
        password: string
      }
    : S extends RegisterStrategy.VK
    ? {
        strategy: S
        vkUserId: number
        signature: string
      }
    : never
