import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
})

export function validateUser({ name, email, password }) {
  return userSchema.safeParseAsync({ name, email, password })
}
