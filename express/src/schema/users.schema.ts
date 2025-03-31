import { z } from 'zod'
import { LogUser, RegisterUser } from '../types/users.types'

const userRegisterSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
})

const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export function validateUser({ name, email, password }: RegisterUser) {
  return userRegisterSchema.safeParseAsync({ name, email, password })
}
export function validateLogin({ email, password }: LogUser) {
  return userLoginSchema.safeParseAsync({ email, password })
}
