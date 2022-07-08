import { flow } from 'fp-ts/lib/function'
import { AddListenerFunction, ControllerRegisterer } from '@/types'
import { Crud, CrudMethod } from '@/base/useTable'

export const exposeCrud =
  (
    store: Crud<any, any>,
    exposedMethods?: CrudMethod[],
  ): ControllerRegisterer =>
  (addListener: AddListenerFunction) => {
    Object.entries(store)
      .filter(([name]) => !name.includes('find'))
      .filter(([name]) =>
        !exposedMethods?.length
          ? true
          : exposedMethods.includes(name as CrudMethod),
      )
      .forEach(([methodName, method]) =>
        addListener(methodName, (resolve, reject) =>
          // @ts-ignore
          flow(method.bind(store), (result) => resolve(result)),
        ),
      )
  }
