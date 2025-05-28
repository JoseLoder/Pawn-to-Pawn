import { z } from 'zod'
import { CreateClient, UpdateClient } from '@pawn-to-pawn/shared'

const clientRegisterSchema = z.object({
  dni: z.string().length(9),
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().length(9)
})

const clientUpdateSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().length(9)
})

export function validateClient({ dni, name, email, phone }: CreateClient) {
  return clientRegisterSchema.safeParseAsync({ dni, name, email, phone })
}

export function validateClientUpdate({ name, email, phone }: UpdateClient) {
  return clientUpdateSchema.safeParseAsync({ name, email, phone })
}
