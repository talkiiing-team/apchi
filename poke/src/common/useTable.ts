import { v4 as uuidv4 } from 'uuid'

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

export type CrudMethod = keyof Crud<any, any>

// TODO: Убить долбаеба который пишет так
//export crudMethods: string[] = ['get', 'find', 'findAll', 'findId', 'findAllIds', 'create' ]

export type Crud<T extends AnyRecord, PK extends SafeKeyTypes<T>> = {
  get(id: T[PK]): T | undefined
  find(reducer: TableReducerFn<T, PK>): T | undefined
  findAll(reducer: TableReducerFn<T, PK>): T[]
  findId(reducer: TableReducerFn<T, PK>): PK | undefined
  findAllIds(reducer: TableReducerFn<T, PK>): PK[]
  insert(id: T[PK], item: T): T | undefined
  create(item: Omit<T, PK>): T
  patch(id: T[PK], item: Partial<Omit<T, PK>>): T | undefined
  update(id: T[PK], item: Omit<T, PK>): T | undefined
  delete(id: T[PK]): T | undefined
  dump(): Table<T, PK>
  dumpToArray(): T[]
  _clean(): void
}

type TableControllerOptions = {
  pkStrategy: 'autoincrement' | 'uuid'
}

const STORAGE: Record<string, Table<any, any>> = {}

const excludeId = <T extends AnyRecord, PK = string>(object: T, pk: PK): T => {
  const { id, ...rest } = object
  return rest as T
} // TODO: Rewrite that shit

/**
 * If pkStrategy in options is `autoincrement`, then we could assume that pk is `number`-typed
 */
export const useTable = <
  T extends Record<string, unknown>,
  PK extends SafeKeyTypes<T>,
>(
  name: string,
  pk: PK,
  options: TableControllerOptions = {
    pkStrategy: 'autoincrement',
  },
): Crud<T, typeof pk> => {
  if (!STORAGE[name]) STORAGE[name] = {}

  let lastId = 0

  return {
    get(id) {
      return STORAGE[name][id]
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
      return result ? (result[pk] as PK) : undefined
    },
    findAllIds(reducer) {
      const result = this.findAll(reducer)
      return result.map(v => v[pk]) as PK[]
    },
    insert(id, item) {
      if (!id || !item) return undefined

      STORAGE[name][id as keyof T] = item as T
      return item as T
    },
    create(item) {
      const index =
        options?.pkStrategy === 'autoincrement' ? lastId++ : uuidv4()

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
        ...excludeId(item, 'id'),
      } as T

      STORAGE[name][id as keyof T] = constructed
      return constructed as T
    },
    update(id, item) {
      const _item = this.get(id)
      if (!_item) return undefined

      const constructed = {
        ...excludeId(item, 'id'),
        [pk]: id,
      }
      STORAGE[name][id as keyof T] = constructed
      return constructed as T
    },
    delete(id) {
      const _item = this.get(id)
      if (!_item) return undefined
      delete STORAGE[name][id]
      return _item
    },
    dump() {
      return STORAGE[name]
    },
    dumpToArray() {
      return Object.values(STORAGE[name])
    },
    _clean() {
      STORAGE[name] = {}
    },
  }
}

export const deleteTable = (name: string) => delete STORAGE[name]
