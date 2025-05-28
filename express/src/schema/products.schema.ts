import { z } from 'zod'
import { CreateProduct } from '@pawn-to-pawn/shared'

const ProductRegisterSchema = z.object({
    id_machine: z.string(),
    id_material: z.string(),
    base: z.enum(['iron', 'pvc', 'cardboard']),
    cover: z.enum(['black', 'white', 'golden']),
    length: z.number().min(5),
    widht: z.number().min(500)
})

export function validateProduct({ id_machine, id_material, base, cover, length, widht }: CreateProduct) {
    return ProductRegisterSchema.safeParseAsync({ id_machine, id_material, base, cover, length, widht })
}