import { z } from "zod";
import { CreateMachine } from "../types/machines.types";

const MachineRegisterSchema = z.object({
    price: z.number().min(.1),
    max_velocity: z.number().min(500),
    max_weight: z.number().min(1000),
    max_widht: z.number().min(1000)
})

export function validateMachine({ price, max_velocity, max_weight, max_widht }: CreateMachine) {
    return MachineRegisterSchema.safeParseAsync({ price, max_velocity, max_weight, max_widht })
}