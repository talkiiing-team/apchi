import { useTable } from '@/store/store'
import { primaryKey } from '@/models/Wall.model'
import { PrimaryKeyFillStrategy } from '@/base/useTable'

export const filesStore = useTable<{ id: number; content: string }, 'id'>(
  'files',
  primaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.AutoIncrement },
)

export default filesStore
