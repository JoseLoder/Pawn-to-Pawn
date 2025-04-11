import { z } from 'zod'
import { CreateProduct } from '../types/products.types'

const ProductRegisterSchema = z.object({
    id_machine: z.string(),
    id_material: z.string(),
    base: z.enum(['iron', 'pvc', 'cardboard']),
    cover: z.enum(['black', 'white', 'golden']),
    length: z.number().int(),
    widht: z.number()
})

export function validateProduct({ id_machine, id_material, base, cover, lenght, widht }: CreateProduct) {
    return ProductRegisterSchema.safeParseAsync({ id_machine, id_material, base, cover, lenght, widht })
}