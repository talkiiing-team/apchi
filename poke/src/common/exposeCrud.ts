import { flow } from 'fp-ts/lib/function'
import { Server, Socket } from 'socket.io'
import { Crud, CrudMethod } from './useTable'
import { emit } from '@/utils/emit'
import { buildPrefix } from '@/utils/buildPrefix'

export const exposeCrud =
  (store: Crud<any, any>, exposedMethods?: CrudMethod[]) =>
  (basePrefix: string) =>
  (io: Server, sock: Socket) => {
    const prefix = buildPrefix(basePrefix)

    Object.entries(store)
      .filter(([name]) => !name.includes('find'))
      .filter(([name]) =>
        !exposedMethods?.length
          ? true
          : exposedMethods.includes(name as CrudMethod),
      )
      .forEach(([methodName, method]) =>
        sock.on(
          prefix(methodName),
          // @ts-ignore
          flow(method.bind(store), result =>
            emit(prefix(`${methodName}.done`), sock)(result),
          ),
        ),
      )
  }
