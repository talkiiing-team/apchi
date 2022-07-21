import { SocketAuth } from '@/models/SocketAuth.model'
import { withIO } from '@/transporter/withIO'
import { Crud } from '@/base/types'
import { User } from '@/models/User.model'

export const sendToUser =
  (authStore: Crud<SocketAuth, 'socketId'>) =>
  (userId: User['userId'], event: string, ...args: any[]) =>
    withIO(io => {
      const socket = authStore.find(v => v.userId === userId)?.socketId
      if (!socket) return
      io.to(socket).emit(event, ...args)
    })
