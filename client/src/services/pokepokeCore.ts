import io from 'socket.io-client'
import { Credentials, User, ErrorResponse } from '@/types'
import { PokeApp } from '@/services/types'

const baseUrl = import.meta.env.PROD
  ? 'https://ws-apchi.s.talkiiing.ru'
  : 'http://localhost:3030'

const socket = io(baseUrl, { transports: ['polling', 'websocket'] })

socket.on('connect', () => {
  console.log('Connected to ' + baseUrl)
})

socket.on('disconnect', () => {
  console.log('Disconnected')
})

window.socket = socket

const delimiter = '/'

const buildEvent = (service: string, method: string) =>
  `${service}${delimiter}${method}`

export const pokepokeCore: PokeApp = {
  authenticate(credentials: Credentials) {
    return this.service('authentication').call('auth', credentials)
  },
  register(data: Omit<User, 'userId'> & Credentials) {
    return this.service('authentication').call('register', data)
  },
  service<T = any, IdField extends string = 'id'>(service: string) {
    type Body = Omit<T, IdField>
    type PartialBody = Partial<Body>

    return {
      call(method: string, ...args: any[]): Promise<T> {
        const event = buildEvent(service, method)
        console.log('call')
        return new Promise((res, rej) => {
          socket.emit(event, ...args)
          console.log('socket sent')

          const doneEvent = `${event}.done`
          const errEvent = `${event}.err`
          const doneListener = (result: any): void => {
            res(result)
            socket.off(doneEvent, doneListener)
            socket.off(errEvent, errListener)
          }
          const errListener = (error: ErrorResponse): void => {
            rej({ ...error, error: true })
            socket.off(errEvent, errListener)
            socket.off(doneEvent, doneListener)
          }

          socket.on(doneEvent, doneListener)
          socket.on(errEvent, errListener)
        })
      },
      insert(id, fullBody) {
        return this.call('insert', id, fullBody)
      },
      insertUpdate(id, fullBody) {
        return this.call('insertUpdate', id, fullBody)
      },
      create(fullBody: Body) {
        return this.call('create', fullBody)
      },
      get(id: string | number) {
        return this.call('get', id)
      },
      patch(id: string | number, partialBody: PartialBody) {
        return this.call('patch', id, partialBody)
      },
      update(id: string | number, fullBody: Omit<T, IdField>) {
        return this.call('update', id, fullBody)
      },
      delete(id: string | number) {
        return this.call('delete', id)
      },
      dump() {
        return this.call('dump')
      },
      dumpToArray() {
        return this.call('dumpToArray')
      },
    }
  },
}
