import { useTable } from '@/common/useTable'
import { Credentials, primaryKey } from '@/models/Credentials.model'

export const authenticationStore = useTable<Credentials, typeof primaryKey>(
  'authentication',
  primaryKey,
)

export default authenticationStore
