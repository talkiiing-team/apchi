import { useTable } from '@/store/store'
import { SocketMap, primaryKey } from '@/models/SocketMap.model'

export const socketMapStore = useTable<SocketMap, typeof primaryKey>(
  'socketAuth',
  primaryKey,
)

export default socketMapStore
