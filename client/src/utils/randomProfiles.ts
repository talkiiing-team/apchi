import {
  getRandomAge,
  getRandomName,
  getRandomPhotos,
} from '@/utils/randomData'
import { User } from '@apchi/shared'

export const randomUsers = (count: number): (User & Record<string, any>)[] => {
  return Array.from({ length: count }, () => ({
    active: true,
    userId: Math.floor(Math.random() * 2000),
    name: getRandomName(),
    age: getRandomAge(),
    coverURL: getRandomPhotos(1)[0],
    photos: getRandomPhotos(Math.round(Math.random() * 8)),
  }))
}
