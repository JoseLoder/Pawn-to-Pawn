import { z } from "zod";
import { CreateMachine } from "@pawn-to-pawn/shared";

const MachineRegisterSchema = z.object({
    name: z.string().min(3),
    price: z.number().min(.1),
    max_velocity: z.number().min(500),
    max_weight: z.number().min(1000),
    max_widht: z.number().min(1000)
})

export function validateMachine({ name, price, max_velocity, max_weight, max_widht }: CreateMachine) {
    return MachineRegisterSchema.safeParseAsync({ name, price, max_velocity, max_weight, max_widht })
}