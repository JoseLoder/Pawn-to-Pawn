import { z } from 'zod'
import { LogUser, RegisterUser } from '@pawn-to-pawn/shared'

const userRegisterSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  id_number: z.string().length(9),
  phone: z.string().regex(/^\d+$/).length(9)
})

const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export function validateUser({ name, email, password, id_number, phone }: RegisterUser) {
  return userRegisterSchema.safeParseAsync({ name, email, password, id_number, phone })
}
export function validateLogin({ email, password }: LogUser) {
  return userLoginSchema.safeParseAsync({ email, password })
}
