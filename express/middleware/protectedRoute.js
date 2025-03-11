import jwt from 'jsonwebtoken'
import { SECRET_JWT_KEY } from '../config.js'

export function protectedRoute (req, res, next) {
  const token = req.cookies.access_token
  req.session = { user: null }

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY)
    // TODO verify what this user is professional or client
    req.session.user = data // Add data in the request for get user any route
    next()
  } catch (error) {
    res.status(401).send('Access not authorized')
  }
}
