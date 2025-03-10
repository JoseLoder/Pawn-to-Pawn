import { Router } from 'express'

export const corsMiddleware = Router()

const ACCEPTED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173'
]
corsMiddleware.use((req, res, next) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept')
    res.header('Access-Control-Allow-Credentials', 'true')
  } else {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  }
  next()
}
)
