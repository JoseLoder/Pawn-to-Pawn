import { z } from "zod";
import { CreateMaterial } from "../types/materials.types";

const MaterialRegisterSchema = z.object({
    price: z.number().min(.1),
    type: z.string().min(3),
    weight: z.number().min(1000)
})

export function validateMaterial({ price, type, weight }: CreateMaterial) {
    return MaterialRegisterSchema.safeParseAsync({ price, type, weight })
}