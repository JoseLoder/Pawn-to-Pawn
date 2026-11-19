import { describe, it, expect } from 'vitest'
import { validateUser, validateLogin } from '../../../src/schema/users.schema'
import { RegisterUser, LoginUser } from '@pawn-to-pawn/shared'

//Fixture: a user that passes every rule.
// Each test starts from here and breaks ONE field
const validUser: RegisterUser = {
    name: 'Anabel',
    email: 'ana@example.com',
    password: 'secret1',
    id_number: '12345678A',
    phone: '600111222'
}

const validLogin: LoginUser = {
    email: 'ana@example.com',
    password: 'secret1'
}

describe('validateUser', () => {
    it('accepts a valid user', async () => {
        // Act
        const result = await validateUser(validUser)
        // Assert
        expect(result.success).toBe(true)
    })

    it('accepts a name with exactly 3 characters', async () => {
        // Arrange
        const user = { ...validUser, name: 'Ana' }
        // Act
        const result  = await validateUser(user)
        // Assert
        expect(result.success).toBe(true)
    })

    it('rejects a name with 2 characters', async () => {
        // Arrange
        const user = { ...validUser, name: 'An' }
        // Act
        const result = await validateUser(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['name'])
    })
    
    it('accepts a short email', async () => {
        // Arrange
        const user = { ...validUser, email: 'a@a.ab' }
        // Act 
        const result = await validateUser(user)
        // Assert
        expect(result.success).toBe(true)
    })

    it('rejects a TLD with one letter', async () => {
        // Arrange
        const user = { ...validUser, email: 'a@b.c' }
        // Act 
        const result = await validateUser(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['email'])
    })

    it('rejects an email whitout @', async () => {
        // Arrange
        const user = { ...validUser, email:'anaexample.com' }
        // Act
        const result = await validateUser(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['email'])
    })

    it('rejects an email witout a dot', async () => {
        // Arrange
        const user = { ...validUser, email:'ana@examplecom' }
        // Act
        const result = await validateUser(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['email'])
    })

    it('accepts a password with exactly 6 characters', async () => {
        // Arrange
        const user = { ...validUser, password:'secret' }
        // Act
        const result = await validateUser(user)
        // Assert
        expect(result.success).toBe(true)
    })

    it('rejects a password with 5 characters', async () => {
        // Arrange
        const user = { ...validUser, password:'secre' }
        // Act
        const result = await validateUser(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['password'])
    })

    it('accepts an id_number with 8 numbers and 1 letter', async () => {
        // Arrange
        const user = { ...validUser, id_number:'12345678A' }
        // Act
        const result = await validateUser(user)
        // Assert
        expect(result.success).toBe(true)
    })

    it('rejects an id_number with all letters', async () => {
        // Arrange
        const user = { ...validUser, id_number:'abcdefghi' }
        // Act
        const result = await validateUser(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['id_number'])
    })

    it('rejects an id_number without letter', async () => {
        // Arrange
        const user = { ...validUser, id_number:'123456789' }
        // Act
        const result = await validateUser(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['id_number'])
    })

    it('rejects an id_number with 8 characters', async () => {
        // Arrange
        const user = { ...validUser, id_number:'1234567A' }
        // Act
        const result = await validateUser(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['id_number'])
    })

    it('rejects an id_number with 10 characters', async () => {
        // Arrange
        const user = { ...validUser, id_number:'123456789A'}
        // Act
        const result = await validateUser(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['id_number'])
    })

    it('converts the letter to uppercase', async () => {
        // Arrange
        const user = { ...validUser, id_number:'12345678a' }
        // Act
        const result = await validateUser(user)
        // Assert
        expect(result.data?.id_number).toBe('12345678A')
    })

    it.each([
        ["600111222"],
        ["+34 600111222"],
        ["+34600111222"],
    ])('accepts the phone "%s"', async (phone) => {
        // Arrange
        const user = { ...validUser, phone }
        // Act
        const result = await validateUser(user)
        // Asssert
        expect(result.success).toBe(true)
    })
    it.each([
        ['6001112222'],   // too long
        ['60011122'],     // too short
        ['60011122a'],    // contains a letter
        ['600 11122'],    // contains a space
        [' 600111222']    // leading space without prefix
    ])('rejects the phone "%s"', async (phone) =>{
        // Arrange
        const user = { ...validUser, phone }
        // Act
        const result = await validateUser(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['phone'])
    })

})

describe('validateLogin', () => {
    it('accepts a short email', async () => {
        // Arrange
        const user = { ...validLogin, email: 'a@a.ab' }
        // Act 
        const result = await validateLogin(user)
        // Assert
        expect(result.success).toBe(true)
    })

    it('rejects a TLD with one letter', async () => {
        // Arrange
        const user = { ...validLogin, email: 'a@b.c' }
        // Act 
        const result = await validateLogin(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['email'])
    })

    it('rejects an email whitout @', async () => {
        // Arrange
        const user = { ...validLogin, email:'anaexample.com' }
        // Act
        const result = await validateLogin(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['email'])
    })

    it('rejects an email witout a dot', async () => {
        // Arrange
        const user = { ...validLogin, email:'ana@examplecom' }
        // Act
        const result = await validateLogin(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['email'])
    })

    it('accepts a password with exactly 6 characters', async () => {
        // Arrange
        const user = { ...validLogin, password:'secret' }
        // Act
        const result = await validateLogin(user)
        // Assert
        expect(result.success).toBe(true)
    })

    it('rejects a password with 5 characters', async () => {
        // Arrange
        const user = { ...validLogin, password:'secre' }
        // Act
        const result = await validateLogin(user)
        // Assert
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['password'])
    })
})