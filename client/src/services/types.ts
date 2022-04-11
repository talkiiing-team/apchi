import { Credentials, User } from '@apchi/shared'

export type AnyRecord = Record<string, unknown>

export type SafeKeyTypes<T extends AnyRecord> = Extract<
  keyof T,
  string | number | symbol
>

export type RegisterData = Omit<User, 'userId'> & Credentials

export type ServiceCallType<T> = (method: string, ...args: any[]) => Promise<T>

export type PokeAppService = <
  T extends AnyRecord = any,
  IdField extends string = 'id',
>(
  serviceName: string,
) => {
  call: ServiceCallType<T>
  insert: (id: T[IdField], item: T) => ReturnType<ServiceCallType<T>>
  insertUpdate: (id: T[IdField], item: T) => ReturnType<ServiceCallType<T>>
  create: (fullBody: Omit<T, IdField>) => ReturnType<ServiceCallType<T>>
  get: (id: string | number) => ReturnType<ServiceCallType<T>>
  patch: (
    id: string | number,
    partialBody: Partial<Omit<T, IdField>>,
  ) => ReturnType<ServiceCallType<T>>
  update: (
    id: string | number,
    fullBody: Omit<T, IdField>,
  ) => ReturnType<ServiceCallType<T>>
  delete: (id: string | number) => ReturnType<ServiceCallType<T>>
  dump: () => ReturnType<ServiceCallType<T>>
  dumpToArray: () => ReturnType<ServiceCallType<T>>
}

export type PokeApp = {
  service: PokeAppService
  authenticate: (
    credentials: Credentials,
  ) => ReturnType<ReturnType<PokeAppService>['call']>
  register: (
    registerData: RegisterData,
  ) => ReturnType<ReturnType<PokeAppService>['call']>
}
