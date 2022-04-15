import { User } from '@apchi/shared'
import { getRandomName } from '@apchi/client/src/utils/randomData'

export const fakeUser = (): User => ({
  userId: Math.floor(Math.random() * 50000),
  name: getRandomName(),
})
