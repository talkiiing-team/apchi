import { useRecoilState } from 'recoil'
import { useCallback } from 'react'
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

export const useNotify = () => {
  const [store, setStore] = useRecoilState(notificationStore)

  const push = useCallback((notification: NotificationToPush) => {
    const newNotification = buildNotification(notification)
    setStore(store => ({ ...store, new: [...store.new, newNotification] }))
  }, [])

  return {}
}
