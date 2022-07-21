import express, { Router } from 'express'
import cors from 'cors'
import multer from 'multer'
import filesStore from '@/store/files.store'
import { ErrorRequestHandler } from 'express-serve-static-core'

const app = express()

app.use(
  cors({
    origin: '*',
  }),
)

app.use(express.json())

/**
 * Express has a problem with untyped interface for errors
 */

app.use(((err, req, res, next) => {
  console.error('ERROR', err.name)
  // @ts-ignore
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({
      status: 'rejected',
      reason: 'JSON_PARSE_ERROR',
      // @ts-ignore
      message: err.message,
    }) // Bad request
  }
  next()
}) as express.ErrorRequestHandler)

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
