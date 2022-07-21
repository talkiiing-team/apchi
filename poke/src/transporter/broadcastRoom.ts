import { withIO } from '@/transporter/withIO'
import { buildRoomName } from '@/utils/domain/buildRoomName'
import { Room } from '@apchi/shared'

export const broadcastRoom =
  (room: Room['id']) =>
  (event: string, ...args: any[]) =>
    withIO(io => io.to(buildRoomName(room)).emit(event, ...args))
