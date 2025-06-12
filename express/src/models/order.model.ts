import { DB } from "../database/connect"
import { ClientError } from "../errors/client.error"
import { QueryError } from "../errors/server.error"
import { CreateOrder, Order, UpdateOrder } from "@pawn-to-pawn/shared"

export const OrderModel = {
    async getAll(): Promise<Order[]> {
        const sql = `SELECT * FROM orders`
        try {
            const result = await DB.query(sql)
            return result.rows
        } catch (error: unknown) {
            throw new QueryError('Could not get all orders')
        }
    },

    async getOrderPending(): Promise<Order[]> {
        const sql = `SELECT * FROM orders WHERE status = 'inHold'`
        try {
            const result = await DB.query(sql)
            return result.rows
        } catch (error: unknown) {
            throw new QueryError('Could not get all orders pending')
        }
    },

    async getByClient(idClient: string): Promise<Order[]> {
        const sql = `SELECT * FROM orders WHERE id_client = $1`
        try {
            const result = await DB.query(sql, [idClient])
            return result.rows
        } catch (error: unknown) {
            throw new QueryError(`Could not get all orders by this client: ${idClient}`)
        }
    },

    async getByOperator(idOperator: string | null): Promise<Order[]> {
        const sql = `SELECT * FROM orders WHERE id_operator = $1`
        try {
            const result = await DB.query(sql, [idOperator])
            return result.rows
        } catch (error: unknown) {
            throw new QueryError(`Could not get all orders by this operator: ${idOperator}`)
        }
    },

    async getById(idProduct: string): Promise<Order> {
        const sql = `SELECT * FROM orders WHERE id = $1`
        try {
            const result = await DB.query(sql, [idProduct])
            if (result.rows.length === 0) {
                throw new QueryError(`Order not found with id: ${idProduct}`)
            }
            return result.rows[0]
        } catch (error: unknown) {
            throw new QueryError(`Could not get order by this id: ${idProduct}`)
        }
    },

    async create(id: string, order: CreateOrder): Promise<string> {
        const sql = `
            INSERT INTO orders (id, id_client, id_product, quantity, price, status) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `
        try {
            await DB.query(sql, [
                id,
                order.id_client,
                order.id_product,
                order.quantity,
                order.price,
                order.status
            ])
            return id
        } catch (error: unknown) {
            throw new QueryError(`Could not create order by this id: ${id}`)
        }
    },

    async update(id: string, order: UpdateOrder): Promise<string> {
        const updates: string[] = []
        const values: any[] = []
        let paramCount = 1

        if (order.id_operator !== undefined) {
            updates.push(`id_operator = $${paramCount}`)
            values.push(order.id_operator)
            paramCount++
        }
        if (order.status !== undefined) {
            updates.push(`status = $${paramCount}`)
            values.push(order.status)
            paramCount++
        }

        if (updates.length === 0) {
            throw new ClientError('No fields to update')
        }
/*       if (order.processingAt !== null) {
            updates.push(`processing_at = $${paramCount}`)
            values.push(new Date(order.processingAt))
            paramCount++
        }
        if (order.completedAt !== null) {
            updates.push(`completed_at = $${paramCount}`)
            values.push(new Date(order.completedAt))
            paramCount++
        }
*/
        values.push(id)
        const sql = `
            UPDATE orders 
            SET ${updates.join(', ')} 
            WHERE id = $${paramCount}
        `

        try {
            const result = await DB.query(sql, values)
            if (result.rowCount === 0) {
                throw new QueryError(`Order not found with id: ${id}`)
            }
            return id
        } catch (error: unknown) {
            console.error("Error updating order:", error);
            throw new QueryError(`Could not update order by this id: ${id}`)
        }
    },

    async delete(id: string): Promise<boolean> {
        const sql = 'DELETE FROM orders WHERE id = $1'
        try {
            const result = await DB.query(sql, [id])
            if (result.rowCount === 0) {
                throw new QueryError(`Order not found with id: ${id}`)
            }
            return true
        } catch (error: unknown) {
            throw new QueryError(`Could not delete order by this id: ${id}`)
        }
    }
}   