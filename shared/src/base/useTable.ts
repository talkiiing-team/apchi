import { v4 as uuidv4 } from 'uuid'

export const exists = <T>(undefinable: T | undefined): undefinable is T =>
  undefinable !== undefined

export type AnyRecord = Record<string, unknown>

export type SafeKeyTypes<T extends AnyRecord> = Extract<
  keyof T,
  string | number | symbol
>

export type Table<T extends AnyRecord, PK extends SafeKeyTypes<T>> = Record<
  PK,
  T
>

export type TableReducerFn<T, PK> = (item: T, id: PK) => boolean
export type TableForEachReducerFn<T, Index = number> = (
  item: T,
  id: Index,
) => any

export type CrudMethod = keyof Crud<any, any>

export type Crud<T extends AnyRecord, PK extends SafeKeyTypes<T>> = {
  get(id: T[PK] | undefined): T | undefined
  find(reducer: TableReducerFn<T, PK>): T | undefined
  findAll(reducer: TableReducerFn<T, PK>): T[]
  findId(reducer: TableReducerFn<T, PK>): T[PK] | undefined
  findAllIds(reducer: TableReducerFn<T, PK>): T[PK][]
  selectSome(reducer: TableReducerFn<T, PK>, total: number): T[]
  selectSomeIds(reducer: TableReducerFn<T, PK>, total: number): T[PK][]
  insert(id: T[PK], item: T): T | undefined
  insertUpdate(id: T[PK], item: T): T | undefined
  create(item: Omit<T, PK>): T
  patch(id: T[PK], item: Partial<Omit<T, PK>>): T | undefined
  reduceUpdate(
    id: T[PK],
    reducer: (item: Omit<T, PK>) => Omit<T, PK>,
  ): T | undefined
  update(id: T[PK], item: Omit<T, PK>): T | undefined
  delete(id: T[PK]): T | undefined
  dump(): Table<T, PK>
  dumpToArray(length?: number): T[]
  forEach(fn: TableForEachReducerFn<T, number>): any
  _merge<ExternalType = Record<string, any>>(
    externalItems: (Record<PK, T[PK]> & ExternalType)[],
  ): any[]
  _clean(): void
  length(): number
}

export enum PrimaryKeyFillStrategy {
  AutoIncrement = 'autoincrement',
  UUID = 'uuid',
}

type TableControllerOptions = {
  pkStrategy?: PrimaryKeyFillStrategy
}

export type CrudStorage = Record<string, Table<any, any>>

const __DEFAULT_BASE_STORAGE: CrudStorage = {}

const excludeId = <T extends AnyRecord, PK extends keyof T = keyof T>(
  object: T,
  pk: PK,
): T => {
  const { [pk]: ex, ...rest } = object
  return rest as T
} // TODO: Rewrite that shit

/**
 * If pkStrategy in options is `autoincrement`, then we could assume that pk is `number`-typed
 */
export const useTable =
  (storage: CrudStorage = __DEFAULT_BASE_STORAGE) =>
  <T extends Record<string, unknown>, PK extends SafeKeyTypes<T>>(
    name: string,
    pk: PK,
    options: TableControllerOptions = {
      pkStrategy: PrimaryKeyFillStrategy.AutoIncrement,
    },
  ): Crud<T, typeof pk> => {
    const STORAGE = storage

    if (!STORAGE[name]) STORAGE[name] = {}

    let lastId = 0

    return {
      get(id) {
        return exists(id) ? STORAGE[name][id] : undefined
      },
      find(reducer) {
        return Object.entries(STORAGE[name]).find(([key, value]) =>
          reducer(value, key as PK),
        )?.[1]
      },
      findAll(reducer) {
        return Object.entries(STORAGE[name])
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
      selectSome(reducer, total) {
        if (total <= 0) return []
        const selection: T[] = []
        for (let [key, item] of Object.entries<T>(STORAGE[name])) {
          if (selection.length === total) return selection
          if (reducer(item, key as PK)) {
            selection.push(item)
          }
        }
        return selection
      },
      selectSomeIds(reducer, total) {
        return this.selectSome(reducer, total).map(v => v[pk])
      },
      insert(id, item) {
        if (!exists(id) || !exists(item)) return undefined

        STORAGE[name][id as keyof T] = item as T
        return item as T
      },
      insertUpdate(id, item) {
        return this.insert(id, item)
      },
      create(item) {
        const index =
          options?.pkStrategy === PrimaryKeyFillStrategy.AutoIncrement
            ? lastId++
            : uuidv4()

        const constructed = {
          ...item,
          [pk]: index,
        }

        STORAGE[name][index] = constructed
        return constructed as T
      },
      patch(id, item) {
        const _item = this.get(id)
        if (!_item) return undefined

        const constructed = {
          ..._item,
          ...excludeId<T, PK>(item as T, pk),
        } as T

        STORAGE[name][id as keyof T] = constructed
        return constructed as T
      },
      reduceUpdate(id, reducer) {
        const _item = this.get(id)
        if (!_item) return undefined

        const constructed = { ...excludeId<T, PK>(reducer(_item) as T, pk), id }

        STORAGE[name][id as keyof T] = constructed
        return constructed as T
      },
      update(id, item) {
        const _item = this.get(id)
        if (!exists(_item)) return undefined

        const constructed = {
          ...excludeId<T, PK>(item as T, pk),
          [pk]: id,
        }
        STORAGE[name][id as keyof T] = constructed
        return constructed as T
      },
      delete(id) {
        const _item = this.get(id)
        if (!exists(_item)) return undefined
        delete STORAGE[name][id]
        return _item
      },
      dump() {
        return STORAGE[name]
      },
      dumpToArray(length) {
        return Object.values(STORAGE[name]).slice(0, length)
      },
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
        STORAGE[name] = {}
      },
      length() {
        return STORAGE[name]?.length
      },
    }
  }

export const deleteTable = (
  name: string,
  storage: CrudStorage = __DEFAULT_BASE_STORAGE,
) => delete storage[name]

export const getBoundStorage = (storage: CrudStorage) => useTable(storage)
