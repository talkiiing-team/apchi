import { useTable } from '@/common/useTable'
import { Credentials, credentialsPrimaryKey } from '@apchi/shared'

export const authenticationStore = useTable<
  Credentials,
  typeof credentialsPrimaryKey
>('authentication', credentialsPrimaryKey)

export default authenticationStore
