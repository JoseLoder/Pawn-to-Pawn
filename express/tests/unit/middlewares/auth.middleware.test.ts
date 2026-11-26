import { describe, expect, it, vi } from 'vitest'
import { Request, Response, NextFunction} from 'express'
import { authAdmin, authClient, authOperator, auth } from '../../../src/middlewares/auth.middleware'
import jwt from 'jsonwebtoken'
import { RefreshTokensController } from '../../../src/controllers/refreshTokens.controller'

vi.mock('../../../src/controllers/refreshTokens.controller', () => ({
    RefreshTokensController: { refresh: vi.fn()}
}))

function createReq(role?: string): Request {
    const req = {
        cookies: {},
        session: role ? {userSession: {id_user: 'user-1', role}} : undefined
    }
    return req as unknown as Request
}

function createRes(): Response {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        clearCookie: vi.fn().mockReturnThis()
    }
    return res as unknown as Response
}

function createReqWithCookies(cookies: Record<string, string>): Request {
    const req = { cookies }
    return req as unknown as Request
}

describe('authAdmin', () => {
    it.each([
        ['an admin', 'admin']
    ])('lets %s through', (_label, role) => {
        // Arrange
        const req = createReq(role)
        const res = createRes()
        const next: NextFunction = vi.fn()
        // Act 
        authAdmin(req, res, next)
        // Assert
        expect(next).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })

    it.each([
        ['an operator', 'operator'],
        ['a client', 'client'],
        ['a request without a session', undefined]
    ])('blocks %s', (_label, role) => {
        // Arrange
        const req = createReq('role')
        const res = createRes()
        const next: NextFunction = vi.fn()
        // Act
        authAdmin(req, res, next)
        // Assert
        expect(next).not.toHaveBeenCalled()
        // Known bug: should be 403 (Forbidden). Fixed in block 4 (TDD).
        expect(res.status).toHaveBeenCalledWith(400)
    })
})

describe('authOperator', () => {
    it.each([
        ['an admin', 'admin'],
        ['an operator', 'operator']
    ])('lets %s trough', (_label, role) => {
        // Arrange
        const req = createReq(role)
        const res = createRes()
        const next: NextFunction = vi.fn()
        // Act
        authOperator(req, res, next)
        // Arrange
        expect(next).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })

    it.each([
        ['a client', 'client'],
        ['a request without a session', undefined]
    ])('blocks %s', (_label, role) => {
        // Arrange
        const req = createReq(role)
        const res = createRes()
        const next: NextFunction = vi.fn()
        // Act
        authOperator(req, res, next)
        // Assert
        expect(next).not.toHaveBeenCalled()
        // Known bug: should be 403 (Forbidden). Fixed in block 4 (TDD).
        expect(res.status).toHaveBeenCalledWith(400)
    })
})

describe('authClient', () => {
    it.each([
        ['an admin', 'admin'],
        ['an operator', 'operator'],
        ['a client', 'client']
    ])('lets %s through', (_label, role) => {
        // Arrange
        const req = createReq(role)
        const res = createRes()
        const next: NextFunction = vi.fn()
        // Act
        authClient(req, res, next)
        // Assert
        expect(next).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })

    it.each([
        ['a request without a session', undefined]
    ])('bloks %s', (_label, role) => {
        // Arrange
        const req = createReq(role)
        const res = createRes()
        const next: NextFunction = vi.fn()
        // Act
        authClient(req, res, next)
        // Assert
        expect(next).not.toHaveBeenCalled()
        // Known bug: should be 403 (Forbidden). Fixed in block 4 (TDD).
        expect(res.status).toHaveBeenCalledWith(400)
    })
})

describe('auth', () => {

    it('lets a request with a valid access token through', () => {
        // Arrange
        const accessToken = jwt.sign({id_user: 'user-1', role: 'admin'}, process.env.SECRET_JWT_KEY!)
        const req = createReqWithCookies({access_token: accessToken})
        const res = createRes()
        const next: NextFunction = vi.fn()
        // Act
        auth(req, res, next)
        // Assert
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.session?.userSession).toMatchObject({id_user:'user-1', role: 'admin'})
    })

    it('delegates to refresh when the access token is invalid and there is a refresh token', () => {
        // Arrange
        const req = createReqWithCookies({access_token: 'not-a-valid-token', refresh_token: 'some-refresh-token'})
        const res = createRes()
        const next: NextFunction = vi.fn()
        // Act
        auth(req, res, next)
        // Assert
        expect(vi.mocked(RefreshTokensController.refresh)).toHaveBeenCalledWith(req, res, next)
        expect(next).not.toHaveBeenCalled()
    })

    it('rejects a request without tokens', () => {
        // Arrange
        const req = createReqWithCookies({})
        const res = createRes()
        const next: NextFunction = vi.fn()
        // Act
        auth(req, res, next)
        // Assert
        expect(next).not.toHaveBeenCalled()
        expect(vi.mocked(RefreshTokensController.refresh)).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.clearCookie).toHaveBeenCalledWith('access_token')
        expect(res.clearCookie).toHaveBeenCalledWith('refresh_token')
    })

    it('rejects an invalid access token without a refresh token', () => {
        // Arrange
        const req = createReqWithCookies({access_token: 'not-a-valid-token'})
        const res = createRes()
        const next: NextFunction = vi.fn()
        // Act
        auth(req, res, next)
        // Assert
        expect(next).not.toHaveBeenCalled()
        expect(vi.mocked(RefreshTokensController.refresh)).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.clearCookie).toHaveBeenCalledWith('access_token')
        expect(res.clearCookie).toHaveBeenCalledWith('refresh_token')
    })

    it('delegates to refresh an expired access token with a refresh token', () => {
        // Arrange
        const accessToken = jwt.sign({id_user: 'user-1', role: 'admin'}, process.env.SECRET_JWT_KEY!, {expiresIn: -1})
        const req = createReqWithCookies({access_token: accessToken, refresh_token: 'some-refresh-token'})
        const res = createRes()
        const next: NextFunction = vi.fn()
        // Act
        auth(req, res, next)
        // Assert
        expect(next).not.toHaveBeenCalled()
        expect(vi.mocked(RefreshTokensController.refresh)).toHaveBeenCalledWith(req, res, next)
    })

    it('rejects an expired access token and without refresh token', () => {
        // Arrange
        const accessToken = jwt.sign({id_user: 'user-1', role: 'admin'}, process.env.SECRET_JWT_KEY!, {expiresIn: -1})
        const req = createReqWithCookies({access_token: accessToken})
        const res = createRes()
        const next: NextFunction = vi.fn()
        // Act
        auth(req, res, next)
        // Assert
        expect(next).not.toHaveBeenCalled()
        expect(vi.mocked(RefreshTokensController.refresh)).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.clearCookie).toHaveBeenCalledWith('access_token')
        expect(res.clearCookie).toHaveBeenCalledWith('refresh_token')
    })

})
