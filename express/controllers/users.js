import jwt from 'jsonwebtoken'

import { UserModel } from '../models/user.js'
import { SECRET_JWT_KEY } from '../config.js'

export class UserController {
  static async login (req, res) {
    const { username, password } = req.body
    try {
      const user = await UserModel.login(username, password)
      // Generate Access Token
      const token = jwt.sign(
        { id: user._id, username: user.username, name: user.name },
        SECRET_JWT_KEY,
        // TODO try for cookie same domain, improvement security
        {
          expiresIn: '1h'
        }
      )
      res
        .status(200)
        .cookie('access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
          sameSite: 'strict',
          maxAge: 3600000 * 24 * 7 // 1 week
        })
        .json(user)
    } catch (error) {
      res
        .status(400)
        .json({ message: error.message })
    }
  }

  static async register (req, res) {
    const { username, name, password } = req.body
    try {
      await UserModel.create({ username, name, password })
      res
        .status(201)
        .json({ message: 'Register success' })
    } catch (error) {
      res
        .status(400)
        .send(error.message)
    }
  }

  static async logout (req, res) {
    res
      .clearCookie('access_token')
      .status(200)
      .json({ message: 'Logout successful' })
  }
}
