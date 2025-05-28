import { DB } from "../database/connect"
import { ClientError } from "../errors/client.error"
import { QueryError } from "../errors/server.error"
import { CreateMachine, Machine, UpdateMachine } from "@pawn-to-pawn/shared"

export const MachineModel = {
    async getAll(): Promise<Machine[]> {
        const sql = `SELECT * FROM machines`
        const data: { machines: Machine[] } = { machines: [] }

        return new Promise((resolve, reject: (reason: Error) => void) => {

            DB.all(sql, [], (err, rows) => {
                if (err) return reject(new QueryError('Could not get all machines'));

                (rows as Machine[]).forEach((row: Machine) => {
                    data.machines.push({
                        ...row
                    })
                })
                resolve(data.machines)
            })
        })
    },

    async getById(id: string): Promise<Machine> {
        const sql = `SELECT * FROM machines WHERE id = ?`

        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.get(sql, id, (err: Error, row: Machine) => {
                if (err) reject(new QueryError(`Could not get this machine by this id ${id}`))

                resolve(row)
            })
        })
    },

    async create(id: string, machine: CreateMachine): Promise<string> {
        const sql = `
            INSERT INTO machines (id, max_widht, max_weight, max_velocity, price)
            VALUES (?, ?, ?, ?, ?)
        `

        const params = [
            id,
            machine.max_widht,
            machine.max_weight,
            machine.max_velocity,
            machine.price
        ]
        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.run(sql, params, (err: Error) => {
                if (err) reject(new QueryError('Could not create machine'))

                resolve(id)
            })
        })
    },

    async update(id: string, machine: UpdateMachine): Promise<string> {
        const fields: string[] = []
        const values: unknown[] = []

        if (machine.max_velocity) {
            values.push(machine.max_velocity)
            fields.push('max_velocity = ?')
        }
        if (machine.max_weight) {
            values.push(machine.max_weight)
            fields.push('max_weight = ?')
        }
        if (machine.max_widht) {
            values.push(machine.max_widht)
            fields.push('max_widht = ?')
        }
        if (machine.price) {
            values.push(machine.price)
            fields.push('price = ?')
        }

        if (fields.length === 0) {
            return Promise.reject(new ClientError('There are no fields to modify'))
        }

        values.push(id)

        const sql = `
            UPDATE orders
            SET ${fields.join(', ')} 
            WHERE id = ?
        `
        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.run(sql, values, (err: Error) => {
                if (err) reject(new QueryError(`Could not update order by this id: ${id}`))

                resolve(id)
            })

        })
    },

    async delete(id: string): Promise<boolean> {
        const sql = 'DELETE FROM machines WHERE id = ?'
        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.run(sql, id, (err: Error) => {
                if (err) reject(new QueryError(`Could not delete machine by this id ${id}`))

                resolve(true)
            })
        })
    }
}
