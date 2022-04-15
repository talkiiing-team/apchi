import md5 from 'crypto-js/md5'
import { User } from '@apchi/shared'

export const createRoomHash = (owner: User) =>
  md5(`${owner.userId}-${+new Date()}`)
    .toString()
    .slice(-6)
