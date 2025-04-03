import { DB } from '../database/connect.ts'
import { QueryError } from '../errors/server.error.ts'
import { User } from '../types/users.types.ts'

export const UserModel = {

  async getById(id: string): Promise<User | Error> {
    const sql = 'SELECT * FROM users WHERE id = ?'

    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.get(sql, id, (err, row) => {
        if (err) return reject(new QueryError('Could not get a user'))

        resolve(row as User)
      })
    })
  },

  async getByEmail(email: string): Promise<User | Error> {
    const sql = 'SELECT * FROM users WHERE email = ?'
    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.get(sql, email, (err, row) => {
        if (err) return reject(new QueryError('Could not get a user'))

        resolve(row as User)
      })
    })
  },

  async create(user: User): Promise<string | Error> {
    const sql =
      'INSERT INTO users(id, id_number, name, phone, email, password, role) VALUES(?, ?, ?, ?, ?, ?, ?)'
    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.run(
        sql,
        [user.id, user.id_number, user.name, user.phone, user.email, user.password, 'client'],
        (err: Error) => {
          if (err) {
            return reject(new QueryError('The user could not be created'))
          }

          resolve(user.id)
        }
      )
    })
  },

  async delete(id: string): Promise<boolean | Error> {
    const sql = 'DELETE FROM users WHERE id = ?'
    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.run(sql, [id], (err: Error) => {
        if (err) return reject(new QueryError('User can not be deleted'))
        resolve(true)
      })
    })
  }
}
