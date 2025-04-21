import { z } from "zod";


const OrderRegisterSchema = z.object({
    id_client: z.string(),
    id_product: z.string(),
    quantity: z.number().min(1)
})

export function validateOrder(id_client: unknown, id_product: unknown, quantity: unknown) {
    return OrderRegisterSchema.safeParseAsync({ id_client, id_product, quantity })
}