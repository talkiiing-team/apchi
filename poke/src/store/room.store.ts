import { PrimaryKeyFillStrategy, useTable } from '@/common/useTable'
import { roomPrimaryKey, Room } from '@apchi/shared'

export const roomStore = useTable<Room, typeof roomPrimaryKey>(
  'rooms',
  roomPrimaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.AutoIncrement },
)

export default roomStore
