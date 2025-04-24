import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import { CookieOptions } from 'express'

import { handleError } from '../errors/handleError'
import { RefreshTokenModel } from '../models/refreshToken.model'
import { RefreshTokenEncryption } from '../types/tokens.types'
import { UserModel } from '../models/user.model'
import { ClientError } from '../errors/client.error'
import { ServerError } from '../errors/server.error'

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
      const user = await UserModel.getById(decoded.id_user)
      console.log(user)
      if (!user) throw new JsonWebTokenError('The user associated with the token does not exist, please login again')

      // 4. Generar nuevo access token
      const newAccessToken = jwt.sign(
        {
          id_user: user.id,
          role: user.role

        },
        process.env.SECRET_JWT_KEY ?? 'fallback_secret',
        { expiresIn: '15m' }
      )

      // 5. Rotación: Crear nuevo refresh token y 6. Actualizar en base de datos
      const newRefreshToken = await RefreshTokensController.create(user.id, req.headers['user-agent'])

      // Revocar el anterior
      await RefreshTokenModel.revoke(refreshToken)

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

  // This function only use in controller User
  async create(id_user: string, headers: any): Promise<string> {
    // 5. Rotación: Crear nuevo refresh token
    const newIdRefreshToken = crypto.randomUUID()
    const newRefreshToken = jwt.sign(
      {
        id_token: newIdRefreshToken,
        id_user
      },
      process.env.REFRESH_JWT_KEY ?? 'fallback_refresh_secret',
      { expiresIn: '7d' }
    )

    // 6. Actualizar en base de datos
    const refreshToken = await RefreshTokenModel.create({
      id: newIdRefreshToken,
      id_user,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      revoked: false,
      device_info: headers
    })
    await RefreshTokenModel.cleanupExpiredTokens(id_user)
    return refreshToken
  },

  async revoke(token: string): Promise<void> {
    await RefreshTokenModel.revoke(token)
  },
  async revokeAll(req: Request, res: Response): Promise<void> {
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
  },
  async revokeAllForUserDevice(user_id: string, headers: any) {
    await RefreshTokenModel.revokeAllForUserDevice(user_id, headers as string)
  },

  async getByToken(token: string) {
    return await RefreshTokenModel.getByToken(token)

  }
}