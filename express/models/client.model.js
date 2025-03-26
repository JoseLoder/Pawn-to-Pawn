import { DB } from '../database/connect.js'
import { QueryError } from '../errors/server.error.js'
export class ClientModel {
  static async getAll() {
    const sql = 'SELECT * FROM clients'
    const data = { clients: [] }

    return new Promise((resolve, reject) => {
      DB.all(sql, [], (err, rows) => {
        if (err) return reject(new QueryError('Could not get all clients'))
        rows.forEach((row) => {
          data.clients.push({
            id: row.id,
            dni: row.dni,
            name: row.name,
            email: row.email,
            phone: row.phone
          })
        })
        resolve(data)
      })
    })
  }

  static async getById(id) {
    const sql = 'SELECT * FROM clients WHERE id = ?'

    return new Promise((resolve, reject) => {
      DB.get(sql, id, (err, row) => {
        if (!row) resolve(undefined)
        if (err) return reject(new QueryError('Could not get a client'))

        /*         const client = {
          id: row.id,
          dni: row.dni,
          name: row.name,
          email: row.email,
          phone: row.phone
        } */
        resolve(row)
      })
    })
  }

  static async getByDni(dni) {
    const sql = 'SELECT * FROM clients WHERE dni = ?'
    return new Promise((resolve, reject) => {
      DB.get(sql, dni, (err, row) => {
        if (!row) resolve(undefined)
        if (err) return reject(new QueryError('Could not get a client'))
        /*         const client = {
          id: row.id,
          dni: row.dni,
          name: row.name,
          email: row.email,
          phone: row.phone
        } */
        resolve(row)
      })
    })
  }

  static async create(client) {
    const sql =
      'INSERT INTO clients(id, dni, name, email, phone) VALUES(?, ?, ?, ?, ?)'
    return new Promise((resolve, reject) => {
      DB.run(
        sql,
        [client.id, client.dni, client.name, client.email, client.email],
        (err, row) => {
          if (err) {
            return reject(new QueryError('The client could not be created'))
          }
          resolve(client.id)
        }
      )
    })
  }

  static async update(id, newName, newEmail, newPhone) {
    const sql = 'UPDATE clients SET name = ?, email = ?, phone = ? WHERE id = ?'
    return new Promise((resolve, reject) => {
      DB.run(sql, [newName, newEmail, newPhone, id], (err, row) => {
        if (err) return reject(new QueryError('Client can not be updated'))
        resolve(id)
      })
    })
  }

  static async delete(id) {
    const sql = 'DELETE FROM clients WHERE id = ?'
    return new Promise((resolve, reject) => {
      DB.run(sql, [id], (err, row) => {
        if (err) return reject(new QueryError('Client can not be deleted'))
        resolve(true)
      })
    })
  }
}
