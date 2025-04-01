import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AccessTokenEncryption } from '../types/tokens.types'
import { RefreshTokenController } from '../controllers/refreshTokens.controller'
import { handleError } from '../errors/handleError'

// Extend the Request interface to include the session property
declare global {
    namespace Express {
        interface Request {
            session?: { userSession: AccessTokenEncryption | null }
        }
    }
}

export function auth(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies.access_token

    req.session = { userSession: null }

    try {
        const data = jwt.verify(
            accessToken,
            process.env.SECRET_JWT_KEY || 'fallback_secret'
        ) as AccessTokenEncryption

        req.session.userSession = data // Add data in the request for get user any route
        next()
    } catch (e) {
        try {
            RefreshTokenController.refresh(req, res, next)
            next()
        } catch (e) {
            handleError(e as Error, res)
        }
    }
}
