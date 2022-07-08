import { createApp } from 'h3'
import { router } from './restRouter'

const app = createApp()
app.use(router)

export { app }
