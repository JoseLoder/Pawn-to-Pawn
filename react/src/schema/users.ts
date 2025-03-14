import { z, ZodType } from 'zod'
import { LogUser } from '../types/Users'

const userSchema: ZodType<LogUser> = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
})

export function validateUser (user: LogUser) {
  return userSchema.safeParse(user)
}