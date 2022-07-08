import { CrudStorage, getBoundStorage } from '@/base/useTable'

const Storage: CrudStorage = {}

export const useTable = getBoundStorage(Storage)
