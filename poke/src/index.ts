import { app } from '@/rest'
import {
  registerAllRestControllers,
  registerAllEventControllers,
} from '@/listeners'
import { Router } from 'express'
import { callbackCollection } from '@/utils/beforeExitHook'
import { authenticationExpressMiddleware } from '@/utils/authentication/authenticationMiddleware'
import { httpServer, ioServer } from '@/servers'
import { logEvent } from '@/utils/logEvent'

const PORT = parseInt(import.meta.env.VITE_PORT || '3071')
const HOST = import.meta.env.VITE_HOST || '0.0.0.0'
const SCHEMA = import.meta.env.VITE_SCHEMA || 'http'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const router = Router()

logEvent('Registering REST endpoints...')
registerAllRestControllers(router)
logEvent('Registering WS wrapper listener...')
registerAllEventControllers(ioServer)

app.use(API_BASE_URL, authenticationExpressMiddleware)
app.use(API_BASE_URL, router)
logEvent('Authentication middleware with router registered.')

const listener = httpServer.listen(PORT, HOST, () => {
  logEvent(
    `Setup succeed! Listening on ${SCHEMA}://${HOST}:${PORT}${API_BASE_URL}`,
  )
})

process.on('SIGINT', () =>
  listener.close(() => {
    logEvent('Forced stopping. Calling exit hooks...')
    callbackCollection.forEach(f => f())
    process.exit()
  }),
)
