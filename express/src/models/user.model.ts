import { DB } from '../database/connect.js'
import { QueryError } from '../errors/server.error.js'
import { User } from '../types/users.types.js'

export const UserModel = {
  async getById(id: string): Promise<User | undefined> {
    const sql = 'SELECT * FROM users WHERE id = ?'

    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.get(sql, id, (err, row) => {
        if (!row) resolve(undefined)
        if (err) {
          return reject(new QueryError('Could not get a user'))
        }
        resolve(row as User)
      })
    })
  },

  async getByEmail(email: string): Promise<User | undefined> {
    const sql = 'SELECT * FROM users WHERE email = ?'
    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.get(sql, email, (err, row) => {
        if (!row) resolve(undefined)
        if (err) {
          return reject(new QueryError('Could not get a user'))
        }
        resolve(row as User)
      })
    })
  },

  async create(user: User): Promise<string | undefined> {
    const sql =
      'INSERT INTO users(id, name, email, password) VALUES(?, ?, ?, ?)'
    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.run(
        sql,
        [user.id, user.name, user.email, user.password],
        (err: Error) => {
          if (err) {
            return reject(new QueryError('The user could not be created'))
          }
          resolve(user.id)
        }
      )
    })
  },

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM users WHERE id = ?'
    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.run(sql, [id], (err: Error) => {
        if (err) return reject(new QueryError('User can not be deleted'))
        resolve(true)
      })
    })
  }
}
