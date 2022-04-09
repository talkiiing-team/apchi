import { useTable } from '@/common/useTable'
import { Room, primaryKey } from '@/models/Room.model'
import authenticationStore from '@/store/authentication.store'

export const roomStore = useTable<Room, typeof primaryKey>(
  'rooms',
  primaryKey,
  { pkStrategy: 'autoincrement' },
)

export default roomStore
