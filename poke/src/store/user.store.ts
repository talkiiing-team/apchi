import { User, userPrimaryKey, PrimaryKeyFillStrategy } from '@apchi/shared'
import { useTable } from '@/store/store'

export const userStore = useTable<User, typeof userPrimaryKey>(
  'users',
  userPrimaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.AutoIncrement },
)

//userStore.insert(0, { userId: 0, name: 'talkenson' })

export default userStore
