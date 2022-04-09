import { httpServer } from './socket'

const port = parseInt(import.meta.env.PORT as string)

const listener = httpServer.listen(port > 0 ? port : 3030, '0.0.0.0', () => {
  console.log(`Listening on http://0.0.0.0:${(listener.address() as any).port}`)
})
