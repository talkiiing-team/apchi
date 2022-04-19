import { useRecoilState } from 'recoil'
import { useCallback, useEffect, useState } from 'react'
import { notificationStore } from '@/store/notification.store'
import { Notification, NotificationImportance } from '@/types'
import md5 from 'crypto-js/md5'

export type NotificationToPush = Omit<
  Partial<Notification> & Required<Pick<Notification, 'title' | 'text'>>,
  'id'
>

const buildNotification = (note: NotificationToPush): Notification => {
  return {
    importance: NotificationImportance.Default,
    ...note,
    id: md5(`${note.title}${note.text}${+new Date()}`).toString(),
  }
}

export const useNotify = (isMasterHook?: boolean, timeout: number = 1000) => {
  const [store, setStore] = useRecoilState(notificationStore)

  const push = useCallback((notification: NotificationToPush) => {
    const newNotification = buildNotification(notification)
    setStore(store => ({ ...store, new: [...store.new, newNotification] }))
    return newNotification.id
  }, [])

  const markAsRead = useCallback((notificationId: Notification['id']) => {
    setStore(store => {
      const notification = store.new.find(n => n.id === notificationId)
      if (!notification) return store
      return {
        ...store,
        old: [...store.old, notification],
        new: store.new.filter(n => n.id !== notificationId),
      }
    })
  }, [])

  const [currentNotification, setCurrentNotification] = useState<
    Notification | undefined
  >()

  const getNext = useCallback(() => {
    const node = store.new[0]
    if (node) {
      setCurrentNotification(undefined)
      setTimeout(() => {
        setCurrentNotification(node)
        markAsRead(node.id)
      }, timeout)
    } else {
      setCurrentNotification(undefined)
    }
  }, [store.new, timeout])

  useEffect(() => {
    if (isMasterHook) {
      getNext()
    }
  }, []) // no deps

  useEffect(() => {
    if (isMasterHook && !currentNotification && store.new.length) {
      getNext()
    }
  }, [store.new])

  return { push, markAsRead, store, getNext, currentNotification }
}
