import { CrudStorage, getBoundStorage } from '@apchi/shared'

const Storage: CrudStorage = {}

export const useTable = getBoundStorage(Storage)
