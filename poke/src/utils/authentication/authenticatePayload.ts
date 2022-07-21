import jwt from 'jsonwebtoken'
import userStore from '@/store/user.store'
import { exists } from '@/utils/exists'
import { User } from '@/models/User.model'

export const authenticatePayload = (
  payload: jwt.JwtPayload,
): User | undefined => {
  const { userId } = payload
  if (!userId) return undefined
  const predictableUser = userStore.get(userId)
  if (exists(predictableUser)) {
    return predictableUser
  }
  return undefined
}
