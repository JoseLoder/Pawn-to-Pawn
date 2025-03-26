import DBlocal from 'db-local'

import { DB } from '../database/connect.js'
import { QueryError } from '../errors/server.error.js'

const { Schema } = new DBlocal({ path: './database' })

const User = Schema('User', {
  _id: { type: String, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

export class UserModel {
  static async getById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?'

    return new Promise((resolve, reject) => {
      DB.get(sql, id, (err, row) => {
        if (!row) resolve(undefined)
        if (err) {
          return reject(new QueryError('Could not get a user'))
        }
        resolve(row)
      })
    })
  }

  static async getByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?'
    return new Promise((resolve, reject) => {
      DB.get(sql, email, (err, row) => {
        if (!row) resolve(undefined)
        if (err) {
          return reject(new QueryError('Could not get a user'))
        }
        resolve(row)
      })
    })
  }

  static async create(user) {
    const sql =
      'INSERT INTO users(id, name, email, password) VALUES(?, ?, ?, ?)'
    return new Promise((resolve, reject) => {
      DB.run(
        sql,
        [user.id, user.name, user.email, user.password],
        (err, row) => {
          if (err) {
            return reject(new QueryError('The user could not be created'))
          }
          resolve(user.id)
        }
      )
    })
  }

  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?'
    return new Promise((resolve, reject) => {
      DB.run(sql, [id], (err, row) => {
        if (err) return reject(new QueryError('User can not be deleted'))
        resolve(true)
      })
    })
  }
}
