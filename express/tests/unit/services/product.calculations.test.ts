import { describe, it, expect } from 'vitest'
import { calculateProduct } from '../../../src/services/product.calculations'
import { Material, Machine } from '@pawn-to-pawn/shared'
import { ClientError } from '../../../src/errors/client.error'

const validMaterial: Material = {
    id:'material-1',
    type: "monopliegue",
    weight: 500,
    price: 1.5
}

const validMachine: Machine = {
    id:'maquina-1',
    name: "encourage-v2",
    max_widht: 2000,
    max_weight: 1500000,
    max_velocity: 1000,
    price: 1.5
}

const validLength: number = 40

const validwidht: number = 500

describe('calculateProduct', () => {
    it('calculates weight, time and price for a product', () => {
        // Act
        const result = calculateProduct({
            material:validMaterial, 
            machine:validMachine, 
            length:validLength, 
            widht:validwidht 
        })
        // Assert
        expect(result.estimated_time).toBe(20)
        expect(result.estimated_weight).toBe(20000)
        expect(result.price).toBe(90)
    })
    it('accepts a product weight equal to max_weight', () => {
        // Arrange
        const machine = {...validMachine, max_weight:20000}
        // Act
        const result = calculateProduct({
            material:validMaterial,
            machine,
            length:validLength,
            widht:validwidht
        })
        // Assert
        expect(result.estimated_time).toBe(20)
        expect(result.estimated_weight).toBe(20000)
        expect(result.price).toBe(90)
    })
    it('rejects a product heavier than max_weight', () => {
        // Arrange
        const machine = {...validMachine, max_weight:19999}
        // Act
        const act = () => calculateProduct({
            material:validMaterial,
            machine,
            length:validLength,
            widht:validwidht
        })
        // Assert
        expect(act).toThrow(ClientError)
        expect(act).toThrow('too small')
    })
    it('accepts a width equal to max_widht', () => {
        // Arrange
        const widht = 2000
        // Act
        const result = calculateProduct({
            material: validMaterial,
            machine: validMachine,
            length: validLength,
            widht
        })
        // Assert
        expect(result.estimated_time).toBe(20)
        expect(result.estimated_weight).toBe(20000)
        expect(result.price).toBe(90)
    })
    it('rejects a product wider than max_widht', () => {
        // Arrange
        const widht = 2001
        // Act
        const act = () => calculateProduct({
            material: validMaterial,
            machine: validMachine,
            length: validLength,
            widht
        })
        // Assert
        expect(act).toThrow(ClientError)
        expect(act).toThrow('too narrow')
    })
    // TODO: weight should depend on width (g/m²). See TESTING.md
    it('does not take the width into account for the weight (current behavior)', () => {
        // Arrange
        const input = { material: validMaterial, machine: validMachine, length: validLength }
        // Act
        const narrow = calculateProduct({ ...input, widht: 600 })
        const wide = calculateProduct({ ...input, widht: 1200 })
        // Assert
        expect(wide.estimated_weight).toBe(narrow.estimated_weight)
    })
    it('calculates prices with decimals without floating point errors', () => {
        // Arrange
        const length = 3
        const material: Material = { ...validMaterial, price: 0.1 }
        const machine: Machine = { ...validMachine, price:  0 }
        // Act
        const result = calculateProduct({
            material,
            machine,
            length,
            widht: validwidht
        })
        // Assert
        expect(result.price).toBeCloseTo(0.3)
    })
})