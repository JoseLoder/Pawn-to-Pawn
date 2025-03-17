import { z } from 'zod'

const clientSchema = z.object({
  dni: z.string().length(9),
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().length(9)
})

export function validateClient (client) {
  return clientSchema.safeParse(client)
}

export function validateClientUpdate (client) {
  return clientSchema.partial().safeParse(client)
}
