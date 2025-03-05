import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(3),
  username: z.string().min(3),
  password: z.string().min(6)
})

export function validateUser (user) {
  return userSchema.safeParse(user)
}

export function partialValidation ({ username, password }) {
  return userSchema.partial({ username, password })
}
