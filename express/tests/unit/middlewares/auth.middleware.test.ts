import { describe, expect, it, vi } from 'vitest'
import { Request, Response, NextFunction} from 'express'
import { authAdmin, authClient, authOperator } from '../../../src/middlewares/auth.middleware'
import { create } from 'domain'

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
