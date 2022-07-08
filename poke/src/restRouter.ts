import { createRouter } from 'h3'

const router = createRouter().get('/', () => 'Welcome to Poke!')

export { router }
