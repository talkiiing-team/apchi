import { createRouter } from 'h3'

const router = createRouter().get('/aboba', () => 'Welcome to Poke!')

export { router }
