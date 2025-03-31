import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Extend the Request interface to include the session property
declare global {
  namespace Express {
    interface Request {
      session?: { user: any | null }
    }
  }
}

export function protectedRoute(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.access_token
  req.session = { user: null }

  try {
    const data = jwt.verify(
      token,
      process.env.SECRET_JWT_KEY || 'fallback_secret'
    )
    // TODO verify what this user is professional or client
    req.session.user = data // Add data in the request for get user any route
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Access not authorized ' })
  }
}
