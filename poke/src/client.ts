import io from 'socket.io-client'

export const setupClientInstance = (port: number) => {
  const client = io(`http://localhost:${port}`, {
    transports: ['websocket'],
  })
  console.log('Setting up local session')
  client.on('connecting', () => {
    console.log('Connecting to local terminal...')
  })
  client.on('connect', () => {
    console.log('Connected to local terminal')
  })
  client.on('error', e => {
    console.log(e)
  })
  client.on('connect_error', e => {
    console.log(e)
  })
  client.on('connect_failed', e => {
    console.log(e)
  })
  return client
}
