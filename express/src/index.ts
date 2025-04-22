import express, { json } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { ClientsRouter } from './routes/clients.route.ts'
import { UsersRouter } from './routes/users.route.ts'

const port = process.env.PORT ?? 3000
const app = express()
app.disable('x-powered-by')

// Middlewares
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
)
app.use(json())
app.use(cookieParser())

// Endpoints
app.use('/clients', ClientsRouter)
app.use('/users', UsersRouter)

// 404 Not Found
app.use((_, res) => {
  res.status(404).send('404 Not Found')
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})
