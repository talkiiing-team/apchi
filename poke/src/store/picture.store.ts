import { useTable } from '@/store/store'
import { primaryKey } from '@/models/Wall.model'
import { PrimaryKeyFillStrategy } from '@/base/useTable'

export const pictureStore = useTable<{ id: number; content: string }, 'id'>(
  'pictures',
  primaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.AutoIncrement },
)

export default pictureStore
