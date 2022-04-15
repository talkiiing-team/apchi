import { atom } from 'recoil'
import { Notification } from '@/types'

type NotificationStoreModel = {
  new: Notification[]
  old: Notification[]
}

export const notificationStore = atom<NotificationStoreModel>({
  key: 'notificationStore',
  default: { new: [], old: [] },
})
