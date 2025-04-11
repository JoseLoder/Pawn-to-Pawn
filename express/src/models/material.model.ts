import { DB } from "../database/connect";
import { QueryError } from "../errors/server.error";
import { Material } from "../types/materials.types";

export const MaterialModel = {
    async getById(id: string): Promise<Material> {
        const sql = 'SELECT * FROM materials WHERE id = ?'

        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.get(sql, id, (err, row) => {
                if (err) reject(new QueryError(`Could not get material by this id ${id}`))

                resolve(row as Material)
            })
        })
    }
}