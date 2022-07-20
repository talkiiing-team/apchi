import { DetailedRoom, Room, User } from '@apchi/shared'
import userStore from '@/store/user.store'
import { exists } from '@/utils/exists'

export const roomMembersPopulate = (members: Room['members']) =>
  members.map(userId => userStore.get(userId)).filter(v => exists(v)) as User[]

export const populateUser = (userId: User['userId']): User | undefined => {
  return userStore.get(userId)
}

export const populateRoom = (room: Room): DetailedRoom => ({
  ...room,
  members: roomMembersPopulate(room.members),
  owner: populateUser(room.owner)!,
})
