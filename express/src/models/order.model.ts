import { DB } from "../database/connect"
import { ClientError } from "../errors/client.error"
import { QueryError } from "../errors/server.error"
import { CreateOrder, Order, UpdateOrder } from "../types/orders.type"

export const OrderModel = {
    async getAll(): Promise<Order[]> {
        const sql = `SELECT * FROM orders`
        const data: { orders: Order[] } = { orders: [] }

        return new Promise((resolve, reject: (reason: Error) => void) => {

            DB.all(sql, [], (err, rows) => {
                if (err) return reject(new QueryError('Could not get all orders'));

                (rows as Order[]).forEach((row: Order) => {
                    data.orders.push({
                        ...row
                    })
                })
                resolve(data.orders)
            })
        })
    },

    async getByClient(idClient: string): Promise<Order[]> {
        const sql = `SELECT * FROM orders WHERE id_client = ?`
        const data: { orders: Order[] } = { orders: [] }
        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.all(sql, idClient, (err: Error, rows: Order[]) => {
                if (err) reject(new QueryError(`Could not get all orders by this client: ${idClient}`));

                (rows as Order[]).forEach((row: Order) => {
                    data.orders.push({
                        ...row
                    })
                })
                resolve(data.orders)
            })
        })
    },

    async getByOperator(idOperator: string | null): Promise<Order[]> {
        const sql = `SELECT * FROM orders WHERE id_operator = ?`
        const data: { orders: Order[] } = { orders: [] }
        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.all(sql, idOperator, (err: Error, rows: Order[]) => {
                if (err) reject(new QueryError(`Could not get all orders by this operator: ${idOperator}`));

                (rows as Order[]).forEach((row: Order) => {
                    data.orders.push({
                        ...row
                    })
                })
                resolve(data.orders)
            })
        })
    },

    async getById(idProduct: string): Promise<Order | undefined> {
        const sql = `SELECT * FROM orders WHERE id = ?`

        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.get(sql, idProduct, (err: Error, row: Order) => {
                if (err) reject(new QueryError(`Could not get order by this id: ${idProduct}`))

                resolve(row)
            })
        })
    },

    async create(id: string, order: CreateOrder): Promise<string> {
        const sql = `
            INSERT INTO orders (id, id_client, id_product, quantity, price, status) 
            VALUES (?, ?, ?, ?, ?, ?)
        `

        const params = [id, order.id_client, order.id_product, order.quantity, order.price, order.status]
        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.get(sql, params, function (err: Error) {
                if (err) reject(new QueryError(`Could not create order by this id: ${id}`))

                resolve(id)
            })
        })
    },

    async update(id: string, order: UpdateOrder): Promise<string> {

        const fields: string[] = []
        const values: unknown[] = []

        if (order.id_operator) {
            fields.push('id_operator = ?')
            values.push(order.id_operator)
        }
        if (order.price) {
            fields.push('price = ?')
            values.push(order.price)
        }
        if (order.quantity) {
            fields.push('quantity = ?')
            values.push(order.quantity)
        }
        if (order.status) {
            fields.push('status = ?')
            values.push(order.status)
        }
        if (order.processingAt) {
            fields.push('processingAt = ?')
            values.push(order.processingAt)
        }
        if (order.completedAt) {
            fields.push('completedAt = ?')
            values.push(order.completedAt)
        }

        if (fields.length === 0) {
            return Promise.reject(new ClientError('There are no fields to modify'));
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
        const sql = 'DELETE FROM orders WHERE id = ?'
        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.run(sql, id, (err: Error) => {
                if (err) reject(new QueryError(`Could not delete order by this id ${id}`))

                resolve(true)
            })
        })
    }
}   