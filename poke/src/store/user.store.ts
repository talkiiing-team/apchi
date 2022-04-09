import { useTable } from '@/common/useTable'
import { User, primaryKey } from '@/models/User.model'

export const userStore = useTable<User, typeof primaryKey>(
  'users',
  primaryKey,
  { pkStrategy: 'autoincrement' },
)

export default userStore
