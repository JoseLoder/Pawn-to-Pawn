import { z, ZodType } from 'zod'
import { RegisterClient } from '../types/Clients'

export const clientSchema: ZodType<RegisterClient> = z.object({
  dni: z.string().length(9),
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().length(9)
})

export function validateClient (client: RegisterClient) {
  return clientSchema.safeParse(client)
}
