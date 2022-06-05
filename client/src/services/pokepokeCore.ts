import io from 'socket.io-client'
import { Credentials, User, ErrorResponse } from '@/types'
import { EventType, ListenerPoke, PokeApp } from './types'

const baseUrl = 'https://enson.s.talkiiing.ru'

const socket = io(baseUrl, {
  transports: ['polling', 'websocket'],
})

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

const listenerMap: Record<string, Set<ListenerPoke>> = {} //new Map<string, ListenerPoke[]>()

socket.io.on('packet', packet => {
  if (packet.data && packet.data instanceof Array) {
    console.log(packet.data)
    const fullEventData = packet.data as Array<any>
    const [eventName, ...data] = fullEventData
    console.log('trying to get ', eventName)
    if (listenerMap[eventName]) {
      console.log(
        listenerMap[eventName].size,
        ' listeners will be called, ',
        data,
      )
      listenerMap[eventName].forEach(listener => listener(...data))
    }
  }
})

export const pokepokeCore: PokeApp & Record<any, any> = {
  on<T extends string>(section: EventType<T>, listener: ListenerPoke) {
    if (!listenerMap[section]) listenerMap[section] = new Set<ListenerPoke>()
    listenerMap[section].add(listener)
    return () => this.off(section, listener)
  },
  off<T extends string>(section: EventType<T>, listener: ListenerPoke) {
    if (!listenerMap[section]) return undefined
    listenerMap[section].delete(listener)
  },
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
