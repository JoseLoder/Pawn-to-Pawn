import { DB } from "../database/connect";
import { ClientError } from "../errors/client.error";
import { QueryError } from "../errors/server.error";
import { CreateMaterial, Material, UpdateMaterial } from "@pawn-to-pawn/shared";

export const MaterialModel = {
    async getAll(): Promise<Material[]> {
        const sql = `SELECT * FROM materials`
        try {
            const result = await DB.query(sql)
            return result.rows
        } catch (error: unknown) {
            throw new QueryError('Could not get all materials')
        }
    },

    async getById(id: string): Promise<Material> {
        const sql = 'SELECT * FROM materials WHERE id = $1'
        try {
            const result = await DB.query(sql, [id])
            if (result.rows.length === 0) {
                throw new QueryError(`Material not found with id: ${id}`)
            }
            return result.rows[0]
        } catch (error: unknown) {
            throw new QueryError(`Could not get material by this id ${id}`)
        }
    },

    async create(id: string, material: CreateMaterial): Promise<string> {
        const sql = `
            INSERT INTO materials (id, type, weight, price)
            VALUES ($1, $2, $3, $4)
        `
        try {
            await DB.query(sql, [
                id,
                material.type,
                material.weight,
                material.price
            ])
            return id
        } catch (error: unknown) {
            throw new QueryError('Could not create material')
        }
    },

    async update(id: string, material: UpdateMaterial): Promise<string> {
        const updates: string[] = []
        const values: any[] = []
        let paramCount = 1

        if (material.type !== undefined) {
            updates.push(`type = $${paramCount}`)
            values.push(material.type)
            paramCount++
        }
        if (material.weight !== undefined) {
            updates.push(`weight = $${paramCount}`)
            values.push(material.weight)
            paramCount++
        }
        if (material.price !== undefined) {
            updates.push(`price = $${paramCount}`)
            values.push(material.price)
            paramCount++
        }

        if (updates.length === 0) {
            throw new ClientError('No fields to update')
        }

        values.push(id)
        const sql = `
            UPDATE materials 
            SET ${updates.join(', ')} 
            WHERE id = $${paramCount}
        `

        try {
            const result = await DB.query(sql, values)
            if (result.rowCount === 0) {
                throw new QueryError(`Material not found with id: ${id}`)
            }
            return id
        } catch (error: unknown) {
            throw new QueryError(`Could not update material by this id: ${id}`)
        }
    },

    async delete(id: string): Promise<boolean> {
        const sql = 'DELETE FROM materials WHERE id = $1'
        try {
            const result = await DB.query(sql, [id])
            if (result.rowCount === 0) {
                throw new QueryError(`Material not found with id: ${id}`)
            }
            return true
        } catch (error: unknown) {
            throw new QueryError(`Could not delete material by this id: ${id}`)
        }
    }
}