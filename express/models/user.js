import DBlocal from 'db-local'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

import { partialValidation, validateUser } from '../schema/users.js'

const { Schema } = new DBlocal({ path: './database' })

const User = Schema('User', {
  _id: { type: String, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

export class UserModel {
  static async create ({ username, name, password }) {
    // Validation Zone
    if (User.findOne({ username })) throw new Error('User already exists')
    const validated = validateUser({ username, name, password })
    if (validated.error) throw new Error(validated.error.message)

    // Generate password hash and generate a random UUID
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const id = crypto.randomUUID()

    // Save user to the database
    User.create({
      _id: id,
      name,
      username,
      password: hash
    }).save()

    // verify
    const user = User.findOne({ username })
    if (!user) throw new Error('Wrong register user')
  }

  static async login (username, password) {
    // Validation Zone
    const user = User.findOne({ username })
    if (!user) throw new Error('Username or password is incorrect')

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error('Username or password is incorrect')

    const validated = partialValidation({ username, password })
    if (validated.error) throw new Error(validated.error.message)

    return { id: user._id, username: user.username, name: user.name }
  }
}
