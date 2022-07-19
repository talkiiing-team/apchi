import { patchServerWithIO } from './socket'
import { createServer } from 'http'
import { app } from '@/rest'
import {
  registerAllRestControllers,
  registerAllEventControllers,
} from '@/listeners'
import { Router } from 'express'

const PORT = parseInt(import.meta.env.PORT || '3071')
const httpBaseServer = createServer(app)

const ioServer = patchServerWithIO(httpBaseServer)
const router = Router()

registerAllEventControllers(ioServer)
registerAllRestControllers(router)

app.use('/api', router)
console.log(router.stack)
app.get('/wall/ge', (req, res) => res.send('nok'))

const listener = httpBaseServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on //0.0.0.0:${(listener.address() as any).port}`)
})
