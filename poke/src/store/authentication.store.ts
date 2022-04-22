import { useTable } from '@/store/store'
import { Credentials, credentialsPrimaryKey } from '@apchi/shared'

export const authenticationStore = useTable<
  Credentials,
  typeof credentialsPrimaryKey
>('authentication', credentialsPrimaryKey)

export default authenticationStore
