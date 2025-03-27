import jwt from 'jsonwebtoken'
import { ZodError } from 'zod'
import { CookieOptions, Request, Response } from 'express'

import bcrypt from 'bcrypt'
import { UserModel } from '../models/user.model.js'
import { ClientError } from '../errors/client.error.js'
import { validateUser } from '../schema/users.schema.js'
import { ServerError } from '../errors/server.error.js'
import { handleError } from '../errors/handleError.js'
import { LogUser, RegisterUser, User } from '../types/users.types.js'

export const UserController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LogUser
      if (!email?.trim() || !password?.trim()) {
        throw new ClientError('Email and password are required')
      }

      const user: User | undefined = await UserModel.getByEmail(email.trim());
      if (!user) {
        throw new ClientError('Invalid credentials')
      };


      const isValid = await bcrypt.compare(password.trim(), user.password)
      if (!isValid) {
        throw new ClientError('Invalid credentials')
      }

      const token = jwt.sign(
        {
          id: user.id
        },
        process.env.SECRET_JWT_KEY ?? 'fallback_secret',
        {
          expiresIn: '15m'
        }
      )

      const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
        path: '/'
      }

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_JWT_KEY ?? 'fallback_refresh_secret',
        { expiresIn: '7d' }
      )
      res
        .status(200)
        .cookie('access_token', token, cookieOptions)
        .cookie('refresh_token', refreshToken, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .json({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        })
    } catch (e) {
      handleError(e as Error, res)
    }
  },

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, password } = req.body
      const validated = await validateUser({ email, name, password })
      if (!validated.success) {
        if (validated.error instanceof ZodError) {
          throw validated.error
        }
      }
      const exists = await UserModel.getByEmail(email)
      if (exists) {
        throw new ClientError('This client already exists')
      }

      const salt = await bcrypt.genSalt(10)
      console.log('salt ', salt)
      console.log('password', validated.data.password)
      const hash = await bcrypt.hash(validated.data.password, salt)
      if (!hash) {
        throw new ServerError('Password hashing failed')
      }
      console.log('hash ', hash)
      const user = {
        id: crypto.randomUUID(),
        email: validated.data.email,
        name: validated.data.name,
        password: hash
      }
      console.log(user)
      const createdUserId = await UserModel.create(user)
      if (!createdUserId) {
        throw new ServerError('Finally the user was not be created')
      }
      const createdUser = await UserModel.getById(createdUserId)
      res.status(201).json({ success: true, createdUser })
    } catch (e) {
      handleError(e, res)
    }
  },

  async logout(req, res) {
    try {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      }

      res
        .clearCookie('access_token', cookieOptions)
        .clearCookie('refresh_token', cookieOptions)

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      })
    } catch (e) {
      handleError(e, res)
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params
      if (!id) throw new ClientError('Id must be correct')
      const user = await UserModel.getById(id)
      if (!user) throw new ClientError('User does not exists')
      const erased = await UserModel.delete(id)
      if (!erased) throw new ServerError('Finally the user was not deleted')
      res.status(200).json({ success: true, user })
    } catch (e) {
      handleError(e, res)
    }
  }
}
