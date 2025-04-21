import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AccessTokenEncryption } from '../types/tokens.types'
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

    req.session = { userSession: null }

    try {
        const data = jwt.verify(
            accessToken,
            process.env.SECRET_JWT_KEY || 'fallback_secret'
        ) as AccessTokenEncryption

        req.session.userSession = data // Add data in the request for get user any route
        next()
    } catch (e) {
        RefreshTokensController.refresh(req, res, next)
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
// Auth Role (impossible)
/* export function authByRole(req: Request, res: Response, next: NextFunction, role: RoleUser) {
    try {
        if (!req.session?.userSession || req.session.userSession.role !== role) {
            throw new UnauthorizedError(`Unauthorized access as a ${role}`)
        }
        next()
    } catch (e) {
        handleError(e as Error, res)
    }
} */