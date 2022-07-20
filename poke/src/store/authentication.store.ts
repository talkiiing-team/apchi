import { useTable } from '@/store/store'
import {
  Credentials,
  credentialsPrimaryKey,
} from '@/common/types/Credentials.model'
import { PrimaryKeyFillStrategy } from '@/base/types'

export const authenticationStore = useTable<
  Credentials,
  typeof credentialsPrimaryKey
>('authentication', credentialsPrimaryKey, {
  pkStrategy: PrimaryKeyFillStrategy.AutoIncrement,
})

export default authenticationStore
