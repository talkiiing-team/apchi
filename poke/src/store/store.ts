import { getBoundStorage } from '@/base/useTableWithStore'
import { CrudStorage } from '@/base/types'

const Storage: CrudStorage = {}

export const useTable = getBoundStorage(Storage)
