import { DB } from '../database/connect'
import { QueryError } from '../errors/server.error'
import { RegisterUser, User } from '@pawn-to-pawn/shared'

export const UserModel = {

  async getAll(): Promise<User[]> {
    const sql = 'SELECT * FROM users'
    try {
      const result = await DB.query(sql)
      return result.rows
    } catch (error: unknown) {
      throw new QueryError('Could not get all users')
    }
  },

  async getById(id: string): Promise<User> {
    const sql = 'SELECT * FROM users WHERE id = $1'
    try {
      const result = await DB.query(sql, [id])
      if (result.rows.length === 0) {
        throw new QueryError('User not found')
      }
      return result.rows[0]
    } catch (error: unknown) {
      throw new QueryError('Could not get a user')
    }
  },

  async getByEmail(email: string): Promise<User> {
    const sql = 'SELECT * FROM users WHERE email = $1'
    try {
      const result = await DB.query(sql, [email])
      if (result.rows.length === 0) {
        throw new QueryError('User not found')
      }
      return result.rows[0]
    } catch (error: unknown) {
      throw new QueryError('Could not get a user')
    }
  },

  async create(id: string, user: RegisterUser): Promise<string> {
    const sql = `
      INSERT INTO users(id, id_number, name, phone, email, password, role)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    `
    try {
      await DB.query(sql, [
        id,
        user.id_number,
        user.name,
        user.phone,
        user.email,
        user.password,
        'client'
      ])
      return id
    } catch (error: unknown) {
      throw new QueryError('The user could not be created')
    }
  },

  async createOperator(id: string): Promise<string> {
    const sql = `
      UPDATE users 
      SET role = 'operator' 
      WHERE id = $1
    `
    try {
      const result = await DB.query(sql, [id])
      if (!result.rowCount || result.rowCount === 0) {
        throw new QueryError(`No user found with id ${id}`)
      }
      return id
    } catch (error: unknown) {
      throw new QueryError(`Could not update role on id_user ${id}`)
    }
  },

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM users WHERE id = $1'
    try {
      const result = await DB.query(sql, [id])
      return result.rowCount ? result.rowCount > 0 : false
    } catch (error: unknown) {
      throw new QueryError('User can not be deleted')
    }
  }
}
