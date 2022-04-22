import { roomPrimaryKey, Room, PrimaryKeyFillStrategy } from '@apchi/shared'
import { useTable } from '@/store/store'

export const roomStore = useTable<Room, typeof roomPrimaryKey>(
  'rooms',
  roomPrimaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.AutoIncrement },
)

export default roomStore
