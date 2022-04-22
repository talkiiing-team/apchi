import { flow } from 'fp-ts/lib/function'
import { Server, Socket } from 'socket.io'
import { Crud, CrudMethod } from '@apchi/shared/src/base/useTable'
import { emit } from '@/utils/emit'
import { buildPrefix } from '@/utils/buildPrefix'
import { Controller } from '@/types'

export const exposeCrud =
  (store: Crud<any, any>, exposedMethods?: CrudMethod[]) =>
  (basePrefix: string): Controller =>
  (io: Server) =>
  (sock: Socket, listeners) => {
    const prefix = buildPrefix(basePrefix)

    Object.entries(store)
      .filter(([name]) => !name.includes('find'))
      .filter(([name]) =>
        !exposedMethods?.length
          ? true
          : exposedMethods.includes(name as CrudMethod),
      )
      .forEach(([methodName, method]) =>
        listeners
          ? listeners.set(
              prefix(methodName),
              // @ts-ignore
              flow(method.bind(store), result =>
                emit(prefix(`${methodName}.done`), sock)(result),
              ),
            )
          : console.error(
              `[ERR] ${prefix(
                methodName,
              )} cannot be registered, because listeners map is not available`,
            ),
      )
  }
