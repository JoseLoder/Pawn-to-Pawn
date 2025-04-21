import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import { CookieOptions } from 'express'

import { handleError } from '../errors/handleError'
import { RefreshTokenModel } from '../models/refreshToken.model'
import { RefreshTokenEncryption } from '../types/tokens.types'
import { UserModel } from '../models/user.model'

export const RefreshTokensController = {
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Obtener el refresh token de cookies
      const refreshToken = req.cookies.refresh_token
      if (!refreshToken) {
        throw new JsonWebTokenError('Refresh token is required, please login again')
      }

      // 2. Verificar y decodificar el refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_JWT_KEY ?? 'fallback_refresh_secret'
      ) as RefreshTokenEncryption

      // 3. Validar en base de datos
      const storedToken = await RefreshTokenModel.getByToken(refreshToken)
      if (!storedToken) {
        throw new JsonWebTokenError('Invalid or expired refresh token, please login again')
      }
      // 3.5 Traer el rol del usuario.
      const user = await UserModel.getById(decoded.userId)
      if (!user) throw new JsonWebTokenError('The user associated with the token does not exist, please login again')

      // 4. Generar nuevo access token
      const newAccessToken = jwt.sign(
        {
          userId: user.id,
          role: user.role

        },
        process.env.SECRET_JWT_KEY ?? 'fallback_secret',
        { expiresIn: '15m' }
      )

      // 5. Rotación: Crear nuevo refresh token y revocar el anterior
      const newIdRefreshToken = crypto.randomUUID()
      const newRefreshToken = jwt.sign(
        {
          tokenId: newIdRefreshToken,
          userId: user.id
        },
        process.env.REFRESH_JWT_KEY ?? 'fallback_refresh_secret',
        { expiresIn: '7d' }
      )
      await RefreshTokenModel.revoke(refreshToken)

      // 6. Actualizar en base de datos
      await RefreshTokenModel.create({
        id: newIdRefreshToken,
        user_id: user.id,
        token: newRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        revoked: false,
        device_info: req.headers['user-agent']
      })

      // 7. Configurar cookies
      const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      }

      // 8. Responder con los nuevos tokens
      res
        .cookie('access_token', newAccessToken, {
          ...cookieOptions,
          maxAge: 15 * 60 * 1000 // 15 minutos
        })
        .cookie('refresh_token', newRefreshToken, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        })

      next()
    } catch (e) {
      // Limpiar cookies si hay error
      handleError(e as Error, res)
    }
  },

  /*  async revokeAll(req: Request, res: Response): Promise<void> {
     try {
       const { id } = req.params
       if (!id) throw new ClientError('User ID is required')
 
       const revoked = await RefreshTokenModel.revokeAllForUser(id)
       if (!revoked) {
         throw new ServerError('Failed to revoke tokens')
       }
 
       res.status(200).json({
         success: true,
         message: 'All refresh tokens revoked successfully'
       })
     } catch (e) {
       handleError(e as Error, res)
     }
   }, */
  /* 
    async cleanupTokens(_: Request, res: Response): Promise<void> {
      try {
        const cleanedCount = await RefreshTokenModel.cleanupExpiredTokens()
  
        res.status(200).json({
          success: true,
          message: `Cleaned ${cleanedCount} expired tokens`
        })
      } catch (e) {
        handleError(e as Error, res)
      }
      } */
}