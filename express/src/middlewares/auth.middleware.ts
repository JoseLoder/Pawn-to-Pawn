import { Request, Response, NextFunction } from 'express'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { AccessTokenEncryption } from '@pawn-to-pawn/shared'
import { RefreshTokensController } from '../controllers/refreshTokens.controller'
import { UnauthorizedError } from '../errors/client.error'
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
    const refreshToken = req.cookies.refresh_token

    req.session = { userSession: null }

    try {
        // First try to verify the access token
        const data = jwt.verify(
            accessToken,
            process.env.SECRET_JWT_KEY || 'fallback_secret'
        ) as AccessTokenEncryption

        req.session.userSession = data
        return next()
    } catch (e) {
        // If access token is invalid/expired and we have a refresh token, try to refresh
        if (refreshToken) {
            return RefreshTokensController.refresh(req, res, next)
        }
        
        // If no refresh token, handle the error
        handleError(new JsonWebTokenError('Authentication required, please login again'), res)
        return
    }
}

// Auth Clients
export function authClient(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.session?.userSession) {
            throw new UnauthorizedError(`Unauthorized access as a client`)
        }
        next()
    } catch (e) {
        handleError(e as Error, res)
    }
}

// Auth Operator
export function authOperator(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.session?.userSession ||
            (req.session.userSession.role !== 'operator' &&
                req.session.userSession.role !== 'admin'
            )
        ) {
            throw new UnauthorizedError(`Unauthorized access as a operator`)
        }
        next()
    } catch (e) {
        handleError(e as Error, res)
    }
}

// Auth Admin
export function authAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.session?.userSession || req.session.userSession.role !== 'admin') {
            throw new UnauthorizedError(`Unauthorized access as a admin`)
        }
        next()
    } catch (e) {
        handleError(e as Error, res)
    }
}