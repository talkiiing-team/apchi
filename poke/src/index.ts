import 'websocket-polyfill'
import { httpServer, io } from './socket'
import { setupClientInstance } from '@/client'

const port = parseInt(import.meta.env.PORT as string) || 3030

const listener = httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Listening on http://0.0.0.0:${(listener.address() as any).port}`)

  /*setTimeout(() => {
    const client = setupClientInstance(port)


    process.stdin.on('data', data => {
      const prompt = Buffer.from(data).toString()
      const [event, ...args] = prompt.split(/"?\s"?/g)
      console.log('c => ', event, args)
      client.emit(event, ...args)
    })
  }, 2000)*/
})
