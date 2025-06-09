import { DB } from "../database/connect"
import { ClientError } from "../errors/client.error"
import { QueryError } from "../errors/server.error"
import { CreateMachine, Machine, UpdateMachine } from "@pawn-to-pawn/shared"

export const MachineModel = {
    async getAll(): Promise<Machine[]> {
        const sql = `SELECT * FROM machines`
        try {
            const result = await DB.query(sql)
            return result.rows
        } catch (error: unknown) {
            throw new QueryError('Could not get all machines')
        }
    },

    async getById(id: string): Promise<Machine> {
        const sql = `SELECT * FROM machines WHERE id = $1`
        try {
            const result = await DB.query(sql, [id])
            if (result.rows.length === 0) {
                throw new QueryError(`Machine not found with id: ${id}`)
            }
            return result.rows[0]
        } catch (error: unknown) {
            throw new QueryError(`Could not get this machine by this id ${id}`)
        }
    },

    async create(id: string, machine: CreateMachine): Promise<string> {
        const sql = `
            INSERT INTO machines (id, max_widht, max_weight, max_velocity, price)
            VALUES ($1, $2, $3, $4, $5)
        `
        try {
            await DB.query(sql, [
                id,
                machine.max_widht,
                machine.max_weight,
                machine.max_velocity,
                machine.price
            ])
            return id
        } catch (error: unknown) {
            throw new QueryError('Could not create machine')
        }
    },

    async update(id: string, machine: UpdateMachine): Promise<string> {
        const updates: string[] = []
        const values: any[] = []
        let paramCount = 1

        if (machine.max_widht !== undefined) {
            updates.push(`max_widht = $${paramCount}`)
            values.push(machine.max_widht)
            paramCount++
        }
        if (machine.max_weight !== undefined) {
            updates.push(`max_weight = $${paramCount}`)
            values.push(machine.max_weight)
            paramCount++
        }
        if (machine.max_velocity !== undefined) {
            updates.push(`max_velocity = $${paramCount}`)
            values.push(machine.max_velocity)
            paramCount++
        }
        if (machine.price !== undefined) {
            updates.push(`price = $${paramCount}`)
            values.push(machine.price)
            paramCount++
        }

        if (updates.length === 0) {
            throw new ClientError('No fields to update')
        }

        values.push(id)
        const sql = `
            UPDATE machines 
            SET ${updates.join(', ')} 
            WHERE id = $${paramCount}
        `

        try {
            const result = await DB.query(sql, values)
            if (result.rowCount === 0) {
                throw new QueryError(`Machine not found with id: ${id}`)
            }
            return id
        } catch (error: unknown) {
            throw new QueryError(`Could not update machine by this id: ${id}`)
        }
    },

    async delete(id: string): Promise<boolean> {
        const sql = 'DELETE FROM machines WHERE id = $1'
        try {
            const result = await DB.query(sql, [id])
            if (result.rowCount === 0) {
                throw new QueryError(`Machine not found with id: ${id}`)
            }
            return true
        } catch (error: unknown) {
            throw new QueryError(`Could not delete machine by this id: ${id}`)
        }
    }
}
