import { flow } from 'fp-ts/lib/function'
import { AddListenerFunction, ControllerRegisterer } from '@/types'
import { Crud, CrudMethod, CrudMethodName } from '@/base/types'

export const exposeCrud =
  (
    store: Crud<any, any>,
    exposedMethods?: CrudMethodName[],
  ): ControllerRegisterer =>
  (addListener: AddListenerFunction) => {
    ;(Object.entries(store) as [CrudMethodName, CrudMethod][])
      .filter(([name]) => !name.includes('find'))
      .filter(([name]) =>
        exposedMethods?.length ? exposedMethods.includes(name) : true,
      )
      .forEach(([methodName, method]) =>
        addListener(
          methodName,
          resolve => data =>
            flow(method.bind(store, ...data), result => resolve(result)),
        ),
      )
  }
