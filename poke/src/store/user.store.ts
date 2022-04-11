import { PrimaryKeyFillStrategy, useTable } from '@/common/useTable'
import { User, userPrimaryKey } from '@apchi/shared'

export const userStore = useTable<User, typeof userPrimaryKey>(
  'users',
  userPrimaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.AutoIncrement },
)

//userStore.insert(0, { userId: 0, name: 'talkenson' })

export default userStore
