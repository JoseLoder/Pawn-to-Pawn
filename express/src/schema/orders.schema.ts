import { z } from "zod";
import { CreateOrder } from "../types/orders.type";

const OrderRegisterSchema = z.object({
    id_client: z.string(),
    id_product: z.string(),
    quantity: z.number().min(1)
})

export function validateOrder({ id_client, id_product, quantity }: CreateOrder) {
    return OrderRegisterSchema.safeParseAsync({ id_client, id_product, quantity })
}