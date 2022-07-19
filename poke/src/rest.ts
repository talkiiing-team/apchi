import express, { Router } from 'express'
import cors from 'cors'
import multer from 'multer'
import filesStore from '@/store/files.store'

const app = express()

app.use(
  cors({
    origin: '*',
  }),
)

app.use(express.json())

app.get('/', (req, res) => res.json({ greeting: 'Hello from Poke' }))

const nativeRouter = Router()
  .post('/upload', multer().single('file'), async (req, res) => {
    const { file } = req as typeof req & { file: { buffer: Buffer } }
    const rawB64 = file.buffer.toString('base64')

    const createdId = filesStore.create({ content: rawB64 }).id

    res.json({ id: createdId })
  })
  .post('/save64', (req, res) => {
    const { b64content } = req.body

    const createdId = filesStore.create({
      content: b64content.split('base64,')[1],
    }).id

    res.json({ id: createdId })
  })

app.use('/_native', nativeRouter)

export { app }
