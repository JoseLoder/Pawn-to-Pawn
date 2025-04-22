import jwt from 'jsonwebtoken'
import { ZodError } from 'zod'
import { CookieOptions, Request, Response } from 'express'

import bcrypt from 'bcrypt'
import { UserModel } from '../models/user.model.ts'
import { ClientError } from '../errors/client.error.ts'
import { validateLogin, validateUser } from '../schema/users.schema.ts'
import { ServerError } from '../errors/server.error.ts'
import { handleError } from '../errors/handleError.ts'
import { LogUser, RegisterUser } from '../types/users.types.ts'

export const UsersController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LogUser
      const validated = await validateLogin({ email, password })
      if (!validated.success || !validated.data) {
        if (validated.error instanceof ZodError) {
          throw validated.error
        }
        throw new ClientError('Validation failed')
      }

      const user = await UserModel.getByEmail(validated.data.email);
      if (!user || user instanceof Error) {
        throw new ClientError('Invalid credentials')
      }


      const isValid = await bcrypt.compare(password.trim(), user.password)
      if (!isValid) {
        throw new ClientError('Invalid credentials')
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role
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
        {
          id: user.id
        },
        process.env.REFRESH_JWT_KEY ?? 'fallback_refresh_secret',
        {
          expiresIn: '7d'
        }
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
      const { email, name, password, id_number, phone } = req.body as RegisterUser
      const validated = await validateUser({ email, name, password, id_number, phone })
      if (!validated.success || !validated.data) {
        if (validated.error instanceof ZodError) {
          throw validated.error
        }
        throw new ClientError('Validation failed')
      }
      const exists = await UserModel.getByEmail(email)
      if (exists) {
        throw new ClientError('This client already exists')
      }

      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(validated.data.password, salt)
      if (!hash) {
        throw new ServerError('Password hashing failed')
      }
      const id = crypto.randomUUID() as string
      const user = {
        ...validated.data,
        password: hash
      }
      const createdUserId = await UserModel.create(id, user)
      if (!createdUserId) {
        throw new ServerError('Finally the user was not be created')
      }
      const createdUser = await UserModel.getById(createdUserId)
      if (!createdUser) {
        throw new ServerError('The user was not found after creation.')
      }
      const { password: _, ...userWithoutPassword } = createdUser
      res.status(201).json({ success: true, userWithoutPassword })
    } catch (e) {
      handleError(e as Error, res)
    }
  },

  async logout(_: Request, res: Response) {
    try {
      const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      }

      res.status(200)
        .clearCookie('access_token', cookieOptions)
        .clearCookie('refresh_token', cookieOptions)
        .json({
          success: true,
          message: 'Logout successful'
        })
    } catch (e) {
      handleError(e as Error, res)
    }
  },
  async setAsWorker(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) throw new ClientError('The id must be correct')
      const user = await UserModel.getById(id)
      if (!user) throw new ClientError('This user not exists')
      if (user.role !== 'client') throw new ClientError('This user must be a client')
      const operatorUserId = await UserModel.createOperator(user.id)
      if (!operatorUserId) throw new ServerError('Could not be created a new worker')
      const operatorUser = await UserModel.getById(operatorUserId)
      if (operatorUser.role != 'operator') throw new ServerError('Unknow Error: The client user can not be convert to operator user')
      const { password: _, ...userWithoutPassword } = operatorUser
      res.status(200).json({ success: true, userWithoutPassword })
    } catch (e) {
      handleError(e as Error, res)
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) throw new ClientError('Id must be correct')
      const user = await UserModel.getById(id)
      if (!user || user instanceof Error) throw new ClientError('User does not exists')
      const erased = await UserModel.delete(id)
      if (!erased) throw new ServerError('Finally the user was not deleted')
      const { password: _, ...userWithoutPassword } = user
      res.status(200).json({ success: true, userWithoutPassword })
    } catch (e) {
      handleError(e as Error, res)
    }
  }
}
