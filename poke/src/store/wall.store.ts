import { useTable } from '@/store/store'
import { WallPost, primaryKey } from '@/models/Wall.model'
import { PrimaryKeyFillStrategy } from '@/base/useTable'

export const wallStore = useTable<WallPost, typeof primaryKey>(
  'wallposts',
  primaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.AutoIncrement },
)

export default wallStore
