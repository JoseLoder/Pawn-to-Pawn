"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachineModel = void 0;
const connect_1 = require("../database/connect");
const client_error_1 = require("../errors/client.error");
const server_error_1 = require("../errors/server.error");
exports.MachineModel = {
    async getAll() {
        const sql = `SELECT * FROM machines`;
        try {
            const result = await connect_1.DB.query(sql);
            return result.rows;
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not get all machines');
        }
    },
    async getById(id) {
        const sql = `SELECT * FROM machines WHERE id = $1`;
        try {
            const result = await connect_1.DB.query(sql, [id]);
            if (result.rows.length === 0) {
                throw new server_error_1.QueryError(`Machine not found with id: ${id}`);
            }
            return result.rows[0];
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not get this machine by this id ${id}`);
        }
    },
    async create(id, machine) {
        const sql = `
            INSERT INTO machines (id, name, max_widht, max_weight, max_velocity, price)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        try {
            await connect_1.DB.query(sql, [
                id,
                machine.name,
                machine.max_widht,
                machine.max_weight,
                machine.max_velocity,
                machine.price
            ]);
            return id;
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not create machine');
        }
    },
    async update(id, machine) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        if (machine.name !== undefined) {
            updates.push(`name = $${paramCount}`);
            values.push(machine.name);
            paramCount++;
        }
        if (machine.max_widht !== undefined) {
            updates.push(`max_widht = $${paramCount}`);
            values.push(machine.max_widht);
            paramCount++;
        }
        if (machine.max_weight !== undefined) {
            updates.push(`max_weight = $${paramCount}`);
            values.push(machine.max_weight);
            paramCount++;
        }
        if (machine.max_velocity !== undefined) {
            updates.push(`max_velocity = $${paramCount}`);
            values.push(machine.max_velocity);
            paramCount++;
        }
        if (machine.price !== undefined) {
            updates.push(`price = $${paramCount}`);
            values.push(machine.price);
            paramCount++;
        }
        if (updates.length === 0) {
            throw new client_error_1.ClientError('No fields to update');
        }
        values.push(id);
        const sql = `
            UPDATE machines 
            SET ${updates.join(', ')} 
            WHERE id = $${paramCount}
        `;
        try {
            const result = await connect_1.DB.query(sql, values);
            if (result.rowCount === 0) {
                throw new server_error_1.QueryError(`Machine not found with id: ${id}`);
            }
            return id;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not update machine by this id: ${id}`);
        }
    },
    async delete(id) {
        const sql = 'DELETE FROM machines WHERE id = $1';
        try {
            const result = await connect_1.DB.query(sql, [id]);
            if (result.rowCount === 0) {
                throw new server_error_1.QueryError(`Machine not found with id: ${id}`);
            }
            return true;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not delete machine by this id: ${id}`);
        }
    }
};
