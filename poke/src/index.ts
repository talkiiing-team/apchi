import { httpServer, io } from './socket'

const { PORT = '3071' } = process.env

const listener = httpServer.listen(parseInt(PORT), '0.0.0.0', () => {
  console.log(`Listening on http://0.0.0.0:${(listener.address() as any).port}`)

  /* setTimeout(() => {
    const client = setupClientInstance(port)

    process.stdin.on('data', data => {
      const prompt = Buffer.from(data).toString()
      const [event, ...args] = prompt.split(/"?\s"?/g)
      console.log('c => ', event, args)
      eval(prompt)
    })
  }, 2000)*/
})
