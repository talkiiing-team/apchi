import { useTable } from '@/common/useTable'
import { SocketAuth, primaryKey } from '@/models/SocketAuth.model'

export const socketAuthStore = useTable<SocketAuth, typeof primaryKey>(
  'socketAuth',
  primaryKey,
)

export default socketAuthStore
