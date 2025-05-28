import { DB } from '../database/connect.ts'
import { QueryError } from '../errors/server.error.ts'
import { RegisterUser, User } from '@pawn-to-pawn/shared'

export const UserModel = {

  async getAll(): Promise<User[]> {
    const sql = 'SELECT * FROM users'
    const data: { users: User[] } = { users: [] }

    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.all(sql, [], (err, rows) => {
        if (err) return reject(new QueryError('Could not get all users'));

        (rows as User[]).forEach((row: User) => {
          data.users.push({
            ...row
          })
        })
        resolve(data.users)
      })
    })
  },

  async getById(id: string): Promise<User> {
    const sql = 'SELECT * FROM users WHERE id = ?'

    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.get(sql, id, (err, row) => {
        if (err) return reject(new QueryError('Could not get a user'))

        resolve(row as User)
      })
    })
  },

  async getByEmail(email: string): Promise<User> {
    const sql = 'SELECT * FROM users WHERE email = ?'
    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.get(sql, email, (err, row) => {
        if (err) return reject(new QueryError('Could not get a user'))

        resolve(row as User)
      })
    })
  },

  async create(id: string, user: RegisterUser): Promise<string> {
    const sql =
      'INSERT INTO users(id, id_number, name, phone, email, password, role) VALUES(?, ?, ?, ?, ?, ?, ?)'
    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.run(
        sql,
        [id, user.id_number, user.name, user.phone, user.email, user.password, 'client'],
        (err: Error) => {
          if (err) {
            return reject(new QueryError('The user could not be created'))
          }

          resolve(id)
        }
      )
    })
  },

  async createOperator(id: string): Promise<string> {
    const sql = `
      UPDATE users 
      SET role = 'operator' 
      WHERE id = ?
    `;
    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.run(sql, [id], function (err) {
        if (err) {
          return reject(new QueryError(`Could not update role on id_user ${id}`));
        }
        if (this.changes === 0) {
          return reject(new QueryError(`No user found with id ${id}`));
        }
        resolve(id);
      });
    });
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
