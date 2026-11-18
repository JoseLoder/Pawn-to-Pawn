import { describe, it, expect } from 'vitest'
import { ClientError, UnauthorizedError } from '../../../src/errors/client.error'

describe('ClientError', () => {
    it('is an instance of Error', () => {
        // Arrange & Act
        const message = "Invalid client request"
        const clientError = new ClientError(message)
        // Assert
        expect(clientError).toBeInstanceOf(Error)
    })
    it('stores the message it receives', () => {
        // Arrange & Act
        const message = "Invalid client request"
        const error = new ClientError(message)
        // Assert
        expect(error.message).toBe(message)
    })
    it('is named ClientError', () => {
        // Arrange & Act
        const name = "ClientError"
        const message = "Invalid client request"
        const error = new ClientError(message)
        // Assert
        expect(error.name).toBe(name)
    })
})

describe('UnauthorizedError', () => {
    it('is an instance of ClientError', () => {
        // Arrange & Act
        const message = "Unauthorized access"
        const unauthorizedError = new UnauthorizedError(message)
        // Assert
        expect(unauthorizedError).toBeInstanceOf(ClientError)
    })
    it('stores the message it receives', () => {
        // Arrange & Act
        const message = "Unauthorized access"
        const error = new UnauthorizedError(message)
        // Assert
        expect(error.message).toBe(message)
    })
    // Known bug: UnauthorizedError sets its name to 'ClientError'. To be fixed in block 4 (TDD).
    it.fails('is named UnauthorizedError', () => {
        // Arrange & Act
        const name = "UnauthorizedError"
        const message = "Unauthorized access"
        const error = new UnauthorizedError(message)
        // Assert
        expect(error.name).toBe(name)
    })
})
