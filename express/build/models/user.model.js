"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const connect_1 = require("../database/connect");
const server_error_1 = require("../errors/server.error");
exports.UserModel = {
    async getAll() {
        const sql = 'SELECT * FROM users';
        try {
            const result = await connect_1.DB.query(sql);
            return result.rows;
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not get all users');
        }
    },
    async getById(id) {
        const sql = 'SELECT * FROM users WHERE id = $1';
        try {
            const result = await connect_1.DB.query(sql, [id]);
            if (result.rows.length === 0) {
                throw new server_error_1.QueryError('User not found');
            }
            return result.rows[0];
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not get a user');
        }
    },
    async getByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = $1';
        try {
            const result = await connect_1.DB.query(sql, [email]);
            if (result.rows.length === 0) {
                throw new server_error_1.QueryError('User not found');
            }
            return result.rows[0];
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not get a user');
        }
    },
    async create(id, user) {
        const sql = `
      INSERT INTO users(id, id_number, name, phone, email, password, role)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    `;
        try {
            await connect_1.DB.query(sql, [
                id,
                user.id_number,
                user.name,
                user.phone,
                user.email,
                user.password,
                'client'
            ]);
            return id;
        }
        catch (error) {
            throw new server_error_1.QueryError('The user could not be created');
        }
    },
    async createOperator(id) {
        const sql = `
      UPDATE users 
      SET role = 'operator' 
      WHERE id = $1
    `;
        try {
            const result = await connect_1.DB.query(sql, [id]);
            if (!result.rowCount || result.rowCount === 0) {
                throw new server_error_1.QueryError(`No user found with id ${id}`);
            }
            return id;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not update role on id_user ${id}`);
        }
    },
    async delete(id) {
        const sql = 'DELETE FROM users WHERE id = $1';
        try {
            const result = await connect_1.DB.query(sql, [id]);
            return result.rowCount ? result.rowCount > 0 : false;
        }
        catch (error) {
            throw new server_error_1.QueryError('User can not be deleted');
        }
    }
};
