import { nanoid } from 'nanoid'
import {
  AnyRecord,
  Crud,
  CrudStorage,
  PrimaryKeyFillStrategy,
  SafeKeyTypes,
  TableControllerOptions,
} from '@/base/types'

const HASH_PRIMARY_KEY_LENGTH = 24

const __DEFAULT_BASE_STORAGE: CrudStorage = {}

const exists = <T>(undefinable: T | undefined): undefinable is T =>
  undefinable !== undefined

// Just ensure that primaryKey isn't in object
const excludePrimaryKey = <T extends AnyRecord, PK extends keyof T>(
  object: T | Omit<T, PK>,
  pk: PK,
): Omit<T, PK> => {
  const { [pk]: _, ...rest } = object
  return rest as T
}

export const useTableWithStore =
  (storage: CrudStorage = __DEFAULT_BASE_STORAGE) =>
  <T extends Record<string, unknown>, PK extends SafeKeyTypes<T>>(
    tableName: string,
    pk: PK,
    options: TableControllerOptions = {
      pkStrategy: PrimaryKeyFillStrategy.AutoIncrement,
      hashIdSize: HASH_PRIMARY_KEY_LENGTH,
    },
  ): Crud<T, typeof pk> => {
    const STORAGE = storage
    if (!STORAGE[tableName]) STORAGE[tableName] = {}

    let lastId = 0

    return {
      get(id) {
        return exists(id) ? STORAGE[tableName][id] : undefined
      },
      create(item) {
        const index =
          options?.pkStrategy === PrimaryKeyFillStrategy.AutoIncrement
            ? lastId++
            : nanoid(options.hashIdSize || HASH_PRIMARY_KEY_LENGTH)

        const constructed = {
          ...item,
          [pk]: index,
        }

        STORAGE[tableName][index] = constructed
        return constructed as T
      },
      find(reducer) {
        return Object.entries(STORAGE[tableName]).find(([key, value]) =>
          reducer(value, key as PK),
        )?.[1]
      },
      findAll(reducer) {
        return Object.entries(STORAGE[tableName])
          .filter(([key, value]) => reducer(value, key as PK))
          .map(([_, value]) => value)
      },
      findId(reducer) {
        const result = this.find(reducer)
        return result ? result[pk] : undefined
      },
      findAllIds(reducer) {
        const result = this.findAll(reducer)
        return result.map(v => v[pk])
      },
      /**
       * Low-performance finder with limit
       * @param reducer
       * @param total
       */
      selectSome(reducer, total) {
        if (total <= 0) return []
        const selection: T[] = []
        for (let [key, item] of Object.entries<T>(STORAGE[tableName])) {
          if (reducer(item, key as PK)) {
            selection.push(item)
          }
          if (selection.length === total) return selection
        }
        return selection
      },
      /**
       * Selecting only Ids of limited predicated collection
       * @param reducer
       * @param total
       */
      selectSomeIds(reducer, total) {
        return this.selectSome(reducer, total).map(v => v[pk])
      },
      insert(id, item) {
        if (!exists(id) || !exists(item)) return undefined

        STORAGE[tableName][id as keyof T] = item
        return item
      },
      insertUpdate(id, item) {
        // Alias for insert
        return this.insert(id, item)
      },
      /**
       * Top-level merge tool
       * @param id
       * @param item
       */
      patch(id, item) {
        const _item = this.get(id)
        if (!_item) return undefined

        const constructed = {
          ..._item,
          ...excludePrimaryKey(item as T, pk),
        } as T

        STORAGE[tableName][id as PK] = constructed
        return constructed as T
      },
      reduceUpdate(id, reducer) {
        const _item = this.get(id)
        if (!_item) return undefined

        const constructed = {
          ...excludePrimaryKey(reducer(_item), pk),
          [pk]: id,
        }

        STORAGE[tableName][id as PK] = constructed
        return constructed as T
      },
      update(id, item) {
        const _item = this.get(id)
        if (!exists(_item)) return undefined

        const constructed = {
          ...excludePrimaryKey(item as T, pk),
          [pk]: id,
        }
        STORAGE[tableName][id as PK] = constructed
        return constructed as T
      },
      delete(id) {
        const _item = this.get(id)
        if (!exists(_item)) return undefined
        delete STORAGE[tableName][id]
        return _item
      },
      dump() {
        return STORAGE[tableName]
      },
      dumpToArray(length) {
        return Object.values(STORAGE[tableName]).slice(0, length)
      },
      /**
       * forEach function (low-performance)
       * @param fn
       */
      forEach(fn) {
        return this.dumpToArray().forEach(fn)
      },
      _merge<ExternalType = Record<string, any>>(
        externalItems: (Record<PK, T[PK]> & ExternalType)[],
      ) {
        return externalItems.map(extElement =>
          extElement[pk] !== undefined
            ? { ...extElement, ...(this.get(extElement[pk]) || {}) }
            : extElement,
        )
      },
      _clean() {
        STORAGE[tableName] = {}
      },
      length() {
        return STORAGE[tableName]?.length
      },
    }
  }

export const deleteTable = (
  name: string,
  storage: CrudStorage = __DEFAULT_BASE_STORAGE,
) => delete storage[name]

export const getBoundStorage = (storage: CrudStorage) =>
  useTableWithStore(storage)
