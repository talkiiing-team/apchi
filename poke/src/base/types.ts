export enum PrimaryKeyFillStrategy {
  AutoIncrement = 'autoincrement',
  Hash = 'hash',
}

export type AnyRecord = Record<string | number, unknown>
export type SafeKeyTypes<T extends AnyRecord> = Extract<
  keyof T,
  string | number
>

export type Table<T extends AnyRecord, PK extends SafeKeyTypes<T>> = Record<
  PK,
  T
>

export type TableHOF<T, PK> = (item: T, id: PK) => boolean
export type TableRowReducer<T, PK extends keyof T> = (
  item: Omit<T, PK>,
) => Omit<T, PK>
export type TableForEachFn<T> = (item: T, id: number) => any

export type CrudMethodName = keyof Crud<any, any>
export type CrudMethod = Crud<any, any>[CrudMethodName]

export type Crud<T extends AnyRecord, PK extends SafeKeyTypes<T>> = {
  // Basic Getter
  get(id: T[PK] | undefined): T | undefined
  // Create
  create(item: Omit<T, PK>): T
  // Finders
  find(predicate: TableHOF<T, PK>): T | undefined
  findAll(predicate: TableHOF<T, PK>): T[]
  findId(predicate: TableHOF<T, PK>): T[PK] | undefined
  findAllIds(predicate: TableHOF<T, PK>): T[PK][]
  // Finders with limit (low-performance)
  selectSome(predicate: TableHOF<T, PK>, limit: number): T[]
  selectSomeIds(predicate: TableHOF<T, PK>, limit: number): T[PK][]
  // Inserters, or hard updaters
  insert(id: T[PK], item: T): T | undefined
  insertUpdate(id: T[PK], item: T): T | undefined

  patch(id: T[PK], item: Partial<Omit<T, PK>>): T | undefined
  reduceUpdate(id: T[PK], reducer: TableRowReducer<T, PK>): T | undefined
  update(id: T[PK], item: Omit<T, PK>): T | undefined
  delete(id: T[PK]): T | undefined
  dump(): Table<T, PK>
  dumpToArray(length?: number): T[]
  forEach(fn: TableForEachFn<T>): any
  _merge<ExternalType = Record<string, any>>(
    externalItems: (Record<PK, T[PK]> & ExternalType)[],
  ): any[]
  _clean(): void
  length(): number
}

export type CrudStorage = Record<string, Table<any, any>>

export type TableControllerOptions = {
  pkStrategy?: PrimaryKeyFillStrategy
  hashIdSize?: number
}
