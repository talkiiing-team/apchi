import baseExpressApp from './baseExpressApp'
import { createServer } from 'http'
import { patchServerWithIO } from '@/socket'

const httpServer = createServer(baseExpressApp)

const ioServer = patchServerWithIO(httpServer)

export { ioServer, httpServer }
