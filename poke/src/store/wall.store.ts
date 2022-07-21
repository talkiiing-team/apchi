import { useTable } from '@/store/store'
import { WallPost, primaryKey } from '@/models/Wall.model'
import { addBeforeExitHook } from '@/utils/beforeExitHook'
import { PrimaryKeyFillStrategy } from '@/base/types'
import { logEvent } from '@/utils/logEvent'

export const wallStore = useTable<WallPost, typeof primaryKey>(
  'wall',
  primaryKey,
  { pkStrategy: PrimaryKeyFillStrategy.Hash },
)

/**
 * Trying to use beforeExitHook
 */

addBeforeExitHook(() =>
  logEvent('wallStore has', wallStore.length(), 'records. Will be transported'),
)

export default wallStore
