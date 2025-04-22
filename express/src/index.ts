import express, { json } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { ClientsRouter } from './routes/clients.route.ts'
import { UsersRouter } from './routes/users.route.ts'
import { OrdersRouter } from './routes/orders.route.ts'
import { ProductsRouter } from './routes/products.route.ts'
import { MaterialsRoute } from './routes/materials.route.ts'
import { MachinesRoute } from './routes/machine.route.ts'
import { initializeAdminUser } from './database/admin.ts'

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
app.use('/orders', OrdersRouter)
app.use('/products', ProductsRouter)
app.use('/materials', MaterialsRoute)
app.use('/machines', MachinesRoute)

// 404 Not Found
app.use((_, res) => {
  res.status(404).send('404 Not Found')
})

initializeAdminUser()

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})
