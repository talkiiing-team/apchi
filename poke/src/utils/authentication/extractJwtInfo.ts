import jwt from 'jsonwebtoken'
import { JWT_KEY } from '@/config/secrets'

/**
 * This method ignores expiration
 * @param accessToken
 */
export const extractJwtInfo = (accessToken: string) =>
  jwt.verify(accessToken, JWT_KEY as jwt.Secret, {
    complete: false,
    // We need only payload
    ignoreExpiration: true,
    // Ignoring expiration, for user detection purposes
    // It gives a bit more secure finding
  })
