import { ZodError } from 'zod'
import { Response } from 'express'
import { ServerError } from './server.error.ts'
import { ClientError } from './client.error.ts'
import { JsonWebTokenError } from 'jsonwebtoken'

export const handleError = (e: Error, res: Response) => {
  if (e instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: e.issues.map((issue) => ({
        code: issue.code,
        path: issue.path.join('.'),
        message: issue.message
      }))
    })
  } else if (e instanceof ClientError) {
    res.status(400).json({
      success: false,
      name: e.name,
      message: e.message
    })
  } else if (e instanceof ServerError) {
    res.status(500).json({
      success: false,
      name: e.name,
      message: e.message
    })
  } else if (e instanceof JsonWebTokenError) {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')

    res
      .status(500)
      .json({
        success: false,
        name: e.name,
        message: e.message
      })
  } else {
    res.status(500).json({
      success: false,
      name: 'UnexpectedError',
      message: 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && {
        error: e instanceof Error ? e.message : 'Unknown error',
        stack: e instanceof Error ? e.stack : undefined
      })
    })
  }
}
