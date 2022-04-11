import { Room } from '@apchi/shared'
const roomPrefix = 'gameRoom'
export const buildRoomName = (roomId: Room['id']) => `${roomPrefix}:${roomId}`
