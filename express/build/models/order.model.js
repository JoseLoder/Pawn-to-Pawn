"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = void 0;
const connect_1 = require("../database/connect");
const client_error_1 = require("../errors/client.error");
const server_error_1 = require("../errors/server.error");
exports.OrderModel = {
    async getAll() {
        const sql = `SELECT * FROM orders`;
        try {
            const result = await connect_1.DB.query(sql);
            return result.rows;
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not get all orders');
        }
    },
    async getOrderPending() {
        const sql = `SELECT * FROM orders WHERE status = 'inHold'`;
        try {
            const result = await connect_1.DB.query(sql);
            return result.rows;
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not get all orders pending');
        }
    },
    async getByClient(idClient) {
        const sql = `SELECT * FROM orders WHERE id_client = $1`;
        try {
            const result = await connect_1.DB.query(sql, [idClient]);
            return result.rows;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not get all orders by this client: ${idClient}`);
        }
    },
    async getByOperator(idOperator) {
        const sql = `SELECT * FROM orders WHERE id_operator = $1`;
        try {
            const result = await connect_1.DB.query(sql, [idOperator]);
            return result.rows;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not get all orders by this operator: ${idOperator}`);
        }
    },
    async getById(idProduct) {
        const sql = `SELECT * FROM orders WHERE id = $1`;
        try {
            const result = await connect_1.DB.query(sql, [idProduct]);
            if (result.rows.length === 0) {
                throw new server_error_1.QueryError(`Order not found with id: ${idProduct}`);
            }
            return result.rows[0];
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not get order by this id: ${idProduct}`);
        }
    },
    async create(id, order) {
        const sql = `
            INSERT INTO orders (id, id_client, id_product, quantity, price, status) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        try {
            await connect_1.DB.query(sql, [
                id,
                order.id_client,
                order.id_product,
                order.quantity,
                order.price,
                order.status
            ]);
            return id;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not create order by this id: ${id}`);
        }
    },
    async update(id, order) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        if (order.id_operator !== undefined) {
            updates.push(`id_operator = $${paramCount}`);
            values.push(order.id_operator);
            paramCount++;
        }
        if (order.status !== undefined) {
            updates.push(`status = $${paramCount}`);
            values.push(order.status);
            paramCount++;
        }
        if (updates.length === 0) {
            throw new client_error_1.ClientError('No fields to update');
        }
        values.push(id);
        const sql = `
            UPDATE orders 
            SET ${updates.join(', ')} 
            WHERE id = $${paramCount}
        `;
        try {
            const result = await connect_1.DB.query(sql, values);
            if (result.rowCount === 0) {
                throw new server_error_1.QueryError(`Order not found with id: ${id}`);
            }
            return id;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not update order by this id: ${id}`);
        }
    },
    async delete(id) {
        const sql = 'DELETE FROM orders WHERE id = $1';
        try {
            const result = await connect_1.DB.query(sql, [id]);
            if (result.rowCount === 0) {
                throw new server_error_1.QueryError(`Order not found with id: ${id}`);
            }
            return true;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not delete order by this id: ${id}`);
        }
    }
};
