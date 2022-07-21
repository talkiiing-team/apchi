import { Room } from '@apchi/shared'
const roomPrefix = 'room'
export const buildRoomName = (roomId: Room['id']) => `${roomPrefix}:${roomId}`
