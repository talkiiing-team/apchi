import { patchServerWithIO } from './socket'
import { createServer } from 'http'
import { app } from '@/rest'
import {
  registerAllRestControllers,
  registerAllEventControllers,
} from '@/listeners'
import { Router } from 'express'
import { callbackCollection } from '@/utils/beforeExitHook'
import { authenticationExpressMiddleware } from '@/utils/authenticationMiddleware'

const PORT = parseInt(import.meta.env.VITE_PORT || '3071')
const HOST = import.meta.env.VITE_HOST || '0.0.0.0'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const httpBaseServer = createServer(app)

const ioServer = patchServerWithIO(httpBaseServer)
const router = Router()

registerAllEventControllers(ioServer)
registerAllRestControllers(router)

app.use(API_BASE_URL, authenticationExpressMiddleware)
app.use(API_BASE_URL, router)

const listener = httpBaseServer.listen(PORT, HOST, () => {
  console.log(
    `Setup succeed, listening on https://${HOST}:${
      (listener.address() as any).port
    }`,
  )
})

process.on('SIGINT', () =>
  listener.close(() => {
    console.log('\nServer stopped. Saving data...')
    callbackCollection.forEach(f => f())
    process.exit()
  }),
)
