import { Router } from 'express'

export const corsMiddleware = Router()

/* const ACCEPTED_ORIGINS = [
  'http://localhost:1234',
  'http://127.0.0.1:5500',
  'https://my-app.com'
]
corsMiddleware.use((req, res, next) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept')
  } else {
    res.header('Access-Control-Allow-Origin', 'http://localhost:1234')
  } */
corsMiddleware.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept')
  next()
})
