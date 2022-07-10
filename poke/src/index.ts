import { createSocketIO } from './socket'
import { createServer } from 'http'
import { app } from '@/rest'

const PORT = parseInt(import.meta.env.PORT || '3071')

const httpServer = createServer(app)

createSocketIO(httpServer)

const listener = httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on //0.0.0.0:${(listener.address() as any).port}`)
})
