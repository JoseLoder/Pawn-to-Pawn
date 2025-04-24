import { DB } from "../database/connect";
import { ClientError } from "../errors/client.error";
import { QueryError } from "../errors/server.error";
import { CreateMaterial, Material, UpdateMaterial } from "../types/materials.types";

export const MaterialModel = {
    async getAll(): Promise<Material[]> {
        const sql = `SELECT * FROM orders`
        const data: { materials: Material[] } = { materials: [] }

        return new Promise((resolve, reject: (reason: Error) => void) => {

            DB.all(sql, [], (err, rows) => {
                if (err) return reject(new QueryError('Could not get all materials'));

                (rows as Material[]).forEach((row: Material) => {
                    data.materials.push({
                        ...row
                    })
                })
                resolve(data.materials)
            })
        })
    },
    async getById(id: string): Promise<Material> {
        const sql = 'SELECT * FROM materials WHERE id = ?'

        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.get(sql, id, (err, row) => {
                if (err) reject(new QueryError(`Could not get material by this id ${id}`))

                resolve(row as Material)
            })
        })
    },

    async create(id: string, material: CreateMaterial): Promise<string> {
        const sql = `
            INSERT INTO materials (id, type, weight, price)
            VALUES (?, ?, ?, ?)
        `

        const params = [
            id,
            material.type,
            material.weight,
            material.price
        ]
        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.run(sql, params, (err: Error) => {
                if (err) reject(new QueryError('Could not create material',))

                resolve(id)
            })
        })
    },

    async update(id: string, material: UpdateMaterial): Promise<string> {
        const fields: string[] = []
        const values: unknown[] = []

        if (material.type) {
            values.push(material.type)
            fields.push('type = ?')
        }
        if (material.weight) {
            values.push(material.weight)
            fields.push('weight = ?')
        }
        if (material.price) {
            values.push(material.price)
            fields.push('price = ?')
        }

        if (fields.length === 0) {
            return Promise.reject(new ClientError('There are no fields to modify'))
        }

        values.push(id)

        const sql = `
            UPDATE o
            SET ${fields.join(', ')} 
            WHERE id = ?
        `
        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.run(sql, values, (err: Error) => {
                if (err) reject(new QueryError(`Could not update material by this id: ${id}`))

                resolve(id)
            })

        })
    },

    async delete(id: string): Promise<boolean> {
        const sql = 'DELETE FROM material WHERE id = ?'
        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.run(sql, id, (err: Error) => {
                if (err) reject(new QueryError(`Could not delete material by this id ${id}`))

                resolve(true)
            })
        })
    }
}