import { z, ZodType } from 'zod'
import { LogUser } from '@pawn-to-pawn/shared'

const userSchema: ZodType<LogUser> = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export default userSchema