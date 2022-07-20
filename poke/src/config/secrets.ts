import { nanoid } from 'nanoid'
const DEFAULT_REFRESH_TOKEN_LENGTH = 128
const DEFAULT_JWT_LIFETIME_SEC = 3600

export const JWT_KEY = (() => {
  const envJwtKey = import.meta.env.VITE_JWT_KEY
  if (!envJwtKey) {
    console.warn('Environment VITE_JWT_KEY key not found, using nanoid')
    return nanoid(20)
  } else {
    return envJwtKey
  }
})()

export const REFRESH_TOKEN_LENGTH = (() => {
  const refreshTokenLength = import.meta.env.VITE_REFRESH_TOKEN_LENGTH
  const parsed = parseInt(refreshTokenLength)
  if (!refreshTokenLength || Number.isNaN(parsed)) {
    console.warn(
      'Environment VITE_REFRESH_TOKEN_LENGTH key not found or invalid, using',
      DEFAULT_REFRESH_TOKEN_LENGTH,
    )
    return DEFAULT_REFRESH_TOKEN_LENGTH
  } else {
    return parsed || DEFAULT_REFRESH_TOKEN_LENGTH
  }
})()

export const JWT_LIFETIME_SEC = (() => {
  const refreshTokenLength = import.meta.env.VITE_JWT_LIFETIME_SEC
  const parsed = parseInt(refreshTokenLength)
  if (!refreshTokenLength || Number.isNaN(parsed)) {
    console.warn(
      'Environment VITE_JWT_LIFETIME_SEC key not found or invalid, using',
      DEFAULT_JWT_LIFETIME_SEC,
    )
    return DEFAULT_JWT_LIFETIME_SEC
  } else {
    return parsed || DEFAULT_JWT_LIFETIME_SEC
  }
})()
