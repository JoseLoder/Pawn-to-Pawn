import express, { json } from 'express'
import cookieParser from 'cookie-parser'

import { clientsRouter } from './routes/clients.js'
import { corsMiddleware } from './middleware/cors.js'
import { usersRouter } from './routes/users.js'

const port = process.env.PORT ?? 3000
const app = express()
app.disable('x-powered-by')

// Middlewares
app.use(corsMiddleware)
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
