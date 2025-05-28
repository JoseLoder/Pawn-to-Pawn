// DEPRECATED FILE

import { DB } from '../database/connect.ts'
import { QueryError } from '../errors/server.error.ts'
import { Client, UpdateClient } from '@pawn-to-pawn/shared'

export const ClientModel = {

  async getAll(): Promise<Client[] | Error> {
    const sql = 'SELECT * FROM clients'
    const data: { clients: Client[] } = { clients: [] }

    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.all(sql, [], (err, rows) => {
        if (err) return reject(new QueryError('Could not get all clients'));

        (rows as Client[]).forEach((row: Client) => {
          data.clients.push({
            id: row.id,
            dni: row.dni,
            name: row.name,
            email: row.email,
            phone: row.phone
          })
        })
        const { clients } = data
        resolve(clients)
      })
    })
  },

  async getById(id: string): Promise<Client | Error> {
    const sql = 'SELECT * FROM clients WHERE id = ?'

    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.get(sql, id, (err, row) => {
        if (err) return reject(new QueryError('Could not get a client'))

        resolve(row as Client)
      })
    })
  },

  async getByDni(dni: string): Promise<Client | Error> {
    const sql = 'SELECT * FROM clients WHERE dni = ?'
    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.get(sql, dni, (err, row) => {
        if (err) return reject(new QueryError('Could not get a client'))
        resolve(row as Client)
      })
    })
  },

  async create(client: Client): Promise<string | Error> {
    const sql =
      'INSERT INTO clients(id, dni, name, email, phone) VALUES(?, ?, ?, ?, ?)'
    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.run(
        sql,
        [client.id, client.dni, client.name, client.email, client.phone],
        (err) => {
          if (err) {
            return reject(new QueryError('The client could not be created'))
          }
          resolve(client.id)
        }
      )
    })
  },

  async update(id: string, { name, email, phone }: UpdateClient): Promise<string | Error> {
    const sql = 'UPDATE clients SET name = ?, email = ?, phone = ? WHERE id = ?'
    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.run(sql, [name, email, phone, id], (err: Error) => {
        if (err) return reject(new QueryError('Client can not be updated'))
        resolve(id)
      })
    })
  },

  async delete(id: string): Promise<boolean | Error> {
    const sql = 'DELETE FROM clients WHERE id = ?'
    return new Promise((resolve, reject: (reason: Error) => void) => {
      DB.run(sql, [id], (err: Error) => {
        if (err) return reject(new QueryError('Client can not be deleted'))
        resolve(true)
      })
    })
  }
}
