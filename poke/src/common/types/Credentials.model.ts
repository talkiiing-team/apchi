export type Credentials = {
  userId: number
  login: string
  password: string // Hashed
  refreshToken: string
}

export const credentialsPrimaryKey = 'userId'
