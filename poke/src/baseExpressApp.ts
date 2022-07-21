import express from 'express'
import cors from 'cors'

const baseExpressApp = express()

baseExpressApp.use(
  cors({
    origin: '*',
  }),
)

baseExpressApp.use(express.json())

export default baseExpressApp
