"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialModel = void 0;
const connect_1 = require("../database/connect");
const client_error_1 = require("../errors/client.error");
const server_error_1 = require("../errors/server.error");
exports.MaterialModel = {
    async getAll() {
        const sql = `SELECT * FROM materials`;
        try {
            const result = await connect_1.DB.query(sql);
            return result.rows;
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not get all materials');
        }
    },
    async getById(id) {
        const sql = 'SELECT * FROM materials WHERE id = $1';
        try {
            const result = await connect_1.DB.query(sql, [id]);
            if (result.rows.length === 0) {
                throw new server_error_1.QueryError(`Material not found with id: ${id}`);
            }
            return result.rows[0];
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not get material by this id ${id}`);
        }
    },
    async create(id, material) {
        const sql = `
            INSERT INTO materials (id, type, weight, price)
            VALUES ($1, $2, $3, $4)
        `;
        try {
            await connect_1.DB.query(sql, [
                id,
                material.type,
                material.weight,
                material.price
            ]);
            return id;
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not create material');
        }
    },
    async update(id, material) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        if (material.type !== undefined) {
            updates.push(`type = $${paramCount}`);
            values.push(material.type);
            paramCount++;
        }
        if (material.weight !== undefined) {
            updates.push(`weight = $${paramCount}`);
            values.push(material.weight);
            paramCount++;
        }
        if (material.price !== undefined) {
            updates.push(`price = $${paramCount}`);
            values.push(material.price);
            paramCount++;
        }
        if (updates.length === 0) {
            throw new client_error_1.ClientError('No fields to update');
        }
        values.push(id);
        const sql = `
            UPDATE materials 
            SET ${updates.join(', ')} 
            WHERE id = $${paramCount}
        `;
        try {
            const result = await connect_1.DB.query(sql, values);
            if (result.rowCount === 0) {
                throw new server_error_1.QueryError(`Material not found with id: ${id}`);
            }
            return id;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not update material by this id: ${id}`);
        }
    },
    async delete(id) {
        const sql = 'DELETE FROM materials WHERE id = $1';
        try {
            const result = await connect_1.DB.query(sql, [id]);
            if (result.rowCount === 0) {
                throw new server_error_1.QueryError(`Material not found with id: ${id}`);
            }
            return true;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not delete material by this id: ${id}`);
        }
    }
};
