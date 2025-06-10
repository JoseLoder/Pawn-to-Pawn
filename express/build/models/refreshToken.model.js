"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenModel = void 0;
const connect_1 = require("../database/connect");
const server_error_1 = require("../errors/server.error");
exports.RefreshTokenModel = {
    // Crear un nuevo refresh token
    async create(token) {
        const sql = `
            INSERT INTO user_refresh_tokens (id, id_user, token, expires_at, revoked, device_info)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        try {
            await connect_1.DB.query(sql, [
                token.id,
                token.id_user,
                token.token,
                token.expires_at,
                token.revoked ? 1 : 0,
                token.device_info
            ]);
            return token.token;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not create refresh token: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    },
    // Buscar por token (para validación)
    async getByToken(token) {
        const sql = `
            SELECT * FROM user_refresh_tokens
            WHERE token = $1 AND revoked = 0 AND expires_at > NOW()
        `;
        try {
            const result = await connect_1.DB.query(sql, [token]);
            if (result.rows.length === 0) {
                throw new server_error_1.QueryError('Refresh token not found or expired');
            }
            return result.rows[0];
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not fetch refresh token');
        }
    },
    // Revocar un token (logout)
    async revokeByUserId(userId) {
        const sql = `
            UPDATE user_refresh_tokens
            SET revoked = 1
            WHERE id_user = $1 AND revoked = 0
        `;
        try {
            await connect_1.DB.query(sql, [userId]);
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not revoke refresh tokens');
        }
    },
    // Revocar todos los tokens de un usuario (logout all devices)
    async revokeAllForUser(user_id) {
        const sql = `
            UPDATE user_refresh_tokens
            SET revoked = 1
            WHERE id_user = $1 AND revoked = 0
        `;
        try {
            const result = await connect_1.DB.query(sql, [user_id]);
            return result.rowCount ? result.rowCount > 0 : false;
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not revoke tokens');
        }
    },
    // Revocar todos los tokens del mismo dispositivo de un usuario (logout one devices)
    async revokeAllForUserDevice(id_user, headers) {
        const sql = `
            UPDATE user_refresh_tokens
            SET revoked = 1
            WHERE id_user = $1 AND revoked = 0 AND device_info = $2
        `;
        try {
            const result = await connect_1.DB.query(sql, [id_user, headers]);
            return result.rowCount ? result.rowCount > 0 : false;
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not revoke tokens');
        }
    },
    // Limpieza de tokens expirados (para ejecutar periódicamente)
    async deleteExpired() {
        const sql = `
            DELETE FROM user_refresh_tokens
            WHERE expires_at < NOW()
        `;
        try {
            await connect_1.DB.query(sql);
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not delete expired tokens');
        }
    },
    async getByUserId(userId) {
        const sql = `
            SELECT * FROM user_refresh_tokens
            WHERE id_user = $1 AND revoked = 0 AND expires_at > NOW()
        `;
        try {
            const result = await connect_1.DB.query(sql, [userId]);
            return result.rows;
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not fetch refresh tokens');
        }
    },
    async showUsersToken(userId) {
        const sql = `
            SELECT * 
            FROM user_refresh_tokens 
            WHERE id_user = $1 AND revoked = 1
        `;
        try {
            const result = await connect_1.DB.query(sql, [userId]);
            return result.rows;
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not get all clients');
        }
    },
    // Revocar un token específico
    async revoke(token) {
        const sql = `
            UPDATE user_refresh_tokens
            SET revoked = 1
            WHERE token = $1 AND revoked = 0
        `;
        try {
            await connect_1.DB.query(sql, [token]);
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not revoke refresh token: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
};
