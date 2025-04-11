import { DB } from "../database/connect"
import { QueryError } from "../errors/server.error"
import { Machine } from "../types/machines.types"

export const MachineModel = {
    async getById(id: string): Promise<Machine> {
        const sql = `SELECT * FROM machines WHERE id = ?`

        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.get(sql, id, (err, row) => {
                if (err) reject(new QueryError(`Could not get this machine by this id ${id}`))

                resolve(row as Machine)
            })
        })
    }
}