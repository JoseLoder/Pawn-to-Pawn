import { DB } from '../database/connect';
import { QueryError } from '../errors/server.error';
import { CreateRefreshToken, RefreshToken } from '../types/tokens.types';

export const RefreshTokenModel = {
    // Crear un nuevo refresh token
    async create(token: CreateRefreshToken): Promise<RefreshToken | Error> {
        const sql = `
      INSERT INTO user_refresh_tokens (id, user_id, token, expires_at, revoked, device_info)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *`;

        return new Promise((resolve, reject) => {
            DB.get(
                sql,
                [token.id, token.user_id, token.token, token.expires_at, token.revoked ? 1 : 0, token.device_info],
                (err, row) => {
                    if (err) return reject(new QueryError('Could not create refresh token'));
                    resolve(row as RefreshToken);
                }
            );
        });
    },

    // Buscar por token (para validación)
    async getByToken(token: string): Promise<RefreshToken | Error> {
        const sql = `
      SELECT * FROM user_refresh_tokens
      WHERE token = ? AND revoked = 0 AND expires_at > datetime('now')`;

        return new Promise((resolve, reject) => {
            DB.get(sql, [token], (err, row) => {
                if (err) return reject(new QueryError('Could not fetch refresh token'));
                resolve(row as RefreshToken);
            });
        });
    },

    // Revocar un token (logout)
    async revoke(token: string): Promise<boolean | Error> {
        const sql = `
      UPDATE user_refresh_tokens
      SET revoked = 1
      WHERE token = ?`;

        return new Promise((resolve, reject) => {
            DB.run(sql, [token], function (err) {
                if (err) return reject(new QueryError('Could not revoke token'));
                resolve(this.changes > 0); // Devuelve true si se actualizó alguna fila
            });
        });
    },

    // Revocar todos los tokens de un usuario (logout all devices)
    async revokeAllForUser(user_id: string): Promise<boolean | Error> {
        const sql = `
      UPDATE user_refresh_tokens
      SET revoked = 1
      WHERE user_id = ? AND revoked = 0`;

        return new Promise((resolve, reject) => {
            DB.run(sql, [user_id], function (err) {
                if (err) return reject(new QueryError('Could not revoke tokens'));
                resolve(this.changes > 0);
            });
        });
    },

    // Limpieza de tokens expirados (para ejecutar periódicamente)
    async cleanupExpiredTokens(): Promise<number | Error> {
        const sql = `
      DELETE FROM user_refresh_tokens
      WHERE expires_at < datetime('now')`;

        return new Promise((resolve, reject) => {
            DB.run(sql, [], function (err) {
                if (err) return reject(new QueryError('Could not clean tokens'));
                resolve(this.changes); // Número de tokens eliminados
            });
        });
    },

    async showUsersToken(userId: string): Promise<RefreshToken[] | Error> {
        const sql = `
        SELECT * 
        FROM user_refresh_tokens 
        WHERE user_id = ? AND revoked = 1 
        `
        const data: { tokens: RefreshToken[] } = { tokens: [] }

        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.all(sql, [userId], (err, rows) => {
                if (err) return reject(new QueryError('Could not get all clients'));

                (rows as RefreshToken[]).forEach((row: RefreshToken) => {
                    data.tokens.push({
                        ...row
                    })
                })
                const { tokens } = data
                resolve(tokens)
            })
        })
    }
};