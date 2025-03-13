import express, { json } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { clientsRouter } from './routes/clients.js'
import { usersRouter } from './routes/users.js'
/* import { corsMiddleware } from './middleware/cors.js' */

const port = process.env.PORT ?? 3000
const app = express()
app.disable('x-powered-by')

// Middlewares
/* app.use(corsMiddleware) */
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(json())
app.use(cookieParser())

// Endpoints
app.use('/clients', clientsRouter)
app.use('/users', usersRouter)

// 404 Not Found
app.use((req, res) => {
  res.status(404).send('404 Not Found')
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})
