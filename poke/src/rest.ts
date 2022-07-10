import express, { Router } from 'express'
import cors from 'cors'
import multer from 'multer'
import wallStore from '@/store/wall.store'
import pictureStore from '@/store/picture.store'

const app = express()

app.use(
  cors({
    origin: '*',
  }),
)

app.use(express.json())

app.get('/', (req, res) => res.json({ greeting: 'Hello from Poke' }))

const router = Router()

router
  .get('/', (req, res) => res.json({ success: 1 }))
  .get('/picture/:id', (req, res) => {
    console.log(pictureStore.get(parseInt(req.params.id)))
    res
      .contentType('image/png')
      .attachment(`${req.params.id}.png`)
      .send(
        Buffer.from(
          pictureStore.get(parseInt(req.params.id))?.content || '',
          'base64',
        ),
      )
  })
  .post('/picture', multer().single('file'), async (req, res) => {
    const { file } = req
    const picRaw = (file.buffer as Buffer).toString('base64')

    const createdId = pictureStore.create({ content: picRaw }).id

    res.json({ id: createdId })
  })
  .post('/drawing', (req, res) => {
    const { raw } = req.body

    const createdId = pictureStore.create({
      content: raw.split('base64,')[1],
    }).id

    res.json({ id: createdId })
  })

app.use('/api', router)

export { app }
