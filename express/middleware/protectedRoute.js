import jwt from 'jsonwebtoken'

export function protectedRoute(req, res, next) {
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
