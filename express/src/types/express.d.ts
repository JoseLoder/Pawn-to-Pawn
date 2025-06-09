import { AccessTokenEncryption } from '@pawn-to-pawn/shared'

declare global {
  namespace Express {
    interface Request {
      session?: { userSession: AccessTokenEncryption | null }
    }
  }
} 