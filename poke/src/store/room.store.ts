import { roomPrimaryKey, Room } from '@apchi/shared'
import { useTable } from '@/store/store'
import { PrimaryKeyFillStrategy } from '@/base/types'

export const roomStore = useTable<Room, typeof roomPrimaryKey>(
  'rooms',
  roomPrimaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.AutoIncrement },
)

export default roomStore
